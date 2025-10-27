import express from 'express'
import { addPayment, createInvoice, deleteInvoice, deletePayment, getInvoiceById, getInvoices, getPaymentHistory, updateInvoice, updatePayment } from '../controllers/invoice.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router()

router.post("/create-invoice", isAuthenticated, createInvoice);
router.get("/", isAuthenticated, getInvoices);
router.get("/:id", isAuthenticated, getInvoiceById);
router.patch("/update-invoice/:id", isAuthenticated, updateInvoice);
router.delete("/delete-invoice/:id", isAuthenticated, deleteInvoice);
//delete invoice item
// router.delete("/:invoiceId/items/:itemId", isAuthenticated, deleteInvoiceItem);


// Payment routes
router.post('/:id/payments', isAuthenticated, addPayment)
router.get('/:id/payments', isAuthenticated, getPaymentHistory)
router.patch('/:id/payments/:paymentId', isAuthenticated, updatePayment)
router.delete('/:id/payments/:paymentId', isAuthenticated, deletePayment)


export default router