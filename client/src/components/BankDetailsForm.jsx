import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Landmark,
  User,
  Hash,
  MapPin as Branch,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { UserContext } from "../context/userContext";

axios.defaults.withCredentials = true;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const BankDetailsForm = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "savings",
    upiId: "",
  });

  const [showSensitiveData, setShowSensitiveData] = useState({
    accountNumber: false,
    ifscCode: false,
    upiId: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/users/bank-details`);
      if (data.bankDetails && Object.keys(data.bankDetails).length > 0) {
        setFormData({
          accountHolderName: data.bankDetails.accountHolderName || "",
          bankName: data.bankDetails.bankName || "",
          branchName: data.bankDetails.branchName || "",
          accountNumber: data.bankDetails.accountNumber || "",
          ifscCode: data.bankDetails.ifscCode || "",
          accountType: data.bankDetails.accountType || "savings",
          upiId: data.bankDetails.upiId || "",
        });
        setIsEditing(true);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to fetch bank details");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleSensitiveData = (field) => {
    setShowSensitiveData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountHolderName?.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!formData.bankName?.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(formData.accountNumber.replace(/\s/g, ""))) {
      newErrors.accountNumber = "Account number must be 9-18 digits";
    }

    if (!formData.ifscCode?.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())
    ) {
      newErrors.ifscCode = "Invalid IFSC code format (e.g., SBIN0000123)";
    }

    if (formData.upiId && !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      newErrors.upiId = "Invalid UPI ID format (e.g., username@paytm)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        ifscCode: formData.ifscCode.toUpperCase(),
      };

      let response;

      if (isEditing) {
        // Update existing bank details
        response = await axios.patch(`${BASE_URL}/users/bank-details`, payload);
        toast.success("Bank details updated successfully!");
      } else {
        // Create new bank details
        response = await axios.post(`${BASE_URL}/users/bank-details`, payload);
        toast.success("Bank details saved successfully!");
      }

      // Update localStorage and context with the new bank details
      setCurrentUser((prevUser) => ({
        ...prevUser,
        bankDetails: payload,
      }));

      navigate("/profile");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to save bank details";
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your bank details?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/users/bank-details`);

      // Update localStorage and context to remove bank details
      updateUserInLocalStorage(null);

      toast.success("Bank details deleted successfully!");
      navigate("/profile");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete bank details";
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/profile");
  };

  const isFormComplete = () => {
    return (
      formData.accountHolderName?.trim() &&
      formData.bankName?.trim() &&
      formData.accountNumber?.trim() &&
      formData.ifscCode?.trim()
    );
  };

  if (loading && !isEditing) {
    return (
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
          }}
        >
          <div className="text-gray-600">Loading bank details...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={handleBack}
              style={{
                padding: "8px",
                color: "#9ca3af",
                marginRight: "12px",
                borderRadius: "8px",
              }}
              className="hover:text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft style={{ width: "20px", height: "20px" }} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bank Details</h2>
              <p className="text-gray-600">
                Add your banking information for invoices
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isFormComplete() && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#059669",
                }}
              >
                <CheckCircle
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span className="text-sm font-medium">Complete</span>
              </div>
            )}
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #dc2626",
                  color: "#dc2626",
                  borderRadius: "8px",
                }}
                className="hover:bg-red-50 disabled:opacity-70"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "8px",
              }}
              className="hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              <Save
                style={{ width: "20px", height: "20px", marginRight: "8px" }}
              />
              {loading ? "Saving..." : "Save Details"}
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div
          style={{
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: isFormComplete() ? "#f0fdf4" : "#fffbeb",
            border: `1px solid ${isFormComplete() ? "#bbf7d0" : "#fed7aa"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {isFormComplete() ? (
              <>
                <CheckCircle
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#22c55e",
                    marginRight: "12px",
                  }}
                />
                <div>
                  <h3 className="font-medium" style={{ color: "#166534" }}>
                    Bank Details Complete
                  </h3>
                  <p style={{ color: "#166534", fontSize: "14px" }}>
                    Your banking information is ready for invoices
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#f97316",
                    marginRight: "12px",
                  }}
                />
                <div>
                  <h3 className="font-medium" style={{ color: "#9a3412" }}>
                    Bank Details Pending
                  </h3>
                  <p style={{ color: "#9a3412", fontSize: "14px" }}>
                    Complete your banking information to include payment details
                    in invoices
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#dbeafe",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "16px",
            }}
          >
            <Landmark
              style={{ width: "24px", height: "24px", color: "#2563eb" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Banking Information
            </h3>
            <p className="text-gray-600">
              All fields marked with * are required
            </p>
          </div>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Account Holder Name */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "8px" }}
            >
              <User
                style={{
                  width: "16px",
                  height: "16px",
                  display: "inline",
                  marginRight: "8px",
                }}
              />
              Account Holder Name *
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${
                  errors.accountHolderName ? "#fca5a5" : "#d1d5db"
                }`,
                borderRadius: "8px",
              }}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account holder name"
            />
            {errors.accountHolderName && (
              <p
                style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px" }}
              >
                {errors.accountHolderName}
              </p>
            )}
          </div>

          {/* Bank Name and Branch */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}
            className="md:grid-cols-2"
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                <Landmark
                  style={{
                    width: "16px",
                    height: "16px",
                    display: "inline",
                    marginRight: "8px",
                  }}
                />
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${
                    errors.bankName ? "#fca5a5" : "#d1d5db"
                  }`,
                  borderRadius: "8px",
                }}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter bank name"
              />
              {errors.bankName && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.bankName}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                <Branch
                  style={{
                    width: "16px",
                    height: "16px",
                    display: "inline",
                    marginRight: "8px",
                  }}
                />
                Branch Name
              </label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter branch name"
              />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "8px" }}
            >
              <Hash
                style={{
                  width: "16px",
                  height: "16px",
                  display: "inline",
                  marginRight: "8px",
                }}
              />
              Account Number *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showSensitiveData.accountNumber ? "text" : "password"}
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  border: `1px solid ${
                    errors.accountNumber ? "#fca5a5" : "#d1d5db"
                  }`,
                  borderRadius: "8px",
                }}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter account number"
              />
              <button
                type="button"
                onClick={() => toggleSensitiveData("accountNumber")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
                className="hover:text-gray-600"
              >
                {showSensitiveData.accountNumber ? (
                  <EyeOff style={{ width: "16px", height: "16px" }} />
                ) : (
                  <Eye style={{ width: "16px", height: "16px" }} />
                )}
              </button>
            </div>
            {errors.accountNumber && (
              <p
                style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px" }}
              >
                {errors.accountNumber}
              </p>
            )}
          </div>

          {/* IFSC Code and Account Type */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}
            className="md:grid-cols-2"
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                IFSC Code *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showSensitiveData.ifscCode ? "text" : "password"}
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    border: `1px solid ${
                      errors.ifscCode ? "#fca5a5" : "#d1d5db"
                    }`,
                    borderRadius: "8px",
                  }}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  placeholder="Enter IFSC code"
                />
                <button
                  type="button"
                  onClick={() => toggleSensitiveData("ifscCode")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                  className="hover:text-gray-600"
                >
                  {showSensitiveData.ifscCode ? (
                    <EyeOff style={{ width: "16px", height: "16px" }} />
                  ) : (
                    <Eye style={{ width: "16px", height: "16px" }} />
                  )}
                </button>
              </div>
              {errors.ifscCode && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.ifscCode}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* UPI ID */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "8px" }}
            >
              UPI ID (Optional)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showSensitiveData.upiId ? "text" : "password"}
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  border: `1px solid ${errors.upiId ? "#fca5a5" : "#d1d5db"}`,
                  borderRadius: "8px",
                }}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter UPI ID (e.g., user@paytm)"
              />
              <button
                type="button"
                onClick={() => toggleSensitiveData("upiId")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
                className="hover:text-gray-600"
              >
                {showSensitiveData.upiId ? (
                  <EyeOff style={{ width: "16px", height: "16px" }} />
                ) : (
                  <Eye style={{ width: "16px", height: "16px" }} />
                )}
              </button>
            </div>
            {errors.upiId && (
              <p
                style={{ color: "#dc2626", fontSize: "14px", marginTop: "4px" }}
              >
                {errors.upiId}
              </p>
            )}
          </div>

          {/* Help Text */}
          <div
            style={{
              backgroundColor: "#dbeafe",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <h4
              className="font-medium"
              style={{ color: "#1e3a8a", marginBottom: "8px" }}
            >
              Why do we need this information?
            </h4>
            <ul
              style={{
                color: "#1e40af",
                fontSize: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <li>
                • Bank details will appear on your invoices for client payments
              </li>
              <li>
                • All information is stored securely and only visible to you
              </li>
              <li>• You can update this information anytime</li>
              <li>• UPI ID is optional but recommended for faster payments</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankDetailsForm;
