import React, { useContext } from "react";
import { UserContext } from "../context/userContext";

const Template3 = ({ invoiceData, ref, numberToWords }) => {
  const { currentUser } = useContext(UserContext);

  const hasHSN = invoiceData.items.some(
    (item) => item.hsnCode && item.hsnCode.trim() !== ""
  );

  const taxableAmount = invoiceData.subtotal - (invoiceData.discount || 0);

  // Format account type - capitalize first letter
  const formatAccountType = (type) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div
      className="w-full font-sans"
      style={{ padding: "20px", backgroundColor: "#FFFFFF", fontFamily: "Arial, sans-serif" }}
      ref={ref}
    >
      {/* Header with Company Info and Logo */}
      <div style={{ marginBottom: "20px", border: "2px solid #000000" }}>
        <div style={{ padding: "10px", backgroundColor: "#FFF8DC" }}>
          {/* Center - Company Name and Details */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px", color: "#8B0000" }}>
              {currentUser.businessName.toUpperCase()}
            </div>
            <div style={{ fontSize: "12px", marginBottom: "2px", color: "#000000" }}>
              {currentUser.address.street}, {currentUser.address.city},{" "}
              {currentUser.address.state} - {currentUser.address.zipCode},{" "}
              {currentUser.address.country}
            </div>
            <div style={{ fontSize: "12px", marginBottom: "2px", color: "#000000" }}>
              GST No: {currentUser.taxId}
            </div>
            <div style={{ fontSize: "12px", marginBottom: "2px", color: "#000000" }}>
              Mobile: {currentUser.phone}
            </div>
            <div style={{ fontSize: "12px", color: "#000000" }}>
              Email: {currentUser.email}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Header Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "15px" }}>
        <div>
          <div style={{ fontSize: "14px", marginBottom: "3px" }}>
            <strong>{invoiceData.client.companyName}</strong>
          </div>
          <div style={{ fontSize: "14px", marginBottom: "3px" }}>
            GST No: {invoiceData.client?.gstNumber || "N/A"}
          </div>
          <div style={{ fontSize: "14px", marginBottom: "3px" }}>
            {invoiceData.client.address.street},{" "}
            {invoiceData.client.address.city},{" "}
            {invoiceData.client.address.state} -{" "}
            {invoiceData.client.address.zipCode},{" "}
            {invoiceData.client.address.country}
          </div>
          {invoiceData.client?.phone && (
            <div style={{ fontSize: "14px", marginBottom: "3px" }}>
              Phone: {invoiceData.client.phone}
            </div>
          )}
          {invoiceData.client?.email && (
            <div style={{ fontSize: "14px", marginBottom: "3px" }}>
              Email: {invoiceData.client.email}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#000000" }}>
            TAX INVOICE
          </div>
          <div style={{ fontSize: "14px", marginBottom: "5px" }}>
            <strong>Invoice No: {invoiceData.invoiceNumber}</strong>
          </div>
          <div style={{ fontSize: "14px", marginBottom: "5px" }}>
            <strong>Date: {new Date(invoiceData.invoiceDate).toLocaleDateString("en-GB")}</strong>
          </div>
          <div style={{ fontSize: "14px", marginBottom: "5px" }}>
            <strong>Due Date: {new Date(invoiceData.dueDate).toLocaleDateString("en-GB")}</strong>
          </div>
          {invoiceData.poNumber && (
            <div style={{ fontSize: "14px", marginBottom: "5px" }}>
              <strong>PO Number: {invoiceData.poNumber}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Work Details Table - Using proper HTML table for better structure */}
      <table
        style={{
          width: "100%",
          border: "1px solid #000000",
          borderCollapse: "collapse",
          marginBottom: "15px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#F5F5F5" }}>
            <th style={{ border: "1px solid #000000", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", width: "5%" }}>
              SR. No.
            </th>
            <th style={{ border: "1px solid #000000", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", width: "35%" }}>
              PARTICULAR
            </th>
            {hasHSN && (
              <th style={{ border: "1px solid #000000", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", width: "8%" }}>
                HSN/SAC
              </th>
            )}
            <th style={{ border: "1px solid #000000", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", width: "7%" }}>
              QTY
            </th>
            <th style={{ border: "1px solid #000000", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", width: "25%" }}>
              RATE
            </th>
            <th style={{ border: "1px solid #000000", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", width: "10%" }}>
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #000000" }}>
              <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "center", verticalAlign: "top" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #000000", padding: "8px", verticalAlign: "top" }}>
                {item.description}
              </td>
              {hasHSN && (
                <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "center", verticalAlign: "top", fontSize: "12px" }}>
                  {item.hsnCode || "-"}
                </td>
              )}
              <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "center", verticalAlign: "top" }}>
                {item.quantity} {item.unitType}
              </td>
              <td style={{ border: "1px solid #000000", padding: "8px", verticalAlign: "top", fontSize: "12px", lineHeight: "1.3" }}>
                {item.pricingType === "tiered"
                  ? item.pricingTiers.map((tier, i) => (
                      <div key={i} style={{ marginBottom: "4px" }}>
                        {tier.minValue} – {tier.maxValue !== null ? tier.maxValue : "Above"} {item.unitType}: ₹{tier.rate}{" "}
                        {tier.rateType === "unitRate" ? `/ ${item.unitType}` : "(slab)"}
                      </div>
                    ))
                  : `₹${item.baseRate}`}
              </td>
              <td style={{ border: "1px solid #000000", padding: "8px", textAlign: "center", verticalAlign: "top" }}>
                ₹{item.subtotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ marginBottom: "15px" }}>
        {/* Sub Total */}
        {invoiceData.subtotal > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #000000", fontWeight: "bold" }}>
            <div>Sub Total</div>
            <div>₹{invoiceData.subtotal.toFixed(2)}</div>
          </div>
        )}

        {/* Discount */}
        {invoiceData.discount > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #000000", fontWeight: "bold" }}>
              <div>Discount</div>
              <div>- {invoiceData.discountType === "fixed" ? "₹" : ""}{invoiceData.discount}{invoiceData.discountType === "percentage" ? "%" : ""}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #000000", fontWeight: "bold" }}>
              <div>Taxable Amount</div>
              <div>₹{taxableAmount.toFixed(2)}</div>
            </div>
          </>
        )}

        {/* Taxes */}
        {invoiceData.taxes && invoiceData.taxes.length > 0 && invoiceData.taxes.map((tax, index) => (
          <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #000000", fontWeight: "bold" }}>
            <div>{tax.name} @{tax.rate}%</div>
            <div>₹{tax.amount.toFixed(2)}</div>
          </div>
        ))}

        {/* Total */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderTop: "2px solid #000000", fontWeight: "bold", fontSize: "16px" }}>
          <div>TOTAL</div>
          <div>₹{invoiceData.totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Amount in Words */}
      <div style={{ marginBottom: "15px", border: "1px solid #000000", padding: "10px" }}>
        <div style={{ fontSize: "14px" }}>
          <p className="font-bold">Amount in words: </p>
          {numberToWords ? numberToWords(invoiceData.totalAmount) : `Rupees ${invoiceData.totalAmount.toFixed(2)}`} only
        </div>
      </div>

      {/* Payment Terms */}
      {invoiceData.paymentTerms && (
        <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f9fafb", border: "1px solid #000000" }}>
          <div style={{ fontWeight: "600", marginBottom: "5px" }}>Payment Terms:</div>
          <div style={{ fontSize: "13px" }}>{invoiceData.paymentTerms}</div>
        </div>
      )}

      {/* Bank Details and Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "30px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "12px", 
            border: "1px solid #dee2e6",
            borderRadius: "4px"
          }}>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#2c3e50" }}>Bank Details:</div>
            {currentUser.bankDetails?.accountHolderName && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>Account Holder:</strong> {currentUser.bankDetails.accountHolderName}
              </div>
            )}
            {currentUser.bankDetails?.bankName && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>Bank Name:</strong> {currentUser.bankDetails.bankName}
              </div>
            )}
            {currentUser.bankDetails?.branchName && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>Branch:</strong> {currentUser.bankDetails.branchName}
              </div>
            )}
            {currentUser.bankDetails?.accountType && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>Account Type:</strong> {formatAccountType(currentUser.bankDetails.accountType)} Account
              </div>
            )}
            {currentUser.bankDetails?.accountNumber && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>Account No:</strong> {currentUser.bankDetails.accountNumber}
              </div>
            )}
            {currentUser.bankDetails?.ifscCode && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>IFSC Code:</strong> {currentUser.bankDetails.ifscCode}
              </div>
            )}
            {currentUser.bankDetails?.upiId && (
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>UPI ID:</strong> {currentUser.bankDetails.upiId}
              </div>
            )}
          </div>
          
          {/* {invoiceData.notes && (
            <div style={{ marginTop: "15px", fontSize: "12px", fontStyle: "italic" }}>
              <div><strong>Notes:</strong> {invoiceData.notes}</div>
            </div>
          )} */}
        </div>

        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "60px" }}>
            For {currentUser.businessName}
          </div>
          <div style={{ fontSize: "14px" }}>Authorized Signatory</div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {invoiceData.notes && (
        <div style={{ marginTop: "20px", padding: "10px", borderTop: "1px solid #000000" }}>
          <div style={{ fontWeight: "600", marginBottom: "5px" }}>Terms & Conditions:</div>
          <div style={{ fontSize: "12px" }}>{invoiceData.notes}</div>
        </div>
      )}

      {/* Standard Footer */}
      <div style={{ marginTop: "40px", fontSize: "12px", textAlign: "center", color: "#666" }}>
        <div>E. & O.E.</div>
        <div>Subject to {currentUser.address.city} jurisdiction</div>
        <div>This is a computer generated invoice</div>
      </div>
    </div>
  );
};

export default Template3;