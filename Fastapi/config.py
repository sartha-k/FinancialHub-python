from pydantic_settings import BaseSettings, SettingsConfigDict

# Loads and validates application configuration from environment settings.
class Settings(BaseSettings):
    MYSQL_PASSWORD:str
    DATABASE: str

    PORT:int = 3306

    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTE: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()