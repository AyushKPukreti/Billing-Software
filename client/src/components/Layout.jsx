import React, { useContext, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Settings,
  FileText,
  Plus,
  Menu,
  X,
  User,
  LogOut,
  Package,
} from "lucide-react";
import { UserContext } from "../context/userContext";
// import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { currentUser } = useContext(UserContext)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Services", href: "/services", icon: Package },
    { name: "Invoices", href: "/invoices", icon: FileText },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const businessName =
    currentUser?.businessName ||
    currentUser?.name ||
    "Business"; // fallback
  const firstLetter = businessName?.charAt(0)?.toUpperCase() || "B";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between h-16 border-b border-gray-200"
          style={{ paddingLeft: "16px", paddingRight: "16px" }}
        >
          <h1 className="text-xl font-bold text-gray-900">ARM Technologies</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            style={{ padding: "8px" }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          style={{ marginTop: "20px", paddingLeft: "8px", paddingRight: "8px" }}
        >
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center rounded-md transition-colors text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={{ padding: "8px" }}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive(item.href)
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    style={{ marginRight: "12px" }}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* New Invoice Button */}
        <div
          className="absolute bottom-0 left-0 right-0 border-t border-gray-200"
          style={{ padding: "16px" }}
        >
          <Link
            to="/invoices/create"
            className="w-full flex items-center justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            style={{ padding: "8px 16px" }}
          >
            <Plus className="h-4 w-4" style={{ marginRight: "8px" }} />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="bg-white shadow-sm border-b border-gray-200 lg:px-6"
          style={{ padding: "12px 16px" }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              style={{ padding: "8px" }}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:flex lg:items-center lg:justify-between items-center">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Multi-Domain Billing System
                </h1>
              </div>

              {/* Profile Section */}
              <div className="relative" style={{marginLeft: '16px', marginRight: '20px'}}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 cursor-pointer"
                  title={businessName} // tooltip on hover
                >
                  {firstLetter}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-60" style={{marginTop: '8px'}}>
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileOpen(false)}
                      style={{padding: '8px 16px'}}
                    >
                      <User className="h-4 w-4" style={{marginRight: '8px'}}/> Profile Settings
                    </Link>
                    <Link
                      to="/logout"
                      className="flex items-center text-gray-700 hover:bg-gray-100 transition-colors"
                      style={{padding: '8px 16px'}}
                    >
                      <LogOut className="h-4 w-4" style={{marginRight: '8px'}}/> Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div style={{ paddingTop: "24px", paddingBottom: "24px" }}>
            <div
              className="max-w-7xl sm:px-6 lg:px-8"
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
