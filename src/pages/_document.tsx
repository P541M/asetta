import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        {/* One-time migration: seed next-themes ("theme") from the legacy "darkMode" key
            so existing users keep their saved preference. Runs before next-themes' own
            pre-hydration script, which handles all theming from here on. */}
        <Script id="theme-migration" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var theme = localStorage.getItem('theme');
                var legacy = localStorage.getItem('darkMode');
                if (!theme && legacy !== null) {
                  localStorage.setItem('theme', legacy === 'true' ? 'dark' : 'light');
                }
              } catch (e) {}
            })();
          `}
        </Script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
