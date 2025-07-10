import Link from "next/link";
import Head from "next/head";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Asetta</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-9xl font-bold text-gray-300 dark:text-dark-text-tertiary">404</h1>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
              Page not found
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full bg-light-button-primary hover:bg-light-button-primary-hover dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Go back to Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 dark:bg-dark-bg-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Custom404;