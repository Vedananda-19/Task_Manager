from fastapi import FastAPI,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.auth_router import auth_router
from routes.user_router import user_router
from routes.agent_router import agent_router
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
from agent.Agent import Agent
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app:FastAPI):
    async with AsyncConnectionPool(
        conninfo=os.getenv("POSTGRES_DB_URI"),
        min_size=0,                 # don't hold idle conns Neon will kill
        max_size=10,
        max_idle=240,               # recycle conns after 4 min (< Neon's 5 min idle)
        check=AsyncConnectionPool.check_connection,  # ping & drop dead conns before use
        kwargs={"autocommit": True, "prepare_threshold": 0},
    ) as pool:
        print("Connected!")

        checkpointer = AsyncPostgresSaver(pool)
        await checkpointer.setup()

        print("Setup finished!")

        app.state.agent = Agent(checkpointer)

        yield

    print("Checkpointer closed")

allowed_origins = ["http://localhost:5173","https://taskmanager.quantumnex.in"]

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=allowed_origins,allow_headers=['*'],allow_methods=['*'],allow_credentials=['*'])
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(agent_router)

@app.get("/")
def home():
    return "Home"