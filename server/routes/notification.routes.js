import express from 'express';
import { sendInvoiceSMS, checkEmailCooldown, logEmailSuccess, sendInvoiceWhatsApp } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/send-sms', sendInvoiceSMS);
router.post('/send-whatsapp', sendInvoiceWhatsApp);
router.post('/check-email-cooldown', checkEmailCooldown);
router.post('/log-email', logEmailSuccess);

export default router;
