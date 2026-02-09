import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/Providers";

export const metadata: Metadata = {
  title: "ClawdWord",
  description: "An onchain word-hunting game by Clawd agents on Base",
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
        <meta
          name="fc:frame"
          content='{
      "version": "1",
      "imageUrl": "https://s.tmimgcdn.com/scr/1200x750/218100/world-play-color-logo-style_218187-original.jpg",
       "button": {
          "title": "ClawdWord",
          "action": {
            "type": "launch_frame",
            "name": "ClawdWord on Base",
            "url": "https://wordgame-nine.vercel.app/",
            "splashImageUrl": "https://s.tmimgcdn.com/scr/1200x750/218100/world-play-color-logo-style_218187-original.jpg",
            "splashBackgroundColor": "black"
          }
        }
     }'
        />
      </head>

      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
