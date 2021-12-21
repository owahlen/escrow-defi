import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import map from "../chain-info/map.json";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export const Main = () => {
  const { chainId, error } = useEthers();
  console.log("ChainId: ", chainId);

  const [showNetworkError, setShowNetworkError] = useState(false);

  const handleCloseNetworkError = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    showNetworkError && setShowNetworkError(false);
  };

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

  const contract = new ethers.Contract(
    map.contracts.Escrow.address,
    map.contracts.Escrow.abi
  );

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
      <Box sx={{ color: "common.white", textAlign: "center", p: 4 }}>
        Loaded Escrow contract into address {contract.address}
      </Box>
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
