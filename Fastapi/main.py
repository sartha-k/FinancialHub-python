"""
main.py

This is the entry point of the FastAPI backend.
It creates the app, registers all the routers (so their endpoints become active),
creates any missing database tables on startup, and configures CORS so the Angular
frontend running on localhost:4200 is allowed to talk to this API.
Run this file with uvicorn to start the server.
"""
from fastapi import FastAPI,HTTPException,Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from routers import savingsplan,auth
from database import  engine
import models
from fastapi.middleware.cors import CORSMiddleware
from exceptions.handlers import(
    http_exception_handler,
    validation_exception_handler
)
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    filename="financehub.log",
    filemode="w"
)
# FastAPI app instance
app = FastAPI()
# Register custom HTTP exception handler
app.add_exception_handler(
    HTTPException,
    http_exception_handler
)

# Register custom request validation handler
app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.exception_handler(Exception)
# Logs unexpected server errors and returns a generic error response.
async def global_exception_handler(request:Request, exc:Exception):
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error",
                 "error_tyoe":type(exc).___name__,
                 "reason":str(exc)
                 }

    )
# Health-check root endpoint
@app.get("/")
def greet():
    return "Hello everyone"

# Register the savings plan router under /api/savingsPlan
app.include_router(savingsplan.router)
app.include_router(auth.router)

# Create all DB tables defined in models if they don't exist
models.Base.metadata.create_all(bind=engine)

# Allow requests from the Angular dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# going good yeah