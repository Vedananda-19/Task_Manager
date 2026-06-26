from langgraph.graph import StateGraph,END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.runtime import Runtime
from langchain_core.messages import HumanMessage,SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from .agent_tools import tools
from .agent_models import AgentState,Context
from datetime import datetime
from zoneinfo import ZoneInfo
from models import CurrentUser

from dotenv import load_dotenv

load_dotenv()

class Agent:
    tools=tools
    system_prompt = """You are a model which creates tasks by
        understanding the task which user wants to add.
        Be concise and accurate,ask for clarifications, try not to assume information which user doent specify
        nor add irrelevant information , only elaborate if necessary or if the user is vague
        Always tell you're thoughts/todo process before you start calling tools
        Always look for just previously cancelled tasks , dont try to edit/delete those ids again
        """
    def __init__(self,checkpointer):
        self.model=ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite",temperature=0.6)
        self.model = self.model.bind_tools(self.tools)

        graph = StateGraph(AgentState,context_schema=Context)
        graph.add_node("llm",self.call_model)
        graph.add_node("action",ToolNode(self.tools))
        graph.add_conditional_edges("llm",self.check_action,{True:"action",False:END})
        graph.add_edge("action","llm")
        graph.set_entry_point("llm")

        self.graph = graph.compile(checkpointer=checkpointer)

    async def __call__(self,user_message:str,thread_id:str,user:CurrentUser):
        context = Context(user_id=user.id,username=user.username)
        return self.graph.ainvoke({"messages":[HumanMessage(user_message)]},context=context,config={"configurable":{"thread_id":thread_id}})
        
    async def call_model(self,state:AgentState,runtime:Runtime[Context]):

        system_message = SystemMessage(
            f"""
            {self.system_prompt},
            username : {runtime.context.username}
            Current date and time: {datetime.now(ZoneInfo("Asia/Kolkata"))}
            Always convert any datetime onjects from utc to the current zone before reading or writing
            When the user says relative dates such as today/by next week/next month,
            interpret them using this current date and timezone.
            """)
        
        messages = state["messages"]
        response = await self.model.ainvoke([system_message]+messages)
        return {"messages":[response]}

    def check_action(self,state:AgentState):
        tool_calls = state["messages"][-1].tool_calls
        if len(tool_calls)>0:
            return True
        return False


