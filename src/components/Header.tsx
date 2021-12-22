import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useEthers } from "@usedapp/core";

export const Header = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const isConnected = account !== undefined;
  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
      }}
    >
      {isConnected ? (
        <>
          <Button color="primary" variant="contained">
            {`${account?.slice(0, 4)}...${account?.slice(-3)}`}
          </Button>
          <Button variant="contained" onClick={deactivate}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          color="primary"
          variant="contained"
          onClick={() => activateBrowserWallet()}
        >
          Connect
        </Button>
      )}
    </Box>
  );
};
