import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONFETTI = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2.5,
  duration: 3.5 + Math.random() * 3,
  size: 6 + Math.random() * 10,
  color: ["#c9a96e", "#e8a0a0", "#f0d4a8", "#e8c4c4", "#d4b896", "#f5e6d3"][
    Math.floor(Math.random() * 6)
  ],
  shape: Math.random() > 0.5 ? "circle" : "rect",
  drift: (Math.random() - 0.5) * 200,
  rotation: Math.random() * 720,
}));

const PETALS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 5 + Math.random() * 5,
  size: 10 + Math.random() * 16,
  drift: (Math.random() - 0.5) * 150,
}));

export default function BirthdaySplash({ onDone }) {
  const [phase, setPhase] = useState("enter"); // enter → reading → exit

  useEffect(() => {
    // After 4.5s move to "you can dismiss" phase
    const t1 = setTimeout(() => setPhase("reading"), 4500);
    return () => clearTimeout(t1);
  }, []);

  function handleDismiss() {
    setPhase("exit");
    setTimeout(onDone, 900);
  }

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          className="splash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7 }}
        >
          {/* Confetti */}
          <div className="splash-confetti">
            {CONFETTI.map((c) => (
              <motion.div
                key={c.id}
                style={{
                  position: "absolute",
                  left: `${c.x}%`,
                  top: -20,
                  width: c.size,
                  height: c.shape === "circle" ? c.size : c.size * 0.6,
                  borderRadius: c.shape === "circle" ? "50%" : "2px",
                  background: c.color,
                  opacity: 0.85,
                }}
                initial={{ y: -20, opacity: 0, rotate: 0 }}
                animate={{
                  y: "105vh",
                  x: [0, c.drift * 0.3, c.drift, c.drift * 0.6, 0],
                  opacity: [0, 1, 1, 0.6, 0],
                  rotate: c.rotation,
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  ease: "easeIn",
                  repeat: 1,
                  repeatDelay: 1,
                }}
              />
            ))}
          </div>

          {/* Petals */}
          <div className="splash-confetti">
            {PETALS.map((p) => (
              <motion.div
                key={`p-${p.id}`}
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: -20,
                  width: p.size,
                  height: p.size,
                  borderRadius: "50% 0 50% 0",
                  background: "linear-gradient(135deg, rgba(232,160,160,0.5), rgba(201,169,110,0.3))",
                }}
                initial={{ y: -20, opacity: 0, rotate: 0 }}
                animate={{
                  y: "110vh",
                  x: [0, p.drift],
                  opacity: [0, 0.8, 0.8, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay + 0.5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          {/* Glow orbs */}
          <div className="splash-orb splash-orb-1" />
          <div className="splash-orb splash-orb-2" />
          <div className="splash-orb splash-orb-3" />

          {/* Main content */}
          <div className="splash-content">
            {/* Animated star */}
            <motion.div
              className="splash-star"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              ✦
            </motion.div>

            <motion.p
              className="splash-from"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              from Vinay, with all his love
            </motion.p>

            <motion.h1
              className="splash-title"
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Happy Birthday
            </motion.h1>

            <motion.h2
              className="splash-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Nini 🎂
            </motion.h2>

            <motion.p
              className="splash-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
            >
              You are the most beautiful thing that ever happened to me.
              <br />
              <em>This is yours. All of it.</em>
            </motion.p>

            <AnimatePresence>
              {phase === "reading" && (
                <motion.button
                  className="splash-btn"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onClick={handleDismiss}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Open your gift →
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}