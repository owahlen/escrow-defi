import Box from "@mui/material/Box";
import React, { useContext, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import { useEthers, useNotifications } from "@usedapp/core";
import { usePayout } from "../hooks/usePayout";
import { usePay } from "../hooks/usePay";
import { useSeller } from "../hooks/useSeller";
import { usePrice } from "../hooks/usePrice";
import { AlertContext } from "./AlertContext";

type uiTransactionStatus = "inactive" | "transacting" | "succeeded" | "failed";

export const PricedAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { notifications } = useNotifications();
  const { send: payoutSend, state: payoutState } = usePayout();
  const { send: paySend, state: payState } = usePay();
  const price = usePrice();
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
          console.error("Payout failed: ", payoutState.errorMessage);
          setUiTransactionStatus("failed");
      }
      switch (payState.status) {
        case "Success":
          // wait for confirmation
          if (
            notifications.find(
              (n) =>
                n.type === "transactionSucceed" &&
                n.receipt.transactionHash === payState.transaction?.hash &&
                n.receipt.confirmations > 0
            )
          ) {
            alertSuccess("Payment successful!");
            setUiTransactionStatus("succeeded");
          }
          break;
        case "Fail":
        case "Exception":
          alertError("Payment failed!");
          console.error("Payment failed: ", payState.errorMessage);
          setUiTransactionStatus("failed");
      }
    }
  }, [
    alertError,
    alertSuccess,
    notifications,
    payState.errorMessage,
    payState.status,
    payState.transaction?.hash,
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

  const handlePayClick = () => {
    if (!price) {
      throw Error("Price to pay is not defined");
    }
    const collateral = price.mul(2);
    (async () => {
      // wait for Metamask to close
      await paySend({ value: collateral });
      setUiTransactionStatus("transacting");
    })();
  };

  const isOwner = account === seller;
  const payoutTxStatus = payoutState.status;
  const payTxStatus = payState.status;

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
          {payoutTxStatus === "None" &&
            "Cancel the offer and withdraw the escrow balance."}
          {payoutTxStatus === "Mining" && <CircularProgress size={26} />}
          {payoutTxStatus === "Success" && "Withdrawing the escrow balance..."}
          {(payoutTxStatus === "Fail" || payoutTxStatus === "Exception") &&
            "Failed to withdraw the escrow balance!"}
        </>
      ) : (
        <>
          <Button
            sx={{ display: "block", marginTop: "1em" }}
            color="primary"
            variant="contained"
            onClick={() => handlePayClick()}
            disabled={
              uiTransactionStatus === "transacting" ||
              uiTransactionStatus === "succeeded"
            }
          >
            Pay
          </Button>
          {payTxStatus === "None" &&
            "Pay the car price plus twice the price as collateral."}
          {payTxStatus === "Mining" && <CircularProgress size={26} />}
          {payTxStatus === "Success" && "Sending your payment to the escrow..."}
          {(payTxStatus === "Fail" || payTxStatus === "Exception") &&
            "Payment failed!"}
        </>
      )}
    </Box>
  );
};
