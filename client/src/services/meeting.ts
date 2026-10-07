import { getAccessToken } from "./auth";

const API_URL = "http://localhost:5000/api/meetings";

export interface CreateMeetingData {
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  host: string;
  meetingCode: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingResponse {
  message: string;
  meeting: Meeting;
}

export async function createMeeting(
  meetingData: CreateMeetingData
): Promise<CreateMeetingResponse> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(meetingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create meeting.");
  }

  return data;
}

export async function getMeetingByCode(
  meetingCode: string
): Promise<Meeting> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_URL}/code/${encodeURIComponent(
      meetingCode.trim().toUpperCase()
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Meeting not found."
    );
  }

  return data.meeting;
}