from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    gemini_api_key: str
    allowed_origins: str = "http://localhost:5173"
    access_token_expire_minutes: int = 1440  # 24 hours
    algorithm: str = "HS256"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
