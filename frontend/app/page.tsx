"use client";

import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import ItemsManager from "./components/ItemsManager";
import MembersManager from "./components/MembersManager";
import BorrowingManager from "./components/BorrowingManager";
import AdminManager from "./components/AdminManager";
import AdminChat from "./components/AdminChat";

type ActiveTab =
  | "dashboard"
  | "items"
  | "members"
  | "borrowings"
  | "admins"
  | "chat";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, isLoading, admin, logout } = useAuth();

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="text-6xl mb-6 animate-bounce">📚</div>
            <div className="absolute inset-0 blur-xl opacity-50 animate-pulse">
              📚
            </div>
          </div>
          <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading your library...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in → show main page or login form
  if (!isAuthenticated) {
    if (showLogin) return <LoginForm />;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white text-gray-800">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
    {/* Logo */}
    <div className="flex items-center">
      <div className="text-3xl mr-3">📚</div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
        OakTown Library
      </span>
    </div>

    {/* Navigation links */}
    <ul className="flex space-x-8 text-lg font-medium text-gray-800">
      <li>
        <a href="#about" className="hover:text-blue-600 transition">
          About Us
        </a>
      </li>
      <li>
        <a href="#features" className="hover:text-blue-600 transition">
          Features
        </a>
      </li>
      <li>
        <a href="#contact" className="hover:text-blue-600 transition">
          Contact
        </a>
      </li>
    </ul>

    {/* Sign In Button */}
    <div>
      <button
        onClick={() => setShowLogin(true)}
        className="px-6 py-2 text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow hover:opacity-90 transition"
      >
        Sign In
      </button>
    </div>
  </div>
</nav>


        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-3xl">
            <div className="text-7xl mb-6 animate-pulse">📚</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Welcome to OakTown Library
            </h1>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Simplify your library management with powerful tools to track
              books, members, and borrowings — all in one elegant platform.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3 text-lg font-semibold text-blue-600 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Sign In →
            </button>
          </div>
        </header>

        {/* About Us */}
        <section
          id="about"
          className="max-w-5xl mx-auto py-20 px-6 text-center"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About OakTown Library
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            OakTown Library is a modern digital management system built to help
            libraries operate efficiently and effortlessly. Whether you're
            tracking books, managing members, or overseeing borrowings, OakTown
            simplifies your workflow with an intuitive dashboard, real-time
            updates, and data-driven insights.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-500 text-sm">
                Designed for simplicity, making library operations easy even for
                first-time users.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-lg font-semibold mb-2">Smart Dashboard</h3>
              <p className="text-gray-500 text-sm">
                Monitor activity, borrowing stats, and library data in real time
                with interactive visuals.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-500 text-sm">
                Built with strong authentication and data protection measures to
                ensure your information stays safe.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="bg-gradient-to-b from-blue-50 to-indigo-100 py-20 px-6 text-center"
        >
          <h2 className="text-3xl font-bold mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Our Key Features
          </h2>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📚",
                title: "Book Management",
                desc: "Add, edit, and track library items with smart categorization.",
              },
              {
                icon: "👥",
                title: "Member Tracking",
                desc: "Maintain detailed member profiles and borrowing histories.",
              },
              {
                icon: "📋",
                title: "Borrowing Logs",
                desc: "View who borrowed what, and when it’s due — all in one place.",
              },
              {
                icon: "💬",
                title: "Admin Chat",
                desc: "Built-in chat to communicate with your team efficiently.",
              },
              {
                icon: "📊",
                title: "Reports & Insights",
                desc: "Visualize borrowing trends and top-performing books.",
              },
              {
                icon: "⚡",
                title: "Fast & Responsive",
                desc: "Optimized for smooth performance across all devices.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 text-center bg-gray-100">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto">
            Have questions, suggestions, or want to collaborate? Reach out to us
            — we’d love to hear from you!
          </p>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-gray-800">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="text-blue-600 text-4xl mb-3">📍</div>
              <h3 className="text-lg font-semibold mb-2">Our Location</h3>
              <p>No. 45, Tech Park Avenue, Colombo, Sri Lanka</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="text-blue-600 text-4xl mb-3">📞</div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p>+94 71 234 5678</p>
              <p>+94 77 987 6543</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="text-blue-600 text-4xl mb-3">✉️</div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p>info@oaktown.lk</p>
              <p>support@oaktown.lk</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-gray-400 text-sm bg-gray-50 border-t border-gray-200">
          © {new Date().getFullYear()} OakTown Library Management System. All
          rights reserved.
        </footer>
      </div>
    );
  }

  // Authenticated → Dashboard
  const navItems = [
    { id: "dashboard" as ActiveTab, label: "Dashboard", icon: "📊" },
    { id: "items" as ActiveTab, label: "Library Items", icon: "📚" },
    { id: "members" as ActiveTab, label: "Members", icon: "👥" },
    { id: "borrowings" as ActiveTab, label: "Borrowings", icon: "📋" },
    { id: "admins" as ActiveTab, label: "Admin Management", icon: "👑" },
    { id: "chat" as ActiveTab, label: "Chat", icon: "💬" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "items":
        return <ItemsManager />;
      case "members":
        return <MembersManager />;
      case "borrowings":
        return <BorrowingManager />;
      case "admins":
        return <AdminManager />;
      case "chat":
        return admin ? (
          <AdminChat adminId={admin.id.toString()} adminName={admin.name} />
        ) : null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl transform hover:scale-110 transition-transform">
                📚
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  OakTown Library
                </h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="text-sm font-semibold text-gray-700">
                  {admin?.name}
                </p>
              </div>
              <button
                onClick={logout}
                className="group relative px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <span>Logout</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[72px] z-40 backdrop-blur-md bg-white/60 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                    : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 animate-fadeIn">{renderContent()}</div>
      </main>
    </div>
  );
}
