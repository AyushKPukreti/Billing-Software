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

const UnifiedChart = ({ data }) => {
  const [chartType, setChartType] = useState("line");
  const [dataView, setDataView] = useState("status");

  // ✅ Process invoice status data - FIXED: Include all statuses in total
  const processStatusData = () => {
    const monthlyData = data.reduce((acc, inv) => {
      const date = new Date(inv.invoiceDate);
      const monthIndex = date.getMonth();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthYear,
          monthIndex: monthIndex + year * 12,
          paid: 0,
          partial: 0,
          sent: 0,
          overdue: 0,
          draft: 0, // Added draft count
          total: 0,
        };
      }

      const monthData = acc[monthYear];
      monthData.total += 1;

      // Count all status types
      if (inv.status === "paid") monthData.paid += 1;
      else if (inv.status === "partial") monthData.partial += 1;
      else if (inv.status === "sent") monthData.sent += 1;
      else if (inv.status === "overdue") monthData.overdue += 1;
      else if (inv.status === "draft") monthData.draft += 1;

      return acc;
    }, {});
    
    const result = Object.values(monthlyData).sort((a, b) => a.monthIndex - b.monthIndex);
    
    // Debug: Log totals to verify they match
    result.forEach(month => {
      const calculatedTotal = month.paid + month.partial + month.sent + month.overdue + month.draft;
      if (month.total !== calculatedTotal) {
        console.warn(`Total mismatch for ${month.monthYear}: recorded=${month.total}, calculated=${calculatedTotal}`);
      }
    });
    
    return result;
  };

  // ✅ Process revenue data
  const processRevenueData = () => {
    const monthlyData = data.reduce((acc, inv) => {
      const date = new Date(inv.invoiceDate);
      const monthIndex = date.getMonth();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthYear,
          monthIndex: monthIndex + year * 12,
          collected: 0,
          pending: 0,
          totalRevenue: 0,
        };
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

  // ✅ Calculate if we need dual Y-axis for revenue view
  const needsDualYAxis = dataView === "revenue" && chartData.length > 0;
  
  const getMaxValues = () => {
    if (dataView !== "revenue" || chartData.length === 0) return { needsScaling: false };
    
    const maxCollected = Math.max(...chartData.map(d => d.collected || 0));
    const maxPending = Math.max(...chartData.map(d => d.pending || 0));
    const maxRevenue = Math.max(...chartData.map(d => d.totalRevenue || 0));
    
    const maxMain = Math.max(maxCollected, maxRevenue);
    const needsScaling = maxPending > 0 && maxPending < maxMain * 0.1;
    
    return {
      needsScaling,
      maxCollected,
      maxPending,
      maxRevenue,
      scaleRatio: needsScaling ? maxMain / maxPending : 1
    };
  };

  const scalingInfo = getMaxValues();

  // ✅ Tooltips - FIXED: Show all status types including draft
  const StatusTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const calculatedTotal = d.paid + d.partial + d.sent + d.overdue + (d.draft || 0);
      
      return (
        <div
          className="bg-white border border-gray-300 rounded-lg shadow-lg min-w-[220px]"
          style={{ padding: "16px" }}
        >
          <p
            className="font-semibold text-gray-900 border-b pb-2"
            style={{ fontSize: "14px" }}
          >
            {label}
          </p>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-500">Paid:</span>
              <span>{d.paid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">Partial:</span>
              <span>{d.partial}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-500">Sent:</span>
              <span>{d.sent}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-500">Overdue:</span>
              <span>{d.overdue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Draft:</span>
              <span>{d.draft || 0}</span>
            </div>
            <div
              className="flex justify-between border-t text-sm font-semibold text-gray-700"
              style={{ paddingTop: "8px", marginTop: "8px" }}
            >
              <span>Total Invoices:</span>
              <span>{d.total}</span>
            </div>
            {calculatedTotal !== d.total && (
              <div className="text-xs text-orange-600 mt-1">
                Note: Sum of statuses ({calculatedTotal}) differs from total ({d.total})
              </div>
            )}
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
        <div
          className="bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px]"
          style={{ padding: "16px" }}
        >
          <p
            className="font-semibold text-gray-900 border-b pb-2"
            style={{ fontSize: "14px" }}
          >
            {label}
          </p>
          <div className="flex flex-col gap-1 mt-2 text-sm">
            <div className="flex justify-between text-emerald-500">
              <span>Collected:</span>
              <span>₹{d.collected.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-amber-500">
              <span>Pending:</span>
              <span>₹{d.pending.toFixed(2)}</span>
            </div>
            <div
              className="flex justify-between text-violet-500 border-t font-semibold"
              style={{ paddingTop: "8px", marginTop: "8px" }}
            >
              <span>Total Revenue:</span>
              <span>₹{d.totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ✅ Enhanced Line Chart
  const renderLineChart = () => {
    if (dataView === "status") {
      return (
        <LineChart
          data={chartData}
          margin={{ top: 15, right: 15, left: 15, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="monthYear"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
            allowDataOverflow={false}
          />
          <Tooltip content={StatusTooltip} />
          <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: "13px" }} />
          
          {/* Status lines - FIXED: Include all status types */}
          <Line 
            dataKey="paid" 
            stroke="#10b981" 
            name="Paid" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            dataKey="sent" 
            stroke="#3b82f6" 
            name="Sent" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            dataKey="partial" 
            stroke="#f59e0b" 
            name="Partial" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            dataKey="overdue" 
            stroke="#ef4444" 
            name="Overdue" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            dataKey="draft" 
            stroke="#6b7280" 
            name="Draft" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
            strokeDasharray="3 3"
          />
        </LineChart>
      );
    } else {
      // Revenue view
      return (
        <LineChart
          data={chartData}
          margin={{ top: 15, right: 15, left: 15, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="monthYear"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            domain={[0, 'auto']}
          />
          
          {scalingInfo.needsScaling && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `₹${v.toFixed(0)}`}
              domain={[0, 'auto']}
            />
          )}
          
          <Tooltip content={RevenueTooltip} />
          <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: "13px" }} />
          
          <Line 
            yAxisId="left"
            dataKey="collected" 
            stroke="#10b981" 
            name="Collected" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
          
          <Line 
            yAxisId={scalingInfo.needsScaling ? "right" : "left"}
            dataKey="pending" 
            stroke="#f59e0b" 
            name="Pending" 
            strokeWidth={3} 
            strokeDasharray="5 5"
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
          
          <Line 
            yAxisId="left"
            dataKey="totalRevenue" 
            stroke="#8b5cf6" 
            name="Revenue" 
            strokeWidth={3} 
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      );
    }
  };

  // ✅ FIXED: Bar Chart - Grouped bars instead of stacked
  const renderBarChart = () => {
    if (dataView === "status") {
      return (
        <BarChart
          data={chartData}
          margin={{ top: 15, right: 15, left: 15, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="monthYear"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
          />
          <Tooltip content={StatusTooltip} />
          <Legend wrapperStyle={{ fontSize: "13px" }} />
          
          {/* FIXED: Grouped bars instead of stacked */}
          <Bar 
            dataKey="paid" 
            name="Paid" 
            fill="#10b981" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
          <Bar 
            dataKey="sent" 
            name="Sent" 
            fill="#3b82f6" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
          <Bar 
            dataKey="partial" 
            name="Partial" 
            fill="#f59e0b" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
          <Bar 
            dataKey="overdue" 
            name="Overdue" 
            fill="#ef4444" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
          <Bar 
            dataKey="draft" 
            name="Draft" 
            fill="#6b7280" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
        </BarChart>
      );
    } else {
      return (
        <BarChart
          data={chartData}
          margin={{ top: 15, right: 15, left: 15, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="monthYear"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            domain={[0, 'auto']}
          />
          
          {scalingInfo.needsScaling && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `₹${v.toFixed(0)}`}
              domain={[0, 'auto']}
            />
          )}
          
          <Tooltip content={RevenueTooltip} />
          <Legend wrapperStyle={{ fontSize: "13px" }} />
          
          {/* Grouped bars for revenue data */}
          <Bar 
            yAxisId="left"
            dataKey="collected" 
            name="Collected" 
            fill="#10b981" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
          
          <Bar 
            yAxisId={scalingInfo.needsScaling ? "right" : "left"}
            dataKey="pending" 
            name="Pending" 
            fill="#f59e0b" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
          
          <Bar 
            yAxisId="left"
            dataKey="totalRevenue" 
            name="Revenue" 
            fill="#8b5cf6" 
            radius={[2, 2, 0, 0]}
            barSize={20}
          />
        </BarChart>
      );
    }
  };

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        style={{ marginBottom: "16px", gap: "12px" }}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {dataView === "status"
            ? "Invoice Status Overview"
            : "Revenue & Collections"}
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Data View Toggle */}
          <div
            className="flex bg-white rounded-lg border border-gray-200"
            style={{ padding: "4px" }}
          >
            <button
              onClick={() => setDataView("status")}
              className={`rounded-md transition-colors text-sm font-medium ${
                dataView === "status"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ padding: "6px 12px" }}
            >
              Invoice Status
            </button>
            <button
              onClick={() => setDataView("revenue")}
              className={`rounded-md transition-colors text-sm font-medium ${
                dataView === "revenue"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ padding: "6px 12px" }}
            >
              Revenue
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div
            className="flex bg-white rounded-lg border border-gray-200"
            style={{ padding: "4px" }}
          >
            <button
              onClick={() => setChartType("line")}
              className={`rounded-md transition-colors ${
                chartType === "line"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ padding: "6px 10px" }}
            >
              <LineChartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ padding: "6px 10px" }}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? renderLineChart() : renderBarChart()}
        </ResponsiveContainer>
      </div>

      {/* Enhanced Description */}
      <div
        className="bg-blue-50 rounded-lg border border-blue-200 mt-4"
        style={{ padding: "12px" }}
      >
        <p className="text-sm text-blue-700">
          {dataView === "status"
            ? "📊 Showing invoice status distribution over time. Track paid, sent, partial, overdue, and draft invoices."
            : `💰 Showing revenue and collection trends. ${
                scalingInfo.needsScaling 
                  ? "Pending amounts shown on separate scale for better visibility."
                  : "Monitor collected amounts, pending payments, and total revenue."
              }`}
        </p>
        {dataView === "revenue" && scalingInfo.needsScaling && (
          <p className="text-xs text-blue-600 mt-1">
            <span className="font-medium">Note:</span> Pending amounts are displayed on a different scale to make them visible alongside larger revenue figures.
          </p>
        )}
      </div>
    </div>
  );
};

export default UnifiedChart;