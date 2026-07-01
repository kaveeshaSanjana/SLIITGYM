package com.config;

import com.entity.*;
import com.enums.*;
import com.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * DataSeeder - Populates the database with sample data on application startup.
 * Implements CommandLineRunner so it executes automatically after Spring Boot starts.
 * Only seeds data if the database is empty (prevents duplicates on restart).
 *
 * Seeds the following sample data:
 * - 1 Admin user
 * - 2 Instructors (John Doe, Jane Smith)
 * - 3 Membership Plans (Basic, Pro, Elite)
 * - 2 Members (Alice, Bob)
 * - 3 Workout Classes (Yoga, Strength, Zumba)
 * - 2 Payments
 * - 2 Attendance records
 * - 5 Health records for Alice
 */
@Component
@Order(2)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final InstructorRepository instructorRepository;
    private final MembershipPlanRepository planRepository;
    private final WorkoutClassRepository classRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final DoorDeviceRepository doorDeviceRepository;

    public DataSeeder(UserRepository userRepository, MemberRepository memberRepository, InstructorRepository instructorRepository, MembershipPlanRepository planRepository, WorkoutClassRepository classRepository, PaymentRepository paymentRepository, AttendanceRepository attendanceRepository, HealthRecordRepository healthRecordRepository, DoorDeviceRepository doorDeviceRepository) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.instructorRepository = instructorRepository;
        this.planRepository = planRepository;
        this.classRepository = classRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceRepository = attendanceRepository;
        this.healthRecordRepository = healthRecordRepository;
        this.doorDeviceRepository = doorDeviceRepository;
    }

    /**
     * Runs on application startup to seed initial data into the H2 database.
     * Skips seeding if data already exists (checks user count).
     *
     * @param args command-line arguments (not used)
     */
    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // --- Seed Admin ---
        User admin = new User();
        admin.setId("admin1");
        admin.setName("Admin One");
        admin.setEmail("admin@gym.com");
        admin.setRole(Role.ADMIN);
        admin.setOnboarded(true);
        userRepository.save(admin);

        // --- Seed Instructors ---
        Instructor inst1 = new Instructor();
        inst1.setId("inst1");
        inst1.setName("John Doe");
        inst1.setEmail("john@gym.com");
        inst1.setRole(Role.INSTRUCTOR);
        inst1.setOnboarded(true);
        inst1.setSpecialization("Bodybuilding");
        inst1.setExperience("8 years");
        inst1.setMembersCount(15);
        inst1.setAvatar("https://picsum.photos/seed/john/100/100");
        inst1.setWorkingHours("08:00 AM - 04:00 PM");
        instructorRepository.save(inst1);

        Instructor inst2 = new Instructor();
        inst2.setId("inst2");
        inst2.setName("Jane Smith");
        inst2.setEmail("jane@gym.com");
        inst2.setRole(Role.INSTRUCTOR);
        inst2.setOnboarded(true);
        inst2.setSpecialization("Yoga & Pilates");
        inst2.setExperience("5 years");
        inst2.setMembersCount(12);
        inst2.setAvatar("https://picsum.photos/seed/jane/100/100");
        inst2.setWorkingHours("10:00 AM - 06:00 PM");
        instructorRepository.save(inst2);

        // --- Seed Membership Plans ---
        MembershipPlan plan1 = new MembershipPlan();
        plan1.setId("plan1");
        plan1.setName("Basic Monthly");
        plan1.setPrice(50);
        plan1.setDuration("Monthly");
        plan1.setBenefits(Arrays.asList("Gym Access", "Locker Room"));
        planRepository.save(plan1);

        MembershipPlan plan2 = new MembershipPlan();
        plan2.setId("plan2");
        plan2.setName("Pro Quarterly");
        plan2.setPrice(135);
        plan2.setDuration("Quarterly");
        plan2.setBenefits(Arrays.asList("Gym Access", "Classes", "Locker Room"));
        planRepository.save(plan2);

        MembershipPlan plan3 = new MembershipPlan();
        plan3.setId("plan3");
        plan3.setName("Elite Yearly");
        plan3.setPrice(480);
        plan3.setDuration("Yearly");
        plan3.setBenefits(Arrays.asList("All Access", "Personal Trainer", "Sauna"));
        planRepository.save(plan3);

        // --- Seed Members ---
        Member mem1 = new Member();
        mem1.setId("mem1");
        mem1.setName("Alice Johnson");
        mem1.setEmail("alice@gym.com");
        mem1.setRole(Role.MEMBER);
        mem1.setOnboarded(true);
        mem1.setJoinedDate("2024-01-15");
        mem1.setPlan(plan3);
        mem1.setMembershipType(MembershipType.PREMIUM);
        mem1.setStatus(MemberStatus.ACTIVE);
        mem1.setInstructor(inst1);
        mem1.setAvatar("https://picsum.photos/seed/alice/100/100");
        mem1.setQrCode("ALICE-MEM-001");
        mem1.setPhone("555-0101");
        mem1.setAddress("123 Fitness St");
        mem1.setCardId("A1B2C3D4");
        memberRepository.save(mem1);

        Member mem2 = new Member();
        mem2.setId("mem2");
        mem2.setName("Bob Brown");
        mem2.setEmail("bob@gym.com");
        mem2.setRole(Role.MEMBER);
        mem2.setOnboarded(true);
        mem2.setJoinedDate("2024-02-10");
        mem2.setPlan(plan2);
        mem2.setMembershipType(MembershipType.REGULAR);
        mem2.setStatus(MemberStatus.ACTIVE);
        mem2.setInstructor(inst2);
        mem2.setAvatar("https://picsum.photos/seed/bob/100/100");
        mem2.setQrCode("BOB-MEM-002");
        mem2.setPhone("555-0102");
        mem2.setAddress("456 Muscle Ave");
        mem2.setCardId("E5F6G7H8");
        memberRepository.save(mem2);

        // --- Seed Workout Classes ---
        WorkoutClass class1 = new WorkoutClass();
        class1.setId("class1");
        class1.setName("Morning Yoga");
        class1.setType(ClassType.YOGA);
        class1.setTrainer(inst2);
        class1.setSchedule("Mon, Wed 08:00 AM");
        class1.setCapacity(20);
        class1.setEnrolledMemberIds(java.util.List.of("mem1", "mem2"));
        class1.setEnrolledCount(2);
        classRepository.save(class1);

        WorkoutClass class2 = new WorkoutClass();
        class2.setId("class2");
        class2.setName("Power Strength");
        class2.setType(ClassType.STRENGTH);
        class2.setTrainer(inst1);
        class2.setSchedule("Tue, Thu 06:00 PM");
        class2.setCapacity(15);
        class2.setEnrolledMemberIds(java.util.List.of("mem1"));
        class2.setEnrolledCount(1);
        classRepository.save(class2);

        WorkoutClass class3 = new WorkoutClass();
        class3.setId("class3");
        class3.setName("Zumba Party");
        class3.setType(ClassType.ZUMBA);
        class3.setTrainer(inst2);
        class3.setSchedule("Fri 05:00 PM");
        class3.setCapacity(30);
        class3.setEnrolledMemberIds(java.util.List.of("mem2"));
        class3.setEnrolledCount(1);
        classRepository.save(class3);

        // --- Seed Payments ---
        Payment pay1 = new Payment();
        pay1.setId("pay1");
        pay1.setMember(mem1);
        pay1.setAmount(150);
        pay1.setDate("2024-03-01");
        pay1.setStatus(PaymentStatus.PAID);
        pay1.setMethod(PaymentMethod.ONLINE);
        pay1.setPlanName("Elite Yearly");
        pay1.setPaymentType("PHYSICAL");
        paymentRepository.save(pay1);

        Payment pay2 = new Payment();
        pay2.setId("pay2");
        pay2.setMember(mem2);
        pay2.setAmount(100);
        pay2.setDate("2024-03-05");
        pay2.setStatus(PaymentStatus.PENDING);
        pay2.setMethod(PaymentMethod.CARD);
        pay2.setPlanName("Pro Quarterly");
        pay2.setPaymentType("ONLINE");
        pay2.setSlipReference("SLIP-20240305-001");
        paymentRepository.save(pay2);

        // --- Seed Attendance ---
        Attendance att1 = new Attendance();
        att1.setId("att1");
        att1.setUser(mem1);
        att1.setDate("2024-03-24");
        att1.setCheckIn("08:00");
        att1.setCheckOut("10:00");
        attendanceRepository.save(att1);

        Attendance att2 = new Attendance();
        att2.setId("att2");
        att2.setUser(mem2);
        att2.setDate("2024-03-24");
        att2.setCheckIn("09:30");
        attendanceRepository.save(att2);

        // --- Seed Health Records ---
        List<HealthRecord> healthRecords = Arrays.asList(
                createHealthRecord("h1", mem1, "2024-03-20", 165, 62, 60, 450),
                createHealthRecord("h2", mem1, "2024-03-21", 165, 61.5, 45, 380),
                createHealthRecord("h3", mem1, "2024-03-22", 165, 61.8, 75, 520),
                createHealthRecord("h4", mem1, "2024-03-23", 165, 61.2, 60, 480),
                createHealthRecord("h5", mem1, "2024-03-24", 165, 61.0, 90, 600)
        );
        healthRecordRepository.saveAll(healthRecords);

        // --- Seed Door Devices ---
        DoorDevice dev1 = new DoorDevice();
        dev1.setId("dev1");
        dev1.setName("Main Entrance");
        dev1.setLocation("Front Door");
        dev1.setStatus(DeviceStatus.ONLINE);
        dev1.setLastHeartbeat("08:00:00");
        dev1.setTotalAccessToday(0);
        doorDeviceRepository.save(dev1);

        DoorDevice dev2 = new DoorDevice();
        dev2.setId("dev2");
        dev2.setName("VIP Room");
        dev2.setLocation("Second Floor");
        dev2.setStatus(DeviceStatus.ONLINE);
        dev2.setLastHeartbeat("08:00:00");
        dev2.setTotalAccessToday(0);
        doorDeviceRepository.save(dev2);

        System.out.println("=== Database seeded with initial data ===");
    }

    /**
     * Helper method to build a HealthRecord entity with the given values.
     *
     * @param id             unique identifier for the health record
     * @param member         the member this record belongs to
     * @param date           date of the record (yyyy-MM-dd)
     * @param height         height in centimeters
     * @param weight         weight in kilograms
     * @param workingTime    workout duration in minutes
     * @param caloriesBurned total calories burned
     * @return a fully populated HealthRecord (not yet persisted)
     */
    private HealthRecord createHealthRecord(String id, Member member, String date, double height, double weight, int workingTime, int caloriesBurned) {
        HealthRecord record = new HealthRecord();
        record.setId(id);
        record.setMember(member);
        record.setDate(date);
        record.setHeight(height);
        record.setWeight(weight);
        record.setWorkingTime(workingTime);
        record.setCaloriesBurned(caloriesBurned);
        return record;
    }
}


