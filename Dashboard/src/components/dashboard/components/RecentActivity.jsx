import {
  Package,
  ShoppingCart,
  BadgePercent,
  Users,
} from "lucide-react";

const ICONS = {
  order: ShoppingCart,
  product: Package,
  deal: BadgePercent,
  user: Users,
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString();
}

export default function RecentActivity({
  activities = [],
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Activity
        </h2>

        <p className="text-gray-500">
          Latest events in your store
        </p>
      </div>

      <div className="space-y-5">
        {activities.length === 0 && (
          <div className="py-6 text-center text-gray-400">
            No recent activity yet.
          </div>
        )}

        {activities.map((activity, index) => {
          const Icon = ICONS[activity.type] || Package;

          return (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <Icon size={18} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {activity.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {timeAgo(activity.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
