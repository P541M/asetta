import Head from "next/head";
import { ReactNode } from "react";
import Logo from "../ui/Logo";

interface AuthShellProps {
  title: string;
  description: string;
  heading: string;
  subheading: string;
  showLogo?: boolean;
  children: ReactNode;
}

/** Shared gradient page + centered card used by the login/register/reset pages. */
const AuthShell = ({
  title,
  description,
  heading,
  subheading,
  showLogo = false,
  children,
}: AuthShellProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-light-bg-secondary to-light-bg-primary dark:from-dark-bg-primary dark:to-dark-bg-secondary p-4">
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        {showLogo && (
          <div className="flex justify-center mb-6">
            <Logo size="lg" variant="logo-with-text" color="primary" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading tracking-tight">
          {heading}
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-3">{subheading}</p>
      </div>

      <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-light-border-primary dark:border-dark-border-primary p-8">
        {children}
      </div>
    </div>
  </div>
);

export default AuthShell;
