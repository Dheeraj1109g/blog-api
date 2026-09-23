from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import post, auth, comment

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blog API")

# Allow the deployed frontend (and local dev builds) to call this API directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(post.router)
app.include_router(comment.router)


@app.get("/")
def read_root():
    return {"message": "Blog API is running"}