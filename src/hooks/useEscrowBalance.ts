import { useEtherBalance, useEthers } from "@usedapp/core";
import { getContractAddress } from "../blockchain/contract-utils";

/**
 * Get the balance of the Escrow contract
 */
export const useEscrowBalance = (): number | undefined => {
  const { chainId } = useEthers();
  const contractAddress = getContractAddress(chainId, "Escrow");
  return useEtherBalance(contractAddress)?.toNumber();
};
