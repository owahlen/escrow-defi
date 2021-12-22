import Box from "@mui/material/Box";
import React from "react";

const stateStringMap = new Map<number | undefined, string>([
  [0, "Inactive"],
  [1, "Priced"],
  [2, "Paid"],
  [3, "Settled"],
]);

interface ContractDetailsProps {
  address?: string;
  balance?: number;
  price?: number;
  escrowState?: number;
}

export const ContractDetails = ({
  address,
  balance,
  price,
  escrowState,
}: ContractDetailsProps) => {
  const stateString = stateStringMap.get(escrowState);
  return (
    <Box sx={{ color: "common.white", textAlign: "center", p: 4 }}>
      <h1>Contract Details</h1>
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
  );
};
