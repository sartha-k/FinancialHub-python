from pydantic import BaseModel,ConfigDict


class SavingsPlan(BaseModel):
    savingsPlanId:int | None = None
    name:str
    rateOfInterest:float
    timeFrame:int
    riskLevel:str
    description:str
    status:str

    model_config=ConfigDict(from_attributes=True)