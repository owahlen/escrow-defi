import Box from "@mui/material/Box";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Alert, CircularProgress, Snackbar, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { useSetPrice } from "../hooks/useSetPrice";
import { useNotifications } from "@usedapp/core";
import { utils } from "ethers";

interface InactiveActionsProps {
  address: string;
}

export const InactiveAction = ({ address }: InactiveActionsProps) => {
  const { notifications } = useNotifications();
  const [price, setPrice] = useState("");
  const { send: setPriceSend, state: setPriceState } = useSetPrice();

  const handleChange = (
    v: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = v.target.value;
    const regex = /^([0-9]*|[0-9]+\.[0-9]*)$/;
    if (value.match(regex)) {
      setPrice(value);
    }
  };

  const handleSetPriceClick = () => {
    const priceWei = utils.parseEther(price);
    const collateralWei = priceWei.mul(2);
    setPriceSend(priceWei, { value: collateralWei });
  };

  const [showSetPriceSuccess, setShowSetPriceSuccess] = useState(false);

  const handleCloseSnack = () => {
    showSetPriceSuccess && setShowSetPriceSuccess(false);
  };

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
          value={price}
          onChange={(v) => handleChange(v)}
        />
        <Button
          sx={{ display: "block", marginTop: "1em" }}
          color="primary"
          variant="contained"
          onClick={() => handleSetPriceClick()}
          disabled={price === "" || isMining}
        >
          Set Price
        </Button>
        {isMining ? (
          <CircularProgress size={26} />
        ) : (
          `Setting price to ${price}`
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
