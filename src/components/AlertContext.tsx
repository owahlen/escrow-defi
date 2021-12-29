import React, { createContext, SyntheticEvent, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type Severity = "success" | "warning" | "error";
type AutoHideDuration = number | null;

type AlertState = {
  id?: string;
  open: boolean;
  severity: Severity;
  message: string;
  autoHideDuration?: AutoHideDuration;
};

type AlertContextInterface = {
  alertSuccess: (
    message: string,
    id?: string,
    autoHideDuration?: number
  ) => void;
  alertError: (
    message: string,
    id?: string,
    autoHideDuration?: AutoHideDuration
  ) => void;
  alertWarning: (
    message: string,
    id?: string,
    autoHideDuration?: AutoHideDuration
  ) => void;
  closeAlert: () => void;
  getAlertState: () => AlertState;
};

const initialState: AlertState = {
  id: undefined,
  open: false,
  severity: "success",
  message: "",
  autoHideDuration: 5000,
};

const AlertContext = createContext<AlertContextInterface>({
  alertSuccess: () => {},
  alertError: () => {},
  alertWarning: () => {},
  closeAlert: () => {},
  getAlertState: () => initialState,
});

const AlertProvider: React.FC = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>(initialState);

  const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      // reason is set by the Snackbar: https://mui.com/api/snackbar/
      // other valid reasons are "timeout" or "escapeKeyDown"
      return;
    }
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const openAlert = (
    severity: Severity,
    message: string,
    id?: string,
    autoHideDuration?: AutoHideDuration
  ) => {
    const _id = id === undefined ? initialState.id : id;
    const _autoHideDuration =
      autoHideDuration === undefined
        ? initialState.autoHideDuration
        : autoHideDuration;
    if (
      alertState.id !== _id ||
      !alertState.open ||
      alertState.severity !== severity ||
      alertState.message !== message ||
      alertState.autoHideDuration !== _autoHideDuration
    ) {
      setAlertState({
        id: _id,
        open: true,
        severity: severity,
        message: message,
        autoHideDuration: _autoHideDuration,
      });
    }
  };

  const closeAlert = () => {
    if (alertState.open) {
      setAlertState(initialState);
    }
  };

  const alertSuccess = (
    message: string,
    id?: string,
    autoHideDuration?: AutoHideDuration
  ) => {
    openAlert("success", message, id, autoHideDuration);
  };

  const alertWarning = (
    message: string,
    id?: string,
    autoHideDuration?: AutoHideDuration
  ) => {
    openAlert("warning", message, id, autoHideDuration);
  };

  const alertError = (
    message: string,
    id?: string,
    autoHideDuration?: AutoHideDuration
  ) => {
    openAlert("error", message, id, autoHideDuration);
  };

  const getAlertState = () => alertState;

  return (
    <AlertContext.Provider
      value={{
        alertSuccess,
        alertError,
        alertWarning,
        closeAlert,
        getAlertState,
      }}
    >
      {children}
      <Snackbar
        open={alertState.open}
        autoHideDuration={alertState.autoHideDuration}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={alertState.severity}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export { AlertContext, AlertProvider };
