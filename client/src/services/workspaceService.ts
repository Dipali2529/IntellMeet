import { getAccessToken } from "./auth";

const API_URL = "http://localhost:5000/api/workspace/tasks";

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface WorkspaceTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please log in to access the workspace.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Workspace request failed.");
  }

  return data as T;
}

export async function getWorkspaceTasks(): Promise<WorkspaceTask[]> {
  const data = await request<{ tasks: WorkspaceTask[] }>(API_URL);
  return data.tasks;
}

export async function createWorkspaceTask(input: {
  title: string;
  description: string;
  priority: TaskPriority;
}): Promise<WorkspaceTask> {
  const data = await request<{ task: WorkspaceTask }>(API_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.task;
}

export async function updateWorkspaceTask(
  taskId: string,
  updates: Partial<
    Pick<WorkspaceTask, "title" | "description" | "status" | "priority">
  >
): Promise<WorkspaceTask> {
  const data = await request<{ task: WorkspaceTask }>(
    `${API_URL}/${encodeURIComponent(taskId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    }
  );

  return data.task;
}

export async function deleteWorkspaceTask(taskId: string): Promise<void> {
  await request<{ message: string }>(
    `${API_URL}/${encodeURIComponent(taskId)}`,
    { method: "DELETE" }
  );
}