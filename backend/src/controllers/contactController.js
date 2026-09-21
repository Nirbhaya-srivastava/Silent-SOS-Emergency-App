import { dbService } from '../services/databaseService.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validators/index.js';

export async function getContacts(req, res, next) {
  try {
    const userId = req.user.id;

    const contacts =
      await dbService.getContactsByUserId(userId);

    res.json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
}

export async function createContact(req, res, next) {
  try {
    const userId = req.user.id;

    const validated =
      createContactSchema.parse(req.body);

    const contact =
      await dbService.createContact(
        userId,
        validated
      );

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;

    const validated =
      updateContactSchema.parse(req.body);

    const updated =
      await dbService.updateContact(
        contactId,
        userId,
        validated
      );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error:
          'Contact not found or access unauthorized',
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req, res, next) {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;

    const deleted =
      await dbService.deleteContact(
        contactId,
        userId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error:
          'Contact not found or access unauthorized',
      });
    }

    res.json({
      success: true,
      message:
        'Contact deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}