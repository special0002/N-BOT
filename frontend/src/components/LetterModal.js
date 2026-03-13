import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

export default function LetterModal({ onClose }) {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLetter() {
      try {
        const res = await api.post("/letter");
        setLetter(res.data.letter);
      } catch {
        setLetter("Something went wrong fetching your letter. Try again 💕");
      } finally {
        setLoading(false);
      }
    }
    fetchLetter();
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Format letter: split by \n\n into paragraphs
  const paragraphs = letter.split("\n\n").filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        className="letter-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="letter-modal"
          initial={{ opacity: 0, y: 60, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative top */}
          <div className="letter-deco-top">
            <span className="letter-deco-line" />
            <span className="letter-deco-star">✦</span>
            <span className="letter-deco-line" />
          </div>

          <button className="letter-close" onClick={onClose}>✕</button>

          <div className="letter-header">
            <p className="letter-label">A letter for you</p>
            <h2 className="letter-title">My Nini</h2>
          </div>

          <div className="letter-body">
            {loading ? (
              <div className="letter-loading">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  unfolding your letter ✦
                </motion.span>
              </div>
            ) : (
              paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  className={`letter-para ${para.startsWith("Yours") || para.startsWith("Vinay") ? "letter-sign" : ""}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  {para}
                </motion.p>
              ))
            )}
          </div>

          {/* Decorative bottom */}
          <div className="letter-deco-bottom">
            <span className="letter-deco-line" />
            <span className="letter-deco-heart">💕</span>
            <span className="letter-deco-line" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}