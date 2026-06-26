// api/chat.ts
type StreamEvent =
  | { type: "token"; token: string }
  | { type: "tool_end"; name: string;tool_id:string}
  | { type: "tool_start"; name: string;tool_id:string}
  | { type: "interrupt";payload:{action:string,data:any}}
  | { type: "done" }
  | { type: "error"; message: string };

type StreamChatArgs = {
  mode: "chat" | "resume"
  message?: string;
  threadId: string;
  data?: any;
  onEvent: (event: StreamEvent) => void;
};

export async function streamChat({
  mode,
  message,
  threadId,
  data,
  onEvent,
}: StreamChatArgs) { 
  const token = localStorage.getItem("access_token");
  console.log(({
      mode,
      message,
      thread_id: threadId,
      data
    }))
  const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/stream-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token ? token : ""}`
    },
    body: JSON.stringify({
      mode,
      message,
      thread_id: threadId,
      data
    }),
  });

  if (!response.ok) {
    throw new Error("Could not start chat stream");
  }

  if (!response.body) {
    throw new Error("Streaming is not supported in this browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Each SSE event ends in a blank line: \n\n
    const messages = buffer.split("\n\n");
    buffer = messages.pop() ?? "";

    for (const message of messages) {
      const dataLine = message
        .split("\n")
        .find((line) => line.startsWith("data:"));

      if (!dataLine) continue;

      const jsonText = dataLine.replace(/^data:\s*/, "");

      try {
        const event = JSON.parse(jsonText) as StreamEvent;
        onEvent(event);
      } catch {
        console.warn("Could not parse SSE event:", jsonText);
      }
    }
  }
}