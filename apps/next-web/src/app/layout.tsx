import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Spectral } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { UserLibraryProvider } from "../contexts/UserLibraryContext";
import { SITE_URL } from "../lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-spectral", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

const TITLE = "sanfran.md — Skills jurídicas brasileiras para agentes de IA";
const DESCRIPTION =
  "Skills abertas e verificáveis para o Direito brasileiro: prazos, cálculos, peças, contratos, LGPD e licitações. Use no Claude, ChatGPT, Grok ou Manus.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | sanfran.md" },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/", locale: "pt_BR", siteName: "sanfran.md" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Aplica o tema antes da primeira pintura (sem "flash"). Mantenha em sincronia com ThemeToggle.
const THEME_SCRIPT = `try{var t=localStorage.getItem("sanfran-theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${spectral.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "sanfran.md", url: SITE_URL, inLanguage: "pt-BR" }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <UserLibraryProvider>
            <Navbar />
            <main className="flex-1 w-full relative flex flex-col">{children}</main>
            <Footer />
          </UserLibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
