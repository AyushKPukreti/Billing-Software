import {
  CartesianGrid,
  Legend,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React from "react";

const RevenueChart = ({ data }) => {
  // Group invoices by month for revenue focus
  const monthlyData = data.reduce((acc, inv) => {
    const date = new Date(inv.invoiceDate);
    const monthIndex = date.getMonth();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;

    if (!acc[monthYear]) {
      acc[monthYear] = { 
        monthYear,
        monthIndex: monthIndex + (year * 12),
        revenue: 0,
        amountDue: 0,
        collected: 0,
        pending: 0,
      };
    }

    const monthData = acc[monthYear];
    
    if (inv.status === "paid") {
      monthData.revenue += inv.totalAmount;
      monthData.collected += inv.totalAmount;
    } else if (inv.status === "partial") {
      monthData.revenue += inv.amountPaid;
      monthData.collected += inv.amountPaid;
      monthData.amountDue += inv.amountDue;
      monthData.pending += inv.amountDue;
    } else if (inv.status === "sent" || inv.status === "overdue") {
      monthData.amountDue += inv.amountDue;
      monthData.pending += inv.amountDue;
    }

    return acc;
  }, {});

  const chartData = Object.values(monthlyData).sort(
    (a, b) => a.monthIndex - b.monthIndex
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg min-w-[180px]" style={{padding: '16px'}}>
          <p className="font-semibold text-gray-900" style={{ fontSize: "14px" }}>{label}</p>
          <div style={{ gap: "6px", display: "flex", flexDirection: "column", marginTop: "8px" }}>
            {payload.map((entry, index) => (
              <p key={index} className="font-medium" style={{ color: entry.color, fontSize: "13px" }}>
                {entry.name}: ₹{entry.value.toFixed(2)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
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
          tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '13px' }} />
        <Bar dataKey="collected" name="Collected" fill="#10b981" />
        <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
        <Bar dataKey="amountDue" name="Amount Due" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;