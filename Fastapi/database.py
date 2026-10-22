from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

sqlal_url = "mysql+pymysql://root:NewPassword123!@localhost:3306/fastapi_financehub"

engine = create_engine(sqlal_url)

SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)

Base = declarative_base()
