import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { teamService } from "../services/teamService";
import { useAuth } from "../context/AuthContext";

// ==========================================
// Hook
// ==========================================

export const useTeam = () => {
  const queryClient = useQueryClient();
  const { loading: authLoading, user } = useAuth();

  // ==========================================
  // Get Members
  // ==========================================

  const {
    data: members = [],
    isLoading: queryLoading,
    error,
  } = useQuery({
    queryKey: ["team"],

    queryFn: teamService.getMembers,

    // Don't fire this request until AuthContext has finished restoring the
    // session and attaching the Authorization header. Without this, on a
    // hard refresh the team fetch races the auth restore, gets a stray 401,
    // and — more importantly — every permission check in the UI (which
    // reads `user`) briefly evaluates as "no access" while `user` is still
    // null, making the whole page's buttons/rows flicker away and back.
    enabled: !authLoading && !!user,

    // Keep showing the last-known list while a background refetch runs
    // (e.g. after a mutation invalidates the query), instead of the table
    // flashing empty for a moment.
    placeholderData: (previousData) => previousData,
  });

  // Combined loading signal: still true while auth is restoring OR while
  // the (now auth-gated) team fetch itself is in flight.
  const loading = authLoading || queryLoading;

  // ==========================================
  // Add Member
  // ==========================================

  const addMutation = useMutation({
    mutationFn: teamService.addMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
    },
  });

  // ==========================================
  // Update Member
  // ==========================================

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      teamService.updateMember(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
    },
  });

  // ==========================================
  // Delete Member
  // ==========================================

  const deleteMutation = useMutation({
    mutationFn: teamService.deleteMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
    },
  });

  // ==========================================
  // Toggle Status
  // ==========================================

  const toggleMutation = useMutation({
    mutationFn: teamService.toggleStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
    },
  });

  // ==========================================
  // Update Permissions
  // ==========================================

  const permissionsMutation = useMutation({
    mutationFn: ({ id, permissions }) =>
      teamService.updatePermissions(
        id,
        permissions
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
    },
  });

  // ==========================================
  // Reset
  // ==========================================

  const resetMutation = useMutation({
    mutationFn: teamService.resetTeam,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
    },
  });

  // ==========================================
  // Return
  // ==========================================

  return {
    members,

    loading,

    error,

    addMember: addMutation.mutateAsync,

    updateMember:
      updateMutation.mutateAsync,

    deleteMember:
      deleteMutation.mutateAsync,

    toggleStatus:
      toggleMutation.mutateAsync,

    updatePermissions:
      permissionsMutation.mutateAsync,

    resetTeam:
      resetMutation.mutateAsync,
  };
};