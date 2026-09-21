from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.routers import post, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blog API")

app.include_router(auth.router)
app.include_router(post.router)

@app.get("/")
def read_root():
    return {"message": "Blog API is running"}

from app.routers import post, auth, comment
...
app.include_router(comment.router)