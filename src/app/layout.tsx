import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";

export const metadata: Metadata = {
  title: "Monad Word Game",
  description: "Word puzzle game",
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
          "title": "Word Play",
          "action": {
            "type": "launch_frame",
            "name": "Monad Word Play",
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
