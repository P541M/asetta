// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import "../app/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Outfit, Lexend } from "next/font/google";

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Head>
          <title>Asetta - Academic Dashboard</title>
          <meta
            name="description"
            content="Asetta helps students organize coursework, track assignments, and manage deadlines efficiently."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta charSet="utf-8" />
          <link rel="icon" href="/images/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/images/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/images/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/images/favicon-16x16.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/images/android-chrome-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="512x512"
            href="/images/android-chrome-512x512.png"
          />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <main className={`${outfit.variable} ${lexend.variable} font-body`}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
