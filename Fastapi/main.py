from fastapi import FastAPI
from routers import savingsplan
from database import  engine
import models
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

@app.get("/")
def greet():
    return "Hello everyone"

app.include_router(savingsplan.router)
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)