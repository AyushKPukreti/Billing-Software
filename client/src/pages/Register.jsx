// Register.jsx
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  BarChart2, 
  ShieldCheck, 
  ArrowRight
} from "lucide-react";

import logoSrc from "../assets/logo.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    countryCode: "+91",
    email: "",
    password: "",
    confirmPassword: "",
    businessType: [],
    preferredPrintFormat: [],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
    taxId: "",
    udyamNo: "",
    hsnCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const totalSteps = 5;
  const progress = Math.round((currentStep / totalSteps) * 100);

  const businessTypes = [
    "finance",
    "crane-hiring",
    "erection & fabrication",
    "barber-salon",
    "food-stall",
    "general",
  ];

  const printFormats = ["a4", "thermal"];

  const countryCodes = [
    { code: "+91", country: "IN" },
    { code: "+1", country: "US/CA" },
    { code: "+44", country: "UK" },
    { code: "+33", country: "FR" },
    { code: "+49", country: "DE" },
    { code: "+86", country: "CN" },
  ];

  // Generic handler, supports nested address fields using dot notation (e.g., name="address.street")
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
      if (errors.address && errors.address[key]) {
        setErrors((prev) => ({
          ...prev,
          address: { ...prev.address, [key]: "" },
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Udyam Number validation function
  const validateUdyamNo = (udyamNo) => {
    if (!udyamNo.trim()) return ""; // Optional field, no error if empty

    // Udyam number format: UDYAM-XX-XX-XXXXXXX (16 characters total)
    const udyamRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;

    if (!udyamRegex.test(udyamNo.trim().toUpperCase())) {
      return "Invalid Udyam number format. Expected: UDYAM-XX-XX-XXXXXXX";
    }

    return "";
  };

  const validateStep = (step) => {
    const newErrors = {};

    const emailRegex = /^\S+@\S+\.\S+$/;

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.businessName.trim())
          newErrors.businessName = "Business name is required";
        break;

      case 2:
        if (!formData.phone.trim())
          newErrors.phone = "Phone number is required";
        if (!/^\d{10}$/.test(formData.phone))
          newErrors.phone = "Invalid phone number (must be 10 digits)";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(formData.email))
          newErrors.email = "Email is invalid";
        break;

      case 3:
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6)
          newErrors.password = "Password must be at least 6 characters";
        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        break;

      case 4:
        // address object validation (match Mongoose model: street, city, state, zipCode, country)
        newErrors.address = {};
        if (!formData.address.street?.trim())
          newErrors.address.street = "Street is required";
        if (!formData.address.city?.trim())
          newErrors.address.city = "City is required";
        if (!formData.address.state?.trim())
          newErrors.address.state = "State is required";
        if (!formData.address.zipCode?.trim())
          newErrors.address.zipCode = "Zip code is required";
        if (!formData.address.country?.trim())
          newErrors.address.country = "Country is required";

        // Validate Udyam Number if provided
        if (formData.udyamNo.trim()) {
          const udyamError = validateUdyamNo(formData.udyamNo);
          if (udyamError) {
            newErrors.udyamNo = udyamError;
          }
        }

        // Validate HSN Code if provided (optional but should be valid if entered)
        if (
          formData.hsnCode.trim() &&
          !/^\d{4,8}$/.test(formData.hsnCode.trim())
        ) {
          newErrors.hsnCode = "HSN Code should be 4-8 digits";
        }

        // clean up address if empty
        if (Object.keys(newErrors.address).length === 0)
          delete newErrors.address;
        break;

      case 5:
        if (
          !Array.isArray(formData.businessType) ||
          formData.businessType.length === 0
        )
          newErrors.businessType = "Please select at least one business type";
        if (
          !Array.isArray(formData.preferredPrintFormat) ||
          formData.preferredPrintFormat.length === 0
        )
          newErrors.preferredPrintFormat =
            "Please select at least one print format";
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setServerError("");
    } else {
      // scroll to top of form for error visibility (optional)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setServerError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Build payload to match model
    const payload = {
      name: formData.name.trim(),
      businessName: formData.businessName.trim(),
      email: formData.email.trim(),
      //   phone: `${formData.countryCode}${formData.phone.trim()}`,
      phone: `${formData.phone.trim()}`,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      businessType: formData.businessType,
      preferredPrintFormat: formData.preferredPrintFormat,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: formData.address.zipCode.trim(),
        country: formData.address.country.trim() || "India",
      },
      taxId: formData.taxId.trim(),
      udyamNo: formData.udyamNo.trim(),
      hsnCode: formData.hsnCode.trim(),
    };

    try {
      setLoading(true);
      setServerError("");
      console.log(payload);
      const res = await axios.post(`${BASE_URL}/users/register`, payload);

      const data = await res.data;

      toast.success("Registration successful!");
      console.log("Registration success:", data);

      // Success: navigate to login
      setTimeout(() => {
        setLoading(false);
        navigate("/login");
      }, 500);
    } catch (err) {
      setLoading(false);

      const backendMessage =
        err.response?.data?.message || "Server error. Please try again.";
      setServerError(backendMessage);

      console.error("Register error:", err);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div
            style={{
              rowGap: "1.5rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.businessName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.businessName}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div
            style={{
              rowGap: "1.5rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Phone Number
              </label>
              <div className="flex">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  style={{ padding: "0.75rem 0.75rem", borderRightWidth: 0 }}
                  className="border rounded-l-lg border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  {countryCodes.map(({ code, country }) => (
                    <option key={code} value={code}>
                      {code} ({country})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      // allow only up to 10 digits
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  style={{ flex: 1, padding: "0.75rem 1rem" }}
                  className={`border rounded-r-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div
            style={{
              rowGap: "1.5rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div
            style={{
              rowGap: "1.25rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Street
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.address?.street ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Street address"
              />
              {errors.address?.street && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.address.street}
                </p>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "0.5rem" }}
                >
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "0.75rem 1rem" }}
                  className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.address?.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="City"
                />
                {errors.address?.city && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "0.25rem" }}
                  >
                    {errors.address.city}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "0.5rem" }}
                >
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "0.75rem 1rem" }}
                  className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.address?.state ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="State"
                />
                {errors.address?.state && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "0.25rem" }}
                  >
                    {errors.address.state}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "0.5rem" }}
                >
                  Zip Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "0.75rem 1rem" }}
                  className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.address?.zipCode
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Zip / Postal code"
                />
                {errors.address?.zipCode && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "0.25rem" }}
                  >
                    {errors.address.zipCode}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "0.5rem" }}
                >
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "0.75rem 1rem" }}
                  className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.address?.country
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Country"
                />
                {errors.address?.country && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "0.25rem" }}
                  >
                    {errors.address.country}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Tax ID (GST Number)
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.taxId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your tax ID"
              />
              {errors.taxId && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.taxId}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Udyam Number
              </label>
              <input
                type="text"
                name="udyamNo"
                value={formData.udyamNo}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.75rem 1rem" }}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  errors.udyamNo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter UDYAM-XX-XX-XXXXXXX"
              />
              {errors.udyamNo && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.udyamNo}
                </p>
              )}
              <p className="text-xs text-gray-500" style={{marginTop: '4px'}}>
                Format: UDYAM-XX-XX-XXXXXXX
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "0.5rem" }}
                >
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "0.75rem 1rem" }}
                  className={`border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.hsnCode ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="HSN / SAC Code"
                />
                {errors.hsnCode && (
                  <p
                    className="text-red-500 text-sm"
                    style={{ marginTop: "0.25rem" }}
                  >
                    {errors.hsnCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div
            style={{
              rowGap: "1.25rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Business Type (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleMultiSelect("businessType", type)}
                    className={`text-left border rounded-lg transition-all ${
                      formData.businessType.includes(type)
                        ? "border-blue-600 text-blue-600"
                        : "border-gray-300 hover:border-blue-600"
                    }`}
                    style={{
                      textTransform: "uppercase",
                      padding: "12px",
                      backgroundColor: formData.businessType.includes(type)
                        ? "rgba(74, 21, 75, 0.1)"
                        : "transparent",
                    }}
                  >
                    <span>{type}</span>
                  </button>
                ))}
              </div>
              {errors.businessType && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.businessType}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "0.5rem" }}
              >
                Preferred Print Format (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {printFormats.map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() =>
                      handleMultiSelect("preferredPrintFormat", format)
                    }
                    className={`text-left border rounded-lg transition-all ${
                      formData.preferredPrintFormat.includes(format)
                        ? "border-blue-600 text-blue-600"
                        : "border-gray-300 hover:border-blue-600"
                    }`}
                    style={{
                      textTransform: "uppercase",
                      padding: "12px",
                      backgroundColor: formData.preferredPrintFormat.includes(
                        format
                      )
                        ? "rgba(74, 21, 75, 0.1)"
                        : "transparent",
                    }}
                  >
                    <span>{format}</span>
                  </button>
                ))}
              </div>
              {errors.preferredPrintFormat && (
                <p
                  className="text-red-500 text-sm"
                  style={{ marginTop: "0.25rem" }}
                >
                  {errors.preferredPrintFormat}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex w-full" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* LEFT SIDE - Info Panel (Glass / Subtle Gradient) */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center relative overflow-hidden"
        style={{ 
          paddingLeft: "3rem", 
          paddingRight: "3rem",
          background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
          borderRight: "1px solid rgba(255,255,255,0.4)"
        }}
      >
        {/* Subtle decorative background shapes */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }}></div>
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "30vw", height: "30vw", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }}></div>

        <div className="w-full max-w-lg relative z-10">
          {/* Logo block */}
          <div className="flex items-center" style={{ gap: "1rem", marginBottom: "3rem" }}>
            <img src={logoSrc} alt="ARM Technologies Logo" style={{ height: "48px", width: "48px", objectFit: "contain" }} />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              ARM Technologies
            </h1>
          </div>

          <h2 className="text-[2.25rem] font-bold text-gray-900 leading-tight tracking-tight" style={{ marginBottom: "1rem" }}>
            Welcome to Excellence.
          </h2>
          <p className="text-[1.1rem] font-medium text-gray-600" style={{ marginBottom: "3rem", lineHeight: "1.6" }}>
            Streamline your billing, manage client ledgers, and automate notifications effortlessly with a premium experience.
          </p>

          <div className="flex flex-col" style={{ gap: "2rem" }}>
            {/* Feature 1 */}
            <div className="flex items-start" style={{ gap: "1.25rem" }}>
              <div className="shrink-0" style={{ padding: "0.75rem", marginTop: "0.25rem", background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-soft)", border: "1px solid rgba(255,255,255,1)" }}>
                <FileText style={{ width: "20px", height: "20px", color: "var(--color-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-[1rem] leading-tight">Professional Invoicing</h3>
                <p className="text-[0.95rem] text-gray-500" style={{ marginTop: "0.25rem" }}>Generate elegant, GST-ready invoices and estimates instantly.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-start" style={{ gap: "1.25rem" }}>
              <div className="shrink-0" style={{ padding: "0.75rem", marginTop: "0.25rem", background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-soft)", border: "1px solid rgba(255,255,255,1)" }}>
                <BarChart2 style={{ width: "20px", height: "20px", color: "var(--color-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-[1rem] leading-tight">Comprehensive Ledgers</h3>
                <p className="text-[0.95rem] text-gray-500" style={{ marginTop: "0.25rem" }}>Keep track of client balances and payment histories automatically.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-start" style={{ gap: "1.25rem" }}>
              <div className="shrink-0" style={{ padding: "0.75rem", marginTop: "0.25rem", background: "var(--surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-soft)", border: "1px solid rgba(255,255,255,1)" }}>
                <ShieldCheck style={{ width: "20px", height: "20px", color: "var(--color-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-[1rem] leading-tight">Smart Notifications</h3>
                <p className="text-[0.95rem] text-gray-500" style={{ marginTop: "0.25rem" }}>Send automated payment reminders via WhatsApp, SMS, and Email.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form Panel */}
      <div 
        className="w-full md:w-1/2 flex flex-col justify-center items-center"
        style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", background: "var(--surface)", paddingBottom: "2rem", paddingTop: "2rem" }}
      >
        <div
          className="w-full max-w-md"
          style={{ rowGap: "1.5rem", display: "flex", flexDirection: "column" }}
        >
          {/* Mobile Logo for smaller screens */}
          <div className="flex md:hidden items-center" style={{ gap: "0.75rem", marginBottom: "1rem", marginTop: "1rem", justifyContent: "center" }}>
            <img src={logoSrc} alt="ARM Technologies Logo" style={{ height: "40px", width: "40px", objectFit: "contain" }} />
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ARM Technologies</h1>
          </div>

          <div>
          <h2
            className="text-center text-3xl font-extrabold text-gray-900"
            style={{ marginTop: "1.5rem" }}
          >
            Create your account
          </h2>

          <p
            className="text-center text-sm text-gray-600"
            style={{ marginTop: "0.5rem" }}
          >
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full bg-gray-200 rounded-full"
          style={{ height: "0.5rem" }}
        >
          <div
            className="bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, height: "0.5rem" }}
          />
        </div>

        <form
          style={{
            marginTop: "2rem",
            rowGap: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="bg-white rounded-lg shadow-sm border border-gray-200"
            style={{ padding: "1.5rem" }}
          >
            {serverError && (
              <p
                className="text-red-600 text-sm"
                style={{ marginBottom: "0.75rem" }}
              >
                {serverError}
              </p>
            )}
            {renderStep()}
          </div>

          <div
            className="flex justify-between"
            style={{ alignItems: "center" }}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="app-card"
                style={{ padding: "0.75rem 1.5rem", border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", fontWeight: 500 }}
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
                style={{ padding: "0.75rem 1.5rem" }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary"
                style={{ padding: "0.75rem 1.5rem" }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline text-sm"
              style={{ marginTop: "0.5rem" }}
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
     </div>
    </div>
  );
};

export default Register;
