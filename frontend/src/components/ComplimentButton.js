import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Written by Vinay — personal, specific, real
const COMPLIMENTS = [
  "You managed GDSC, GTAC, and placements all at once — and made it look easy. That's not talent, that's you. 🌟",
  "The way you love your maa says everything about who you are. Quietly devoted. Beautifully loyal. 💕",
  "You took a one-year drop, bet on yourself, and won. Most people don't have that kind of courage. You do. ✦",
  "Sheeno is the luckiest dog in the world and he absolutely knows it. 🐾",
  "You dance when you think no one is watching. That joy is real. That joy is you. 🕊️",
  "Your eyes are the kind that make someone forget what they were saying. Elegantly, unfairly beautiful. ✨",
  "You sing. You dance. You code. You lead. You love. Pick a lane, Nini — you're too much. 😍",
  "Pata hai aaj kya hua? You became the most impressive person I know. Again. 💫",
  "The 50kg back exercise claim? I still believe you. I will always believe you. 💪",
  "A GDSC lead at your college. An engineer at McAfee. A daughter your parents beam about. You are plural excellence. 🌸",
  "You're going through a hard season. But you're still here, still trying. That is strength most people never find. 🔥",
  "Kolkata was magic. But the magic was you. It was always you. 💕",
  "Your fashion sense turns heads without trying. That's not style — that's presence. ✦",
  "The way you love your people — fully, quietly, completely — that is rare. That is beautiful. That is you. 🌹",
  "You are not stuck. You are gathering yourself. There is a difference, and you will feel it soon. 🌤️",
];

export default function ComplimentButton() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [used, setUsed] = useState([]);

  function handleClick() {
    // Pick a compliment not recently used
    const available = COMPLIMENTS.filter((_, i) => !used.includes(i));
    const pool = available.length > 0 ? available : COMPLIMENTS.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const actualIdx = COMPLIMENTS.indexOf(COMPLIMENTS[idx]);

    setUsed((prev) => [...prev.slice(-5), actualIdx]);
    setCurrent(COMPLIMENTS[actualIdx]);
    setVisible(true);

    // Auto-hide after 6s
    setTimeout(() => setVisible(false), 6000);
  }

  return (
    <>
      {/* The hidden star button */}
      <motion.button
        className="compliment-btn"
        onClick={handleClick}
        whileHover={{ scale: 1.15, rotate: 20 }}
        whileTap={{ scale: 0.9 }}
        title="✦"
      >
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      </motion.button>

      {/* Compliment toast */}
      <AnimatePresence>
        {visible && current && (
          <motion.div
            className="compliment-toast"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              className="compliment-toast-close"
              onClick={() => setVisible(false)}
            >
              ✕
            </button>
            <p>{current}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}