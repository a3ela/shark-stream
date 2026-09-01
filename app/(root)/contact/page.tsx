import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact", description: "Get help with Shark Stream or report a broken link.", alternates: { canonical: "/contact" } };
export default function ContactPage() { return <section className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-heading text-4xl font-bold">Contact</h1><p className="mt-4 text-[var(--text-secondary)]">For a broken or unsafe listing, please submit it through the request review flow with the affected URL. We review reports regularly.</p><Link className="mt-8 inline-flex rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:bg-[var(--primary-dark)]" href="/request">Report or request a site</Link></section>; }
