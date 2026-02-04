import { http } from "viem";
import { monadTestnet, monadMainnet } from "@/app/config/chains";

export const chainArray = [monadTestnet, monadMainnet];
export const transportsObject = {
  [monadTestnet.id]: http(),
  [monadMainnet.id]: http()
};
