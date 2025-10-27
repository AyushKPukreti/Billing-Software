import express from 'express'
import { addBankDetails, addClient, deleteBankDetails, deleteClient, editClient, editUserProfile, getBankDetails, getClientById, getProfile, getUserClients, loginUser, registerUser, updateBankDetails } from '../controllers/user.controller.js'
import { isAuthenticated } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.patch('/update-profile', isAuthenticated, editUserProfile)
router.get('/profile', isAuthenticated, getProfile)

//Add client
router.post('/add-client', isAuthenticated, addClient)
//Edit client
router.patch('/edit-client/:id', isAuthenticated, editClient)
//Get client by ID
router.get('/client/:clientId', isAuthenticated, getClientById)
//Get clients
router.get('/clients', isAuthenticated, getUserClients)   
//Delete client  
router.delete('/delete-client/:clientId', isAuthenticated, deleteClient)

//Add Bank details
router.post('/bank-details', isAuthenticated, addBankDetails);
//Get Bank details
router.get('/bank-details', isAuthenticated, getBankDetails);
//Update Bank details
router.patch('/bank-details', isAuthenticated, updateBankDetails);
//Delete Bank details
router.delete('/bank-details', isAuthenticated, deleteBankDetails);


export default router