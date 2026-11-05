"""
models.py

This file defines the shape of the database tables using Python classes.
SQLAlchemy reads these classes and maps them to actual tables in MySQL.
Each attribute on the class represents a column. If you need to add, rename,
or remove a column from the savingsPlans table, this is the file to edit.
"""
from sqlalchemy import Column,Integer, String,Float
from database import Base

# ORM model mapping to the 'savingsPlans' table
class SavingsPlanTable(Base):

    __tablename__="savingsPlans"

    savingsPlanId = Column(Integer,primary_key=True,index=True)
    name = Column(String(100),nullable=False,unique=True)
    rateOfInterest=Column(Float)
    timeFrame =Column(Integer)
    riskLevel=Column(String(100))
    description=Column(String(100))
    status=Column(String(100))

