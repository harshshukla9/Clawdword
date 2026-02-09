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
        className="h-screen flex flex-col" 
        style={{ backgroundColor: colors.background }}
      >
        <Navbar />
        <div className="flex-1 flex overflow-hidden mt-4">
          {/* Left Column - Game Controls (1/4) */}
          <div className="w-1/4 h-full">
            <GameControls />
          </div>
          
          {/* Middle Column - Game Board (centered) */}
          <div className="flex-1 h-full flex items-center justify-center">
            <GameBoard />
          </div>
          
          {/* Right Column - Chat (1/4) */}
          <div className="w-1/4 h-full flex">
            <Chat />
          </div>
        </div>
        
        {/* Sticky Moving Footer Banner */}
        {!showSplash && (
          <div 
            className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
            style={{ 
              backgroundColor: colors.baseBlue,
              height: '40px',
              opacity: 0.9
            }}
          >
            <div className="flex items-center h-full overflow-hidden relative">
              <div 
                className="flex items-center gap-8 whitespace-nowrap"
                style={{
                  animation: 'scroll 25s linear infinite',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '14px',
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
