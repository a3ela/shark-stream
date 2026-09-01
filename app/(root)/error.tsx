"use client";

import { useEffect } from "react";

export default function PublicError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center"><p className="text-sm font-semibold text-[var(--primary)]">Temporary problem</p><h1 className="mt-2 font-heading text-4xl font-bold">The directory is unavailable</h1><p className="mt-4 text-[var(--text-secondary)]">Please try again in a moment. We’re reconnecting to the directory service.</p><button className="mt-8 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:bg-[var(--primary-dark)]" onClick={retry}>Try again</button></main>;
}
