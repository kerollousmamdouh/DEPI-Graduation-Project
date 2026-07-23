import { apiClient } from "./apiClient";

export async function getComplaints() {
  return apiClient.get("/complaints");
}

export async function replyToComplaint(complaintId, replyText, fileUrl = null) {
  return apiClient.post(`/complaints/${complaintId}/reply`, {
    text: replyText,
    fileUrl,
  });
}

export async function sendDirectMessageToUser(customer, messageText) {
  return apiClient.post("/complaints/direct-message", {
    email: customer.email,
    name: customer.name || customer.fullName,
    message: messageText,
  });
}

export async function updateComplaintStatus(complaintId, newStatus) {
  return apiClient.patch(`/complaints/${complaintId}/status`, { status: newStatus });
}

export async function deleteComplaintService(complaintId) {
  return apiClient.delete(`/complaints/${complaintId}`);
}

export async function deleteChatMessageService(messageId) {
  return apiClient.delete(`/complaints/messages/${messageId}`);
}
