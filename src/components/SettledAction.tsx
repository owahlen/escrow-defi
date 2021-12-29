import Box from "@mui/material/Box";
import React, { useContext, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import { useEthers, useNotifications } from "@usedapp/core";
import { useSeller } from "../hooks/useSeller";
import { usePayout } from "../hooks/usePayout";
import { AlertContext } from "./AlertContext";

type uiTransactionStatus = "inactive" | "transacting" | "succeeded" | "failed";

export const SettledAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { notifications } = useNotifications();
  const { send: payoutSend, state: payoutState } = usePayout();
  const [uiTransactionStatus, setUiTransactionStatus] =
    useState<uiTransactionStatus>("inactive");

  useEffect(() => {
    if (uiTransactionStatus === "transacting") {
      switch (payoutState.status) {
        case "Success":
          // wait for confirmation
          if (
            notifications.find(
              (n) =>
                n.type === "transactionSucceed" &&
                n.receipt.transactionHash === payoutState.transaction?.hash &&
                n.receipt.confirmations > 0
            )
          ) {
            alertSuccess("Payout successful!");
            setUiTransactionStatus("succeeded");
          }
          break;
        case "Fail":
        case "Exception":
          alertError("Payout failed!");
          console.error(
            "Confirmation of reception failed: ",
            payoutState.errorMessage
          );
          setUiTransactionStatus("failed");
      }
    }
  }, [
    alertError,
    alertSuccess,
    notifications,
    payoutState.errorMessage,
    payoutState.status,
    payoutState.transaction?.hash,
    uiTransactionStatus,
  ]);

  const handlePayoutClick = () => {
    (async () => {
      // wait for Metamask to close
      await payoutSend();
      setUiTransactionStatus("transacting");
    })();
  };

  const isOwner = account === seller;
  const payoutTxStatus = payoutState.status;

  return (
    <Box
      sx={{
        alignItems: "center",
      }}
    >
      {isOwner ? (
        <>
          <Button
            sx={{ display: "block", marginTop: "1em" }}
            color="primary"
            variant="contained"
            onClick={() => handlePayoutClick()}
            disabled={
              uiTransactionStatus === "transacting" ||
              uiTransactionStatus === "succeeded"
            }
          >
            Payout
          </Button>
          {payoutTxStatus === "None" && "Withdraw the escrow balance."}
          {payoutTxStatus === "Mining" && <CircularProgress size={26} />}
          {payoutTxStatus === "Success" && "Withdrawing the escrow balance..."}
          {(payoutTxStatus === "Fail" || payoutTxStatus === "Exception") &&
            "Failed to withdraw the escrow balance!"}
        </>
      ) : (
        <>
          <Box>Thank you for your purchase!</Box>
        </>
      )}
    </Box>
  );
};
