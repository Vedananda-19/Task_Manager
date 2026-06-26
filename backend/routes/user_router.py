from fastapi import APIRouter,Depends,Query
from typing import Literal
from services.auth_service import get_current_user
from models import TaskCreateModel,CurrentUser,TaskModel
from agent.agent_models import FilterModel
from services import user_service

user_router = APIRouter(prefix="/user",tags=["user"])

@user_router.get("/me")
def get_users(user:CurrentUser=Depends(get_current_user)):
    return user.id

@user_router.post("/add-task")
def add_user_task(task:TaskCreateModel,user:CurrentUser  = Depends(get_current_user)):
    return user_service.add_task(task,user)

@user_router.get("/get-tasks")
def get_user_tasks(
    page: int | None = None,
    limit: int = 20,
    title: str | None = None,
    priority: Literal["0","1","2","3","4"] | None = None,
    tags: list[str] | None = Query(None),
    match_tags: bool = False,
    deadline: Literal["today","upcoming","overdue","no_deadline"] | None = None,
    status: Literal["completed","incomplete"] | None = None,
    sort: str | None = None,
    user:CurrentUser = Depends(get_current_user)
):
    filter = FilterModel(filter_by_title=title,filter_by_tags=tags,filter_by_priority=priority,filter_by_deadline=deadline,filter_by_status=status,match_all_tags=match_tags)
    if sort is None : sort="timestamp"
    return user_service.get_tasks(user,filter,page,limit,sort)

@user_router.post("/edit-task")
def edit_user_task(task:TaskModel,user:CurrentUser  = Depends(get_current_user)):
    return user_service.update_task(task,user)

@user_router.get("/delete-task/{task_id}")
def delete_user_task(task_id:str,user:CurrentUser = Depends(get_current_user)):
    return user_service.delete_task(task_id,user)

@user_router.get("/check-task/{task_id}")
def check_user_task(task_id:str,user:CurrentUser = Depends(get_current_user)):
    return user_service.check_task(task_id,user)