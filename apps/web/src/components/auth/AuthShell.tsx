import Head from "next/head";
import { ReactNode } from "react";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

interface AuthShellProps {
  title: string;
  description: string;
  heading: string;
  subheading: string;
  children: ReactNode;
}

/**
 * Split-panel auth layout. The brand panel is a tonal band (`secondary`) that
 * follows the active theme; the two columns separate by tone shift, not
 * borders (Asetta surface language, standards.md).
 */
const AuthShell = ({ title, description, heading, subheading, children }: AuthShellProps) => (
  <div className="flex min-h-screen bg-background">
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>

    {/* Brand panel */}
    <aside className="hidden w-[44%] flex-col justify-between bg-secondary p-12 lg:flex xl:p-16">
      <Logo />
      <div>
        <h2 className="max-w-md font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground xl:text-6xl">
          Always ahead, never behind.
        </h2>
        <p className="mt-6 max-w-sm text-lg text-muted-foreground">
          Every course, deadline, and grade in one calm place.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">Free for students.</p>
    </aside>

    {/* Form column */}
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-8">
      <ThemeToggle className="absolute right-4 top-4 text-muted-foreground" />
      <div className="w-full max-w-sm">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{heading}</h1>
          <p className="mt-3 text-muted-foreground">{subheading}</p>
        </div>
        {children}
      </div>
    </main>
  </div>
);

export default AuthShell;
