import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import Button from "@mui/material/Button";
import { useEthers, useNotifications } from "@usedapp/core";
import { useSeller } from "../hooks/useSeller";
import { usePayout } from "../hooks/usePayout";

export const SettledAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { notifications } = useNotifications();
  const { send: payoutSend, state: payoutState } = usePayout();
  const [showPayoutSuccess, setShowPayoutSuccess] = useState(false);

  useEffect(() => {
    // success snackbar
    if (
      notifications.filter(
        (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Refund"
      ).length > 0
    ) {
      !showPayoutSuccess && setShowPayoutSuccess(true);
    }
  }, [notifications, showPayoutSuccess]);

  const handlePayoutClick = () => {
    payoutSend();
  };

  const handleCloseSnack = () => {
    showPayoutSuccess && setShowPayoutSuccess(false);
  };

  const isMining = payoutState.status === "Mining";

  const isOwner = account === seller;

  return (
    <>
      <Box
        sx={{
          alignItems: "center",
        }}
      >
        {isOwner ? (
          <Button
            sx={{ display: "block", marginTop: "1em" }}
            color="primary"
            variant="contained"
            onClick={() => handlePayoutClick()}
            disabled={isMining}
          >
            Payout
          </Button>
        ) : (
          <Box>Thank you for your purchase</Box>
        )}
        {isMining ? <CircularProgress size={26} /> : "Starting refund"}
      </Box>
      <Snackbar
        open={showPayoutSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity="success">
          Confirm Received successful!
        </Alert>
      </Snackbar>
    </>
  );
};
