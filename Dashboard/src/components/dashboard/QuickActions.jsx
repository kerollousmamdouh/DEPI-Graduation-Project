import { Link } from "react-router-dom";
import {
  Package,
  Tags,
  BadgePercent,
  Users,
} from "lucide-react";

const actions = [
  {
    title: "Add Product",
    to: "/products/add",
    icon: Package,
    color: "bg-blue-500",
  },

  {
    title: "Add Category",
    to: "/add-category",
    icon: Tags,
    color: "bg-yellow-500",
  },

  {
    title: "Create Deal",
    to: "/deals/add",
    icon: BadgePercent,
    color: "bg-green-500",
  },

  {
    title: "Add Admin",
    to: "/team/add",
    icon: Users,
    color: "bg-purple-500",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Quick Actions
        </h2>

        <p className="text-gray-500">
          Frequently used shortcuts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="rounded-2xl border p-5 transition hover:-translate-y-1 hover:border-green-500 hover:shadow-lg"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white ${action.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="font-bold">
                {action.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Open page
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}