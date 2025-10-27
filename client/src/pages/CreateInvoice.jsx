import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import ItemLabel from "../components/ItemLabel";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const unitTypes = [
  "km",
  "hour",
  "day",
  "month",
  "item",
  "kg",
  "piece",
  "service",
  "ton",
  "shift",
  "other",
];
const pricingTypes = ["fixed", "flat", "tiered"];
const discountTypes = ["percentage", "fixed"];
const taxTypes = ["percentage", "fixed"];
const tierRateTypes = ["slabRate", "unitRate"];

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Itemtotals, setItemTotals] = useState([]);
  const [totals, setTotals] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [collapsedItems, setCollapsedItems] = useState([]);
  const toggleCollapse = (index) => {
    setCollapsedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    client: "",
    items: [
      {
        service: "",
        description: "",
        hsnCode: "",
        quantity: 1,
        unitType: "item",
        pricingType: "fixed",
        baseRate: 0,
        pricingTiers: [],
        notes: "",
      },
    ],
    discount: "",
    discountType: "fixed",
    taxes: [],
    notes: "",
    dueDate: "",
    status: "draft",
  });

  useEffect(() => {
    fetchClients();
    fetchServices();

    const today = new Date();
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);

    setFormData((prev) => ({
      ...prev,
      invoiceDate: today.toISOString().split("T")[0],
      dueDate: defaultDueDate.toISOString().split("T")[0],
    }));
  }, []);

  const fetchClients = async () => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${BASE_URL}/users/clients`);
      setClients(res.data.clients);
    } catch {
      toast.error("Failed to fetch clients");
    }
  };

  const fetchServices = async () => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${BASE_URL}/services`);
      setServices(res.data.services);
    } catch {
      toast.error("Failed to fetch services");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleServiceChange = (index, serviceId) => {
    if (!serviceId) {
      handleItemChange(index, "customItem", true);
      return;
    }
    const selectedService = services.find((s) => s._id === serviceId);
    if (selectedService) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === index
            ? {
                ...item,
                service: serviceId,
                description: selectedService.name,
                hsnCode: selectedService.hsnCode,
                unitType: selectedService.unitType,
                pricingType: selectedService.pricingType,
                baseRate: selectedService.baseRate || 0,
                pricingTiers: selectedService.pricingTiers || [],
              }
            : item
        ),
      }));
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          service: "",
          description: "",
          hsnCode: "",
          quantity: 1,
          unitType: "item",
          pricingType: "fixed",
          baseRate: 0,
          pricingTiers: [],
          notes: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const addTier = (itemIndex) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex) {
          const lastTier = item.pricingTiers[item.pricingTiers.length - 1];
          const nextMin = lastTier?.maxValue ?? 0;
          console.log(nextMin);

          return {
            ...item,
            pricingTiers: [
              ...item.pricingTiers,
              {
                minValue: nextMin,
                maxValue: null, // null = Infinity
                rate: 0,
                rateType: "slabRate",
              },
            ],
          };
        }
        return item;
      }),
    }));
  };

  const deleteTier = (itemIndex, tierIndex) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              pricingTiers: item.pricingTiers.filter((_, t) => t !== tierIndex),
            }
          : item
      ),
    }));
  };

  const handleTierChange = (itemIndex, tierIndex, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      const tiers = [...items[itemIndex].pricingTiers];
      const currentTier = { ...tiers[tierIndex], error: "" };

      if (field === "minValue") {
        if (tierIndex === 0) {
          // First tier must start at >= 0
          currentTier.minValue = Math.max(value, 0);
        } else {
          const prevTier = tiers[tierIndex - 1];
          const minAllowed = prevTier?.maxValue ?? 0;
          currentTier.minValue = Math.max(value, minAllowed);
        }

        // Validate if max is smaller than min
        if (
          currentTier.maxValue !== null &&
          currentTier.maxValue < currentTier.minValue
        ) {
          currentTier.error = "Max should be greater";
        }
      } else if (field === "maxValue") {
        if (value === "" || value === null) {
          currentTier.maxValue = null;
        } else {
          currentTier.maxValue = Number(value);
          if (currentTier.maxValue < currentTier.minValue) {
            currentTier.error = "Max should be greater";
          }
        }
      } else {
        currentTier[field] = value;
      }

      tiers[tierIndex] = currentTier;
      items[itemIndex].pricingTiers = tiers;

      return { ...prev, items };
    });
  };

  const handleTaxChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedTaxes = [...prev.taxes];
      updatedTaxes[index] = { ...updatedTaxes[index], [field]: value };
      return { ...prev, taxes: updatedTaxes };
    });
  };

  const addTax = () => {
    setFormData((prev) => ({
      ...prev,
      taxes: [...prev.taxes, { name: "", rate: 0, amount: 0 }],
    }));
  };

  const removeTax = (index) => {
    setFormData((prev) => {
      const updatedTaxes = [...prev.taxes];
      updatedTaxes.splice(index, 1);
      return { ...prev, taxes: updatedTaxes };
    });
  };

  const calcTieredAmount = (item) => {
    const qty = Number(item.quantity) || 0;
    if (!item.pricingTiers?.length || qty <= 0) return 0;

    const tiers = [...item.pricingTiers]
      .map((t) => ({
        ...t,
        minValue: Number(t.minValue ?? 0),
        maxValue:
          t.maxValue === "" || t.maxValue == null
            ? Infinity
            : Number(t.maxValue),
        rate: Number(t.rate ?? 0),
        rateType: t.rateType || "slabRate", // "slabRate" | "unitRate"
      }))
      .sort((a, b) => a.minValue - b.minValue);

    let total = 0;
    let lastCoveredMax = 0;

    for (const tier of tiers) {
      if (qty < tier.minValue) continue;

      if (tier.rateType === "slabRate") {
        if (qty <= tier.maxValue) {
          return tier.rate;
        } else {
          total = tier.rate;
          lastCoveredMax = tier.maxValue;
        }
      } else {
        const start = Math.max(tier.minValue, lastCoveredMax);
        const end = Math.min(qty, tier.maxValue);
        const applicableQty = Math.max(0, end - start);
        total += applicableQty * tier.rate;

        if (qty <= tier.maxValue) return total;
      }
    }

    return total;
  };

  const calculateTotals = (
    items,
    discount = 0,
    discountType = "fixed",
    taxes = []
  ) => {
    let subtotal = 0;

    // Step 1: Calculate base subtotal per item
    const updatedItems = items.map((item) => {
      let baseAmount = 0;

      if (item.pricingType === "flat") {
        baseAmount = item.baseRate || 0;
      } else if (
        item.pricingType === "tiered" &&
        item.pricingTiers?.length > 0
      ) {
        baseAmount = calcTieredAmount(item);
      } else {
        baseAmount = (item.quantity || 0) * (item.baseRate || 0); // fixed
      }

      subtotal += baseAmount;

      return {
        ...item,
        subtotal: baseAmount,
      };
    });

    // Step 2: Apply invoice-level discount
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }

    const afterDiscount = Math.max(0, subtotal - discountAmount);

    // Step 3: Apply invoice-level taxes
    let totalTax = 0;
    const updatedTaxes = (taxes || []).map((tax) => {
      const rate = Number(tax.rate || 0);
      const amount = (afterDiscount * rate) / 100;
      totalTax += amount;
      return { ...tax, amount };
    });

    // Step 4: Final total
    const totalAmount = afterDiscount + totalTax;

    return {
      updatedItems,
      subtotal,
      discount,
      discountType,
      discountAmount,
      taxes: updatedTaxes,
      totalTax,
      totalAmount,
    };
  };

  useEffect(() => {
    const { updatedItems, ...newTotals } = calculateTotals(
      formData.items,
      Number(formData.discount || 0),
      formData.discountType,
      formData.taxes
    );
    setItemTotals(updatedItems);
    setTotals(newTotals);
  }, [
    formData.items,
    formData.discount,
    formData.discountType,
    formData.taxes,
  ]);

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // Required main fields
    if (!formData.client || formData.client === "") {
      errors.client = "Client is required";
      isValid = false;
    }
    if (!formData.invoiceNumber?.trim()) {
      errors.invoiceNumber = "Invoice Number is required";
      isValid = false;
    }
    if (!formData.invoiceDate) {
      errors.invoiceDate = "Invoice Date is required";
      isValid = false;
    }
    if (!formData.dueDate) {
      errors.dueDate = "Due Date is required";
      isValid = false;
    }

    // At least one valid item
    if (!formData.items.length) {
      toast.error("Please add at least one item");
      isValid = false;
    } else {
      formData.items.forEach((item, index) => {
        if (!item.description?.trim()) {
          errors[`item_${index}_description`] = "Description is required";
          isValid = false;
        }
        if (!item.quantity || item.quantity < 0) {
          errors[`item_${index}_quantity`] = "Quantity is required";
          isValid = false;
        }
        if (
          item.pricingType !== "tiered" &&
          (item.baseRate === null || item.baseRate < 0)
        ) {
          console.log(item.baseRate);
          errors[`item_${index}_baseRate`] = "Base Rate is required";
          isValid = false;
        }
      });
    }

    setValidationErrors(errors);

    return isValid;
  };

  const cleanPayload = (payload) => {
    return {
      ...payload,
      items: payload.items.map((item) => {
        const cleanedItem = { ...item };
        if (!cleanedItem.service) {
          delete cleanedItem.service;
        }
        return cleanedItem;
      }),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setLoading(true);

    try {
      const payload = cleanPayload(formData);
      console.log(formData);
      await axios.post(`${BASE_URL}/invoices/create-invoice`, payload);
      toast.success("Invoice created successfully!");
      navigate("/invoices");
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      <div
        className="flex items-center"
        style={{ marginBottom: "16px", flexWrap: "wrap" }}
      >
        <button
          onClick={() => navigate("/invoices")}
          className="text-gray-500 hover:text-gray-700"
          style={{ marginRight: "12px", padding: "8px" }}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
          <p className="text-sm text-gray-500">
            Fill in the details to create an invoice
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Invoice Number and Date */}
        <div
          className="bg-white shadow rounded-lg flex gap-6 justify-between"
          style={{ padding: "20px" }}
        >
          <div className="w-full">
            <label
              className="block font-medium"
              style={{ marginBottom: "8px" }}
            >
              Invoice Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="invoiceNumber"
              placeholder=" "
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              className={`w-full border rounded-md ${
                validationErrors.invoiceNumber
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              style={{ padding: "8px", marginBottom: "12px" }}
            />
            {validationErrors.invoiceNumber && (
              <p className="text-red-500 text-sm">
                {validationErrors.invoiceNumber}
              </p>
            )}
          </div>
          <div className="w-full">
            <label
              className="block font-medium"
              style={{ marginBottom: "8px" }}
            >
              Invoice Date <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleInputChange}
              className={`w-full border rounded-md ${
                validationErrors.invoiceDate
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              style={{ padding: "8px", marginBottom: "12px" }}
            />
            {validationErrors.invoiceDate && (
              <p className="text-red-500 text-sm">
                {validationErrors.invoiceDate}
              </p>
            )}
          </div>
        </div>

        {/* Client Selection */}
        <div className="bg-white shadow rounded-lg" style={{ padding: "20px" }}>
          <label className="block font-medium" style={{ marginBottom: "8px" }}>
            Client <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            className={`w-full border rounded-md ${
              validationErrors.client ? "border-red-500" : "border-gray-300"
            }`}
            style={{ padding: "8px" }}
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.companyName}
              </option>
            ))}
          </select>
          {validationErrors.client && (
            <p className="text-red-500 text-sm" style={{ marginTop: "4px" }}>
              {validationErrors.client}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="bg-white shadow rounded-lg" style={{ padding: "20px" }}>
          <label className="block font-medium" style={{ marginBottom: "8px" }}>
            Due Date <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className={`w-full border rounded-md ${
              validationErrors.dueDate ? "border-red-500" : "border-gray-300"
            }`}
            style={{ padding: "8px" }}
          />
          {validationErrors.dueDate && (
            <p className="text-red-500 text-sm" style={{ marginTop: "4px" }}>
              {validationErrors.dueDate}
            </p>
          )}
        </div>

        {/* Items */}
        {formData.items.map((item, index) => {
          const isCollapsed = collapsedItems.includes(index);
          return (
            <div
              key={index}
              className="bg-white shadow rounded-lg"
              style={{ padding: "20px" }}
            >
              {/* Header with toggle */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCollapse(index)}
                style={{ marginBottom: "16px" }}
              >
                <h2 className="text-lg font-medium">
                  <ItemLabel
                    index={index}
                    description={item.description || "New Item"}
                  />
                </h2>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">
                    ₹{Itemtotals[index]?.subtotal?.toFixed(2) || 0}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>

              {!isCollapsed && (
                <>
                  {/* Service Selector */}
                  <label
                    className="block font-medium"
                    style={{ marginBottom: "8px" }}
                  >
                    Service
                  </label>
                  <select
                    value={item.service || ""}
                    onChange={(e) => handleServiceChange(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-md"
                    style={{ padding: "8px", marginBottom: "16px" }}
                  >
                    <option value="">Custom Item</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Description */}
                  <label
                    className="block font-medium"
                    style={{ marginBottom: "8px" }}
                  >
                    Description <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className={`w-full border rounded-md ${
                      validationErrors[`item_${index}_description`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    style={{ padding: "8px", marginBottom: "4px" }}
                  />
                  {validationErrors[`item_${index}_description`] && (
                    <p
                      className="text-red-500 text-sm"
                      style={{ marginBottom: "8px" }}
                    >
                      {validationErrors[`item_${index}_description`]}
                    </p>
                  )}

                  {/* HSN Code (optional) */}
                  <label
                    className="block font-medium"
                    style={{ marginBottom: "8px", marginTop: "8px" }}
                  >
                    HSN / SAC Code
                  </label>
                  <input
                    placeholder="HSN / SAC Code"
                    value={item.hsnCode || ""}
                    onChange={(e) =>
                      handleItemChange(index, "hsnCode", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md"
                    style={{ padding: "8px", marginBottom: "16px" }}
                  />

                  {/* Unit Type */}
                  <label
                    className="block font-medium"
                    style={{ marginBottom: "8px" }}
                  >
                    Unit Type
                  </label>
                  <select
                    value={item.unitType}
                    onChange={(e) =>
                      handleItemChange(index, "unitType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md"
                    style={{ padding: "8px", marginBottom: "16px" }}
                  >
                    {unitTypes.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>

                  {/* Pricing Type */}
                  <label
                    className="block font-medium"
                    style={{ marginBottom: "8px" }}
                  >
                    Pricing Type
                  </label>
                  <select
                    value={item.pricingType}
                    onChange={(e) =>
                      handleItemChange(index, "pricingType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md"
                    style={{ padding: "8px", marginBottom: "16px" }}
                  >
                    {pricingTypes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  {/* Quantity & Base Rate */}
                  <div
                    className="grid sm:grid-cols-2 gap-3"
                    style={{ marginTop: "12px" }}
                  >
                    <div>
                      <label
                        className="block font-medium"
                        style={{ marginBottom: "8px" }}
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", +e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md"
                        style={{ padding: "8px" }}
                      />
                    </div>
                    {item.pricingType !== "tiered" && (
                      <div>
                        <label
                          className="block font-medium"
                          style={{ marginBottom: "8px" }}
                        >
                          Base Rate <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={item.baseRate}
                          onChange={(e) =>
                            handleItemChange(index, "baseRate", +e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md"
                          style={{ padding: "8px" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pricing Tiers (Only for Tiered Pricing) */}
                  {item.pricingType === "tiered" && (
                    <div style={{ marginTop: "16px" }}>
                      <h3
                        className="text-md font-medium"
                        style={{ marginBottom: "8px" }}
                      >
                        Pricing Tiers
                      </h3>
                      {item.pricingTiers.map((tier, tIndex) => (
                        <div
                          key={tIndex}
                          className="grid sm:grid-cols-5 gap-3 items-end  justify-center border-b border-gray-200"
                          style={{
                            marginBottom: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          <div>
                            <label className="block font-medium">Min</label>
                            <input
                              type="number"
                              value={tier.minValue}
                              onChange={(e) =>
                                handleTierChange(
                                  index,
                                  tIndex,
                                  "minValue",
                                  +e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md w-full"
                              style={{ padding: "8px" }}
                            />
                          </div>
                          <div>
                            <label className="block font-medium">Max</label>
                            <input
                              type="number"
                              value={tier.maxValue ?? ""}
                              onChange={(e) =>
                                handleTierChange(
                                  index,
                                  tIndex,
                                  "maxValue",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md w-full"
                              style={{ padding: "8px" }}
                            />
                          </div>
                          <div>
                            <label className="block font-medium">Rate</label>
                            <input
                              type="number"
                              value={tier.rate}
                              onChange={(e) =>
                                handleTierChange(
                                  index,
                                  tIndex,
                                  "rate",
                                  +e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md w-full"
                              style={{ padding: "8px" }}
                            />
                          </div>
                          <div>
                            <label className="block font-medium">
                              Rate Type
                            </label>
                            <select
                              value={tier.rateType || "slabRate"}
                              onChange={(e) =>
                                handleTierChange(
                                  index,
                                  tIndex,
                                  "rateType",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md w-full"
                              style={{ padding: "8px" }}
                            >
                              <option value="slabRate">Slab Rate</option>
                              <option value="unitRate">Unit Rate</option>
                            </select>
                          </div>
                          <div className="flex justify-center items-end">
                            <button
                              type="button"
                              onClick={() => deleteTier(index, tIndex)}
                              className="text-white bg-red-500 hover:bg-red-600 rounded-md"
                              style={{ padding: "6px 10px" }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTier(index)}
                        className="bg-blue-500 text-white rounded-md"
                        style={{ padding: "6px 10px" }}
                      >
                        Add Tier
                      </button>
                    </div>
                  )}

                  {/* Remove Item */}
                  {formData.items.length > 1 && index !== 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="flex items-center justify-center gap-1 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                        style={{ marginTop: "16px", padding: "6px 12px" }}
                      >
                        Delete Item <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Add Item */}
        <div>
          <button
            type="button"
            onClick={addItem}
            className="text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            style={{ padding: "8px 12px", marginTop: "12px" }}
          >
            <Plus
              className="inline-block h-4 w-4"
              style={{ marginRight: "4px" }}
            />{" "}
            Add Item
          </button>
        </div>
        {/* Discount & Taxes Section */}
        <div
          className="bg-white shadow rounded-lg"
          style={{
            padding: "16px",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          {/* Discount */}
          <div style={{ marginBottom: "12px" }}>
            <label
              className="block font-medium"
              style={{ marginBottom: "6px" }}
            >
              Discount
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                name="discount"
                value={formData.discount || 0}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md text-sm"
                style={{ padding: "6px 8px", width: "120px" }}
              />
              <select
                name="discountType"
                value={formData.discountType || "fixed"}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md text-sm"
                style={{ padding: "6px 8px", width: "110px" }}
              >
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </div>

          {/* Taxes */}
          <div>
            <label
              className="block font-medium"
              style={{ marginBottom: "6px" }}
            >
              Taxes
            </label>
            {formData.taxes?.map((tax, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2"
                style={{ marginBottom: "8px" }}
              >
                <input
                  type="text"
                  placeholder="Tax Name (e.g., CGST)"
                  value={tax.name}
                  onChange={(e) =>
                    handleTaxChange(index, "name", e.target.value)
                  }
                  className="border border-gray-300 rounded-md text-sm"
                  style={{ padding: "6px 8px", flex: "1 1 120px" }}
                />
                <input
                  type="number"
                  placeholder="0"
                  value={tax.rate}
                  onChange={(e) =>
                    handleTaxChange(index, "rate", +e.target.value)
                  }
                  className="border border-gray-300 rounded-md text-sm"
                  style={{ padding: "6px 8px", width: "80px" }}
                />
                <span className="text-gray-600 text-sm">%</span>
                <button
                  type="button"
                  onClick={() => removeTax(index)}
                  className="text-white bg-red-500 hover:bg-red-600 rounded-md text-sm"
                  style={{ padding: "4px 8px" }}
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTax}
              className="bg-blue-500 text-white rounded-md text-sm"
              style={{ padding: "6px 10px", marginTop: "6px" }}
            >
              + Add Tax
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white shadow rounded-lg" style={{ padding: "16px" }}>
          <div className="flex justify-between font-bold">
            <span>Sub Total:</span>
            <span>₹{(totals?.subtotal ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Discount:</span>
            {console.log(totals)}
            <span>₹{(totals?.discountAmount ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Tax:</span>
            <span>₹{(totals?.totalTax ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Amount:</span>
            <span>₹{(totals?.totalAmount ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium" style={{ marginBottom: "8px" }}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes..."
            className="w-full border border-gray-300 rounded-md"
            style={{ padding: "8px" }}
          />
        </div>

        {/* Submit */}
        <div
          className="flex justify-end gap-3"
          style={{ marginTop: "16px", flexWrap: "wrap" }}
        >
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="border border-gray-300 rounded-md"
            style={{ padding: "8px 16px" }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-md"
            style={{ padding: "8px 16px" }}
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
