import { categories } from "@/lib/constants";

export default function Request() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Request a Site
        </h1>
        <p className="text-[var(--text-secondary)]">
          Know a great streaming site that should be in our directory? Let us
          know!
        </p>
      </div>

      <div className="border border-[var(--border-color)] bg-[var(--bg-glass)] rounded-xl p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Site Name
              </label>
              <input
                type="text"
                placeholder="e.g. AnimeHeaven"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Site URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category
              </label>
              <select
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
              >
                <option value="" disabled selected>Select a category</option>
                {(categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Description
              </label>
              <textarea
                placeholder="Briefly describe what this site offers..."
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--primary)]/50 transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--text-inverse)] font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
