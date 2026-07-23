import { useCallback, useEffect, useState } from "react";
import { orderService } from "../services/orderService";

const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
};

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortOrders = (list) =>
    [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const refetch = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);
      const response = await orderService.getOrders();
      if (response && response.success === false) {
        throw new Error(response.message || "حدث خطأ من الخادم");
      }
      setOrders(sortOrders(response.data || response || []));
    } catch (err) {
      console.error("useOrders Error:", err);
      setError(extractErrorMessage(err, "حدث خطأ أثناء تحميل الطلبات."));
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateOrderStatus = useCallback(async (id, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(id, newStatus);
      if (response && response.success === false) {
        throw new Error(response.message || "فشل تحديث حالة الطلب");
      }
      const updatedOrder = response.data || response;
      if (updatedOrder && updatedOrder.id) {
        setOrders((prev) =>
          prev.map((o) => (String(o.id) === String(id) ? updatedOrder : o))
        );
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            String(o.id) === String(id) ? { ...o, status: newStatus } : o
          )
        );
      }
      return updatedOrder;
    } catch (err) {
      console.error("useOrders Update Status Error:", err);
      throw new Error(extractErrorMessage(err, "فشل تحديث الحالة."));
    }
  }, []);

  const cancelOrder = useCallback(
    (id) => updateOrderStatus(id, "CANCELED"),
    [updateOrderStatus]
  );

  return {
    orders,
    isLoading,
    isError: Boolean(error),
    error,
    refetch,
    updateOrderStatus,
    cancelOrder
  };
}

export function useOrderDetails(orderId) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await orderService.getOrderById(orderId);
      if (response && response.success === false) {
        throw new Error(response.message || "لم يتم العثور على الطلب");
      }
      const orderData = response.data || response;
      if (!orderData) throw new Error("بيانات الطلب غير متوفرة");
      setOrder(orderData);
    } catch (err) {
      console.error("useOrderDetails Error:", err);
      setError(extractErrorMessage(err, "حدث خطأ أثناء تحميل تفاصيل الطلب."));
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatus = useCallback(
    async (newStatus) => {
      try {
        setIsUpdating(true);
        const response = await orderService.updateOrderStatus(orderId, newStatus);
        if (response && response.success === false) {
          throw new Error(response.message || "فشل تحديث حالة الطلب");
        }
        const updatedOrder = response.data || response;
        if (updatedOrder && updatedOrder.id) {
          setOrder(updatedOrder);
        } else {
          setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
        }
        return updatedOrder;
      } catch (err) {
        console.error("useOrderDetails Update Status Error:", err);
        throw new Error(extractErrorMessage(err, "فشل تحديث حالة الطلب."));
      } finally {
        setIsUpdating(false);
      }
    },
    [orderId]
  );

  return {
    order,
    isLoading,
    isUpdating,
    isError: Boolean(error),
    error,
    refetch,
    updateStatus
  };
}