from pydantic import BaseModel,ConfigDict,Field,field_validator,model_validator
from typing import Generic,TypeVar,Self

class SavingsPlan(BaseModel):
    savingsPlanId:int | None = None
    name:str
    rateOfInterest:float
    timeFrame:int
    riskLevel:str
    description:str
    status:str


class SavingsPlanResponse(BaseModel):
    savingsPlanId:int
    name:str
    rateOfInterest:float

class SavingPlanDetailResponse(BaseModel):
    success:bool
    message:str
    data:SavingsPlanResponse

T = TypeVar("T")

class ApiResponse(BaseModel,Generic[T]):
    success:bool
    message:str
    data:T

class PaginatedResponse(BaseModel,Generic[T]):
    content:list[T]
    page:int
    size:int
    totalElements:int
    totalPages:int

    model_config=ConfigDict(from_attributes=True)

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

        if self.riskLevel == "HIGH" and self.timeFrame<12:
            raise ValueError(
                "HIGH risk plans must have a timeframe of atleast 12 months"
            )
        return self