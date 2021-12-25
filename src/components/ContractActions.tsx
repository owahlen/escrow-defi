import Box from "@mui/material/Box";
import React from "react";
import { InactiveAction } from "./InactiveAction";

interface ContractActionsProps {
  chainId?: number;
  address?: string;
  balance?: string;
  price?: string;
  escrowState?: number;
}

export const ContractActions = ({
  chainId,
  address,
  balance,
  price,
  escrowState,
}: ContractActionsProps) => {
  let actionComponent;
  if (!address) {
    actionComponent = <></>;
  } else {
    switch (escrowState) {
      case 0: // Inactive
        actionComponent = InactiveAction({ address });
        break;
      /*     case 1: // Priced
      actionComponent = PricedAction();
      break;
    case 2: // Paid
      actionComponent = PaidAction();
      break;
    case 3: // Settled
      actionComponent = SettledAction();
      break; */
      default:
        // undefined
        actionComponent = <></>;
    }
  }
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
        {actionComponent}
      </Box>
    </Box>
  );
};
