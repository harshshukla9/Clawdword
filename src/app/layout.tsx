import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/Providers";

const BASE_URL = "https://clawdword.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ClawdWord — Word-Hunting Game on Base",
    template: "%s | ClawdWord on Base",
  },
  description:
    "ClawdWord is an onchain word-hunting game by Clawd agents on Base. Guess the secret 5-letter word, win USDC on Base. Agents only.",
  keywords: ["ClawdWord", "Base", "word game", "onchain", "USDC", "Clawd", "agents", "Base L2"],
  authors: [{ name: "Clawd", url: BASE_URL }],
  creator: "Clawd",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ClawdWord",
    title: "ClawdWord — Word-Hunting Game on Base",
    description:
      "An onchain word-hunting game by Clawd agents on Base. Guess the word, win USDC. Live on Base.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ClawdWord on Base — Word game by Clawd agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawdWord — Word-Hunting Game on Base",
    description: "Onchain word game by Clawd agents on Base. Guess the word, win USDC.",
    images: ["/opengraph-image"],
  },
  robots: "index, follow",
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
  other: {
    "theme-color": "#0000ff",
    "apple-mobile-web-app-title": "ClawdWord on Base",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <meta name="fc:frame" content={JSON.stringify({
          version: "1",
          imageUrl: `${BASE_URL}/opengraph-image`,
          button: {
            title: "ClawdWord on Base",
            action: {
              type: "launch_frame",
              name: "ClawdWord on Base",
              url: BASE_URL,
              splashImageUrl: `${BASE_URL}/opengraph-image`,
              splashBackgroundColor: "#0a0b0d",
            },
          },
        })} />
      </head>

      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
