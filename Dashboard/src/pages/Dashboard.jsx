import useDashboard from "../Hooks/useDashboard";
import { useDashboardState } from "../Hooks/useDashboardState";

import DashboardContainer from "../components/dashboard/layout/DashboardContainer";
import DashboardHeader from "../components/dashboard/components/DashboardHeader";

import StoreOverviewSection from "../components/dashboard/sections/StoreOverviewSection";
import StoreHealthSection from "../components/dashboard/sections/StoreHealthSection";
import OrdersOverviewSection from "../components/dashboard/sections/OrdersOverviewSection";
import InventorySection from "../components/dashboard/sections/InventorySection";
import EngagementSection from "../components/dashboard/sections/EngagementSection";

export default function Dashboard() {
    const dashboard = useDashboard();

    const {
        isLoading,
        hasError,
        isEmpty,
    } = useDashboardState(dashboard);

    return (
        <DashboardContainer>

            <DashboardHeader />

            <StoreOverviewSection
                data={dashboard.overview}
            />

            <StoreHealthSection
                data={dashboard.health}
            />

            <OrdersOverviewSection
                data={dashboard.orders}
            />

            <InventorySection
                data={dashboard.inventory}
            />

            <EngagementSection
                data={dashboard.engagement}
            />

        </DashboardContainer>
    );
}
