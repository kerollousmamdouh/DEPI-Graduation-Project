import {
  Package,
  ShoppingCart,
  BadgePercent,
  Users,
} from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      icon: ShoppingCart,
      title: "New order received",
      time: "2 min ago",
    },

    {
      icon: Package,
      title: "Product added",
      time: "15 min ago",
    },

    {
      icon: BadgePercent,
      title: "New deal created",
      time: "1 hour ago",
    },

    {
      icon: Users,
      title: "New user registered",
      time: "3 hours ago",
    },
  ];

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Recent Activity
        </h2>

        <p className="text-gray-500">
          Latest events in your store
        </p>
      </div>

      <div className="space-y-5">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <Icon size={18} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">
                  {activity.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}