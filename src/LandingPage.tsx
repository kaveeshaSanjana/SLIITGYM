import React, { useState, useRef, useEffect, useCallback } from 'react';
import { apiPlans } from './api';
import { MembershipPlan } from './types';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  Dumbbell, Flame, Zap, Trophy, ArrowRight, Check, Star,
  Activity, Users, Calendar, ShieldCheck, ChevronRight, Play,
  Heart, Target, Award, TrendingUp, Menu, X, Quote, Send, Bot
} from 'lucide-react';
import heroImg from './assets/gym-hero.jpg';
import weightsImg from './assets/gym-weights.jpg';
import athleteImg from './assets/gym-athlete.jpg';
import boxerImg from './assets/gym-boxer.jpg';
import teamImg from './assets/team.png';

const RedButton = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const styles = variant === 'primary'
    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_10px_40px_rgba(220,38,38,0.5)] hover:shadow-[0_15px_55px_rgba(220,38,38,0.85)] hover:-translate-y-0.5'
    : 'bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur hover:-translate-y-0.5';
  return (
    <button onClick={onClick}
      className={`px-7 py-4 rounded-full font-bold tracking-wide transition-all duration-300 active:scale-95 inline-flex items-center justify-center gap-2 ${styles} ${className}`}>
      {children}
    </button>
  );
};

