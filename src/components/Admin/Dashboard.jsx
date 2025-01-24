import { useEffect, useState } from "react";
import Header from "./Header";
import { db } from "../../firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { Bar, Doughnut } from "react-chartjs-2";
import AdminRoute from "./AdminRoute";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalBookmarks, setTotalBookmarks] = useState(0);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        setTotalUsers(usersSnapshot.size);

        const categoriesCollection = collection(db, "category");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        setTotalCategories(categoriesSnapshot.size);

        const bookmarksCollection = collection(db, "bookmarks");
        const bookmarksSnapshot = await getDocs(bookmarksCollection);
        setTotalBookmarks(bookmarksSnapshot.size);

        const linksCollection = collection(db, "links");
        const linksSnapshot = await getDocs(linksCollection);
        setTotalLinks(linksSnapshot.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTotals();
  }, []);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setRecentActivity((prev) => [
            ...prev,
            `User ${change.doc.data().name} registered`,
          ]);
        }
      });
    });

    const unsubscribeCategories = onSnapshot(
      collection(db, "category"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            setRecentActivity((prev) => [
              ...prev,
              `Category ${change.doc.data().name} added`,
            ]);
          }
        });
      }
    );
    const unsubscribebookkmarks = onSnapshot(
      collection(db, "bookmarks"),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            setRecentActivity((prev) => [
              ...prev,
              `Bookmarks ${change.doc.data().name} added`,
            ]);
          }
        });
      }
    );

    const unsubscribeLinks = onSnapshot(collection(db, "links"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const linkData = change.doc.data();
          setRecentActivity((prev) => [
            ...prev,
            `User ${linkData.username} added link "${linkData.title}"`,
          ]);
        }
      });
    });

    return () => {
      unsubscribeUsers();
      unsubscribeCategories();
      unsubscribeLinks();
    };
  }, []);

  const barChartData = {
    labels: ["Users", "Categories", "Links", "Bookmarks"],
    datasets: [
      {
        label: "Total Count",
        data: [totalUsers, totalCategories, totalLinks, totalBookmarks],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Users", "Categories", "Links", "Bookmarks"],
    datasets: [
      {
        data: [totalUsers, totalCategories, totalLinks, totalBookmarks],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className=" bg-gray-100 dark:bg-[#28283A] min-h-screen">
      <Header />
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-5">
        <div className="bg-white dark:bg-[#513a7a] dark:text-white shadow rounded-sm p-4">
          <h3 className="text-xl font-semibold">Users</h3>
          <p className="mt-2 text-3xl font-bold">{totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-[#513a7a] dark:text-white shadow rounded-sm p-4">
          <h3 className="text-xl font-semibold">Shortcuts</h3>
          <p className="mt-2 text-3xl font-bold">{totalBookmarks}</p>
        </div>

        <div className="bg-white dark:bg-[#513a7a] dark:text-white shadow rounded-sm p-4">
          <h3 className="text-xl font-semibold">Categories</h3>
          <p className="mt-2 text-3xl font-bold">{totalCategories}</p>
        </div>

        <div className="bg-white dark:bg-[#513a7a] dark:text-white shadow rounded-sm p-4">
          <h3 className="text-xl font-semibold">Bookmarks</h3>
          <p className="mt-2 text-3xl font-bold">{totalLinks}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-[#513a7a] dark:text-white shadow rounded-sm p-6">
          <h3 className="text-xl font-semibold">
            Analytics Overview (Bar Chart)
          </h3>
          <div style={{ height: "300px", width: "100%" }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-[#513a7a] dark:text-white shadow rounded-sm p-6">
          <h3 className="text-xl font-semibold">
            Data Distribution (Doughnut Chart)
          </h3>
          <div style={{ height: "300px", width: "100%" }}>
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap Dashboard with AdminRoute
export default function ProtectedDashboard() {
  return (
    <AdminRoute>
      <Dashboard />
    </AdminRoute>
  );
}
