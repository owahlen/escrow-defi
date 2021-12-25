import { useContractCall, useEthers } from "@usedapp/core";
import { prepareContractCall } from "../blockchain/contract-utils";

/**
 * Get the escrow state by the user in the Escrow contract
 */
export const useEscrowState = (): number | undefined => {
  const { chainId } = useEthers();
  const call = prepareContractCall(chainId, "Escrow", "state", []);
  const [state] = useContractCall(call) ?? [];
  return state;
};
