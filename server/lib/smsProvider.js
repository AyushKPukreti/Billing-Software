import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const defaultFromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();
const defaultWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER?.trim();

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends an SMS using the Twilio API.
 * abstraction layer to switch providers easily in the future.
 * 
 * @param {string} to Phone number in E.164 format (e.g., '+919876543210')
 * @param {string} message Actual text message to send
 * @param {string} fromNumber (Optional) override default from number
 * @returns {Object} result { success: boolean, message/error string }
 */
export const sendSMS = async (to, message, fromNumber = defaultFromNumber) => {
  if (!client || !fromNumber) {
    console.warn("Twilio credentials missing. Check your .env file.");
    return { success: false, error: "Twilio credentials missing in environment variables" };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });

    return { success: true, reqId: response.sid };
  } catch (error) {
    console.error("Twilio SMS Provider Error:", error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Sends a WhatsApp message using the Twilio API.
 * 
 * @param {string} to Phone number in E.164 format (e.g., '+919876543210')
 * @param {string} message Actual text message to send (must match an approved template)
 * @param {string} fromNumber (Optional) override default from number
 * @returns {Object} result { success: boolean, message/error string }
 */
export const sendWhatsApp = async (to, message) => {
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER?.trim();
  
  if (!client || !fromNumber) {
    console.warn("Twilio WhatsApp credentials missing. Check your .env file.");
    return { success: false, error: "Twilio WhatsApp credentials missing in environment variables" };
  }

  // Handle case where .env already includes "whatsapp:" prefix
  const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  try {
    const response = await client.messages.create({
      body: message,
      from: formattedFrom,
      to: `whatsapp:${to}`
    });

    return { success: true, reqId: response.sid };
  } catch (error) {
    console.error("Twilio WhatsApp Provider Error:", error.message);
    if (error.response && error.response.data) {
      console.error("Twilio Error Details:", error.response.data);
    }
    return { 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : null
    };
  }
};
