"use client";
import { useDataContext } from "@/context/DataContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";
import { colors } from "@/theme";
const words = [
  "CHAIN",
  "BLOCK",
  "MINTS",
  "WALKS",
  "NODES",
  "COINS",
  "LAYER",
  "ETHER",
  "BYTES",
  "FEEDS",
  "PROOF",
  "VOTER",
  "STATE",
  "TRUST",
  "VALID",
  "SIGNS",
  "BUYER",
  "DEPTH",
  "FIATS",
  "VAULT",
  "VALUE",
  "LOGIC",
  "ASSET",
  "OWNER",
  "DIGIT",
  "CRISP",
  "STOCK",
  "TRADE",
  "CLOUD",
  "CODES",
  "MONEY",
  "TOKES",
  "CRASH",
  "HEDGE",
  "TOKEN",
  "LEARN",
  "SMART",
  "PRICE",
  "TREND",
  "FUNDS",
  "YIELD",
  "RISKS",
  "CLEAR",
  "MERGE",
  "SPLIT",
];

const maxAttempts = 6;

function getShareText({
  word,
  didWin,
  multiplier,
  depositAmount,
}: {
  word: string;
  didWin: boolean;
  multiplier: number;
  depositAmount: number;
}): string {
  const message = didWin
    ? `🎉 I just won ${
        depositAmount * multiplier
      } USDC in Base Word Game!\nBet: ${depositAmount} USDC x${multiplier}`
    : `😢 I lost the Base Word Game.\nThe correct word was: ${word}\nBet: ${depositAmount} USDC x multiplier: ${multiplier}`;

  return message;
}

