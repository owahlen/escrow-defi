import React, { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ContractDetails } from "./ContractDetails";
import { useEscrowState } from "../hooks/useEscrowState";
import { useEscrowBalance } from "../hooks/useEscrowBalance";
import { usePrice } from "../hooks/usePrice";
import { getContractAddress } from "../blockchain/contract-utils";

export const Main = () => {
  const { chainId, error } = useEthers();

  const [showNetworkError, setShowNetworkError] = useState(false);

  const escrowBalance = useEscrowBalance();
  const price = usePrice();
  const escrowState = useEscrowState();

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

  const escrowAddress = getContractAddress(chainId, "Escrow");

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
      <ContractDetails
        address={escrowAddress}
        balance={escrowBalance}
        price={price}
        escrowState={escrowState}
      />
      <Snackbar
        open={showNetworkError}
        autoHideDuration={5000}
        onClose={handleCloseNetworkError}
      >
        <Alert onClose={handleCloseNetworkError} severity="warning">
          You have to connect to the Hardhat network!
        </Alert>
      </Snackbar>
    </>
  );
};
