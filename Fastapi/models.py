from sqlalchemy import Column,Integer, String,Float
from database import Base

class SavingsPlanTable(Base):

    __tablename__="savingsPlans"

    savingsPlanId = Column(Integer,primary_key=True,index=True)
    name = Column(String(100))
    rateOfInterest=Column(Float)
    timeFrame =Column(Integer)
    riskLevel=Column(String(100))
    description=Column(String(100))
    status=Column(String(100))

