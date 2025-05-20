// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
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
          <title>Kivo - Academic Dashboard</title>
          <meta
            name="description"
            content="Kivo helps students organize coursework, track assignments, and manage deadlines efficiently."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${outfit.variable} ${lexend.variable} font-body`}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
