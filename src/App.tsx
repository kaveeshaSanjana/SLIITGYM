import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  Dumbbell, 
  Calendar, 
  Activity, 
  LogOut, 
  User as UserIcon, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock,
  QrCode,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Smartphone,
  Shield,
  DoorOpen,
  FileText,
  Eye,
  EyeOff,
  Ban,
  Mail,
  ArrowRight,
  Cake,
  Sparkles,
  Flame,
  Trophy,
  Upload,
  Monitor,
  HeartPulse
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Role, User, Member, Instructor, Payment, Attendance, HealthRecord, MembershipPlan, WorkoutClass, DoorDevice, AccessLog, Equipment, EquipmentActivity } from './types';
import { apiUsers, apiMembers, apiInstructors, apiPayments, apiAttendance, apiHealthRecords, apiPlans, apiClasses, apiDevices, apiAccessLogs, apiEquipment, apiEquipmentActivities, loadAllData } from './api';
import { uploadFileToS3 } from './s3Upload';
import { LandingPage } from './LandingPage';
import { EquipmentManagement } from './EquipmentManagement';
import { ActiveWorkout } from './ActiveWorkout';
import { Leaderboard } from './Leaderboard';
import { AdminReports } from './AdminReports';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Data Context ---

interface AppData {
  users: User[];
  members: Member[];
  instructors: Instructor[];
  plans: MembershipPlan[];
  classes: WorkoutClass[];
  payments: Payment[];
  attendance: Attendance[];
  healthRecords: HealthRecord[];
  devices: DoorDevice[];
  accessLogs: AccessLog[];
  equipment: Equipment[];
  equipmentActivities: EquipmentActivity[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<AppData>({
  users: [], members: [], instructors: [], plans: [], classes: [],
  payments: [], attendance: [], healthRecords: [], devices: [], accessLogs: [],
  equipment: [], equipmentActivities: [],
  loading: true,
  refreshData: async () => {},
});

function useData() {
  return useContext(DataContext);
}

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className={cn("glass rounded-2xl p-6", className)} 
    {...props}
  >
    {children}
  </motion.div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) => {
  const variants = {
    primary: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.45)]",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20",
    ghost: "hover:bg-white/5 text-white/70 hover:text-white",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50"
  };
  
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'lg' }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, size?: 'md' | 'lg' | 'xl' }) => {
  const sizeClass = size === 'md' ? 'max-w-md' : size === 'lg' ? 'max-w-lg' : 'max-w-3xl';
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            className={`w-full ${sizeClass} max-h-[90vh] overflow-y-auto relative rounded-3xl p-8 z-10 bg-slate-900 border border-white/10 shadow-[0_0_50px_-12px_rgba(220,38,38,0.15)]`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={20} className="text-white/40 hover:text-white" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Toast Notification System ---
type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; type: ToastType; exiting?: boolean; }
const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({ toast: () => {} });
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3000);
  }, []);

  const icons = { success: CheckCircle2, error: XCircle, info: AlertTriangle };
  const colors = { success: 'text-green-400 bg-green-500/10 border-green-500/20', error: 'text-red-400 bg-red-500/10 border-red-500/20', info: 'text-red-400 bg-red-500/10 border-red-500/20' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl pointer-events-auto", colors[t.type], t.exiting ? 'toast-exit' : 'toast-enter')}>
              <Icon size={18} />
              <span className="text-sm font-medium text-white">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// --- Confirm Dialog ---
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }: { 
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
        <motion.div 
          className="glass rounded-2xl p-6 w-full max-w-sm relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h4 className="text-lg font-bold mb-2">{title}</h4>
          <p className="text-sm text-white/50 mb-6">{message}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const HealthStatsForm = ({ memberId, onSuccess }: { memberId: string, onSuccess: () => void }) => {
  const { refreshData } = useData();
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    height: '',
    workingTime: '',
    caloriesBurned: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiHealthRecords.create({
        memberId,
        date: formData.date,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        workingTime: parseInt(formData.workingTime),
        caloriesBurned: parseInt(formData.caloriesBurned),
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to save health record:', err);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Date</label>
          <input 
            type="date" 
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Weight (kg)</label>
          <input 
            type="number" 
            step="0.1"
            required
            min="20" max="500"
            placeholder="e.g. 75.5"
            value={formData.weight}
            onChange={e => setFormData({...formData, weight: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Height (cm)</label>
          <input 
            type="number" 
            required
            min="50" max="300"
            placeholder="e.g. 180"
            value={formData.height}
            onChange={e => setFormData({...formData, height: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Workout (min)</label>
          <input 
            type="number" 
            required
            min="0" max="1440"
            placeholder="e.g. 45"
            value={formData.workingTime}
            onChange={e => setFormData({...formData, workingTime: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Calories Burned (kcal)</label>
        <input 
          type="number" 
          required
          min="0" max="10000"
          placeholder="e.g. 350"
          value={formData.caloriesBurned}
          onChange={e => setFormData({...formData, caloriesBurned: e.target.value})}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
        />
      </div>
      <Button type="submit" className="w-full mt-4">Save Daily Stats</Button>
    </form>
  );
};

const HealthHistory = ({ records }: { records: HealthRecord[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-white/40 text-[10px] uppercase tracking-widest">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Weight</th>
            <th className="px-4 py-3 font-medium">Height</th>
            <th className="px-4 py-3 font-medium">Workout</th>
            <th className="px-4 py-3 font-medium">Calories</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {[...records].reverse().map(r => (
            <tr key={r.id} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-xs font-medium">{r.date}</td>
              <td className="px-4 py-3 text-xs">{r.weight} kg</td>
              <td className="px-4 py-3 text-xs">{r.height} cm</td>
              <td className="px-4 py-3 text-xs">{r.workingTime} min</td>
              <td className="px-4 py-3 text-xs text-red-500 font-bold">{r.caloriesBurned} kcal</td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">No health records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const AttendanceMarking = ({ userId, onMarked }: { userId?: string, onMarked: () => void }) => {
  const { users, refreshData } = useData();
  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  const [type, setType] = useState<'check-in' | 'check-out'>('check-in');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [weight, setWeight] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiAttendance.create({
        userId: selectedUserId,
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: type === 'check-in' ? time : undefined,
        checkOut: type === 'check-out' ? time : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    }
    onMarked();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!userId && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Select User</label>
          <select 
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white"
            required
          >
            <option value="" disabled className="bg-[#151619]">Choose a member...</option>
            {users.map(u => (
              <option key={u.id} value={u.id} className="bg-[#151619]">{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Action</label>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              type="button"
              onClick={() => setType('check-in')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                type === 'check-in' ? "bg-green-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
              )}
            >Check In</button>
            <button 
              type="button"
              onClick={() => setType('check-out')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                type === 'check-out' ? "bg-red-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
              )}
            >Check Out</button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Time</label>
          <input 
            type="time" 
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
            required
          />
        </div>
      </div>
      {type === 'check-in' && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Current Weight (kg) - Optional</label>
          <input 
            type="number" 
            step="0.1"
            placeholder="e.g. 75.5"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
      )}
      <Button type="submit" className="w-full mt-4">
        {type === 'check-in' ? 'Confirm Check In' : 'Confirm Check Out'}
      </Button>
    </form>
  );
};

// --- Login Page ---

const IS_PRODUCTION = import.meta.env.VITE_MODE === 'production';

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { toast } = useToast();

  const validateEmail = (e: string): string | null => {
    if (!e.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Invalid email format';
    if (IS_PRODUCTION && !e.toLowerCase().endsWith('@my.sliit.lk')) {
      return 'Only @my.sliit.lk emails are allowed';
    }
    return null;
  };

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) { setLoginError(error); return; }
    setLoginError('');
    setLoading(true);
    try {
      const { exists, hasPassword } = await apiUsers.checkEmail(email.toLowerCase().trim());
      if (exists && hasPassword) {
        setLoginStep('password');
      } else {
        // No password set or new user — log in directly (backend auto-creates if new)
        const user = await apiUsers.login(email.toLowerCase().trim());
        if (user.onboarded) toast('Welcome back, ' + user.name + '!');
        onLogin(user);
      }
    } catch {
      setLoginError('Server unavailable. Please ensure the backend is running.');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const user = await apiUsers.login(email.toLowerCase().trim(), password);
      if (user.onboarded) toast('Welcome back, ' + user.name + '!');
      onLogin(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.toLowerCase().includes('password') || message.includes('401')) {
        setLoginError('Incorrect password. Please try again.');
      } else {
        setLoginError('Server unavailable. Please ensure the backend is running.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative overflow-x-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-[#0A0A0A] to-red-950/10" />
        <motion.div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-red-600/8 rounded-full blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <motion.div className="relative z-10 w-full max-w-md m-auto"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

        <div className="glass rounded-3xl p-10 border border-white/[0.08] shadow-[0_0_80px_rgba(220,38,38,0.08)]">
          <div className="flex flex-col items-center mb-10">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mb-5 shadow-[0_0_60px_rgba(220,38,38,0.4)]"
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 14 }}>
              <Dumbbell className="text-white w-10 h-10" />
            </motion.div>
            <motion.h1 className="text-4xl font-black tracking-tight"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              IRON<span className="text-red-400">PULSE</span>
            </motion.h1>
            <motion.p className="text-white/30 text-sm mt-2 tracking-wide"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Gym Management System
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {loginStep === 'email' ? (
              <motion.form key="email-step" onSubmit={handleEmailContinue} className="space-y-4"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                    {IS_PRODUCTION ? 'SLIIT Email (@my.sliit.lk)' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-white/20"
                      placeholder={IS_PRODUCTION ? 'it25103104@my.sliit.lk' : 'your@email.com'}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/15 rounded-xl px-3 py-2.5">
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full py-4 text-sm font-bold tracking-wide rounded-2xl" disabled={loading}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Checking...</> : <><ArrowRight size={18} /> Continue</>}
                </Button>
              </motion.form>
            ) : (
              <motion.form key="password-step" onSubmit={handlePasswordSubmit} className="space-y-4"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}>
                {/* Show which email we're signing into */}
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
                  <Mail size={15} className="text-white/30 shrink-0" />
                  <span className="text-sm text-white/60 truncate">{email}</span>
                  <button type="button" onClick={() => { setLoginStep('email'); setPassword(''); setLoginError(''); }}
                    className="ml-auto text-[10px] text-red-400/70 hover:text-red-400 transition-colors shrink-0">
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-white/20"
                      placeholder="Enter your password..."
                      autoFocus
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/15 rounded-xl px-3 py-2.5">
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full py-4 text-sm font-bold tracking-wide rounded-2xl" disabled={loading}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Signing In...</> : <><ArrowRight size={18} /> Sign In</>}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {!IS_PRODUCTION && (
            <motion.div className="mt-8 pt-6 border-t border-white/[0.04]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <p className="text-[10px] text-center text-white/20 mb-3 uppercase tracking-[0.25em]">Development Quick Login</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Admin', email: 'admin@gym.com' },
                  { label: 'Trainer', email: 'john@gym.com' },
                  { label: 'Member', email: 'alice@gym.com' },
                ].map(d => (
                  <button key={d.email} onClick={() => { setEmail(d.email); setPassword(''); setLoginStep('email'); setLoginError(''); }}
                    className="text-[10px] bg-white/[0.03] hover:bg-white/[0.08] py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.03] font-medium text-white/40 hover:text-white/80 border border-white/[0.04] hover:border-white/[0.1]">
                    {d.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.p className="text-center text-white/15 text-[10px] mt-6 tracking-wider"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          {IS_PRODUCTION ? 'SLIIT Students & Staff Only' : 'Development Mode — Any email accepted'}
        </motion.p>
      </motion.div>
    </div>
  );
};

// --- Onboarding Flow (Apple-style first-time setup) ---

const OnboardingFlow = ({ user, onComplete }: { user: User; onComplete: (updatedUser: User) => void }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = [
    // Step 0: Welcome  
    {
      render: () => (
        <motion.div className="flex flex-col items-center text-center" key="welcome"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(220,38,38,0.4)]"
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 12 }}>
            <Sparkles className="text-white w-12 h-12" />
          </motion.div>
          <motion.h1 className="text-5xl font-black tracking-tight mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Hello
          </motion.h1>
          <motion.p className="text-white/30 text-lg mb-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            Welcome to IronPulse
          </motion.p>
          <motion.div className="mt-4 px-5 py-2.5 bg-white/[0.04] rounded-2xl border border-white/[0.08]"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
            <p className="text-xs text-white/40">Your ID</p>
            <p className="text-red-400 font-mono font-bold text-lg tracking-wider">{user.studentId || user.id}</p>
          </motion.div>
        </motion.div>
      ),
    },
    // Step 1: Name
    {
      render: () => (
        <motion.div className="flex flex-col items-center text-center" key="name"
          initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>
            <UserIcon className="text-white w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-black tracking-tight mb-2">What's your name?</h2>
          <p className="text-white/30 text-sm mb-8">Let us know how to greet you</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            autoFocus
            className="w-full max-w-xs bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-4 text-center text-lg focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/15"
          />
        </motion.div>
      ),
      validate: () => name.trim().length >= 2,
    },
    // Step 2: Birthday
    {
      render: () => (
        <motion.div className="flex flex-col items-center text-center" key="birthday"
          initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(244,63,94,0.3)]"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>
            <Cake className="text-white w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-black tracking-tight mb-2">When's your birthday?</h2>
          <p className="text-white/30 text-sm mb-8">We'll keep this safe</p>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="w-full max-w-xs bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-4 text-center text-lg focus:outline-none focus:border-red-500/50 transition-all"
          />
        </motion.div>
      ),
    },
    // Step 3: Complete (all done)
    {
      render: () => (
        <motion.div className="flex flex-col items-center text-center" key="complete"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(34,197,94,0.35)]"
            initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}>
            <CheckCircle className="text-white w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-black tracking-tight mb-2">You're all set!</h2>
          <p className="text-white/30 text-sm mb-6">
            Welcome aboard, <span className="text-red-400 font-bold">{name}</span>
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">ID</p>
              <p className="font-mono font-bold text-sm text-red-400">{user.studentId || user.id}</p>
            </div>
            <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Role</p>
              <p className="font-bold text-sm capitalize">{user.role}</p>
            </div>
          </div>
        </motion.div>
      ),
      isFinal: true,
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = !currentStep.validate || currentStep.validate();

  const handleNext = async () => {
    if (isLastStep) {
      // Submit all data to backend at once
      setSubmitting(true);
      try {
        const updatedUser = await apiUsers.onboard(user.id, {
          name: name.trim(),
          birthday: birthday || undefined,
        });
        toast('Profile setup complete!');
        onComplete(updatedUser);
      } catch (err) {
        toast('Failed to save profile', 'error');
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative overflow-x-hidden bg-[#0A0A0A]">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/15 via-[#0A0A0A] to-blue-950/10" />
        <motion.div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-red-500/8 rounded-full blur-[150px]"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-1/3 -right-40 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg m-auto">
        {/* Progress dots */}
        <motion.div className="flex justify-center gap-2 mb-10"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {steps.map((_, i) => (
            <motion.div key={i}
              className={cn("h-1.5 rounded-full transition-all duration-500",
                i === step ? "w-8 bg-red-500" : i < step ? "w-3 bg-red-500/40" : "w-3 bg-white/10")}
              layout />
          ))}
        </motion.div>

        {/* Step content */}
        <div className="glass rounded-3xl p-12 border border-white/[0.06] shadow-[0_0_100px_rgba(0,0,0,0.3)] min-h-[400px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {currentStep.render()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div className="flex justify-between items-center mt-8 px-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="text-white/30 hover:text-white/60 text-sm font-medium transition-colors px-4 py-2 rounded-xl hover:bg-white/[0.04]">
              Back
            </button>
          ) : <div />}

          <Button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className="px-8 py-3 rounded-2xl font-bold text-sm gap-2">
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Setting up...</>
            ) : isLastStep ? (
              <><Sparkles size={16} /> Get Started</>
            ) : (
              <>Continue <ArrowRight size={16} /></>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

// --- Dashboard Layout ---

const DashboardLayout = ({ 
  user, 
  onLogout, 
  children,
  activeTab,
  setActiveTab,
  tabs
}: { 
  user: User, 
  onLogout: () => void, 
  children: React.ReactNode,
  activeTab: string,
  setActiveTab: (tab: string) => void,
  tabs: { id: string, label: string, icon: any }[]
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0A] gradient-mesh">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/[0.06] p-6 flex flex-col gap-8 bg-black/20 backdrop-blur-sm">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.25)]">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">IRON<span className="text-red-400">PULSE</span></h1>
        </motion.div>

        <nav className="flex-1 flex flex-col gap-1">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_4px_20px_rgba(220,38,38,0.2)]" 
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <tab.icon size={20} />
              <span className="font-medium text-sm">{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-white/[0.06]">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400/70 hover:text-red-400 hover:bg-red-500/5" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Admin Views ---

const AdminOverview = () => {
  const { members, instructors, payments, classes, equipmentActivities, attendance, equipment } = useData();
  
  const today = new Date().toISOString().split('T')[0];
  const activeWorkoutsCount = equipmentActivities.filter(a => !a.endTime).length;
  const todayCheckins = attendance.filter(a => a.date === today && !a.checkOut).length;
  const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;
  const activeEqCount = equipment.filter(e => e.status === 'ACTIVE').length;

  const stats = [
    { label: 'Total Members', value: members.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Monthly Revenue', value: `LKR ${payments.reduce((acc, p) => acc + p.amount, 0).toFixed(0)}`, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Live Occupancy', value: todayCheckins, icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Active Workouts', value: activeWorkoutsCount, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="flex items-center gap-4 glass-hover cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
                <stat.icon size={64} className={stat.color} />
              </div>
              <div className={cn("p-4 rounded-2xl relative z-10", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
              <div className="relative z-10">
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* New Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Workouts Widget */}
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-red-500 w-5 h-5" />
                Live Active Workouts
              </h3>
              <p className="text-xs text-white/40 mt-1">Members currently using equipment on the floor</p>
            </div>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 font-bold text-xs rounded-full animate-pulse flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              {activeWorkoutsCount} LIVE
            </span>
          </div>
          <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {equipmentActivities.filter(a => !a.endTime).length === 0 ? (
               <div className="text-center py-10 text-white/30 text-sm">No active workouts happening right now.</div>
            ) : (
              equipmentActivities.filter(a => !a.endTime).map((activity, i) => (
                <motion.div 
                  key={activity.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/10">
                      <Dumbbell className="text-red-400 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{activity.member.name}</p>
                      <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {activity.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-400">{activity.equipment.name}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{activity.equipment.location}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* System Health Widget */}
        <Card className="flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xl font-bold">Gym Health</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6 relative z-10">
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Equipment Status</p>
                <span className="text-xs text-white/40">{activeEqCount} / {equipment.length} Online</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${(activeEqCount / equipment.length) * 100}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${(maintenanceCount / equipment.length) * 100}%` }} />
              </div>
              {maintenanceCount > 0 && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {maintenanceCount} machine(s) require maintenance
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-white/60 font-bold uppercase tracking-wider">Floor Capacity</p>
                <span className="text-xs text-white/40">{todayCheckins} checked in</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (todayCheckins / 100) * 100)}%` }} />
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* Legacy Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Payments</h3>
            <span className="text-xs text-white/30">{payments.length} total</span>
          </div>
          <div className="space-y-3">
            {payments.slice(0, 5).map((p, i) => {
              const member = members.find(m => m.id === p.memberId);
              return (
                <motion.div 
                  key={p.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden">
                      <img src={member?.avatar} alt="" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{member?.name}</p>
                      <p className="text-[10px] text-white/35">{p.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">+LKR {p.amount.toFixed(2)}</p>
                    <p className={cn("text-[10px] font-medium", p.status === 'Paid' ? 'text-green-400' : 'text-red-400')}>{p.status}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Enrollments</h3>
            <span className="text-xs text-white/30">{members.length} total</span>
          </div>
          <div className="space-y-3">
            {[...members].sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()).slice(0, 5).map((m, i) => (
              <motion.div 
                key={m.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-all duration-200"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden">
                    <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}&background=random`} alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-[10px] text-white/35">{m.joinedDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{m.membershipType}</p>
                  <p className={cn("text-[10px] font-medium", m.status === 'Active' ? 'text-green-400' : 'text-red-400')}>{m.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Class Schedule</h3>
            <span className="text-xs text-white/30">{classes.length} classes</span>
          </div>
          <div className="space-y-3">
            {classes.map((c, i) => {
              const trainer = instructors.find(i => i.id === c.trainerId);
              const capacityPct = c.capacity > 0 ? Math.round((c.enrolledCount / c.capacity) * 100) : 0;
              return (
                <motion.div 
                  key={c.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Clock size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[10px] text-white/35">{c.schedule}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", capacityPct > 80 ? 'bg-red-500' : 'bg-red-500')} style={{ width: `${capacityPct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white/60 w-10 text-right">{c.enrolledCount}/{c.capacity}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MemberList = () => {
  const { members, instructors, plans, refreshData } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '', email: '', phone: '', address: '', planId: '', instructorId: '', membershipType: 'Regular', cardId: '', avatar: ''
  });

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiMembers.create({
        id: 'mem' + Date.now(),
        name: newMember.name,
        email: newMember.email,
        avatar: newMember.avatar || undefined,
        joinedDate: format(new Date(), 'yyyy-MM-dd'),
        planId: newMember.planId || undefined,
        membershipType: newMember.membershipType,
        status: 'Active',
        instructorId: newMember.instructorId || undefined,
        qrCode: newMember.name.split(' ')[0].toUpperCase() + '-MEM-' + Date.now().toString().slice(-3),
        phone: newMember.phone,
        address: newMember.address,
        cardId: newMember.cardId || undefined,
      });
      await refreshData();
      setIsAddOpen(false);
      setNewMember({ name: '', email: '', phone: '', address: '', planId: '', instructorId: '', membershipType: 'Regular', cardId: '', avatar: '' });
      toast('Member registered successfully');
    } catch (err: any) {
      console.error('Failed to add member:', err);
      toast(err.message || 'Failed to register member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    setSubmitting(true);
    try {
      await apiMembers.update(editMember.id, {
        name: editMember.name,
        email: editMember.email,
        phone: editMember.phone,
        address: editMember.address,
        planId: editMember.planId || undefined,
        instructorId: editMember.instructorId || undefined,
        membershipType: editMember.membershipType,
        status: editMember.status,
        joinedDate: editMember.joinedDate,
        qrCode: editMember.qrCode,
        cardId: editMember.cardId,
        avatar: editMember.avatar,
      });
      await refreshData();
      setIsEditOpen(false);
      setEditMember(null);
      toast('Member updated successfully');
    } catch (err: any) {
      console.error('Failed to update member:', err);
      toast(err.message || 'Failed to update member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await apiMembers.delete(id);
      await refreshData();
      toast('Member deleted');
    } catch (err) {
      console.error('Failed to delete member:', err);
      toast('Failed to delete member', 'error');
    }
  };

  const openEdit = (m: Member) => {
    setEditMember({ ...m });
    setIsEditOpen(true);
  };

  const [pwTarget, setPwTarget] = useState<{ id: string; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTarget || !newPw.trim()) return;
    setPwSubmitting(true);
    try {
      await apiUsers.setPassword(pwTarget.id, newPw.trim());
      toast(`Password updated for ${pwTarget.name}`);
      setPwTarget(null);
      setNewPw('');
    } catch (err: any) {
      toast(err.message || 'Failed to set password', 'error');
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold">Member Management</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:border-red-500/50"
            />
          </div>
          <Button className="whitespace-nowrap" onClick={() => setIsAddOpen(true)}>
            <Plus size={18} />
            <span>Register Member</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
              <th className="px-4 py-4 font-medium">Member</th>
              <th className="px-4 py-4 font-medium">Type</th>
              <th className="px-4 py-4 font-medium">Joined</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Instructor</th>
              <th className="px-4 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMembers.map((m, i) => (
              <motion.tr 
                key={m.id} 
                className="hover:bg-white/[0.03] transition-colors group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}&background=random`} className="w-10 h-10 rounded-lg" alt="" />
                    <div>
                      <p className="text-sm font-bold">{m.name}</p>
                      <p className="text-xs text-white/40">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    m.membershipType === 'Premium' ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-white/60'
                  )}>
                    {m.membershipType}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-white/60">{m.joinedDate}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", m.status === 'Active' ? 'bg-green-500 pulse-dot' : 'bg-white/20')} />
                    <span className="text-xs">{m.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-white/60">
                  {instructors.find(i => i.id === m.instructorId)?.name || 'None'}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setPwTarget({ id: m.id, name: m.name }); setNewPw(''); }} title="Set Password"
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-yellow-400 transition-colors">
                      <Shield size={15} />
                    </button>
                    <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(m.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Member" size="xl">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Name</label>
              <input type="text" required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Email</label>
              <input type="email" required value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Phone</label>
              <input type="text" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Address</label>
              <input type="text" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Membership Plan</label>
              <select value={newMember.planId} onChange={e => setNewMember({...newMember, planId: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="" className="bg-[#151619]">Select Plan</option>
                {plans.map(p => <option key={p.id} value={p.id} className="bg-[#151619]">{p.name} - LKR {p.price}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Instructor</label>
              <select value={newMember.instructorId} onChange={e => setNewMember({...newMember, instructorId: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="" className="bg-[#151619]">Select Instructor</option>
                {instructors.map(i => <option key={i.id} value={i.id} className="bg-[#151619]">{i.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Membership Type</label>
              <select value={newMember.membershipType} onChange={e => setNewMember({...newMember, membershipType: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="Regular" className="bg-[#151619]">Regular</option>
                <option value="Premium" className="bg-[#151619]">Premium</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Card ID (NFC/RFID)</label>
            <input type="text" value={newMember.cardId} onChange={e => setNewMember({...newMember, cardId: e.target.value})}
              placeholder="e.g. A1B2C3D4"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Avatar Image</label>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                toast('Uploading avatar...', 'info');
                try {
                  const url = await uploadFileToS3(file);
                  setNewMember({...newMember, avatar: url});
                } catch (err) {
                  toast('Failed to upload avatar', 'error');
                }
              }
            }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 transition-all text-white/70" />
            {newMember.avatar && (
              <div className="mt-2 flex items-center gap-2">
                <img src={newMember.avatar} alt="avatar preview" className="w-10 h-10 rounded-xl object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
                <span className="text-xs text-white/30">Avatar uploaded</span>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full mt-4" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : 'Register Member'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditMember(null); }} title="Edit Member" size="xl">
        {editMember && (
          <form onSubmit={handleEditMember} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Name</label>
                <input type="text" required value={editMember.name} onChange={e => setEditMember({...editMember, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Email</label>
                <input type="email" required value={editMember.email} onChange={e => setEditMember({...editMember, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Phone</label>
                <input type="text" value={editMember.phone || ''} onChange={e => setEditMember({...editMember, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Address</label>
                <input type="text" value={editMember.address || ''} onChange={e => setEditMember({...editMember, address: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Plan</label>
                <select value={editMember.planId} onChange={e => setEditMember({...editMember, planId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="" className="bg-[#151619]">Select Plan</option>
                  {plans.map(p => <option key={p.id} value={p.id} className="bg-[#151619]">{p.name} - LKR {p.price}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Instructor</label>
                <select value={editMember.instructorId || ''} onChange={e => setEditMember({...editMember, instructorId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="" className="bg-[#151619]">Select Instructor</option>
                  {instructors.map(i => <option key={i.id} value={i.id} className="bg-[#151619]">{i.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Type</label>
                <select value={editMember.membershipType} onChange={e => setEditMember({...editMember, membershipType: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="Regular" className="bg-[#151619]">Regular</option>
                  <option value="Premium" className="bg-[#151619]">Premium</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Status</label>
                <select value={editMember.status} onChange={e => setEditMember({...editMember, status: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="Active" className="bg-[#151619]">Active</option>
                  <option value="Inactive" className="bg-[#151619]">Inactive</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Card ID (NFC/RFID)</label>
              <input type="text" value={editMember.cardId || ''} onChange={e => setEditMember({...editMember, cardId: e.target.value})}
                placeholder="e.g. A1B2C3D4"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteMember(deleteTarget)}
        title="Delete Member"
        message="Are you sure you want to remove this member? This action cannot be undone."
      />

      <Modal isOpen={!!pwTarget} onClose={() => { setPwTarget(null); setNewPw(''); }} title={`Set Password — ${pwTarget?.name}`}>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <p className="text-xs text-white/40">Set a login password for this member. They will need to enter it on the login screen.</p>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">New Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                minLength={6}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-red-500/50"
              />
              <button type="button" onClick={() => setShowNewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pwSubmitting}>
            {pwSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Set Password'}
          </Button>
        </form>
      </Modal>
    </Card>
  );
};

// --- Instructor Views ---

const InstructorMembers = ({ instructorId, instructorEmail }: { instructorId: string; instructorEmail?: string }) => {
  const { members, instructors, healthRecords } = useData();
  
  // Match instructor by id first, fallback to email
  const resolvedInstructor = instructors.find(i => String(i.id).trim() === String(instructorId).trim())
    || instructors.find(i => instructorEmail && i.email.toLowerCase() === instructorEmail.toLowerCase());
    
  const resolvedInstructorId = resolvedInstructor?.id ?? instructorId;
  
  // Robust filter for members
  const myMembers = members.filter(m => {
    if (!m.instructorId) return false;
    const mInstId = String(m.instructorId).trim();
    const tgtId = String(resolvedInstructorId).trim();
    return mInstId === tgtId || (instructorEmail && mInstId === instructorEmail);
  });
  
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Trainees</h2>
        <p className="text-white/40 text-sm">{myMembers.length} Active Members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myMembers.map(m => {
          const memberRecords = healthRecords.filter(r => r.memberId === m.id);
          const latest = memberRecords[memberRecords.length - 1];
          const bmi = latest ? (latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1) : '--';

          return (
            <Card key={m.id} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}&background=random`} className="w-14 h-14 rounded-2xl" alt="" />
                  <div>
                    <h4 className="font-bold text-lg">{m.name}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest">{m.membershipType} Plan</p>
                  </div>
                </div>
                <Button variant="secondary" className="p-2 h-auto rounded-lg" onClick={() => {
                  setSelectedMember(m.id);
                  setIsHistoryOpen(true);
                }}>
                  <Activity size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Weight</p>
                  <p className="font-bold">{latest?.weight || '--'} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Height</p>
                  <p className="font-bold">{latest?.height || '--'} cm</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase mb-1">BMI</p>
                  <p className="font-bold text-red-500">{bmi}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 text-xs" onClick={() => {
                  setSelectedMember(m.id);
                  setIsFormOpen(true);
                }}>Update Stats</Button>
                <Button variant="secondary" className="flex-1 text-xs" onClick={() => {
                  setSelectedMember(m.id);
                  setIsHistoryOpen(true);
                }}>View History</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Record Trainee Stats"
      >
        {selectedMember && (
          <HealthStatsForm 
            memberId={selectedMember} 
            onSuccess={() => setIsFormOpen(false)} 
          />
        )}
      </Modal>

      <Modal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        title="Health Progress History"
      >
        {selectedMember && (
          <HealthHistory records={healthRecords.filter(r => r.memberId === selectedMember)} />
        )}
      </Modal>
    </div>
  );
};

// --- Member Views ---

const MemberAttendanceHistory = ({ memberId }: { memberId: string }) => {
  const { attendance, members } = useData();
  const member = members.find(m => m.id === memberId);
  const myAttendance = attendance.filter(a => a.userId === memberId);
  const [filter, setFilter] = useState<'all' | '7d' | '30d' | '90d'>('30d');
  const [search, setSearch] = useState('');

  const now = new Date();
  const filtered = myAttendance.filter(a => {
    if (filter === 'all') return true;
    const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(a.date) >= cutoff;
  }).filter(a => !search || a.date.includes(search));

  // Heatmap: last 12 weeks
  const weeks = 12;
  const heatmapDays: { date: string; count: number; intensity: number }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = myAttendance.filter(a => a.date === dateStr).length;
    heatmapDays.push({ date: dateStr, count, intensity: Math.min(count, 4) });
  }

  // Monthly chart - last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    const ym = format(d, 'yyyy-MM');
    return {
      month: format(d, 'MMM'),
      sessions: myAttendance.filter(a => a.date.startsWith(ym)).length,
    };
  });

  const totalSessions = myAttendance.length;
  const thisMonth = myAttendance.filter(a => a.date.startsWith(format(now, 'yyyy-MM'))).length;
  const thisWeek = myAttendance.filter(a => {
    const d = new Date(a.date);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;
  let streak = 0;
  const dateSet = new Set(myAttendance.map(a => a.date));
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (dateSet.has(format(d, 'yyyy-MM-dd'))) streak++;
    else if (i > 0) break;
  }
  const avgPerWeek = (myAttendance.filter(a => {
    const d = new Date(a.date);
    const weeksAgo = new Date(now);
    weeksAgo.setDate(weeksAgo.getDate() - 28);
    return d >= weeksAgo;
  }).length / 4).toFixed(1);

  const intensityColors = [
    'bg-white/[0.03] border-white/[0.04]',
    'bg-red-500/20 border-red-500/30',
    'bg-red-500/40 border-red-500/40',
    'bg-red-500/70 border-red-500/60',
    'bg-red-500 border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.6)]',
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-red-950 p-8 border border-red-500/30 shadow-[0_20px_60px_rgba(220,38,38,0.35)]">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-500/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-10 w-96 h-96 bg-red-900/60 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-white/70 text-xs uppercase tracking-[0.3em] font-bold mb-2">Attendance History</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">{member?.name?.split(' ')[0] || 'Your'}'s Journey</h1>
          <p className="text-white/80 mt-2 text-sm">Every check-in counts — track your consistency over time.</p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: totalSessions, icon: Activity, color: 'from-red-500 to-red-700' },
          { label: 'This Month', value: thisMonth, icon: Calendar, color: 'from-orange-500 to-red-600' },
          { label: 'This Week', value: thisWeek, icon: TrendingUp, color: 'from-rose-500 to-red-700' },
          { label: 'Current Streak', value: streak + 'd', icon: Flame, color: 'from-red-600 to-rose-800' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-5 hover:border-red-500/40 transition-all group">
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
              <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-3xl font-black tracking-tight relative">{s.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider mt-1 relative">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Heatmap */}
      <Card className="!bg-zinc-950/70 border-white/[0.06]">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold">12-Week Activity Heatmap</h3>
            <p className="text-xs text-white/40 mt-0.5">Average {avgPerWeek} sessions/week (last 4 weeks)</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider">
            <span>Less</span>
            {intensityColors.map((c, i) => <div key={i} className={`w-3 h-3 rounded border ${c}`} />)}
            <span>More</span>
          </div>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-fit">
            {heatmapDays.map((d, i) => (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.003 }}
                title={`${d.date} — ${d.count} session${d.count !== 1 ? 's' : ''}`}
                className={cn('w-3.5 h-3.5 rounded border transition-all hover:scale-150 hover:z-10 cursor-pointer', intensityColors[d.intensity])}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Monthly chart */}
      <Card className="!bg-zinc-950/70 border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Monthly Sessions</h3>
            <p className="text-xs text-white/40 mt-0.5">Last 6 months</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis dataKey="month" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #dc262640', borderRadius: '12px' }} itemStyle={{ color: '#f87171' }} />
            <Area type="monotone" dataKey="sessions" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#monthGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Detail table */}
      <Card className="!bg-zinc-950/70 border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold">All Check-ins</h3>
            <p className="text-xs text-white/40 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search date (yyyy-mm-dd)"
                className="bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs w-full sm:w-56 focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10">
              {(['7d', '30d', '90d', 'all'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider',
                    filter === f ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                  )}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/40 text-[10px] uppercase tracking-widest">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Check In</th>
                <th className="px-4 py-3 font-medium">Check Out</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(a => {
                let duration = '—';
                if (a.checkIn && a.checkOut) {
                  const [h1, m1] = a.checkIn.split(':').map(Number);
                  const [h2, m2] = a.checkOut.split(':').map(Number);
                  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                  if (mins > 0) duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                }
                return (
                  <tr key={a.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold">{a.date}</td>
                    <td className="px-4 py-3 text-xs text-green-400 font-mono">{a.checkIn || '—'}</td>
                    <td className="px-4 py-3 text-xs text-red-400 font-mono">{a.checkOut || '—'}</td>
                    <td className="px-4 py-3 text-xs text-white/70">{duration}</td>
                    <td className="px-4 py-3 text-xs text-white/60">{a.weight ? `${a.weight} kg` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle size={10} /> Done
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No attendance records in this range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const MemberDashboard = ({ memberId, memberEmail }: { memberId: string; memberEmail?: string }) => {
  const { members, healthRecords, attendance, payments, classes, plans } = useData();
  const member = members.find(m => m.id === memberId)
    || members.find(m => memberEmail && m.email.toLowerCase() === memberEmail.toLowerCase());
  const resolvedMemberId = member?.id ?? memberId;
  const records = healthRecords.filter(r => r.memberId === resolvedMemberId);
  const myAttendance = attendance.filter(a => a.userId === resolvedMemberId);
  const myPayments = payments.filter(p => p.memberId === resolvedMemberId);
  const myPlan = plans.find(p => p.id === member?.planId);
  const upcomingClasses = classes.slice(0, 4);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  if (!member) return null;

  // Attendance stats
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return format(d, 'yyyy-MM-dd');
  });
  const attendanceChart = last30Days.map(date => ({
    date: date.slice(5),
    sessions: myAttendance.filter(a => a.date === date).length,
  }));
  const totalSessions = myAttendance.length;
  const thisMonthSessions = myAttendance.filter(a => a.date.startsWith(format(new Date(), 'yyyy-MM'))).length;

  // Streak calc
  let streak = 0;
  const attendanceDates = new Set(myAttendance.map(a => a.date));
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (attendanceDates.has(format(d, 'yyyy-MM-dd'))) streak++;
    else if (i > 0) break;
  }

  const latest = records[records.length - 1];
  const lastPayment = [...myPayments].sort((a, b) => b.date.localeCompare(a.date))[0];
  const paymentStatus = lastPayment?.status || 'Pending';
  const statusColor = paymentStatus === 'Paid' ? 'green' : paymentStatus === 'Overdue' ? 'red' : 'yellow';

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -left-10 w-80 h-80 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8 z-10">
          <div>
            <p className="text-red-400 text-sm uppercase tracking-[0.2em] font-bold mb-2">Welcome Back</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2">{member.name.split(' ')[0]}</h1>
            <p className="text-white/60 text-base">You're on a <span className="font-bold text-white">{streak}-day streak</span> · Keep crushing it.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button className="w-full sm:w-auto shadow-lg shadow-red-500/20 py-3.5 px-6 text-sm rounded-2xl" onClick={() => setIsAttendanceOpen(true)}>
              <Calendar size={18} /> Mark Attendance
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto bg-white/5 border-white/10 py-3.5 px-6 text-sm hover:bg-white/10 rounded-2xl" onClick={() => setIsFormOpen(true)}>
              <Plus size={18} /> Log Stats
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Activity, label: 'Total Sessions', value: totalSessions, sub: 'All time', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: TrendingUp, label: 'This Month', value: thisMonthSessions, sub: 'Workouts', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Flame, label: 'Streak', value: streak + 'd', sub: 'Active days', color: 'text-red-400', bg: 'bg-red-500/10' },
          { icon: Trophy, label: 'Calories', value: latest?.caloriesBurned ?? 0, sub: 'Last session', color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors group">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-5`}>
                <Icon size={24} className={s.color} />
              </div>
              <p className="text-4xl font-black tracking-tight mb-1">{s.value}</p>
              <p className="text-sm text-white/50 font-medium mb-1">{s.label}</p>
              <p className="text-xs text-white/30">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile & ID */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center p-8 border-white/5 bg-white/[0.02]">
            <div className="relative mb-5 group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-white/10 group-hover:border-red-500/50 transition-colors bg-zinc-900">
                <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
            <p className="text-white/40 text-sm mb-6">{member.email}</p>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1 font-semibold">Plan</p>
                <p className="font-bold text-red-400 text-base">{member.membershipType}</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1 font-semibold">Joined</p>
                <p className="font-bold text-white text-base">{member.joinedDate}</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full py-3.5 rounded-2xl" onClick={() => setIsHistoryOpen(true)}>
              <Activity size={16} /> View Health History
            </Button>
          </Card>
        </div>

        {/* Attendance Activity */}
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold mb-1">Attendance Activity</h3>
              <p className="text-sm text-white/40">Last 30 days check-ins</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceChart}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} interval={4} />
              <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ color: '#f87171' }} />
              <Area type="monotone" dataKey="sessions" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#attGrad)" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Recent attendance table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white/70">Recent Check-ins</h4>
              <span className="text-xs text-white/40">{myAttendance.length} total</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {[...myAttendance].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold">{a.date}</p>
                    <p className="text-xs text-white/40 mt-1">
                      <span className="text-green-400">In {a.checkIn || '—'}</span> 
                      {a.checkOut && <span className="ml-2 text-white/30">· Out {a.checkOut}</span>}
                    </p>
                  </div>
                  {a.weight && (
                    <div className="text-right">
                      <p className="text-xs text-white/40 mb-1">Weight</p>
                      <span className="text-sm font-mono font-medium">{a.weight}kg</span>
                    </div>
                  )}
                </div>
              ))}
              {myAttendance.length === 0 && (
                <div className="text-center py-10 text-white/30 text-sm bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                  No check-ins yet. Mark your first one!
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Payment + Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-white/5 bg-white/[0.02] p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Membership & Payments</h3>
              <p className="text-sm text-white/40">{myPlan?.name || member.membershipType} · LKR {myPlan?.price || 0}/{myPlan?.duration || 'mo'}</p>
            </div>
            <span className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold border",
              statusColor === 'green' && 'bg-green-500/10 text-green-400 border-green-500/20',
              statusColor === 'yellow' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
              statusColor === 'red' && 'bg-red-500/10 text-red-400 border-red-500/20',
            )}>{paymentStatus}</span>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {myPayments.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-colors">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  p.status === 'Paid' ? 'bg-green-500/10 text-green-400' : p.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                )}>
                  <CreditCard size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold truncate mb-1">{p.planName}</p>
                  <p className="text-xs text-white/40">{p.date} · <span className="uppercase">{p.method}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold mb-1">LKR {p.amount}</p>
                  <p className="text-xs text-white/40">{p.status}</p>
                </div>
              </div>
            ))}
            {myPayments.length === 0 && <div className="text-center py-10 text-white/30 text-sm bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">No payment records yet</div>}
          </div>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Upcoming Classes</h3>
              <p className="text-sm text-white/40">Your schedule for this week</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <Calendar size={20} />
            </div>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {upcomingClasses.map(c => (
              <div key={c.id} className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl flex items-start gap-4 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-white/60" />
                </div>
                <div>
                  <h4 className="font-bold text-base mb-1">{c.name}</h4>
                  <p className="text-xs text-white/40 mb-2">{c.instructor} · {c.schedule}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-white/50">{c.duration}</span>
                    <span className="text-[10px] text-white/30">{c.enrolled}/{c.capacity} enrolled</span>
                  </div>
                </div>
              </div>
            ))}
            {upcomingClasses.length === 0 && <div className="text-center py-10 text-white/30 text-sm bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">No classes scheduled</div>}
          </div>
        </Card>
      </div>

      {/* Weight Progress */}
      {records.length > 0 && (
        <Card className="!bg-zinc-950/70 border-white/[0.06] h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Weight Progress</h3>
            <span className="text-xs text-white/40">{records.length} entries</span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={records}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #dc262640', borderRadius: '12px' }} itemStyle={{ color: '#f87171' }} />
              <Area type="monotone" dataKey="weight" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Modal isOpen={isAttendanceOpen} onClose={() => setIsAttendanceOpen(false)} title="Mark Attendance">
        <AttendanceMarking userId={resolvedMemberId} onMarked={() => setIsAttendanceOpen(false)} />
      </Modal>
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Record Daily Health Stats">
        <HealthStatsForm memberId={resolvedMemberId} onSuccess={() => setIsFormOpen(false)} />
      </Modal>
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Health Progress History">
        <HealthHistory records={records} />
      </Modal>
    </div>
  );
};

const InstructorList = () => {
  const { instructors, members, refreshData } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editInst, setEditInst] = useState<Instructor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newInst, setNewInst] = useState({
    name: '', email: '', avatar: '', specialization: '', experience: '', workingHours: '',
  });

  const filteredInstructors = instructors.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiInstructors.create({
        id: 'inst' + Date.now(),
        name: newInst.name,
        email: newInst.email,
        avatar: newInst.avatar || undefined,
        specialization: newInst.specialization,
        experience: newInst.experience,
        workingHours: newInst.workingHours,
        membersCount: 0,
      });
      await refreshData();
      setIsAddOpen(false);
      setNewInst({ name: '', email: '', avatar: '', specialization: '', experience: '', workingHours: '' });
      toast('Instructor added successfully');
    } catch (err: any) {
      console.error('Failed to add instructor:', err);
      toast(err.message || 'Failed to add instructor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInst) return;
    setSubmitting(true);
    try {
      await apiInstructors.update(editInst.id, {
        name: editInst.name,
        email: editInst.email,
        avatar: editInst.avatar,
        specialization: editInst.specialization,
        experience: editInst.experience,
        workingHours: editInst.workingHours,
      });
      await refreshData();
      setIsEditOpen(false);
      setEditInst(null);
      toast('Instructor updated successfully');
    } catch (err: any) {
      console.error('Failed to update instructor:', err);
      toast(err.message || 'Failed to update instructor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    try {
      await apiInstructors.delete(id);
      await refreshData();
      toast('Instructor deleted');
    } catch (err) {
      console.error('Failed to delete instructor:', err);
      toast('Failed to delete instructor', 'error');
    }
  };

  const openEdit = (i: Instructor) => {
    setEditInst({ ...i });
    setIsEditOpen(true);
  };

  const [pwTarget, setPwTarget] = useState<{ id: string; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTarget || !newPw.trim()) return;
    setPwSubmitting(true);
    try {
      await apiUsers.setPassword(pwTarget.id, newPw.trim());
      toast(`Password updated for ${pwTarget.name}`);
      setPwTarget(null);
      setNewPw('');
    } catch (err: any) {
      toast(err.message || 'Failed to set password', 'error');
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold">Instructor Management</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search instructors..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:border-red-500/50"
            />
          </div>
          <Button className="whitespace-nowrap" onClick={() => setIsAddOpen(true)}>
            <Plus size={18} />
            <span>Add Instructor</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructors.map((i, idx) => (
          <motion.div 
            key={i.id} 
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-red-500/20 hover:bg-white/[0.05] transition-all duration-300 group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.35 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <img src={i.avatar || `https://ui-avatars.com/api/?name=${i.name}&background=random`} className="w-16 h-16 rounded-2xl ring-2 ring-white/5 group-hover:ring-red-500/20 transition-all" alt="" />
              <div>
                <h4 className="font-bold text-lg">{i.name}</h4>
                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">{i.specialization}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Experience</span>
                <span className="font-medium">{i.experience}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Active Members</span>
                <span className="font-medium">{members.filter(m => m.instructorId === i.id).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Email</span>
                <span className="font-medium truncate ml-4">{i.email}</span>
              </div>
              {i.workingHours && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Hours</span>
                  <span className="font-medium">{i.workingHours}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1 text-xs" onClick={() => openEdit(i)}>
                <Pencil size={14} />
                <span>Edit</span>
              </Button>
              <button onClick={() => { setPwTarget({ id: i.id, name: i.name }); setNewPw(''); }} title="Set Password"
                className="p-2.5 rounded-xl hover:bg-yellow-500/10 text-white/30 hover:text-yellow-400 transition-colors border border-transparent hover:border-yellow-500/20">
                <Shield size={16} />
              </button>
              <button onClick={() => setDeleteTarget(i.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className="text-center py-12 text-white/30 text-sm">No instructors found</div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Instructor">
        <form onSubmit={handleAddInstructor} className="space-y-4">
          <p className="text-xs text-white/30"><span className="text-red-400">*</span> Required fields</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Name <span className="text-red-400">*</span></label>
              <input type="text" required placeholder="e.g. John Doe" value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Email <span className="text-red-400">*</span></label>
              <input type="email" required placeholder="e.g. john@gym.com" value={newInst.email} onChange={e => setNewInst({...newInst, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Specialization <span className="text-red-400">*</span></label>
              <input type="text" required placeholder="e.g. Bodybuilding, Yoga & Pilates" value={newInst.specialization} onChange={e => setNewInst({...newInst, specialization: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Experience <span className="text-red-400">*</span></label>
              <input type="text" required placeholder="e.g. 5 years" value={newInst.experience} onChange={e => setNewInst({...newInst, experience: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Working Hours</label>
              <input type="text" placeholder="e.g. 08:00 AM - 04:00 PM" value={newInst.workingHours} onChange={e => setNewInst({...newInst, workingHours: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Avatar Image</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  toast('Uploading avatar...', 'info');
                  try {
                    const url = await uploadFileToS3(file);
                    setNewInst({...newInst, avatar: url});
                  } catch (err) {
                    toast('Failed to upload avatar', 'error');
                  }
                }
              }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 transition-all text-white/70" />

            </div>
          </div>
          {newInst.avatar && (
            <div className="flex items-center gap-2">
              <img src={newInst.avatar} alt="avatar preview" className="w-10 h-10 rounded-xl object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
              <span className="text-xs text-white/30">Avatar preview</span>
            </div>
          )}
          <Button type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : 'Add Instructor'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditInst(null); }} title="Edit Instructor">
        {editInst && (
          <form onSubmit={handleEditInstructor} className="space-y-4">
            <p className="text-xs text-white/30"><span className="text-red-400">*</span> Required fields</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Name <span className="text-red-400">*</span></label>
                <input type="text" required placeholder="e.g. John Doe" value={editInst.name} onChange={e => setEditInst({...editInst, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Email <span className="text-red-400">*</span></label>
                <input type="email" required placeholder="e.g. john@gym.com" value={editInst.email} onChange={e => setEditInst({...editInst, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Specialization <span className="text-red-400">*</span></label>
                <input type="text" required placeholder="e.g. Bodybuilding, Yoga & Pilates" value={editInst.specialization} onChange={e => setEditInst({...editInst, specialization: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Experience <span className="text-red-400">*</span></label>
                <input type="text" required placeholder="e.g. 5 years" value={editInst.experience} onChange={e => setEditInst({...editInst, experience: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Working Hours</label>
                <input type="text" placeholder="e.g. 08:00 AM - 04:00 PM" value={editInst.workingHours || ''} onChange={e => setEditInst({...editInst, workingHours: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Avatar Image</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    toast('Uploading avatar...', 'info');
                    try {
                      const url = await uploadFileToS3(file);
                      setEditInst({...editInst, avatar: url});
                    } catch (err) {
                      toast('Failed to upload avatar', 'error');
                    }
                  }
                }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 transition-all text-white/70" />
              </div>
            </div>
            {editInst.avatar && (
              <div className="flex items-center gap-2">
                <img src={editInst.avatar} alt="avatar preview" className="w-10 h-10 rounded-xl object-cover border border-white/10" onError={e => (e.currentTarget.style.display = 'none')} />
                <span className="text-xs text-white/30">Avatar preview</span>
              </div>
            )}
            <Button type="submit" className="w-full mt-2" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteInstructor(deleteTarget)}
        title="Delete Instructor"
        message="Are you sure you want to remove this instructor? This action cannot be undone."
      />

      <Modal isOpen={!!pwTarget} onClose={() => { setPwTarget(null); setNewPw(''); }} title={`Set Password — ${pwTarget?.name}`}>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <p className="text-xs text-white/40">Set a login password for this instructor. They will need to enter it on the login screen.</p>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">New Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                minLength={6}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-red-500/50"
              />
              <button type="button" onClick={() => setShowNewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pwSubmitting}>
            {pwSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Set Password'}
          </Button>
        </form>
      </Modal>
    </Card>
  );
};

// --- Membership Card (standalone tab) ---

const MembershipCardView = ({ memberId, memberEmail }: { memberId: string; memberEmail?: string }) => {
  const { members, plans, payments } = useData();
  const member = members.find(m => m.id === memberId)
    || members.find(m => memberEmail && m.email.toLowerCase() === memberEmail.toLowerCase());

  if (!member) return (
    <div className="flex items-center justify-center h-[60vh] text-white/30 text-sm">
      No membership record found for your account.
    </div>
  );

  const myPlan = plans.find(p => p.id === member.planId);
  const myPayments = [...payments.filter(p => p.memberId === member.id)].sort((a, b) => b.date.localeCompare(a.date));
  const lastPayment = myPayments[0];
  const statusColor = lastPayment?.status === 'Paid' ? 'green' : lastPayment?.status === 'Overdue' ? 'red' : 'yellow';

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* The card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-900 shadow-[0_30px_80px_rgba(220,38,38,0.45)]">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-red-400/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-red-900/60 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Dumbbell size={120} />
        </div>
        <div className="relative z-10 p-7">
          {/* Top row */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Member Pass</p>
              <p className="text-2xl font-black tracking-tighter">IRONPULSE</p>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
              <QrCode size={24} />
            </div>
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-8">
            <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
              className="w-14 h-14 rounded-2xl border-2 border-white/30 object-cover" alt="" />
            <div>
              <p className="text-lg font-black tracking-tight">{member.name}</p>
              <p className="text-white/60 text-xs">{member.email}</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Member ID</p>
              <p className="font-mono text-sm font-bold tracking-wider">{member.qrCode || member.id}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Plan</p>
              <p className="font-bold text-sm">{member.membershipType}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Card ID</p>
              <p className="font-mono text-sm font-bold">{member.cardId || '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="!bg-zinc-950/70 border-white/[0.06]">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Membership Details</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Plan', value: myPlan?.name || member.membershipType },
              { label: 'Price', value: myPlan ? `LKR ${myPlan.price}/${myPlan.duration}` : '—' },
              { label: 'Joined', value: member.joinedDate || '—' },
              { label: 'Status', value: member.status || 'Active' },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Last payment */}
      {lastPayment && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="!bg-zinc-950/70 border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Last Payment</h4>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg",
                statusColor === 'green' ? 'bg-green-500/15 text-green-400' :
                statusColor === 'red' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400')}>
                {lastPayment.status}
              </span>
            </div>
            <p className="text-2xl font-black text-green-400 mt-2">LKR {lastPayment.amount.toFixed(2)}</p>
            <p className="text-xs text-white/40 mt-1">{lastPayment.planName} · {lastPayment.date} · {lastPayment.method}</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// --- Member Payment View ---

const MemberPayments = ({ memberId }: { memberId: string }) => {
  const { payments, plans, refreshData } = useData();
  const { toast } = useToast();
  const myPayments = [...payments.filter(p => p.memberId === memberId)].sort((a, b) => b.date.localeCompare(a.date));
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slip, setSlip] = useState<{
    planName: string; amount: string; slipReference: string; remarks: string; date: string; slipFile: File | null;
  }>({ planName: '', amount: '', slipReference: '', remarks: '', date: format(new Date(), 'yyyy-MM-dd'), slipFile: null });

  const totalPaid = myPayments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = myPayments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = myPayments.filter(p => p.status === 'Overdue').reduce((s, p) => s + p.amount, 0);

  const handleSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let slipImageUrl = undefined;
      if (slip.slipFile) {
        toast('Uploading slip to secure storage...', 'info');
        slipImageUrl = await uploadFileToS3(slip.slipFile);
      }

      await apiPayments.create({
        memberId,
        amount: parseFloat(slip.amount),
        date: slip.date,
        status: 'Pending',
        method: 'Online',
        planName: slip.planName,
        paymentType: 'ONLINE',
        slipReference: slip.slipReference,
        slipImageUrl,
        remarks: slip.remarks || undefined,
      });
      await refreshData();
      setIsSlipOpen(false);
      setSlip({ planName: '', amount: '', slipReference: '', remarks: '', date: format(new Date(), 'yyyy-MM-dd'), slipFile: null });
      toast('Payment slip submitted — awaiting admin verification');
    } catch (err: any) {
      toast(err.message || 'Failed to submit slip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: totalPaid, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { label: 'Pending', value: totalPending, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
          { label: 'Overdue', value: totalOverdue, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={cn("rounded-2xl border p-4", s.bg, s.border)}>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{s.label}</p>
            <p className={cn("text-xl font-black", s.color)}>LKR {s.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Submit slip button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Payment History</h3>
        <Button onClick={() => setIsSlipOpen(true)}>
          <Plus size={16} /> Submit Payment Slip
        </Button>
      </div>

      {/* Payment cards */}
      <div className="space-y-3">
        {myPayments.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No payment records yet</div>
        )}
        {myPayments.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-all">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
              p.status === 'Paid' ? 'bg-green-500/15 text-green-400' :
              p.status === 'Overdue' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400')}>
              <CreditCard size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold">{p.planName}</p>
                {p.paymentType === 'ONLINE' && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[9px] font-bold uppercase tracking-wider">Online</span>
                )}
              </div>
              <p className="text-[11px] text-white/40 mt-0.5">{p.date} · {p.method}{p.slipReference ? ` · Ref: ${p.slipReference}` : ''}</p>
              {p.remarks && <p className="text-[10px] text-white/30 mt-0.5 italic truncate">{p.remarks}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-green-400">LKR {p.amount.toFixed(2)}</p>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider",
                p.status === 'Paid' ? 'text-green-400' :
                p.status === 'Overdue' ? 'text-red-400' : 'text-yellow-400')}>
                {p.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit Slip Modal */}
      <Modal isOpen={isSlipOpen} onClose={() => setIsSlipOpen(false)} title="Submit Payment Slip">
        <form onSubmit={handleSubmitSlip} className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-300">
            Submit your bank transfer / online payment reference. Admin will verify and mark it as Paid.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Plan <span className="text-red-400">*</span></label>
              <select required value={slip.planName} onChange={e => setSlip({...slip, planName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="" className="bg-[#151619]">Select Plan</option>
                {plans.map(p => <option key={p.id} value={p.name} className="bg-[#151619]">{p.name} — LKR {p.price}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Amount (LKR) <span className="text-red-400">*</span></label>
              <input type="number" required step="0.01" min="0.01" placeholder="e.g. 5000.00" value={slip.amount} onChange={e => setSlip({...slip, amount: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Payment Date <span className="text-red-400">*</span></label>
              <input type="date" required value={slip.date} onChange={e => setSlip({...slip, date: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Slip / Reference No. <span className="text-red-400">*</span></label>
              <input type="text" required placeholder="e.g. TXN123456" value={slip.slipReference} onChange={e => setSlip({...slip, slipReference: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Upload Bank Slip (Image/PDF) <span className="text-red-400">*</span></label>
              <input type="file" required accept="image/*,application/pdf" onChange={e => {
                const file = e.target.files?.[0];
                if (file) setSlip({...slip, slipFile: file});
              }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 transition-all text-white/70" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Remarks (Optional)</label>
            <input type="text" placeholder="Any notes for admin..." value={slip.remarks} onChange={e => setSlip({...slip, remarks: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Upload size={16} /> Submit Slip</>}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const PaymentList = ({ memberId: filterMemberId }: { memberId?: string } = {}) => {
  const { payments, members, plans, refreshData } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPay, setEditPay] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewSlip, setViewSlip] = useState<Payment | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'PHYSICAL' | 'ONLINE'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');
  const [newPay, setNewPay] = useState({
    memberId: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Pending', method: 'Cash', planName: '', paymentType: 'PHYSICAL', slipReference: '', remarks: '',
  });

  const filteredPayments = payments.filter(p => {
    if (filterMemberId && p.memberId !== filterMemberId) return false;
    const member = members.find(m => m.id === p.memberId);
    const matchSearch = (
      (member?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchType = filterType === 'all' || p.paymentType === filterType;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiPayments.create({
        memberId: newPay.memberId,
        amount: parseFloat(newPay.amount),
        date: newPay.date,
        status: newPay.paymentType === 'ONLINE' ? 'Pending' : newPay.status,
        method: newPay.method,
        planName: newPay.planName,
        paymentType: newPay.paymentType,
        slipReference: newPay.slipReference || undefined,
        remarks: newPay.remarks || undefined,
      });
      await refreshData();
      setIsAddOpen(false);
      setNewPay({ memberId: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'Pending', method: 'Cash', planName: '', paymentType: 'PHYSICAL', slipReference: '', remarks: '' });
      toast('Payment recorded successfully');
    } catch (err: any) {
      console.error('Failed to add payment:', err);
      toast(err.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPay) return;
    setSubmitting(true);
    try {
      await apiPayments.update(editPay.id, {
        memberId: editPay.memberId,
        amount: editPay.amount,
        date: editPay.date,
        status: editPay.status,
        method: editPay.method,
        planName: editPay.planName,
        paymentType: editPay.paymentType,
        slipReference: editPay.slipReference,
        remarks: editPay.remarks,
      });
      await refreshData();
      setIsEditOpen(false);
      setEditPay(null);
      toast('Payment updated successfully');
    } catch (err: any) {
      console.error('Failed to update payment:', err);
      toast(err.message || 'Failed to update payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (payId: string, action: 'approve' | 'reject') => {
    try {
      await apiPayments.verify(payId, 'admin1', action);
      await refreshData();
      toast(action === 'approve' ? 'Payment approved' : 'Payment rejected');
    } catch (err: any) {
      toast(err.message || 'Verification failed', 'error');
    }
  };

  const openEdit = (p: Payment) => {
    setEditPay({ ...p });
    setIsEditOpen(true);
  };

  const pendingSlips = payments.filter(p => p.paymentType === 'ONLINE' && p.status === 'Pending');
  const isAdminView = !filterMemberId;

  return (
    <div className="space-y-6">
      {/* Pending Slip Verifications Banner */}
      {isAdminView && pendingSlips.length > 0 && (
        <Card className="border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <FileText size={22} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{pendingSlips.length} Payment Slip{pendingSlips.length > 1 ? 's' : ''} Pending Verification</h4>
              <p className="text-xs text-white/40">Online payments awaiting admin review</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold">Payment Management</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input type="text" placeholder="Search payments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:border-red-500/50" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
              <option value="all" className="bg-[#151619]">All Types</option>
              <option value="PHYSICAL" className="bg-[#151619]">Physical</option>
              <option value="ONLINE" className="bg-[#151619]">Online</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
              <option value="all" className="bg-[#151619]">All Status</option>
              <option value="Paid" className="bg-[#151619]">Paid</option>
              <option value="Pending" className="bg-[#151619]">Pending</option>
              <option value="Overdue" className="bg-[#151619]">Overdue</option>
            </select>
            {isAdminView && (
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus size={18} />
                <span>Record Payment</span>
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                <th className="px-4 py-4 font-medium">ID</th>
                <th className="px-4 py-4 font-medium">Member</th>
                <th className="px-4 py-4 font-medium">Plan</th>
                <th className="px-4 py-4 font-medium">Amount</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Type</th>
                <th className="px-4 py-4 font-medium">Method</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map((p, i) => {
                const member = members.find(m => m.id === p.memberId);
                return (
                  <motion.tr key={p.id} className="hover:bg-white/[0.03] transition-colors group"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }}>
                    <td className="px-4 py-4 font-mono text-xs text-white/40">#{p.id.toUpperCase()}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={member?.avatar || `https://ui-avatars.com/api/?name=${member?.name || 'U'}&background=random`} className="w-8 h-8 rounded-lg" alt="" />
                        <span className="text-sm font-bold">{member?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/60">{p.planName}</td>
                    <td className="px-4 py-4 text-sm font-bold text-green-400">LKR {p.amount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-white/60">{p.date}</td>
                    <td className="px-4 py-4">
                      <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        p.paymentType === 'ONLINE' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/10 text-white/60')}>
                        {p.paymentType === 'ONLINE' ? 'Online' : 'Physical'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/50">{p.method}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        p.status === 'Paid' ? 'bg-green-500/15 text-green-400' :
                        p.status === 'Pending' ? 'bg-red-500/15 text-red-400' : 'bg-red-500/15 text-red-400')}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.paymentType === 'ONLINE' && (p.slipReference || p.slipImageUrl) && (
                          <button onClick={() => setViewSlip(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-white/40 hover:text-blue-400 transition-colors" title="View Slip">
                            <Eye size={15} />
                          </button>
                        )}
                        {p.paymentType === 'ONLINE' && p.status === 'Pending' && (
                          <>
                            <button onClick={() => handleVerify(p.id, 'approve')} className="p-2 rounded-lg hover:bg-green-500/10 text-white/40 hover:text-green-400 transition-colors" title="Approve">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => handleVerify(p.id, 'reject')} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors" title="Reject">
                              <Ban size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-white/30 text-sm">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Payment Modal */}
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record Payment">
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Payment Type</label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button type="button" onClick={() => setNewPay({...newPay, paymentType: 'PHYSICAL', method: 'Cash', status: 'Paid'})}
                  className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    newPay.paymentType === 'PHYSICAL' ? "bg-red-500 text-white shadow-lg" : "text-white/40 hover:text-white/60")}>
                  Physical (Cash)
                </button>
                <button type="button" onClick={() => setNewPay({...newPay, paymentType: 'ONLINE', method: 'Online', status: 'Pending'})}
                  className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    newPay.paymentType === 'ONLINE' ? "bg-blue-500 text-white shadow-lg" : "text-white/40 hover:text-white/60")}>
                  Online (Slip)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Member</label>
                <select required value={newPay.memberId} onChange={e => setNewPay({...newPay, memberId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="" className="bg-[#151619]">Select Member</option>
                  {members.map(m => <option key={m.id} value={m.id} className="bg-[#151619]">{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Amount (LKR)</label>
                <input type="number" required step="0.01" value={newPay.amount} onChange={e => setNewPay({...newPay, amount: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Date</label>
                <input type="date" required value={newPay.date} onChange={e => setNewPay({...newPay, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Plan</label>
                <select required value={newPay.planName} onChange={e => setNewPay({...newPay, planName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="" className="bg-[#151619]">Select Plan</option>
                  {plans.map(p => <option key={p.id} value={p.name} className="bg-[#151619]">{p.name}</option>)}
                </select>
              </div>
              {newPay.paymentType === 'PHYSICAL' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Method</label>
                    <select value={newPay.method} onChange={e => setNewPay({...newPay, method: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                      <option value="Cash" className="bg-[#151619]">Cash</option>
                      <option value="Card" className="bg-[#151619]">Card</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Status</label>
                    <select value={newPay.status} onChange={e => setNewPay({...newPay, status: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                      <option value="Paid" className="bg-[#151619]">Paid</option>
                      <option value="Pending" className="bg-[#151619]">Pending</option>
                      <option value="Overdue" className="bg-[#151619]">Overdue</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            {newPay.paymentType === 'ONLINE' && (
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Slip Reference / Receipt Number</label>
                <input type="text" required value={newPay.slipReference} onChange={e => setNewPay({...newPay, slipReference: e.target.value})}
                  placeholder="e.g. SLIP-20240305-001 or bank reference"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Remarks (Optional)</label>
              <input type="text" value={newPay.remarks} onChange={e => setNewPay({...newPay, remarks: e.target.value})}
                placeholder="Any additional notes"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Recording...</> : 'Record Payment'}
            </Button>
          </form>
        </Modal>

        {/* Edit Payment Modal */}
        <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditPay(null); }} title="Edit Payment">
          {editPay && (
            <form onSubmit={handleEditPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Member</label>
                  <select required value={editPay.memberId} onChange={e => setEditPay({...editPay, memberId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                    {members.map(m => <option key={m.id} value={m.id} className="bg-[#151619]">{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Amount (LKR)</label>
                  <input type="number" required step="0.01" value={editPay.amount} onChange={e => setEditPay({...editPay, amount: parseFloat(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Date</label>
                  <input type="date" required value={editPay.date} onChange={e => setEditPay({...editPay, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Plan</label>
                  <select required value={editPay.planName} onChange={e => setEditPay({...editPay, planName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                    {plans.map(p => <option key={p.id} value={p.name} className="bg-[#151619]">{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Method</label>
                  <select value={editPay.method} onChange={e => setEditPay({...editPay, method: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                    <option value="Cash" className="bg-[#151619]">Cash</option>
                    <option value="Card" className="bg-[#151619]">Card</option>
                    <option value="Online" className="bg-[#151619]">Online</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Status</label>
                  <select value={editPay.status} onChange={e => setEditPay({...editPay, status: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                    <option value="Paid" className="bg-[#151619]">Paid</option>
                    <option value="Pending" className="bg-[#151619]">Pending</option>
                    <option value="Overdue" className="bg-[#151619]">Overdue</option>
                  </select>
                </div>
              </div>
              {editPay.slipReference && (
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Slip Reference</label>
                  <input type="text" value={editPay.slipReference || ''} onChange={e => setEditPay({...editPay, slipReference: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Remarks</label>
                <input type="text" value={editPay.remarks || ''} onChange={e => setEditPay({...editPay, remarks: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </form>
          )}
        </Modal>

        {/* View Slip Modal */}
        <Modal isOpen={!!viewSlip} onClose={() => setViewSlip(null)} title="Payment Slip Details">
          {viewSlip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Payment ID</p>
                  <p className="font-mono font-bold text-sm">#{viewSlip.id.toUpperCase()}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Amount</p>
                  <p className="font-bold text-green-400">LKR {viewSlip.amount.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Date</p>
                  <p className="font-bold text-sm">{viewSlip.date}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Status</p>
                  <p className={cn("font-bold text-sm", viewSlip.status === 'Paid' ? 'text-green-400' : viewSlip.status === 'Pending' ? 'text-red-400' : 'text-red-400')}>
                    {viewSlip.status}
                  </p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase mb-2">Slip Reference</p>
                <p className="font-mono font-bold text-blue-400">{viewSlip.slipReference}</p>
              </div>
              {viewSlip.slipImageUrl && (
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-2">Slip Image</p>
                  <img src={viewSlip.slipImageUrl} alt="Payment Slip" className="w-full rounded-lg object-contain max-h-64" />
                </div>
              )}
              {viewSlip.verifiedBy && (
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-2">Verification</p>
                  <p className="text-sm">Verified by: <span className="font-bold">{viewSlip.verifiedBy}</span></p>
                  {viewSlip.verifiedDate && <p className="text-xs text-white/40 mt-1">on {viewSlip.verifiedDate}</p>}
                </div>
              )}
              {viewSlip.remarks && (
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase mb-2">Remarks</p>
                  <p className="text-sm">{viewSlip.remarks}</p>
                </div>
              )}
              {viewSlip.status === 'Pending' && (
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => { handleVerify(viewSlip.id, 'approve'); setViewSlip(null); }}>
                    <CheckCircle size={16} /> Approve
                  </Button>
                  <Button variant="danger" className="flex-1" onClick={() => { handleVerify(viewSlip.id, 'reject'); setViewSlip(null); }}>
                    <Ban size={16} /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

const AttendanceList = () => {
  const { attendance, users, refreshData } = useData();
  const { toast } = useToast();
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editAtt, setEditAtt] = useState<Attendance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');
  
  const filteredAttendance = filterDate 
    ? attendance.filter(a => a.date === filterDate) 
    : attendance;

  const handleDeleteAttendance = async (id: string) => {
    try {
      await apiAttendance.delete(id);
      await refreshData();
      toast('Attendance record deleted');
    } catch (err: any) {
      console.error('Failed to delete attendance:', err);
      toast(err.message || 'Failed to delete attendance', 'error');
    }
  };

  const handleEditAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAtt) return;
    try {
      await apiAttendance.update(editAtt.id, {
        userId: editAtt.userId,
        date: editAtt.date,
        checkIn: editAtt.checkIn,
        checkOut: editAtt.checkOut,
        weight: editAtt.weight,
      });
      await refreshData();
      setIsEditOpen(false);
      setEditAtt(null);
      toast('Attendance updated successfully');
    } catch (err: any) {
      console.error('Failed to update attendance:', err);
      toast(err.message || 'Failed to update attendance', 'error');
    }
  };

  const openEdit = (a: Attendance) => {
    setEditAtt({ ...a });
    setIsEditOpen(true);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold">Attendance Tracking</h3>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
          <Button variant="secondary" className="whitespace-nowrap" onClick={() => setIsMarkingOpen(true)}>
            <Plus size={18} />
            <span>Mark Attendance</span>
          </Button>
          {filterDate && <Button variant="ghost" onClick={() => setFilterDate('')}>Clear</Button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
              <th className="px-4 py-4 font-medium">User</th>
              <th className="px-4 py-4 font-medium">Role</th>
              <th className="px-4 py-4 font-medium">Date</th>
              <th className="px-4 py-4 font-medium">Weight</th>
              <th className="px-4 py-4 font-medium">Check In</th>
              <th className="px-4 py-4 font-medium">Check Out</th>
              <th className="px-4 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAttendance.map((a, i) => {
              const user = users.find(u => u.id === a.userId);
              return (
                <motion.tr 
                  key={a.id} 
                  className="hover:bg-white/[0.03] transition-colors group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <UserIcon size={16} className="text-white/40" />
                      </div>
                      <span className="text-sm font-bold">{user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{user?.role || '--'}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white/60">{a.date}</td>
                  <td className="px-4 py-4 text-sm text-white/60">{a.weight ? `${a.weight} kg` : '--'}</td>
                  <td className="px-4 py-4 text-sm font-mono text-green-400">{a.checkIn}</td>
                  <td className="px-4 py-4 text-sm font-mono text-red-400">{a.checkOut || '--:--'}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            {filteredAttendance.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">No attendance records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isMarkingOpen} 
        onClose={() => setIsMarkingOpen(false)} 
        title="Mark Attendance"
      >
        <AttendanceMarking onMarked={() => { setIsMarkingOpen(false); toast('Attendance marked'); }} />
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditAtt(null); }} title="Edit Attendance">
        {editAtt && (
          <form onSubmit={handleEditAttendance} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">User</label>
                <select required value={editAtt.userId} onChange={e => setEditAtt({...editAtt, userId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  {users.map(u => <option key={u.id} value={u.id} className="bg-[#151619]">{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Date</label>
                <input type="date" required value={editAtt.date} onChange={e => setEditAtt({...editAtt, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Check In</label>
                <input type="time" value={editAtt.checkIn || ''} onChange={e => setEditAtt({...editAtt, checkIn: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Check Out</label>
                <input type="time" value={editAtt.checkOut || ''} onChange={e => setEditAtt({...editAtt, checkOut: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Weight (kg)</label>
              <input type="number" step="0.1" value={editAtt.weight || ''} onChange={e => setEditAtt({...editAtt, weight: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <Button type="submit" className="w-full mt-4">Save Changes</Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteAttendance(deleteTarget)}
        title="Delete Attendance"
        message="Are you sure you want to delete this attendance record?"
      />
    </Card>
  );
};

const PlanManagement = () => {
  const { plans, refreshData } = useData();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<MembershipPlan | null>(null);
  const [editBenefits, setEditBenefits] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '', price: '', duration: 'Monthly', benefits: '',
  });

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiPlans.create({
        id: 'plan' + Date.now(),
        name: newPlan.name,
        price: parseFloat(newPlan.price),
        duration: newPlan.duration,
        benefits: newPlan.benefits.split(',').map(b => b.trim()).filter(Boolean),
      });
      await refreshData();
      setIsAddOpen(false);
      setNewPlan({ name: '', price: '', duration: 'Monthly', benefits: '' });
      toast('Plan created successfully');
    } catch (err: any) {
      console.error('Failed to add plan:', err);
      toast(err.message || 'Failed to create plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlan) return;
    setSubmitting(true);
    try {
      await apiPlans.update(editPlan.id, {
        name: editPlan.name,
        price: editPlan.price,
        duration: editPlan.duration,
        benefits: editBenefits.split(',').map(b => b.trim()).filter(Boolean),
      });
      await refreshData();
      setIsEditOpen(false);
      setEditPlan(null);
      toast('Plan updated successfully');
    } catch (err: any) {
      console.error('Failed to update plan:', err);
      toast(err.message || 'Failed to update plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await apiPlans.delete(id);
      await refreshData();
      toast('Plan deleted');
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      toast(err.message || 'Failed to delete plan', 'error');
    }
  };

  const openEdit = (p: MembershipPlan) => {
    setEditPlan({ ...p });
    setEditBenefits(p.benefits.join(', '));
    setIsEditOpen(true);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold">Membership Plans</h3>
        <Button className="whitespace-nowrap" onClick={() => setIsAddOpen(true)}>
          <Plus size={18} />
          <span>Create Plan</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/30 text-sm">No membership plans found</div>
        )}
        {plans.map((plan, idx) => (
          <motion.div 
            key={plan.id} 
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col hover:border-red-500/20 hover:bg-white/[0.05] transition-all duration-300 group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.35 }}
          >
            <div className="mb-4">
              <h4 className="text-xl font-bold">{plan.name}</h4>
              <p className="text-3xl font-black text-red-400 mt-2">LKR {plan.price}<span className="text-sm text-white/40 font-normal">/{plan.duration}</span></p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle size={14} className="text-green-400 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1 text-xs" onClick={() => openEdit(plan)}>
                <Pencil size={14} />
                <span>Edit</span>
              </Button>
              <button onClick={() => setDeleteTarget(plan.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Membership Plan">
        <form onSubmit={handleAddPlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Plan Name</label>
              <input type="text" required value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Price (LKR)</label>
              <input type="number" required step="0.01" min="0.01" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Duration</label>
            <select value={newPlan.duration} onChange={e => setNewPlan({...newPlan, duration: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
              <option value="Monthly" className="bg-[#151619]">Monthly</option>
              <option value="Quarterly" className="bg-[#151619]">Quarterly</option>
              <option value="Yearly" className="bg-[#151619]">Yearly</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Benefits (comma-separated)</label>
            <input type="text" required value={newPlan.benefits} onChange={e => setNewPlan({...newPlan, benefits: e.target.value})}
              placeholder="e.g. Gym Access, Locker Room, Classes"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Plan'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditPlan(null); }} title="Edit Membership Plan">
        {editPlan && (
          <form onSubmit={handleEditPlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Plan Name</label>
                <input type="text" required value={editPlan.name} onChange={e => setEditPlan({...editPlan, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Price (LKR)</label>
                <input type="number" required step="0.01" value={editPlan.price} onChange={e => setEditPlan({...editPlan, price: parseFloat(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Duration</label>
              <select value={editPlan.duration} onChange={e => setEditPlan({...editPlan, duration: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="Monthly" className="bg-[#151619]">Monthly</option>
                <option value="Quarterly" className="bg-[#151619]">Quarterly</option>
                <option value="Yearly" className="bg-[#151619]">Yearly</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Benefits (comma-separated)</label>
              <input type="text" required value={editBenefits} onChange={e => setEditBenefits(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeletePlan(deleteTarget)}
        title="Delete Plan"
        message="Are you sure you want to delete this membership plan? Members on this plan will need to be reassigned."
      />
    </Card>
  );
};

const ClassManagement = ({ role = 'admin' }: { role?: string }) => {
  const { classes, instructors, members, refreshData } = useData();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [rosterClass, setRosterClass] = useState<WorkoutClass | null>(null);
  const [enrollClass, setEnrollClass] = useState<WorkoutClass | null>(null);
  const [enrollMemberId, setEnrollMemberId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editClass, setEditClass] = useState<WorkoutClass | null>(null);
  const [newClass, setNewClass] = useState({
    name: '', type: 'Yoga', trainerId: '', schedule: '', capacity: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const openEnroll = (c: WorkoutClass) => {
    setEnrollClass(c);
    setEnrollMemberId('');
    setIsEnrollOpen(true);
  };

  const openRoster = (c: WorkoutClass) => {
    setRosterClass(c);
    setIsRosterOpen(true);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollClass || !enrollMemberId) return;
    if (enrollClass.enrolledCount >= enrollClass.capacity) {
      toast('Class is already at full capacity', 'error');
      return;
    }
    if (enrollClass.enrolledMemberIds.includes(enrollMemberId)) {
      toast('Member is already enrolled in this class', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiClasses.update(enrollClass.id, {
        name: enrollClass.name,
        type: enrollClass.type,
        trainerId: enrollClass.trainerId,
        schedule: enrollClass.schedule,
        capacity: enrollClass.capacity,
        enrolledCount: enrollClass.enrolledCount + 1,
        enrolledMemberIds: [...enrollClass.enrolledMemberIds, enrollMemberId],
      });
      await refreshData();
      setIsEnrollOpen(false);
      setEnrollClass(null);
      toast('Member enrolled successfully');
    } catch (err: any) {
      toast(err.message || 'Failed to enroll member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromClass = async (c: WorkoutClass, memberId: string) => {
    try {
      await apiClasses.update(c.id, {
        name: c.name,
        type: c.type,
        trainerId: c.trainerId,
        schedule: c.schedule,
        capacity: c.capacity,
        enrolledCount: Math.max(0, c.enrolledCount - 1),
        enrolledMemberIds: c.enrolledMemberIds.filter(id => id !== memberId),
      });
      await refreshData();
      setRosterClass(prev => prev ? { ...prev, enrolledMemberIds: prev.enrolledMemberIds.filter(id => id !== memberId), enrolledCount: Math.max(0, prev.enrolledCount - 1) } : null);
      toast('Member removed from class');
    } catch (err: any) {
      toast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClasses.create({
        id: 'class' + Date.now(),
        name: newClass.name,
        type: newClass.type,
        trainerId: newClass.trainerId,
        schedule: newClass.schedule,
        capacity: parseInt(newClass.capacity),
        enrolledCount: 0,
      });
      await refreshData();
      setIsAddOpen(false);
      setNewClass({ name: '', type: 'Yoga', trainerId: '', schedule: '', capacity: '' });
      toast('Class created successfully');
    } catch (err: any) {
      console.error('Failed to add class:', err);
      toast(err.message || 'Failed to create class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClass) return;
    setSubmitting(true);
    try {
      await apiClasses.update(editClass.id, {
        name: editClass.name,
        type: editClass.type,
        trainerId: editClass.trainerId,
        schedule: editClass.schedule,
        capacity: editClass.capacity,
        enrolledCount: editClass.enrolledCount,
        enrolledMemberIds: editClass.enrolledMemberIds,
      });
      await refreshData();
      setIsEditOpen(false);
      setEditClass(null);
      toast('Class updated successfully');
    } catch (err: any) {
      console.error('Failed to update class:', err);
      toast(err.message || 'Failed to update class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await apiClasses.delete(id);
      await refreshData();
      toast('Class deleted');
    } catch (err: any) {
      console.error('Failed to delete class:', err);
      toast(err.message || 'Failed to delete class', 'error');
    }
  };

  const openEdit = (c: WorkoutClass) => {
    setEditClass({ ...c });
    setIsEditOpen(true);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold">Workout Classes</h3>
        {role !== 'member' && (
          <Button className="whitespace-nowrap" onClick={() => setIsAddOpen(true)}>
            <Plus size={18} />
            <span>Create Class</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/30 text-sm">No workout classes found</div>
        )}
        {classes.map((c, idx) => {
          const trainer = instructors.find(i => i.id === c.trainerId);
          const actualEnrolled = c.enrolledMemberIds.length > 0 ? c.enrolledMemberIds.length : c.enrolledCount;
          const capacityPct = c.capacity > 0 ? Math.round((actualEnrolled / c.capacity) * 100) : 0;
          return (
            <motion.div 
              key={c.id} 
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-red-500/20 hover:bg-white/[0.05] transition-all duration-300 group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-red-500/15 text-red-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">{c.type}</span>
                <span className="text-xs text-white/40">{actualEnrolled}/{c.capacity}</span>
              </div>
              <h4 className="text-lg font-bold mb-1">{c.name}</h4>
              <p className="text-xs text-white/40 mb-4 flex items-center gap-1"><Clock size={12} /> {c.schedule}</p>
              
              {/* Capacity bar */}
              <div className="mb-4">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full rounded-full", capacityPct > 80 ? 'bg-red-500' : capacityPct > 50 ? 'bg-red-500' : 'bg-green-500')}
                    initial={{ width: 0 }}
                    animate={{ width: `${capacityPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 p-2 bg-white/[0.03] rounded-lg border border-white/5">
                <img src={trainer?.avatar || `https://ui-avatars.com/api/?name=${trainer?.name || 'T'}&background=random`} className="w-8 h-8 rounded-full" alt="" />
                <div>
                  <p className="text-xs font-bold">{trainer?.name || 'TBA'}</p>
                  <p className="text-[10px] text-white/40">Instructor</p>
                </div>
              </div>

              <div className="flex gap-2">
                {role !== 'member' && (
                  <Button
                    className="flex-1 text-xs"
                    onClick={() => openEnroll(c)}
                    disabled={actualEnrolled >= c.capacity}
                    title={actualEnrolled >= c.capacity ? 'Class is full' : 'Enroll a member'}
                  >
                    <Plus size={14} />
                    <span>{actualEnrolled >= c.capacity ? 'Full' : 'Enroll'}</span>
                  </Button>
                )}
                <Button variant="secondary" className="flex-1 text-xs" onClick={() => openRoster(c)}>
                  <Users size={14} />
                  <span>Members</span>
                </Button>
                {role !== 'member' && (
                  <Button variant="secondary" className="p-2.5 h-auto" onClick={() => openEdit(c)}>
                    <Pencil size={14} />
                  </Button>
                )}
                {role !== 'member' && (
                  <button onClick={() => setDeleteTarget(c.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Roster Modal — Members enrolled in this class */}
      <Modal isOpen={isRosterOpen} onClose={() => { setIsRosterOpen(false); setRosterClass(null); }} title={rosterClass ? `${rosterClass.name} — Enrolled Members` : 'Class Members'}>
        {rosterClass && (() => {
          const enrolled = rosterClass.enrolledMemberIds.map(id => members.find(m => m.id === id)).filter(Boolean) as typeof members;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-white/40">{rosterClass.schedule}</p>
                <span className="text-xs font-bold text-white/50">{enrolled.length} / {rosterClass.capacity} enrolled</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                <div className={cn('h-full rounded-full transition-all', enrolled.length / rosterClass.capacity > 0.8 ? 'bg-red-500' : 'bg-green-500')}
                  style={{ width: `${Math.min(100, Math.round(enrolled.length / rosterClass.capacity * 100))}%` }} />
              </div>
              {enrolled.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-sm">No members enrolled yet</div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {enrolled.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-all group">
                      <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{m.name}</p>
                        <p className="text-[10px] text-white/40">{m.email}</p>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        m.membershipType === 'Premium' ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-white/50')}>
                        {m.membershipType}
                      </span>
                      {role !== 'member' && (
                        <button onClick={() => handleRemoveFromClass(rosterClass, m.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all ml-1">
                          <X size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              {role !== 'member' && enrolled.length < rosterClass.capacity && (
                <Button className="w-full mt-2" onClick={() => { setIsRosterOpen(false); openEnroll(rosterClass); }}>
                  <Plus size={16} /> Enroll Member
                </Button>
              )}
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={isEnrollOpen} onClose={() => { setIsEnrollOpen(false); setEnrollClass(null); }} title="Enroll Member in Class">
        {enrollClass && (
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
              <p className="font-bold">{enrollClass.name}</p>
              <p className="text-xs text-white/40">{enrollClass.schedule}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', enrollClass.enrolledCount / enrollClass.capacity > 0.8 ? 'bg-red-500' : 'bg-green-500')}
                    style={{ width: `${Math.min(100, Math.round(enrollClass.enrolledCount / enrollClass.capacity * 100))}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 whitespace-nowrap">{enrollClass.enrolledCount} / {enrollClass.capacity} enrolled</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Select Member <span className="text-red-400">*</span></label>
              <select required value={enrollMemberId} onChange={e => setEnrollMemberId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="" className="bg-[#151619]">— Choose a member —</option>
                {members.filter(m => !enrollClass?.enrolledMemberIds.includes(m.id)).map(m => (
                  <option key={m.id} value={m.id} className="bg-[#151619]">
                    {m.name} ({m.membershipType})
                  </option>
                ))}
              </select>
            </div>
            {enrollMemberId && (() => {
              const m = members.find(x => x.id === enrollMemberId);
              return m ? (
                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <img src={m.avatar || `https://ui-avatars.com/api/?name=${m.name}&background=random`} className="w-10 h-10 rounded-xl" alt="" />
                  <div>
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-xs text-white/40">{m.email}</p>
                  </div>
                  <span className={cn('ml-auto px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase', m.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40')}>
                    {m.status}
                  </span>
                </div>
              ) : null;
            })()}
            <Button type="submit" className="w-full mt-2" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Enrolling...</> : 'Enroll Member'}
            </Button>
          </form>
        )}
      </Modal>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Workout Class">
        <form onSubmit={handleAddClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Class Name</label>
              <input type="text" required value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Type</label>
              <select value={newClass.type} onChange={e => setNewClass({...newClass, type: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="Yoga" className="bg-[#151619]">Yoga</option>
                <option value="Zumba" className="bg-[#151619]">Zumba</option>
                <option value="Cardio" className="bg-[#151619]">Cardio</option>
                <option value="Strength" className="bg-[#151619]">Strength</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Instructor</label>
              <select required value={newClass.trainerId} onChange={e => setNewClass({...newClass, trainerId: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                <option value="" className="bg-[#151619]">Select Instructor</option>
                {instructors.map(i => <option key={i.id} value={i.id} className="bg-[#151619]">{i.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Capacity</label>
              <input type="number" required min="1" value={newClass.capacity} onChange={e => setNewClass({...newClass, capacity: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Schedule</label>
            <input type="text" required value={newClass.schedule} onChange={e => setNewClass({...newClass, schedule: e.target.value})}
              placeholder="e.g. Mon, Wed 08:00 AM"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Class'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditClass(null); }} title="Edit Workout Class">
        {editClass && (
          <form onSubmit={handleEditClass} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Class Name</label>
                <input type="text" required value={editClass.name} onChange={e => setEditClass({...editClass, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Type</label>
                <select value={editClass.type} onChange={e => setEditClass({...editClass, type: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  <option value="Yoga" className="bg-[#151619]">Yoga</option>
                  <option value="Zumba" className="bg-[#151619]">Zumba</option>
                  <option value="Cardio" className="bg-[#151619]">Cardio</option>
                  <option value="Strength" className="bg-[#151619]">Strength</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Instructor</label>
                <select required value={editClass.trainerId} onChange={e => setEditClass({...editClass, trainerId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white">
                  {instructors.map(i => <option key={i.id} value={i.id} className="bg-[#151619]">{i.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Capacity</label>
                <input type="number" required min="1" value={editClass.capacity} onChange={e => setEditClass({...editClass, capacity: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Schedule</label>
              <input type="text" required value={editClass.schedule} onChange={e => setEditClass({...editClass, schedule: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteClass(deleteTarget)}
        title="Delete Class"
        message="Are you sure you want to delete this workout class?"
      />
    </Card>
  );
};

// --- Device Management ---

const DeviceManagement = () => {
  const { devices, accessLogs, refreshData } = useData();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<DoorDevice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'devices' | 'logs'>('devices');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newDevice, setNewDevice] = useState({ name: '', location: '' });

  const todayLogs = accessLogs.filter(l => l.date === format(new Date(), 'yyyy-MM-dd'));
  const grantedToday = todayLogs.filter(l => l.result === 'Granted').length;
  const deniedToday = todayLogs.filter(l => l.result === 'Denied').length;
  const onlineDevices = devices.filter(d => d.status === 'Online').length;

  const filteredLogs = accessLogs.filter(l => l.date === logDate);

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiDevices.create(newDevice);
      await refreshData();
      setIsAddOpen(false);
      setNewDevice({ name: '', location: '' });
      toast('Device registered successfully');
    } catch (err: any) {
      toast(err.message || 'Failed to register device', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDevice) return;
    setSubmitting(true);
    try {
      await apiDevices.update(editDevice.id, { name: editDevice.name, location: editDevice.location });
      await refreshData();
      setIsEditOpen(false);
      setEditDevice(null);
      toast('Device updated successfully');
    } catch (err: any) {
      toast(err.message || 'Failed to update device', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await apiDevices.delete(id);
      await refreshData();
      toast('Device removed');
    } catch (err: any) {
      toast(err.message || 'Failed to delete device', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', value: devices.length, icon: Smartphone, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Online', value: onlineDevices, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Entries Today', value: grantedToday, icon: DoorOpen, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Denied Today', value: deniedToday, icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", s.bg, s.color)}><s.icon size={20} /></div>
              <div>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        <button onClick={() => setActiveView('devices')}
          className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all",
            activeView === 'devices' ? "bg-red-500 text-white shadow-lg" : "text-white/40 hover:text-white/60")}>
          Devices
        </button>
        <button onClick={() => setActiveView('logs')}
          className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all",
            activeView === 'logs' ? "bg-red-500 text-white shadow-lg" : "text-white/40 hover:text-white/60")}>
          Access Logs
        </button>
      </div>

      {activeView === 'devices' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Door Lock Devices</h3>
            <Button onClick={() => setIsAddOpen(true)}><Plus size={18} /> Register Device</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((d, i) => (
              <motion.div key={d.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", d.status === 'Online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{d.name}</h4>
                      <p className="text-xs text-white/40">{d.location}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    d.status === 'Online' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                    {d.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/30 mt-4 pt-3 border-t border-white/5">
                  <span>Entries today: <span className="text-white/60 font-bold">{d.totalAccessToday}</span></span>
                  {d.lastHeartbeat && <span>Last ping: {new Date(d.lastHeartbeat).toLocaleTimeString()}</span>}
                </div>
                <div className="flex gap-1.5 mt-3 items-center">
                  <a
                    href={`?portal=${d.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20"
                  >
                    <DoorOpen size={13} />
                    Open Portal
                  </a>
                  <button onClick={() => { setEditDevice({ ...d }); setIsEditOpen(true); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteDevice(d.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
            {devices.length === 0 && (
              <div className="col-span-full py-12 text-center text-white/30 text-sm">No devices registered yet</div>
            )}
          </div>
        </Card>
      )}

      {activeView === 'logs' && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold">Access Logs</h3>
            <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-4 py-4 font-medium">Time</th>
                  <th className="px-4 py-4 font-medium">Device</th>
                  <th className="px-4 py-4 font-medium">Member</th>
                  <th className="px-4 py-4 font-medium">Card ID</th>
                  <th className="px-4 py-4 font-medium">Result</th>
                  <th className="px-4 py-4 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((l, i) => (
                  <motion.tr key={l.id} className="hover:bg-white/[0.03] transition-colors"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                    <td className="px-4 py-4 text-sm font-mono text-white/60">{new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-4 text-sm">{l.deviceName}</td>
                    <td className="px-4 py-4 text-sm font-bold">{l.memberName || '—'}</td>
                    <td className="px-4 py-4 font-mono text-xs text-white/40">{l.cardId}</td>
                    <td className="px-4 py-4">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        l.result === 'Granted' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                        {l.result}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/40">{l.reason}</td>
                  </motion.tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No access logs for this date</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Device Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Door Device">
        <form onSubmit={handleAddDevice} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Device Name</label>
            <input type="text" required value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})}
              placeholder="e.g. Main Entrance Lock"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Location</label>
            <input type="text" required value={newDevice.location} onChange={e => setNewDevice({...newDevice, location: e.target.value})}
              placeholder="e.g. Front Door, Second Floor"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : 'Register Device'}
          </Button>
        </form>
      </Modal>

      {/* Edit Device Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditDevice(null); }} title="Edit Device">
        {editDevice && (
          <form onSubmit={handleEditDevice} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Device Name</label>
              <input type="text" required value={editDevice.name} onChange={e => setEditDevice({...editDevice, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-bold">Location</label>
              <input type="text" required value={editDevice.location} onChange={e => setEditDevice({...editDevice, location: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

// --- Device Portal (kiosk page for door devices) ---

const DevicePortal = ({ deviceId }: { deviceId: string }) => {
  const [device, setDevice] = useState<DoorDevice | null>(null);
  const [cardId, setCardId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ granted: boolean; memberName?: string; reason?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiDevices.getById(deviceId).then(setDevice).catch(() => setDevice(null));
    apiDevices.heartbeat(deviceId).catch(() => {});
  }, [deviceId]);

  // Auto-clear result after 4 seconds and refocus
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => {
      setResult(null);
      setCardId('');
      inputRef.current?.focus();
    }, 4000);
    return () => clearTimeout(t);
  }, [result]);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiDevices.cardAccess(deviceId, cardId.trim());
      setResult(res);
    } catch {
      setResult({ granted: false, reason: 'Server error — please try again' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0f12] flex flex-col items-center justify-center p-6 text-white">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 mb-4">
          <span className={cn('w-2 h-2 rounded-full', device ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
          {device ? `${device.name} — ${device.location}` : 'Connecting to device...'}
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-red-500">Iron</span>Pulse
        </h1>
        <p className="text-white/30 text-sm mt-1">Access Terminal</p>
      </div>

      {/* Result overlay */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'fixed inset-0 flex flex-col items-center justify-center gap-6 z-50',
              result.granted ? 'bg-green-950/95' : 'bg-red-950/95'
            )}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn('w-28 h-28 rounded-full flex items-center justify-center', result.granted ? 'bg-green-500/20 border-4 border-green-500' : 'bg-red-500/20 border-4 border-red-500')}
            >
              {result.granted ? <CheckCircle size={56} className="text-green-400" /> : <XCircle size={56} className="text-red-400" />}
            </motion.div>
            <div className="text-center">
              <p className={cn('text-4xl font-black mb-2', result.granted ? 'text-green-400' : 'text-red-400')}>
                {result.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
              </p>
              {result.memberName && <p className="text-2xl font-bold text-white mb-1">Welcome, {result.memberName}</p>}
              {result.reason && <p className="text-white/50 text-sm">{result.reason}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card input form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleAccess} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs text-white/40 uppercase tracking-widest font-bold text-center">
              Enter Card ID / Scan NFC
            </label>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={cardId}
              onChange={e => setCardId(e.target.value)}
              placeholder="Card ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-red-500/60 focus:bg-white/[0.07] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !cardId.trim()}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <DoorOpen size={18} />}
            {submitting ? 'Checking...' : 'Request Access'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">
          Tap your NFC card or type your Card ID above
        </p>
      </div>

      {/* Recent access log for this device */}
      <RecentAccessLog deviceId={deviceId} />
    </div>
  );
};

const RecentAccessLog = ({ deviceId }: { deviceId: string }) => {
  const [logs, setLogs] = useState<{ granted: boolean; memberName: string; timestamp: string }[]>([]);

  useEffect(() => {
    const fetchLogs = () => {
      apiDevices.getAccessLogs(deviceId)
        .then(all => {
          const today = format(new Date(), 'yyyy-MM-dd');
          const todayLogs = all.filter(l => l.date === today).slice(-5).reverse();
          setLogs(todayLogs.map(l => ({
            granted: l.result === 'Granted',
            memberName: l.memberName || l.cardId,
            timestamp: l.timestamp,
          })));
        })
        .catch(() => {});
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (logs.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-sm">
      <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-3 text-center">Recent Activity Today</p>
      <div className="space-y-2">
        {logs.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', l.granted ? 'bg-green-500' : 'bg-red-500')} />
            <span className="text-sm font-medium flex-1 truncate">{l.memberName}</span>
            <span className="text-xs text-white/30 font-mono">{l.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

function AppInner() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(() => typeof window !== 'undefined' && window.location.pathname === '/login');

  useEffect(() => {
    const onPop = () => setShowLogin(window.location.pathname === '/login');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goToLogin = () => {
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
    setShowLogin(true);
  };

  // After successful login redirect back to /
  const clearLoginRoute = () => {
    if (window.location.pathname === '/login') {
      window.history.replaceState({}, '', '/');
    }
    setShowLogin(false);
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    users: User[];
    members: Member[];
    instructors: Instructor[];
    plans: MembershipPlan[];
    classes: WorkoutClass[];
    payments: Payment[];
    attendance: Attendance[];
    healthRecords: HealthRecord[];
    devices: DoorDevice[];
    accessLogs: AccessLog[];
  }>({
    users: [],
    members: [],
    instructors: [],
    plans: [],
    classes: [],
    payments: [],
    attendance: [],
    healthRecords: [],
    devices: [],
    accessLogs: [],
  });

  const refreshData = useCallback(async () => {
    try {
      const result = await loadAllData();
      setData(result);
    } catch (err) {
      console.error('Failed to load data from API:', err);
    }
  }, []);

  // Persistence — restore saved user and clear /login route if already authenticated
  useEffect(() => {
    const savedUser = localStorage.getItem('gym_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (window.location.pathname === '/login') {
        window.history.replaceState({}, '', '/');
      }
      setShowLogin(false);
    }
  }, []);

  // Load data from API when user logs in
  useEffect(() => {
    if (user) {
      setLoading(true);
      loadAllData()
        .then(result => setData(result))
        .catch(err => {
          console.error('Failed to load data from API:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  // Reset activeTab to the role's first tab when the role changes
  useEffect(() => {
    if (!user?.role) return;
    const roleTabs: Record<string, string> = {
      admin: 'overview',
      instructor: 'trainees',
      member: 'my-stats',
    };
    const validTabs: Record<string, string[]> = {
      admin: ['overview', 'members', 'instructors', 'plans', 'classes', 'payments', 'attendance', 'devices'],
      instructor: ['trainees', 'schedule', 'attendance'],
      member: ['my-stats', 'attendance-history', 'id-card', 'classes', 'payments'],
    };
    if (!validTabs[user.role]?.includes(activeTab)) {
      setActiveTab(roleTabs[user.role] || 'overview');
    }
  }, [user?.role]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('gym_user', JSON.stringify(u));
    clearLoginRoute();
    if (u.onboarded) {
      if (u.role === 'admin') setActiveTab('overview');
      else if (u.role === 'instructor') setActiveTab('trainees');
      else setActiveTab('my-stats');
    }
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('gym_user', JSON.stringify(updatedUser));
    clearLoginRoute();
    if (updatedUser.role === 'admin') setActiveTab('overview');
    else if (updatedUser.role === 'instructor') setActiveTab('trainees');
    else setActiveTab('my-stats');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gym_user');
    window.history.replaceState({}, '', '/login');
    setShowLogin(true);
  };

  if (!user) {
    if (showLogin) {
      return (
        <ToastProvider>
          <LoginPage onLogin={handleLogin} />
        </ToastProvider>
      );
    }
    return (
      <ToastProvider>
        <LandingPage onEnter={goToLogin} />
      </ToastProvider>
    );
  }

  if (!user.onboarded) {
    return (
      <ToastProvider>
        <OnboardingFlow user={user} onComplete={handleOnboardingComplete} />
      </ToastProvider>
    );
  }

  const getTabs = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'instructors', label: 'Trainers', icon: UserIcon },
          { id: 'plans', label: 'Plans', icon: LayoutDashboard },
          { id: 'classes', label: 'Classes', icon: Dumbbell },
          { id: 'equipment', label: 'Equipment', icon: Dumbbell },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'devices', label: 'Devices', icon: Smartphone },
        ];
      case 'instructor':
        return [
          { id: 'trainees', label: 'My Trainees', icon: Users },
          { id: 'schedule', label: 'Classes', icon: Dumbbell },
          { id: 'attendance', label: 'Attendance', icon: CheckCircle },
        ];
      case 'member':
        return [
          { id: 'my-stats', label: 'My Stats', icon: Activity },
          { id: 'workout-tracker', label: 'Workout', icon: Activity },
          { id: 'attendance-history', label: 'Attendance', icon: Calendar },
          { id: 'id-card', label: 'Membership', icon: QrCode },
          { id: 'classes', label: 'Classes', icon: Dumbbell },
          { id: 'payments', label: 'Payments', icon: CreditCard },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={32} className="text-red-500" />
          </motion.div>
          <motion.p 
            className="text-white/40 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading data from server...
          </motion.p>
        </div>
      );
    }

    if (user.role === 'admin') {
      if (activeTab === 'overview') return <AdminOverview />;
      if (activeTab === 'reports') return <AdminReports data={data} />;
      if (activeTab === 'leaderboard') return <Leaderboard activities={data.equipmentActivities} />;
      if (activeTab === 'members') return <MemberList />;
      if (activeTab === 'instructors') return <InstructorList />;
      if (activeTab === 'plans') return <PlanManagement />;
      if (activeTab === 'classes') return <ClassManagement />;
      if (activeTab === 'equipment') return <EquipmentManagement equipment={data.equipment} refreshData={refreshData} />;
      if (activeTab === 'payments') return <PaymentList />;
      if (activeTab === 'attendance') return <AttendanceList />;
      if (activeTab === 'devices') return <DeviceManagement />;
      return <div className="flex items-center justify-center h-full text-white/30">View under construction</div>;
    }
    
    if (user.role === 'instructor') {
      if (activeTab === 'trainees') return <InstructorMembers instructorId={user.id} instructorEmail={user.email} />;
      if (activeTab === 'schedule') return <ClassManagement role="instructor" />;
      if (activeTab === 'attendance') return <AttendanceList />;
      return <div className="flex items-center justify-center h-full text-white/30">View under construction</div>;
    }

    if (user.role === 'member') {
      const resolvedMember = data.members.find(m => String(m.id) === String(user.id))
        || data.members.find(m => m.email.toLowerCase() === user.email.toLowerCase());
        
      if (!resolvedMember) {
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white/50 text-center px-4">
            <h3 className="text-xl font-bold text-red-400 mb-2">Member Record Not Found</h3>
            <p className="mb-6 max-w-md">Your member profile could not be found in the database. This usually happens if the backend was reset while you were logged in.</p>
            <Button onClick={() => window.location.reload()}>Please Refresh / Relogin</Button>
          </div>
        );
      }

      if (activeTab === 'my-stats') return <MemberDashboard memberId={resolvedMember.id} memberEmail={user.email} />;
      if (activeTab === 'workout-tracker') return <ActiveWorkout memberId={resolvedMember.id} />;
      if (activeTab === 'id-card') return <MembershipCardView memberId={resolvedMember.id} memberEmail={user.email} />;
      if (activeTab === 'attendance-history') return <MemberAttendanceHistory memberId={resolvedMember.id} />;
      if (activeTab === 'classes') return <ClassManagement role="member" />;
      if (activeTab === 'payments') return <MemberPayments memberId={resolvedMember.id} />;
      return <div className="flex items-center justify-center h-full text-white/30">View under construction</div>;
    }

    return null;
  };

  const contextValue: AppData = {
    ...data,
    loading,
    refreshData,
  };

  return (
    <ToastProvider>
      <DataContext.Provider value={contextValue}>
        <DashboardLayout
          user={user}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        >
          {renderContent()}
        </DashboardLayout>
      </DataContext.Provider>
    </ToastProvider>
  );
}

export default function App() {
  const portalDeviceId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('portal')
    : null;
  if (portalDeviceId) return <DevicePortal deviceId={portalDeviceId} />;
  return <AppInner />;
}
