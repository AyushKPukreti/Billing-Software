import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import axios from "axios";
import ServiceModal from "../components/ServiceModal";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${BASE_URL}/services`);
      console.log(res);
      setServices(res.data.services || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${BASE_URL}/services`, serviceData);
      setServices((prev) => [...prev, res.data.service]);
      toast.success("Service added successfully");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add service:", error);
    }
  };

  const handleUpdateService = async (serviceData) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.patch(
        `${BASE_URL}/services/${editingService._id}`,
        serviceData
      );
      setServices((prev) =>
        prev.map((service) =>
          service._id === editingService._id ? res.data.service : service
        )
      );
      toast.success("Service updated successfully");
      setEditingService(null);
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        axios.defaults.withCredentials = true;
        await axios.delete(`${BASE_URL}/services/${serviceId}`);
        setServices((prev) =>
          prev.filter((service) => service._id !== serviceId)
        );
        toast.success('Service deleted successfully');
      } catch (error) {
        console.error("Failed to delete service:", error);
      }
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPricingDisplay = (service) => {
    if (service.pricingType === "fixed" || service.pricingType === "flat") {
      return `₹${service.baseRate}/${getUnitDisplay(service.unitType)}`;
    } else if (service.pricingType === "tiered") {
      return `${service.pricingTiers?.length || 0} pricing tiers`;
    }
    return "Variable pricing";
  };

  const getUnitDisplay = (unit) => {
    const units = {
      km: "Kilometer",
      hour: "Hour",
      day: "Day",
      month: "Month",
      item: "Item",
      kg: "Kilogram",
      piece: "Piece",
      service: "Service",
      ton: "Ton",
      shift: "Shift",
      other: "Other",
    };
    return units[unit] || unit;
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "400px" }}
      >
        <div className="text-lg text-gray-600">Loading services...</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
      {/* Header - Matching Clients style */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500" style={{ marginTop: "0.25rem" }}>
            Manage your services and pricing
          </p>
        </div>
        <div style={{ marginTop: "1rem" }} className="sm:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            style={{
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <Plus className="h-4 w-4" style={{ marginRight: "0.5rem" }} />
            Add Service
          </button>
        </div>
      </div>

      {/* Search - Matching Clients style */}
      <div className="relative" style={{ marginTop: "1.5rem" }}>
        <div
          className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
          style={{ paddingLeft: "12px" }}
        >
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search services..."
          className="block w-full border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          style={{
            paddingLeft: "2.5rem",
            paddingRight: "0.75rem",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{ marginTop: "1.5rem" }}
        >
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="sm:p-6" style={{ padding: "1.25rem" }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {service.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingService(service)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  style={{ marginTop: "1rem" }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-sm text-gray-600">{service.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Pricing:</span>
                    <span className="text-gray-900">
                      {getPricingDisplay(service)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Unit:</span>
                    <span className="text-gray-900">
                      {getUnitDisplay(service.unitType)}
                    </span>
                  </div>

                  {service.pricingType === "tiered" &&
                    service.pricingTiers?.length > 0 && (
                      <div
                        className="bg-gray-50 rounded-lg"
                        style={{ padding: "12px", marginTop: "8px" }}
                      >
                        <h4
                          className="text-xs font-medium text-gray-700"
                          style={{ marginBottom: "8px" }}
                        >
                          Pricing Tiers:
                        </h4>
                        <div className="flex flex-col gap-1">
                          {service.pricingTiers
                            .slice(0, 2)
                            .map((tier, index) => (
                              <div
                                key={index}
                                className="text-xs text-gray-600"
                              >
                                {tier.minValue}-{tier.maxValue || "∞"}{" "}
                                {getUnitDisplay(service.unitType)}: ₹{tier.rate}
                                {tier.rateType === "unitRate" ? "/unit" : ""}
                              </div>
                            ))}
                          {service.pricingTiers.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{service.pricingTiers.length - 2} more tiers
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {service.hsnCode && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        HSN Code:
                      </span>
                      <span className="text-gray-900">{service.hsnCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center"
          style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
        >
          <div
            className="text-gray-400"
            style={{
              width: "3rem",
              height: "3rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <Package className="h-12 w-12" />
          </div>
          <h3
            className="text-sm font-medium text-gray-900"
            style={{ marginTop: "0.5rem" }}
          >
            No services found
          </h3>
          <p className="text-sm text-gray-500" style={{ marginTop: "0.25rem" }}>
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating a new service."}
          </p>
          {!searchTerm && (
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
              >
                <Plus className="h-4 w-4" style={{ marginRight: "0.5rem" }} />
                Add Service
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {(showForm || editingService) && (
        <ServiceModal
          service={editingService}
          onSave={editingService ? handleUpdateService : handleAddService}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
};

export default ServiceManagement;
