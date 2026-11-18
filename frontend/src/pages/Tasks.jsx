
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Circle,
  Plus,
  Trash2,
  ListTodo,
  CheckCircle2,
  Clock3,
  Target,
  RefreshCw,
  X,
  ListFilter
} from "lucide-react";

import ModuleHeader from "../components/ModuleHeader";
import { taskService } from "../services/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [busyTaskId, setBusyTaskId] = useState(null);

  // Load tasks from backend
  const load = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await taskService.list();
      setTasks(result);
    } catch (e) {
      setError(e.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;
  const remainingTasks = totalTasks - completedTasks;

  const progress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (activeFilter === "COMPLETED") {
      return tasks.filter((task) => task.completed);
    }

    if (activeFilter === "PENDING") {
      return tasks.filter((task) => !task.completed);
    }

    return tasks;
  }, [tasks, activeFilter]);

  // Add task
  const add = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || adding) return;

    try {
      setError("");
      setAdding(true);

      const newTask = await taskService.create({
        title: trimmedTitle,
        description: "",
        completed: false
      });

      setTasks((current) => [newTask, ...current]);
      setTitle("");
      setActiveFilter("ALL");
    } catch (e) {
      setError(e.message || "Unable to create task.");
    } finally {
      setAdding(false);
    }
  };

  // Toggle task completion
  const toggle = async (task) => {
    if (busyTaskId !== null) return;

    try {
      setError("");
      setBusyTaskId(task.id);

      const updatedTask = await taskService.update(task.id, {
        ...task.raw,
        title: task.title,
        description: task.description,
        completed: !task.completed
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      );
    } catch (e) {
      setError(e.message || "Unable to update task.");
    } finally {
      setBusyTaskId(null);
    }
  };

  // Delete task
  const remove = async (task) => {
    if (busyTaskId !== null) return;

    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setBusyTaskId(task.id);

      await taskService.remove(task.id);

      setTasks((current) =>
        current.filter((item) => item.id !== task.id)
      );
    } catch (e) {
      setError(e.message || "Unable to delete task.");
    } finally {
      setBusyTaskId(null);
    }
  };

  const filters = [
    { label: "All tasks", value: "ALL", count: totalTasks },
    { label: "Pending", value: "PENDING", count: remainingTasks },
    { label: "Completed", value: "COMPLETED", count: completedTasks }
  ];

  return (
    <section className="module">
      <ModuleHeader
        eyebrow="YOUR WORKSPACE"
        title="Tasks"
        description="A clear view of what needs your attention."
      />

      {/* Statistics */}
      <div className="stats">
        <div>
          <small>Total tasks</small>
          <b>{totalTasks}</b>
        </div>

        <div>
          <small>Completed</small>
          <b>{completedTasks}</b>
        </div>

        <div>
          <small>Remaining</small>
          <b>{remainingTasks}</b>
        </div>
      </div>

      {/* Progress overview */}
      <div className="panel task-progress-panel">
        <div className="panel-head">
          <div>
            <b>Overall progress</b>
            <p className="task-subtitle">
              Keep moving forward, one task at a time.
            </p>
          </div>

          <strong className="task-progress-value">
            {progress}%
          </strong>
        </div>

        <div
          className="task-progress-track"
          role="progressbar"
          aria-label="Task completion progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="task-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <small className="task-progress-caption">
          {completedTasks} of {totalTasks} tasks completed
        </small>
      </div>

      {/* Add task */}
      <form className="add-task" onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task to your list..."
          aria-label="New task title"
          maxLength={200}
          disabled={adding}
        />

        <button
          className="primary"
          type="submit"
          disabled={!title.trim() || adding}
        >
          <Plus size={17} />
          {adding ? "Adding..." : "Add task"}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="error task-error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="panel task-list-panel">
        <div className="panel-head task-list-heading">
          <div>
            <b>Your tasks</b>
            <small>{totalTasks} items</small>
          </div>

          <button
            type="button"
            className="task-refresh"
            onClick={load}
            disabled={loading}
            title="Refresh tasks"
          >
            <RefreshCw
              size={16}
              className={loading ? "task-spinning" : ""}
            />
          </button>
        </div>

        {/* Filters */}
        <div className="task-filters">
          <div className="task-filter-label">
            <ListFilter size={15} />
            <span>Filter</span>
          </div>

          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`task-filter ${
                activeFilter === filter.value ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
              <span>{filter.count}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="empty task-empty">
            <RefreshCw size={22} className="task-spinning" />
            <p>Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty state */
          <div className="empty task-empty">
            {activeFilter === "COMPLETED" ? (
              <>
                <CheckCircle2 size={30} />
                <b>No completed tasks yet</b>
                <p>Complete a task and it will appear here.</p>
              </>
            ) : activeFilter === "PENDING" ? (
              <>
                <Target size={30} />
                <b>You're all caught up!</b>
                <p>There are no pending tasks right now.</p>
              </>
            ) : (
              <>
                <ListTodo size={30} />
                <b>Your task list is empty</b>
                <p>Add your first task above to get started.</p>
              </>
            )}
          </div>
        ) : (
          <div className="task-items">
            {filteredTasks.map((task) => (
              <div
                className={`task-row ${
                  task.completed ? "done" : ""
                }`}
                key={task.id}
              >
                <button
                  type="button"
                  className="task-check"
                  onClick={() => toggle(task)}
                  disabled={busyTaskId !== null}
                  aria-label={
                    task.completed
                      ? "Mark as pending"
                      : "Mark as completed"
                  }
                  title={
                    task.completed
                      ? "Mark as pending"
                      : "Mark as completed"
                  }
                >
                  {task.completed ? (
                    <Check size={19} />
                  ) : (
                    <Circle size={19} />
                  )}
                </button>

                <span className="task-title">
                  {task.title}
                </span>

                {task.completed && (
                  <span className="task-completed-label">
                    Completed
                  </span>
                )}

                <button
                  type="button"
                  className="delete task-delete"
                  onClick={() => remove(task)}
                  disabled={busyTaskId !== null}
                  aria-label={`Delete ${task.title}`}
                  title="Delete task"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
