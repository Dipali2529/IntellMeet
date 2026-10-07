export interface MeetingSummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: {
    task: string;
    assignee: string;
    dueDate: string;
  }[];
}

const MOCK_SUMMARY =
  process.env.AI_TRANSCRIPTION_MOCK === "true";

export async function generateMeetingSummary(
  transcript: string
): Promise<MeetingSummaryResult> {
  try {
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
          },
          {
            task: "Review the completed implementation",
            assignee: "Team Lead",
            dueDate: "Next Week",
          },
          {
            task: "Test the implemented features",
            assignee: "Development Team",
            dueDate: "Next Week",
          },
        ],
      };
    }

    // Real AI implementation will be added here later.
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