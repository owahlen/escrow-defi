import Box from "@mui/material/Box";
import React from "react";

const stateStringMap = new Map<number | undefined, string>([
  [0, "Inactive"],
  [1, "Priced"],
  [2, "Paid"],
  [3, "Settled"],
]);

interface ContractDetailsProps {
  chainId?: number;
  address?: string;
  balance?: number;
  price?: number;
  escrowState?: number;
}

export const ContractDetails = ({
  chainId,
  address,
  balance,
  price,
  escrowState,
}: ContractDetailsProps) => {
  const stateString = stateStringMap.get(escrowState);
  return (
    <Box>
      <h1 style={{ color: "white" }}>Contract Details</h1>
      <Box
        sx={{
          backgroundColor: "common.white",
          borderRadius: "25px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: "inline-grid",
              gridTemplateColumns: "auto",
              gap: 1,
              alignItems: "center",
            }}
          >
            <p>
              <b>chain ID:</b> {chainId}
            </p>
            <p>
              <b>address:</b> {address}
            </p>
            <p>
              <b>balance:</b> {balance}
            </p>
            <p>
              <b>price:</b> {price}
            </p>
            <p>
              <b>state:</b> {stateString}
            </p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
