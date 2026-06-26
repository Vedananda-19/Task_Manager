import { useState } from "react";
import { useSearchParams } from "react-router-dom";

type FilterProps = {
    updateParams: (key: string, value?: string | undefined) => void;
    onClose: () => void;
};

const FilterCard = ({ updateParams, onClose }: FilterProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [titleInput, setTitleInput] = useState(
        searchParams.get("title") || "",
    );
    const [tagInput, setTagInput] = useState("");
    const tags = searchParams.getAll("tags");

    const addTag = () => {
        const nextTag = tagInput.trim().toLowerCase();
        if (!nextTag) return;

        if (!tags.includes(nextTag)) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.append("tags", nextTag);
                next.set("page", "1");
                return next;
            });
        }

        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const remainingTags = next.getAll("tags").filter((t) => t !== tag);
            next.delete("tags");
            remainingTags.forEach((t) => next.append("tags", t));
            return next;
        });
    };

    const handleClear = () => {
        setTitleInput("");
        setTagInput("");
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("title");
            next.delete("priority");
            next.delete("deadline");
            next.delete("status");
            next.delete("tags");
            next.delete("match_tags");
            return next;
        });
    };

    return (
        <section className="filterCard">
            <div className="filterCardHeader">
                <div>
                    <p className="eyebrow">FILTER TASKS</p>
                    <h2>Find what matters</h2>
                </div>

                <button className="textButton" onClick={onClose}>
                    Close
                </button>
            </div>

            <div className="filterGrid">
                <label>
                    Task name
                    <input
                        value={titleInput}
                        placeholder="Search by title..."
                        onChange={(e) => setTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            updateParams(
                                "title",
                                titleInput.trim() || undefined,
                            );
                        }}
                    />
                    <button
                        type="button"
                        className="clearFilterButton inlineClearButton"
                        title="Clear"
                        onClick={() => {
                            updateParams("title");
                            setTitleInput("");
                        }}
                    >
                        x
                    </button>
                </label>

                <label>
                    Priority
                    <select
                        value={searchParams.get("priority") ?? ""}
                        onChange={(e) =>
                            updateParams("priority", e.target.value)
                        }
                    >
                        <option value="">Any priority</option>
                        <option value="0">None</option>
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                        <option value="4">Very high</option>
                    </select>
                    <button
                        type="button"
                        className="clearFilterButton inlineClearButton"
                        title="Clear"
                        onClick={() => updateParams("priority")}
                    >
                        x
                    </button>
                </label>

                <label>
                    Deadline
                    <select
                        value={searchParams.get("deadline") ?? ""}
                        onChange={(e) =>
                            updateParams("deadline", e.target.value)
                        }
                    >
                        <option value="">Any deadline</option>
                        <option value="today">Today</option>
                        <option value="overdue">Overdue</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="no_deadline">No deadline</option>
                    </select>
                    <button
                        type="button"
                        className="clearFilterButton inlineClearButton"
                        title="Clear"
                        onClick={() => updateParams("deadline")}
                    >
                        x
                    </button>
                </label>

                <label>
                    Status
                    <select
                        value={searchParams.get("status") ?? ""}
                        onChange={(e) => updateParams("status", e.target.value)}
                    >
                        <option value="">All tasks</option>
                        <option value="incomplete">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button
                        type="button"
                        className="clearFilterButton inlineClearButton"
                        title="Clear"
                        onClick={() => updateParams("status")}
                    >
                        x
                    </button>
                </label>
            </div>

            <div className="filterTagsSection">
                <div className="filterTagsHeader">
                    <span className="fieldLabel">Tags</span>
                    {tags.length > 0 && (
                        <button
                            type="button"
                            className="clearTagsButton"
                            onClick={() => {
                                updateParams("tags");
                                setTagInput("");
                            }}
                        >
                            Clear tags
                        </button>
                    )}
                </div>

                <div className="filterTagInput">
                    <input
                        type="text"
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />

                    <button type="button" onClick={() => addTag()}>
                        Add
                    </button>
                </div>

                <div className="filterTags">
                    {tags.map((tag) => (
                        <span className="filterTag" key={tag}>
                            {tag}

                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                aria-label={`Remove ${tag}`}
                            >
                                x
                            </button>
                        </span>
                    ))}
                </div>

                <label className="matchTagsToggle">
                    <input
                        type="checkbox"
                        checked={searchParams.has("match_tags")}
                        onChange={(e) => {
                            if (e.target.checked) {
                                updateParams("match_tags", "true");
                            } else {
                                updateParams("match_tags");
                            }
                        }}
                    />
                    Match all tags
                </label>
            </div>

            <div className="filterActions">
                <button className="textButton" onClick={handleClear}>
                    Clear filters
                </button>
            </div>
        </section>
    );
};

export default FilterCard;
