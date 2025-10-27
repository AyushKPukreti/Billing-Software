import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
axios.defaults.withCredentials = true;

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ClientModal = ({ isOpen, onClose, client, handleSaveClient }) => {
  const emptyForm = {
    companyName: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "India" },
    gstNumber: "",
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (client) {
      setFormData({ ...client, address: client.address || emptyForm.address });
    } else {
      setFormData(emptyForm);
    }
    setStep(1);
    setErrors({});
  }, [client, isOpen]);

  const validateStep = () => {
    const stepErrors = {};
    if (step === 1 && !formData.companyName.trim()) {
      stepErrors.companyName = "Company name is required";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (validateStep()) {
      setStep(2);
    } else {
      toast.error("Please fix errors before proceeding.");
    }
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return toast.error("Please fill required fields.");

    setLoading(true);
    await handleSaveClient(formData);
    setLoading(false);
    onclose()
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl transform transition-all"
        style={{ width: "500px", height: "600px", padding: "0" }}
      >
        <form
          onSubmit={(e) => {
            if ((step) === 2) {
              handleSubmit(e);
            } else {
              e.preventDefault();
            }
          }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b"
            style={{ padding: "1rem" }}
          >
            <h3 className="text-lg font-medium text-gray-900">
              {client ? "Edit Client" : "Add New Client"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div
            className="flex items-center justify-between"
            style={{ margin: "1rem 0", padding: "0, 16px" }}
          >
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
              style={{ marginLeft: "4px" }}
            ></div>
          </div>

          {/* Steps */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: "0 16px 1rem 16px" }}
          >
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`block w-full border rounded-md shadow-sm ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
                    }`}
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                  {errors.companyName && (
                    <p
                      className="text-red-500 text-sm"
                      style={{ marginTop: "0.25rem" }}
                    >
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Street
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm"
                    style={{ marginTop: "0.25rem", padding: "0.5rem" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="bg-gray-50 flex justify-between"
            style={{ padding: "1rem" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm bg-white text-gray-700 hover:bg-gray-50"
              style={{ padding: "0.5rem 1rem" }}
            >
              Cancel
            </button>

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm bg-white text-gray-700 hover:bg-gray-50"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Previous
                </button>
              )}

              {step === 2 ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  {loading ? "Saving..." : client ? "Update" : "Create"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
