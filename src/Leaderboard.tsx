import React, { useMemo } from 'react';
import { Trophy, Dumbbell, User, Clock, Flame, Medal, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { EquipmentActivity } from './types';

interface LeaderboardProps {
  activities: EquipmentActivity[];
}

export const Leaderboard = ({ activities }: LeaderboardProps) => {
  const getMinutes = (timeString: string) => {
    const [h, m, s] = timeString.split(':').map(Number);
    return h * 60 + m + s / 60;
  };

  const { memberStats, equipmentStats, maxMemberMinutes, maxEqMinutes } = useMemo(() => {
    const mStats: Record<string, { memberId: string, name: string, totalMinutes: number, sessions: number }> = {};
    const eStats: Record<string, { equipmentId: string, name: string, type: string, totalMinutes: number, uses: number }> = {};

    activities.forEach(act => {
      if (!act.endTime) return;
      const start = getMinutes(act.startTime);
      const end = getMinutes(act.endTime);
      let duration = end - start;
      if (duration < 0) duration += 24 * 60;

      const mId = act.member.id;
      if (!mStats[mId]) mStats[mId] = { memberId: mId, name: act.member.name, totalMinutes: 0, sessions: 0 };
      mStats[mId].totalMinutes += duration;
      mStats[mId].sessions += 1;

      const eId = act.equipment.id;
      if (!eStats[eId]) eStats[eId] = { equipmentId: eId, name: act.equipment.name, type: act.equipment.type, totalMinutes: 0, uses: 0 };
      eStats[eId].totalMinutes += duration;
      eStats[eId].uses += 1;
    });

    const sortedMembers = Object.values(mStats).sort((a, b) => b.totalMinutes - a.totalMinutes);
    const sortedEquipment = Object.values(eStats).sort((a, b) => b.totalMinutes - a.totalMinutes);

    return { 
      memberStats: sortedMembers, 
      equipmentStats: sortedEquipment,
      maxMemberMinutes: sortedMembers[0]?.totalMinutes || 1,
      maxEqMinutes: sortedEquipment[0]?.totalMinutes || 1
    };
  }, [activities]);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-primary-500 mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-400 w-8 h-8" />
            IronPulse Leaderboards
          </h2>
          <p className="text-white/60 text-sm max-w-lg">
            Real-time analytics of our most dedicated members and the most heavily utilized equipment on the gym floor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Members */}
        <div className="glass p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-xl">
              <User className="text-primary-400 w-6 h-6" />
            </div>
            Top Athletes
          </h3>
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
            {memberStats.length === 0 ? (
              <p className="text-white/40 text-center py-10 italic">Awaiting workout data...</p>
            ) : (
              memberStats.slice(0, 10).map((stat, idx) => (
                <motion.div variants={itemVariants} key={stat.memberId} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="flex items-center gap-5 p-3 rounded-2xl border border-transparent group-hover:border-white/5 transition-all">
                    
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg
                        ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-500/20' : 
                          idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/20' :
                          idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-700/20' :
                          'bg-white/5 text-white/50 border border-white/10'}`}>
                        {idx < 3 ? <Medal className="w-7 h-7" /> : `#${idx + 1}`}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-lg truncate group-hover:text-primary-400 transition-colors">{stat.name}</h4>
                      <div className="flex items-center gap-3 text-white/50 text-xs mt-1">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {stat.sessions} workouts</span>
                        <span className="flex items-center gap-1 text-orange-400/80"><Flame className="w-3 h-3" /> ~{Math.round(stat.totalMinutes * 6)} kcal</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.totalMinutes / maxMemberMinutes) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : idx === 2 ? 'bg-amber-600' : 'bg-primary-500'}`}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right pl-4">
                      <div className="text-white font-bold text-xl tracking-tight">
                        {formatDuration(stat.totalMinutes)}
                      </div>
                      <div className="text-white/40 text-xs mt-1 uppercase tracking-wider font-semibold">Active Time</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Most Popular Equipment */}
        <div className="glass p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
           <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
           
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Dumbbell className="text-emerald-400 w-6 h-6" />
            </div>
            Equipment Usage
          </h3>
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
            {equipmentStats.length === 0 ? (
              <p className="text-white/40 text-center py-10 italic">Awaiting equipment data...</p>
            ) : (
              equipmentStats.slice(0, 10).map((stat, idx) => (
                <motion.div variants={itemVariants} key={stat.equipmentId} className="group relative">
                  <div className="flex items-center gap-5 p-3 rounded-2xl border border-transparent hover:bg-white/5 transition-all">
                    
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border
                      ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                        'bg-white/5 text-white/50 border-white/10'}`}>
                      #{idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-lg truncate group-hover:text-emerald-400 transition-colors">{stat.name}</h4>
                      <p className="text-white/50 text-xs mt-1 bg-white/5 inline-block px-2 py-0.5 rounded-md">{stat.type}</p>
                      <div className="h-1.5 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.totalMinutes / maxEqMinutes) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                    
                    <div className="text-right pl-4">
                      <div className="text-white font-bold text-xl tracking-tight flex items-center justify-end gap-1.5">
                        {formatDuration(stat.totalMinutes)}
                      </div>
                      <div className="text-white/40 text-xs mt-1 uppercase tracking-wider font-semibold">{stat.uses} Uses</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
