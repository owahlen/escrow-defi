import React, { useEffect, useState } from "react";
import { Chain, useEthers } from "@usedapp/core";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ContractDetails } from "./ContractDetails";
import { ContractActions } from "./ContractActions";

export const Main = ({ supportedChains }: { supportedChains: Chain[] }) => {
  const { error } = useEthers();

  const [showNetworkError, setShowNetworkError] = useState(false);

  /**
   * useEthers will return a populated 'error' field when something has gone wrong.
   * We can inspect the name of this error and conditionally show a notification
   * that the user is connected to the wrong network.
   */
  useEffect(() => {
    if (error && error.name === "UnsupportedChainIdError") {
      !showNetworkError && setShowNetworkError(true);
    } else {
      showNetworkError && setShowNetworkError(false);
    }
  }, [error, showNetworkError]);

  const handleCloseNetworkError = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    showNetworkError && setShowNetworkError(false);
  };

  return (
    <>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          color: "common.white",
          textAlign: "center",
          p: 4,
        }}
      >
        Car Sale
      </Typography>
      <ContractDetails />
      <ContractActions />
      <Snackbar
        open={showNetworkError}
        autoHideDuration={5000}
        onClose={handleCloseNetworkError}
      >
        <Alert onClose={handleCloseNetworkError} severity="warning">
          You have to connect your wallet to one of the supported networks:{" "}
          {supportedChains
            .map((c) => c.chainName + "(" + c.chainId + ")")
            .join(", ")}
        </Alert>
      </Snackbar>
    </>
  );
};
