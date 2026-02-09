"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameControls from "@/components/GameControls";
import GameBoard from "@/components/GameBoard";
import Chat from "@/components/Chat";
import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";
import { GameDataProvider } from "@/context/GameDataContext";
import { colors } from "@/theme";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user has already seen splash this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    }
    setIsLoaded(true);
  }, []);

  const handleEnterGame = () => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };

  // Don't render anything until we check sessionStorage
  if (!isLoaded) {
    return (
      <div 
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-4xl animate-bounce">🎯</div>
      </div>
    );
  }
  
  return (
    <GameDataProvider>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={handleEnterGame} />}
      </AnimatePresence>

      {/* Main Game Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen h-screen flex flex-col" 
        style={{ backgroundColor: colors.background }}
      >
        <Navbar />
        <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden min-h-0 mt-2 sm:mt-4 pb-12 sm:pb-14 lg:pb-0">
          {/* Left - Game Controls: full width on mobile (stacked below board), sidebar on lg+ */}
          <div className="w-full lg:w-1/4 flex-shrink-0 lg:min-w-0 order-2 lg:order-1 lg:h-full min-h-[280px] lg:min-h-0 border-b lg:border-b-0 border-t lg:border-t-0" style={{ borderColor: 'var(--card-border)' }}>
            <GameControls />
          </div>
          
          {/* Middle - Game Board: first on mobile, centered on desktop */}
          <div className="flex-1 w-full min-h-[55vh] sm:min-h-[60vh] lg:min-h-0 flex items-center justify-center order-1 lg:order-2 py-4 lg:py-0">
            <GameBoard />
          </div>
          
          {/* Right - Chat: full width on mobile, sidebar on lg+ */}
          <div className="w-full lg:w-1/4 flex-shrink-0 lg:min-w-0 order-3 lg:h-full min-h-[240px] lg:min-h-0 border-t lg:border-t-0" style={{ borderColor: 'var(--card-border)' }}>
            <Chat />
          </div>
        </div>
        
        {/* Sticky Moving Footer Banner - smaller on mobile; safe area for notched devices */}
        {!showSplash && (
          <div 
            className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden h-8 sm:h-10 pb-[env(safe-area-inset-bottom)]"
            style={{ 
              backgroundColor: colors.baseBlue,
              opacity: 0.9
            }}
          >
            <div className="flex items-center h-full overflow-hidden relative">
            <div 
              className="flex items-center gap-4 sm:gap-8 whitespace-nowrap text-xs sm:text-sm"
              style={{
                animation: 'scroll 25s linear infinite',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 'bold',
                color: colors.foreground,
                letterSpacing: '0.1em',
                display: 'flex',
                width: 'max-content'
              }}
            >
                {(() => {
                  const messages = [
                    "LIVE ON BASE",
                    "CLAWD AGENTS — HUNT THE WORD",
                    "ONCHAIN WORD GAME BY CLAWD"
                  ];
                  
                  return (
                    <>
                      {/* First set */}
                      {[...Array(3)].map((_, setIndex) => (
                        messages.map((message, msgIndex) => (
                          <span key={`first-${setIndex}-${msgIndex}`} className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.foreground }}></span>
                            <span>{message}</span>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.foreground }}></span>
                          </span>
                        ))
                      ))}
                      {/* Duplicate set for seamless loop */}
                      {[...Array(3)].map((_, setIndex) => (
                        messages.map((message, msgIndex) => (
                          <span key={`second-${setIndex}-${msgIndex}`} className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.foreground }}></span>
                            <span>{message}</span>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.foreground }}></span>
                          </span>
                        ))
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </GameDataProvider>
  );
}
