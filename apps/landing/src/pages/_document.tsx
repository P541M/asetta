import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    // data-scroll-behavior lets Next.js disable our CSS smooth scrolling
    // during route transitions (instant scroll-to-top between pages).
    <Html lang="en" data-scroll-behavior="smooth">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
