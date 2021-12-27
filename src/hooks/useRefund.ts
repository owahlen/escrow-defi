import { useContractFunction, useEthers } from "@usedapp/core";
import { prepareContract } from "../blockchain/contract-utils";

/**
 * Expose { send, state, events } object to facilitate calling refund on escrow
 */
export const useRefund = () => {
  const { chainId } = useEthers();
  const contract = prepareContract(chainId, "Escrow");
  if (!contract) {
    throw Error("Escrow contract not found");
  }
  return useContractFunction(contract, "refund", {
    transactionName: "Refund",
  });
};
