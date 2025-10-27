import React, { useContext } from "react";
import { UserContext } from "../context/userContext";

const Template1 = ({ invoiceData, ref }) => {
  const { currentUser } = useContext(UserContext);

  const hasHSN = invoiceData.items.some(
    (item) => item.hsnCode && item.hsnCode.trim() !== ""
  );

  // Calculate taxable amount
  const taxableAmount = invoiceData.subtotal - (invoiceData.discount || 0);

  // Format account type - capitalize first letter
  const formatAccountType = (type) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        padding: "20px",
        width: "900px",
        border: "1px solid #9ca3af",
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
      }}
      ref={ref}
    >
      {/* Header with images */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "10px",
          marginBottom: "10px",
          borderBottom: "1px solid #d1d5db",
        }}
      >
        <div>
          <img
            src={invoiceData.headerImages?.leftLogo}
            alt="Left Logo"
            style={{ width: "80px", height: "auto" }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
            {currentUser.businessName.toUpperCase()}
          </h1>
          <p style={{ margin: "2px 0" }}>
            {currentUser.address.street}, {currentUser.address.city},{" "}
            {currentUser.address.state} - {currentUser.address.zipCode},{" "}
            {currentUser.address.country}
          </p>
          <p style={{ margin: "2px 0" }}>GST: {currentUser.taxId}</p>
          <p style={{ margin: "2px 0" }}>Phone: {currentUser.phone}</p>
          <p style={{ margin: "2px 0" }}>Email: {currentUser.email}</p>
        </div>
        <div>
          <img
            src={invoiceData.headerImages?.rightLogo}
            alt="Right Logo"
            style={{ width: "80px", height: "auto" }}
          />
        </div>
      </div>

      {/* Invoice Metadata */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "10px",
          marginBottom: "10px",
          borderBottom: "1px solid #d1d5db",
        }}
      >
        <div>
          <p style={{ fontWeight: "600", marginBottom: "4px" }}>
            Billed To: {invoiceData.client?.companyName || invoiceData.client?.name}
          </p>
          {invoiceData.client?.address && (
            <p style={{ margin: "2px 0" }}>
              {invoiceData.client.address.street},{" "}
              {invoiceData.client.address.city},{" "}
              {invoiceData.client.address.state} -{" "}
              {invoiceData.client.address.zipCode},{" "}
              {invoiceData.client.address.country}
            </p>
          )}
          <p style={{ margin: "2px 0" }}>GST: {invoiceData.client?.gstNumber || "N/A"}</p>
          {invoiceData.client?.phone && (
            <p style={{ margin: "2px 0" }}>Phone: {invoiceData.client.phone}</p>
          )}
          {invoiceData.client?.email && (
            <p style={{ margin: "2px 0" }}>Email: {invoiceData.client.email}</p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
          <p style={{ margin: "2px 0" }}><strong>TAX INVOICE</strong></p>
          <p style={{ margin: "2px 0" }}>Invoice No: {invoiceData.invoiceNumber}</p>
          <p style={{ margin: "2px 0" }}>
            Date: {new Date(invoiceData.invoiceDate).toLocaleDateString("en-GB")}
          </p>
          <p style={{ margin: "2px 0" }}>
            Due Date: {new Date(invoiceData.dueDate).toLocaleDateString("en-GB")}
          </p>
          {invoiceData.poNumber && (
            <p style={{ margin: "2px 0" }}>PO Number: {invoiceData.poNumber}</p>
          )}
        </div>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          textAlign: "left",
          border: "1px solid #999",
          borderCollapse: "collapse",
          marginBottom: "20px",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#e5e7eb" }}>
            <th style={{ border: "1px solid #999", padding: "8px" }}>Sr. No</th>
            <th style={{ border: "1px solid #999", padding: "8px" }}>Particulars</th>
            {hasHSN && (
              <th style={{ border: "1px solid #999", padding: "8px" }}>HSN/SAC</th>
            )}
            <th style={{ border: "1px solid #999", padding: "8px" }}>
              Quantity ({invoiceData.items[0]?.unitType || "Units"})
            </th>
            <th style={{ border: "1px solid #999", padding: "8px" }}>Rate</th>
            <th style={{ border: "1px solid #999", padding: "8px" }}>Amount</th>
          </tr>
        </thead>

        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #999", padding: "8px", verticalAlign: "top" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #999", padding: "8px", verticalAlign: "top" }}>
                {item.description}
              </td>
              {hasHSN && (
                <td style={{ border: "1px solid #999", padding: "8px", verticalAlign: "top" }}>
                  {item.hsnCode || "-"}
                </td>
              )}
              <td style={{ border: "1px solid #999", padding: "8px", verticalAlign: "top" }}>
                {item.quantity} {item.unitType}
              </td>
              <td style={{ border: "1px solid #999", padding: "8px", verticalAlign: "top", whiteSpace: "pre-line" }}>
                {item.pricingType === "tiered"
                  ? item.pricingTiers
                      .map(
                        (tier) =>
                          `${tier.minValue} – ${
                            tier.maxValue !== null ? tier.maxValue : "Above"
                          } ${item.unitType}: ₹${tier.rate} ${
                            tier.rateType === "unitRate"
                              ? `per ${item.unitType}`
                              : "(slab)"
                          }`
                      )
                      .join("\n")
                  : `₹${item.baseRate}`}
              </td>
              <td style={{ border: "1px solid #999", padding: "8px", verticalAlign: "top" }}>
                ₹{item.subtotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "300px" }}>
          {invoiceData.subtotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #999" }}>
              <span>Sub Total</span>
              <span>₹{invoiceData.subtotal.toFixed(2)}</span>
            </div>
          )}

          {invoiceData.discount > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #999" }}>
                <span>Discount</span>
                <span>
                  -₹{invoiceData.discount}{" "}
                  {invoiceData.discountType === "percentage" ? "%" : ""}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #999" }}>
                <span>Taxable Amount</span>
                <span>₹{taxableAmount.toFixed(2)}</span>
              </div>
            </>
          )}

          {invoiceData.taxes && invoiceData.taxes.length > 0 && (
            <div>
              {invoiceData.taxes.map((tax, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #999" }}>
                  <span>{tax.name} @{tax.rate}%</span>
                  <span>₹{tax.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", padding: "8px", borderTop: "2px solid #999" }}>
            <span>Total</span>
            <span>₹{invoiceData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      {invoiceData.paymentTerms && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f9fafb", border: "1px solid #d1d5db" }}>
          <p style={{ fontWeight: "600", marginBottom: "5px" }}>Payment Terms:</p>
          <p style={{ fontSize: "13px" }}>{invoiceData.paymentTerms}</p>
        </div>
      )}

      {/* Footer with Bank Details */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "12px", 
            border: "1px solid #dee2e6",
            borderRadius: "4px"
          }}>
            <p style={{ fontWeight: "600", marginBottom: "8px", color: "#2c3e50" }}>Bank Details:</p>
            {currentUser.bankDetails?.accountHolderName && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>Account Holder:</strong> {currentUser.bankDetails.accountHolderName}
              </p>
            )}
            {currentUser.bankDetails?.bankName && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>Bank Name:</strong> {currentUser.bankDetails.bankName}
              </p>
            )}
            {currentUser.bankDetails?.branchName && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>Branch:</strong> {currentUser.bankDetails.branchName}
              </p>
            )}
            {currentUser.bankDetails?.accountType && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>Account Type:</strong> {formatAccountType(currentUser.bankDetails.accountType)} Account
              </p>
            )}
            {currentUser.bankDetails?.accountNumber && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>Account No:</strong> {currentUser.bankDetails.accountNumber}
              </p>
            )}
            {currentUser.bankDetails?.ifscCode && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>IFSC Code:</strong> {currentUser.bankDetails.ifscCode}
              </p>
            )}
            {currentUser.bankDetails?.upiId && (
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                <strong>UPI ID:</strong> {currentUser.bankDetails.upiId}
              </p>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right", flex: 1 }}>
          <p style={{ fontWeight: "600" }}>For {currentUser.businessName}</p>
          <p style={{ marginTop: "60px" }}>Authorized Signatory</p>
          {/* {invoiceData.notes && (
            <div style={{ marginTop: "20px", fontSize: "12px", fontStyle: "italic" }}>
              <p><strong>Notes:</strong> {invoiceData.notes}</p>
            </div>
          )} */}
        </div>
      </div>

      {/* Terms and Conditions */}
      {invoiceData.notes && (
        <div style={{ marginTop: "20px", padding: "10px", borderTop: "1px solid #d1d5db" }}>
          <p style={{ fontWeight: "600", marginBottom: "5px" }}>Terms & Conditions:</p>
          <p style={{ fontSize: "12px" }}>{invoiceData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default Template1;