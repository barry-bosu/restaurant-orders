from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import Order

import json
from fastapi.encoders import jsonable_encoder

from cache import (
    get_cached_orders,
    set_cached_orders,
    invalidate_orders_cache
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Restaurant Orders API",
    lifespan=lifespan
)


class OrderCreate(BaseModel):
    customer: str = Field(min_length=1, max_length=100)
    product: str = Field(min_length=1, max_length=100)
    quantity: int = Field(gt=0)


class OrderResponse(OrderCreate):
    id: int

    model_config = {"from_attributes": True}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Restaurant Orders API funcionando"}


@app.get("/orders", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    cached = get_cached_orders()

    if cached is not None:
        return json.loads(cached)

    orders = db.query(Order).order_by(Order.id).all()

    data = jsonable_encoder(
        [OrderResponse.model_validate(order) for order in orders]
    )

    set_cached_orders(json.dumps(data))

    return data


@app.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    new_order = Order(**order.model_dump())

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    invalidate_orders_cache()

    return new_order

@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    return order