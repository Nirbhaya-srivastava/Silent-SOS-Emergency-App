import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(6, 'Valid phone number is required').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().min(6, 'Valid phone number is required').max(20),
  email: z.string().email('Valid email is required'),
  relationship: z.string().min(2, 'Relationship is required').max(40),
  notificationChannels: z
    .array(z.enum(['SMS', 'Email', 'In-App']))
    .min(1, 'Select at least one notification channel'),
  isActive: z.boolean().optional().default(true),
});

export const updateContactSchema = createContactSchema.partial();

export const createAlertSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional().default(10),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional().default(10),
});

export const acknowledgeAlertSchema = z.object({
  note: z.string().max(300).optional(),
});

export const resolveAlertSchema = z.object({
  note: z.string().max(300).optional(),
});
