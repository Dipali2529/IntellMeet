
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
  try {
    if (!transcript.trim()) {
      throw new Error("Meeting transcript is empty");
    }

    if (MOCK_SUMMARY) {
      console.log(
        "[Meeting Summary] Mock mode enabled - skipping AI API"
      );

      return {
        summary:
          "The meeting discussed project progress, upcoming development tasks, and responsibilities for the team.",
        keyPoints: [
          "Reviewed current project progress.",
          "Discussed upcoming development tasks.",
          "Assigned responsibilities to team members.",
          "Planned the next development activities.",
        ],
        actionItems: [
          {
            task: "Complete the assigned development tasks",
            assignee: "Team Member",
            dueDate: "Next Week",
            status: "Pending",
          },
          {
            task: "Review the completed implementation",
            assignee: "Team Lead",
            dueDate: "Next Week",
            status: "In Progress",
          },
          {
            task: "Test the implemented features",
            assignee: "Development Team",
            dueDate: "Next Week",
            status: "Pending",
          },
        ],
      };
    }

    // Real AI implementation will be added later.
    throw new Error(
      "AI meeting summary is not configured"
    );
  } catch (error) {
    console.error(
      "Meeting summary service error:",
      error
    );

    throw new Error(
      "Unable to generate meeting summary"
    );
  }
}