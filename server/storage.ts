import mongoose from "mongoose";
import {
  User, Complaint, Booking, ConferenceRoom,
  InsertComplaint, InsertBooking, UpsertUser
} from "@shared/schema";
import { UserModel, ComplaintModel, BookingModel, RoomModel } from "./models/mongo";

export interface IStorage {
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<void>;
  // Complaints
  createComplaint(complaint: InsertComplaint & { userId: string }): Promise<Complaint>;
  getComplaints(userId?: string): Promise<(Complaint & { user: User | null })[]>;
  getComplaintById(id: string): Promise<Complaint | undefined>;
  getComplaintStats(): Promise<any>;
  resolveComplaint(id: string, comment: string): Promise<Complaint>;

  // Rooms
  getRooms(): Promise<ConferenceRoom[]>;
  getRoom(id: number): Promise<ConferenceRoom | undefined>;

  // Bookings
  createBooking(booking: InsertBooking & { userId: string }): Promise<Booking>;
  getBookings(userId?: string): Promise<Booking[]>;
  checkAvailability(roomId: number, startTime: Date, endTime: Date): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? user.toJSON() as User : undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const user = await UserModel.findById(id);
      if (user) return user.toJSON() as User;
    }
    const user = await UserModel.findOne({ email: id });
    return user ? user.toJSON() as User : undefined;
  }

  async createUser(user: UpsertUser): Promise<User> {
    const newUser = await UserModel.create(user);
    return newUser.toJSON() as User;
  }

  async upsertUser(user: UpsertUser): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email: user.email },
      user,
      { upsert: true, new: true }
    );
  }

  // Complaints
  async createComplaint(complaint: InsertComplaint & { userId: string }): Promise<Complaint> {
    const newComplaint = await ComplaintModel.create(complaint);
    return newComplaint.toJSON() as Complaint;
  }

  async getComplaints(userId?: string): Promise<(Complaint & { user: User | null })[]> {
    const query = userId ? { userId } : {};
    const complaints = await ComplaintModel.find(query).sort({ createdAt: -1 });

    const results = await Promise.all(complaints.map(async (c: any) => {
      const u = await UserModel.findOne({ _id: c.userId }) || await UserModel.findOne({ email: c.userId });
      const cJson = c.toJSON() as Complaint;
      return { ...cJson, user: u ? u.toJSON() as User : null };
    }));

    return results;
  }

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const complaint = await ComplaintModel.findById(id);
      if (complaint) return complaint.toJSON() as Complaint;
    }
    return undefined;
  }

  async getComplaintStats(): Promise<any> {
    const total = await ComplaintModel.countDocuments();
    const resolved = await ComplaintModel.countDocuments({ status: 'resolved' });
    const pending = total - resolved;

    const agg = await ComplaintModel.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const byDepartment: any = {};
    agg.forEach((a: any) => { byDepartment[a._id] = a.count; });

    return { total, resolved, pending, byDepartment };
  }

  async resolveComplaint(id: string, comment: string): Promise<Complaint> {
    const complaint = await ComplaintModel.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        resolutionComment: comment,
        resolvedAt: new Date()
      },
      { new: true }
    );
    if (!complaint) throw new Error("Complaint not found");
    return complaint.toJSON() as Complaint;
  }

  // Rooms
  async getRooms(): Promise<ConferenceRoom[]> {
    const rooms = await RoomModel.find();
    return rooms.map((r: any) => r.toJSON() as ConferenceRoom);
  }

  async getRoom(id: number): Promise<ConferenceRoom | undefined> {
    const room = await RoomModel.findById(id);
    return room ? room.toJSON() as ConferenceRoom : undefined;
  }

  // Bookings
  async createBooking(booking: InsertBooking & { userId: string }): Promise<Booking> {
    const newBooking = await BookingModel.create(booking);
    return newBooking.toJSON() as Booking;
  }

  async getBookings(userId?: string): Promise<Booking[]> {
    const query = userId ? { userId } : {};
    const bookings = await BookingModel.find(query).sort({ startTime: 1 });
    return bookings.map((b: any) => b.toJSON() as Booking);
  }

  async checkAvailability(roomId: number, startTime: Date, endTime: Date): Promise<boolean> {
    const count = await BookingModel.countDocuments({
      roomId,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });
    return count === 0;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private complaints: Map<string, Complaint> = new Map();
  private rooms: Map<number, ConferenceRoom> = new Map();
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    const initialRooms: ConferenceRoom[] = [
      {
        id: 1,
        name: "C V Raman (8)",
        capacity: 8,
        location: "Hyderabad",
        building: "NOB",
        floor: "3rd Floor",
        amenities: ["Projector", "Table"],
        isOccupied: false
      },
      {
        id: 2,
        name: "Mother Teresa (15)",
        capacity: 15,
        location: "Hyderabad",
        building: "NOB",
        floor: "3rd Floor",
        amenities: ["Video Conf", "Whiteboard"],
        isOccupied: false
      },
      {
        id: 3,
        name: "APJ Abdul Kalam (12)",
        capacity: 12,
        location: "Hyderabad",
        building: "SOB",
        floor: "2nd Floor",
        amenities: ["Projector", "Wifi"],
        isOccupied: false
      }
    ];
    initialRooms.forEach(r => this.rooms.set(r.id, r));

    // Seed default accounts
    const adminUser: User = {
      id: "admin-1",
      email: "suvethavenkatesan@gmail.com",
      username: "suvethavenkatesan@gmail.com",
      firstName: "Suvetha",
      lastName: "Venkatesan",
      role: "admin",
      password: "admin123"
    };
    this.users.set(adminUser.id, adminUser);

    const defaultUser: User = {
      id: "user-1",
      email: "user@example.com",
      username: "user@example.com",
      firstName: "Standard",
      lastName: "User",
      role: "user",
      password: "user123"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id) || Array.from(this.users.values()).find(u => u.email === id);
  }

  async createUser(user: UpsertUser): Promise<User> {
    const id = user.id || Math.random().toString(36).substring(2, 10);
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async upsertUser(user: UpsertUser): Promise<void> {
    const existing = await this.getUserByEmail(user.email);
    const id = existing ? existing.id : (user.id || Math.random().toString(36).substring(2, 10));
    this.users.set(id, { ...user, id });
  }

  async createComplaint(complaint: InsertComplaint & { userId: string }): Promise<Complaint> {
    const id = Math.random().toString(36).substring(2, 10);
    const newComplaint: Complaint = {
      ...complaint,
      id,
      status: "pending",
      createdAt: new Date()
    };
    this.complaints.set(id, newComplaint);
    return newComplaint;
  }

  async getComplaints(userId?: string): Promise<(Complaint & { user: User | null })[]> {
    let list = Array.from(this.complaints.values());
    if (userId) list = list.filter(c => c.userId === userId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map(c => {
      const u = this.users.get(c.userId) || Array.from(this.users.values()).find(x => x.email === c.userId) || null;
      return { ...c, user: u };
    });
  }

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async getComplaintStats(): Promise<any> {
    const all = Array.from(this.complaints.values());
    const total = all.length;
    const resolved = all.filter(c => c.status === 'resolved').length;
    const pending = total - resolved;
    const byDepartment: Record<string, number> = {};
    all.forEach(c => {
      byDepartment[c.department] = (byDepartment[c.department] || 0) + 1;
    });
    return { total, resolved, pending, byDepartment };
  }

  async resolveComplaint(id: string, comment: string): Promise<Complaint> {
    const complaint = this.complaints.get(id);
    if (!complaint) throw new Error("Complaint not found");
    complaint.status = "resolved";
    complaint.resolutionComment = comment;
    complaint.resolvedAt = new Date();
    this.complaints.set(id, complaint);
    return complaint;
  }

  async getRooms(): Promise<ConferenceRoom[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: number): Promise<ConferenceRoom | undefined> {
    return this.rooms.get(id);
  }

  async createBooking(booking: InsertBooking & { userId: string }): Promise<Booking> {
    const id = Math.random().toString(36).substring(2, 10);
    const newBooking: Booking = { ...booking, id };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBookings(userId?: string): Promise<Booking[]> {
    let list = Array.from(this.bookings.values());
    if (userId) list = list.filter(b => b.userId === userId);
    list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return list;
  }

  async checkAvailability(roomId: number, startTime: Date, endTime: Date): Promise<boolean> {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const overlapping = Array.from(this.bookings.values()).filter(b => {
      if (b.roomId !== roomId) return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return (bStart < end && bEnd > start);
    });
    return overlapping.length === 0;
  }
}

export class SmartStorage implements IStorage {
  private dbStorage = new DatabaseStorage();
  private memStorage = new MemStorage();

  private get activeStorage(): IStorage {
    return (mongoose.connection && mongoose.connection.readyState === 1)
      ? this.dbStorage
      : this.memStorage;
  }

  getUserByEmail(email: string) { return this.activeStorage.getUserByEmail(email); }
  getUserById(id: string) { return this.activeStorage.getUserById(id); }
  createUser(user: UpsertUser) { return this.activeStorage.createUser(user); }
  upsertUser(user: UpsertUser) { return this.activeStorage.upsertUser(user); }
  createComplaint(complaint: InsertComplaint & { userId: string }) { return this.activeStorage.createComplaint(complaint); }
  getComplaints(userId?: string) { return this.activeStorage.getComplaints(userId); }
  getComplaintById(id: string) { return this.activeStorage.getComplaintById(id); }
  getComplaintStats() { return this.activeStorage.getComplaintStats(); }
  resolveComplaint(id: string, comment: string) { return this.activeStorage.resolveComplaint(id, comment); }
  getRooms() { return this.activeStorage.getRooms(); }
  getRoom(id: number) { return this.activeStorage.getRoom(id); }
  createBooking(booking: InsertBooking & { userId: string }) { return this.activeStorage.createBooking(booking); }
  getBookings(userId?: string) { return this.activeStorage.getBookings(userId); }
  checkAvailability(roomId: number, startTime: Date, endTime: Date) { return this.activeStorage.checkAvailability(roomId, startTime, endTime); }
}

export const storage = new SmartStorage();


