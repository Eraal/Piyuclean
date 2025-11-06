import os


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:admin@localhost:5432/piyuclean",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
