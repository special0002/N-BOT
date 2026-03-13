import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 6,
  size: 8 + Math.random() * 14,
  rotation: Math.random() * 360,
  drift: (Math.random() - 0.5) * 120,
}));

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Those credentials didn't work. Try again, love. 💌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Falling petals */}
      <div className="petals-container">
        {PETALS.map((p) => (
          <motion.div
            key={p.id}
            className="petal"
            style={{ left: `${p.x}%`, width: p.size, height: p.size }}
            initial={{ y: -40, opacity: 0, rotate: p.rotation }}
            animate={{
              y: "110vh",
              x: [0, p.drift, -p.drift * 0.5, 0],
              opacity: [0, 0.7, 0.7, 0],
              rotate: p.rotation + 360,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="login-icon"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.div>

        <h1 className="login-title">A little something<br /><em>just for you</em></h1>
        <p className="login-subtitle">Sign in to discover what awaits ✨</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className={`field-wrap ${focused === "email" ? "focused" : ""}`}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={`field-wrap ${focused === "password" ? "focused" : ""}`}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="login-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <>Enter <span className="btn-arrow">→</span></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
