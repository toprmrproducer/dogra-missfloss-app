import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { SentryErrorBoundary } from "@/components/SentryErrorBoundary";
import SpinLoader from "@/components/SpinLoader";
import { Toaster } from "@/components/ui/sonner";
import { AppConfigProvider } from "@/context/AppConfigContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { TelephonyConfigWarningsProvider } from "@/context/TelephonyConfigWarningsContext";
import { UserConfigProvider } from "@/context/UserConfigContext";
import { AuthProvider } from "@/lib/auth";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miss Floss",
  description: "AI voice agents for inbound & outbound calling, booking, and billing — built by Miss Floss.",
  applicationName: "Miss Floss",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/miss-floss-logo.svg",
  },
  openGraph: {
    title: "Miss Floss",
    description: "AI voice agents for inbound & outbound calling, booking, and billing.",
    siteName: "Miss Floss",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miss Floss",
    description: "AI voice agents for inbound & outbound calling, booking, and billing.",
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Miss Floss is always light (white + cyan). Force-off any dark class. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SentryErrorBoundary>
          <AuthProvider>
            <AppConfigProvider>
              <Suspense fallback={<SpinLoader />}>
                <UserConfigProvider>
                  <TelephonyConfigWarningsProvider>
                    <OnboardingProvider>
                      <AppLayout>
                        {children}
                      </AppLayout>
                      <Toaster />
                    </OnboardingProvider>
                  </TelephonyConfigWarningsProvider>
                </UserConfigProvider>
              </Suspense>
            </AppConfigProvider>
          </AuthProvider>
        </SentryErrorBoundary>
      </body>
    </html>
  );
}
