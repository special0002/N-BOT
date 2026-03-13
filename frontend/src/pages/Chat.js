import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import ReactMarkdown from "react-markdown";
import BirthdaySplash from "../components/BirthdaySplash";
import LetterModal from "../components/LetterModal";
import ComplimentButton from "../components/ComplimentButton";

const SUGGESTED_QUESTIONS = [
  "What makes me so special? 💕",
  "Tell me about our story together",
  "What are my biggest achievements?",
  "What do the people who love me see in me?",
  "Tell me something I need to hear today 🌸",
];

function isBirthday() {
  const now = new Date();
  return now.getMonth() === 2 && now.getDate() === 14; // March 14
}

function TypingIndicator() {
  return (
    <div className="message message-ai">
      <div className="msg-avatar ai-avatar">✦</div>
      <div className="msg-bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

function Message({ msg, index }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      className={`message ${isUser ? "message-user" : "message-ai"}`}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      {!isUser && <div className="msg-avatar ai-avatar">✦</div>}
      <div className={`msg-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        )}
      </div>
      {isUser && <div className="msg-avatar user-avatar">you</div>}
    </motion.div>
  );
}

export default function Chat() {
  const { userName, logout } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello, Neha ✨\n\nHappy Birthday, Nini 🎂\n\nI know everything about you, your stories, your achievements, your dreams, your quirks, and how incredibly special you are. Ask me anything.\n\nWhat would you like to know? 💕`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showSplash, setShowSplash] = useState(isBirthday());
  const [showLetter, setShowLetter] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;
    setInput("");
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
    try {
      const res = await api.post("/chat", { message: userMessage, history });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong on my end. Try again? 💫" }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([{ role: "assistant", content: "Fresh start ✨ What would you like to know?" }]);
    setShowSuggestions(true);
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <BirthdaySplash onDone={() => setShowSplash(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showLetter && <LetterModal onClose={() => setShowLetter(false)} />}
      </AnimatePresence>

      <div className="chat-page">
        <div className="chat-bg-orb orb-a" />
        <div className="chat-bg-orb orb-b" />
        <div className="chat-bg-orb orb-c" />

        <motion.header
          className="chat-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-left">
            <div className="header-logo">✦</div>
            <div>
              <h1 className="header-title">All About Neha</h1>
              <p className="header-sub">A birthday gift, made with love 💕</p>
            </div>
          </div>
          <div className="header-right">
            <span className="header-user">{userName}</span>
            <motion.button
              className="header-btn letter-btn"
              onClick={() => setShowLetter(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              title="A letter for you"
            >
              💌
            </motion.button>
            <button className="header-btn" onClick={clearChat} title="Clear chat">↺</button>
            <button className="header-btn logout-btn" onClick={logout} title="Sign out">⎋</button>
          </div>
        </motion.header>

        <main className="chat-main">
          <div className="messages-list">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} index={i} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <AnimatePresence>
            {showSuggestions && messages.length <= 1 && (
              <motion.div
                className="suggestions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <p className="suggestions-label">Ask me something ✨</p>
                <div className="suggestions-grid">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <motion.button
                      key={q}
                      className="suggestion-chip"
                      onClick={() => sendMessage(q)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <motion.footer
          className="chat-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="input-wrap">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about yourself…"
              rows={1}
              disabled={loading}
            />
            <motion.button
              className={`send-btn ${!input.trim() || loading ? "send-disabled" : ""}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              whileHover={{ scale: input.trim() ? 1.05 : 1 }}
              whileTap={{ scale: input.trim() ? 0.95 : 1 }}
            >
              {loading ? <span className="btn-spinner small" /> : "↑"}
            </motion.button>
          </div>
          <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
        </motion.footer>

        <ComplimentButton />
      </div>
    </>
  );
}