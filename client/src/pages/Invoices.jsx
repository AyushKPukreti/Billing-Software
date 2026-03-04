import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Eye,
  Trash2,
  Pencil,
  Search,
  MoreHorizontal,
  FileText,
  IndianRupee,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
axios.defaults.withCredentials = true;

const statusOptions = ["draft", "sent", "paid", "partial", "overdue", "cancelled"];

// Status color configuration
const statusColors = {
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    hover: "hover:bg-gray-200"
  },
  sent: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    hover: "hover:bg-blue-200"
  },
  paid: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    hover: "hover:bg-green-200"
  },
  partial: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
    hover: "hover:bg-orange-200"
  },
  overdue: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200"
  },
  cancelled: {
    bg: "bg-gray-300",
    text: "text-gray-700",
    border: "border-gray-400",
    hover: "hover:bg-gray-400"
  }
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  // Fetch invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Apply search + filter whenever dependencies change
  useEffect(() => {
    let filtered = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      const invoiceDateFormatted = format(invoiceDate, "dd-MM-yyyy");
      const invoiceDateReadable = format(invoiceDate, "MMM dd, yyyy");

      // Search match
      const matchesSearch =
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.client?.companyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoiceDateFormatted.includes(searchTerm) ||
        invoiceDateReadable.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Month filter
    if (monthFilter !== "all") {
      filtered = filtered.filter(
        (invoice) =>
          new Date(invoice.invoiceDate).getMonth() + 1 === parseInt(monthFilter)
      );
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(
        (invoice) =>
          new Date(invoice.invoiceDate).getFullYear() === parseInt(yearFilter)
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, monthFilter, yearFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/invoices`
      );

      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setInvoices(sortedData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  // Update invoice status
  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/invoices/update-invoice/${invoiceId}`,
        { status: newStatus }
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(
          `${
            import.meta.env.VITE_BASE_URL
          }/invoices/delete-invoice/${invoiceId}`
        );
        toast.success("Invoice deleted successfully");
        fetchInvoices();
      } catch (error) {
        toast.error("Failed to delete invoice");
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setOpenActionId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "16rem" }}
      >
        <div
          className="animate-spin rounded-full border-b-2 border-blue-600"
          style={{ height: "3rem", width: "3rem" }}
        ></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }} className="flex flex-col gap-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        style={{ marginBottom: "20px" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500" style={{ marginTop: "4px" }}>
            Manage your invoices right here
          </p>
        </div>
        <div style={{ marginTop: "16px" }} className="sm:mt-0">
          <Link
            to="/invoices/create"
            className="inline-flex items-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            style={{ padding: "8px 16px" }}
          >
            <Plus className="h-4 w-4" style={{ marginRight: "8px" }} />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4"
        style={{ marginBottom: "20px" }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <div
            className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
            style={{ paddingLeft: "12px" }}
          >
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search invoices..."
            className="block w-full border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            style={{
              paddingLeft: "40px",
              paddingRight: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            style={{ padding: "8px 12px" }}
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="sm:w-40">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            style={{ padding: "8px 12px" }}
          >
            <option value="all">All Months</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="sm:w-32">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            style={{ padding: "8px 12px" }}
          >
            <option value="all">All Years</option>
            {[2025, 2024, 2023, 2022].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="bg-white shadow rounded-md">
        {/* Table Header */}
        {filteredInvoices.length !== 0 && (
          <div className="hidden sm:grid sm:grid-cols-5 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div style={{ padding: "12px" }}>Invoice ID</div>
            <div style={{ padding: "12px" }}>Customer</div>
            <div style={{ padding: "12px" }}>Amount</div>
            <div style={{ padding: "12px" }}>Status</div>
            <div style={{ padding: "12px" }}>Invoice Date</div>
          </div>
        )}

        {/* Invoice Rows */}
        <div className="divide-y divide-gray-200 bg-white shadow rounded-md">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice._id}
              className="grid grid-cols-1 sm:grid-cols-5 items-center hover:bg-gray-50 transition-colors"
            >
              {/* Invoice ID */}
              <div
                style={{ padding: "12px" }}
                className="font-medium text-gray-900"
              >
                #{invoice.invoiceNumber}
              </div>

              {/* Customer */}
              <div style={{ padding: "12px" }}>
                {invoice.client?.companyName || "No Client"}
              </div>

              {/* Amount */}
              <div style={{ padding: "12px" }} className="text-gray-900">
                Rs. {invoice.totalAmount.toFixed(2)}
              </div>

              {/* Status Dropdown */}
              <div style={{ padding: "12px" }} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(
                      openDropdownId === invoice._id ? null : invoice._id
                    );
                  }}
                  className={`text-sm relative inline-block min-w-[100px] rounded-md cursor-pointer focus:outline-none border transition-all ${
                    statusColors[invoice.status]?.bg || "bg-gray-100"
                  } ${statusColors[invoice.status]?.text || "text-gray-700"} ${
                    statusColors[invoice.status]?.border || "border-gray-300"
                  } ${statusColors[invoice.status]?.hover || "hover:bg-gray-200"}`}
                  style={{
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    minWidth: "100px",
                  }}
                >
                  {invoice.status.toUpperCase()}
                </button>

                {openDropdownId === invoice._id && (
                  <div
                    className="absolute flex flex-col z-20 rounded-sm bg-white border border-black-200 shadow-lg"
                    style={{ marginTop: "4px", minWidth: "120px" }}
                  >
                    {statusOptions.map(
                      (status) => 
                        status !== invoice.status && (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(invoice._id, status);
                              setOpenDropdownId(null);
                            }}
                            className={`cursor-pointer w-full text-left text-sm transition-all ${
                              statusColors[status]?.text || "text-gray-700"
                            } hover:${statusColors[status]?.bg || "bg-gray-100"} ${
                              statusColors[status]?.bg || "bg-gray-50"
                            }`}
                            style={{ padding: "8px 12px" }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        )
                    )}
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span className="text-gray-500">
                  {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
                </span>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenActionId(
                        openActionId === invoice._id ? null : invoice._id
                      );
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    style={{
                      paddingTop: "4px",
                      paddingBottom: "4px",
                      paddingLeft: "6px",
                      paddingRight: "6px",
                    }}
                  >
                    <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                  </button>

                  {openActionId === invoice._id && (
                    <div
                      className="absolute right-0 z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200"
                      style={{ marginTop: "4px" }}
                    >
                      {/* View */}
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="flex items-center text-gray-700 hover:bg-gray-100 transition-colors"
                        style={{
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          paddingLeft: "12px",
                          paddingRight: "12px",
                        }}
                        onClick={() => setOpenActionId(null)}
                      >
                        <Eye
                          className="h-4 w-4"
                          style={{ marginRight: "8px" }}
                        />
                        View Invoice
                      </Link>
                      
                      {/* Manage Payment */}
                      <Link
                        to={`/invoices/${invoice._id}/payments`}
                        className="flex items-center text-gray-700 hover:bg-gray-100 transition-colors"
                        style={{
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          paddingLeft: "12px",
                          paddingRight: "12px",
                        }}
                        onClick={() => setOpenActionId(null)}
                      >
                        <IndianRupee
                          className="h-4 w-4"
                          style={{ marginRight: "8px" }}
                        />
                        Manage Payments
                      </Link>

                      {/* Edit */}
                      <Link
                        to={`/invoices/edit/${invoice._id}`}
                        className="flex items-center text-gray-700 hover:bg-gray-100 transition-colors"
                        style={{
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          paddingLeft: "12px",
                          paddingRight: "12px",
                        }}
                        onClick={() => setOpenActionId(null)}
                      >
                        <Pencil
                          className="h-4 w-4"
                          style={{ marginRight: "8px" }}
                        />
                        Edit Invoice
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          handleDeleteInvoice(invoice._id);
                          setOpenActionId(null);
                        }}
                        className="flex items-center w-full text-left text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                        style={{
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          paddingLeft: "12px",
                          paddingRight: "12px",
                        }}
                      >
                        <Trash2
                          className="h-4 w-4"
                          style={{ marginRight: "8px" }}
                        />
                        Delete Invoice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div
          className="flex flex-col items-center text-center"
          style={{ paddingTop: "48px", paddingBottom: "48px" }}
        >
          <div className="flex-shrink-0">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No invoices found
          </h3>
          <p className="text-lg text-gray-500" style={{ marginTop: "4px" }}>
            {searchTerm || statusFilter || monthFilter || yearFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first invoice."}
          </p>
          {!searchTerm &&
            statusFilter === "all" &&
            monthFilter === "all" &&
            yearFilter === "all" && (
              <div style={{ marginTop: "24px" }}>
                <Link
                  to="/invoices/create"
                  className="inline-flex items-center border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus className="h-4 w-4" style={{ marginRight: "8px" }} />
                  Create Invoice
                </Link>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Invoices;