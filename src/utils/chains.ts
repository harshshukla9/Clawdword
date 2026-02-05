import { http } from "viem";
import { baseMainnet } from "@/app/config/chains";

export const chainArray = [baseMainnet];
export const transportsObject = {
  [baseMainnet.id]: http()
};
