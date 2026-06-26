from fastapi import APIRouter,Depends
from fastapi.responses import StreamingResponse
from services.auth_service import get_current_user
from pydantic import BaseModel
from models import CurrentUser
from langchain_core.messages import HumanMessage,AIMessageChunk
from langgraph.types import Command
import json
from agent.agent_models import Context
from typing import Literal
import traceback

class ChatRequest(BaseModel):
    mode : Literal["chat","resume"]
    message : str | None = None
    thread_id : str
    data : dict | None = None

agent_router = APIRouter(prefix="/agent",tags=["agent"])

@agent_router.post("/stream-messages")
async def stream_messages(request:Request , chat_request:ChatRequest,user:CurrentUser = Depends(get_current_user)):
    return StreamingResponse( #For async generating server sent events(sse)
         get_streamed_messages(chat_request,chat_request.mode == "resume",user),
         media_type="text/event-stream",
         headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
         }
    )

async def get_streamed_messages(chat_request:ChatRequest,resume:bool,user:CurrentUser):
    context = Context(user_id=user.id,username=user.username)
    if resume:
        stream_input = Command(resume=chat_request.data)
    else:
        stream_input = {"messages":[HumanMessage(chat_request.message)]}
    try:
        async for mode,data in agent.graph.astream(
                input=stream_input,
                config={"configurable":{"thread_id":chat_request.thread_id}},
                context=context,
                stream_mode=["messages","updates"]
            ):
            if mode=="messages":
                chunk = data[0]
                content = chunk.content
                if isinstance(chunk,AIMessageChunk):
                    if isinstance(content, str):
                        if content:
                            payload = json.dumps({
                                "type": "token",
                                "token": content,
                            })
                            yield f"data: {payload}\n\n"

                    elif isinstance(content, list):
                        if content==[]:
                            continue
                        for block in content:
                            if isinstance(block, dict) and block.get("type") == "text":
                                text = block.get("text", "")
                                if text:
                                    payload = json.dumps({
                                        "type": "token",
                                        "token": text,
                                    })
                                    yield f"data: {payload}\n\n"
                    for tool in chunk.tool_calls:
                        payload = json.dumps({
                            "type":"tool_start",
                            "name":tool["name"],
                            "tool_id":tool["id"]
                        })
                        yield f"data: {payload}\n\n"

            elif mode=="updates":
                if "__interrupt__" in data:
                    interrupt_obj = data["__interrupt__"][0]
                    payload = json.dumps({
                        "type": "interrupt",
                        "payload": interrupt_obj.value
                    })
                    yield f"data: {payload}\n\n"
                    return
                if "action" in data:
                    message = data["action"]["messages"][-1]
                    payload = json.dumps({"type":"tool_end","name":message.name,"tool_id":message.tool_call_id})
                    yield f"data: {payload}\n\n"


        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as error:
         print("STREAM ERROR:", repr(error))
         traceback.print_exc()
         if "503" in error and "high demand" in error.lower():
            message = (
                """The AI model is currently experiencing high demand.Please Try again later """
            )
         else:
            message = "Something went wrong while generating the response."
         payload = json.dumps({"type":"error","message": message})
         yield f"data: {payload}\n\n"
    
