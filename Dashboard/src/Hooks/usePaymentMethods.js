import { useCallback, useEffect, useState } from "react";
import { paymentMethodService } from "../services/paymentMethodService";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // ==========================================
  // Load Payment Methods
  // ==========================================

  const loadPaymentMethods =
    useCallback(async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const data =
          await paymentMethodService.getPaymentMethods();

        setPaymentMethods(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          "Failed to load payment methods."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // ==========================================
  // Add
  // ==========================================

  const addPaymentMethod = async (data) => {
    await paymentMethodService.addPaymentMethod(
      data
    );

    await loadPaymentMethods(false);
  };

  // ==========================================
  // Update
  // ==========================================

  const updatePaymentMethod = async (
    id,
    data
  ) => {
    await paymentMethodService.updatePaymentMethod(
      id,
      data
    );

    await loadPaymentMethods(false);
  };

  // ==========================================
  // Delete
  // ==========================================

  const deletePaymentMethod =
    async (id) => {
      await paymentMethodService.deletePaymentMethod(
        id
      );

      await loadPaymentMethods(false);
    };

  // ==========================================
  // Toggle Status
  // ==========================================

  const toggleStatus = async (
    id,
    status
  ) => {
    await paymentMethodService.toggleStatus(
      id,
      status
    );

    await loadPaymentMethods(false);
  };

  // ==========================================
  // Change Priority
  // ==========================================

  const changePriority = async (
    id,
    priority
  ) => {
    await paymentMethodService.changePriority(
      id,
      priority
    );

    await loadPaymentMethods(false);
  };

  // ==========================================
  // Set Default
  // ==========================================

  const setDefault = async (id) => {
    await paymentMethodService.setDefault(id);

    await loadPaymentMethods(false);
  };

  // ==========================================
  // Reset
  // ==========================================

  const resetPaymentMethods =
    async () => {
      await paymentMethodService.resetPaymentMethods();

      await loadPaymentMethods(false);
    };

  return {
    paymentMethods,

    loading,
    error,

    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,

    toggleStatus,
    changePriority,
    setDefault,

    resetPaymentMethods,

    refresh: loadPaymentMethods,
  };
}