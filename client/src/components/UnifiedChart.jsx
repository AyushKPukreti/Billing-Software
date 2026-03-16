import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { useState } from "react";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";

const UnifiedChart = ({ data, tokens }) => {
  const [chartType, setChartType] = useState("line");
  const [dataView, setDataView] = useState("status");

  // Fallback tokens if not provided
  const t = tokens || {
    colors: { bgSurface: "#FFF", borderLight: "#E5E5E7", textPrimary: "#1D1D1F", textSecondary: "#6B7280", accent: "#0071E3", success: "#10B981", warning: "#F59E0B", danger: "#EF4444" },
    shadows: { soft: "0 4px 12px rgba(16,24,40,0.06)", hover: "0 8px 24px rgba(16,24,40,0.08)" },
    radii: { card: "12px", pill: "99px" },
    spacing: { md: "16px", lg: "24px" }
  };

  const processStatusData = () => {
    const monthlyData = data.reduce((acc, inv) => {
      const date = new Date(inv.invoiceDate);
      const monthIndex = date.getMonth();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!acc[monthYear]) {
        acc[monthYear] = { monthYear, monthIndex: monthIndex + year * 12, paid: 0, partial: 0, sent: 0, overdue: 0, draft: 0, total: 0 };
      }
      const monthData = acc[monthYear];
      monthData.total += 1;
      if (inv.status === "paid") monthData.paid += 1;
      else if (inv.status === "partial") monthData.partial += 1;
      else if (inv.status === "sent") monthData.sent += 1;
      else if (inv.status === "overdue") monthData.overdue += 1;
      else if (inv.status === "draft") monthData.draft += 1;
      return acc;
    }, {});
    return Object.values(monthlyData).sort((a, b) => a.monthIndex - b.monthIndex);
  };

  const processRevenueData = () => {
    const monthlyData = data.reduce((acc, inv) => {
      const date = new Date(inv.invoiceDate);
      const monthIndex = date.getMonth();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!acc[monthYear]) {
        acc[monthYear] = { monthYear, monthIndex: monthIndex + year * 12, collected: 0, pending: 0, totalRevenue: 0 };
      }
      const monthData = acc[monthYear];
      if (inv.status === "paid") {
        monthData.collected += inv.totalAmount;
        monthData.totalRevenue += inv.totalAmount;
      } else if (inv.status === "partial") {
        monthData.collected += inv.amountPaid;
        monthData.pending += inv.amountDue;
        monthData.totalRevenue += inv.amountPaid;
      } else if (inv.status === "sent" || inv.status === "overdue") {
        monthData.pending += inv.amountDue;
      }
      return acc;
    }, {});
    return Object.values(monthlyData).sort((a, b) => a.monthIndex - b.monthIndex);
  };

  const statusData = processStatusData();
  const revenueData = processRevenueData();
  const chartData = dataView === "status" ? statusData : revenueData;

  const getMaxValues = () => {
    if (dataView !== "revenue" || chartData.length === 0) return { needsScaling: false };
    const maxCollected = Math.max(...chartData.map(d => d.collected || 0));
    const maxPending = Math.max(...chartData.map(d => d.pending || 0));
    const maxRevenue = Math.max(...chartData.map(d => d.totalRevenue || 0));
    const maxMain = Math.max(maxCollected, maxRevenue);
    const needsScaling = maxPending > 0 && maxPending < maxMain * 0.1;
    return { needsScaling, maxCollected, maxPending, maxRevenue, scaleRatio: needsScaling ? maxMain / maxPending : 1 };
  };

  const scalingInfo = getMaxValues();

  // Premium Tooltips
  const StatusTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: `1px solid ${t.colors.borderLight}`, borderRadius: t.radii.card, padding: t.spacing.md, boxShadow: t.shadows.hover, minWidth: "200px" }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: t.colors.textPrimary, borderBottom: `1px solid ${t.colors.borderLight}`, paddingBottom: "8px", marginBottom: "8px", margin: 0 }}>
            {label}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="flex justify-between text-sm"><span style={{ color: t.colors.success, fontWeight: 500 }}>Paid</span><span style={{ fontWeight: 600, color: t.colors.textPrimary }}>{d.paid}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: t.colors.accent, fontWeight: 500 }}>Sent</span><span style={{ fontWeight: 600, color: t.colors.textPrimary }}>{d.sent}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: t.colors.warning, fontWeight: 500 }}>Partial</span><span style={{ fontWeight: 600, color: t.colors.textPrimary }}>{d.partial}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: t.colors.danger, fontWeight: 500 }}>Overdue</span><span style={{ fontWeight: 600, color: t.colors.textPrimary }}>{d.overdue}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: t.colors.textSecondary, fontWeight: 500 }}>Draft</span><span style={{ fontWeight: 600, color: t.colors.textPrimary }}>{d.draft || 0}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.colors.borderLight}`, paddingTop: "8px", marginTop: "4px", fontSize: "14px", fontWeight: 600, color: t.colors.textPrimary }}>
              <span>Total Invoices</span><span>{d.total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: `1px solid ${t.colors.borderLight}`, borderRadius: t.radii.card, padding: t.spacing.md, boxShadow: t.shadows.hover, minWidth: "220px" }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: t.colors.textPrimary, borderBottom: `1px solid ${t.colors.borderLight}`, paddingBottom: "8px", marginBottom: "8px", margin: 0 }}>
            {label}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
            <div className="flex justify-between"><span style={{ color: t.colors.success, fontWeight: 500 }}>Collected</span><span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: t.colors.textPrimary }}>₹{d.collected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
            <div className="flex justify-between"><span style={{ color: t.colors.warning, fontWeight: 500 }}>Pending</span><span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: t.colors.textPrimary }}>₹{d.pending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.colors.borderLight}`, paddingTop: "8px", marginTop: "4px", fontWeight: 600, color: "#8B5CF6" }}>
              <span>Total Revenue</span><span style={{ fontVariantNumeric: "tabular-nums" }}>₹{d.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLineChart = () => {
    if (dataView === "status") {
      return (
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.colors.borderLight} vertical={false} />
          <XAxis dataKey="monthYear" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: t.colors.textSecondary }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 12, fill: t.colors.textSecondary }} axisLine={false} tickLine={false} dx={-10} allowDataOverflow={false} />
          <Tooltip content={<StatusTooltip />} cursor={{ stroke: t.colors.borderLight, strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Legend verticalAlign="top" height={50} wrapperStyle={{ fontSize: "13px", fontWeight: 500, color: t.colors.textSecondary }} iconType="circle" />
          <Line dataKey="paid" stroke={t.colors.success} name="Paid" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line dataKey="sent" stroke={t.colors.accent} name="Sent" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line dataKey="partial" stroke={t.colors.warning} name="Partial" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line dataKey="overdue" stroke={t.colors.danger} name="Overdue" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line dataKey="draft" stroke={t.colors.textSecondary} name="Draft" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} strokeDasharray="4 4" />
        </LineChart>
      );
    } else {
      return (
        <LineChart data={chartData} margin={{ top: 20, right: scalingInfo.needsScaling ? 20 : 0, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.colors.borderLight} vertical={false} />
          <XAxis dataKey="monthYear" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: t.colors.textSecondary }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: t.colors.textSecondary }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
          {scalingInfo.needsScaling && (
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: t.colors.textSecondary }} tickFormatter={(v) => `₹${v.toFixed(0)}`} axisLine={false} tickLine={false} dx={10} />
          )}
          <Tooltip content={<RevenueTooltip />} cursor={{ stroke: t.colors.borderLight, strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Legend verticalAlign="top" height={50} wrapperStyle={{ fontSize: "13px", fontWeight: 500, color: t.colors.textSecondary }} iconType="circle" />
          <Line yAxisId="left" dataKey="collected" stroke={t.colors.success} name="Collected" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line yAxisId={scalingInfo.needsScaling ? "right" : "left"} dataKey="pending" stroke={t.colors.warning} name="Pending" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line yAxisId="left" dataKey="totalRevenue" stroke="#8b5cf6" name="Revenue" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    }
  };

  const renderBarChart = () => {
    if (dataView === "status") {
      return (
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.colors.borderLight} vertical={false} />
          <XAxis dataKey="monthYear" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: t.colors.textSecondary }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fontSize: 12, fill: t.colors.textSecondary }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip content={<StatusTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Legend verticalAlign="top" height={50} wrapperStyle={{ fontSize: "13px", fontWeight: 500, color: t.colors.textSecondary }} iconType="circle" />
          <Bar dataKey="paid" name="Paid" fill={t.colors.success} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="sent" name="Sent" fill={t.colors.accent} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="partial" name="Partial" fill={t.colors.warning} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="overdue" name="Overdue" fill={t.colors.danger} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="draft" name="Draft" fill={t.colors.textSecondary} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      );
    } else {
      return (
        <BarChart data={chartData} margin={{ top: 20, right: scalingInfo.needsScaling ? 20 : 0, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.colors.borderLight} vertical={false} />
          <XAxis dataKey="monthYear" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: t.colors.textSecondary }} axisLine={false} tickLine={false} dy={10} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: t.colors.textSecondary }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
          {scalingInfo.needsScaling && (
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: t.colors.textSecondary }} tickFormatter={(v) => `₹${v.toFixed(0)}`} axisLine={false} tickLine={false} dx={10} />
          )}
          <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Legend verticalAlign="top" height={50} wrapperStyle={{ fontSize: "13px", fontWeight: 500, color: t.colors.textSecondary }} iconType="circle" />
          <Bar yAxisId="left" dataKey="collected" name="Collected" fill={t.colors.success} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar yAxisId={scalingInfo.needsScaling ? "right" : "left"} dataKey="pending" name="Pending" fill={t.colors.warning} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar yAxisId="left" dataKey="totalRevenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      );
    }
  };

  const segmentContainerStyle = {
    display: "flex", 
    backgroundColor: "rgba(118, 118, 128, 0.12)", 
    borderRadius: "8px", 
    padding: "2px"
  };

  const getSegmentStyle = (isActive) => ({
    borderRadius: "6px", 
    fontSize: "13px", 
    padding: "4px 12px", 
    border: "none", 
    cursor: "pointer", 
    transition: "all 150ms ease",
    fontWeight: isActive ? 600 : 500,
    color: isActive ? t.colors.textPrimary : t.colors.textSecondary,
    backgroundColor: isActive ? t.colors.bgSurface : "transparent",
    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
  });

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: t.spacing.lg }}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, color: t.colors.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>
          {dataView === "status" ? "Invoice Status" : "Revenue & Collections"}
        </h3>

        <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
          {/* Data View Segmented Control */}
          <div style={segmentContainerStyle}>
            <button
              onClick={() => setDataView("status")}
              style={getSegmentStyle(dataView === "status")}
            >
              Status
            </button>
            <button
              onClick={() => setDataView("revenue")}
              style={getSegmentStyle(dataView === "revenue")}
            >
              Revenue
            </button>
          </div>

          {/* Chart Type Control */}
          <div style={segmentContainerStyle}>
            <button
              onClick={() => setChartType("line")}
              style={{...getSegmentStyle(chartType === "line"), padding: "4px 8px"}}
              aria-label="Line Chart"
            >
              <LineChartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              style={{...getSegmentStyle(chartType === "bar"), padding: "4px 8px"}}
              aria-label="Bar Chart"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ height: "420px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? renderLineChart() : renderBarChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UnifiedChart;