import {
  Calendar,
  Users,
  BookOpen,
  DoorOpen,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import Schedules from "./components/Schedules";
import Students from "./components/Students";
import Rooms from "./components/Rooms";
import Exams from "./components/Exams";
import Login from "./components/Login";

function App() {
  const [activeTab, setActiveTab] = useState("schedules");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle authentication state on app load
  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }

    // Simulate initial data loading
    const loadApp = async () => {
      try {
        // Wait for initial setup
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading application:", error);
        setIsLoading(false);
      }
    };

    loadApp();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  const navigation = [
    { name: "Schedules", icon: Calendar, id: "schedules" },
    { name: "Students", icon: Users, id: "students" },
    { name: "Rooms", icon: DoorOpen, id: "rooms" },
    { name: "Exams", icon: BookOpen, id: "exams" },
  ];

  // Show loading spinner if the app is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-indigo-600 font-medium">
          Loading application...
        </p>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-2xl font-bold text-indigo-600">
                Exam Scheduler
              </h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`${
                    activeTab === item.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium`}
                >
                  <item.icon
                    className={`${
                      activeTab === item.id
                        ? "text-indigo-600"
                        : "text-gray-400"
                    } mr-3 h-5 w-5`}
                  />
                  {item.name}
                </button>
              ))}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:bg-gray-50 group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium mt-8"
              >
                <LogOut className="text-gray-400 mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">Exam Scheduler</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white">
            <div className="pt-16 pb-4 px-2">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`${
                      activeTab === item.id
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50"
                    } group flex w-full items-center rounded-md px-2 py-2 text-base font-medium`}
                  >
                    <item.icon
                      className={`${
                        activeTab === item.id
                          ? "text-indigo-600"
                          : "text-gray-400"
                      } mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </button>
                ))}

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:bg-gray-50 group flex w-full items-center rounded-md px-2 py-2 text-base font-medium mt-4"
                >
                  <LogOut className="text-gray-400 mr-3 h-6 w-6" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="py-6 px-4 sm:px-6 md:px-8">
          <div className="md:hidden h-12" /> {/* Spacer for mobile header */}
          {activeTab === "schedules" && <Schedules />}
          {activeTab === "students" && <Students />}
          {activeTab === "rooms" && <Rooms />}
          {activeTab === "exams" && <Exams />}
        </main>
      </div>
    </div>
  );
}

export default App;
