import { useState } from "react";
import { Button } from "@/components/Button";
import Container from "@/components/Container";
import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import TextLink from "@/components/TextLink";
import { CheckIcon, SpinnerIcon } from "@/components/icons";
import type { ContactFormPayload } from "@/lib/contact";
import { CONTACT_EMAIL } from "@/lib/site";
import { trackContactFormSubmission } from "@/utils/analytics";

const EMPTY_FORM: ContactFormPayload = {
  name: "",
  email: "",
  message: "",
  emailConsent: false,
  website: "",
};

type Status = { type: "idle" | "loading" } | { type: "success" | "error"; message: string };

/** Filled, borderless inputs: stone field that turns white with a ring on focus. */
const inputClasses =
  "w-full rounded-lg bg-stone-100 px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400";

/** Label-above-control wrapper shared by every form field. */
function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-stone-900">
        {label}
      </label>
      {children}
    </div>
  );
}

function SuccessPanel({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white">
        <CheckIcon className="h-7 w-7 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-stone-900">Message sent!</h3>
      <p className="mt-2 text-base text-stone-600">{message}</p>
      <Button size="lg" className="mt-6" onClick={onReset}>
        Send another message
      </Button>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState<ContactFormPayload>(EMPTY_FORM);
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

  if (status.type === "success") {
    return <SuccessPanel message={status.message} onReset={() => setStatus({ type: "idle" })} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot (A20): hidden with CSS, so people and autofill never see it, while a bot that
          reads the HTML fills it. The API drops anything that arrives with it filled. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field id="name" label="Name">
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
        </Field>
        <Field id="email" label="Email">
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
        </Field>
      </div>

      <Field id="message" label="Message">
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
      </Field>

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
            <strong>Required:</strong> I consent to receive email communications from Asetta in
            response to this inquiry. This consent is required under Canada's Anti-Spam Legislation
            (CASL). You may withdraw this consent at any time by emailing{" "}
            <TextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</TextLink>.
          </label>
        </div>
      </div>

      {status.type === "error" && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{status.message}</div>
      )}

      <Button type="submit" size="lg" disabled={status.type === "loading"} className="w-full">
        {status.type === "loading" ? (
          <span className="flex items-center justify-center gap-3">
            <SpinnerIcon className="h-5 w-5 animate-spin text-white" />
            Sending...
          </span>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}

export default function Contact() {
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
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Layout>
  );
}
