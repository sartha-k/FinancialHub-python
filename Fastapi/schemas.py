"""
schemas.py

This file defines the data shapes (schemas) used for validating and serialising
data going in and out of the API. Pydantic checks that every request body and
response matches the expected structure and types before anything reaches the
database. If you need to change what fields are accepted or returned by the API,
this is the file to edit.
"""
from pydantic import BaseModel,ConfigDict,Field,field_validator,model_validator,EmailStr
from typing import Generic,TypeVar,Self

# Full savings plan schema including the ID, used for PUT updates
class SavingsPlan(BaseModel):
    savingsPlanId:int | None = None
    name:str
    rateOfInterest:float
    timeFrame:int
    riskLevel:str
    description:str
    status:str


# Slim response schema exposing only key fields for list views
class SavingsPlanResponse(BaseModel):
    savingsPlanId:int
    name:str
    rateOfInterest:float

# Wraps a single SavingsPlanResponse with success/message metadata
class SavingPlanDetailResponse(BaseModel):
    success:bool
    message:str
    data:SavingsPlanResponse

T = TypeVar("T")

# Generic API envelope used for all single-item responses
class ApiResponse(BaseModel,Generic[T]):
    success:bool
    message:str
    data:T

# Generic paginated wrapper for list endpoints
class PaginatedResponse(BaseModel,Generic[T]):
    content:list[T]
    page:int
    size:int
    totalElements:int
    totalPages:int

    model_config=ConfigDict(from_attributes=True)

# Schema for creating a new savings plan; enforces field constraints
class SavingsPlanCreate(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    rateOfInterest: float = Field(ge=0, le=100)
    timeFrame: int = Field(gt=0)
    riskLevel: str
    description: str
    status: str
    @field_validator("riskLevel")
    @classmethod
    def validate_risk_level(cls, value):
        value = value.upper()
        allowed_values = ["LOW","MEDIUM","HIGH"]
        if value not in allowed_values:
            raise ValueError(
                "riskLevel must be LOW, MEDUIM or  HiGH"
            )
        return value

    @model_validator(mode="after")
    def validate_high_risk_plan(self)->Self:
        value = self.riskLevel.upper()
        if self.riskLevel == "HIGH" and self.timeFrame<12:
            raise ValueError(
                "HiGH risk plans must have a timeframe of atleast 12 months"
            )
        return self

# Schema for partial updates; all fields optional with validation rules
class SavingsPlanUpdate(BaseModel):
    savingsPlanId:int | None = Field(default=None, min_length=3, max_length=100)
    name:str | None = None
    rateOfInterest:float | None = Field(default=None, ge=0, le=100)
    timeFrame:int |  None = Field(default=None, gt=0)
    riskLevel:str | None = None
    description:str | None = None
    status:str | None = None

    @field_validator("riskLevel")
    @classmethod
    def validate_risk_level(cls, value):
        value = value.upper()
        allowed_values = ["LOW","MEDIUM","HIGH"]
        if value not in allowed_values:
            raise ValueError(
                "riskLevel must be LOW, MEDUIM or  HiGH"
            )
        return value
    
    @model_validator(mode="after")
    def validate_high_risk_plan(self)->Self:

        if self.riskLevel == "HIGH" and self.timeFrame<12:
            raise ValueError(
                "HIGH risk plans must have a timeframe of atleast 12 months"
            )
        return self

# Data accepted from the client during registration
class UserCreate(BaseModel):
        username:str = Field(min_length=3,max_length=100)
        email:EmailStr
        password:str=Field(min_length=8)

# Data returned to the client
class UserResponse(BaseModel):
        id:int
        username:str
        email:EmailStr
        role:str

class UserLogin(BaseModel):
    email:EmailStr
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str="bearer"