from fastapi import HTTPException,Depends,APIRouter
from database import  SessionLocal
from models import SavingsPlanTable
from schemas import SavingsPlan
from sqlalchemy.orm import Session
from fastapi import Query
from services import savings_plan_service
router = APIRouter(prefix="/api/savingsPlan")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_all_savingsPlan(
    page:int =Query(default=0,ge=0),
    size:int = Query(default=5,ge=1,le=100),
    keyword:str|None = Query(default=None),
    db:Session=Depends(get_db)):

    return savings_plan_service.get_all_savingsPlan(page,size,keyword,db)
        

@router.get("/{savingsPlanId}")
def get_savingsPlan_by_id(savingsPlanId:int,db:Session=Depends(get_db)):
    row = savings_plan_service.get_savingsPlan_by_id(savingsPlanId,db)
    if not row:
        raise HTTPException(status_code=404,detail="Savings plan not found")
    return row

@router.post("",status_code=201)
def add_savings_plan(plan:SavingsPlan,db:Session=Depends(get_db)):
    return savings_plan_service.create_savings_Plan(db,plan)

@router.put("/{savingsPlanId}")
def update_savings_plan(plan:SavingsPlan,savingsPlanId:int,db:Session=Depends(get_db)):
    return savings_plan_service.update_savings_plan(plan,savingsPlanId,db)
    
    

@router.delete("/{savingsPlanId}")
def delete_savings_plan(savingsPlanId:int,db:Session=Depends(get_db)):
    deleted = savings_plan_service.delete_savings_plan(savingsPlanId,db)
    if not deleted:
        raise HTTPException(status_code=404,detail="Savings plan is not existed")

    return {"details":"Savings plan deleted"}