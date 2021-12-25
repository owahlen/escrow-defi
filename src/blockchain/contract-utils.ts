import { Contract, utils } from "ethers";
import { getDeployedContract } from "../chain-info/deployment";

export const prepareContractCall = (
  chainId: number | undefined,
  contractName: string,
  method: string,
  args: any[]
) => {
  if (!chainId) {
    return false;
  }
  const deployedContract = getDeployedContract(contractName, chainId);
  const contractCallInterface = deployedContract
    ? new utils.Interface(deployedContract.abi)
    : undefined;
  return contractCallInterface
    ? {
        abi: contractCallInterface,
        address: deployedContract!.address,
        method: method,
        args: args,
      }
    : false;
};

export const prepareContract = (
  chainId: number | undefined,
  contractName: string
) => {
  if (!chainId) {
    return false;
  }
  const deployedContract = getDeployedContract(contractName, chainId);
  return deployedContract
    ? new Contract(
        deployedContract.address,
        new utils.Interface(deployedContract.abi)
      )
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
