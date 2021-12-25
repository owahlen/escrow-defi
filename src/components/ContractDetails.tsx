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
  balance?: string;
  price?: string;
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
          <Box>{price} ETH</Box>
          <Box sx={{ fontWeight: "bold" }}>Escrow balance:</Box>
          <Box>{balance} ETH</Box>
          <Box sx={{ fontWeight: "bold" }}>Contract address:</Box>
          <Box>{address}</Box>
          <Box sx={{ fontWeight: "bold" }}>Contract state:</Box>
          <Box>{stateString}</Box>
        </Box>
      </Box>
    </Box>
  );
};
