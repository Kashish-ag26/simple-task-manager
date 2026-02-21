import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/server/api-response";

// Smart rule-based AI breakdown (no external API key required)
// Can be replaced with OpenAI / Gemini API by swapping the generation logic
function generateBreakdown(title: string): {
  subtasks: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: string;
  reasoning: string;
} {
  const t = title.toLowerCase();

  // Priority detection
  let priority: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (/urgent|asap|critical|bug|fix|error|crash|security|production/.test(t)) priority = "HIGH";
  else if (/design|document|research|review|test/.test(t)) priority = "LOW";
  else if (/implement|build|create|develop|integrate|deploy/.test(t)) priority = "HIGH";

  // Deadline detection
  const daysMap: Record<string, number> = {
    urgent: 1, asap: 1, critical: 1, fix: 2, bug: 2, deploy: 3,
    implement: 7, build: 7, create: 5, develop: 7, integrate: 5,
    design: 10, research: 14, document: 7, review: 3, test: 4,
    meeting: 1, report: 3, analysis: 7, setup: 3,
  };
  let days = 7;
  for (const [keyword, d] of Object.entries(daysMap)) {
    if (t.includes(keyword)) { days = d; break; }
  }
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);

  // Subtask generation based on keywords
  const subtaskTemplates: Record<string, string[]> = {
    feature: ["Define requirements", "Design UI/UX", "Implement backend logic", "Create frontend components", "Write tests", "Review and refine"],
    bug: ["Reproduce the issue", "Identify root cause", "Implement fix", "Test the fix", "Update documentation"],
    deploy: ["Prepare build", "Run test suite", "Update environment variables", "Deploy to staging", "Verify staging", "Deploy to production"],
    design: ["Gather inspiration & references", "Create wireframes", "Design mockups", "Get feedback", "Finalize assets"],
    research: ["Define research scope", "Gather sources", "Analyze findings", "Summarize insights", "Present conclusions"],
    api: ["Define API contract", "Implement endpoints", "Add authentication", "Write tests", "Document endpoints"],
    test: ["Set up test environment", "Write unit tests", "Write integration tests", "Run full test suite", "Fix failing tests"],
    document: ["Outline documentation structure", "Write initial draft", "Add code examples", "Review and edit", "Publish documentation"],
    meeting: ["Prepare agenda", "Notify participants", "Prepare materials", "Conduct meeting", "Send follow-up notes"],
    report: ["Gather data", "Analyze metrics", "Create visualizations", "Write summary", "Review and distribute"],
    default: ["Break down the task", "Plan implementation approach", "Execute main work", "Review and test", "Finalize and deliver"],
  };

  let subtasks = subtaskTemplates.default;
  for (const key of Object.keys(subtaskTemplates)) {
    if (t.includes(key)) { subtasks = subtaskTemplates[key]; break; }
  }

  // If title mentions specific tech, add specific subtasks
  if (t.includes("database") || t.includes("db") || t.includes("schema")) {
    subtasks = ["Design schema", "Write migration", "Implement models", "Add indexes", "Test queries", "Document schema"];
  } else if (t.includes("ui") || t.includes("frontend") || t.includes("page")) {
    subtasks = ["Create component structure", "Implement layout", "Add styling", "Handle state management", "Add animations", "Test responsiveness"];
  } else if (t.includes("auth") || t.includes("login") || t.includes("register")) {
    subtasks = ["Design auth flow", "Implement login", "Implement registration", "Add session management", "Add RBAC", "Test security"];
  }

  const reasoning = `Based on task title analysis: detected ${priority} priority (${days} day deadline). ${subtasks.length} subtasks generated.`;

  return {
    subtasks: subtasks.slice(0, 6),
    priority,
    deadline: deadline.toISOString().split("T")[0],
    reasoning,
  };
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return errorResponse("Unauthorized", 401);

    const { title } = await req.json();
    if (!title || title.trim().length < 3) return errorResponse("Task title too short", 400);

    const breakdown = generateBreakdown(title.trim());
    return successResponse(breakdown, "Breakdown generated");
  } catch {
    return errorResponse("Failed to generate breakdown");
  }
}
