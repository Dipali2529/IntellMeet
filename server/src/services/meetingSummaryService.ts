
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
  transcript: string
): Promise<MeetingSummaryResult> {
  const cleanTranscript = transcript
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTranscript) {
    throw new Error("Meeting transcript is empty");
  }

  // Split the actual transcript into sentences.
  const sentences = cleanTranscript
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  // Use only sentences that exist in the transcript.
  const keyPoints = sentences.slice(0, 6);

  const summary =
    sentences.length <= 3
      ? sentences.join(" ")
      : sentences.slice(0, 4).join(" ");

  const actionItems: MeetingSummaryResult["actionItems"] = [];

  const taskPattern =
    /\b(will|must|need to|needs to|should|agreed to|responsible for|action item)\b/i;

  for (const sentence of sentences) {
    if (!taskPattern.test(sentence)) {
      continue;
    }

    // Do not guess the assignee or deadline.
    // These fields remain unspecified unless explicitly extracted.
    const dueDateMatch = sentence.match(
      /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|next monday|next tuesday|next wednesday|next thursday|next friday)\b/i
    );

    const nameMatch = sentence.match(
      /\b([A-Z][a-z]+)\s+(?:will|must|needs to|should)\b/
    );

    actionItems.push({
      task: sentence,
      assignee: nameMatch?.[1] ?? "Unassigned",
      dueDate: dueDateMatch?.[1] ?? "Not specified",
      status: "Pending",
    });
  }

  return {
    summary,
    keyPoints,
    actionItems,
  };
}
