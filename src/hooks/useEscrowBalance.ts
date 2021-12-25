import { useEtherBalance, useEthers } from "@usedapp/core";
import { getContractAddress } from "../blockchain/contract-utils";
import { utils } from "ethers";

/**
 * Get the balance of the Escrow contract
 */
export const useEscrowBalance = (): string | undefined => {
  const { chainId } = useEthers();
  const contractAddress = getContractAddress(chainId, "Escrow");
  const etherBalance = useEtherBalance(contractAddress);
  return etherBalance ? utils.formatEther(etherBalance) : undefined;
};
