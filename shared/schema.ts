import { z } from "zod";

export const insertComplaintSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  department: z.string(),
});

export const insertBookingSchema = z.object({
  roomId: z.number(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface Complaint {
  id: string; // Mongo ID is string
  title: string;
  description: string;
  department: string;
  status: string;
  userId: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolutionComment?: string;
}

export interface ConferenceRoom {
  id: number; // Keeping number for simplicity matching old data, or could switch to string
  name: string;
  capacity: number;
  location?: string;
  building?: string;
  floor?: string;
  amenities?: string[];
  image?: string;
  isOccupied: boolean;
}

export interface Booking {
  id: string;
  roomId: number;
  userId: string;
  startTime: Date;
  endTime: Date;
}

export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type UpsertUser = User; // Simplified for Mongo

