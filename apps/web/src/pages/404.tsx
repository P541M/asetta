import Link from "next/link";
import Head from "next/head";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../components/ui/button";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Asetta</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <p className="text-8xl font-semibold text-muted-foreground/30">404</p>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Page not found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/dashboard" className={cn(buttonVariants(), "w-full")}>
              Go back to dashboard
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "secondary" }), "w-full")}>
              Go to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Custom404;
