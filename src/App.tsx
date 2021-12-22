import React from "react";
import "./App.css";

// https://github.com/PatrickAlphaC/defi-stake-yield-brownie/tree/main/front_end
// https://github.com/steadylearner/blockchain/tree/main/real/eth
import { Config, DAppProvider, Hardhat, Mainnet, Rinkeby } from "@usedapp/core";
import { Main } from "./components/Main";
import { Header } from "./components/Header";
import { Container } from "@mui/material";
import { chainMap, getDeployedContract } from "./chain-info/deployment";
import { MulticallAddresses } from "@usedapp/core/src/constants/type/Config";

const getMulticallAddresses = () =>
  Object.keys(chainMap).reduce<MulticallAddresses>((accu, chainIdString) => {
    const chainId = +chainIdString;
    const deployedMulticallContract = getDeployedContract("Multicall", chainId);
    if (deployedMulticallContract) {
      accu[chainId] = deployedMulticallContract.address;
    }
    return accu;
  }, {});

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  networks: [Hardhat, Rinkeby],
  multicallAddresses: getMulticallAddresses(),
};

const App = () => (
  <DAppProvider config={config}>
    <Header />
    <Container maxWidth="md">
      <Main />
    </Container>
  </DAppProvider>
);

export default App;
