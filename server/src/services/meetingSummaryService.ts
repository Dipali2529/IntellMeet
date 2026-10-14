
export interface MeetingSummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: {
    task: string;
    assignee: string;
    dueDate: string;
    status: "Pending" | "In Progress" | "Completed";
  }[];
}

const MOCK_SUMMARY =
  process.env.AI_TRANSCRIPTION_MOCK === "true";

export async function generateMeetingSummary(
  transcript: string
): Promise<MeetingSummaryResult> {
  if (!transcript.trim()) {
    throw new Error("Meeting transcript is empty");
  }

  if (MOCK_SUMMARY) {
    console.log(
      "[Meeting Summary] Generating sample-based summary"
    );

    const text = transcript.toLowerCase();

    const actionItems: MeetingSummaryResult["actionItems"] = [];

    if (text.includes("dipali")) {
      actionItems.push({
        task: "Finish dashboard design",
        assignee: "Dipali",
        dueDate: "Friday",
        status: "Pending",
      });
    }

    if (text.includes("rahul")) {
      actionItems.push({
        task: "Complete API integration",
        assignee: "Rahul",
        dueDate: "Monday",
        status: "Pending",
      });
    }

    if (
      text.includes("development team") ||
      text.includes("fix bugs") ||
      text.includes("code review")
    ) {
      actionItems.push({
        task: "Fix reported bugs and complete code review",
        assignee: "Development Team",
        dueDate: "Next Wednesday",
        status: "Pending",
      });
    }

    if (text.includes("test all features")) {
      actionItems.push({
        task: "Test all features before final release",
        assignee: "Development Team",
        dueDate: "Before final release",
        status: "Pending",
      });
    }

    if (actionItems.length === 0) {
      actionItems.push({
        task: "Review meeting transcript and identify tasks",
        assignee: "Development Team",
        dueDate: "Not specified",
        status: "Pending",
      });
    }

    return {
      summary:
        "The team discussed IntellMeet project progress, dashboard design, API integration, bug fixing, code review, and feature testing.",

      keyPoints: [
        "Discussed current IntellMeet project progress.",
        "Reviewed dashboard design and API integration tasks.",
        "Discussed bug fixing and code review.",
        "Planned feature testing before the final release.",
      ],

      actionItems,
    };
  }

  throw new Error(
    "AI meeting summary is not configured. Enable mock mode or configure an AI provider."
  );
}
