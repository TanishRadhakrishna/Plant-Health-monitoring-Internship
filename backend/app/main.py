from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Leaf AI – Crop Health Analyzer",
    description="AI-powered leaf condition prediction (educational use only)",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Leaf AI backend is running 🌱"}

@app.get("/health")
def health_check():
    return {"status": "OK"}
