import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Page shell shared by every route: document head, floating header, footer,
 * and a main area padded below the header (notch-safe via .pt-page).
 * `main` is relative so page-level glow backdrops can span the full width.
 */
export default function Layout({ title, description, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <Header />
      <main className="pt-page relative grow">{children}</main>
      <Footer />
    </div>
  );
}
