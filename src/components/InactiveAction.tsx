import Box from "@mui/material/Box";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { useSetPrice } from "../hooks/useSetPrice";
import { useEthers, useNotifications } from "@usedapp/core";
import { utils } from "ethers";
import { AlertContext } from "./AlertContext";
import { useSeller } from "../hooks/useSeller";

type uiTransactionStatus = "inactive" | "transacting" | "succeeded" | "failed";

export const InactiveAction = () => {
  const { account } = useEthers();
  const seller = useSeller();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { notifications } = useNotifications();
  const [priceEth, setPriceEth] = useState("");
  const { send: setPriceSend, state: setPriceTxState } = useSetPrice();
  const [uiTransactionStatus, setUiTransactionStatus] =
    useState<uiTransactionStatus>("inactive");

  useEffect(() => {
    if (uiTransactionStatus === "transacting") {
      switch (setPriceTxState.status) {
        case "Success":
          // wait for confirmation
          if (
            notifications.find(
              (n) =>
                n.type === "transactionSucceed" &&
                n.receipt.transactionHash ===
                  setPriceTxState.transaction?.hash &&
                n.receipt.confirmations > 0
            )
          ) {
            alertSuccess("Price set successfully!");
            setUiTransactionStatus("succeeded");
          }
          break;
        case "Fail":
        case "Exception":
          alertError("Price set failed!");
          console.error("SetPrice failed: ", setPriceTxState.errorMessage);
          setUiTransactionStatus("failed");
      }
    }
  }, [
    alertError,
    alertSuccess,
    notifications,
    uiTransactionStatus,
    setPriceTxState,
  ]);

  const handleChange = (
    v: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = v.target.value;
    const regex = /^([0-9]*|[0-9]+\.[0-9]*)$/;
    if (value.match(regex)) {
      setPriceEth(value);
    }
  };

  const handleSetPriceClick = () => {
    const priceWei = utils.parseEther(priceEth);
    const collateralWei = priceWei.mul(2);
    (async () => {
      // wait for Metamask to close
      await setPriceSend(priceWei, { value: collateralWei });
      setUiTransactionStatus("transacting");
    })();
  };

  const isOwner = account === seller;
  const txStatus = setPriceTxState.status;
  const disableInputs =
    uiTransactionStatus === "transacting" ||
    uiTransactionStatus === "succeeded" ||
    txStatus === "Mining";

  return isOwner ? (
    <>
      <Box
        sx={{
          alignItems: "center",
        }}
      >
        <TextField
          id="price"
          label="Set the car price"
          value={priceEth}
          onChange={(v) => handleChange(v)}
          disabled={disableInputs}
        />
        <Button
          sx={{ display: "block", marginTop: "1em" }}
          color="primary"
          variant="contained"
          onClick={() => handleSetPriceClick()}
          disabled={priceEth === "" || disableInputs}
        >
          Set Price
        </Button>
        {txStatus === "None" &&
          "Set the car's price in ETH and pay twice the price as collateral."}
        {txStatus === "Mining" && <CircularProgress size={26} />}
        {txStatus === "Success" && "Setting the price..."}
        {(txStatus === "Fail" || txStatus === "Exception") &&
          "Failed to set price!"}
      </Box>
    </>
  ) : (
    <Box
      sx={{
        alignItems: "center",
      }}
    >
      Only the owner of the contract can set the price. Try connecting with a
      different account.
    </Box>
  );
};
