"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";

const FORMSUBMIT_URL = "https://formsubmit.co/ajax/webwizabel@gmail.com";

const initialFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setSubmitted(true);
      setFormData(initialFormData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-4 font-heading text-4xl font-bold">Contact Us</h1>
        <p className="text-(--text-secondary)">
          Have feedback, found a broken link, or just want to get in touch? Fill
          out the form below and we&apos;ll get back to you.
        </p>
      </div>

      {submitted ? (
        <div
          className="rounded-2xl border border-(--border) p-12 text-center"
          style={{
            background: "var(--bg-glass)",
            boxShadow:
              "0 0 0 1px var(--primary, #3b82f6) inset, 0 0 40px var(--glow-color), 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="mb-3 font-heading text-2xl font-semibold">
            Message Sent!
          </h2>
          <p className="mb-8 text-(--text-secondary)">
            Thank you for reaching out. We&apos;ll get back to you as soon as
            possible.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="rounded-lg bg-(--primary) px-6 py-2.5 font-medium text-(--text-inverse) transition-colors hover:bg-(--primary-dark)"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <div
          className="border border-(--border-color) bg-(--bg-glass) rounded-xl p-6 sm:p-8 max-w-3xl mx-auto"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-(--text-secondary)">
                  Name
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="request-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-(--text-secondary)">
                  Email
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="request-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-(--text-secondary)">
                Subject
              </label>
              <input
                required
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                className="request-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-(--text-secondary)">
                Message
              </label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Write your message here..."
                className="request-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-6 py-2.5 font-medium text-(--text-inverse) transition-colors hover:bg-(--primary-dark) disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
