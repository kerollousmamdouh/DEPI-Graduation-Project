import DashboardSection from "../layout/DashboardSection";
import DashboardSectionHeader from "../shared/DashboardSectionHeader";

import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import ActiveDeals from "../ActiveDeals";

export default function EngagementSection({
  data = {},
}) {
  const {
    activeDeals = [],
    recentActivity = [],
  } = data;

  return (
    <DashboardSection>
      <DashboardSectionHeader
        title="Store Activity"
        subtitle="Shortcuts, promotions, and what's happening right now"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <QuickActions />

        <ActiveDeals deals={activeDeals} />

        <RecentActivity activities={recentActivity} />
      </div>
    </DashboardSection>
  );
}
