import { useContractFunction, useEthers } from "@usedapp/core";
import { prepareContract } from "../blockchain/contract-utils";

/**
 * Expose { send, state, events } object to facilitate calling confirmReceived on escrow
 */
export const useConfirmReceived = () => {
  const { chainId } = useEthers();
  const contract = prepareContract(chainId, "Escrow");
  if (!contract) {
    throw Error("Escrow contract not found");
  }
  return useContractFunction(contract, "confirmReceived", {
    transactionName: "Confirm Received",
  });
};
