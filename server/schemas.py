from pydantic import BaseModel
from typing import List

class Blog(BaseModel):
    id:int
    title:str
    body:str


class User(BaseModel):
    name:str
    email:str
    password:str

class ShowUser(BaseModel):
    name:str
    email:str
    blogs:List[Blog]

class ShowBlog(Blog):
    id:int
    title:str
    body:str
    author: ShowUser


class Login(BaseModel):
    username:str
    password:str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None