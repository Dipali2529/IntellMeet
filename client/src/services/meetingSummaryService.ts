import { API_URL as BASE_API_URL } from "../config/api";
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

export async function generateMeetingSummary(
  transcript: string,
  meetingId: string,
  token: string
): Promise<MeetingSummaryResult> {
  const response = await fetch(
    `${BASE_API_URL}/api/meeting-summary/summary`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meetingId,
        transcript,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || "Failed to generate meeting summary"
    );
  }

  const data = await response.json();

  return data.data as MeetingSummaryResult;
}