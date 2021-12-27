import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import Button from "@mui/material/Button";
import { useEthers, useNotifications } from "@usedapp/core";
import { usePayout } from "../hooks/usePayout";
import { usePay } from "../hooks/usePay";
import { useSeller } from "../hooks/useSeller";
import { usePrice } from "../hooks/usePrice";

export const PricedAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { notifications } = useNotifications();
  const { send: payoutSend, state: payoutState } = usePayout();
  const { send: paySend, state: payState } = usePay();
  const price = usePrice();
  const [showPayoutSuccess, setShowPayoutSuccess] = useState(false);

  useEffect(() => {
    // success snackbar
    if (
      notifications.filter(
        (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Payout"
      ).length > 0
    ) {
      !showPayoutSuccess && setShowPayoutSuccess(true);
    }
  }, [notifications, showPayoutSuccess]);

  const handlePayoutClick = () => {
    payoutSend();
  };

  const handlePayClick = () => {
    if (!price) {
      throw Error("Price to pay is not defined");
    }
    const collateralWei = price.mul(2);
    paySend({ value: collateralWei });
  };

  const handleCloseSnack = () => {
    showPayoutSuccess && setShowPayoutSuccess(false);
  };

  const isMining =
    payoutState.status === "Mining" || payState.status === "Mining";

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
          <Button
            sx={{ display: "block", marginTop: "1em" }}
            color="primary"
            variant="contained"
            onClick={() => handlePayClick()}
            disabled={isMining}
          >
            Pay
          </Button>
        )}
        {isMining ? <CircularProgress size={26} /> : "Starting payout"}
      </Box>
      <Snackbar
        open={showPayoutSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity="success">
          Payout successful!
        </Alert>
      </Snackbar>
    </>
  );
};
