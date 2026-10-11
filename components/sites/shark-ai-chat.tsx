"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function SharkAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hey! I'm Shark AI 🦈. Looking for a clean streaming site with no popups, 1080p anime, or live sports? Tell me what you want to watch!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: Message = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: data.error || "Sorry, I couldn't reach Gemini AI right now. Please verify your GEMINI_API_KEY.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Network error trying to connect to Shark AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <style>{`
          @keyframes spin-border {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .shark-btn-ring::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 9999px;
            background: conic-gradient(
              from 0deg,
              transparent 0%,
              transparent 50%,
              #22d3ee 60%,
              #3b82f6 75%,
              #a855f7 90%,
              transparent 100%
            );
            animation: spin-border 1.8s linear infinite;
            z-index: -1;
          }
          .shark-btn-ring::after {
            content: '';
            position: absolute;
            inset: 1px;
            border-radius: 9999px;
            background: #0a131c;
            z-index: -1;
          }
        `}</style>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          id="shark-ai-toggle-btn"
          className="shark-btn-ring relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer shadow-lg shadow-cyan-500/30"
          aria-label="Toggle Shark AI Chat"
        >
          {isOpen ? <X size={16} /> : <Sparkles size={16} />}
        </button>
      </div>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div
          id="shark-ai-modal"
          className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-[#0a131c]/95 backdrop-blur-xl shadow-2xl transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-(--border-color) px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--text-primary) flex items-center gap-1.5">
                  Shark AI
                 
                </h3>
              
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary) cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 border-b border-(--border-color) p-2.5 bg-black/15">
              {[
                "Anime with no ads",
                "Best 1080p movies",
                "Live Sports streams",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-300 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages scroll area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-(--text-primary)"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "model" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none text-xs whitespace-pre-wrap"
                      : "bg-white/5 border border-(--border-color) text-(--text-primary) rounded-tl-none"
                  }`}
                >
                  {m.role === "user" ? (
                    m.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-xs mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-white">{children}</strong>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-cyan-300 underline underline-offset-2 hover:text-cyan-200 transition-colors"
                          >
                            {children}
                          </a>
                        ),
                        ol: ({ children }) => (
                          <ol className="text-xs space-y-2.5 my-2 list-none pl-0">{children}</ol>
                        ),
                        ul: ({ children }) => (
                          <ul className="text-xs space-y-1 my-1.5 list-none pl-2">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="flex gap-1.5">
                            <span className="text-cyan-400 mt-px shrink-0">•</span>
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="mt-3 border-l-2 border-cyan-500/50 pl-3 text-xs text-cyan-200/80 italic bg-cyan-500/5 py-1.5 rounded-r-md">
                            {children}
                          </blockquote>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-sm font-bold text-white mb-1">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-bold text-white/90 mb-1">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-semibold text-white/80 mb-0.5">{children}</h3>
                        ),
                        hr: () => (
                          <hr className="border-white/10 my-2" />
                        ),
                        code: ({ children }) => (
                          <code className="bg-white/10 px-1 py-0.5 rounded text-[11px] font-mono text-cyan-200">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-blue-300 mt-0.5">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs">
                <Loader2 size={14} className="animate-spin" />
                <span>Shark AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-(--border-color) bg-black/30 p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about streaming sites, ads, quality..."
              className="flex-1 rounded-xl border border-(--border-color) bg-(--bg-glass) px-3 py-2 text-xs text-(--text-primary) placeholder:text-(--text-secondary)/50 focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
