import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { getAccessToken } from "../../services/auth";
import {
getWorkspaceTasks,
createWorkspaceTask,
updateWorkspaceTask,
deleteWorkspaceTask,
type WorkspaceTask,
type TaskStatus,
type TaskPriority,
} from "../../services/workspaceService";
import "./Workspace.css";

const statuses: TaskStatus[] = ["To Do", "In Progress", "Done"];

function Workspace() {
const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [priority, setPriority] = useState<TaskPriority>("Medium");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

const loadTasks = useCallback(async () => {
setLoading(true);
setError("");

try {
  const data = await getWorkspaceTasks();
  setTasks(data);
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Unable to load workspace tasks."
  );
} finally {
  setLoading(false);
}

}, []);

useEffect(() => {
void loadTasks();
}, [loadTasks]);

if (!getAccessToken()) {
return <Navigate to="/login" replace />;
}

async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


if (!title.trim()) {
  setError("Please enter a task title.");
  return;
}

setSaving(true);
setError("");

try {
  const task = await createWorkspaceTask({
    title: title.trim(),
    description: description.trim(),
    priority,
  });

  setTasks((current) => [task, ...current]);
  setTitle("");
  setDescription("");
  setPriority("Medium");
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Unable to create the task."
  );
} finally {
  setSaving(false);
}


}

async function handleStatusChange(
taskId: string,
status: TaskStatus
) {
setError("");


try {
  const updatedTask = await updateWorkspaceTask(taskId, { status });

  setTasks((current) =>
    current.map((task) =>
      task._id === taskId ? updatedTask : task
    )
  );
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Unable to update task status."
  );
}


}

async function handleDeleteTask(taskId: string) {
if (!window.confirm("Are you sure you want to delete this task?")) {
return;
}

setError("");

try {
  await deleteWorkspaceTask(taskId);
  setTasks((current) =>
    current.filter((task) => task._id !== taskId)
  );
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Unable to delete the task."
  );
}


}

return ( <main className="workspace-page"> <header className="workspace-header"> <div> <p className="workspace-eyebrow">INTELLMEET COLLABORATION</p> <h1>Team Workspace</h1> <p className="workspace-subtitle">
Organize your team's work and track progress in one place. </p> </div>


    <Link to="/dashboard" className="workspace-back-link">
      Back to Dashboard
    </Link>
  </header>

  <section className="workspace-create-panel">
    <h2>Create a task</h2>

    <form onSubmit={handleCreateTask} className="workspace-task-form">
      <label>
        Task title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Prepare meeting summary"
          maxLength={150}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add task details..."
          maxLength={1000}
          rows={3}
        />
      </label>

      <label>
        Priority
        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as TaskPriority)
          }
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Creating..." : "+ Create Task"}
      </button>
    </form>
  </section>

  {error && (
    <div className="workspace-error" role="alert">
      {error}
    </div>
  )}

  <section className="workspace-board">
    <div className="workspace-board-heading">
      <h2>Project Board</h2>
      <span>{tasks.length} tasks</span>
    </div>

    {loading ? (
      <p className="workspace-message">Loading workspace...</p>
    ) : (
      <div className="kanban-board">
        {statuses.map((status) => {
          const columnTasks = tasks.filter(
            (task) => task.status === status
          );

          return (
            <section className="kanban-column" key={status}>
              <div className="kanban-column-heading">
                <h3>{status}</h3>
                <span>{columnTasks.length}</span>
              </div>

              {columnTasks.length === 0 ? (
                <p className="kanban-empty">No tasks yet</p>
              ) : (
                columnTasks.map((task) => (
                  <article className="kanban-task" key={task._id}>
                    <div className="kanban-task-top">
                      <span
                        className={`priority-badge priority-${task.priority.toLowerCase()}`}
                      >
                        {task.priority} priority
                      </span>

                      <button
                        type="button"
                        className="task-delete-button"
                        onClick={() => void handleDeleteTask(task._id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        Delete
                      </button>
                    </div>

                    <h4>{task.title}</h4>

                    {task.description && (
                      <p className="kanban-task-description">
                        {task.description}
                      </p>
                    )}

                    <label className="task-status-label">
                      Update status
                      <select
                        value={task.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            task._id,
                            event.target.value as TaskStatus
                          )
                        }
                      >
                        {statuses.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))
              )}
            </section>
          );
        })}
      </div>
    )}
  </section>
</main>


);
}

export default Workspace;
