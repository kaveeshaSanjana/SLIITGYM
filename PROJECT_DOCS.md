# IronPulse Gym Management System - Documentation

## Project Overview
IronPulse is a comprehensive, full-stack gym management application designed to streamline operations for gym owners (Admins), trainers (Instructors), and gym-goers (Members). The system focuses on data-driven progress tracking, attendance management, and efficient scheduling.

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Utility-first, Glassmorphism UI)
- **Icons**: Lucide React
- **Charts**: Recharts (for progress visualization)
- **Date Handling**: date-fns
- **Animation**: Framer Motion (via `motion/react`)

## Core Features

### 1. Multi-Role Authentication & Dashboards
- **Admin**: Full control over members, instructors, plans, classes, payments, and attendance.
- **Instructor**: Manage assigned trainees, record their health stats, and view schedules.
- **Member**: Personal dashboard with health charts, membership ID card, and class schedules.

### 2. Health & Progress Tracking
- **Daily Stats**: Record weight, height, workout duration, and calories burned.
- **Visual Progress**: Dynamic AreaCharts showing weight trends over time.
- **History Logs**: Detailed table views of all past health records.

### 3. Attendance Management
- **Check-In/Check-Out**: Precise time tracking for all users.
- **Weight Integration**: Optional weight recording during check-in to ensure frequent tracking.
- **Admin Logs**: Centralized attendance tracking for the entire gym.

### 4. Membership & Operations
- **Plan Management**: Create and manage different membership tiers (Basic, Pro, Elite).
- **Class Scheduling**: Manage workout classes (Yoga, Zumba, Strength, etc.) with capacity limits.
- **Payment Tracking**: Monitor membership payments and statuses.

## Data Models (TypeScript Interfaces)

### User Roles
- `Role`: 'admin' | 'instructor' | 'member'

### Entities
- `User`: Base interface for all users (id, name, email, role, avatar).
- `Member`: Extends User. Includes joinedDate, planId, membershipType, status, instructorId, qrCode.
- `Instructor`: Extends User. Includes specialization, experience, membersCount, workingHours.
- `MembershipPlan`: id, name, price, duration, benefits.
- `WorkoutClass`: id, name, type, trainerId, schedule, capacity, enrolledCount.
- `Payment`: id, memberId, amount, date, status, method, planName.
- `Attendance`: id, userId, date, checkIn, checkOut, weight (optional).
- `HealthRecord`: id, memberId, date, height, weight, workingTime, caloriesBurned.

## UI/UX Design Principles
- **Glassmorphism**: Semi-transparent cards with blur effects for a modern, premium feel.
- **Color Palette**: Deep blacks (`#0A0A0A`), vibrant oranges (`#f97316`), and subtle white overlays.
- **Responsiveness**: Fully adaptive layout for mobile, tablet, and desktop.
- **Interactive Modals**: Seamless data entry using custom modal components.

---

# ChatGPT Training Prompt

**Copy and paste the following prompt into a new ChatGPT session to "train" it on this project:**

\"\"\"
I am working on a Gym Management System called **IronPulse**. I need you to act as a Senior Full-Stack Developer and Product Manager for this project. Here is the complete technical context:

### 1. Project Goal
A multi-role gym management platform (Admin, Instructor, Member) focused on health tracking, attendance, and membership operations.

### 2. Tech Stack
- React (TypeScript), Vite, Tailwind CSS.
- Lucide React (Icons), Recharts (Charts), date-fns.

### 3. Data Architecture
- **Users**: Admin, Instructor (specialization, experience), Member (membership plans, assigned instructors).
- **Health Tracking**: `HealthRecord` stores daily weight, height, workout time, and calories.
- **Attendance**: `Attendance` logs check-in/out times and includes an optional `weight` field captured during check-in.
- **Operations**: `MembershipPlan` (pricing/benefits), `WorkoutClass` (scheduling/capacity), `Payment` (history/status).

### 4. Key UI Components
- **DashboardLayout**: Sidebar navigation with role-based access.
- **MemberDashboard**: Features a digital QR ID card and weight progress charts.
- **InstructorMembers**: Allows trainers to update stats for their specific trainees.
- **AttendanceMarking**: A modal-based form for logging check-ins with weight inputs.

### 5. Current State
The app uses a mock data system (`mockData.ts`) and local state for the UI. It features a high-end "Glassmorphism" design with a dark theme and orange accents.

### Your Task
When I ask questions or request features, always adhere to the existing TypeScript interfaces, maintain the Glassmorphism design style, and ensure role-based logic is respected. Do you understand the project structure?
\"\"\"
