export interface MeetingSummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: {
    task: string;
    assignee: string;
    dueDate: string;
  }[];
}

export async function generateMeetingSummary(
  transcript: string
): Promise<MeetingSummaryResult> {
  const response = await fetch(
    "http://localhost:5000/api/meeting-summary/summary",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate meeting summary"
    );
  }

  const data = await response.json();

  return data.data;
}