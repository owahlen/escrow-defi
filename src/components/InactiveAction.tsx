import Box from "@mui/material/Box";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Alert, CircularProgress, Snackbar, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { useSetPrice } from "../hooks/useSetPrice";
import { useNotifications } from "@usedapp/core";
import { utils } from "ethers";

export const InactiveAction = () => {
  const { notifications } = useNotifications();
  const [priceEth, setPriceEth] = useState("");
  const { send: setPriceSend, state: setPriceState } = useSetPrice();
  const [showSetPriceSuccess, setShowSetPriceSuccess] = useState(false);

  useEffect(() => {
    if (
      notifications.filter(
        (notification) =>
          notification.type === "transactionSucceed" &&
          notification.transactionName === "Set Price"
      ).length > 0
    ) {
      !showSetPriceSuccess && setShowSetPriceSuccess(true);
    }
  }, [notifications, showSetPriceSuccess]);

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
    setPriceSend(priceWei, { value: collateralWei });
  };

  const handleCloseSnack = () => {
    showSetPriceSuccess && setShowSetPriceSuccess(false);
  };

  const isMining = setPriceState.status === "Mining";

  return (
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
        />
        <Button
          sx={{ display: "block", marginTop: "1em" }}
          color="primary"
          variant="contained"
          onClick={() => handleSetPriceClick()}
          disabled={priceEth === "" || isMining}
        >
          Set Price
        </Button>
        {isMining ? (
          <CircularProgress size={26} />
        ) : (
          `Setting price to ${priceEth}`
        )}
      </Box>
      <Snackbar
        open={showSetPriceSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity="success">
          Price set successfully!
        </Alert>
      </Snackbar>
    </>
  );
};
