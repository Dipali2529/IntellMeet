import { API_URL as BASE_API_URL } from "../config/api";
import { getAccessToken } from "./auth";

const API_URL = `${BASE_API_URL}/workspace/tasks`;

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";


export interface WorkspaceAssignee {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface WorkspaceTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: WorkspaceAssignee | string | null;
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
      assignee?: string | null;
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
        Pick<
          WorkspaceTask,
          "title" | "description" | "status" | "priority" | "assignee"
        >
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
    
        export async function getWorkspaceUsers(): Promise<WorkspaceAssignee[]> {
      const data = await request<{ users: WorkspaceAssignee[] }>(
        `${BASE_API_URL}/workspace/users`
      );

      return data.users;
    }