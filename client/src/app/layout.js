import { Outfit } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import Player from "@/components/Player";
import { Toaster } from 'sonner';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Echo Player",
  description: "A premium music streaming platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-echo-base text-echo-text-base h-screen overflow-hidden flex flex-col`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        
        {/* Player Area */}
        <div className="h-[96px] bg-echo-base flex-shrink-0 border-t border-white/5">
          <Player />
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
