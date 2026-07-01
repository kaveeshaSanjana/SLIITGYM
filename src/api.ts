import { User, Member, Instructor, Payment, Attendance, HealthRecord, MembershipPlan, WorkoutClass, DoorDevice, AccessLog, Role } from './types';

// Use VITE_API_BASE from .env to point API calls to the backend server.
// e.g. VITE_API_BASE=http://localhost:8080 → calls go to http://localhost:8080/users/login etc.
const API_BASE = (import.meta.env.VITE_API_BASE || '/api').trim();

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.errors && typeof body.errors === 'object') {
        const fieldErrors = Object.values(body.errors).join(', ');
        message = fieldErrors || body.message || message;
      } else if (body.message) {
        message = body.message;
      }
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Response Mappers (backend → frontend) ---

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mapUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: (data.role?.toLowerCase() || 'member') as Role,
    avatar: data.avatar,
    studentId: data.studentId,
    birthday: data.birthday,
    onboarded: data.onboarded ?? true,
  };
}

function mapMember(data: any): Member {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: 'member',
    avatar: data.avatar,
    onboarded: data.onboarded ?? true,
    studentId: data.studentId,
    birthday: data.birthday,
    joinedDate: data.joinedDate || '',
    planId: data.plan?.id || '',
    membershipType: capitalize(data.membershipType || 'Regular') as Member['membershipType'],
    status: capitalize(data.status || 'Active') as Member['status'],
    instructorId: data.instructor?.id,
    qrCode: data.qrCode,
    phone: data.phone,
    address: data.address,
    cardId: data.cardId,
  };
}

function mapInstructor(data: any): Instructor {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: 'instructor',
    avatar: data.avatar,
    onboarded: data.onboarded ?? true,
    studentId: data.studentId,
    birthday: data.birthday,
    specialization: data.specialization || '',
    experience: data.experience || '',
    membersCount: data.membersCount || 0,
    workingHours: data.workingHours,
  };
}

function mapPlan(data: any): MembershipPlan {
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    duration: data.duration,
    benefits: data.benefits || [],
  };
}

function mapWorkoutClass(data: any): WorkoutClass {
  return {
    id: data.id,
    name: data.name,
    type: capitalize(data.type || 'Cardio') as WorkoutClass['type'],
    trainerId: data.trainer?.id || data.trainerId || '',
    schedule: data.schedule || '',
    capacity: data.capacity || 0,
    enrolledCount: data.enrolledCount || 0,
    enrolledMemberIds: data.enrolledMemberIds || [],
  };
}

function mapPayment(data: any): Payment {
  return {
    id: data.id,
    memberId: data.member?.id || data.memberId || '',
    amount: data.amount,
    date: data.date,
    status: capitalize(data.status || 'Pending') as Payment['status'],
    method: capitalize(data.method || 'Cash') as Payment['method'],
    planName: data.planName || '',
    paymentType: data.paymentType,
    slipReference: data.slipReference,
    slipImageUrl: data.slipImageUrl,
    verifiedBy: data.verifiedBy,
    verifiedDate: data.verifiedDate,
    remarks: data.remarks,
  };
}

function mapAttendance(data: any): Attendance {
  return {
    id: data.id,
    userId: data.user?.id || data.userId || '',
    date: data.date,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    weight: data.weight,
  };
}

function mapHealthRecord(data: any): HealthRecord {
  return {
    id: data.id,
    memberId: data.member?.id || data.memberId || '',
    date: data.date,
    height: data.height,
    weight: data.weight,
    workingTime: data.workingTime,
    caloriesBurned: data.caloriesBurned,
  };
}

function mapDoorDevice(data: any): DoorDevice {
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    status: (data.status === 'ONLINE' ? 'Online' : 'Offline') as DoorDevice['status'],
    lastHeartbeat: data.lastHeartbeat,
    totalAccessToday: data.totalAccessToday || 0,
  };
}

function mapAccessLog(data: any): AccessLog {
  return {
    id: data.id,
    deviceId: data.device?.id || '',
    deviceName: data.device?.name,
    memberId: data.member?.id,
    memberName: data.member?.name,
    cardId: data.cardId,
    timestamp: data.timestamp,
    date: data.date,
    result: (data.result === 'GRANTED' ? 'Granted' : 'Denied') as AccessLog['result'],
    reason: data.reason || '',
  };
}

