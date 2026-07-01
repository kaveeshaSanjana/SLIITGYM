import React, { useState, useEffect } from 'react';
import { Camera, Dumbbell, Play, Square, Loader2, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EquipmentActivity } from './types';
import { apiEquipmentActivities } from './api';
import { QRScanner } from './QRScanner';

export const ActiveWorkout = ({ memberId }: { memberId: string }) => {
  const [equipmentId, setEquipmentId] = useState('');
  const [activeSession, setActiveSession] = useState<EquipmentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const session = await apiEquipmentActivities.getActiveSession(memberId);
        if (session) {
          setActiveSession(session);
        }
      } catch (e) {
        console.error("Failed to load active session", e);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, [memberId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession) {
      const [hours, minutes, seconds] = activeSession.startTime.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes, seconds, 0);
      
      const updateTimer = () => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedSeconds(diff > 0 ? diff : 0);
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const handleToggle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSession && !equipmentId.trim()) return;

    setLoading(true);
    try {
      const targetEqId = activeSession ? activeSession.equipment.id : equipmentId;
      const result = await apiEquipmentActivities.toggleSession(memberId, targetEqId);
      
      if (result.endTime) {
        setActiveSession(null);
        setElapsedSeconds(0);
        setEquipmentId('');
      } else {
        setActiveSession(result);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && !activeSession) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-10 h-10 text-primary-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-10 px-4">
      <AnimatePresence mode="wait">
        {activeSession ? (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-full max-w-md relative"
          >
            {/* Background glowing rings */}
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            
            <div className="glass p-12 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
              
              {/* Radar pulse effect */}
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute w-40 h-40 bg-primary-500/30 rounded-full pointer-events-none"
              />
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 1 }}
                className="absolute w-40 h-40 bg-primary-500/30 rounded-full pointer-events-none"
              />

              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-xl shadow-primary-500/30">
                <Dumbbell className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10 tracking-tight">
                {activeSession.equipment.name}
              </h2>
              <div className="bg-white/10 px-4 py-1.5 rounded-full mb-10 relative z-10 border border-white/5 backdrop-blur-md">
                <p className="text-primary-300 uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  Session Active
                </p>
              </div>

              <div className="text-[5rem] leading-none font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-12 tracking-tighter relative z-10 drop-shadow-2xl">
                {formatTime(elapsedSeconds)}
              </div>

              <button 
                onClick={() => handleToggle()}
                disabled={loading}
                className="w-full py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 relative z-10 group overflow-hidden transition-all
                  bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/50"
              >
                {loading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <>
                    <Square className="w-6 h-6 transition-transform group-hover:scale-90" fill="currentColor" />
                    Finish Workout
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20 border border-white/10 group-hover:border-primary-500/50 transition-colors">
                  <Scan className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Scan Equipment</h2>
                <p className="text-white/50 text-sm leading-relaxed px-4">
                  Scan the QR code on the machine or enter its ID manually to begin tracking your session.
                </p>
              </div>

              <form onSubmit={handleToggle} className="space-y-6 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input 
                    type="text" 
                    placeholder="Enter ID (e.g. EQ-001)" 
                    required={!showScanner}
                    value={equipmentId}
                    onChange={e => setEquipmentId(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-6 py-5 text-white placeholder-white/30 text-center text-xl font-mono focus:outline-none focus:border-primary-500 focus:bg-primary-500/10 transition-all relative z-10 shadow-inner mb-4"
                  />
                  
                  {showScanner ? (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Camera Active</span>
                        <button type="button" onClick={() => setShowScanner(false)} className="text-xs text-red-400 font-bold uppercase hover:text-red-300">Close</button>
                      </div>
                      <QRScanner 
                        onScanSuccess={(text) => {
                          setEquipmentId(text);
                          setShowScanner(false);
                          // Auto submit might be too fast if they aren't ready, but let's assume they want to start
                        }}
                      />
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="w-full mb-4 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                    >
                      <Camera size={18} />
                      Open Camera Scanner
                    </button>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={loading || !equipmentId.trim()}
                  className="w-full py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-6 h-6" fill="currentColor" />
                      Start Session
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
