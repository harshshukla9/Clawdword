"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { colors } from "@/theme";

export default function Chat() {
  // Initialize with dummy messages from genesis
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: string; timestamp: Date }>>([
    {
      id: 1,
      text: "Welcome to the word game! Let's start guessing! 🎮",
      sender: "System",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: 2,
      text: "Has anyone figured out today's word yet?",
      sender: "0x4a2b...c8d9",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    },
    {
      id: 3,
      text: "I'm on my 3rd guess, getting closer! 💪",
      sender: "0x7f3e...a1b2",
      timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
    },
    {
      id: 4,
      text: "The prize pool is looking good today!",
      sender: "0x9c5d...e3f4",
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    },
    {
      id: 5,
      text: "Good luck everyone! May the best guesser win 🍀",
      sender: "0x2b8a...f6c7",
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { address } = useAccount();

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: address ? address.slice(0, 6) + "..." + address.slice(-4) : "Guest",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="h-full flex flex-col text-white border-l rounded-l-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      <div 
        className="border-b px-4 py-3 flex items-center justify-between rounded-tl-lg"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.cardBorder 
        }}
      >
        <h2 className="text-lg font-bold">All Chat</h2>
        <div 
          className="w-4 h-4 border-2 rounded-full"
          style={{ borderColor: colors.somniaPurple }}
        ></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center mt-2" style={{ color: colors.muted }}>
            <div 
              className="rounded-lg px-4 py-3 inline-block"
              style={{ backgroundColor: colors.somniaPurple }}
            >
              <p className="text-sm text-white">
                Welcome to the crypto game chat, {address ? address.slice(0, 6) + "..." + address.slice(-4) : "Guest"}!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: colors.muted }}>{message.sender}</span>
                <span className="text-xs" style={{ color: colors.muted, opacity: 0.7 }}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div 
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: colors.cardBorder }}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div 
        className="border-t p-4 rounded-bl-lg"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.cardBorder 
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: colors.cardBg, 
              border: `1px solid ${colors.cardBorder}`,
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = colors.somniaPurple}
            onBlur={(e) => e.currentTarget.style.borderColor = colors.cardBorder}
          />
          <button
            onClick={handleSendMessage}
            className="text-white px-4 py-2 rounded-lg transition-opacity"
            style={{ backgroundColor: colors.somniaPurple }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
