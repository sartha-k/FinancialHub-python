"""
routers/savingsplan.py

This file defines all the HTTP API endpoints for savings plans.
Think of it as the "front door" of the savings plan feature — when the Angular
app (or any HTTP client) wants to get, create, update, or delete a savings plan,
it sends a request to one of the routes defined here. Each route validates the
incoming request, calls the appropriate service function to do the real work,
and sends back a structured response.
"""
from fastapi import HTTPException,Depends,APIRouter
from dependencies.auth_dependency import get_current_user, require_roles
from database import  SessionLocal
from models import SavingsPlanTable, UserTable
from schemas import ApiResponse, PaginatedResponse, SavingPlanDetailResponse, SavingsPlan, SavingsPlanCreate, SavingsPlanResponse, SavingsPlanUpdate
from sqlalchemy.orm import Session
from fastapi import Query
from services import savings_plan_service
router = APIRouter(prefix="/api/savingsPlan")


# Yields a DB session per request and ensures it is closed after use
def get_db():
    #creating a new database session
    db = SessionLocal()
    try:
        #give the session to the fastapi
        yield db
    finally:
        #close the session when its work is finished
        db.close()


# GET /api/savingsPlan — returns a paginated, optionally filtered list of savings plans
@router.get("",response_model=ApiResponse[PaginatedResponse[SavingsPlanResponse]])
def get_all_savingsPlan(
    page:int =Query(default=0,ge=0),
    size:int = Query(default=5,ge=1,le=100),
    keyword:str|None = Query(default=None),
    db:Session=Depends(get_db),current_user: UserTable = Depends(get_current_user)):

    result= savings_plan_service.get_all_savingsPlan(page,size,keyword,db)
    return {
        "success":True,
        "message":"Savings plans fetched successfully",
        "data":result
    }

# GET /api/savingsPlan/{id} — returns a single savings plan or 404 if not found
@router.get("/{savingsPlanId}",response_model=ApiResponse[SavingsPlanResponse])
def get_savingsPlan_by_id(savingsPlanId:int,db:Session=Depends(get_db),current_user:UserTable=Depends(get_current_user)):
    row = savings_plan_service.get_savingsPlan_by_id(savingsPlanId,db)
    if not row:
        raise HTTPException(status_code=404,detail="Savings plan not found")
    return {
        "success":"true",
        "message":"Savings plan fetched found",
        "data":row
    }

# POST /api/savingsPlan — creates and returns a new savings plan
@router.post("",status_code=201)
def add_savings_plan(plan:SavingsPlanCreate,db:Session=Depends(get_db),current_user:UserTable=Depends(require_roles(["ADMIN","MANAGER"]))):

    return savings_plan_service.create_savings_Plan(db,plan)

# PUT /api/savingsPlan/{id} — fully replaces an existing savings plan
@router.put("/{savingsPlanId}")
def update_savings_plan(plan:SavingsPlan,savingsPlanId:int,db:Session=Depends(get_db)):
    return savings_plan_service.update_savings_plan(plan,savingsPlanId,db)
    
# PATCH /api/savingsPlan/{id} — partially updates only the provided fields
@router.patch("/{savingsPlanId}")
def patch_savings_plan(
    savingsPlanId: int,
    plan: SavingsPlanUpdate,
    db: Session = Depends(get_db),current_user:UserTable=Depends(require_roles(["ADMIN","MANAGER"]))
):
    row = savings_plan_service.patch_savings_plan(
        savingsPlanId,plan,db
    )
    if row is None:
        raise HTTPException(status_code=404,detail="Savings plan not found")
    return row

# DELETE /api/savingsPlan/{id} — deletes a savings plan or raises 404 if not found
@router.delete("/{savingsPlanId}")
def delete_savings_plan(savingsPlanId:int,db:Session=Depends(get_db),current_user:UserTable=Depends(require_roles(["ADMIN"]))):
    deleted = savings_plan_service.delete_savings_plan(savingsPlanId,db)
    if not deleted:
        raise HTTPException(status_code=404,detail="Savings plan is not existed")

    return {"details":"Savings plan deleted"}