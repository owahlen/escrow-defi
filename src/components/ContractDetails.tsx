import Box from "@mui/material/Box";
import React from "react";
import { useEthers } from "@usedapp/core";
import { useEscrowState } from "../hooks/useEscrowState";
import { getContractAddress } from "../blockchain/contract-utils";
import { useEscrowBalance } from "../hooks/useEscrowBalance";
import { usePrice } from "../hooks/usePrice";
import { utils } from "ethers";
import { useSeller } from "../hooks/useSeller";

const stateStringMap = new Map<number | undefined, string>([
  [0, "Inactive"],
  [1, "Priced"],
  [2, "Paid"],
  [3, "Settled"],
]);

export const ContractDetails = () => {
  const { account, chainId } = useEthers();
  const seller = useSeller();
  const balance = useEscrowBalance();
  const price = usePrice();
  const escrowState = useEscrowState();
  const address = getContractAddress(chainId, "Escrow");

  const isConnected = account !== undefined;
  const isOwner = account === seller;
  const stateString = stateStringMap.get(escrowState);
  return (
    <Box
      sx={{
        backgroundColor: "common.white",
        borderRadius: "25px",
        marginBlockStart: "1.0em",
        marginBlockEnd: "1.0em",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          p: 4,
        }}
      >
        {isConnected ? (
          <>
            {isOwner ? (
              <h1>You are connected as seller</h1>
            ) : (
              <h1>You are connected as buyer</h1>
            )}
            <Box
              component="img"
              sx={{
                height: 442,
                width: 612,
                maxHeight: { xs: 233, md: 167 },
                maxWidth: { xs: 350, md: 250 },
              }}
              alt="Car for sale."
              src="car.jpeg"
            />
            <Box
              sx={{
                display: "inline-grid",
                gridTemplateColumns: "auto auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Box sx={{ fontWeight: "bold" }}>Car price:</Box>
              <Box>{price ? utils.formatEther(price) : undefined} ETH</Box>
              <Box sx={{ fontWeight: "bold" }}>Escrow balance:</Box>
              <Box>{balance} ETH</Box>
              <Box sx={{ fontWeight: "bold" }}>Contract address:</Box>
              <Box>{address}</Box>
              <Box sx={{ fontWeight: "bold" }}>Contract state:</Box>
              <Box>{stateString}</Box>
            </Box>
          </>
        ) : (
          <Box>Please connect your wallet.</Box>
        )}
      </Box>
    </Box>
  );
};
