from typing import Annotated,TypedDict,Literal
from pydantic import BaseModel,Field
from datetime import datetime
from operator import add
from dataclasses import dataclass

from models import TaskCreateModel,TaskModel

@dataclass
class Context:
    user_id : str
    username : str

def add_messages(old_messages:list,new_messages:list):
    return old_messages+new_messages

class AgentState(TypedDict):
    messages : Annotated[list,add_messages]
    performed_actions : Annotated[list[dict[str,TaskModel|TaskCreateModel]],add]
    retrieved_tasks : list[TaskModel]

class TaskCreateInput(BaseModel):
    """Create a task. Do not assume missing information."""
    title: str = Field(
        description="Task title. If not explicitly given, make a short action title.")
    description: str | None = Field(
        default=None,
        description="Extra details given by the user. Otherwise null.",)
    deadline: datetime | None = Field(
        default=None,
        description="Due datetime given by user ,if not, understand and pass relative dates only if given(Ex:today , by next week.etc..)(keep time 23:59 if not given); otherwise null.",)
    priority: Literal["0", "1", "2", "3", "4"] = Field(
        default=0,
        description="0-none, 1-low, 2-medium, 3-high, 4-very high. Use 0 if unsure.",)
    tags: list[str] = Field(
        default_factory=list,
        description="User-provided tags. Otherwise empty list. Add daily/weekly/monthly only if implied.",)

class TaskEditInput(BaseModel):
    """Input for editing an existing task.Only provide fields if the user explicitly wants to change it, else leave them as None"""
    task_id: str = Field( description="ID of the task to edit.")
    title: str | None = Field(default=None,description="New task title(keep it short unless specified)")
    description: str | None = Field(default=None,
        description="New task description.Pass empty string for clearing it")
    deadline: datetime | None = Field(
        default=None,
        description=
            "New due datetime.Resolve relative dates such as today or next week.")
    priority: Literal["0", "1", "2", "3", "4"] | None = Field(
        default=None,
        description="New priority: 0 none, 1 low, 2 medium, 3 high, 4 very high.")
    tags: list[str] | None = Field(
        default=None,
        description="New list of tags.Pass empty list to clear it")
    replace_tags: bool = Field(default=False,
        description="""Pass False if you want to add the above tags to old tags, True to replace the old tags""")
    

class FilterModel(BaseModel):
    """To Filter tasks. Pass null for any filter the user did not request.
    Never use filter values from assumptions.
    """
    filter_by_title:str|None=Field(default=None,
        description="Pass Title string To search tasks by title(case insensitive regex)")
    filter_by_tags:list[str]|None=Field(default=None,
        description="Pass list of tags To filter tasks which have the given tasks")
    match_all_tags:bool=Field(default=False,
        description="Pass True if all of the above passed Tags should match or False if any one can match to the task tags")
    filter_by_priority:Literal["0", "1", "2", "3", "4"]|None=Field(default=None,
        description="Pass a priority integer To filter tasks by priority (0-none,1-low,2-medium,3-high,4-Very High)")
    filter_by_deadline:Literal["today","upcoming","overdue","no_deadline"]|None=Field(default=None,
            description="Pass:"
            "today-to filter tasks due today(includes overdue today), "
            "upcoming-to filter tasks whose deadline hasnt reached yet "
            "overdue-to filter overdue tasks(deadline had already reached)"
            "no_deadline-to filter tasks without deadline"
        )
    filter_by_status:Literal["completed","incomplete"]|None=Field(default=None,
            description="Pass completed to filter tasks which have been checked/completed"
            "Pass incomplete to filter tasks which have been not checked/not completed"                                               
        )