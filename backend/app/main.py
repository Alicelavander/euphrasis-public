from fastapi import FastAPI
from app.routers import router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

origins = [
    "http://localhost",
    "http://localhost:5173", #なんかポートまで指定しないとはじかれる
    "http://127.0.0.1"
]

app = FastAPI()
app.include_router(router, prefix="", tags=[""])

@app.exception_handler(RequestValidationError)
async def handler(request:Request, exc:RequestValidationError):
    print(exc)
    return JSONResponse(content={}, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)