from services import user_service
from langchain.tools import tool,ToolRuntime
from langgraph.types import Command,interrupt
from langchain_core.messages import ToolMessage
from models import CurrentUser,TaskCreateModel,TaskUpdateModel
from .agent_models import Context,TaskCreateInput,TaskEditInput,FilterModel
from datetime import datetime
from typing import Literal

def get_context_user(context:Context) -> CurrentUser:
    return CurrentUser(id=context.user_id,username=context.username)

@tool(args_schema=TaskCreateInput)
def create_task(
    runtime: ToolRuntime,
    title: str,
    description: str | None = None,
    deadline: datetime | None = None,
    priority: str = 0,
    tags: list[str] | None = None,
):
    """Create a task depending upon user's request - Used for adding tasks"""

    task = TaskCreateModel.model_validate({"title": title,
        "description": description,"deadline": deadline,
        "priority": int(priority),"tags": tags or []
    })
    result = user_service.add_task(task,get_context_user(runtime.context))
    return {"message":result["message"],"added":task.model_dump(mode='json')}

@tool
def get_tasks(runtime:ToolRuntime,filter:FilterModel):
  """Retrieve user's tasks stored in the database using optional filters 
  , use the task ids for updating/deletion
  The tasks are sorted by timestamp(latest added first) by default
  """
  result = user_service.get_tasks(get_context_user(runtime.context),filter=filter)
  return result["tasks"]

@tool()
def delete_tasks(runtime:ToolRuntime,task_ids:list[str]):
    """For deleting tasks by id (Always call get_tasks before deletion to avoid stale data),
      Only delete upto 5 tasks at once, dont try to delete cancelled tasks again
    task_ids:list of ids of the tasks you want to be deleted"""
    if not 1 <=len(task_ids)<= 5:
        return {"error": "You can delete between 1 and 5 tasks at once."}
    response = interrupt({"action":"confirm_delete","data":{"ids":task_ids}})

    if response["approval"]=="approved":
        new_ids : list[str] = response["message"]["ids"]
        cancelled_ids = [id for id in task_ids if id not in new_ids]
    else:
        return response["message"]
    
    not_found_ids = []
    for id in new_ids:
        res = user_service.delete_task(id,get_context_user(runtime.context))
        if 'error' in res:
            not_found_ids.append(id)

    
    return {"task_ids":task_ids,"deleted":new_ids,"Cancelled":cancelled_ids,"message":f"Deleted {len(new_ids)-len(not_found_ids)} tasks successfully , Dont try to delete these tasks again"}

@tool(args_schema=TaskEditInput)
def edit_task(runtime:ToolRuntime,
    task_id: str,
    title: str | None = None,
    description: str | None = None,
    deadline: datetime | None = None,
    priority: str | None = None,
    tags: list[str] | None = None,
    replace_tags : bool = False
):
    """For Editing a task: get the id of the task and the fields user want to edit,
    Look for cancelled task_ids,Dont try to edit a task which was just cancelled/edited
    """
    new_data = TaskUpdateModel(title=title,description=description,deadline=deadline
                               ,priority=int(priority) if priority is not None else None,tags=tags)
    user = get_context_user(runtime.context)
    old_task = user_service.get_task_by_id(task_id,user)
    if old_task is None:
        return {"error":f"Task not found for id:{task_id}, dont try to edit this id again"}

    response = interrupt({"action":"confirm_edit","data":{"task_id":task_id,"new_data":new_data.model_dump(mode="json")}})
    if response["approval"]=="approved":
        res = user_service.update_task_with_new_data(old_task,new_data,replace_tags,user)
        if "error" in res:
            return res["error"]
    else:
        return {"cancelled_task_id":task_id,"message":f"user has cancelled the edit request, dont try to edit this task id:{task_id} again"}
    
    return {"updated":task_id,"with":new_data,"message":"Edited task successfully"}

@tool
def check_task(runtime:ToolRuntime,task_id:str,action:Literal["toggle","check","uncheck"]):
    """For toggling the completion status of a task
    Always call get_tasks before deletion to avoid stale data.
    task_id:id of the task to check
    action:(Pass either
        1.toggle to toggle the completion status,
        2.check to mark it as completed,
        3.uncheck to mark it as not completed
    """
    res = user_service.check_task(task_id,get_context_user(runtime.context),action)
    if "error" in res:
            return res["error"]
    else:
        return {"updated":task_id,"message":res["message"]}

tools = [create_task,get_tasks,delete_tasks,edit_task,check_task]
