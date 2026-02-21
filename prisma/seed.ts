import { PrismaClient, Role, TaskStatus, Priority, UserLevel } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** Backdates a task's updatedAt column so charts show historical data */
async function backdateTask(taskId: string, date: Date) {
  await prisma.$executeRaw`UPDATE tasks SET "updatedAt" = ${date} WHERE id = ${taskId}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean existing data ───────────────────────────────────────────────
  await prisma.userAchievement.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.achievement.deleteMany();

  // ── Admin ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@taskmanager.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  const userPassword = await bcrypt.hash("User@123", 12);

  // ── John Doe (basic user) ─────────────────────────────────────────────
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@taskmanager.com",
      password: userPassword,
      role: Role.USER,
      emailVerified: true,
    },
  });

  // ── Jane Smith (DEMO user — rich data) ───────────────────────────────
  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@taskmanager.com",
      password: userPassword,
      role: Role.USER,
      emailVerified: true,
      streak: 9,
      totalScore: 680,
      weeklyScore: 95,
      monthlyScore: 310,
      level: UserLevel.PERFORMER,
      lastActiveDate: new Date(),
    },
  });

  // ── Alex Rivera (power user) ──────────────────────────────────────────
  const user3 = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@taskmanager.com",
      password: userPassword,
      role: Role.USER,
      emailVerified: true,
      streak: 12,
      totalScore: 850,
      weeklyScore: 120,
      monthlyScore: 350,
      level: UserLevel.PRO,
      lastActiveDate: new Date(),
    },
  });
  console.log(`✅ Created users: ${user1.email}, ${user2.email}, ${user3.email}`);

  // ── Basic tasks (for John / admin) ───────────────────────────────────
  const basicTasks = [
    { title: "Set up project repository",    description: "Initialize Git repo and push initial codebase",       status: TaskStatus.COMPLETED,   priority: Priority.HIGH,   dueDate: new Date("2026-02-25"), assignedToId: user1.id, createdById: admin.id },
    { title: "Design database schema",       description: "Create the ERD and define all models",                 status: TaskStatus.COMPLETED,   priority: Priority.HIGH,   dueDate: new Date("2026-02-26"), assignedToId: user1.id, createdById: admin.id },
    { title: "Build task CRUD API",          description: "Create REST endpoints for task management",            status: TaskStatus.PENDING,     priority: Priority.MEDIUM, dueDate: new Date("2026-03-05"), assignedToId: user1.id, createdById: admin.id },
    { title: "Write unit tests",             description: "Add comprehensive test coverage for API routes",       status: TaskStatus.PENDING,     priority: Priority.LOW,    dueDate: new Date("2026-03-12"), assignedToId: user1.id, createdById: user1.id },
    { title: "Add search and filtering",     description: "Implement task search, filter by status / priority",  status: TaskStatus.PENDING,     priority: Priority.MEDIUM, dueDate: new Date("2026-03-10"), assignedToId: user1.id, createdById: user1.id },
    { title: "Code review and optimization", description: "Review all code, fix issues, and optimise perf",      status: TaskStatus.PENDING,     priority: Priority.MEDIUM, dueDate: new Date("2026-03-14"), assignedToId: admin.id,  createdById: admin.id },
  ];
  for (const t of basicTasks) await prisma.task.create({ data: t });
  console.log(`✅ Created ${basicTasks.length} basic tasks`);

  // ── Jane's tasks — spread across Jan & Feb 2026 for chart data ────────
  // Format: [title, description, priority, completionDate | null (pending)]
  type JaneTaskDef = { title: string; description: string; priority: Priority; completedAt: Date | null };

  const janeTasks: JaneTaskDef[] = [
    // ── January week 1 (Jan 1–7) — 2 completed
    { title: "Research project requirements",   description: "Gather all stakeholder requirements and document them",       priority: Priority.HIGH,   completedAt: new Date("2026-01-03") },
    { title: "Set up local dev environment",    description: "Install Node, Postgres, and configure .env",                  priority: Priority.MEDIUM, completedAt: new Date("2026-01-05") },
    // ── January week 2 (Jan 8–14) — 3 completed
    { title: "Create wireframes",               description: "Design low-fidelity wireframes for all pages",                priority: Priority.MEDIUM, completedAt: new Date("2026-01-09") },
    { title: "Write project proposal",          description: "Draft and submit the project proposal document",              priority: Priority.HIGH,   completedAt: new Date("2026-01-11") },
    { title: "Set up ESLint and Prettier",      description: "Configure code quality tools and add pre-commit hooks",       priority: Priority.LOW,    completedAt: new Date("2026-01-13") },
    // ── January week 3 (Jan 15–21) — 4 completed
    { title: "Implement user authentication",   description: "Build JWT-based login, register, and logout flows",           priority: Priority.HIGH,   completedAt: new Date("2026-01-16") },
    { title: "Design color palette & fonts",    description: "Define the design system tokens and Tailwind config",         priority: Priority.LOW,    completedAt: new Date("2026-01-18") },
    { title: "Build reusable UI components",    description: "Card, Button, Input, Modal, Badge, Select components",        priority: Priority.MEDIUM, completedAt: new Date("2026-01-20") },
    { title: "Set up Prisma ORM",               description: "Configure Prisma schema, migrations, and seed data",          priority: Priority.HIGH,   completedAt: new Date("2026-01-21") },
    // ── January week 4 (Jan 22–31) — 5 completed
    { title: "Create dashboard layout",         description: "Build sidebar, header, and responsive grid layout",           priority: Priority.MEDIUM, completedAt: new Date("2026-01-23") },
    { title: "Integrate Recharts library",      description: "Add bar and pie charts to the dashboard page",               priority: Priority.MEDIUM, completedAt: new Date("2026-01-25") },
    { title: "Implement task CRUD",             description: "Create, read, update and delete tasks via REST API",          priority: Priority.HIGH,   completedAt: new Date("2026-01-27") },
    { title: "Add role-based access control",   description: "Middleware to restrict routes to ADMIN only",                 priority: Priority.HIGH,   completedAt: new Date("2026-01-29") },
    { title: "Write onboarding documentation",  description: "Create a README with setup instructions and screenshots",     priority: Priority.LOW,    completedAt: new Date("2026-01-31") },
    // ── February week 1 (Feb 1–7) — 3 completed
    { title: "Add email verification flow",     description: "OTP email verification with Nodemailer",                      priority: Priority.HIGH,   completedAt: new Date("2026-02-02") },
    { title: "Build notification system",       description: "In-app notifications with bell icon and read state",          priority: Priority.MEDIUM, completedAt: new Date("2026-02-04") },
    { title: "Implement focus mode timer",      description: "Pomodoro-style focus session with task linking",              priority: Priority.MEDIUM, completedAt: new Date("2026-02-06") },
    // ── February week 2 (Feb 8–14) — 5 completed
    { title: "Add achievements system",         description: "Create 30 achievement definitions and unlock logic",          priority: Priority.HIGH,   completedAt: new Date("2026-02-09") },
    { title: "Build leaderboard page",          description: "Weekly and monthly score leaderboard with top users",        priority: Priority.MEDIUM, completedAt: new Date("2026-02-10") },
    { title: "Implement Kanban board",          description: "Drag-and-drop task board with three status columns",          priority: Priority.HIGH,   completedAt: new Date("2026-02-11") },
    { title: "Add task calendar view",          description: "Monthly calendar showing tasks by due date",                  priority: Priority.MEDIUM, completedAt: new Date("2026-02-13") },
    { title: "Fix password reset flow",         description: "Secure token-based password reset with expiry",               priority: Priority.HIGH,   completedAt: new Date("2026-02-14") },
    // ── February week 3 / this week (Feb 15–21) — 4 completed
    { title: "Add dark mode support",           description: "System-preference-aware dark mode across all pages",          priority: Priority.LOW,    completedAt: new Date("2026-02-16") },
    { title: "Optimize API query performance",  description: "Add DB indexes and rewrite N+1 queries",                     priority: Priority.HIGH,   completedAt: new Date("2026-02-17") },
    { title: "Create admin user management",    description: "Admin panel to list, edit and delete users",                  priority: Priority.HIGH,   completedAt: new Date("2026-02-19") },
    { title: "Write integration tests",         description: "Test all API routes with realistic payloads",                 priority: Priority.MEDIUM, completedAt: new Date("2026-02-21") },
    // ── Still pending / in-progress
    { title: "Deploy to Vercel (production)",   description: "Configure env vars and deploy the final build",              priority: Priority.HIGH,   completedAt: null },
    { title: "Accessibility audit",             description: "Run axe-core audit and fix all WCAG 2.1 AA issues",          priority: Priority.MEDIUM, completedAt: null },
    { title: "Add CSV export feature",          description: "Allow users to export their tasks as a CSV file",            priority: Priority.LOW,    completedAt: null },
  ];

  const janeTaskIds: { id: string; completedAt: Date | null }[] = [];
  for (const t of janeTasks) {
    const created = await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        status: t.completedAt ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        priority: t.priority,
        dueDate: t.completedAt ?? new Date("2026-03-31"),
        assignedToId: user2.id,
        createdById: admin.id,
      },
    });
    janeTaskIds.push({ id: created.id, completedAt: t.completedAt });
  }

  // Backdate updatedAt so the progress charts reflect historical completion dates
  for (const { id, completedAt } of janeTaskIds) {
    if (completedAt) await backdateTask(id, completedAt);
  }
  console.log(`✅ Created ${janeTasks.length} tasks for Jane (with historical dates)`);

  // ── Jane's focus sessions ─────────────────────────────────────────────
  const completedJaneTaskIds = janeTaskIds.filter((t) => t.completedAt).map((t) => t.id);
  const focusSessionDates = [
    { duration: 25,  completedAt: new Date("2026-01-21") },
    { duration: 50,  completedAt: new Date("2026-01-27") },
    { duration: 25,  completedAt: new Date("2026-02-06") },
    { duration: 50,  completedAt: new Date("2026-02-09") },
    { duration: 25,  completedAt: new Date("2026-02-13") },
    { duration: 50,  completedAt: new Date("2026-02-17") },
    { duration: 25,  completedAt: new Date("2026-02-19") },
  ];
  for (let i = 0; i < focusSessionDates.length; i++) {
    await prisma.focusSession.create({
      data: {
        userId: user2.id,
        taskId: completedJaneTaskIds[i % completedJaneTaskIds.length],
        duration: focusSessionDates[i].duration,
        completedAt: focusSessionDates[i].completedAt,
      },
    });
  }
  console.log(`✅ Created ${focusSessionDates.length} focus sessions for Jane`);

  // ── Alex's extra tasks ────────────────────────────────────────────────
  const alexTasks = [
    { title: "Set up CI/CD pipeline",         description: "Configure GitHub Actions for automated deployment.",       status: TaskStatus.COMPLETED, priority: Priority.HIGH,   dueDate: new Date("2026-01-10"), assignedToId: user3.id, createdById: admin.id },
    { title: "Refactor auth module",          description: "Migrate to JWT RS256 and add refresh tokens.",             status: TaskStatus.COMPLETED, priority: Priority.HIGH,   dueDate: new Date("2026-01-12"), assignedToId: user3.id, createdById: admin.id },
    { title: "Write API documentation",       description: "Document all REST endpoints with Swagger.",                status: TaskStatus.COMPLETED, priority: Priority.MEDIUM, dueDate: new Date("2026-01-15"), assignedToId: user3.id, createdById: user3.id },
    { title: "Implement caching layer",       description: "Add Redis caching for frequently accessed data.",          status: TaskStatus.COMPLETED, priority: Priority.HIGH,   dueDate: new Date("2026-01-18"), assignedToId: user3.id, createdById: admin.id },
    { title: "Optimize database queries",     description: "Add indexes and rewrite slow queries.",                    status: TaskStatus.COMPLETED, priority: Priority.HIGH,   dueDate: new Date("2026-01-22"), assignedToId: user3.id, createdById: admin.id },
    { title: "Migrate to TypeScript",         description: "Convert the entire codebase from JS to TS.",              status: TaskStatus.COMPLETED, priority: Priority.HIGH,   dueDate: new Date("2026-02-05"), assignedToId: user3.id, createdById: admin.id },
    { title: "Implement dark mode",           description: "System-preference-aware dark mode.",                      status: TaskStatus.COMPLETED, priority: Priority.LOW,    dueDate: new Date("2026-02-08"), assignedToId: user3.id, createdById: user3.id },
    { title: "Performance profiling",         description: "Profile front-end render performance and fix issues.",    status: TaskStatus.COMPLETED, priority: Priority.MEDIUM, dueDate: new Date("2026-02-15"), assignedToId: user3.id, createdById: user3.id },
    { title: "Add WebSocket support",         description: "Real-time task notifications via WebSockets.",            status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, dueDate: new Date("2026-03-01"), assignedToId: user3.id, createdById: admin.id },
  ];
  const alexTaskCreated: { id: string }[] = [];
  for (const t of alexTasks) {
    const c = await prisma.task.create({ data: t });
    alexTaskCreated.push(c);
  }
  await prisma.focusSession.create({ data: { userId: user3.id, taskId: alexTaskCreated[0].id, duration: 25, completedAt: new Date("2026-02-10") } });
  console.log(`✅ Created ${alexTasks.length} tasks + 1 focus session for Alex`);

  // ── Seed all 30 achievement definitions ──────────────────────────────
  const allAchievements = [
    { key: "first_task",        title: "First Step",           description: "Complete your very first task",                           icon: "🎯" },
    { key: "tasks_5",           title: "Warming Up",           description: "Complete 5 tasks",                                        icon: "📝" },
    { key: "tasks_10",          title: "Getting Things Done",  description: "Complete 10 tasks",                                       icon: "✅" },
    { key: "tasks_25",          title: "Quarter Century",      description: "Complete 25 tasks",                                       icon: "🌟" },
    { key: "tasks_50",          title: "Powerhouse",           description: "Complete 50 tasks",                                       icon: "💪" },
    { key: "tasks_100",         title: "Century Mark",         description: "Complete 100 tasks",                                      icon: "💎" },
    { key: "tasks_250",         title: "Task Machine",         description: "Complete 250 tasks",                                      icon: "🚀" },
    { key: "tasks_500",         title: "Legend",               description: "Complete 500 tasks",                                      icon: "🏆" },
    { key: "streak_3",          title: "Habit Forming",        description: "Maintain a 3-day productivity streak",                    icon: "🌱" },
    { key: "streak_7",          title: "7-Day Warrior",        description: "Maintain a 7-day productivity streak",                    icon: "🔥" },
    { key: "streak_14",         title: "Two-Week Titan",       description: "Maintain a 14-day productivity streak",                   icon: "⚡" },
    { key: "streak_30",         title: "Monthly Marvel",       description: "Maintain a 30-day productivity streak",                   icon: "🗓️" },
    { key: "streak_60",         title: "Unstoppable",          description: "Maintain a 60-day productivity streak",                   icon: "🔥🔥" },
    { key: "high_priority_5",   title: "Priority Master",      description: "Complete 5 high priority tasks",                          icon: "⚡" },
    { key: "high_priority_20",  title: "High Achiever",        description: "Complete 20 high priority tasks",                         icon: "🎯" },
    { key: "medium_priority_15",title: "Balanced Worker",      description: "Complete 15 medium priority tasks",                       icon: "📊" },
    { key: "low_priority_20",   title: "No Task Left Behind",  description: "Complete 20 low priority tasks",                          icon: "📋" },
    { key: "focus_session",     title: "Deep Focus",           description: "Complete your first focus session",                       icon: "🎧" },
    { key: "focus_sessions_5",  title: "Flow State",           description: "Complete 5 focus sessions",                               icon: "🎵" },
    { key: "focus_sessions_10", title: "Zen Mode",             description: "Complete 10 focus sessions",                              icon: "🧘" },
    { key: "focus_sessions_25", title: "Focus Fanatic",        description: "Complete 25 focus sessions",                              icon: "🧠" },
    { key: "focus_time_60",     title: "One Focused Hour",     description: "Accumulate 60 minutes in focus sessions",                 icon: "⏱️" },
    { key: "focus_time_300",    title: "Focus Marathon",       description: "Accumulate 300 minutes in focus sessions",                icon: "⌛" },
    { key: "score_100",         title: "Century",              description: "Reach 100 total score points",                            icon: "💯" },
    { key: "score_500",         title: "High Scorer",          description: "Reach 500 total score points",                            icon: "🌠" },
    { key: "score_1000",        title: "Grand Master",         description: "Reach 1,000 total score points",                          icon: "💰" },
    { key: "score_5000",        title: "Elite",                description: "Reach 5,000 total score points",                          icon: "👑" },
    { key: "level_performer",   title: "Rising Star",          description: "Reach the PERFORMER level",                               icon: "📈" },
    { key: "level_pro",         title: "Professional",         description: "Reach the PRO level",                                     icon: "🎖️" },
    { key: "level_master",      title: "Master",               description: "Reach the MASTER level — the pinnacle of productivity",   icon: "🦾" },
  ];
  for (const def of allAchievements) {
    await prisma.achievement.upsert({ where: { key: def.key }, create: def, update: def });
  }
  console.log(`✅ Upserted ${allAchievements.length} achievement definitions`);

  // ── Unlock achievements for Jane ──────────────────────────────────────
  // Jane has: 26 completed tasks, 7 focus sessions (250 min), streak 9, score 680, PERFORMER level
  const janeUnlocked = [
    { key: "first_task",       unlockedAt: new Date("2026-01-03") },
    { key: "tasks_5",          unlockedAt: new Date("2026-01-13") },
    { key: "tasks_10",         unlockedAt: new Date("2026-01-23") },
    { key: "tasks_25",         unlockedAt: new Date("2026-02-14") },
    { key: "streak_3",         unlockedAt: new Date("2026-01-20") },
    { key: "streak_7",         unlockedAt: new Date("2026-02-03") },
    { key: "high_priority_5",  unlockedAt: new Date("2026-01-27") },
    { key: "focus_session",    unlockedAt: new Date("2026-01-21") },
    { key: "focus_sessions_5", unlockedAt: new Date("2026-02-13") },
    { key: "focus_time_60",    unlockedAt: new Date("2026-02-09") },
    { key: "score_100",        unlockedAt: new Date("2026-01-25") },
    { key: "score_500",        unlockedAt: new Date("2026-02-11") },
    { key: "level_performer",  unlockedAt: new Date("2026-02-15") },
  ];
  for (const { key, unlockedAt } of janeUnlocked) {
    const ach = await prisma.achievement.findUnique({ where: { key } });
    if (ach) {
      await prisma.userAchievement.create({ data: { userId: user2.id, achievementId: ach.id, unlockedAt } });
      await prisma.notification.create({
        data: {
          userId: user2.id,
          title: "Achievement Unlocked! 🏆",
          message: `${ach.icon} ${ach.title} — ${ach.description}`,
          type: "achievement",
          createdAt: unlockedAt,
        },
      });
    }
  }
  console.log(`✅ Unlocked ${janeUnlocked.length} achievements for Jane`);

  // ── Unlock achievements for Alex ──────────────────────────────────────
  const alexUnlocked = ["first_task", "tasks_5", "tasks_10", "streak_7", "high_priority_5", "focus_session", "score_100", "level_performer", "level_pro"];
  for (const key of alexUnlocked) {
    const ach = await prisma.achievement.findUnique({ where: { key } });
    if (ach) await prisma.userAchievement.create({ data: { userId: user3.id, achievementId: ach.id } });
  }
  console.log(`✅ Unlocked ${alexUnlocked.length} achievements for Alex`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📧 Login credentials:");
  console.log("   Admin : admin@taskmanager.com  /  Admin@123");
  console.log("   John  : john@taskmanager.com   /  User@123");
  console.log("   Jane  : jane@taskmanager.com   /  User@123  ← demo user (26 tasks, 13 achievements, 7 focus sessions, PERFORMER)");
  console.log("   Alex  : alex@taskmanager.com   /  User@123  (streak 12, PRO level)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
