import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6 bg-gray-100 min-h-screen">
          <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">Total Users</h3>
              <p className="mt-2 text-3xl font-bold">1,234</p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">Revenue</h3>
              <p className="mt-2 text-3xl font-bold">$12,345</p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">New Orders</h3>
              <p className="mt-2 text-3xl font-bold">567</p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">Pending Tasks</h3>
              <p className="mt-2 text-3xl font-bold">89</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <ul>
              <li className="mb-2">
                User <strong>John Doe</strong> registered
              </li>
              <li className="mb-2">Order #12345 was placed</li>
              <li className="mb-2">
                Admin <strong>Jane Smith</strong> updated the pricing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
