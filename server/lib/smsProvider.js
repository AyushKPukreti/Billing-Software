import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const authKey = process.env.MSG91_AUTH_KEY?.trim();
const defaultTemplateId = process.env.MSG91_TEMPLATE_ID?.trim();
const defaultSenderId = process.env.MSG91_SENDER_ID?.trim();

/**
 * Sends an SMS using the MSG91 Flow API.
 * abstraction layer to switch providers easily in the future.
 * 
 * @param {string} to Phone number with country code (e.g., '919876543210' without '+')
 * @param {Object} templateParams Object containing payload variables (e.g., customerName, invoiceNumber, etc.)
 * @param {string} templateId (Optional) override default template ID
 * @param {string} senderId (Optional) override default sender ID
 * @returns {Object} result { success: boolean, message/error string }
 */
export const sendSMS = async (to, templateParams, templateId = defaultTemplateId, senderId = defaultSenderId) => {
  if (!authKey || !templateId || !senderId) {
    console.warn("MSG91 credentials missing. Check your .env file.");
    return { success: false, error: "MSG91 credentials missing in environment variables" };
  }

  try {
    const payload = {
      template_id: templateId,
      sender: senderId,
      short_url: "0",
      mobiles: to, // Format: 919876543210
      ...templateParams
    };

    const response = await axios.post('https://control.msg91.com/api/v5/flow', payload, {
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      }
    });

    // MSG91 typically returns a type="success" or type="error" object
    const data = response.data;
    if (data && data.type === 'error') {
      console.error("MSG91 Delivery Error:", data);
      return { success: false, error: data.message || "Failed to send MSG91 SMS" };
    }

    return { success: true, reqId: data.message };
  } catch (error) {
    console.error("MSG91 SMS Provider Error:", error.response?.data || error.message);
    const apiError = error.response?.data?.message || error.message;
    return { 
      success: false, 
      error: apiError 
    };
  }
};
