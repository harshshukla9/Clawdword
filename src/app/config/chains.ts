export const baseMainnet = {
  id: 8453,
  name: "Base Mainnet",
  iconUrl: "https://base.org/favicon.ico",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.base.org"] },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://basescan.org",
    },
  },
};
