import { useContractCall, useEthers } from "@usedapp/core";
import { prepareCall } from "../blockchain/contract-utils";

/**
 * Get the price configured in the escrow
 */
export const usePrice = (): number | undefined => {
  const { chainId } = useEthers();
  const call = prepareCall(chainId, "Escrow", "price", []);
  const [price] = useContractCall(call) ?? [];
  return price?.toNumber();
};
