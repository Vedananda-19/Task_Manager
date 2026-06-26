import { useRef, useState } from "react";
import type { Task, TaskInput } from "../Pages/TasksPage";

type Props = {
    task?: Task | null;
    onSubmit: (task: TaskInput) => void;
    onCancel?: () => void;
    isSaving?: boolean;
};

const emptyTask: TaskInput = {
    title: "",
    description: "",
    priority: 0,
    deadline: null,
    tags: [],
    completed: false,
};
const defaultTagsData = [
    "daily",
    "weekly",
    "monthly",
    "work",
    "personal",
    "long-term",
    "health",
];

const TaskForm = ({ task, onSubmit, onCancel, isSaving }: Props) => {
    const [formData, setFormData] = useState<TaskInput>(() => task
        ? { ...task, deadline: task.deadline?.slice(0, 16) ?? null }
        : emptyTask);
    const [tagError, setTagError] = useState("");
    const tagRef = useRef<HTMLInputElement>(null);
    const editing = Boolean(task);

    const addTag = () => {
        const tag = tagRef.current?.value.trim().toLowerCase();
        if (!tag) return;
        if (formData.tags.includes(tag))
            return setTagError("That tag is already added.");
        setFormData((current) => ({
            ...current,
            tags: [...current.tags, tag],
        }));
        if (tagRef.current) tagRef.current.value = "";
    };

    return (
        <section
            className="taskFormPanel"
            aria-label={editing ? "Edit task" : "Add task"}
        >
            <div className="taskFormHeader">
                <h2>{editing ? "Edit task" : "Add a task"}</h2>
                {onCancel && (
                    <button
                        type="button"
                        className="textButton"
                        onClick={onCancel}
                    >
                        Close
                    </button>
                )}
            </div>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(formData);
                }}
            >
                <label>
                    Title
                    <input
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((v) => ({
                                ...v,
                                title: e.target.value,
                            }))
                        }
                        placeholder="Add a title..."
                        required
                    />
                </label>
                <label>
                    Description
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((v) => ({
                                ...v,
                                description: e.target.value,
                            }))
                        }
                        placeholder="Add any useful detail"
                    />
                </label>
                <div className="formRow">
                    <label>
                        Deadline
                        <input
                            type="datetime-local"
                            value={formData.deadline ?? ""}
                            onChange={(e) =>
                                setFormData((v) => ({
                                    ...v,
                                    deadline: e.target.value || null,
                                }))
                            }
                        />
                    </label>
                    <div>
                        <span className="fieldLabel">Priority</span>
                        <div className="priorityOptions">
                            {[
                                [1, "Low"],
                                [2, "Medium"],
                                [3, "High"],
                                [4, "Very high"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={
                                        formData.priority === value
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setFormData((v) => ({
                                            ...v,
                                            priority: Number(value),
                                        }))
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="tagInput">
                    <span className="fieldLabel">Tags</span>
                    <input
                        ref={tagRef}
                        placeholder="Add a tag"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />
                    <button type="button" onClick={addTag}>
                        Add tag
                    </button>
                </div>
                <div className="tags">
                    {formData.tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            className="tag"
                            onClick={() =>
                                setFormData((v) => ({
                                    ...v,
                                    tags: v.tags.filter((item) => item !== tag),
                                }))
                            }
                        >
                            {tag} &times;
                        </button>
                    ))}
                </div>
                <div className="suggestedTags">
                    {defaultTagsData
                        .filter((tag) => !formData.tags.includes(tag))
                        .map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() =>
                                    setFormData((v) => ({
                                        ...v,
                                        tags: [...v.tags, tag],
                                    }))
                                }
                            >
                                {tag}
                            </button>
                        ))}
                </div>
                {tagError && <p className="errorMsg">{tagError}</p>}
                <button
                    className="primaryButton"
                    disabled={isSaving}
                    type="submit"
                >
                    {isSaving
                        ? "Saving..."
                        : editing
                          ? "Save changes"
                          : "Add task"}
                </button>
            </form>
        </section>
    );
};

export default TaskForm;
