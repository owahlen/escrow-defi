import React from "react";
import "./App.css";
import map from "./chain-info/map.json";

// https://github.com/PatrickAlphaC/defi-stake-yield-brownie/tree/main/front_end
// https://github.com/steadylearner/blockchain/tree/main/real/eth
import { Config, DAppProvider, Hardhat, Mainnet } from "@usedapp/core";
import { Main } from "./fragments/Main";
import { Header } from "./fragments/Header";
import { Container } from "@mui/material";

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  networks: [Hardhat],
  multicallAddresses: {
    [Hardhat.chainId]: map.contracts.Multicall.address,
  },
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
