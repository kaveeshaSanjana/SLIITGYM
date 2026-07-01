export type Role = 'admin' | 'instructor' | 'member';
export type MembershipType = 'Regular' | 'Premium';
export type ClassType = 'Yoga' | 'Zumba' | 'Cardio' | 'Strength';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  studentId?: string;
  birthday?: string;
  onboarded: boolean;
}

export interface Member extends User {
  role: 'member';
  joinedDate: string;
  planId: string;
  membershipType: MembershipType;
  status: 'Active' | 'Inactive';
  instructorId?: string;
  qrCode?: string;
  phone?: string;
  address?: string;
  cardId?: string;
}

export interface Instructor extends User {
  role: 'instructor';
  specialization: string;
  experience: string;
  membersCount: number;
  workingHours?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g., "Monthly", "Quarterly", "Yearly"
  benefits: string[];
}

export interface WorkoutClass {
  id: string;
  name: string;
  type: ClassType;
  trainerId: string;
  schedule: string; // e.g., "Mon, Wed 10:00 AM"
  capacity: number;
  enrolledCount: number;
  enrolledMemberIds: string[];
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  method: 'Cash' | 'Card' | 'Online';
  planName: string;
  paymentType?: 'PHYSICAL' | 'ONLINE';
  slipReference?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  remarks?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  weight?: number;
}

export interface HealthRecord {
  id: string;
  memberId: string;
  date: string;
  height: number; // cm
  weight: number; // kg
  workingTime: number; // minutes
  caloriesBurned: number;
}

export interface DoorDevice {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline';
  lastHeartbeat?: string;
  totalAccessToday: number;
}

export interface AccessLog {
  id: string;
  deviceId: string;
  deviceName?: string;
  memberId?: string;
  memberName?: string;
  cardId: string;
  timestamp: string;
  date: string;
  result: 'Granted' | 'Denied';
  reason: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  location: string;
}

export interface EquipmentActivity {
  id: string;
  equipment: Equipment;
  member: Member;
  date: string;
  startTime: string;
  endTime: string | null;
}
