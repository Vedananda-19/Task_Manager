from pydantic import BaseModel,ConfigDict,Field
from datetime import date,datetime,timezone
from typing import Optional
from bson import ObjectId
from zoneinfo import ZoneInfo
import uuid

class RegisterModel(BaseModel):
    username : str
    password : str
    confirmPassword : str

class TaskCreateModel(BaseModel):
    title : str
    description : Optional[str] = ""
    deadline : Optional[datetime] = None
    priority : int = 0
    tags : list[str] = Field(default_factory=list)

class TaskUpdateModel(BaseModel):
    title: str | None = None
    description: str | None = None
    deadline: datetime | None = None
    priority: int | None = None
    tags: list[str] | None = None

class TaskModel(BaseModel):
    model_config = ConfigDict(validate_by_name=True)

    id : str = Field(default_factory=lambda:str(uuid.uuid4()),alias="_id")
    user_id : Optional[str] = None
    title : str
    description : Optional[str] = ""
    deadline : Optional[datetime] = None
    priority : int = 0
    tags : list[str] = Field(default_factory=list)
    timestamp : datetime = Field(default_factory=lambda : datetime.now(ZoneInfo("Asia/Kolkata")))
    completed : bool = False

class UserModel(BaseModel):
    id: str | None = Field(default=None,alias="_id")
    username : str
    password : str

class CurrentUser(BaseModel):
    id: str
    username: str
