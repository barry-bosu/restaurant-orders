from sqlalchemy import Column, Integer, String
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer = Column(String(100), nullable=False)
    product = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)