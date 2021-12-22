import map from "./map.json";

interface DeployedContract {
  address: string;
  abi: any;
}

type ContractMap = {
  [contract: string]: DeployedContract;
};

interface Network {
  name: string;
  chainId: string;
  contracts: ContractMap;
}

type NetworkMap = {
  [network: string]: Network;
};

type ChainMap = {
  [chainId: string]: NetworkMap;
};

export const chainMap: ChainMap = map;

export const getDeployedContract = (
  name: string,
  chainId: number
): DeployedContract | undefined => {
  const chainIdString = String(chainId);
  if (!(chainIdString in chainMap)) {
    console.error(`No deployments exist on chainId ${chainId}`);
    return undefined;
  }
  const networkMap = chainMap[chainIdString];
  const networks = Object.keys(networkMap);
  if (networks.length !== 1) {
    console.error(`No unique networks is associated with chainId ${chainId}`);
    return undefined;
  }
  const network = networkMap[networks[0]];
  const contractMap = network.contracts;
  if (!(name in contractMap)) {
    console.error(
      `Contract ${name} is not deployed on chain with id ${chainId} and network '${network}'`
    );
    return undefined;
  }
  return contractMap[name];
};