function mapEquipment(data: any): Equipment {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    status: data.status,
    location: data.location,
  };
}

function mapEquipmentActivity(data: any): EquipmentActivity {
  return {
    id: data.id,
    equipment: mapEquipment(data.equipment),
    member: mapMember(data.member),
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime || null,
  };
}

// --- Users ---
export const apiUsers = {
  getAll: () => request<any[]>('/users').then(arr => arr.map(mapUser)),
  getById: (id: string) => request<any>(`/users/${encodeURIComponent(id)}`).then(mapUser),
  checkEmail: (email: string) => request<{ exists: boolean; hasPassword: boolean }>(`/users/check-email?email=${encodeURIComponent(email)}`),
  login: (email: string, password?: string) => request<any>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then(mapUser),
  setPassword: (id: string, password: string) => request<any>(`/users/${encodeURIComponent(id)}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  }).then(mapUser),
  onboard: (id: string, data: { name: string; birthday?: string }) =>
    request<any>(`/users/${encodeURIComponent(id)}/onboard`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(mapUser),
};

// --- Members ---
export const apiMembers = {
  getAll: () => request<any[]>('/members').then(arr => arr.map(mapMember)),
  getById: (id: string) => request<any>(`/members/${encodeURIComponent(id)}`).then(mapMember),
  getByInstructor: (instructorId: string) => request<any[]>(`/members/instructor/${encodeURIComponent(instructorId)}`).then(arr => arr.map(mapMember)),
  create: (data: {
    id: string; name: string; email: string; avatar?: string; joinedDate: string;
    planId?: string; membershipType: string; status: string; instructorId?: string;
    qrCode?: string; phone?: string; address?: string; cardId?: string;
  }) => request<any>('/members', {
    method: 'POST',
    body: JSON.stringify({
      id: data.id, name: data.name, email: data.email, avatar: data.avatar,
      joinedDate: data.joinedDate, planId: data.planId,
      membershipType: data.membershipType.toUpperCase(),
      status: data.status.toUpperCase(),
      instructorId: data.instructorId, qrCode: data.qrCode,
      phone: data.phone, address: data.address, cardId: data.cardId,
    }),
  }).then(mapMember),
  update: (id: string, data: any) => request<any>(`/members/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...data,
      membershipType: data.membershipType?.toUpperCase(),
      status: data.status?.toUpperCase(),
    }),
  }).then(mapMember),
  delete: (id: string) => request<void>(`/members/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Instructors ---
export const apiInstructors = {
  getAll: () => request<any[]>('/instructors').then(arr => arr.map(mapInstructor)),
  getById: (id: string) => request<any>(`/instructors/${encodeURIComponent(id)}`).then(mapInstructor),
  create: (data: any) => request<any>('/instructors', { method: 'POST', body: JSON.stringify(data) }).then(mapInstructor),
  update: (id: string, data: any) => request<any>(`/instructors/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapInstructor),
  delete: (id: string) => request<void>(`/instructors/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Membership Plans ---
export const apiPlans = {
  getAll: () => request<any[]>('/plans').then(arr => arr.map(mapPlan)),
  getById: (id: string) => request<any>(`/plans/${encodeURIComponent(id)}`).then(mapPlan),
  create: (data: any) => request<any>('/plans', { method: 'POST', body: JSON.stringify(data) }).then(mapPlan),
  update: (id: string, data: any) => request<any>(`/plans/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapPlan),
  delete: (id: string) => request<void>(`/plans/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Workout Classes ---
export const apiClasses = {
  getAll: () => request<any[]>('/classes').then(arr => arr.map(mapWorkoutClass)),
  getById: (id: string) => request<any>(`/classes/${encodeURIComponent(id)}`).then(mapWorkoutClass),
  getByType: (type: string) => request<any[]>(`/classes/type/${encodeURIComponent(type)}`).then(arr => arr.map(mapWorkoutClass)),
  getByTrainer: (trainerId: string) => request<any[]>(`/classes/trainer/${encodeURIComponent(trainerId)}`).then(arr => arr.map(mapWorkoutClass)),
  create: (data: { id: string; name: string; type: string; trainerId: string; schedule: string; capacity: number; enrolledCount: number; enrolledMemberIds?: string[] }) =>
    request<any>('/classes', {
      method: 'POST',
      body: JSON.stringify({
        id: data.id, name: data.name, type: data.type.toUpperCase(),
        trainerId: data.trainerId, schedule: data.schedule,
        capacity: data.capacity, enrolledCount: data.enrolledCount,
        enrolledMemberIds: data.enrolledMemberIds || [],
      }),
    }).then(mapWorkoutClass),
  update: (id: string, data: { name: string; type: string; trainerId: string; schedule: string; capacity: number; enrolledCount: number; enrolledMemberIds?: string[] }) =>
    request<any>(`/classes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: data.name, type: data.type.toUpperCase(),
        trainerId: data.trainerId, schedule: data.schedule,
        capacity: data.capacity, enrolledCount: data.enrolledCount,
        enrolledMemberIds: data.enrolledMemberIds || [],
      }),
    }).then(mapWorkoutClass),
  delete: (id: string) => request<void>(`/classes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Payments ---
export const apiPayments = {
  getAll: () => request<any[]>('/payments').then(arr => arr.map(mapPayment)),
  getById: (id: string) => request<any>(`/payments/${encodeURIComponent(id)}`).then(mapPayment),
  getByMember: (memberId: string) => request<any[]>(`/payments/member/${encodeURIComponent(memberId)}`).then(arr => arr.map(mapPayment)),
  create: (data: {
    memberId: string; amount: number; date: string; status: string; method: string;  planName: string;
  paymentType: 'PHYSICAL' | 'ONLINE';
  slipReference?: string;
  slipImageUrl?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  }) => request<any>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      memberId: data.memberId, amount: data.amount, date: data.date,
      status: data.status.toUpperCase(), method: data.method.toUpperCase(),
      planName: data.planName, paymentType: data.paymentType,
      slipReference: data.slipReference, slipImageUrl: data.slipImageUrl,
      remarks: (data as any).remarks, // Remarks is missing in type above, but using it
    }),
  }).then(mapPayment),
  update: (id: string, data: any) => request<any>(`/payments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...data,
      status: data.status?.toUpperCase(),
      method: data.method?.toUpperCase(),
    }),
  }).then(mapPayment),
  verify: (id: string, adminId: string, action: 'approve' | 'reject') =>
    request<any>(`/payments/${encodeURIComponent(id)}/verify?adminId=${encodeURIComponent(adminId)}&action=${action}`, {
      method: 'PUT',
    }).then(mapPayment),
  delete: (id: string) => request<void>(`/payments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Attendance ---
export const apiAttendance = {
  getAll: () => request<any[]>('/attendance').then(arr => arr.map(mapAttendance)),
  getById: (id: string) => request<any>(`/attendance/${encodeURIComponent(id)}`).then(mapAttendance),
  getByUser: (userId: string) => request<any[]>(`/attendance/user/${encodeURIComponent(userId)}`).then(arr => arr.map(mapAttendance)),
  getByDate: (date: string) => request<any[]>(`/attendance/date/${encodeURIComponent(date)}`).then(arr => arr.map(mapAttendance)),
  create: (data: { userId: string; date: string; checkIn?: string; checkOut?: string; weight?: number; }) =>
    request<any>('/attendance', { method: 'POST', body: JSON.stringify(data) }).then(mapAttendance),
  update: (id: string, data: any) => request<any>(`/attendance/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapAttendance),
  delete: (id: string) => request<void>(`/attendance/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Health Records ---
export const apiHealthRecords = {
  getAll: () => request<any[]>('/health-records').then(arr => arr.map(mapHealthRecord)),
  getById: (id: string) => request<any>(`/health-records/${encodeURIComponent(id)}`).then(mapHealthRecord),
  getByMember: (memberId: string) => request<any[]>(`/health-records/member/${encodeURIComponent(memberId)}`).then(arr => arr.map(mapHealthRecord)),
  create: (data: {
    memberId: string; date: string; height: number; weight: number; workingTime: number; caloriesBurned: number;
  }) => request<any>('/health-records', { method: 'POST', body: JSON.stringify(data) }).then(mapHealthRecord),
  update: (id: string, data: any) => request<any>(`/health-records/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapHealthRecord),
  delete: (id: string) => request<void>(`/health-records/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// --- Bulk data loader - each endpoint resolves independently so one failure doesn't block the rest ---
async function safeLoad<T>(promise: Promise<T[]>): Promise<T[]> {
  try { return await promise; } catch { return []; }
}

export async function loadAllData() {
  const [
    usersRaw,
    membersRaw,
    instructorsRaw,
    plansRaw,
    classesRaw,
    paymentsRaw,
    attendanceRaw,
    healthRecordsRaw,
    devicesRaw,
    accessLogsRaw,
    equipmentRaw,
    equipmentActivitiesRaw
  ] = await Promise.all([
    apiUsers.getAll().catch(() => []),
    apiMembers.getAll().catch(() => []),
    apiInstructors.getAll().catch(() => []),
    apiPlans.getAll().catch(() => []),
    apiClasses.getAll().catch(() => []),
    apiPayments.getAll().catch(() => []),
    apiAttendance.getAll().catch(() => []),
    apiHealthRecords.getAll().catch(() => []),
    apiDevices.getAll().catch(() => []),
    apiAccessLogs.getAll().catch(() => []),
    apiEquipment.getAll().catch(() => []),
    apiEquipmentActivities.getAll().catch(() => [])
  ]);

  return {
    users: usersRaw,
    members: membersRaw,
    instructors: instructorsRaw,
    plans: plansRaw,
    classes: classesRaw,
    payments: paymentsRaw,
    attendance: attendanceRaw,
    healthRecords: healthRecordsRaw,
    devices: devicesRaw,
    accessLogs: accessLogsRaw,
    equipment: equipmentRaw,
    equipmentActivities: equipmentActivitiesRaw
  };
}

// --- Equipment API ---
export const apiEquipment = {
  getAll: async () => {
    const data = await request<any[]>('/equipment');
    return data.map(mapEquipment);
  },
  create: async (equipmentData: Partial<Equipment>) => {
    const data = await request<any>('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
    return mapEquipment(data);
  },
  update: async (id: string, equipmentData: Partial<Equipment>) => {
    const data = await request<any>(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData),
    });
    return mapEquipment(data);
  },
  delete: async (id: string) => {
    await request(`/equipment/${id}`, { method: 'DELETE' });
  },
};

export const apiEquipmentActivities = {
  getAll: async () => {
    const data = await request<any[]>('/public/equipment/activity');
    return data.map(mapEquipmentActivity);
  },
  toggleSession: async (memberId: string, equipmentId: string) => {
    const data = await request<any>('/public/equipment/activity/toggle', {
      method: 'POST',
      body: JSON.stringify({ memberId, equipmentId }),
    });
    return mapEquipmentActivity(data);
  },
  getActiveSession: async (memberId: string) => {
    const data = await request<any>(`/public/equipment/activity/active/${encodeURIComponent(memberId)}`);
    return data ? mapEquipmentActivity(data) : null;
  }
};

// --- Devices API ---
export const apiDevices = {
  getAll: () => request<any[]>('/devices').then(arr => arr.map(mapDoorDevice)),
  getById: (id: string) => request<any>(`/devices/${encodeURIComponent(id)}`).then(mapDoorDevice),
  create: (data: { name: string; location: string }) =>
    request<any>('/devices', { method: 'POST', body: JSON.stringify(data) }).then(mapDoorDevice),
  update: (id: string, data: { name: string; location: string }) =>
    request<any>(`/devices/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapDevice),
  delete: (id: string) => request<void>(`/devices/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  heartbeat: (id: string) => request<void>(`/devices/${encodeURIComponent(id)}/heartbeat`, { method: 'POST' }),
  getAccessLogs: (deviceId: string) => request<any[]>(`/devices/${encodeURIComponent(deviceId)}/access-logs`).then(arr => arr.map(mapAccessLog)),
  cardAccess: (deviceId: string, cardId: string) =>
    request<{ granted: boolean; memberName?: string; memberId?: string; reason?: string }>(
      `/devices/${encodeURIComponent(deviceId)}/access`,
      { method: 'POST', body: JSON.stringify({ cardId }) }
    ),
};

// --- Access Logs ---
export const apiAccessLogs = {
  getAll: () => request<any[]>('/devices/access-logs').then(arr => arr.map(mapAccessLog)),
  getByDate: (date: string) => request<any[]>(`/devices/access-logs/date/${encodeURIComponent(date)}`).then(arr => arr.map(mapAccessLog)),
};
