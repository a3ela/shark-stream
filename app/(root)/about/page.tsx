import { CircleHelp, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Learn how Shark Stream curates third-party streaming site listings.", alternates: { canonical: "/about" } };

const faqs = [
  {
    question: "Is Shark Stream free to use?",
    answer:
      "Yes, Shark Stream is completely free. We are a directory that helps you discover streaming sites across the internet. We do not host any content ourselves.",
  },
  {
    question: "How do I report a broken or malicious link?",
    answer:
      "You can use the Contact page to send us a message about broken links, malicious sites, or any other issues you encounter. We take these reports seriously and will address them promptly.",
  },
  {
    question: "Can I request a site to be added?",
    answer:
      "Absolutely! Head over to the Request page and fill out the form with the site details. We review all submissions and add quality sites to our directory.",
  },
  {
    question: "Are the listed sites safe?",
    answer:
      "We do our best to verify sites before listing them, but we cannot guarantee the safety of third-party websites. Always use caution, keep your browser updated, and consider using an ad blocker and antivirus software when visiting unfamiliar sites.",
  },
  {
    question: "Do you host any content?",
    answer:
      "No. Shark Stream is purely a directory of links to third-party streaming websites. We do not host, stream, or distribute any media content.",
  },
  {
    question: "How often is the directory updated?",
    answer:
      "We continuously monitor and update our directory. New sites are added based on user requests and our own research. Broken or dead links are removed regularly.",
  },
];

export default function About() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="mb-4 font-heading text-4xl font-bold">
          About Shark Stream
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-(--text-secondary)">
          Your go-to directory for discovering streaming sites across the web.
        </p>
      </header>

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* What is Shark Stream? */}
        <section
          className="rounded-2xl border-(--border) bg-(--bg-glass) p-6"
          style={{
            boxShadow:
              "0 0 0 1px var(--primary, #3b82f6) inset, 0 0 40px var(--glow-color), 0 8px 32px rgba(0,0,0,0.5)",
            borderTopColor: "rgba(255,255,255,0.25)",
          }}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <Info className="h-6 w-6" />
          </div>

          <h2 className="mb-4 font-heading text-2xl font-semibold">
            What is Shark Stream?
          </h2>

          <p className="leading-relaxed text-(--text-secondary)">
            Shark Stream is a curated directory of streaming websites organized
            by category and region. Whether you&apos;re looking for movies, TV
            shows, anime, live sports, or apps, we help you find the right site
            quickly. We aggregate links so you don&apos;t have to search the web
            endlessly.
          </p>
        </section>

        {/* Third-Party Sites */}
        <section
          className="rounded-2xl  border-(--border) bg-(--bg-glass) p-6"
          style={{
            boxShadow:
              "0 0 0 1px var(--primary, #3b82f6) inset, 0 0 40px var(--glow-color), 0 8px 32px rgba(0,0,0,0.5)",
            borderTopColor: "rgba(255,255,255,0.25)",
          }}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h2 className="mb-4 font-heading text-2xl font-semibold">
            Third-Party Sites
          </h2>

          <div className="space-y-4 leading-relaxed text-(--text-secondary)">
            <p>
              All sites listed in Shark Stream are third-party websites that we
              do not own, operate, or control. Their content, availability, and
              policies can change at any time without notice.
            </p>

            <p>
              Shark Stream is simply a directory providing links for
              convenience. We are not responsible for the content found on any
              external site, nor for any damages or issues that may arise from
              using them.
            </p>
          </div>
        </section>

        {/* Safety */}
        <section
          className="rounded-2xl  border-(--border) bg-(--bg-glass) p-6"
          style={{
            boxShadow:
              "0 0 0 1px var(--primary, #3b82f6) inset, 0 0 40px var(--glow-color), 0 8px 32px rgba(0,0,0,0.5)",
            borderTopColor: "rgba(255,255,255,0.25)",
          }}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h2 className="mb-4 font-heading text-2xl font-semibold">
            Use at Your Own Risk
          </h2>

          <p className="mb-4 leading-relaxed text-(--text-secondary)">
            While we strive to list reputable and functional sites, visiting
            third-party websites always carries inherent risks. We strongly
            recommend:
          </p>

          <ul className="space-y-3 text-(--text-secondary)">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-(--primary)">•</span>
              <span>Using a reliable ad blocker to avoid intrusive ads</span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 text-(--primary)">•</span>
              <span>Keeping your antivirus software up to date</span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 text-(--primary)">•</span>
              <span>
                Never entering personal or financial information on unfamiliar
                sites
              </span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 text-(--primary)">•</span>
              <span>
                Checking your local laws regarding the content you access
              </span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 text-(--primary)">•</span>
              <span>Using a VPN for additional privacy and security</span>
            </li>
          </ul>
        </section>
      </div>

      {/* FAQ Section */}
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <CircleHelp className="h-6 w-6" />
          </div>

          <h2 className="font-heading text-2xl font-semibold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-(--border) bg-(--bg-glass) p-6"
            >
              <h3 className="mb-2 font-heading text-lg font-semibold">
                {faq.question}
              </h3>

              <p className="leading-relaxed text-(--text-secondary)">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
