import { sendSMS } from "../lib/smsProvider.js";

export const sendInvoiceSMS = async (req, res) => {
  const { to, invoiceNumber, amount, dueDate, customerName } = req.body;

  if (!to) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  // Ensure 'to' has no '+' prefix and has correct country code for MSG91 compatibility
  // If it's a 10-digit number, assume it's Indian (91 prefix)
  let formattedTo = String(to).replace(/\D/g, '');
  if (formattedTo.length === 10) {
    formattedTo = '91' + formattedTo;
  }

  // Construct MSG91 template variables instead of a raw message string
  const templateParams = {
    var1: customerName || 'Customer',
    var2: invoiceNumber,
    var3: amount,
    var4: dueDate
  };

  const result = await sendSMS(formattedTo, templateParams);

  if (result.success) {
    res.status(200).json({ success: true, message: "SMS sent successfully", reqId: result.reqId });
  } else {
    console.error("SMS Send Error:", result);
    const errorMsg = result.error || "Failed to send SMS";

    res.status(500).json({ success: false, message: errorMsg });
  }
};
