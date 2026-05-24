import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { OfflineIndicator } from "@/components/features/OfflineIndicator";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10131a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "قانونك - القوانين الجنائية المغربية",
  description: "موقع توثيق القوانين الجنائية المغربية - 679 مادة قانونية مع بحث فوري وتصفح سهل",
  keywords: ["قانون", "المسطرة الجنائية", "المغرب", "قانون مغربي", "محاماة", "قانون جنائي"],
  authors: [{ name: "Qanounak" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "قانونك",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "قانونك - القوانين الجنائية المغربية",
    description: "موقع توثيق قانون المسطرة الجنائية المغربي",
    locale: "ar_MA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="overflow-x-hidden">
      <head>
        {/* PWA Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        {/* PWA Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body 
        suppressHydrationWarning
        className={`${ibmPlexSansArabic.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden max-w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ServiceWorkerProvider>
            {/* Main wrapper to prevent horizontal overflow */}
            <div className="relative w-full max-w-full overflow-x-hidden">
              {children}
            </div>
            {/* Offline indicator */}
            <OfflineIndicator />
          </ServiceWorkerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
