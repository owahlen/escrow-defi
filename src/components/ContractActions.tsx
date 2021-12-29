import Box from "@mui/material/Box";
import React, { useEffect } from "react";
import { InactiveAction } from "./InactiveAction";
import { PricedAction } from "./PricedAction";
import { useEscrowState } from "../hooks/useEscrowState";
import { PaidAction } from "./PaidAction";
import { SettledAction } from "./SettledAction";
import { useNotifications } from "@usedapp/core";

export const ContractActions = () => {
  const escrowState = useEscrowState();
  const { notifications } = useNotifications();

  useEffect(() => {}, [notifications]);

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
        {escrowState === 0 && <InactiveAction />}
        {escrowState === 1 && <PricedAction />}
        {escrowState === 2 && <PaidAction />}
        {escrowState === 3 && <SettledAction />}
      </Box>
    </Box>
  );
};
