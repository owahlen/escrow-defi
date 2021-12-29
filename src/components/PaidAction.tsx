import Box from "@mui/material/Box";
import React, { useContext, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import { useEthers, useNotifications } from "@usedapp/core";
import { useSeller } from "../hooks/useSeller";
import { useConfirmReceived } from "../hooks/useConfirmReceived";
import { useRefund } from "../hooks/useRefund";
import { AlertContext } from "./AlertContext";

type uiTransactionStatus = "inactive" | "transacting" | "succeeded" | "failed";

export const PaidAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { notifications } = useNotifications();
  const { send: confirmReceivedSend, state: confirmReceivedState } =
    useConfirmReceived();
  const { send: refundSend, state: refundState } = useRefund();
  const [uiTransactionStatus, setUiTransactionStatus] =
    useState<uiTransactionStatus>("inactive");

  useEffect(() => {
    if (uiTransactionStatus === "transacting") {
      switch (confirmReceivedState.status) {
        case "Success":
          // wait for confirmation
          if (
            notifications.find(
              (n) =>
                n.type === "transactionSucceed" &&
                n.receipt.transactionHash ===
                  confirmReceivedState.transaction?.hash &&
                n.receipt.confirmations > 0
            )
          ) {
            alertSuccess("Reception successfully confirmed!");
            setUiTransactionStatus("succeeded");
          }
          break;
        case "Fail":
        case "Exception":
          alertError("Confirmation of reception failed!");
          console.error(
            "Confirmation of reception failed: ",
            confirmReceivedState.errorMessage
          );
          setUiTransactionStatus("failed");
      }
      switch (refundState.status) {
        case "Success":
          // wait for confirmation
          if (
            notifications.find(
              (n) =>
                n.type === "transactionSucceed" &&
                n.receipt.transactionHash === refundState.transaction?.hash &&
                n.receipt.confirmations > 0
            )
          ) {
            alertSuccess("Refund successful!");
            setUiTransactionStatus("succeeded");
          }
          break;
        case "Fail":
        case "Exception":
          alertError("Refund failed!");
          console.error("Refund failed: ", refundState.errorMessage);
          setUiTransactionStatus("failed");
      }
    }
  }, [
    alertError,
    alertSuccess,
    confirmReceivedState.errorMessage,
    confirmReceivedState.status,
    confirmReceivedState.transaction?.hash,
    notifications,
    refundState.errorMessage,
    refundState.status,
    refundState.transaction?.hash,
    uiTransactionStatus,
  ]);

  const handleConfirmReceivedClick = () => {
    (async () => {
      // wait for Metamask to close
      await confirmReceivedSend();
      setUiTransactionStatus("transacting");
    })();
  };

  const handleRefundClick = () => {
    (async () => {
      // wait for Metamask to close
      await refundSend();
      setUiTransactionStatus("transacting");
    })();
  };

  const isOwner = account === seller;
  const confirmReceivedTxStatus = confirmReceivedState.status;
  const refundTxStatus = refundState.status;
  const disableInputs =
    uiTransactionStatus === "transacting" ||
    uiTransactionStatus === "succeeded" ||
    confirmReceivedTxStatus === "Mining" ||
    refundTxStatus === "Mining";

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
            onClick={() => handleRefundClick()}
            disabled={disableInputs}
          >
            Refund
          </Button>
          {refundTxStatus === "None" &&
            "Cancel the purchase and refund the buyer."}
          {refundTxStatus === "Mining" && <CircularProgress size={26} />}
          {refundTxStatus === "Success" && "Refunding the buyer..."}
          {(refundTxStatus === "Fail" || refundTxStatus === "Exception") &&
            "Refunding failed!"}
        </>
      ) : (
        <>
          <Button
            sx={{ display: "block", marginTop: "1em" }}
            color="primary"
            variant="contained"
            onClick={() => handleConfirmReceivedClick()}
            disabled={disableInputs}
          >
            Confirm Reception
          </Button>
          {confirmReceivedTxStatus === "None" &&
            "Confirm the reception of the product."}
          {confirmReceivedTxStatus === "Mining" && (
            <CircularProgress size={26} />
          )}
          {confirmReceivedTxStatus === "Success" && "Sending confirmation..."}
          {(confirmReceivedTxStatus === "Fail" ||
            confirmReceivedTxStatus === "Exception") &&
            "Confirmation failed!"}
        </>
      )}
    </Box>
  );
};
