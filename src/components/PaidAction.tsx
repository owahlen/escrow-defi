import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import Button from "@mui/material/Button";
import { useEthers, useNotifications } from "@usedapp/core";
import { useSeller } from "../hooks/useSeller";
import { useConfirmReceived } from "../hooks/useConfirmReceived";
import { useRefund } from "../hooks/useRefund";

export const PaidAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { notifications } = useNotifications();
  const { send: confirmReceivedSend, state: confirmReceivedState } =
    useConfirmReceived();
  const { send: refundSend, state: refundState } = useRefund();
  const [showConfirmReceivedSuccess, setShowConfirmReceivedSuccess] =
    useState(false);

  useEffect(() => {
    // success snackbar
    if (
      notifications.filter(
        (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Refund"
      ).length > 0
    ) {
      !showConfirmReceivedSuccess && setShowConfirmReceivedSuccess(true);
    }
  }, [notifications, showConfirmReceivedSuccess]);

  const handleConfirmReceivedClick = () => {
    confirmReceivedSend();
  };

  const handleRefundClick = () => {
    refundSend();
  };

  const handleCloseSnack = () => {
    showConfirmReceivedSuccess && setShowConfirmReceivedSuccess(false);
  };

  const isMining =
    confirmReceivedState.status === "Mining" || refundState.status === "Mining";

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
            onClick={() => handleRefundClick()}
            disabled={isMining}
          >
            Refund
          </Button>
        ) : (
          <Button
            sx={{ display: "block", marginTop: "1em" }}
            color="primary"
            variant="contained"
            onClick={() => handleConfirmReceivedClick()}
            disabled={isMining}
          >
            Confirm Reception
          </Button>
        )}
        {isMining ? <CircularProgress size={26} /> : "Starting refund"}
      </Box>
      <Snackbar
        open={showConfirmReceivedSuccess}
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
