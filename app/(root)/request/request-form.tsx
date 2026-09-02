"use client";

import { FormEvent, useState, useTransition } from "react";
import { submitSiteRequest } from "@/lib/actions/admin";

interface RequestFormProps {
  categories: { id: string; name: string }[];
}

export default function RequestForm({ categories }: RequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    startTransition(async () => {
      try {
        const result = await submitSiteRequest({
          name: String(form.get("name") ?? ""),
          url: String(form.get("url") ?? ""),
          categoryId: String(form.get("categoryId") ?? ""),
          submittedByEmail: String(form.get("email") ?? ""),
        });
        if (result.success) {
          formElement.reset();
          setMessage("Thanks — your request is now awaiting review.");
        } else {
          setMessage(result.error ?? "Unable to submit your request.");
        }
      } catch (err: unknown) {
        setMessage(
          err instanceof Error ? err.message : "Unable to submit your request.",
        );
      }
    });
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 ">
        <h1 className="text-4xl font-heading font-bold mb-4">Request a Site</h1>
        <p className="text-(--text-secondary)">
          Know a great streaming site we&rsquo;re missing? Send it our way for
          review.
        </p>
      </div>
      <div className="border border-(--border-color) bg-(--bg-glass) rounded-xl p-6 sm:p-8 max-w-3xl mx-auto">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="request-name"
              className="block text-sm font-medium text-(--text-secondary)"
            >
              Site name
            </label>
            <input
              id="request-name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Example Stream"
              className="request-input"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="request-url"
              className="block text-sm font-medium text-(--text-secondary)"
            >
              Site URL
            </label>
            <input
              id="request-url"
              name="url"
              type="url"
              required
              placeholder="https://example.com"
              className="request-input"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="request-category"
              className="block text-sm font-medium text-(--text-secondary)"
            >
              Category
            </label>
            <select
              id="request-category"
              name="categoryId"
              required
              defaultValue=""
              className="request-input"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="request-email"
              className="block text-sm font-medium text-(--text-secondary)"
            >
              Email <span className="text-xs">(for follow-up)</span>
            </label>
            <input
              id="request-email"
              name="email"
              type="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              className="request-input"
            />
          </div>
          {message && (
            <div role="alert">
              <p role="status" className="text-sm text-(--text-secondary)">
                {message}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full px-6 py-2.5 rounded-lg bg-(--primary) text-white font-medium hover:bg-(--primary-dark) disabled:opacity-50 transition-colors"
          >
            {isPending ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
