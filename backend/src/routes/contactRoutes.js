import { Router } from 'express';
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
} from '../controllers/contactController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const contactRouter = Router();

contactRouter.use(requireAuth);

contactRouter.get('/', getContacts);
contactRouter.post('/', createContact);
contactRouter.patch('/:id', updateContact);
contactRouter.delete('/:id', deleteContact);
