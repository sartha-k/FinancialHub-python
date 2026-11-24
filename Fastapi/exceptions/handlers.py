from fastapi import HTTPException,Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger(__name__)

# Returns a consistent JSON response for HTTP exceptions.
async def http_exception_handler(
    request:Request,
    exc:HTTPException
):
    logger.warning("HTTP %s on %s %s: %s", exc.status_code, request.method, request.url.path, exc.detail)
    #Return a consistent JSON error structure
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success":False,
            "message":exc.detail,
            "data":None
        },
        headers=exc.headers
    )

#Automatically handle request validation errors
async def validation_exception_handler(
    request:Request,
    exc:RequestValidationError
):
    logger.warning("Request validation failed on %s %s", request.method, request.url.path)
    #Extract validation error details
    errors=exc.errors()

    #Convert each errors into custom format
    formatted_errors=[
        {
            # Access "loc" from the individual error dictionary
            "field": ".".join(map(str, error["loc"])),

            # Extract the validation message
            "message": error["msg"]
        }
        for error in errors
    ]
    # Return a standardized validation response
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Request validation failed",
            "data": None,
            "errors": formatted_errors
        }
    )

