import mongoose, { Schema, Document } from 'mongoose';
import { User, Complaint, Booking, ConferenceRoom } from '@shared/schema';

// Helper to map _id to id
const toJSON = {
    virtuals: true,
    transform: ((doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    })
};

// User Schema
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: String, default: 'user' },
}, { timestamps: true, toJSON });

export const UserModel = mongoose.model<User & Document>('User', userSchema);

// Complaint Schema
const complaintSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, default: 'pending' },
    userId: { type: String, required: true }, // Referencing User ID string
    resolvedAt: { type: Date },
    resolutionComment: { type: String }
}, { timestamps: true, toJSON });

export const ComplaintModel = mongoose.model<Complaint & Document>('Complaint', complaintSchema);

// Conference Room Schema
// We'll use a Counter or just standard _id, but to match legacy interfaces keeping 'id' as number 
// might be tricky with Mongo unless we explicitly store it. 
// For simplicity in this migration, we'll try to stick to auto-generated strings for new IDs on everything 
// EXCEPT Room IDs which are currently numbers. Ideally frontend handles string IDs.
// Let's migrate Room IDs to simple numbers we manage or seeds.
const roomSchema = new Schema({
    _id: { type: Number }, // Explicitly using Number for ID to match interface
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    location: { type: String },
    building: { type: String },
    floor: { type: String },
    amenities: { type: [String] },
    image: { type: String }
}, { toJSON: { ...toJSON, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } } });

export const RoomModel = mongoose.model<ConferenceRoom & Document>('ConferenceRoom', roomSchema);

// Booking Schema
const bookingSchema = new Schema({
    roomId: { type: Number, required: true },
    userId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
}, { timestamps: true, toJSON });

export const BookingModel = mongoose.model<Booking & Document>('Booking', bookingSchema);
