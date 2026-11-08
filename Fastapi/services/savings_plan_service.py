"""
services/savings_plan_service.py

This file contains all the business logic for savings plans.
It sits between the router (which handles HTTP) and the database (which stores data).
Whenever a route needs to fetch, create, update, or delete a savings plan, it calls
a function here. This keeps the database queries and logic in one place, making the
code easier to maintain and test.
"""
from sqlalchemy.orm import Session
from models import SavingsPlanTable
from math import ceil
from schemas import SavingsPlan
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError,SQLAlchemyError
import logging

#Create a logger for the current Python module
logger = logging.getLogger(__name__)

# Returns a paginated list of savings plans, with optional keyword filtering on plan name
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

# Creates a new savings plan record in the database and returns the created row
def create_savings_Plan(db:Session,Plan:SavingsPlan):
    # Record that the operation has started
    logger.info("Creating savings Plan: %s", Plan.name)
    # Step 1: Convert validated Pydantic data
    # into a SQLAlchemy ORM object.
    row = SavingsPlanTable(**Plan.model_dump(exclude={"SavingsPlanId"}))
    try:
        # Step 2: Register the new object
        # with the SQLAlchemy session.
        db.add(row)
        #Step 3: Commit the transaction.
        # SQLAlchemy flushes the INSERT before committing.
        db.commit()
        # Step 4: Reload the saved record.
        # This can retrieve database-generated values,
        # such as an auto-incremented ID.
        db.refresh(row)
        # Step 5: Return the saved ORM object.
        

     # Record successful creation
        logger.info(
            "Savings plan created successfully. ID: %s",
            row.savingsPlanId
        )
        return row
    
    except IntegrityError:
        # Step 6: Undo any uncommitted database changes
        # and reset the failed transaction state.
        db.rollback()

        # Record the duplicate/conflict error
        logger.warning(
            "Savings plan creation failed due to integrity constraint"
        )
        logger.exception("Failed to insert savings plan")
        # Step 7: Pass the original error upward
        # so the API can handle it appropriately.
        raise HTTPException(
            status_code=409,
            detail="Savings Plan conflicts with an existing record"
        )
    except SQLAlchemyError:
        # Undo any uncommitted database changes
        db.rollback()
        logger.error("Unexpected error occurred while creating savings plan")   
        # Hide internal database details from the client
        raise HTTPException(
            status_code=500,
            detail="Database operation failed"
        )


# Fetches a single savings plan by its ID, returns None if not found
def get_savingsPlan_by_id(savingsPlanId:int,db:Session):
    row = db.query(SavingsPlanTable).filter(SavingsPlanTable.savingsPlanId==savingsPlanId).first()

    return row


# Fully replaces all fields of an existing savings plan; raises 404 if not found
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

# Partially updates only the provided fields of a savings plan; returns None if not found
def patch_savings_plan(savingsPlanId, plan, db):
      # 1. Fetch ORM object
    row = db.query(SavingsPlanTable).filter(SavingsPlanTable.savingsPlanId==savingsPlanId).first()
    if row is None:
        return None
     # 2. Extract provided fields from Pydantic
    update_data = plan.model_dump(
        exclude_unset = True,
        exclude_none = True
    )
      # 3. Modify ORM object
    for key,value in update_data.items():
        setattr(row,key,value)
    # 4. Save changes
    db.commit()
     # 5. Reload updated values
    db.refresh(row)

    return row



# Deletes a savings plan by ID; returns True on success, False if not found
def delete_savings_plan(savingsPlanId:int,db:Session):
    row = db.query(SavingsPlanTable).filter(SavingsPlanTable.savingsPlanId==savingsPlanId).first()
    logger.info("Attempting to delete savings plan with ID: %s", savingsPlanId)
    if not row:
        logger.warning("Savings plan with ID %s not found for deletion", savingsPlanId)
        return False
    db.delete(row)
    db.commit()
    return True