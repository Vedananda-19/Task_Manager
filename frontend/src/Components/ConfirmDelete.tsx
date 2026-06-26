import { useState } from "react";
import useTasks from "../hooks/useTasks";

type DeleteData = {
    ids: string[];
};

type ConfirmDeleteProps = {
    data: DeleteData;
    onConfirm: (taskIds: string[]) => void;
    onCancel: () => void;
    isSubmitting: boolean;
};

const priorityLabels = ["None", "Low", "Medium", "High", "Very high"];

const ConfirmDelete = ({
    data,
    onConfirm,
    onCancel,
    isSubmitting,
}: ConfirmDeleteProps) => {
    const { data: tasksData, isLoading, error } = useTasks();
    const [selectedIds, setSelectedIds] = useState(data.ids);
    const allTasks = tasksData?.tasks ?? [];
    const selectedTasks = allTasks.filter((task) => selectedIds.includes(task.id));

    const removeTask = (taskId: string) => {
        setSelectedIds((ids) => ids.filter((id) => id !== taskId));
    };

    return (
        <section className="confirm-delete" aria-labelledby="delete-title">
            <div className="confirm-delete-header">
                <p className="confirm-delete-eyebrow">Confirmation needed</p>
                <h2 id="delete-title">Delete these tasks?</h2>
                <p>You can remove tasks from this list before confirming.</p>
            </div>

            <div className="confirm-delete-list">
                {isLoading && <p className="confirm-delete-state">Loading tasks...</p>}
                {error && (
                    <p className="errorMsg">
                        We couldn't load your tasks. Please try again.
                    </p>
                )}
                {!isLoading && !error && selectedTasks.length === 0 && (
                    <p className="confirm-delete-state">No tasks selected for deletion.</p>
                )}
                {selectedTasks.map((task) => (
                    <article className="confirm-delete-task" key={task.id}>
                        <div>
                            <div className="confirm-delete-task-title">
                                <h3>{task.title}</h3>
                                <span className={`priority priority${task.priority}`}>
                                    {priorityLabels[task.priority] ?? "None"}
                                </span>
                            </div>
                            {task.description && <p>{task.description}</p>}
                        </div>
                        <button
                            className="confirm-delete-remove"
                            type="button"
                            onClick={() => removeTask(task.id)}
                            disabled={isSubmitting}
                        >
                            Keep task
                        </button>
                    </article>
                ))}
            </div>

            <div className="confirm-delete-actions">
                <button
                    className="confirm-delete-cancel"
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    className="confirm-delete-approve"
                    type="button"
                    onClick={() => onConfirm(selectedIds)}
                    disabled={isSubmitting || selectedIds.length === 0}
                >
                    {isSubmitting ? "Deleting..." : "Delete tasks"}
                </button>
            </div>
        </section>
    );
};

export default ConfirmDelete;
