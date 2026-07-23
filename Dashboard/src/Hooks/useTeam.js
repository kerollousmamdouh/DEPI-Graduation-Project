import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { teamService } from "../services/teamService";

// ==========================================
// Hook
// ==========================================

export const useTeam = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // Get Members
  // ==========================================

  const {
    data: members = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["team"],

    queryFn: teamService.getMembers,
  });

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