import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, severity = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, severity }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const success = useCallback((msg) => show(msg, "success"), [show]);
  const error = useCallback((msg) => show(msg, "error"), [show]);
  const info = useCallback((msg) => show(msg, "info"), [show]);
  const warning = useCallback((msg) => show(msg, "warning"), [show]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      {toasts.map((t) => (
        <Snackbar key={t.id} open anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={t.severity} variant="filled" sx={{ minWidth: 240 }}>
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
