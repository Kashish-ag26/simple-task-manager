"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "var(--toast-bg, #fff)",
          color: "var(--toast-color, #334155)",
          fontSize: "14px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        },
        success: {
          iconTheme: { primary: "#6366f1", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
