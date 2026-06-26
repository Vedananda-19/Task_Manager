from models import TaskUpdateModel,TaskModel,CurrentUser,TaskCreateModel
from agent.agent_models import FilterModel
from database import db
from datetime import datetime,timedelta
from zoneinfo import ZoneInfo
import math

tasks = db["tasks"]

def add_task(task_data:TaskCreateModel,user:CurrentUser):
    task = TaskModel(user_id=user.id,**task_data.model_dump()).model_dump()
    task["_id"] = task.pop("id")
    tasks.insert_one(task)
    return {"message":"Task Added Successfully"}

def get_tasks(user:CurrentUser,filter:FilterModel,page:int | None = None,limit:int=20,sort:str= "timestamp"):
    query = {"user_id":user.id}

    if filter.filter_by_title is not None:
        query["title"] = { "$regex": filter.filter_by_title,"$options": "i",}
    if filter.filter_by_tags is not None:
        if filter.match_all_tags:
            query["tags"] = {"$all":filter.filter_by_tags}
        else:
            query["tags"] = {"$in":filter.filter_by_tags}
    if filter.filter_by_priority is not None:
        query["priority"] = int(filter.filter_by_priority)
    if filter.filter_by_deadline is not None:
        now = datetime.now(ZoneInfo("Asia/Kolkata"))
        if filter.filter_by_deadline=="today":
            today_start = now.replace(hour=0,minute=0,second=0,microsecond=0)
            tomorrow_start = today_start + timedelta(days=1)
            query["deadline"] = {"$gte":today_start,'$lt':tomorrow_start}
        elif filter.filter_by_deadline=="upcoming":
            query["deadline"] = {"$gt":now}
        elif filter.filter_by_deadline=="overdue":
            query["deadline"] = {"$lte":now}
        elif filter.filter_by_deadline=="no_deadline":
            query["deadline"] = None
    if filter.filter_by_status is not None:
        if filter.filter_by_status=="completed":
            query["completed"] = True
        elif filter.filter_by_status=="incomplete":
            query["completed"] = False

    tasks_cursor = tasks.find(query).sort(sort,1 if sort=='title' else -1)
    total_tasks = tasks.count_documents(query)
    page_count = max(1, math.ceil(total_tasks / limit))
    if page is not None:
        tasks_cursor = tasks_cursor.skip((page-1)*limit).limit(limit)

    user_tasks = []
    for task in tasks_cursor:
        task["id"] = task.pop("_id")
        user_tasks.append(task)

    return {"tasks":user_tasks,
            "page_data":{
                "page": page,
                "limit": limit,
                "total_items": total_tasks,
                "total_pages": page_count
            }}

def update_task(task_data:TaskModel,user:CurrentUser):
    task = task_data.model_dump()
    task_id = task["id"]
    task.pop("id")#Since replace doesnt want id
    task["user_id"] = user.id
    result = tasks.replace_one({"user_id":user.id,"_id":task_id},task)
    if result.matched_count==0:
        return {"error":"Task Not Found"}
    return {"message":"Task Edited Successfully"}

#Using both since frontend was sending the entire taskmodel but im only sending newdata from agent
def update_task_with_new_data(old_task,new_data:TaskUpdateModel,replace_tags:bool,user:CurrentUser):
    new_data = new_data.model_dump(exclude_none=True)
    if "tags" in new_data and replace_tags==False:
        new_data["tags"] = list(dict.fromkeys(old_task["tags"] + new_data["tags"]))
    result = tasks.update_one({"user_id":user.id,"_id":old_task["_id"]},{"$set":new_data})
    if result.matched_count==0:
        return {"error":"Task Not Found"}
    return {"message":"Task Edited Successfully"}

def delete_task(task_id:str,user:CurrentUser):
    result = tasks.delete_one({"user_id":user.id,"_id":task_id})
    if result.deleted_count==0:
        return {"error":"Task Not Found"}
    return {"message":"Task Deleted Successfully"}

def get_task_by_id(task_id:str,user:CurrentUser):
    return tasks.find_one({"user_id":user.id,"_id":task_id})

def check_task(task_id:str,user:CurrentUser,action:str = None):
    if action==None or action=="toggle":
        result = tasks.update_one({"user_id":user.id,"_id":task_id},[{"$set":{"completed":{"$not":["$completed"]}}}])
        if result.matched_count==0:
            return {"error":"Task Not Found"}
        return {"message":"Task Toggled Successfully"}
    else:
        result = tasks.update_one({"user_id":user.id,"_id":task_id},[{"$set":{"completed":True if action=="check" else False}}])
        if result.matched_count==0:
            return {"error":"Task Not Found"}
        return {"message":f"Task {"Checked" if action=="check" else "Unchecked"} Successfully"}

