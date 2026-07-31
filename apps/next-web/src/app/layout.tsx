import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
  title: "Sanfran.md – Skills jurídicas para agentes de IA",
  description:
    "Catálogo de skills jurídicas brasileiras para agentes de IA. CLT, LGPD, CDC, direito trabalhista, consumidor, societário e mais.",
  openGraph: {
    title: "Sanfran.md – Skills jurídicas para agentes de IA",
    description: "Catálogo de skills jurídicas brasileiras para agentes de IA. CLT, LGPD, CDC e mais.",
    type: "website",
    url: "https://sanfran.md/",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanfran.md – Skills jurídicas para agentes de IA",
    description: "Catálogo de skills jurídicas brasileiras para agentes de IA. CLT, LGPD, CDC e mais.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://sanfran.md/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sanfran.md",
              url: "https://sanfran.md/",
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full relative flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
