// Types API pour corriger les erreurs TypeScript
import { z } from "zod";

export const CreateUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  balance: z.string(),
  totalWinnings: z.string(),
  referralCode: z.string(),
  referredBy: z.string().nullable().optional(),
  referralBonus: z.string(),
  referralCount: z.number(),
  isAdmin: z.boolean(),
  isBlocked: z.boolean(),
  language: z.string(),
  smsNotifications: z.boolean(),
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;