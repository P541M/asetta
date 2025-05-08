// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import BetaAccessGate from "../components/BetaAccessGate";

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
        <BetaAccessGate>
          <Component {...pageProps} />
        </BetaAccessGate>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
