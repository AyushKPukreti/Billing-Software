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

export const tokens = {
  colors: {
    bgCanvas: "#F7F7F8",
    bgSurface: "#FFFFFF",
    borderLight: "#E6E7EA",
    textPrimary: "#0F1724",
    textSecondary: "#6B7280",
    accent: "#0071E3",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  shadows: {
    soft: "0 4px 12px rgba(16,24,40,0.06)",
    hover: "0 8px 24px rgba(16,24,40,0.08)",
  },
  radii: {
    card: "12px",
    pill: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  }
};

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
      const recentInvoicesArr = invoices
        .filter((inv) => inv.status !== "draft")
        .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
        .slice(0, 6);

      setRecentInvoices(recentInvoicesArr);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "sent": return Clock;
      case "overdue": return AlertTriangle;
      case "partial": return CreditCard;
      default: return FileText;
    }
  };

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      accentText: tokens.colors.accent,
      accentBg: "#EFF6FF",
      link: "/clients",
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices,
      icon: FileText,
      accentText: tokens.colors.success,
      accentBg: "#ECFDF5",
      link: "/invoices",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      accentText: tokens.colors.warning,
      accentBg: "#FFFBEB",
      link: "/invoices",
    },
    {
      title: "Amount Due",
      value: `₹${stats.totalAmountDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      accentText: tokens.colors.danger,
      accentBg: "#FEF2F2",
      link: "/invoices",
    },
    {
      title: "Sent Invoices",
      value: stats.sentInvoices,
      icon: FileText,
      accentText: "#6366F1", // Indigo
      accentBg: "#EEF2FF",
      link: "/invoices",
    },
    {
      title: "Overdue",
      value: stats.overdueInvoices,
      icon: AlertTriangle,
      accentText: tokens.colors.danger,
      accentBg: "#FEF2F2",
      link: "/invoices",
    },
    {
      title: "Partial",
      value: stats.partialPayments,
      icon: CreditCard,
      accentText: "#EA580C", // Orange
      accentBg: "#FFF7ED",
      link: "/invoices",
    },
    {
      title: "Drafts",
      value: stats.draftInvoices,
      icon: FileText,
      accentText: tokens.colors.textSecondary,
      accentBg: "#F3F4F6",
      link: "/invoices",
    },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: tokens.colors.bgCanvas }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: tokens.colors.accent }}></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: tokens.colors.bgCanvas, minHeight: "100vh", padding: `${tokens.spacing.xl} 0`, fontFamily: "'Inter', 'SF Pro Text', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: tokens.spacing.lg }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "700", color: tokens.colors.textPrimary, lineHeight: "40px", letterSpacing: "-0.02em", margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "16px", color: tokens.colors.textSecondary, marginTop: "4px" }}>
              Welcome to your billing dashboard
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex">
            <Link
              to="/invoices/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: tokens.colors.accent,
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: tokens.radii.pill,
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0, 113, 227, 0.24)",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 113, 227, 0.32)";
              }}
              onMouseLeave={(e) => {
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  e.currentTarget.style.transform = "none";
                }
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 113, 227, 0.24)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `2px solid ${tokens.colors.accent}`;
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => e.currentTarget.style.outline = "none"}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" style={{ marginBottom: tokens.spacing.xl }}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link
                key={index}
                to={card.link}
                style={{
                  backgroundColor: tokens.colors.bgSurface,
                  borderRadius: tokens.radii.card,
                  padding: tokens.spacing.lg,
                  border: `1px solid ${tokens.colors.borderLight}`,
                  boxShadow: tokens.shadows.soft,
                  transition: "all 150ms ease",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }
                  e.currentTarget.style.boxShadow = tokens.shadows.hover;
                }}
                onMouseLeave={(e) => {
                  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    e.currentTarget.style.transform = "none";
                  }
                  e.currentTarget.style.boxShadow = tokens.shadows.soft;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${tokens.colors.accent}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
                tabIndex={0}
              >
                <div
                  className="hidden sm:flex"
                  style={{
                    backgroundColor: card.accentBg,
                    color: card.accentText,
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: tokens.spacing.md,
                    flexShrink: 0,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: "500", color: tokens.colors.textSecondary, marginBottom: "4px" }} className="truncate">
                    {card.title}
                  </p>
                  <p style={{ fontSize: "24px", fontWeight: "600", color: tokens.colors.textPrimary, lineHeight: "1.2" }} className="truncate">
                    {card.value}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Unified Chart */}
        <div style={{ marginBottom: tokens.spacing.xl }}>
          <div
            style={{
              backgroundColor: tokens.colors.bgSurface,
              borderRadius: tokens.radii.card,
              border: `1px solid ${tokens.colors.borderLight}`,
              boxShadow: tokens.shadows.soft,
              padding: tokens.spacing.lg,
            }}
          >
            <UnifiedChart data={invoiceData} tokens={tokens} />
            <div style={{ marginTop: tokens.spacing.md, backgroundColor: "#EEF2FF", borderRadius: "8px", padding: "12px 16px" }}>
              <p style={{ fontSize: "13px", color: tokens.colors.accent, margin: 0 }}>
                💡 <strong>Insight:</strong> Showing your billing trends over time. Switch to Revenue view to track collections.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: tokens.colors.textPrimary, marginBottom: tokens.spacing.md }}>
              Recent Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  let pillColors = { bg: "#F3F4F6", text: "#6B7280" };
                  if (invoice.status === "paid") pillColors = { bg: "#ECFDF5", text: "#10B981" };
                  else if (invoice.status === "sent") pillColors = { bg: "#EFF6FF", text: "#0071E3" };
                  else if (invoice.status === "overdue") pillColors = { bg: "#FEF2F2", text: "#DC2626" };
                  else if (invoice.status === "partial") pillColors = { bg: "#FFFBEB", text: "#F59E0B" };

                  return (
                    <div
                      key={invoice._id}
                      style={{
                        backgroundColor: tokens.colors.bgSurface,
                        borderRadius: tokens.radii.card,
                        border: `1px solid ${tokens.colors.borderLight}`,
                        boxShadow: "0 1px 3px rgba(16,24,40,0.02)",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 150ms ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                        e.currentTarget.style.boxShadow = tokens.shadows.soft;
                      }}
                      onMouseLeave={(e) => {
                        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                          e.currentTarget.style.transform = "none";
                        }
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(16,24,40,0.02)";
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: tokens.spacing.md, flex: 1, minWidth: 0 }}>
                        <div className="hidden sm:flex" style={{ backgroundColor: pillColors.bg, color: pillColors.text, borderRadius: "50%", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 style={{ fontSize: "15px", fontWeight: "600", color: tokens.colors.textPrimary, margin: 0 }} className="truncate">
                              {invoice.invoiceNumber}
                            </h3>
                            <span
                              style={{
                                backgroundColor: pillColors.bg,
                                color: pillColors.text,
                                padding: "2px 8px",
                                borderRadius: tokens.radii.pill,
                                fontSize: "11px",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "0.02em"
                              }}
                              aria-label={`Status: ${invoice.status}`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                          <p style={{ fontSize: "13px", color: tokens.colors.textSecondary, margin: 0 }} className="truncate">
                            {invoice.client?.companyName || "Unknown Client"} 
                            {(invoice.status === 'partial' || invoice.status === 'sent' || invoice.status === 'overdue') && invoice.amountDue && (
                              <span style={{ marginLeft: "8px", color: invoice.status === 'overdue' ? tokens.colors.danger : tokens.colors.textSecondary }}>
                                • Due: ₹{invoice.amountDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", paddingLeft: tokens.spacing.md, flexShrink: 0 }}>
                        <p style={{ fontSize: "16px", fontWeight: "600", color: tokens.colors.textPrimary, margin: 0, fontVariantNumeric: "tabular-nums" }}>
                          ₹{invoice.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", backgroundColor: tokens.colors.bgSurface, borderRadius: tokens.radii.card, border: `1px solid ${tokens.colors.borderLight}` }}>
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p style={{ color: tokens.colors.textSecondary, fontSize: "14px" }}>No recent activity</p>
                </div>
              )}
              
              <Link
                to="/invoices"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  color: tokens.colors.textSecondary,
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                  borderRadius: "8px",
                  transition: "color 150ms ease, background-color 150ms ease",
                  marginTop: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                  e.currentTarget.style.color = tokens.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = tokens.colors.textSecondary;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${tokens.colors.accent}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => e.currentTarget.style.outline = "none"}
              >
                View all invoices &rarr;
              </Link>
            </div>
          </div>

          {/* Business Types Panel */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: tokens.colors.textPrimary, marginBottom: tokens.spacing.md }}>
              Business Modules
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
              {(Array.isArray(currentUser?.businessType) ? currentUser.businessType : []).map((type) => {
                const meta = BUSINESS_META[type] || { name: titleize(type), icon: Settings };
                const Icon = meta.icon;
                return (
                  <div
                    key={type}
                    style={{
                      backgroundColor: tokens.colors.bgSurface,
                      borderRadius: tokens.radii.card,
                      border: `1px solid ${tokens.colors.borderLight}`,
                      boxShadow: "0 1px 3px rgba(16,24,40,0.02)",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: tokens.spacing.md,
                    }}
                  >
                    <div style={{ backgroundColor: "#F3F4F6", color: "#6B7280", borderRadius: "10px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: "600", color: tokens.colors.textPrimary, margin: 0 }}>
                        {meta.name}
                      </h3>
                      <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, margin: "2px 0 0 0" }}>
                        Active module
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