import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { productAPI } from "../api/productAPI";
import { toast } from "react-toastify";

/* ═══════════ STYLES ═══════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Nunito:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --rose:#c9727a;--rose-lt:#e8a0a0;--rose-xs:#fde8e8;--rose-dk:#8b3a4a;
  --plum:#2d1a22;--ink:#1e1018;--cream:#faf7f4;--cream2:#fdf8f5;
  --gold:#c8a04a;--green:#16a34a;--green-lt:#dcfce7;
  --amber:#d97706;--amber-lt:#fef3c7;--red:#dc2626;--red-lt:#fee2e2;
  --border:#f0d5d8;--shadow:0 2px 16px rgba(140,40,60,.07);
}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:var(--rose-lt);border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes scaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes rowIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
`;

/* ═══════════ ICONS ═══════════ */
const IC = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  plus: "M12 4v16m8-8H4",
  minus: "M20 12H4",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  x: "M6 18L18 6M6 6l12 12",
  check: "M5 13l4 4L19 7",
  img: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11",
  chevL: "M15 19l-7-7 7-7",
  chevR: "M9 5l7 7-7 7",
  filter:
    "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  alert:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  upload:
    "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  close: "M6 18L18 6M6 6l12 12",
};
const Ic = ({ d, size = 16, sw = 2, c = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={c}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d={d} />
  </svg>
);

const CATEGORIES = [
  "All",
  "shirts",
  "shoes",
  "electronics",
  "bags",
  "watches",
  "pants",
  "jackets",
  "perfumes",
];
const RISK_MAP = {
  low: { bg: "#dcfce7", color: "#16a34a", label: "Low Risk" },
  medium: { bg: "#fef9c3", color: "#a16207", label: "Med Risk" },
  high: { bg: "#fee2e2", color: "#b91c1c", label: "High Risk" },
};

const Skeleton = ({ h = 60, r = 12 }) => (
  <div
    style={{
      height: h,
      borderRadius: r,
      background: "linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }}
  />
);

// ========== DYNAMIC ATTRIBUTE COMPONENTS ==========

// 1. CLOTHING ATTRIBUTES (Colors + Sizes)
function ClothingAttributes({
  colors,
  stocks,
  onAddColor,
  onRemoveColor,
  onUpdateColor,
  onStockChange,
}) {
  const [newColor, setNewColor] = useState({
    name: "",
    hex: "#c9727a",
    textDark: true,
  });
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleAddColor = () => {
    if (newColor.name.trim()) {
      onAddColor({ ...newColor, name: newColor.name.trim() });
      setNewColor({ name: "", hex: "#c9727a", textDark: true });
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".72rem",
          fontWeight: 800,
          color: "#9a7080",
          letterSpacing: ".04em",
          display: "block",
          marginBottom: 8,
        }}
      >
        Colors & Sizes
      </label>

      {/* Existing Colors */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}
      >
        {colors.map((color, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fdf8f8",
              padding: "6px 12px",
              borderRadius: 12,
              border: "1px solid #f0d5d8",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: color.hex,
                border: "1px solid #ddd",
              }}
            />
            <input
              value={color.name}
              onChange={(e) =>
                onUpdateColor(idx, { ...color, name: e.target.value })
              }
              style={{
                width: 100,
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid #f0d5d8",
                fontSize: ".75rem",
              }}
              placeholder="Color name"
            />
            <input
              type="color"
              value={color.hex}
              onChange={(e) =>
                onUpdateColor(idx, { ...color, hex: e.target.value })
              }
              style={{
                width: 36,
                height: 32,
                borderRadius: 8,
                border: "1px solid #f0d5d8",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => onRemoveColor(idx)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#dc2626",
              }}
            >
              <Ic d={IC.x} size={14} c="currentColor" sw={2} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Color */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <input
          value={newColor.name}
          onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
          placeholder="New color name"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1.5px solid #f0d5d8",
            fontSize: ".8rem",
            flex: 1,
            minWidth: 120,
          }}
        />
        <input
          type="color"
          value={newColor.hex}
          onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
          style={{
            width: 44,
            height: 40,
            borderRadius: 8,
            border: "1px solid #f0d5d8",
            cursor: "pointer",
          }}
        />
        <button
          onClick={handleAddColor}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: ".75rem",
            fontWeight: 700,
          }}
        >
          Add Color
        </button>
      </div>

      {/* Stock per Size */}
      <div>
        <label
          style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: ".72rem",
            fontWeight: 800,
            color: "#9a7080",
            letterSpacing: ".04em",
            display: "block",
            marginBottom: 8,
          }}
        >
          Stock per Size
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {sizeOptions.map((size) => (
            <div
              key={size}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{ fontSize: ".8rem", fontWeight: 700, color: "#1e1018" }}
              >
                {size}
              </span>
              <input
                type="number"
                value={stocks[size] || 0}
                onChange={(e) =>
                  onStockChange(size, parseInt(e.target.value) || 0)
                }
                min="0"
                style={{
                  width: 60,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1.5px solid #f0d5d8",
                  textAlign: "center",
                  fontSize: ".75rem",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. ELECTRONICS ATTRIBUTES (Storage + RAM + Color)
function ElectronicsAttributes({ attributes, onAttributeChange }) {
  const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const ramOptions = ["4GB", "6GB", "8GB", "12GB", "16GB"];
  const colorOptions = [
    { name: "Black", hex: "#000000", textDark: false },
    { name: "White", hex: "#FFFFFF", textDark: true },
    { name: "Silver", hex: "#C0C0C0", textDark: true },
    { name: "Gold", hex: "#FFD700", textDark: false },
    { name: "Midnight Blue", hex: "#191970", textDark: false },
  ];

  const updateAttribute = (attrName, value) => {
    onAttributeChange({ ...attributes, [attrName]: value });
  };

  const updateColor = (color) => {
    updateAttribute("color", color);
  };

  const getColorHex = (colorName) => {
    const found = colorOptions.find((c) => c.name === colorName);
    return found?.hex || "#c9727a";
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".72rem",
          fontWeight: 800,
          color: "#9a7080",
          letterSpacing: ".04em",
          display: "block",
          marginBottom: 8,
        }}
      >
        Product Specifications
      </label>

      {/* Storage */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Storage
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {storageOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => updateAttribute("storage", opt)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.storage === opt ? "#c9727a" : "#f0d5d8"}`,
                background: attributes.storage === opt ? "#c9727a" : "white",
                color: attributes.storage === opt ? "white" : "#6b4d5a",
                cursor: "pointer",
                fontSize: ".75rem",
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          RAM
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ramOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => updateAttribute("ram", opt)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.ram === opt ? "#c9727a" : "#f0d5d8"}`,
                background: attributes.ram === opt ? "#c9727a" : "white",
                color: attributes.ram === opt ? "white" : "#6b4d5a",
                cursor: "pointer",
                fontSize: ".75rem",
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Color
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {colorOptions.map((color) => (
            <button
              key={color.name}
              onClick={() => updateColor(color.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.color === color.name ? "#c9727a" : "#f0d5d8"}`,
                background:
                  attributes.color === color.name ? "#c9727a" : "white",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: color.hex,
                  border: "1px solid #ddd",
                }}
              />
              <span
                style={{
                  fontSize: ".75rem",
                  color: attributes.color === color.name ? "white" : "#1e1018",
                }}
              >
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. FURNITURE ATTRIBUTES (Material + Color + Dimensions)
function FurnitureAttributes({ attributes, onAttributeChange }) {
  const materialOptions = [
    "Solid Wood",
    "Plywood",
    "Metal",
    "Glass",
    "Plastic",
  ];
  const colorOptions = [
    { name: "Oak", hex: "#8B5A2B" },
    { name: "Walnut", hex: "#5C4033" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Black", hex: "#000000" },
    { name: "Gray", hex: "#808080" },
  ];

  const updateAttribute = (attrName, value) => {
    onAttributeChange({ ...attributes, [attrName]: value });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".72rem",
          fontWeight: 800,
          color: "#9a7080",
          letterSpacing: ".04em",
          display: "block",
          marginBottom: 8,
        }}
      >
        Product Specifications
      </label>

      {/* Material */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Material
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {materialOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => updateAttribute("material", opt)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.material === opt ? "#c9727a" : "#f0d5d8"}`,
                background: attributes.material === opt ? "#c9727a" : "white",
                color: attributes.material === opt ? "white" : "#6b4d5a",
                cursor: "pointer",
                fontSize: ".75rem",
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Color
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {colorOptions.map((color) => (
            <button
              key={color.name}
              onClick={() => updateAttribute("color", color.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.color === color.name ? "#c9727a" : "#f0d5d8"}`,
                background:
                  attributes.color === color.name ? "#c9727a" : "white",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: color.hex,
                  border: "1px solid #ddd",
                }}
              />
              <span
                style={{
                  fontSize: ".75rem",
                  color: attributes.color === color.name ? "white" : "#1e1018",
                }}
              >
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Dimensions (cm)
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="Width"
            value={attributes.width || ""}
            onChange={(e) => updateAttribute("width", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1.5px solid #f0d5d8",
              fontSize: ".75rem",
            }}
          />
          <input
            type="text"
            placeholder="Depth"
            value={attributes.depth || ""}
            onChange={(e) => updateAttribute("depth", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1.5px solid #f0d5d8",
              fontSize: ".75rem",
            }}
          />
          <input
            type="text"
            placeholder="Height"
            value={attributes.height || ""}
            onChange={(e) => updateAttribute("height", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1.5px solid #f0d5d8",
              fontSize: ".75rem",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// 4. BOOKS ATTRIBUTES (Format + Language)
function BooksAttributes({ attributes, onAttributeChange }) {
  const formatOptions = ["Hardcover", "Paperback", "eBook", "Audiobook"];
  const languageOptions = ["English", "Urdu", "Arabic", "French", "Spanish"];

  const updateAttribute = (attrName, value) => {
    onAttributeChange({ ...attributes, [attrName]: value });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".72rem",
          fontWeight: 800,
          color: "#9a7080",
          letterSpacing: ".04em",
          display: "block",
          marginBottom: 8,
        }}
      >
        Book Specifications
      </label>

      {/* Format */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Format
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {formatOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => updateAttribute("format", opt)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.format === opt ? "#c9727a" : "#f0d5d8"}`,
                background: attributes.format === opt ? "#c9727a" : "white",
                color: attributes.format === opt ? "white" : "#6b4d5a",
                cursor: "pointer",
                fontSize: ".75rem",
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label
          style={{
            fontSize: ".75rem",
            fontWeight: 600,
            color: "#6b4d5a",
            display: "block",
            marginBottom: 6,
          }}
        >
          Language
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {languageOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => updateAttribute("language", opt)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${attributes.language === opt ? "#c9727a" : "#f0d5d8"}`,
                background: attributes.language === opt ? "#c9727a" : "white",
                color: attributes.language === opt ? "white" : "#6b4d5a",
                cursor: "pointer",
                fontSize: ".75rem",
                fontWeight: 600,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. SHOES ATTRIBUTES (Colors + Sizes)
function ShoesAttributes({
  colors,
  stocks,
  onAddColor,
  onRemoveColor,
  onUpdateColor,
  onStockChange,
}) {
  const [newColor, setNewColor] = useState({
    name: "",
    hex: "#c9727a",
    textDark: true,
  });
  const sizeOptions = ["5", "6", "7", "8", "9", "10", "11", "12"];

  const handleAddColor = () => {
    if (newColor.name.trim()) {
      onAddColor({ ...newColor, name: newColor.name.trim() });
      setNewColor({ name: "", hex: "#c9727a", textDark: true });
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          fontFamily: "'Nunito',sans-serif",
          fontSize: ".72rem",
          fontWeight: 800,
          color: "#9a7080",
          letterSpacing: ".04em",
          display: "block",
          marginBottom: 8,
        }}
      >
        Colors & Sizes (US)
      </label>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}
      >
        {colors.map((color, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fdf8f8",
              padding: "6px 12px",
              borderRadius: 12,
              border: "1px solid #f0d5d8",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: color.hex,
                border: "1px solid #ddd",
              }}
            />
            <input
              value={color.name}
              onChange={(e) =>
                onUpdateColor(idx, { ...color, name: e.target.value })
              }
              style={{
                width: 100,
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid #f0d5d8",
                fontSize: ".75rem",
              }}
            />
            <input
              type="color"
              value={color.hex}
              onChange={(e) =>
                onUpdateColor(idx, { ...color, hex: e.target.value })
              }
              style={{
                width: 36,
                height: 32,
                borderRadius: 8,
                border: "1px solid #f0d5d8",
                cursor: "pointer",
              }}
            />
            <button onClick={() => onRemoveColor(idx)}>
              <Ic d={IC.x} size={14} c="currentColor" sw={2} />
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <input
          value={newColor.name}
          onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
          placeholder="New color"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1.5px solid #f0d5d8",
            fontSize: ".8rem",
            flex: 1,
            minWidth: 120,
          }}
        />
        <input
          type="color"
          value={newColor.hex}
          onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
          style={{
            width: 44,
            height: 40,
            borderRadius: 8,
            border: "1px solid #f0d5d8",
            cursor: "pointer",
          }}
        />
        <button
          onClick={handleAddColor}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
            color: "white",
            cursor: "pointer",
            fontSize: ".75rem",
            fontWeight: 700,
          }}
        >
          Add Color
        </button>
      </div>

      <div>
        <label
          style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: ".72rem",
            fontWeight: 800,
            color: "#9a7080",
            letterSpacing: ".04em",
            display: "block",
            marginBottom: 8,
          }}
        >
          Stock per Size
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {sizeOptions.map((size) => (
            <div
              key={size}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{ fontSize: ".8rem", fontWeight: 700, color: "#1e1018" }}
              >
                {size}
              </span>
              <input
                type="number"
                value={stocks[size] || 0}
                onChange={(e) =>
                  onStockChange(size, parseInt(e.target.value) || 0)
                }
                min="0"
                style={{
                  width: 60,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1.5px solid #f0d5d8",
                  textAlign: "center",
                  fontSize: ".75rem",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== MAIN PRODUCT MODAL WITH DYNAMIC ATTRIBUTES ==========
function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "shirts",
    price: product?.price || "",
    stock: product?.stock || "",
    description: product?.description || "",
    brand: product?.brand || "",
  });

  // Category-specific attributes
  const [clothingColors, setClothingColors] = useState(() => {
    if (product?.availableAttributes?.color) {
      return product.availableAttributes.color.map((c) =>
        typeof c === "string" ? { name: c, hex: "#c9727a", textDark: true } : c,
      );
    }
    return [];
  });
  const [clothingStocks, setClothingStocks] = useState(() => {
    const defaultStocks = { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
    if (product?.variants) {
      product.variants.forEach((v) => {
        const sizeAttr = v.attributes?.find((a) => a.name === "size");
        if (sizeAttr) defaultStocks[sizeAttr.value] = v.stock;
      });
    }
    return defaultStocks;
  });

  const [electronicsAttrs, setElectronicsAttrs] = useState({
    storage: product?.availableAttributes?.storage || "",
    ram: product?.availableAttributes?.ram || "",
    color: product?.availableAttributes?.color || "",
  });

  const [furnitureAttrs, setFurnitureAttrs] = useState({
    material: product?.availableAttributes?.material || "",
    color: product?.availableAttributes?.color || "",
    width: "",
    depth: "",
    height: "",
  });

  const [booksAttrs, setBooksAttrs] = useState({
    format: product?.availableAttributes?.format || "",
    language: product?.availableAttributes?.language || "",
  });

  const [shoesColors, setShoesColors] = useState(() => {
    if (product?.availableAttributes?.color) {
      return product.availableAttributes.color.map((c) =>
        typeof c === "string" ? { name: c, hex: "#c9727a", textDark: true } : c,
      );
    }
    return [];
  });
  const [shoesStocks, setShoesStocks] = useState(() => {
    const defaultStocks = { 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    if (product?.variants) {
      product.variants.forEach((v) => {
        const sizeAttr = v.attributes?.find((a) => a.name === "size");
        if (sizeAttr) defaultStocks[sizeAttr.value] = v.stock;
      });
    }
    return defaultStocks;
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    product?.images?.[0]?.url || "",
  );
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClothingAddColor = (color) =>
    setClothingColors([...clothingColors, color]);
  const handleClothingRemoveColor = (idx) =>
    setClothingColors(clothingColors.filter((_, i) => i !== idx));
  const handleClothingUpdateColor = (idx, newColor) =>
    setClothingColors(clothingColors.map((c, i) => (i === idx ? newColor : c)));
  const handleClothingStockChange = (size, stock) =>
    setClothingStocks((prev) => ({ ...prev, [size]: stock }));

  const handleShoesAddColor = (color) =>
    setShoesColors([...shoesColors, color]);
  const handleShoesRemoveColor = (idx) =>
    setShoesColors(shoesColors.filter((_, i) => i !== idx));
  const handleShoesUpdateColor = (idx, newColor) =>
    setShoesColors(shoesColors.map((c, i) => (i === idx ? newColor : c)));
  const handleShoesStockChange = (size, stock) =>
    setShoesStocks((prev) => ({ ...prev, [size]: stock }));

  const renderDynamicAttributes = () => {
    switch (form.category) {
      case "shirts":
      case "pants":
      case "jackets":
        return (
          <ClothingAttributes
            colors={clothingColors}
            stocks={clothingStocks}
            onAddColor={handleClothingAddColor}
            onRemoveColor={handleClothingRemoveColor}
            onUpdateColor={handleClothingUpdateColor}
            onStockChange={handleClothingStockChange}
          />
        );
      case "shoes":
        return (
          <ShoesAttributes
            colors={shoesColors}
            stocks={shoesStocks}
            onAddColor={handleShoesAddColor}
            onRemoveColor={handleShoesRemoveColor}
            onUpdateColor={handleShoesUpdateColor}
            onStockChange={handleShoesStockChange}
          />
        );
      case "electronics":
        return (
          <ElectronicsAttributes
            attributes={electronicsAttrs}
            onAttributeChange={setElectronicsAttrs}
          />
        );
      case "furniture":
        return (
          <FurnitureAttributes
            attributes={furnitureAttrs}
            onAttributeChange={setFurnitureAttrs}
          />
        );
      case "books":
        return (
          <BooksAttributes
            attributes={booksAttrs}
            onAttributeChange={setBooksAttrs}
          />
        );
      default:
        return null;
    }
  };

  const buildAvailableAttributes = () => {
    switch (form.category) {
      case "shirts":
      case "pants":
      case "jackets":
        if (clothingColors.length > 0) {
          return {
            color: clothingColors.map((c) => c.name),
            size: Object.keys(clothingStocks),
          };
        }
        return {};
      case "shoes":
        if (shoesColors.length > 0) {
          return {
            color: shoesColors.map((c) => c.name),
            size: Object.keys(shoesStocks),
          };
        }
        return {};
      case "electronics":
        const attrs = {};
        if (electronicsAttrs.storage)
          attrs.storage = [electronicsAttrs.storage];
        if (electronicsAttrs.ram) attrs.ram = [electronicsAttrs.ram];
        if (electronicsAttrs.color) attrs.color = [electronicsAttrs.color];
        return attrs;
      case "furniture":
        const furnAttrs = {};
        if (furnitureAttrs.material)
          furnAttrs.material = [furnitureAttrs.material];
        if (furnitureAttrs.color) furnAttrs.color = [furnitureAttrs.color];
        return furnAttrs;
      case "books":
        const bookAttrs = {};
        if (booksAttrs.format) bookAttrs.format = [booksAttrs.format];
        if (booksAttrs.language) bookAttrs.language = [booksAttrs.language];
        return bookAttrs;
      default:
        return {};
    }
  };

  const buildVariants = () => {
    const variants = [];

    switch (form.category) {
      case "shirts":
      case "pants":
      case "jackets":
        clothingColors.forEach((color) => {
          Object.keys(clothingStocks).forEach((size) => {
            const stock = clothingStocks[size] || 0;
            variants.push({
              sku: `${form.name.replace(/\s/g, "-")}-${size}-${color.name.replace(/\s/g, "")}`,
              attributes: [
                {
                  name: "color",
                  label: "Colour",
                  value: color.name,
                  hex: color.hex,
                  textDark: color.textDark,
                },
                { name: "size", label: "Size", value: size },
              ],
              stock: stock,
              price: null,
            });
          });
        });
        break;
      case "shoes":
        shoesColors.forEach((color) => {
          Object.keys(shoesStocks).forEach((size) => {
            const stock = shoesStocks[size] || 0;
            variants.push({
              sku: `${form.name.replace(/\s/g, "-")}-${size}-${color.name.replace(/\s/g, "")}`,
              attributes: [
                {
                  name: "color",
                  label: "Colour",
                  value: color.name,
                  hex: color.hex,
                  textDark: color.textDark,
                },
                { name: "size", label: "Size (US)", value: size },
              ],
              stock: stock,
              price: null,
            });
          });
        });
        break;
      case "electronics":
        if (
          electronicsAttrs.storage &&
          electronicsAttrs.ram &&
          electronicsAttrs.color
        ) {
          variants.push({
            sku: `${form.name.replace(/\s/g, "-")}-${electronicsAttrs.storage}-${electronicsAttrs.ram}-${electronicsAttrs.color}`,
            attributes: [
              {
                name: "storage",
                label: "Storage",
                value: electronicsAttrs.storage,
              },
              { name: "ram", label: "RAM", value: electronicsAttrs.ram },
              { name: "color", label: "Colour", value: electronicsAttrs.color },
            ],
            stock: form.stock || 0,
            price: null,
          });
        }
        break;
    }

    return variants;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price and category are required");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("category", form.category);
      data.append("price", form.price);
      data.append("description", form.description || "");
      data.append("brand", form.brand || "");
      data.append("stock", form.stock || 0);
      if (imageFile) data.append("images", imageFile);

      const availableAttributes = buildAvailableAttributes();
      if (Object.keys(availableAttributes).length > 0) {
        data.append("availableAttributes", JSON.stringify(availableAttributes));
      }

      const variants = buildVariants();
      if (variants.length > 0) {
        data.append("variants", JSON.stringify(variants));
      }

      if (product) {
        await productAPI.update(product._id, data);
        toast.success("Product updated!");
      } else {
        await productAPI.create(data);
        toast.success("Product created!");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,10,18,.5)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "scaleIn .3s ease",
          boxShadow: "0 20px 60px rgba(140,40,60,.2)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid #f0d5d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 10,
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#1e1018",
            }}
          >
            {product ? "Edit Product" : "Add New Product"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#fde8e8",
              border: "none",
              borderRadius: 10,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Ic d={IC.close} size={15} c="#c9727a" sw={2.5} />
          </button>
        </div>

        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Image Upload */}
          <div>
            <label
              style={{
                fontFamily: "'Nunito',sans-serif",
                fontSize: ".72rem",
                fontWeight: 800,
                color: "#9a7080",
                letterSpacing: ".04em",
                display: "block",
                marginBottom: 8,
              }}
            >
              PRODUCT IMAGE
            </label>
            <div
              style={{
                position: "relative",
                height: 160,
                borderRadius: 16,
                border: "2px dashed #f0d5d8",
                background: "#fdf8f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() =>
                document.getElementById("productImageInput").click()
              }
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Ic d={IC.upload} size={32} c="#e8a0a0" sw={1.5} />
                  <p
                    style={{
                      fontFamily: "'Nunito',sans-serif",
                      fontSize: ".78rem",
                      color: "#b09090",
                      marginTop: 8,
                    }}
                  >
                    Click to upload image
                  </p>
                </div>
              )}
              <input
                id="productImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Basic Fields */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "#9a7080",
                }}
              >
                PRODUCT NAME *
              </label>
              <input
                value={form.name}
                onChange={(e) => upd("name", e.target.value)}
                placeholder="e.g. iPhone 15 Pro"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #f0d5d8",
                  borderRadius: 12,
                  fontSize: ".83rem",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "#9a7080",
                }}
              >
                CATEGORY *
              </label>
              <select
                value={form.category}
                onChange={(e) => upd("category", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #f0d5d8",
                  borderRadius: 12,
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "#9a7080",
                }}
              >
                BRAND
              </label>
              <input
                value={form.brand}
                onChange={(e) => upd("brand", e.target.value)}
                placeholder="e.g. Apple"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #f0d5d8",
                  borderRadius: 12,
                  fontSize: ".83rem",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{ fontSize: ".72rem", fontWeight: 800, color: "#9a7080" }}
            >
              DESCRIPTION
            </label>
            <textarea
              value={form.description}
              onChange={(e) => upd("description", e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #f0d5d8",
                borderRadius: 12,
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label
                style={{
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "#9a7080",
                }}
              >
                BASE PRICE (Rs.) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => upd("price", e.target.value)}
                placeholder="e.g. 1500"
                min="0"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #f0d5d8",
                  borderRadius: 12,
                }}
              />
            </div>
          </div>

          {/* Dynamic Attributes Based on Category */}
          {renderDynamicAttributes()}

          {/* AI Note */}
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 14px",
              background: "linear-gradient(135deg,#fde8e8,#fff0f5)",
              border: "1.5px solid #f5c8cc",
              borderRadius: 14,
            }}
          >
            <Ic d={IC.alert} size={16} c="#c9727a" sw={2} />
            <p
              style={{ fontSize: ".75rem", color: "#8b3a4a", lineHeight: 1.6 }}
            >
              After saving, AI will automatically calculate the{" "}
              <strong>Return Risk</strong> for this product.
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              paddingTop: 4,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "11px 22px",
                borderRadius: 14,
                border: "1.5px solid #f0d5d8",
                background: "white",
                color: "#9a7080",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: "11px 24px",
                borderRadius: 14,
                border: "none",
                background: saving
                  ? "#e8b0b8"
                  : "linear-gradient(135deg,#c9727a,#e8a0a0)",
                color: "white",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 5px 18px rgba(180,80,80,.25)",
              }}
            >
              {saving ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,.3)",
                      borderTopColor: "white",
                      animation: "spin .7s linear infinite",
                    }}
                  />{" "}
                  Saving…
                </>
              ) : (
                <>
                  <Ic d={IC.check} size={15} c="white" sw={2.5} />{" "}
                  {product ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== DELETE CONFIRM MODAL ==========
function DeleteModal({ product, onClose, onConfirm, deleting }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,10,18,.5)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 400,
          padding: "28px 28px 24px",
          animation: "scaleIn .3s ease",
          boxShadow: "0 20px 60px rgba(140,40,60,.2)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ic d={IC.trash} size={22} c="#dc2626" sw={2} />
        </div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#1e1018",
            marginBottom: 8,
          }}
        >
          Delete Product?
        </h3>
        <p
          style={{
            fontSize: ".82rem",
            color: "#9a7080",
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          Are you sure you want to delete <strong>{product?.name}</strong>? This
          action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              border: "1.5px solid #f0d5d8",
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              border: "none",
              background: "#dc2626",
              color: "white",
              fontWeight: 800,
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {deleting ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,.3)",
                  borderTopColor: "white",
                  animation: "spin .7s linear infinite",
                }}
              />
            ) : (
              <Ic d={IC.trash} size={14} c="white" sw={2} />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function ProductManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [editProduct, setEditProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 15;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "merchant") {
      navigate("/customer/dashboard");
      return;
    }
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(search && { search }),
        ...(category !== "All" && { category }),
        sortBy,
        order: "desc",
      };
      const res = await productAPI.getMyProducts(params);
      setProducts(res.data.data.products || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.pages || 1);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, category, sortBy]);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await productAPI.delete(deleteProduct._id);
      toast.success("Product deleted");
      setDeleteProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = () => {
    setShowAdd(false);
    setEditProduct(null);
    fetchProducts();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f4" }}>
      <style>{STYLES}</style>

      {/* HEADER */}
      <div
        style={{
          background: "white",
          borderBottom: "1.5px solid #f0d5d8",
          padding: "16px clamp(16px,4vw,32px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(140,40,60,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/merchant/dashboard")}
            style={{
              background: "#fde8e8",
              border: "none",
              borderRadius: 10,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Ic d={IC.chevL} size={16} c="#c9727a" sw={2.5} />
          </button>
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 700,
                fontSize: "clamp(1.2rem,3vw,1.6rem)",
                color: "#1e1018",
              }}
            >
              Product Management
            </h1>
            <p style={{ fontSize: ".72rem", color: "#9a7080" }}>
              {total} products total
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg,#c9727a,#e8a0a0)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 5px 18px rgba(180,80,80,.25)",
          }}
        >
          <Ic d={IC.plus} size={16} c="white" sw={2.5} /> Add Product
        </button>
      </div>

      {/* FILTERS */}
      <div
        style={{
          padding: "16px clamp(16px,4vw,32px)",
          background: "white",
          borderBottom: "1.5px solid #f0d5d8",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <Ic d={IC.search} size={15} c="#c9727a" sw={2} />
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            style={{
              width: "100%",
              padding: "9px 14px 9px 36px",
              borderRadius: 12,
              border: "1.5px solid #f0d5d8",
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1.5px solid ${category === c ? "#c9727a" : "#f0d5d8"}`,
                background:
                  category === c
                    ? "linear-gradient(135deg,#c9727a,#e8a0a0)"
                    : "white",
                color: category === c ? "white" : "#9a7080",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 12,
            border: "1.5px solid #f0d5d8",
            background: "white",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="createdAt">Newest First</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
          <option value="ratings.average">Rating</option>
        </select>
        {(search || category !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
              setPage(1);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1.5px solid #fca5a5",
              background: "#fee2e2",
              color: "#dc2626",
              cursor: "pointer",
            }}
          >
            <Ic d={IC.x} size={11} sw={3} c="#dc2626" /> Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div style={{ padding: "20px clamp(16px,4vw,32px)" }}>
        <div
          style={{
            background: "white",
            borderRadius: 22,
            border: "1.5px solid #f0d5d8",
            boxShadow: "0 2px 16px rgba(140,40,60,.07)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 800,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fdf8f8",
                    borderBottom: "1.5px solid #f0d5d8",
                  }}
                >
                  {[
                    "Product",
                    "Category",
                    "Price (Rs.)",
                    "Stock",
                    "Rating",
                    "Return Risk",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: ".66rem",
                        fontWeight: 900,
                        color: "#b09090",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24 }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} h={52} r={10} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: "60px 20px", textAlign: "center" }}
                    >
                      <Ic d={IC.box} size={40} c="#e8c0c8" sw={1.2} />
                      <p
                        style={{
                          fontSize: "1.2rem",
                          color: "#c9727a",
                          marginTop: 12,
                        }}
                      >
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => {
                    const risk = RISK_MAP[p.returnRisk?.level] || RISK_MAP.low;
                    const inStock = p.stock > 0;
                    const hasVariants = p.variants && p.variants.length > 0;
                    return (
                      <tr
                        key={p._id}
                        style={{ borderBottom: "1px solid #faf0f2" }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 46,
                                height: 52,
                                borderRadius: 12,
                                overflow: "hidden",
                                background: "#fdf5f5",
                                border: "1px solid #f0d5d8",
                              }}
                            >
                              {p.images?.[0]?.url ? (
                                <img
                                  src={p.images[0].url}
                                  alt={p.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Ic d={IC.img} size={18} c="#e8a0a0" sw={1.5} />
                              )}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: "#1e1018" }}>
                                {p.name}
                              </p>
                              {hasVariants && (
                                <p
                                  style={{
                                    fontSize: ".65rem",
                                    color: "#c9727a",
                                  }}
                                >
                                  ✓ Has variants
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ textTransform: "capitalize" }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontWeight: 700, color: "#c9727a" }}>
                            Rs. {p.price?.toLocaleString()}
                          </span>
                          {p.suggestedPrice && p.suggestedPrice !== p.price && (
                            <p style={{ fontSize: ".65rem", color: "#22c55e" }}>
                              AI: Rs. {p.suggestedPrice?.toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontWeight: 800,
                              color: !inStock
                                ? "#dc2626"
                                : p.stock < 10
                                  ? "#d97706"
                                  : "#16a34a",
                            }}
                          >
                            {!inStock ? "Out of Stock" : p.stock}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span>⭐</span>
                            <span>{p.ratings?.average?.toFixed(1) || "—"}</span>
                            <span>({p.ratings?.count || 0})</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              background: risk.bg,
                              color: risk.color,
                              padding: "3px 10px",
                              borderRadius: 999,
                            }}
                          >
                            {risk.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => setEditProduct(p)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 10,
                                border: "1.5px solid #f0d5d8",
                                background: "white",
                                color: "#c9727a",
                                cursor: "pointer",
                              }}
                            >
                              <Ic
                                d={IC.edit}
                                size={12}
                                c="currentColor"
                                sw={2}
                              />{" "}
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteProduct(p)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 10,
                                border: "1.5px solid #fca5a5",
                                background: "#fee2e2",
                                color: "#dc2626",
                                cursor: "pointer",
                              }}
                            >
                              <Ic
                                d={IC.trash}
                                size={12}
                                c="currentColor"
                                sw={2}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #f0d5d8",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <p>
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}{" "}
                of {total}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                  )
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      style={{
                        background: page === n ? "#c9727a" : "white",
                        color: page === n ? "white" : "#6b4d5a",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(showAdd || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => {
            setShowAdd(false);
            setEditProduct(null);
          }}
          onSaved={handleSaved}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
