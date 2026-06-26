import { useEffect, useRef, useState } from "react";
import { streamChat } from "../apis/chat";
import { useNavigate } from "react-router-dom";
import ConfirmDelete from "../Components/ConfirmDelete";
import ConfirmEdit from "../Components/ConfirmEdit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "user" | "assistant" | "tool_start" | "tool_end" | "error";

type DisplayPayload = { action: string; data: any } | null;

type Message = {
    id: string;
    role: Role;
    content: string;
    isStreaming?: boolean;
};

type StreamEvent =
    | { type: "token"; token: string }
    | { type: "tool_end"; name: string; tool_id: string }
    | { type: "tool_start"; name: string; tool_id: string }
    | { type: "interrupt"; payload: { action: string; data: any } }
    | { type: "done" }
    | { type: "error"; message: string };

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>(
        sessionStorage.getItem("messages")
            ? JSON.parse(sessionStorage.getItem("messages")!)
            : [],
    );
    const [isLoading, setIsLoading] = useState(false);
    const [interruptDisplay, setInterruptDisplay] =
        useState<DisplayPayload>(null);
    const navigate = useNavigate();

    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [threadId,setThreadId] = useState<string>(() => (sessionStorage.getItem("thread_id")
            ? JSON.parse(sessionStorage.getItem("thread_id")!)
            : crypto.randomUUID()));

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
        sessionStorage.setItem("messages",JSON.stringify(messages))
    }, [messages]);

    const newChat = () => {
        const newId = crypto.randomUUID()
        setThreadId(newId)
        sessionStorage.setItem("thread_id",JSON.stringify(newId))
        setMessages([])
    }

    async function handleSubmit(
        e?: { preventDefault: () => void },
        mode: "chat" | "resume" = "chat",
        resumeData?: any,
    ) {
        e?.preventDefault();

        const userText = input.trim();
        if ((mode === "chat" && !userText) || isLoading) return;

        const curr_user_msg_id = crypto.randomUUID();
        let curr_ai_msg_id = crypto.randomUUID();

        //Either adds the token to the streaming message(if last message was ai text) or
        //stops previous streaming and creates new streaming message
        const add_incoming_token = (token: string) => {
            setMessages((prev) => {
                const last_msg = prev.at(-1);
                if (last_msg?.role == "assistant" && last_msg.isStreaming) {
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...last_msg,
                            content: last_msg.content + token,
                        },
                    ];
                } else {
                    return [
                        ...prev.flatMap((m) =>
                            m.content !== ""
                                ? m.isStreaming
                                    ? [{ ...m, isStreaming: false }]
                                    : [m]
                                : [],
                        ),
                        {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            content: token,
                            isStreaming: true,
                        },
                    ];
                }
            });
        };
        const add_error = (error: string) => {
            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "error",
                    content: error,
                },
            ]);
        };

        //Adding a new user message
        setMessages((current) => [
            ...current,
            ...(mode === "chat"
                ? [
                      {
                          id: curr_user_msg_id,
                          role: "user" as const,
                          content: userText,
                      },
                  ]
                : []),
            {
                id: curr_ai_msg_id,
                role: "assistant",
                content: "",
                isStreaming: true,
            },
        ]);

        setInput("");
        setIsLoading(true);
        if (mode === "resume") setInterruptDisplay(null);

        try {
            await streamChat({
                mode: mode,
                message: userText,
                threadId,
                data: resumeData,
                onEvent: (event) => {
                    handleStreamEvent(event);
                },
            });
        } catch (error: any) {
            console.error(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
            }

            add_error("Could not reach the server.");
        } finally {
            setIsLoading(false);
        }

        function handleStreamEvent(event: StreamEvent) {
            if (event.type === "token") {
                add_incoming_token(event.token);
            }
            if (event.type === "tool_start") {
                setMessages((prev) => [
                    ...prev.map((m) =>
                        m.isStreaming ? { ...m, isStreaming: false } : m,
                    ),
                    {
                        id: event.tool_id,
                        role: "tool_start",
                        content: `Calling ${event.name}...`,
                    },
                ]);
            }
            if (event.type === "tool_end") {
                setMessages((prev) => {
                    const exists = prev.some((m) => m.id === event.tool_id);
                    if (exists) {
                        return prev.map((msg) =>
                            msg.id === event.tool_id
                                ? {
                                      ...msg,
                                      role: "tool_end",
                                      content: `Called ${event.name}`,
                                  }
                                : msg,
                        );
                    }
                    return [
                        ...prev,
                        {
                            id: event.tool_id,
                            role: "tool_end",
                            content: `Called ${event.name}`,
                        },
                    ];
                });
            }
            if (event.type === "interrupt") {
                setInterruptDisplay(event.payload);
            }
            if (event.type === "error") {
                add_error(event.message);
                setMessages((current) =>
                    current.map((message) =>
                        message.id === curr_ai_msg_id
                            ? {
                                  ...message,
                                  isStreaming: false,
                              }
                            : message,
                    ),
                );
            }
            if (event.type === "done") {
                setMessages((current) =>
                    current.map((message) =>
                        message.isStreaming
                            ? { ...message, isStreaming: false }
                            : message,
                    ),
                );
            }
        }
    }

    return (
        <main className="chat-page">
            <section className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chatWelcomeCard">
                        <h2>Organize your tasks</h2>
                        <p className="chatWelcomeText">
                            Ask in plain English. I can create, edit, complete, delete, search,
                            and filter your tasks for you.
                        </p>

                        <div className="chatExamples">
                            <button
                                type="button"
                                onClick={() =>
                                    setInput(
                                        "Create a high priority task to finish my Project assignment by Friday."
                                    )
                                }
                            >
                                "Create a high priority task to finish my Project assignment by Friday."
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setInput(
                                        "Show me all incomplete tasks due today."
                                    )
                                }
                            >
                                "Show me all incomplete tasks due today."
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setInput("Mark all daily tasks as completed.")
                                }
                            >
                                "Mark all daily tasks as completed."
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setInput(
                                        "Delete every completed task older than a month."
                                    )
                                }
                            >
                                "Delete every completed task older than a month."
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setInput(
                                        "Make all the upcoming tasks with exam tag have high priority"
                                    )
                                }
                            >
                                "Make all the upcoming tasks with exam tag have high priority."
                            </button>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message-row ${message.role}`}
                        >
                            <div
                                className={`message-bubble ${message.role} ${
                                    message.role === "assistant" &&
                                    message.isStreaming &&
                                    !message.content
                                        ? "thinking"
                                        : ""
                                }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.role === "assistant" &&
                                    message.isStreaming &&
                                    !message.content
                                        ? "Thinking..."
                                        : message.content}
                                </ReactMarkdown>
                                {message.isStreaming && message.content && (
                                    <span className="streaming-cursor">...</span>
                                )}
                            </div>
                        </div>
                    ))
                )}

                <div ref={bottomRef} />
            </section>

            <form className="chat-input-area" onSubmit={handleSubmit}>
                {interruptDisplay ? (
                    interruptDisplay.action == "confirm_delete" ? (
                        <ConfirmDelete
                            data={interruptDisplay.data}
                            isSubmitting={isLoading}
                            onConfirm={(ids) =>
                                handleSubmit(undefined, "resume", {
                                    approval: "approved",
                                    message: { ids },
                                })
                            }
                            onCancel={() =>
                                handleSubmit(undefined, "resume", {
                                    approval: "rejected",
                                    message:
                                        "The user cancelled the deletion request.",
                                })
                            }
                        />
                    ) : interruptDisplay.action == "confirm_edit" ? (
                        <ConfirmEdit
                            data={interruptDisplay.data}
                            isSubmitting={isLoading}
                            onConfirm={() =>
                                handleSubmit(undefined, "resume", {
                                    approval: "approved",
                                })
                            }
                            onCancel={() =>
                                handleSubmit(undefined, "resume", {
                                    approval: "rejected",
                                })
                            }
                        />
                    ) : (
                        "Something Went wrong during Interruption"
                    )
                ) : (
                    <div className="chat-input-box">
                        <textarea
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Message Task Manager..."
                            disabled={isLoading}
                            rows={1}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    handleSubmit(event);
                                }
                            }}
                        />

                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            aria-label="Send message"
                        >
                            ↑
                        </button>
                    </div>
                )}
                <p className="chat-disclaimer">
                    Task Manager can make mistakes. Check important task
                    details.
                </p>
                <button className="newChatButton" type="button" onClick={()=>newChat()}>New chat</button>
            </form>
        </main>
    );
}
