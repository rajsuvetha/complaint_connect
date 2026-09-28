import { z } from 'zod';
import { insertComplaintSchema, insertBookingSchema, Complaint, User, ConferenceRoom, Booking } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  complaints: {
    list: {
      method: 'GET' as const,
      path: '/api/complaints',
      responses: {
        200: z.array(z.custom<Complaint>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/complaints',
      input: insertComplaintSchema,
      responses: {
        201: z.custom<Complaint>(),
        400: errorSchemas.validation,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/complaints/stats',
      responses: {
        200: z.object({
          total: z.number(),
          resolved: z.number(),
          pending: z.number(),
          byDepartment: z.record(z.number()),
        }),
      },
    },
  },
  rooms: {
    list: {
      method: 'GET' as const,
      path: '/api/rooms',
      responses: {
        200: z.array(z.custom<ConferenceRoom>()),
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: insertBookingSchema,
      responses: {
        201: z.custom<Booking>(),
        400: errorSchemas.validation,
        409: z.object({ message: z.string() }), // Conflict/Occupied
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<Booking>()),
      },
    },
  },
};


export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
