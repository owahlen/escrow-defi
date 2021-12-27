import { useEthers } from "@usedapp/core";
import { getDeployedContract } from "../chain-info/deployment";

/**
 * Get the address of the Escrow contract
 */
export const useEscrowAddress = (): string | undefined => {
  const { chainId } = useEthers();
  if (!chainId) {
    return undefined;
  }
  const contract = getDeployedContract("Escrow", chainId);
  return contract?.address;
};
