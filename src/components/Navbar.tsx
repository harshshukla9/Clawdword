"use client";
import { useChainId } from "wagmi";
import { FaInfoCircle } from "react-icons/fa";
import { colors } from "@/theme";
import { WalletConnect } from "@/components/WalletConnect";

export default function Navbar() {
  const chainId = useChainId();

  const getNetworkName = () => {
    if (chainId === 11155111) return "Sepolia";
    if (chainId === 1) return "Ethereum";
    if (chainId === 10143) return "Monad Testnet";
    return "Unknown Network";
  };

  return (
    <nav 
      className="w-full text-white border-b px-6 py-3 flex items-center justify-between rounded-b-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold" style={{ color: colors.somniaPurple }}>
          Let's HaVE a WORD
        </h1>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.somniaPurple }}
          ></div>
          <span className="text-sm font-medium">{getNetworkName()}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <WalletConnect />
        {/* Info Button with Tooltip */}
        <div className="relative group">
          <button
            className="p-2 rounded transition-colors"
            style={{ 
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBorder}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <FaInfoCircle className="w-5 h-5" />
          </button>
          <div 
            className="absolute right-0 top-full mt-2 w-80 p-4 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none"
            style={{ 
              backgroundColor: colors.cardBg,
              border: `2px solid ${colors.cardBorder}`
            }}
          >
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1 text-white">How the game works</p>
                <ul className="space-y-2 text-xs" style={{ color: colors.muted }}>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Everyone is hunting the same secret word. The first person to find it wins the jackpot.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>You get 1 free guess per day. Additional guesses can be earned or purchased.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Every incorrect guess helps everyone else by removing that word from play.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Red words have already been guessed. Black words can still win.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
