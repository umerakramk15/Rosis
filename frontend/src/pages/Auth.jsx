import { useState, useEffect, useRef } from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg
    className="w-4.5 h-4.5"
    style={{ width: 18, height: 18 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    {open ? (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </>
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </>
    )}
  </svg>
);

const MailIcon = () => (
  <svg
    style={{ width: 16, height: 16 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    style={{ width: 16, height: 16 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    style={{ width: 16, height: 16 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    style={{ width: 14, height: 14 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    style={{ width: 16, height: 16 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const BackIcon = () => (
  <svg
    style={{ width: 16, height: 16 }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

// ─── FLOATING PETAL DECORATION ────────────────────────────────────────────────
const petals = [
  { top: "8%", left: "12%", size: 40, delay: "0s", dur: "6s", rot: 15 },
  { top: "20%", left: "78%", size: 28, delay: "1.2s", dur: "8s", rot: -20 },
  { top: "55%", left: "5%", size: 22, delay: "2.5s", dur: "7s", rot: 35 },
  { top: "70%", left: "88%", size: 34, delay: "0.8s", dur: "9s", rot: -10 },
  { top: "85%", left: "20%", size: 18, delay: "3.1s", dur: "6.5s", rot: 45 },
  { top: "40%", left: "92%", size: 25, delay: "1.8s", dur: "7.5s", rot: -30 },
  { top: "12%", left: "55%", size: 15, delay: "4s", dur: "8.5s", rot: 60 },
  { top: "90%", left: "65%", size: 30, delay: "0.4s", dur: "6s", rot: -45 },
];

// ─── STRENGTH METER ───────────────────────────────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { score: 0, label: "", color: "#e5e7eb" },
    { score: 1, label: "Weak", color: "#ef4444" },
    { score: 2, label: "Fair", color: "#f59e0b" },
    { score: 3, label: "Good", color: "#3b82f6" },
    { score: 4, label: "Strong", color: "#22c55e" },
  ];
  return levels[score] || levels[0];
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  hint,
  autoComplete,
  required,
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocus] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;
  const hasError = !!error;
  const hasValue = !!value;

  return (
    <div className="mb-5">
      <label className="field-label">
        {label}
        {required && <span style={{ color: "#c9727a", marginLeft: 2 }}>*</span>}
      </label>
      <div
        className="field-wrap"
        style={{
          border: `1.5px solid ${hasError ? "#ef4444" : focused ? "#c9727a" : "#ecdada"}`,
          boxShadow: focused ? "0 0 0 3px rgba(201,114,122,0.12)" : "none",
          background: hasError ? "rgba(239,68,68,0.03)" : "white",
        }}
      >
        <span className="field-icon">{icon}</span>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="field-input"
          required={required}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="field-eye"
            tabIndex={-1}
          >
            <EyeIcon open={show} />
          </button>
        )}
        {type !== "password" && hasValue && !hasError && (
          <span className="field-check">
            <CheckIcon />
          </span>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  );
}

// ─── PANEL COMPONENTS ─────────────────────────────────────────────────────────

function LoginPanel({ onSwitch, onForgot }) {
  // Register User Functinality here
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading: loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = "Please enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(email, password);
    console.log(result.role);
    if (result.success) {
      toast.success("Welcome back!");
      if (result.role === "merchant") navigate("/merchant/dashboard");
      else navigate("/customer/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{
            color: "#c9727a",
            fontFamily: "Jost,sans-serif",
            letterSpacing: "0.2em",
          }}
        >
          Welcome back
        </p>
        <h1
          className="display-font font-bold mb-2"
          style={{
            fontSize: "clamp(1.7rem,3vw,2.2rem)",
            color: "#2d1a1a",
            lineHeight: 1.15,
          }}
        >
          Sign in to
          <br />
          <em style={{ color: "#c9727a" }}>Rosée</em>
        </h1>
        <p
          className="text-sm"
          style={{
            color: "#8a6060",
            fontFamily: "Jost,sans-serif",
            fontWeight: 300,
          }}
        >
          Your curated world of feminine fashion awaits.
        </p>
      </div>

      {/* Google OAuth */}
      <button type="button" className="oauth-btn w-full mb-5">
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <div className="divider mb-5">
        <span>or sign in with email</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@yourname.com"
          icon={<MailIcon />}
          error={errors.email}
          autoComplete="email"
          required
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={<LockIcon />}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between mb-6">
          <label
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setRemember((r) => !r)}
          >
            <div
              className="checkbox"
              style={{
                background: remember ? "#c9727a" : "white",
                borderColor: remember ? "#c9727a" : "#dcc8c8",
              }}
            >
              {remember && <CheckIcon />}
            </div>
            <span
              className="text-sm"
              style={{ color: "#5a3d3d", fontFamily: "Jost,sans-serif" }}
            >
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="text-sm font-semibold hover:underline transition-all"
            style={{
              color: "#c9727a",
              fontFamily: "Jost,sans-serif",
              textDecorationColor: "#e8a0a0",
            }}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="submit-btn w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ArrowIcon />
            </span>
          )}
        </button>
      </form>

      <p
        className="text-center mt-6 text-sm"
        style={{ color: "#8a6060", fontFamily: "Jost,sans-serif" }}
      >
        Don't have an account?{" "}
        <button
          onClick={onSwitch}
          className="font-semibold hover:underline transition-all"
          style={{ color: "#c9727a", textDecorationColor: "#e8a0a0" }}
        >
          Create one ✿
        </button>
      </p>
    </div>
  );
}

function RegisterPanel({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
 const [role, setRole] = useState("customer"); // ADD THIS 
  const [errors, setErrors] = useState({});
  // const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const strength = getPasswordStrength(password);

  const { register, isLoading: loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = "Please enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    if (!agreed) e.agreed = "Please accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register({ name, email, password, role });
    if (result.success) {
      toast.success("Account created successfully!");
      if (result.role === "merchant") navigate("/merchant/dashboard");
      else navigate("/customer/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 fade-in">
        <div className="text-5xl mb-5">✿</div>
        <h2
          className="display-font text-2xl font-bold mb-2"
          style={{ color: "#2d1a1a" }}
        >
          You're in, {name.split(" ")[0]}!
        </h2>
        <p
          className="text-sm mb-6 max-w-xs mx-auto"
          style={{
            color: "#8a6060",
            fontFamily: "Jost,sans-serif",
            fontWeight: 300,
            lineHeight: 1.7,
          }}
        >
          Welcome to the Rosée circle. We've sent a confirmation email to{" "}
          <strong style={{ color: "#c9727a" }}>{email}</strong>
        </p>
        <div className="w-full space-y-2">
          {[
            "Account created",
            "Welcome email sent",
            "Exclusive member perks unlocked",
          ].map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: "white",
                border: "1.5px solid #f5e0e0",
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}
              >
                <CheckIcon />
              </div>
              <span
                className="text-sm"
                style={{ color: "#5a3d3d", fontFamily: "Jost,sans-serif" }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="submit-btn mt-6"
          style={{ width: "auto", paddingLeft: 32, paddingRight: 32 }}
        >
          Continue to Shop ✿
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-7">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{
            color: "#c9727a",
            fontFamily: "Jost,sans-serif",
            letterSpacing: "0.2em",
          }}
        >
          New member
        </p>
        <h1
          className="display-font font-bold mb-2"
          style={{
            fontSize: "clamp(1.7rem,3vw,2.2rem)",
            color: "#2d1a1a",
            lineHeight: 1.15,
          }}
        >
          Join the
          <br />
          <em style={{ color: "#c9727a" }}>Rosée Circle</em>
        </h1>
        <p
          className="text-sm"
          style={{
            color: "#8a6060",
            fontFamily: "Jost,sans-serif",
            fontWeight: 300,
          }}
        >
          Create your account and unlock exclusive member benefits.
        </p>
      </div>

      <button type="button" className="oauth-btn w-full mb-5">
        <GoogleIcon />
        <span>Sign up with Google</span>
      </button>
      <div className="divider mb-5">
        <span>or create with email</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          icon={<UserIcon />}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@yourname.com"
          icon={<MailIcon />}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Create a strong password"
          icon={<LockIcon />}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        {/* Password strength meter */}
        {password && (
          <div className="mb-5 -mt-3 fade-in">
            <div className="flex gap-1 mb-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-all duration-500"
                  style={{
                    background:
                      i <= strength.score ? strength.color : "#f0e4e4",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{
                  fontFamily: "Jost,sans-serif",
                  color: strength.color,
                  fontWeight: 600,
                }}
              >
                {strength.label}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "Jost,sans-serif", color: "#a07070" }}
              >
                {strength.score < 2
                  ? "Add numbers & symbols"
                  : strength.score < 4
                    ? "Almost there!"
                    : "Perfect password ✓"}
              </span>
            </div>
          </div>
        )}

        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          icon={<LockIcon />}
          error={errors.confirm}
          hint={
            confirm && confirm === password ? "✓ Passwords match" : undefined
          }
          autoComplete="new-password"
          required
        />
        <div className="mb-6">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="merchant">Merchant</option>
          </select>
        </div>

        {/* Terms */}
        <div className="mb-6">
          <label
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setAgreed((a) => !a)}
          >
            <div
              className="checkbox mt-0.5 flex-shrink-0"
              style={{
                background: agreed ? "#c9727a" : "white",
                borderColor: agreed ? "#c9727a" : "#dcc8c8",
              }}
            >
              {agreed && <CheckIcon />}
            </div>
            <span
              className="text-sm leading-relaxed"
              style={{ color: "#5a3d3d", fontFamily: "Jost,sans-serif" }}
            >
              I agree to the{" "}
              <a
                href="#"
                className="font-semibold hover:underline"
                style={{ color: "#c9727a" }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-semibold hover:underline"
                style={{ color: "#c9727a" }}
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreed && (
            <p className="field-error mt-1 ml-7">{errors.agreed}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" />
              Creating account…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account <ArrowIcon />
            </span>
          )}
        </button>
      </form>

      <p
        className="text-center mt-6 text-sm"
        style={{ color: "#8a6060", fontFamily: "Jost,sans-serif" }}
      >
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          className="font-semibold hover:underline"
          style={{ color: "#c9727a" }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

function ForgotPanel({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoad] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCD] = useState(60);
  const timerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Email is required");
    setLoading(true);
    try {
      await import("../api/authAPI").then((m) =>
        m.authAPI.forgotPassword(email),
      );
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (sent) {
      timerRef.current = setInterval(() => {
        setCD((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sent]);

  return (
    <div className="fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-7 text-sm font-medium hover:opacity-70 transition-opacity"
        style={{ color: "#8b3a4a", fontFamily: "Jost,sans-serif" }}
      >
        <BackIcon /> Back to sign in
      </button>

      <div className="mb-7">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: "linear-gradient(135deg,#fde8e8,#fdf0f8)",
            border: "1.5px solid #f5d0d0",
          }}
        >
          <svg
            style={{ width: 26, height: 26, color: "#c9727a" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1
          className="display-font font-bold mb-2"
          style={{
            fontSize: "clamp(1.7rem,3vw,2.1rem)",
            color: "#2d1a1a",
            lineHeight: 1.15,
          }}
        >
          {sent ? "Check your inbox" : "Forgot your\npassword?"}
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "#8a6060",
            fontFamily: "Jost,sans-serif",
            fontWeight: 300,
          }}
        >
          {sent ? (
            <>
              We've sent a reset link to{" "}
              <strong style={{ color: "#c9727a" }}>{email}</strong>. It expires
              in 15 minutes.
            </>
          ) : (
            "No worries — enter your email and we'll send you a magic link to reset it."
          )}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} noValidate>
          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@yourname.com"
            icon={<MailIcon />}
            error={error}
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="submit-btn w-full mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Sending…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send Reset Link <ArrowIcon />
              </span>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg,#fde8e8,#fdf0f8)",
              border: "1.5px solid #f5d0d0",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}
              >
                <CheckIcon />
              </div>
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#2d1a1a", fontFamily: "Jost,sans-serif" }}
                >
                  Email sent successfully!
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: "#8a6060",
                    fontFamily: "Jost,sans-serif",
                    fontWeight: 300,
                  }}
                >
                  Check your spam folder if you don't see it within a minute.
                </p>
              </div>
            </div>
          </div>

          <button
            disabled={countdown > 0}
            onClick={() => {
              setSent(false);
              setCD(60);
            }}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: countdown > 0 ? "#f5f0f0" : "white",
              border: "1.5px solid #f0d0d0",
              color: countdown > 0 ? "#b0a0a0" : "#c9727a",
              fontFamily: "Jost,sans-serif",
              cursor: countdown > 0 ? "not-allowed" : "pointer",
            }}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
          </button>

          <button onClick={onBack} className="submit-btn w-full">
            <span className="flex items-center justify-center gap-2">
              Back to Sign In <ArrowIcon />
            </span>
          </button>
        </div>
      )}

      <div
        className="mt-8 rounded-2xl p-4"
        style={{ background: "#fdf0f0", border: "1px solid #f5e0e0" }}
      >
        <p
          className="text-xs text-center"
          style={{
            color: "#8a6060",
            fontFamily: "Jost,sans-serif",
            lineHeight: 1.6,
          }}
        >
          Need help? Contact us at{" "}
          <a
            href="mailto:hello@rosee.shop"
            className="font-semibold"
            style={{ color: "#c9727a" }}
          >
            hello@rosee.shop
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── PANEL SLIDESHOW IMAGES ───────────────────────────────────────────────────
const PANEL_CONTENT = {
  login: {
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=85",
    quote: "Fashion is the armour to survive the reality of everyday life.",
    author: "Bill Cunningham",
    label: "Spring / Summer '26",
  },
  register: {
    img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=85",
    quote: "Style is a way to say who you are without having to speak.",
    author: "Rachel Zoe",
    label: "New Member Benefits",
  },
  forgot: {
    img: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=900&q=85",
    quote: "Every woman has the right to feel beautiful.",
    author: "Rosée",
    label: "We're here to help ✿",
  },
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AuthPage() {
  // "login" | "register" | "forgot"
  const [panel, setPanel] = useState("login");
  const [imgLoaded, setImgLoaded] = useState(false);
  const content = PANEL_CONTENT[panel];

  useEffect(() => {
    setImgLoaded(false);
  }, [panel]);

  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          background: #fdf8f5;
          display: flex;
          align-items: stretch;
          font-family: 'Jost', sans-serif;
        }

        .display-font { font-family: 'Playfair Display', serif; }

        /* ── LEFT VISUAL PANEL ── */
        .visual-panel {
          position: relative;
          width: 45%;
          min-height: 100vh;
          overflow: hidden;
          display: none;
        }
        @media (min-width: 1024px) { .visual-panel { display: flex; } }

        .visual-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .visual-img.loaded { opacity: 1; transform: scale(1); }
        .visual-img.loading { opacity: 0; transform: scale(1.04); }

        .visual-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(45,26,26,0.15) 0%,
            rgba(45,26,26,0.55) 60%,
            rgba(45,26,26,0.8) 100%
          );
        }

        .visual-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          width: 100%;
        }

        .logo-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .logo-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f9c5c5, #e8a0a0);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; font-weight: 700;
          color: white; letter-spacing: -0.01em;
        }

        .visual-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          display: inline-block;
          margin-bottom: 1rem;
        }

        .visual-quote {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(1.2rem, 2vw, 1.6rem);
          line-height: 1.45;
          color: white;
          margin-bottom: 0.75rem;
        }

        .visual-author {
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem; font-weight: 500;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.6);
        }

        /* Floating petals */
        .petal {
          position: absolute;
          pointer-events: none;
          opacity: 0.22;
          animation: floatPetal var(--dur) ease-in-out infinite var(--delay);
          z-index: 1;
        }
        @keyframes floatPetal {
          0%,100% { transform: translateY(0) rotate(var(--rot)); }
          50%      { transform: translateY(-18px) rotate(calc(var(--rot) + 20deg)); }
        }

        /* ── RIGHT FORM PANEL ── */
        .form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          overflow-y: auto;
        }
        @media (min-width: 640px) { .form-panel { padding: 3rem 2.5rem; } }

        .form-card {
          width: 100%;
          max-width: 440px;
        }

        /* Mobile logo (hidden on lg) */
        .mobile-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 1024px) { .mobile-logo { display: none; } }

        /* ── FIELDS ── */
        .field-label {
          display: block;
          font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.04em;
          color: #5a3d3d;
          margin-bottom: 0.45rem;
          font-family: 'Jost', sans-serif;
        }
        .field-wrap {
          display: flex; align-items: center;
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          padding: 0 14px;
          gap: 10px;
          height: 50px;
        }
        .field-icon { color: #c9b0b0; display: flex; align-items: center; flex-shrink: 0; }
        .field-input {
          flex: 1; background: transparent;
          border: none; outline: none;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem; color: #2d1a1a;
          min-width: 0;
        }
        .field-input::placeholder { color: #c8b8b8; }
        .field-eye {
          color: #c9b0b0; display: flex; align-items: center;
          cursor: pointer; flex-shrink: 0;
          background: none; border: none; padding: 0;
          transition: color 0.2s ease;
        }
        .field-eye:hover { color: #c9727a; }
        .field-check { color: #22c55e; display: flex; align-items: center; flex-shrink: 0; }
        .field-error {
          font-size: 0.75rem; color: #ef4444;
          font-family: 'Jost', sans-serif; margin-top: 0.35rem;
        }
        .field-hint {
          font-size: 0.75rem; color: #22c55e;
          font-family: 'Jost', sans-serif; margin-top: 0.35rem;
          font-weight: 500;
        }

        /* Checkbox */
        .checkbox {
          width: 18px; height: 18px;
          border-radius: 5px; border: 1.5px solid;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s ease;
          color: white; cursor: pointer;
        }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          color: #c8b8b8; font-size: 0.75rem;
          font-family: 'Jost', sans-serif; letter-spacing: 0.05em;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, #f0d8d8);
        }
        .divider::after { background: linear-gradient(90deg, #f0d8d8, transparent); }

        /* OAuth button */
        .oauth-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px 20px; border-radius: 14px;
          border: 1.5px solid #ecdada;
          background: white;
          font-family: 'Jost', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          color: #3d2a2a;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(180,80,80,0.06);
        }
        .oauth-btn:hover {
          border-color: #c9727a;
          box-shadow: 0 4px 16px rgba(180,80,80,0.12);
          transform: translateY(-1px);
        }

        /* Submit button */
        .submit-btn {
          padding: 14px 24px;
          border-radius: 14px;
          background: linear-gradient(135deg, #c9727a, #e8a0a0);
          color: white;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none; cursor: pointer;
          transition: all 0.28s ease;
          box-shadow: 0 6px 20px rgba(180,80,80,0.3);
          display: block;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #b05e66, #d48888);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(180,80,80,0.38);
        }
        .submit-btn:disabled {
          opacity: 0.65; cursor: not-allowed; transform: none;
        }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Animations */
        .fade-in { animation: fadeIn 0.5s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .success-ring { animation: successRing 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes successRing {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .progress-bar { animation: progressFill 2.5s ease forwards; }
        @keyframes progressFill { from { width: 0%; } to { width: 100%; } }

        /* Panel slide transition */
        .panel-enter {
          animation: panelSlide 0.45s cubic-bezier(0.34,1.2,0.64,1) both;
        }
        @keyframes panelSlide {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Range slider */
        input[type=range] { -webkit-appearance: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #fdf8f5; }
        ::-webkit-scrollbar-thumb { background: #e8a0a0; border-radius: 3px; }
      `}</style>

      {/* ══ LEFT — VISUAL PANEL ══════════════════════════════════════════════ */}
      <div className="visual-panel">
        <img
          key={content.img}
          src={content.img}
          alt="Rosée Collection"
          className={`visual-img ${imgLoaded ? "loaded" : "loading"}`}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="visual-overlay" />

        {/* Floating petals */}
        {petals.map((p, i) => (
          <div
            key={i}
            className="petal"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              "--dur": p.dur,
              "--delay": p.delay,
              "--rot": `${p.rot}deg`,
            }}
          >
            <svg viewBox="0 0 40 40" fill="rgba(249,213,211,0.6)">
              <ellipse
                cx="20"
                cy="20"
                rx="12"
                ry="20"
                transform={`rotate(${p.rot} 20 20)`}
              />
            </svg>
          </div>
        ))}

        <div className="visual-content">
          {/* Logo */}
          <div className="logo-badge">
            <div className="logo-dot">✿</div>
            <span className="logo-name">Rosée</span>
          </div>

          {/* Quote block */}
          <div style={{ maxWidth: "340px" }}>
            <span className="visual-label">{content.label}</span>
            <blockquote className="visual-quote">"{content.quote}"</blockquote>
            <p className="visual-author">— {content.author}</p>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex" style={{ marginRight: 4 }}>
                {["S", "A", "I", "M"].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg,${["#c9727a", "#e8a0a0", "#f9c5c5", "#b07a3a"][i]},${["#e8a0a0", "#f9c5c5", "#f5e6c8", "#c9a060"][i]})`,
                      border: "2px solid rgba(253,248,245,0.3)",
                      marginLeft: i > 0 ? "-8px" : 0,
                      zIndex: 4 - i,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "white",
                    fontFamily: "Jost,sans-serif",
                  }}
                >
                  12,400+ members
                </p>
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Jost,sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  Join the Rosée circle today
                </p>
              </div>
            </div>

            {/* Micro-perks */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                "Free returns",
                "Exclusive drops",
                "Early access",
                "Style advice",
              ].map((perk) => (
                <span
                  key={perk}
                  className="flex items-center gap-1.5 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "999px",
                    padding: "0.3rem 0.8rem",
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "Jost,sans-serif",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span style={{ color: "#f9c5c5", fontSize: 10 }}>✦</span>{" "}
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — FORM PANEL ═══════════════════════════════════════════════ */}
      <div className="form-panel">
        <div className="form-card">
          {/* Mobile logo */}
          <div className="mobile-logo">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#f9c5c5,#e8a0a0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✿
            </div>
            <span
              className="display-font text-xl font-bold"
              style={{ color: "#8b3a4a" }}
            >
              Rosée
            </span>
          </div>

          {/* Panel switcher tabs (login / register) */}
          {panel !== "forgot" && (
            <div
              className="flex rounded-2xl p-1 mb-8"
              style={{ background: "#f5eded", border: "1.5px solid #ecdada" }}
            >
              {[
                { key: "login", label: "Sign In" },
                { key: "register", label: "Register" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPanel(tab.key)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: panel === tab.key ? "white" : "transparent",
                    color: panel === tab.key ? "#2d1a1a" : "#a07070",
                    fontFamily: "Jost,sans-serif",
                    boxShadow:
                      panel === tab.key
                        ? "0 2px 8px rgba(180,80,80,0.1)"
                        : "none",
                    letterSpacing: "0.03em",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Panel content with key for re-animation */}
          <div key={panel} className="panel-enter">
            {panel === "login" && (
              <LoginPanel
                onSwitch={() => setPanel("register")}
                onForgot={() => setPanel("forgot")}
              />
            )}
            {panel === "register" && (
              <RegisterPanel onSwitch={() => setPanel("login")} />
            )}
            {panel === "forgot" && (
              <ForgotPanel onBack={() => setPanel("login")} />
            )}
          </div>

          {/* Footer */}
          <p
            className="text-center mt-8 text-xs"
            style={{ color: "#c0a8a8", fontFamily: "Jost,sans-serif" }}
          >
            © 2026 Rosée · Crafted with ♡ ·{" "}
            <a
              href="#"
              className="hover:underline"
              style={{ color: "#c9727a" }}
            >
              Privacy
            </a>
            {" · "}
            <a
              href="#"
              className="hover:underline"
              style={{ color: "#c9727a" }}
            >
              Terms
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
