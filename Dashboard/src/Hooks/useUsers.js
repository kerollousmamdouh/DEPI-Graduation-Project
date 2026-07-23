// dashboard/src/hooks/useUsers.js
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { userService } from "../services/userService";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // Load Users
  // ==========================================
  const loadUsers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
      toast.error("Failed to load users.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ==========================================
  // Add User
  // ==========================================
  const addUser = async (data) => {
    try {
      await userService.addUser(data);
      toast.success("User added successfully.");
      await loadUsers(false);
    } catch (err) {
      toast.error(err.message || "Failed to add user.");
      throw err;
    }
  };

  // ==========================================
  // Update User
  // ==========================================
  const updateUser = async (id, data) => {
    try {
      await userService.updateUser(id, data);
      toast.success("User updated successfully.");
      await loadUsers(false);
    } catch (err) {
      toast.error(err.message || "Failed to update user.");
      throw err;
    }
  };

  // ==========================================
  // Delete User
  // ==========================================
  const deleteUser = async (id) => {
    try {
      await userService.deleteUser(id);
      toast.success("User deleted successfully.");
      await loadUsers(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete user.");
      throw err;
    }
  };

  // ==========================================
  // Block / Unblock (Toggle Status)
  // ==========================================
  const toggleStatus = async (id) => {
    try {
      await userService.toggleStatus(id);
      toast.success("User status updated.");
      await loadUsers(false);
    } catch (err) {
      toast.error(err.message || "Failed to update user status.");
      throw err;
    }
  };

  // ==========================================
  // Send Message (Promotional / Broadcast)
  // ==========================================
  const sendMessage = async (userIds, messageText) => {
    try {
      await userService.sendMessage(userIds, messageText);
      toast.success("Message sent successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
      throw err;
    }
  };

  // ==========================================
  // Reset Users
  // ==========================================
  const resetUsers = async () => {
    try {
      await userService.resetUsers();
      toast.success("Users reset successfully.");
      await loadUsers(false);
    } catch (err) {
      toast.error(err.message || "Failed to reset users.");
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    toggleStatus,
    sendMessage,
    resetUsers,
    refresh: loadUsers,
  };
}