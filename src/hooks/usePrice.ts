import { useContractCall, useEthers } from "@usedapp/core";
import { prepareContractCall } from "../blockchain/contract-utils";
import { BigNumber } from "@ethersproject/bignumber";

/**
 * Get the price configured in the escrow
 */
export const usePrice = (): BigNumber | undefined => {
  const { chainId } = useEthers();
  const call = prepareContractCall(chainId, "Escrow", "price", []);
  const [price] = useContractCall(call) ?? [];
  return price;
};
