import { useState, useEffect, useCallback } from "react";
import {
  getComplaints,
  replyToComplaint,
  updateComplaintStatus,
  deleteComplaintService,
  sendDirectMessageToUser,
  deleteChatMessageService,
} from "../services/complaintService";

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComplaints();
      setComplaints(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    const pollInterval = setInterval(fetchComplaints, 15000);
    return () => clearInterval(pollInterval);
  }, [fetchComplaints]);

  const replyComplaint = async (complaintId, text, fileUrl) => {
    await replyToComplaint(complaintId, text, fileUrl);
    await fetchComplaints();
  };

  const changeStatus = async (complaintId, status) => {
    await updateComplaintStatus(complaintId, status);
    await fetchComplaints();
  };

  const deleteComplaint = async (complaintId) => {
    await deleteComplaintService(complaintId);
    await fetchComplaints();
  };

  const deleteChatMessage = async (messageId) => {
    await deleteChatMessageService(messageId);
    await fetchComplaints();
  };

  const sendPromoMessage = async (customer, text) => {
    await sendDirectMessageToUser(customer, text);
    await fetchComplaints();
  };

  return {
    complaints,
    loading,
    error,
    replyComplaint,
    changeStatus,
    deleteComplaint,
    deleteChatMessage,
    sendPromoMessage,
    refreshComplaints: fetchComplaints,
  };
};
