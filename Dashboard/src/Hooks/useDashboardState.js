import { useMemo } from "react";

export function useDashboardState(dashboard) {
  return useMemo(() => {
    const sections = Object.values(dashboard);

    const isLoading = sections.some((section) =>
      Object.values(section).some((item) => item?.loading)
    );

    const hasError = sections.some((section) =>
      Object.values(section).some((item) => item?.error)
    );

    const isEmpty = sections.every((section) =>
      Object.values(section).every((item) => {
        if (!item) return true;

        if (Array.isArray(item)) {
          return item.length === 0;
        }

        if (Array.isArray(item?.data)) {
          return item.data.length === 0;
        }

        return false;
      })
    );

    return {
      isLoading,
      hasError,
      isEmpty,
    };
  }, [dashboard]);
}

export default useDashboardState;