const Stat = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="text-center">
    <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white via-white to-red-500/60 bg-clip-text text-transparent">{value}</div>
    <div className="text-xs uppercase tracking-[0.25em] text-white/40 mt-2">{label}</div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] hover:border-red-500/40 transition-all duration-500 overflow-hidden">
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-transparent to-red-600/0 group-hover:from-red-600/10 group-hover:to-red-600/5 transition-all duration-500" />
    <div className="relative">
      <motion.div
        whileHover={{ rotate: -8, scale: 1.1 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-5 shadow-[0_10px_30px_rgba(220,38,38,0.45)]">
        <Icon className="w-7 h-7 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const PlanCard = ({ name, price, duration, features, featured, delay, onEnter }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -10 }}
    className={`relative p-8 rounded-3xl ${featured
      ? 'bg-gradient-to-b from-red-600/20 to-red-900/5 border-2 border-red-500/60 shadow-[0_20px_70px_rgba(220,38,38,0.35)] scale-[1.03]'
      : 'bg-white/[0.03] border border-white/[0.08]'} transition-all duration-300`}>
    {featured && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-600 to-red-700 text-[10px] font-black tracking-widest rounded-full uppercase">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-black uppercase tracking-tight">{name}</h3>
    <div className="mt-4 flex items-baseline gap-1">
      <span className="text-5xl font-black">LKR {price}</span>
      <span className="text-white/40 text-sm">/{duration || 'month'}</span>
    </div>
    <ul className="mt-8 space-y-3">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center gap-3 text-sm text-white/70">
          <div className={`w-5 h-5 rounded-full ${featured ? 'bg-red-500' : 'bg-white/10'} flex items-center justify-center flex-shrink-0`}>
            <Check className="w-3 h-3 text-white" />
          </div>
          {f}
        </li>
      ))}
    </ul>
    <button onClick={onEnter} className={`mt-8 w-full py-3.5 rounded-full font-bold text-sm tracking-wide transition-all ${
      featured ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}>
      Join Now
    </button>
  </motion.div>
);

const ClassCard = ({ image, title, time, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8 }}
    className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer">
    <img src={image} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-br from-red-900/0 to-red-900/0 group-hover:from-red-900/40 group-hover:to-transparent transition-all duration-500" />
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <div className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-bold mb-2">{time}</div>
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <div className="mt-4 flex items-center gap-2 text-sm text-white/70 group-hover:text-red-400 transition-colors">
        Join class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.div>
);

type BotMsg = { role: 'bot' | 'user'; text: string };

const BMIBot = ({ onEnter }: { onEnter: () => void }) => {
  const [messages, setMessages] = useState<BotMsg[]>([
    { role: 'bot', text: "Hey warrior! I'm PulseBot. Let's check your BMI. First — what's your height in centimeters? (e.g. 175)" },
  ]);
  const [step, setStep] = useState<'height' | 'weight' | 'done'>('height');
  const [height, setHeight] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus();
  }, [messages]);

  const getAdvice = (bmi: number) => {
    if (bmi < 18.5) return { tag: 'Underweight', msg: "Your BMI is on the low side. Fuel up with calorie-dense meals, lift heavy, and progressive overload. Our trainers can build you a mass-gain plan." };
    if (bmi < 25) return { tag: 'Healthy', msg: "Excellent! You're in the healthy range. Keep the momentum going — join IronPulse to push past 'healthy' and become elite." };
    if (bmi < 30) return { tag: 'Overweight', msg: "Your BMI is slightly high. Don't stress — cardio + strength + clean eating fixes this fast. We've got a coach for that." };
    return { tag: 'Obese', msg: "Your BMI signals real health risk. Every warrior started somewhere — join us today for guided programs, expert trainers, and a community that has your back." };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    const num = parseFloat(val);
    const userMsg: BotMsg = { role: 'user', text: val };
    setInput('');

    if (step === 'height') {
      if (!num || num < 80 || num > 250) {
        setMessages(m => [...m, userMsg, { role: 'bot', text: 'Hmm, that height looks off. Enter centimeters between 80 and 250.' }]);
        return;
      }
      setHeight(num);
      setStep('weight');
      setMessages(m => [...m, userMsg, { role: 'bot', text: `Got it — ${num} cm. Now drop your weight in kilograms. (e.g. 72)` }]);
      return;
    }
    if (step === 'weight') {
      if (!num || num < 20 || num > 400) {
        setMessages(m => [...m, userMsg, { role: 'bot', text: 'That weight seems off. Enter kilograms between 20 and 400.' }]);
        return;
      }
      const h = (height || 0) / 100;
      const bmi = num / (h * h);
      const a = getAdvice(bmi);
      setStep('done');
      setMessages(m => [...m, userMsg,
        { role: 'bot', text: `Your BMI is ${bmi.toFixed(1)} — ${a.tag}.` },
        { role: 'bot', text: a.msg },
      ]);
      return;
    }
    setMessages(m => [...m, userMsg, { role: 'bot', text: "Want to recalculate? Hit Restart below — or join IronPulse and let a coach take it from here." }]);
  };

  const restart = () => {
    setMessages([{ role: 'bot', text: "Let's go again. What's your height in centimeters?" }]);
    setStep('height');
    setHeight(null);
  };

  return (
    <section id="bmi" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.12),transparent_60%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs uppercase tracking-[0.25em] text-red-400 font-bold mb-4">
            <Bot className="w-3.5 h-3.5" /> PulseBot
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Quick BMI <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Check</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">Chat with our bot — get your BMI and a personalized next step in 30 seconds.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-red-950/40 to-transparent">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">PulseBot</div>
              <div className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="h-[420px] overflow-y-auto px-6 py-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-sm'
                      : 'bg-white/[0.06] text-white/90 border border-white/5 rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-4 border-t border-white/10 bg-black/30">
            <input
              ref={inputRef}
              type="text"
              inputMode={step === 'done' ? 'text' : 'decimal'}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={step === 'height' ? 'Your height in cm…' : step === 'weight' ? 'Your weight in kg…' : 'Type a message…'}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-red-500/50 placeholder:text-white/30"
            />
            <button type="submit" className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 flex items-center justify-center transition-all active:scale-95 shadow-[0_4px_20px_rgba(220,38,38,0.5)]">
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          {step === 'done' && (
            <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
              <button onClick={restart} className="flex-1 px-5 py-3 rounded-full border border-white/15 text-sm font-bold hover:bg-white/5 transition">
                Restart
              </button>
              <button onClick={onEnter} className="flex-1 px-5 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-sm font-bold text-white transition shadow-[0_8px_30px_rgba(220,38,38,0.45)]">
                Join IronPulse Today
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  useEffect(() => {
    apiPlans.getAll().then(setPlans).catch(() => {});
  }, []);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroImgY = useTransform(scrollY, [0, 800], [0, -100]);
  const heroImgScale = useTransform(scrollY, [0, 800], [1, 1.15]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.55)]">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">IRON<span className="text-red-500">PULSE</span></span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            {['Features', 'Classes', 'Pricing', 'About', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="relative hover:text-white transition group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          <div className="hidden md:block">
            <RedButton onClick={onEnter} className="!py-2.5 !px-5 text-sm">Login <ArrowRight className="w-4 h-4" /></RedButton>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 px-6 py-4 space-y-3 bg-black/80">
            <a href="#features" className="block text-white/70">Features</a>
            <a href="#classes" className="block text-white/70">Classes</a>
            <a href="#pricing" className="block text-white/70">Pricing</a>
            <a href="#about" className="block text-white/70">About</a>
            <RedButton onClick={onEnter} className="!py-2.5 !px-5 text-sm w-full">Login</RedButton>
          </div>
        )}
      </motion.nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Background image */}
        <motion.div
          style={{ y: heroImgY, scale: heroImgScale }}
          className="absolute inset-0">
          <img src={heroImg} alt="Athlete training in dark gym" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-black/70" />
        </motion.div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'
          }} />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-red-700/25 rounded-full blur-[160px]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold tracking-widest uppercase text-red-400 mb-8 backdrop-blur">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            Now Accepting New Members
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-[-0.04em] leading-[0.85]">
            FORGE YOUR<br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">STRONGEST</span>
              <motion.span
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 1.2, delay: 0.8 }}
                style={{ originX: 0 }}
                className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-red-600 to-transparent" />
            </span><br />
            SELF YET.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-8 max-w-2xl mx-auto text-lg text-white/60 leading-relaxed">
            Track every rep, every drop of sweat, every milestone. The all-in-one gym
            management system built for athletes who refuse to settle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <RedButton onClick={onEnter}>
              Start Training Now <ArrowRight className="w-4 h-4" />
            </RedButton>
            <RedButton variant="secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="w-4 h-4" /> Explore Features
            </RedButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <Stat value="12K+" label="Active Members" delay={0} />
            <Stat value="850+" label="Daily Workouts" delay={0.1} />
            <Stat value="98%" label="Goal Success" delay={0.2} />
            <Stat value="24/7" label="Gym Access" delay={0.3} />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-red-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="border-y border-white/[0.06] py-6 overflow-hidden bg-gradient-to-r from-red-950/40 via-black to-red-950/40 relative">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap text-3xl md:text-5xl font-black uppercase tracking-tight">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span className="text-white">No Excuses</span>
              <Flame className="w-8 h-8 text-red-500" />
              <span className="text-white/30">Train Hard</span>
              <Flame className="w-8 h-8 text-red-500" />
              <span className="text-white">Stay Strong</span>
              <Flame className="w-8 h-8 text-red-500" />
              <span className="text-white/30">Built Different</span>
              <Flame className="w-8 h-8 text-red-500" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-16">
            <div className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">// Power Tools</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95]">
              Everything you need.<br />
              <span className="text-white/40">Nothing you don't.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Activity} title="Health Tracking" desc="Log weight, calories, workouts. Visualize progress with rich, real-time analytics." delay={0} />
            <FeatureCard icon={Users} title="Member Management" desc="Onboard, assign trainers and manage every member from one premium dashboard." delay={0.1} />
            <FeatureCard icon={Calendar} title="Class Scheduling" desc="Book, fill and run classes — yoga, strength, HIIT — with capacity limits." delay={0.2} />
            <FeatureCard icon={ShieldCheck} title="Smart Door Access" desc="QR-coded entries, IoT door integration and complete access audit logs." delay={0.3} />
            <FeatureCard icon={TrendingUp} title="Progress Charts" desc="Beautiful AreaCharts so members see exactly how their body is transforming." delay={0.4} />
            <FeatureCard icon={Trophy} title="Trainer Suite" desc="Trainers update trainees, run sessions, and own their schedule effortlessly." delay={0.5} />
          </div>
        </div>
      </section>

      {/* CLASSES GALLERY */}
      <section id="classes" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">// Training Programs</div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95]">
                Choose your<br /><span className="text-red-500">discipline.</span>
              </h2>
            </div>
            <p className="text-white/50 max-w-md">From explosive strength to elite combat training — every session designed to break your limits.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <ClassCard image={weightsImg} title="Iron Strength" time="MON • WED • FRI" delay={0} />
            <ClassCard image={athleteImg} title="HIIT Athletics" time="TUE • THU • SAT" delay={0.1} />
            <ClassCard image={boxerImg} title="Combat Boxing" time="DAILY • 6PM" delay={0.2} />
          </div>
        </div>
      </section>

      {/* SPLIT CTA with image */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-black" />
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}>
            <div className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">// The Method</div>
            <h2 className="text-5xl md:text-6xl font-black leading-[0.95] tracking-tight">
              Pain is temporary.<br />
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Strength is forever.</span>
            </h2>
            <p className="mt-6 text-white/50 text-lg leading-relaxed max-w-md">
              Every elite athlete needs elite tools. From your first deadlift to your hundredth PR,
              IronPulse is the engine that powers your transformation.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Target, text: 'Personalized goal tracking' },
                { icon: Heart, text: 'Live heart rate & calorie sync' },
                { icon: Award, text: 'Earn streaks and badges as you grow' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-white/80">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative">
            <div className="absolute -inset-4 bg-red-600/20 blur-[80px] rounded-full" />
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-red-500/20">
              <img src={athleteImg} alt="Powerful athlete" loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-6 left-6 right-6 backdrop-blur-xl bg-black/40 border border-red-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-red-500" />
                  <div>
                    <div className="text-3xl font-black">+ 247%</div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">Avg Member Gains</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <div className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">// Membership</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">Pick your battle.</h2>
            <p className="text-white/50 mt-4 text-lg">No contracts. Cancel anytime. Just results.</p>
          </motion.div>

          <div className={`grid gap-6 max-w-5xl mx-auto pt-4 ${plans.length === 0 ? 'md:grid-cols-3' : plans.length === 1 ? 'md:grid-cols-1 max-w-sm' : plans.length === 2 ? 'md:grid-cols-2 max-w-2xl' : 'md:grid-cols-3'}`}>
            {plans.length === 0 ? (
              // Skeleton placeholders while loading
              [0, 1, 2].map(i => (
                <div key={i} className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 animate-pulse">
                  <div className="h-7 w-24 bg-white/10 rounded-lg mb-4" />
                  <div className="h-12 w-32 bg-white/10 rounded-lg mb-8" />
                  {[1,2,3,4].map(j => <div key={j} className="h-4 bg-white/5 rounded mb-3" />)}
                </div>
              ))
            ) : (
              plans.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.price}
                  duration={plan.duration}
                  features={plan.benefits.length > 0 ? plan.benefits : [`${plan.name} membership`, `${plan.duration} access`]}
                  featured={i === Math.floor(plans.length / 2)}
                  delay={i * 0.1}
                  onEnter={onEnter}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL with background */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={boxerImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <Quote className="w-16 h-16 text-red-500/50 mx-auto mb-6" />
          <div className="flex justify-center gap-1 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <Star className="w-6 h-6 fill-red-500 text-red-500" />
              </motion.div>
            ))}
          </div>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            "I lost 18kg in 6 months. IronPulse didn't just track it —
            <span className="text-red-500"> it made me obsessed with becoming better.</span>"
          </motion.blockquote>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black text-xl">M</div>
            <div className="text-left">
              <div className="font-bold">Marcus K.</div>
              <div className="text-sm text-white/40">Pro Member • 2 years</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.1),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase mb-6">
              <Users className="w-3.5 h-3.5" /> About Us
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              Meet the team behind<br />
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">IronPulse</span>
            </h2>
            <p className="mt-6 text-white/60 text-lg max-w-2xl mx-auto">
              A passionate group of undergraduates from SLIIT building the next generation of gym management software.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-red-600/30 to-red-900/20 rounded-[2.5rem] blur-2xl" />
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
                <img src={teamImg} alt="WD72 Group team members" className="w-full h-auto rounded-2xl" />
                <div className="mt-4 text-center">
                  <div className="text-xs uppercase tracking-[0.3em] text-red-400 font-bold">WD72 Group</div>
                  <div className="mt-1 text-white/50 text-sm">SLIIT • OOP Project Team</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-1">Our Mission</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Build a complete gym management system that empowers admins, instructors and members with data-driven tools — attendance, health tracking, classes and payments, all in one premium experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-1">The Project</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      IronPulse is our Object-Oriented Programming (OOP) module group project at the
                      <span className="text-white font-semibold"> Sri Lanka Institute of Information Technology (SLIIT)</span>.
                      Designed and engineered by the <span className="text-red-400 font-bold">WD72</span> team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Team', value: '6' },
                  { label: 'Group', value: 'WD72' },
                  { label: 'Module', value: 'OOP' },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent text-center">
                    <div className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04]">
                <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-xs text-white/60">
                  Built with React, TypeScript & Tailwind CSS — applying real-world OOP principles to a production-ready product.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BMI BOT */}
      <BMIBot onEnter={onEnter} />

      {/* FINAL CTA */}
      <section id="contact" className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative rounded-[3rem] p-16 overflow-hidden border border-red-500/30">
          <div className="absolute inset-0">
            <img src={heroImg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-red-950/70" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.3),transparent_60%)]" />
          <div className="relative text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
              Stop scrolling.<br />
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Start lifting.</span>
            </h2>
            <p className="mt-6 text-white/70 text-lg max-w-xl mx-auto">
              Join thousands of athletes already transforming their lives with IronPulse.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <RedButton onClick={onEnter}>
                Get Started Free <ChevronRight className="w-5 h-5" />
              </RedButton>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-black tracking-tight">IRON<span className="text-red-500">PULSE</span></span>
          </div>
          <div className="text-xs text-white/30 tracking-wider">© 2026 IronPulse. Built for warriors. Built by SLIIT-WD-72</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
