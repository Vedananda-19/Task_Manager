from fastapi import FastAPI,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.auth_router import auth_router
from routes.user_router import user_router
from routes.agent_router import agent_router
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from agent.Agent import Agent
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app:FastAPI):
    async with AsyncPostgresSaver.from_conn_string(os.getenv("POSTGRES_DB_URI")) as checkpointer:
        await checkpointer.setup()
        app.state.agent = Agent(checkpointer=checkpointer)
        yield

allowed_origins = ["http://localhost:5173","https://task-manager-omega-jade.vercel.app"]

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=allowed_origins,allow_headers=['*'],allow_methods=['*'],allow_credentials=['*'])
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(agent_router)

@app.get("/")
def home():
    return "Home"