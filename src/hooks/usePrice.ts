import { useContractCall, useEthers } from "@usedapp/core";
import { prepareContractCall } from "../blockchain/contract-utils";
import { utils } from "ethers";

/**
 * Get the price configured in the escrow
 */
export const usePrice = (): string | undefined => {
  const { chainId } = useEthers();
  const call = prepareContractCall(chainId, "Escrow", "price", []);
  const [price] = useContractCall(call) ?? [];
  return price ? utils.formatEther(price) : undefined;
};
