const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = `AI-Shop <${process.env.EMAIL_USER}>`;

// ── Welcome Email ─────────────────────────────────────────────────────
const sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Welcome to AI-Shop!',
    html: `<h2>Hi ${name}!</h2><p>Your account has been created successfully. Start shopping now!</p>`,
  });
};

// ── Password Reset Email ──────────────────────────────────────────────
const sendPasswordResetEmail = async (email, name, resetURL) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Password Reset — AI-Shop',
    html: `
      <h2>Hi ${name},</h2>
      <p>You requested to reset your password. Click the link below (valid for 15 minutes):</p>
      <a href="${resetURL}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none">
        Reset Password
      </a>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};

// ── Order Confirmation Email ──────────────────────────────────────────
const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsList = order.items
    .map(i => `<li>${i.name} x${i.qty} — Rs. ${i.price * i.qty}</li>`)
    .join('');

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Order Confirmed #${order._id} — AI-Shop`,
    html: `
      <h2>Hi ${name}, your order is confirmed!</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> Rs. ${order.total}</p>
      <p>We'll notify you when it ships.</p>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendOrderConfirmationEmail };
