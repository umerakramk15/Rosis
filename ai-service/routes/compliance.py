from flask import Blueprint, request, jsonify
from groq import Groq
import os
import json

compliance_bp = Blueprint("compliance", __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@compliance_bp.route("/compliance", methods=["POST"])
def compliance():
    try:
        data = request.get_json()
        merchant = data.get("merchant", {})
        products = merchant.get("products", [])
        recent_actions = merchant.get("recentActions", [])

        # Build product summary for prompt
        product_summary = ""
        for p in products[:5]:  # limit to 5 products
            product_summary += f"- {p.get('name', 'Unknown')}: {p.get('description', 'No description')[:100]}\n"

        prompt = f"""
You are a compliance auditor AI for an e-commerce platform.

Review these product listings:
{product_summary}

Check for: misleading descriptions, missing info, pricing violations, prohibited items.

Return ONLY valid JSON, no markdown:
{{
  "passed": ["list of things that are compliant"],
  "violations": ["list of violations found, empty array if none"],
  "summary": "one sentence overall summary"
}}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@compliance_bp.route("/generate-compliance-pdf", methods=["POST"])
def generate_compliance_pdf():
    """Generate PDF compliance report"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        import io
        
        data = request.get_json()
        
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#c9727a'), spaceAfter=30)
        heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#1e1018'), spaceAfter=12, spaceBefore=20)
        normal_style = ParagraphStyle('CustomNormal', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#4a4a4a'), spaceAfter=6)
        
        story = []
        
        # Title
        story.append(Paragraph("Compliance Audit Report", title_style))
        story.append(Paragraph(f"Generated: {data.get('generatedAt', 'N/A')}", normal_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # Summary Section
        summary = data.get('summary', {})
        story.append(Paragraph("Executive Summary", heading_style))
        
        score = summary.get('score', 0)
        score_color = '#22c55e' if score >= 80 else '#f59e0b' if score >= 60 else '#ef4444'
        
        story.append(Paragraph(f"<b>Compliance Score:</b> <font color='{score_color}'>{score}%</font>", normal_style))
        story.append(Paragraph(f"<b>Status:</b> {summary.get('status', 'N/A').upper()}", normal_style))
        story.append(Paragraph(f"<b>Total Checks:</b> {summary.get('totalChecks', 0)}", normal_style))
        story.append(Paragraph(f"<b>Violations:</b> {summary.get('violations', 0)}", normal_style))
        story.append(Paragraph(f"<b>Passed:</b> {summary.get('passed', 0)}", normal_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # Violations Table
        violations = data.get('violations', [])
        if violations:
            story.append(Paragraph(f"Violations ({len(violations)})", heading_style))
            
            violation_data = [['Rule', 'Action', 'Details', 'Detected']]
            for v in violations[:20]:
                violation_data.append([
                    v.get('rule', 'N/A')[:30],
                    v.get('action', 'N/A'),
                    (v.get('details', '') or '')[:50],
                    v.get('detected', 'N/A')[:16]
                ])
            
            violation_table = Table(violation_data, colWidths=[1.5*inch, 1*inch, 2*inch, 1.2*inch])
            violation_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#c9727a')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fdf5f5')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f0d5d8')),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(violation_table)
            story.append(Spacer(1, 0.2 * inch))
        
        # Passed Checks
        passed = data.get('passedChecks', [])
        if passed:
            story.append(Paragraph(f"Passed Checks ({len(passed)})", heading_style))
            for p in passed[:10]:
                story.append(Paragraph(f"✓ {p.get('rule', 'N/A')} — {p.get('summary', 'Compliant')[:80]}", normal_style))
            story.append(Spacer(1, 0.1 * inch))
        
        # Footer
        story.append(PageBreak())
        story.append(Paragraph("This report was generated automatically by the AI Compliance Assistant.", normal_style))
        story.append(Paragraph("For questions, contact your compliance officer.", normal_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name=f'compliance-report-{data.get("generatedAt", "now")[:10]}.pdf')
        
    except ImportError:
        # Fallback if reportlab not installed
        return jsonify({"error": "PDF generation not available. Install reportlab: pip install reportlab"}), 501
    except Exception as e:
        return jsonify({"error": str(e)}), 500

