export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
}

export interface Studio {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  features: string[];
  pricePerHour: number;
  capacity: number;
  location: string;
}

export interface TimeSlot {
  id: string;
  studioId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isBooked: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  studioId: string;
  timeSlotId: string;
  studio?: Studio;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string; // ISO string
}