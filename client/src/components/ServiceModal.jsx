import { X, Plus, Trash2, Package } from "lucide-react";
import React, { useState } from "react";

const ServiceModal = ({ service, onSave, onCancel }) => {
  const unitTypes = [
    "km", "hour", "day", "month", "item", "kg", "piece", "service", "ton", "shift", "other"
  ];
  const pricingTypes = ["fixed", "flat", "tiered"];

  const [formData, setFormData] = useState({
    name: service?.name || "",
    description: service?.description || "",
    unitType: service?.unitType || "item",
    pricingType: service?.pricingType || "fixed",
    baseRate: service?.baseRate || "",
    pricingTiers: service?.pricingTiers || [],
    hsnCode: service?.hsnCode || "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.pricingType === "fixed" || formData.pricingType === "flat") {
      if (
        !formData.baseRate ||
        isNaN(formData.baseRate) ||
        parseFloat(formData.baseRate) <= 0
      ) {
        newErrors.baseRate = "Valid base rate is required";
      }
    } else if (formData.pricingType === "tiered") {
      if (formData.pricingTiers.length === 0) {
        newErrors.pricingTiers = "At least one pricing tier is required";
      } else {
        formData.pricingTiers.forEach((tier, index) => {
          if (
            tier.minValue === undefined ||
            tier.minValue === "" ||
            tier.rate === undefined ||
            tier.rate === ""
          ) {
            newErrors[`tier_${index}`] = "All tier fields are required";
          }
          if (
            tier.maxValue !== null &&
            parseFloat(tier.maxValue) <= parseFloat(tier.minValue)
          ) {
            newErrors[`tier_${index}`] =
              "Max value must be greater than min value";
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        ...formData,
        baseRate:
          formData.pricingType === "tiered"
            ? 0
            : parseFloat(formData.baseRate) || 0,
        pricingTiers: formData.pricingTiers.map((tier) => ({
          ...tier,
          minValue: parseFloat(tier.minValue),
          maxValue:
            tier.maxValue === "" || tier.maxValue == null
              ? null
              : parseFloat(tier.maxValue),
          rate: parseFloat(tier.rate),
        })),
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addTier = () => {
    setFormData((prev) => {
      const lastTier = prev.pricingTiers[prev.pricingTiers.length - 1];
      const nextMin = lastTier?.maxValue ?? 0;

      return {
        ...prev,
        pricingTiers: [
          ...prev.pricingTiers,
          {
            minValue: nextMin,
            maxValue: null,
            rate: 0,
            rateType: "slabRate",
          },
        ],
      };
    });
  };

  const removeTier = (index) => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index),
    }));
  };

  const updateTier = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onCancel}
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      />
      
      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {service ? "Edit Service" : "Add New Service"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              style={{ padding: "8px" }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div style={{ overflow: "auto", flex: 1 }}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            style={{ padding: "20px" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block font-medium"
                  style={{ marginBottom: "8px" }}
                >
                  Service Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  style={{ padding: "8px" }}
                  placeholder="Enter service name"
                />
                {errors.name && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "4px" }}
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block font-medium"
                  style={{ marginBottom: "8px" }}
                >
                  Unit of Measurement <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md"
                  style={{ padding: "8px" }}
                >
                  {unitTypes.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="block font-medium"
                style={{ marginBottom: "8px" }}
              >
                Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full border rounded-md ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                style={{ padding: "8px" }}
                placeholder="Describe the service"
              />
              {errors.description && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "4px" }}
                >
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block font-medium"
                  style={{ marginBottom: "8px" }}
                >
                  Pricing Type <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md"
                  style={{ padding: "8px" }}
                >
                  {pricingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block font-medium"
                  style={{ marginBottom: "8px" }}
                >
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md"
                  style={{ padding: "8px" }}
                  placeholder="Enter HSN code"
                />
              </div>
            </div>

            {(formData.pricingType === "fixed" ||
              formData.pricingType === "flat") && (
              <div>
                <label
                  className="block font-medium"
                  style={{ marginBottom: "8px" }}
                >
                  Base Rate <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  name="baseRate"
                  value={formData.baseRate}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full border rounded-md ${
                    errors.baseRate ? "border-red-500" : "border-gray-300"
                  }`}
                  style={{ padding: "8px" }}
                  placeholder="0.00"
                />
                {errors.baseRate && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "4px" }}
                  >
                    {errors.baseRate}
                  </p>
                )}
              </div>
            )}

            {formData.pricingType === "tiered" && (
              <div>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "16px" }}
                >
                  <label className="block font-medium text-gray-700">
                    Pricing Tiers <span style={{ color: "red" }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addTier}
                    className="inline-flex items-center bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                    style={{ padding: "6px 12px" }}
                  >
                    <Plus className="h-3 w-3" style={{ marginRight: "4px" }} />
                    Add Tier
                  </button>
                </div>

                {formData.pricingTiers.length > 0 && (
                  <div
                    className="flex flex-col gap-3"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      paddingRight: "8px",
                    }}
                  >
                    {formData.pricingTiers.map((tier, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg border border-gray-200" style={{padding: '16px'}}
                      >
                        <div className="flex items-end gap-3" style={{marginBottom: '12px'}}>
                          <div className="flex-1">
                            <label
                              className="block text-xs font-medium text-gray-600"
                              style={{ marginBottom: "6px" }}
                            >
                              Min Value
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={tier.minValue}
                              onChange={(e) =>
                                updateTier(index, "minValue", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md text-sm"
                              style={{ padding: "6px 8px" }}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              className="block text-xs font-medium text-gray-600"
                              style={{ marginBottom: "6px" }}
                            >
                              Max Value
                            </label>
                            <input
                              type="number"
                              placeholder="∞ (leave empty for unlimited)"
                              value={tier.maxValue ?? ""}
                              onChange={(e) =>
                                updateTier(index, "maxValue", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md text-sm"
                              style={{ padding: "6px 8px" }}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              className="block text-xs font-medium text-gray-600"
                              style={{ marginBottom: "6px" }}
                            >
                              Rate (₹)
                            </label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={tier.rate}
                              onChange={(e) =>
                                updateTier(index, "rate", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md text-sm"
                              style={{ padding: "6px 8px" }}
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              className="block text-xs font-medium text-gray-600"
                              style={{ marginBottom: "6px" }}
                            >
                              Rate Type
                            </label>
                            <select
                              value={tier.rateType || "slabRate"}
                              onChange={(e) =>
                                updateTier(index, "rateType", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md text-sm"
                              style={{ padding: "6px 8px" }}
                            >
                              <option value="slabRate">Slab Rate</option>
                              <option value="unitRate">Unit Rate</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTier(index)}
                            className="bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                            style={{ padding: "6px 10px", marginBottom: "6px" }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {errors[`tier_${index}`] && (
                          <p
                            className="text-red-500 text-xs"
                            style={{ marginTop: "4px" }}
                          >
                            {errors[`tier_${index}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {errors.pricingTiers && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "8px" }}
                  >
                    {errors.pricingTiers}
                  </p>
                )}

                {formData.pricingTiers.length === 0 && (
                  <div className="text-center bg-gray-50 rounded-lg border border-gray-200" style={{padding: '32px 0'}}>
                    <Package
                      className="h-8 w-8 text-gray-400"
                      style={{ margin: "0 auto 12px auto" }}
                    />
                    <p className="text-gray-500 text-sm">
                      No tiers added yet. Click "Add Tier" to create pricing
                      tiers.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div
              className="flex justify-end gap-3"
              style={{
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                className="border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                style={{ padding: "8px 16px" }}
              >
                {service ? "Update Service" : "Add Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;