export default function WordGame() {
  const [targetWord, setTargetWord] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [board, setBoard] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("");
  const [usedKeys, setUsedKeys] = useState<{ [key: string]: string }>({});
  const [multiplier, setMultiplier] = useState(5);
  const [gameStart, setGameStart] = useState(false);
  const [depositAmount, setDepositAmout] = useState(0);
  const [isClaim, setIsClaim] = useState(false);
  const { depositPlay, resolveGame, claimReward } = useDataContext();
  const [shareText, setShareText] = useState("");
  const { showSuccess, showError, showInfo } = useToast();
  useEffect(() => {
    const randomWord = words[Math.floor(Math.random() * words?.length)];
    setTargetWord(randomWord);
    setBoard(
      Array(maxAttempts)
        .fill(null)
        .map(() => Array(5).fill(""))
    );
  }, []);

  const handleSubmit = async () => {
    if (currentGuess?.length !== 5) {
      setMessage("Guess must be 5 letters long.");
      return;
    }

    if (attempts >= maxAttempts) {
      setMessage("No more attempts left.");
      return;
    }

    const newBoard = [...board];
    const row = newBoard[attempts];
    const guess = currentGuess.toUpperCase();
    const targetCounts: { [key: string]: number } = {};

    for (const letter of targetWord) {
      targetCounts[letter] = (targetCounts[letter] || 0) + 1;
    }

    const rowClasses: string[] = Array(5).fill("absent");
    const newUsedKeys = { ...usedKeys };

    for (let i = 0; i < 5; i++) {
      row[i] = guess[i];
      if (guess[i] === targetWord[i]) {
        rowClasses[i] = "correct";
        targetCounts[guess[i]]--;
        newUsedKeys[guess[i]] = "correct";
      }
    }

    for (let i = 0; i < 5; i++) {
      if (rowClasses[i] !== "correct" && targetCounts[guess[i]]) {
        rowClasses[i] = "present";
        targetCounts[guess[i]]--;
        if (newUsedKeys[guess[i]] !== "correct") {
          newUsedKeys[guess[i]] = "present";
        }
      } else if (!newUsedKeys[guess[i]]) {
        newUsedKeys[guess[i]] = "absent";
      }
    }

    setUsedKeys(newUsedKeys);
    setBoard(newBoard);
    setAttempts(attempts + 1);
    setMultiplier(5 - attempts);
    setCurrentGuess("");

    if (guess === targetWord) {
      showSuccess("🎉 Congratulations! You guessed the word.");
      const id = localStorage.getItem("betID");
      const _depositAmount = localStorage.getItem("depositAmount");
      let status = await resolveGame(Number(id), 1);

      let shareMessage = getShareText({
        word: targetWord,
        didWin: true,
        multiplier,
        depositAmount: Number(_depositAmount),
      });
      setShareText(shareMessage);
      if (status) {
        setGameStart(false);
        setIsClaim(true);
      }
    } else if (attempts + 1 >= maxAttempts) {
      showError(`😢 Game Over! The word was ${targetWord}.`);
      const id = localStorage.getItem("betID");
      const _depositAmount = localStorage.getItem("depositAmount");

      let status = await resolveGame(Number(id), 0);
      let shareMessage = getShareText({
        word: targetWord,
        didWin: false,
        multiplier,
        depositAmount: Number(_depositAmount),
      });
      setShareText(shareMessage);
      if (status) {
        setGameStart(false);
        setIsClaim(true);
      } else {
        setGameStart(false);
        setIsClaim(true);
      }
    } else {
      // toast.error(`Wrong Guess Multiplier decrease ${multiplier}`);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) {
      showError("Add Some Amount");
      return;
    }
    let status = await depositPlay(depositAmount);
    if (status) {
      setGameStart(true);
    } else {
      setGameStart(false);
    }
  };
  const resetGame = () => {
    const emptyBoard = Array.from({ length: maxAttempts }, () =>
      Array(5).fill("")
    ); // Clear the board
    setBoard(emptyBoard);
    setCurrentGuess("");
    setAttempts(0);
    setUsedKeys({});
    setMessage("");
    setMultiplier(5);

    showInfo("Game reset. Ready to start again!");
  };

  const handleClaim = async () => {
    let id = localStorage.getItem("betID");
    let status = await claimReward(Number(id));
    if (status) {
      setIsClaim(false);
      setGameStart(false);
    } else {
      setIsClaim(false);
    }
    resetGame();
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto rounded-lg shadow-lg p-6 flex flex-col hacker-border"
      style={{ backgroundColor: colors.cardBg }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div 
        className="mb-4 p-3 bg-black rounded-lg flex justify-center items-center font-semibold hacker-border glow-red"
        style={{ color: colors.hackerRed }}
      >
        Player
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2 border-4 p-4 mb-6 justify-center">
          {board.map((row, rowIndex) =>
            row.map((letter, i) => {
              const className = (() => {
                if (rowIndex >= attempts) return "border border-gray-800 bg-gray-900 text-gray-700";
                const currentLetter = board[rowIndex][i];
                const targetLetter = targetWord[i];
                if (currentLetter === targetLetter)
                  return "text-white hacker-border glow-red";
                else if (targetWord.includes(currentLetter))
                  return "text-white hacker-border";
                return "bg-gray-900 text-gray-500 border-gray-800";
              })();
              return (
                <div
                  key={`${rowIndex}-${i}`}
                  className={`text-center text-xl font-bold rounded w-12 h-12 flex items-center justify-center ${className}`}
                  style={
                    className.includes("hacker-border glow-red")
                      ? { backgroundColor: colors.hackerRed, borderColor: colors.hackerRed }
                      : className.includes("hacker-border")
                      ? { backgroundColor: colors.cardBg, borderColor: colors.hackerRed }
                      : {}
                  }
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-2 mb-2">
          {gameStart ? (
            <>
              <input
                type="text"
                maxLength={5}
                value={currentGuess}
                className="text-xs px-2 py-2 border-2  rounded"
                onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
                placeholder="Enter your guess"
              />
              <button
                onClick={handleSubmit}
                className="retro rbtn-small text-xs mb-4"
              >
                Try
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={depositAmount}
                name="depositAmount"
                className="text-xs px-2 py-2 border-2  rounded"
                onChange={(e) => setDepositAmout(e.target.value)}
                placeholder="Place your amount to play"
              />
              <button
                onClick={handleDeposit}
                className="retro rbtn-small text-xs mb-4"
              >
                Start Play
              </button>
            </>
          )}
          {isClaim && (
            <>
              <button
                onClick={handleClaim}
                className="retro rbtn-small text-xs mb-4"
              >
                claim Amount
              </button>

             
            </>
          )}
           {shareText && (
              <button 
                className="retro rbtn-small text-xs mb-4"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: "Base Word Game",
                        text: shareText,
                      });
                    } catch (err) {
                      // User cancelled or error occurred
                    }
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(shareText);
                    showSuccess("Share text copied to clipboard!");
                  }
                }}
              >
                Share Result
              </button>
            )}
        </div>

        <p className="text-xs text-red-400 mb-2">{message}</p>

        <div className="grid grid-cols-13 gap-1 text-xs">
          {[...Array(26)].map((_, i) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <div
                key={letter}
                className={`text-center border rounded p-1 ${
                  usedKeys[letter] || "bg-white"
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-8 mb-4">
          <h1 className="text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>Winning Multiplier</h1>
          <div 
            className="text-white px-3 py-1 rounded font-bold text-xs hacker-border glow-red"
            style={{ backgroundColor: colors.hackerRed }}
          >
            {multiplier}x
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>Max Attempts</h1>
          <div 
            className="text-white px-3 py-1 rounded font-bold text-xs hacker-border glow-red"
            style={{ backgroundColor: colors.hackerRed }}
          >
            {maxAttempts}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xs font-bold uppercase" style={{ color: colors.textSecondary }}>Balance</h1>
          <div 
            className="text-white px-3 py-1 rounded font-bold text-xs hacker-border glow-red"
            style={{ backgroundColor: colors.hackerRed }}
          >
            N/A
          </div>
        </div>
      </div>
    </motion.div>
  );
}
