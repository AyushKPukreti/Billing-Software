import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  Calendar,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import axios from "axios";
import { UserContext } from "../context/userContext";
import UnifiedChart from "../components/UnifiedChart";

const Dashboard = () => {
  const { currentUser } = useContext(UserContext);

  const BUSINESS_META = {
    "crane-hiring": { name: "Crane Hire Services", icon: Settings },
    finance: { name: "Finance", icon: DollarSign },
    "barber-salon": { name: "Barber Salons", icon: Users },
    "food-stall": { name: "Food Stalls", icon: Calendar },
  };

  const titleize = (s) =>
    s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    partialPayments: 0,
    sentInvoices: 0,
    overdueInvoices: 0,
    draftInvoices: 0,
    totalAmountDue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        axios.get(`${BASE_URL}/users/clients`, { withCredentials: true }),
        axios.get(`${BASE_URL}/invoices`, { withCredentials: true }),
      ]);

      const clients = clientsRes.data || [];
      const invoices = invoicesRes.data || [];
      setInvoiceData(invoices);

      // Calculate comprehensive stats
      const totalRevenue = invoices.reduce((sum, inv) => {
        if (inv.status === "paid") {
          return sum + inv.totalAmount;
        } else if (inv.status === "partial") {
          return sum + inv.amountPaid;
        }
        return sum;
      }, 0);

      const totalAmountDue = invoices.reduce((sum, inv) => {
        if (inv.status === "sent" || inv.status === "overdue" || inv.status === "partial") {
          return sum + inv.amountDue;
        }
        return sum;
      }, 0);

      const sentInvoices = invoices.filter(inv => inv.status === "sent").length;
      const pendingInvoices = invoices.filter(inv => inv.status === "sent" || inv.status === "overdue").length;
      const partialPayments = invoices.filter(inv => inv.status === "partial").length;
      const overdueInvoices = invoices.filter(inv => inv.status === "overdue").length;
      const draftInvoices = invoices.filter(inv => inv.status === "draft").length;

      setStats({
        totalClients: clients.clients?.length || clients.length || 0,
        totalInvoices: invoices.length,
        totalRevenue,
        pendingInvoices,
        partialPayments,
        sentInvoices,
        overdueInvoices,
        draftInvoices,
        totalAmountDue,
      });

      // Show recent invoices (all statuses except draft)
      const recentInvoices = invoices
        .filter((inv) => inv.status !== "draft")
        .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
        .slice(0, 6);

      setRecentInvoices(recentInvoices);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "partial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "sent":
        return Clock;
      case "overdue":
        return AlertTriangle;
      case "partial":
        return CreditCard;
      default:
        return FileText;
    }
  };

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      color: "bg-blue-500",
      link: "/clients",
      description: "Active clients"
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices,
      icon: FileText,
      color: "bg-green-500",
      link: "/invoices",
      description: "All invoices"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "bg-yellow-500",
      link: "/invoices",
      description: "Collected amount"
    },
    {
      title: "Amount Due",
      value: `₹${stats.totalAmountDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "bg-red-500",
      link: "/invoices",
      description: "Pending collection"
    },
    {
      title: "Sent Invoices",
      value: stats.sentInvoices,
      icon: FileText,
      color: "bg-indigo-500",
      link: "/invoices",
      description: "Awaiting payment"
    },
    {
      title: "Overdue",
      value: stats.overdueInvoices,
      icon: AlertTriangle,
      color: "bg-red-600",
      link: "/invoices",
      description: "Past due date"
    },
    {
      title: "Partial Payments",
      value: stats.partialPayments,
      icon: CreditCard,
      color: "bg-orange-500",
      link: "/invoices",
      description: "Partially paid"
    },
    {
      title: "Draft Invoices",
      value: stats.draftInvoices,
      icon: FileText,
      color: "bg-gray-500",
      link: "/invoices",
      description: "Not sent yet"
    },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "300px" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: "24px" }}>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600" style={{ marginTop: "4px" }}>
            Welcome to your billing dashboard
          </p>
        </div>
        <div className="flex" style={{ marginTop: "16px" }}>
          <Link
            to="/invoices/create"
            className="inline-flex items-center border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            style={{ padding: "10px 16px" }}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" style={{ marginRight: "8px" }} />
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ marginBottom: "24px" }}
      >
        {statCards.slice(0, 4).map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="relative bg-white shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              style={{
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              <div className="flex items-center">
                <div className={`rounded-lg ${card.color}`} style={{ padding: "10px" }}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div style={{ marginLeft: "12px", flex: "1" }}>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900" style={{ marginTop: "2px" }}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500" style={{ marginTop: "2px" }}>
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Additional Stats Grid for smaller screens */}
      <div
        className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ marginBottom: "24px" }}
      >
        {statCards.slice(4).map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="relative bg-white shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              style={{
                paddingTop: "12px",
                paddingBottom: "12px",
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              <div className="flex items-center">
                <div className={`rounded-lg ${card.color}`} style={{ padding: "8px" }}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div style={{ marginLeft: "10px", flex: "1" }}>
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {card.title}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900" style={{ marginTop: "2px" }}>
                    {card.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Unified Chart Section */}
      <div className="bg-white shadow rounded-lg border border-gray-200" style={{ marginBottom: "24px" }}>
        <div style={{ padding: "16px" }}>
          <UnifiedChart data={invoiceData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: "16px" }}>
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg border border-gray-200">
          <div style={{ padding: "16px" }}>
            <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: "16px" }}>
              Recent Activity
            </h3>
            {recentInvoices.length > 0 ? (
              <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
                {recentInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  return (
                    <div
                      key={invoice._id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      style={{ padding: "12px" }}
                    >
                      <div className="flex items-center" style={{ gap: "12px", flex: "1", minWidth: "0" }}>
                        <div className="flex-shrink-0">
                          <StatusIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${
                            invoice.status === "paid" ? "text-green-500" :
                            invoice.status === "partial" ? "text-orange-500" :
                            invoice.status === "overdue" ? "text-red-500" :
                            "text-blue-500"
                          }`} />
                        </div>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {invoice.client?.companyName || "Unknown Client"}
                          </p>
                          {invoice.status === "partial" && (
                            <p className="text-xs text-orange-600" style={{ marginTop: "2px" }}>
                              Paid: ₹{invoice.amountPaid?.toFixed(2)} / Due: ₹{invoice.amountDue?.toFixed(2)}
                            </p>
                          )}
                          {invoice.status === "sent" && (
                            <p className="text-xs text-blue-600" style={{ marginTop: "2px" }}>
                              Due: ₹{invoice.amountDue?.toFixed(2)}
                            </p>
                          )}
                          {invoice.status === "overdue" && (
                            <p className="text-xs text-red-600" style={{ marginTop: "2px" }}>
                              Overdue: ₹{invoice.amountDue?.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right" style={{ minWidth: "80px" }}>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">
                          ₹{invoice.totalAmount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-medium border ${getStatusColor(
                            invoice.status
                          )}`}
                          style={{ padding: "2px 8px", marginTop: "4px" }}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center" style={{ paddingTop: "32px", paddingBottom: "32px" }}>
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "8px" }} />
                <p className="text-gray-500 text-sm sm:text-base">No recent activity</p>
              </div>
            )}
            <div style={{ marginTop: "16px" }}>
              <Link
                to="/invoices"
                className="w-full flex justify-center items-center border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                style={{ padding: "10px 16px" }}
              >
                View all invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Business Type Cards */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div style={{ padding: "16px" }}>
            <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: "16px" }}>
              Business Types
            </h3>
            <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
              {(Array.isArray(currentUser?.businessType)
                ? currentUser.businessType
                : []
              ).map((type) => {
                const meta = BUSINESS_META[type] || {
                  name: titleize(type),
                  icon: Settings,
                };
                const Icon = meta.icon;

                return (
                  <div
                    key={type}
                    className="flex items-center rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    style={{ padding: "12px" }}
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                    </div>
                    <div style={{ marginLeft: "12px" }}>
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">
                        {meta.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Specialized billing features
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;