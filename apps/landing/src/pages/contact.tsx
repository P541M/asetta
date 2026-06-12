import { useState } from "react";
import Container from "@/components/Container";
import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import TextLink from "@/components/TextLink";
import { CONTACT_EMAIL } from "@/lib/site";
import { trackContactFormSubmission } from "@/utils/analytics";

interface FormData {
  name: string;
  email: string;
  message: string;
  emailConsent: boolean;
}

const EMPTY_FORM: FormData = { name: "", email: "", message: "", emailConsent: false };

type Status =
  | { type: "idle" | "loading" }
  | { type: "success" | "error"; message: string };

/** Filled, borderless inputs: stone field that turns white with a ring on focus. */
const inputClasses =
  "w-full rounded-lg bg-stone-100 px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400";

export default function Contact() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setStatus({ type: "success", message: "We'll get back to you soon." });
      setFormData(EMPTY_FORM);
      trackContactFormSubmission(true);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send message",
      });
      trackContactFormSubmission(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <Layout
      title="Contact Us | Asetta"
      description="Get in touch with the Asetta team. We're here to help you get the most out of your free academic assistant."
    >
      <Container className="pb-24 md:pb-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          {/* Intro */}
          <Reveal>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              We're here to help
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-stone-600 md:text-xl">
              Questions about Asetta or need help getting started? Send us a message.
            </p>
            <p className="mt-8 text-base text-stone-600">
              Prefer email? <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>
            </p>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            {status.type === "success" ? (
              <div className="rounded-2xl bg-stone-50 p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white">
                  <svg
                    className="h-7 w-7 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-stone-900">Message sent!</h3>
                <p className="mt-2 text-base text-stone-600">{status.message}</p>
                <button
                  onClick={() => setStatus({ type: "idle" })}
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-primary-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-stone-900">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-stone-900">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="your.student@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-stone-900">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`${inputClasses} resize-none`}
                    rows={6}
                    placeholder="How can we help you with your academic journey?"
                    required
                  />
                </div>

                {/* CASL compliance consent */}
                <div className="rounded-lg bg-stone-100 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-stone-900">
                    Email Communication Consent (CASL Compliance)
                  </h4>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="emailConsent"
                      name="emailConsent"
                      checked={formData.emailConsent}
                      onChange={handleChange}
                      required
                      className="mt-0.5 h-4 w-4 accent-primary-600"
                    />
                    <label htmlFor="emailConsent" className="text-sm leading-relaxed text-stone-600">
                      <strong>Required:</strong> I consent to receive email communications from
                      Asetta in response to this inquiry. This consent is required under Canada's
                      Anti-Spam Legislation (CASL). You may withdraw this consent at any time by
                      emailing <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>.
                    </label>
                  </div>
                </div>

                {status.type === "error" && (
                  <div className="rounded-lg bg-red-50 p-4 text-red-700">{status.message}</div>
                )}

                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="w-full rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status.type === "loading" ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send message"
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </Container>
    </Layout>
  );
}
