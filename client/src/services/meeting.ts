import { getAccessToken } from "./auth";

import { API_URL as BASE_API_URL } from "../config/api";

const API_URL = `${BASE_API_URL}/meetings`;

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

export interface MyMeetingsResponse {
  message: string;
  count: number;
  meetings: Meeting[];
}

export async function getMyMeetings(): Promise<Meeting[]> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch previous meetings.");
  }

  return data.meetings;
}

export async function createPublicDemoMeeting(
  meetingData: CreateMeetingData
): Promise<CreateMeetingResponse> {
  const response = await fetch(`${API_URL}/public-demo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: meetingData.title,
      description: meetingData.description,
      scheduledDate: meetingData.scheduledDate,
      scheduledTime: meetingData.scheduledTime,
      duration: meetingData.duration,
      allowChat: meetingData.allowChat,
      allowScreenShare: meetingData.allowScreenShare,
      // Public demo meetings must not enable recording.
      allowRecording: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create demo meeting.");
  }

  return data;
}

export async function getPublicDemoMeetingByCode(
  meetingCode: string
): Promise<Meeting> {
  const response = await fetch(
    `${API_URL}/public-demo/code/${encodeURIComponent(
      meetingCode.trim().toUpperCase()
    )}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Public meeting not found.");
  }

  return data.meeting;
}
