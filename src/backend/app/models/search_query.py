from sqlalchemy import Column, BigInteger, String, Integer, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base

class SearchQuery(Base):
    __tablename__ = "search_queries"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, nullable=True)
    query_text = Column(String(512), index=True, nullable=False)
    category = Column(String(100), nullable=True)
    location = Column(String(150), nullable=True)
    results_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
