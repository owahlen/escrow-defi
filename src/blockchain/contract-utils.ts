import { utils } from "ethers";
import { getDeployedContract } from "../chain-info/deployment";

export const prepareCall = (
  chainId: number | undefined,
  contractName: string,
  method: string,
  args: any[]
) => {
  if (!chainId) {
    return false;
  }
  const contract = getDeployedContract(contractName, chainId);
  const escrowInterface = contract
    ? new utils.Interface(contract.abi)
    : undefined;
  return escrowInterface
    ? {
        abi: escrowInterface,
        address: contract!.address,
        method: method,
        args: args,
      }
    : false;
};

export const getContractAddress = (
  chainId: number | undefined,
  contractName: string
): string | undefined => {
  if (!chainId) {
    return undefined;
  }
  const contract = getDeployedContract(contractName, chainId);
  return contract?.address;
};
