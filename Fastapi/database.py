from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings


database_url = URL.create(
    drivername="mysql+pymysql",
    username="root",
    password=settings.MYSQL_PASSWORD,
    host="localhost",
    port=settings.PORT,
    database=settings.DATABASE
)


# Manage database connections
engine = create_engine(database_url)



# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for ORM models
Base = declarative_base()