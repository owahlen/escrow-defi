import { useContractCall, useEthers } from "@usedapp/core";
import { prepareContractCall } from "../blockchain/contract-utils";

/**
 * Get the seller configured in the escrow
 */
export const useSeller = (): string | undefined => {
  const { chainId } = useEthers();
  const call = prepareContractCall(chainId, "Escrow", "seller", []);
  const [seller] = useContractCall(call) ?? [];
  return seller;
};
