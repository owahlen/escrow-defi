import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";

export const Header = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const ens = useLookupAddress();
  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
      }}
    >
      {account ? (
        <>
          <Button color="secondary" variant="contained">
            {ens ?? shortenAddress(account)}
          </Button>
          <Button color="primary" variant="contained" onClick={deactivate}>
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
