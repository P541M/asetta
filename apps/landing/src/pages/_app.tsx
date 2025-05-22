import type { AppProps } from "next/app";
import Head from "next/head";
import { Outfit, Lexend } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "../styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      console.log(`Route changed to: ${url}`);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Asetta - Simplify Your Academic Journey</title>
        <meta
          name="description"
          content="Asetta is an all-in-one platform to help students manage assignments, track deadlines, and stay organized."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${outfit.variable} ${lexend.variable} font-body`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
