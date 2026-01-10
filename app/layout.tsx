import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "قانون دوكس - قانون المسطرة الجنائية المغربي",
  description: "موقع توثيق قانون المسطرة الجنائية المغربي - 679 مادة قانونية مع بحث فوري وتصفح سهل",
  keywords: ["قانون", "المسطرة الجنائية", "المغرب", "قانون مغربي", "محاماة", "قانون جنائي"],
  authors: [{ name: "Qanun Docs" }],
  openGraph: {
    title: "قانون دوكس - قانون المسطرة الجنائية المغربي",
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
