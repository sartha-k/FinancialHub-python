from sqlalchemy.orm import Session
from models import SavingsPlanTable
from math import ceil
from schemas import SavingsPlan
from fastapi import HTTPException
def get_all_savingsPlan(
    page:int,
    size:int,
    keyword:str|None,
    db:Session):

    offset = page*size

    query = db.query(SavingsPlanTable)

    if keyword:
        query = query.filter((SavingsPlanTable.name).ilike(f"%{keyword}"))

    total_records = query.count()

    plans = (
        query.order_by(SavingsPlanTable.savingsPlanId).offset(offset).limit(size).all()
    )
    return {
        "content":plans,
        "page":page,
        "size":size,
        "totalElements":total_records,
        "totalPages":ceil(total_records/size)
    }

def create_savings_Plan(db:Session,Plan:SavingsPlan):
    row = SavingsPlanTable(**Plan.model_dump(exclude={"SavingsPlanId"}))

    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_savingsPlan_by_id(savingsPlanId:int,db:Session):
    row = db.query(SavingsPlanTable).filter(SavingsPlanTable.savingsPlanId==savingsPlanId).first()

    return row


def update_savings_plan(plan:SavingsPlan,savingsPlanId:int,db:Session):
    row = db.query(SavingsPlanTable).filter(SavingsPlanTable.savingsPlanId==savingsPlanId).first()
    if not row:
        raise HTTPException(status_code=404,detail="Savings Plan not found")

    data = plan.model_dump(exclude={"savingsPlanId"})

    for key, value in data.items():
        setattr(row,key,value)

        db.commit()
        db.refresh(row)
    
    return row

def delete_savings_plan(savingsPlanId:int,db:Session):
    row = db.query(SavingsPlanTable).filter(SavingsPlanTable.savingsPlanId==savingsPlanId).first()
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True