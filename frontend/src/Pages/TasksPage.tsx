import { useEffect, useState } from "react";
import TaskForm from "../Components/TaskForm";
import useUpdateTasks from "../hooks/useUpdateTasks";
import useTasks from "../hooks/useTasks";
import { useSearchParams } from "react-router-dom";
import FilterCard from "../Components/FilterCard";

export type Task = {
    id: string;
    title: string;
    description: string;
    priority: number;
    deadline: string | null;
    tags: string[];
    completed: boolean;
    timestamp?: string;
};

export type TaskInput = Omit<Task, "id" | "timestamp"> & { id?: string };

const TasksPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        if (!searchParams.has("page")) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", "1");
                return next;
            });
        }
    }, [searchParams, setSearchParams]);

    const { createMutation, updateMutation, deleteMutation, checkMutation } =
        useUpdateTasks(searchParams);
    const { data, isLoading, error, isFetching } = useTasks(searchParams);
    const tasks = data ? data.tasks : [];
    const totalPages = data ? data.page_data.total_pages : 1;

    const submitTask = (input: TaskInput) =>
        editingTask
            ? updateMutation.mutate({ ...input, id: editingTask.id } as Task)
            : createMutation.mutate(input);

    const updateParams = (key: string, value?: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value);
            else next.delete(key);
            next.set("page", "1");
            return next;
        });
    };

    return (
        <main className="tasksPage">
            <div className="tasksHeader">
                <div>
                    <p className="eyebrow">TASK MANAGER</p>
                    <h1>Your tasks</h1>
                    <p>Keep the next important thing in view.</p>
                </div>
                <button
                    className="primaryButton"
                    onClick={() => {
                        setEditingTask(null);
                        setShowForm(true);
                    }}
                >
                    + New task
                </button>
            </div>

            {showFilters && (
                <FilterCard
                    updateParams={updateParams}
                    onClose={() => setShowFilters(false)}
                />
            )}

            {isFetching && <p className="emptyState">Fetching...</p>}

            {(showForm || editingTask) && (
                <TaskForm
                    key={editingTask?.id ?? "new-task"}
                    task={editingTask}
                    onSubmit={submitTask}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTask(null);
                    }}
                    isSaving={
                        createMutation.isPending || updateMutation.isPending
                    }
                />
            )}

            {(createMutation.error ||
                updateMutation.error ||
                deleteMutation.error) && (
                <p className="errorMsg">
                    Couldn't save that change. Please check that you are logged
                    in and try again.
                </p>
            )}

            <section className="taskList">
                <div className="taskListHeader">
                    <h2>
                        All tasks <span>{data?.page_data.total_items}</span>
                    </h2>
                    <div className="taskListControls">
                        <button
                            className="secondaryButton"
                            onClick={() => setShowFilters((value) => !value)}
                        >
                            {showFilters ? "Hide filters" : "Filters"}
                        </button>
                        <label className="sortControl">
                            Sort
                            <select
                                value={searchParams.get("sort") ?? ""}
                                onChange={(e) =>
                                    updateParams("sort", e.target.value)
                                }
                            >
                                <option value="">Time added</option>
                                <option value="priority">Priority</option>
                                <option value="title">Title</option>
                            </select>
                        </label>
                    </div>
                </div>

                {isLoading && <p>Loading tasks...</p>}
                {error && (
                    <p className="errorMsg">
                        We couldn't load your tasks. Please log in again and
                        retry.
                    </p>
                )}
                {!isLoading && !error && tasks.length === 0 && (
                    <p className="emptyState">
                        No tasks yet. Add one to get going.
                    </p>
                )}

                {tasks.map((task) => (
                    <article
                        className={`taskCard ${task.completed ? "completed" : ""}`}
                        key={task.id}
                    >
                        <button
                            className="completeButton"
                            title={
                                task.completed
                                    ? "Mark incomplete"
                                    : "Mark complete"
                            }
                            onClick={() => checkMutation.mutate(task.id)}
                        >
                            {task.completed ? "✓" : ""}
                        </button>

                        <div className="taskContent">
                            <div className="taskCardTitle">
                                <h3>{task.title}</h3>

                                {task.completed && (
                                    <span className="completedBadge">
                                        Completed
                                    </span>
                                )}

                                <span
                                    className={`priority priority${task.priority}`}
                                >
                                    {[
                                        "None",
                                        "Low",
                                        "Medium",
                                        "High",
                                        "Very high",
                                    ][task.priority] ?? "None"}
                                </span>
                            </div>

                            {task.description && <p>{task.description}</p>}

                            <div className="taskMeta">
                                {task.deadline && (
                                    <span>
                                        Due{" "}
                                        {new Date(
                                            task.deadline,
                                        ).toLocaleString()}
                                    </span>
                                )}

                                <div className="tags">
                                    {task.tags.map((tag) => (
                                        <span className="tag" key={tag}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="taskActions">
                            <button
                                className="editBtn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingTask(task);
                                }}
                            >
                                Edit
                            </button>

                            <button
                                className="dangerButton"
                                disabled={deleteMutation.isPending}
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `Delete "${task.title}"?`,
                                        )
                                    ) {
                                        deleteMutation.mutate(task.id);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {page && (
                <div className="pagination">
                    <button
                        className="secondaryButton"
                        disabled={page === 1}
                        onClick={() => {
                            updateParams("page", String(page - 1));
                        }}
                    >
                        Prev
                    </button>

                    <div className="paginationPages">
                        {page > 2 && (
                            <>
                                <button
                                    className="pageButton"
                                    onClick={() => updateParams("page", "1")}
                                >
                                    1
                                </button>
                                {page > 3 && (
                                    <span className="pageDots">...</span>
                                )}
                            </>
                        )}

                        {page > 1 && (
                            <button
                                className="pageButton"
                                onClick={() =>
                                    updateParams("page", String(page - 1))
                                }
                            >
                                {page - 1}
                            </button>
                        )}

                        <button className="pageButton active">{page}</button>

                        {page < totalPages && (
                            <button
                                className="pageButton"
                                onClick={() =>
                                    updateParams("page", String(page + 1))
                                }
                            >
                                {page + 1}
                            </button>
                        )}

                        {page < totalPages - 1 && (
                            <>
                                {page < totalPages - 2 && (
                                    <span className="pageDots">...</span>
                                )}
                                <button
                                    className="pageButton"
                                    onClick={() =>
                                        updateParams(
                                            "page",
                                            String(totalPages),
                                        )
                                    }
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        className="secondaryButton"
                        disabled={page === totalPages}
                        onClick={() => {
                            updateParams("page", String(page + 1));
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    );
};

export default TasksPage;
