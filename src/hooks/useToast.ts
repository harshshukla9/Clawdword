"use client";

import { useToastContext } from "@/context/ToastContext";

export function useToast() {
  const { showToast, showSuccess, showError, showInfo, showWarning } = useToastContext();

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
