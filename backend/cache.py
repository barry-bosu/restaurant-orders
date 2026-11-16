import os
import redis

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://redis:6379/0"
)

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=2,
    socket_timeout=2
)

CACHE_KEY = "restaurant:orders"


def get_cached_orders():
    try:
        return redis_client.get(CACHE_KEY)
    except redis.RedisError:
        return None


def set_cached_orders(data):
    try:
        redis_client.setex(CACHE_KEY, 60, data)
    except redis.RedisError:
        pass


def invalidate_orders_cache():
    try:
        redis_client.delete(CACHE_KEY)
    except redis.RedisError:
        pass