import React, { useContext, useEffect } from "react";
import { Chain, useEthers } from "@usedapp/core";
import Typography from "@mui/material/Typography";
import { ContractDetails } from "./ContractDetails";
import { ContractActions } from "./ContractActions";
import { AlertContext } from "./AlertContext";

export const Main = ({ supportedChains }: { supportedChains: Chain[] }) => {
  const { account, error } = useEthers();
  const { alertError, closeAlert, getAlertState } = useContext(AlertContext);

  /**
   * useEthers will return a populated 'error' field when something has gone wrong.
   * We can inspect the name of this error and conditionally show a notification
   * that the user is connected to the wrong network.
   */
  useEffect(() => {
    const unsupportedChainIdError = "UnsupportedChainIdError";
    if (error && error.name === unsupportedChainIdError) {
      const errorMessage =
        "You have to connect your wallet to one of the supported networks: " +
        supportedChains
          .map((c) => c.chainName + "(" + c.chainId + ")")
          .join(", ");
      alertError(errorMessage, unsupportedChainIdError, null);
    } else {
      // if the unsupportedChainIdError is fixed immediately close the alert
      if (getAlertState().id === unsupportedChainIdError) {
        closeAlert();
      }
    }
  }, [alertError, closeAlert, error, getAlertState, supportedChains]);

  const isConnected = account !== undefined;

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
      {isConnected ? <ContractActions /> : null}
    </>
  );
};
