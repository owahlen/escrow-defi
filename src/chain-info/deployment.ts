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
    console.warn(`No deployments exist on chain id ${chainId}.`);
    return undefined;
  }
  const networkMap = chainMap[chainIdString];
  const networks = Object.keys(networkMap);
  if (networks.length !== 1) {
    console.warn(`No unique networks is associated with chain id ${chainId}.`);
    return undefined;
  }
  const network = networkMap[networks[0]];
  const contractMap = network.contracts;
  if (!(name in contractMap)) {
    console.warn(
      `Contract '${name}' is not deployed on network '${network.name}' (chain id ${chainId}).`
    );
    return undefined;
  }
  return contractMap[name];
};
