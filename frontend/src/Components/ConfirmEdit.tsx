import useTasks from "../hooks/useTasks";

type EditData = {
    task_id: string;
    new_data: {
        title: string | null;
        description: string | null;
        deadline: string | null;
        priority: string | null;
        tags: string[] | null;
    };
};

type ConfirmEditProps = {
    data: EditData;
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting: boolean;
};

const priorityLabels = ["None", "Low", "Medium", "High", "Very high"];

const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
        return deadline;
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const ConfirmEdit = ({
    data,
    onConfirm,
    onCancel,
    isSubmitting,
}: ConfirmEditProps) => {
    const { data: tasksData, isLoading, error } = useTasks();

    const allTasks = tasksData?.tasks ?? [];
    const selectedTask = allTasks.find((task) => task.id === data.task_id);

    const newPriority =
        data.new_data.priority !== null
            ? Number(data.new_data.priority)
            : null;

    return (
        <section className="confirm-edit" aria-labelledby="confirm-edit-title">
            <div className="confirm-edit-header">
                <p className="confirm-edit-eyebrow">Confirmation needed</p>
                <h2 id="confirm-edit-title">Review task changes</h2>
                <p>Check the current task and proposed updates before saving.</p>
            </div>

            <div className="confirm-edit-content">
                {isLoading && (
                    <p className="confirm-edit-state">Loading task...</p>
                )}

                {error && (
                    <p className="errorMsg">
                        We couldn't load this task. Please try again.
                    </p>
                )}

                {!isLoading && !error && !selectedTask && (
                    <p className="confirm-edit-state">
                        This task could not be found.
                    </p>
                )}

                {!isLoading && !error && selectedTask && (
                    <>
                        <article className="confirm-edit-task">
                            <p className="confirm-edit-section-label">
                                Current task
                            </p>

                            <div className="confirm-edit-task-title">
                                <h3>{selectedTask.title}</h3>

                                <span
                                    className={`priority priority${selectedTask.priority}`}
                                >
                                    {priorityLabels[selectedTask.priority] ?? "None"}
                                </span>
                            </div>

                            {selectedTask.description && (
                                <p className="confirm-edit-description">
                                    {selectedTask.description}
                                </p>
                            )}

                            <div className="confirm-edit-meta">
                                <span>
                                    Deadline: {formatDeadline(selectedTask.deadline)}
                                </span>

                                {selectedTask.tags?.length > 0 && (
                                    <div className="confirm-edit-tags">
                                        {selectedTask.tags.map((tag: string) => (
                                            <span key={tag} className="confirm-edit-tag">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </article>

                        <article className="confirm-edit-changes">
                            <p className="confirm-edit-section-label">
                                Proposed changes
                            </p>

                            <div className="confirm-edit-fields">
                                {data.new_data.title !== null && (
                                    <div className="confirm-edit-field">
                                        <span className="confirm-edit-field-name">
                                            Title
                                        </span>
                                        <p>{data.new_data.title || "Untitled task"}</p>
                                    </div>
                                )}

                                {data.new_data.description !== null && (
                                    <div className="confirm-edit-field">
                                        <span className="confirm-edit-field-name">
                                            Description
                                        </span>
                                        <p>
                                            {data.new_data.description ||
                                                "Description will be cleared"}
                                        </p>
                                    </div>
                                )}

                                {data.new_data.deadline !== null && (
                                    <div className="confirm-edit-field">
                                        <span className="confirm-edit-field-name">
                                            Deadline
                                        </span>
                                        <p>
                                            {formatDeadline(data.new_data.deadline)}
                                        </p>
                                    </div>
                                )}

                                {newPriority !== null && (
                                    <div className="confirm-edit-field">
                                        <span className="confirm-edit-field-name">
                                            Priority
                                        </span>
                                        <span
                                            className={`priority priority${newPriority}`}
                                        >
                                            {priorityLabels[newPriority] ?? "None"}
                                        </span>
                                    </div>
                                )}

                                {data.new_data.tags !== null && (
                                    <div className="confirm-edit-field">
                                        <span className="confirm-edit-field-name">
                                            Tags
                                        </span>

                                        {data.new_data.tags.length > 0 ? (
                                            <div className="confirm-edit-tags">
                                                {data.new_data.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="confirm-edit-tag"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>All tags will be removed</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>
                    </>
                )}
            </div>

            <div className="confirm-edit-actions">
                <button
                    className="confirm-edit-cancel"
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>

                <button
                    className="confirm-edit-approve"
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting || !selectedTask}
                >
                    {isSubmitting ? "Saving..." : "Approve changes"}
                </button>
            </div>
        </section>
    );
};

export default ConfirmEdit;