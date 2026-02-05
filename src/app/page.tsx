"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameControls from "@/components/GameControls";
import GameBoard from "@/components/GameBoard";
import Chat from "@/components/Chat";
import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";
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
    <>
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
      </motion.div>
    </>
  );
}
