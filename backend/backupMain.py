import os
from dotenv import load_dotenv
load_dotenv()
import json
import hashlib
from pathlib import Path
from typing import Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
import bcrypt as _bcrypt
from groq import Groq
from sentence_transformers import SentenceTransformer
import numpy as np
import pickle
import uvicorn

# ─── CONFIG ────────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-to-a-long-random-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key-here")
GROQ_MODEL = "llama-3.1-8b-instant"

ALLOWED_USERS = {
    "vinaynotbinay@gmail.com": {
        "hashed_password": "$2b$12$JN7.wJ/t6Mm0DghfqAlfke8eSW7QT3Hgb8TSxW1J5C0XJTt1QaSUq",
        "name": "vinay❤️"
    },
    "nehasahoo14@gmail.com": {
        "hashed_password": "$2b$12$Qm1DciqC.TfvxMJrJOlMEOQC07mjh..V9su4jXMx4fb6xnAOJiira",
        "name": "The Birthday Girl - NEHA🎂"
    }
}

KNOWLEDGE_BASE_PATH = Path("../knowledge-base/about_her.txt")
EMBEDDINGS_CACHE = Path("embeddings_cache.pkl")

LETTER_TRIGGERS = {
    "show my letter", "letter from vinay", "read my letter",
    "vinay's letter", "open my letter", "vinay letter", "my letter"
}

def extract_letter() -> str:
    """Pull the letter content from the knowledge base file."""
    if not KNOWLEDGE_BASE_PATH.exists():
        return ""
    text = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
    marker = "## LETTER_FROM_VINAY"
    if marker not in text:
        return ""
    after = text.split(marker, 1)[1]
    lines = after.strip().splitlines()
    content_lines = [l for l in lines if not l.startswith("[TRIGGER")]
    return "\n".join(content_lines).strip()

# ─── APP SETUP ─────────────────────────────────────────────────────────────────

app = FastAPI(title="Birthday Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = None  # replaced by direct bcrypt below
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
groq_client = Groq(api_key=GROQ_API_KEY)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ─── MODELS ────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []

# ─── AUTH ──────────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def authenticate_user(email: str, password: str):
    user = ALLOWED_USERS.get(email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return {"email": email, "name": user["name"]}

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None or email not in ALLOWED_USERS:
            raise credentials_exception
        return {"email": email, "name": ALLOWED_USERS[email]["name"]}
    except JWTError:
        raise credentials_exception

# ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = 120, overlap: int = 30) -> list[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return [c for c in chunks if len(c.strip()) > 50]

def load_knowledge_base():
    """Load and embed the knowledge base, with caching."""
    if EMBEDDINGS_CACHE.exists():
        with open(EMBEDDINGS_CACHE, "rb") as f:
            return pickle.load(f)

    if not KNOWLEDGE_BASE_PATH.exists():
        raise FileNotFoundError(f"Knowledge base not found at {KNOWLEDGE_BASE_PATH}")

    text = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
    chunks = chunk_text(text)
    embeddings = embedder.encode(chunks, show_progress_bar=True)

    kb = {"chunks": chunks, "embeddings": embeddings}
    with open(EMBEDDINGS_CACHE, "wb") as f:
        pickle.dump(kb, f)

    return kb

def retrieve_context(question: str, kb: dict, top_k: int = 6) -> list[str]:
    """Find most relevant chunks via cosine similarity."""
    q_emb = embedder.encode([question])[0]
    scores = np.dot(kb["embeddings"], q_emb) / (
        np.linalg.norm(kb["embeddings"], axis=1) * np.linalg.norm(q_emb) + 1e-8
    )
    top_indices = np.argsort(scores)[-top_k:][::-1]
    return [kb["chunks"][i] for i in top_indices if scores[i] > 0.1]

# ─── GLOBAL STATE ──────────────────────────────────────────────────────────────

knowledge_base = None

@app.on_event("startup")
async def startup_event():
    global knowledge_base
    try:
        knowledge_base = load_knowledge_base()
        print(f"✅ Knowledge base loaded: {len(knowledge_base['chunks'])} chunks")
    except Exception as e:
        print(f"⚠️  Could not load knowledge base: {e}")

# ─── ROUTES ────────────────────────────────────────────────────────────────────

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer", "user_name": user["name"]}

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user=Depends(get_current_user)):
    if knowledge_base is None:
        raise HTTPException(status_code=500, detail="Knowledge base not loaded")

    # ── Letter trigger — bypass RAG entirely ──────────────────────────────────
    if req.message.strip().lower() in LETTER_TRIGGERS:
        letter = extract_letter()
        if letter:
            return ChatResponse(answer=letter, sources=[])
        return ChatResponse(answer="Vinay's letter is on its way — check back soon 💕", sources=[])

    context_chunks = retrieve_context(req.message, knowledge_base)
    context = "\n\n---\n\n".join(context_chunks) if context_chunks else "No specific context found."

    system_prompt = """You are a loving AI companion built by Vinay as a birthday gift for Neha.

STRICT RULE — THE MOST IMPORTANT ONE:
You ONLY answer using the context provided below. If the answer is not in the context, say exactly:
"Vinay hasn't told me that part of your story yet — but I know he's saving the best details just for you 💕"
DO NOT invent places, events, food, trips, or memories. DO NOT guess. DO NOT fill gaps creatively.
If the context says they went to a mall — say mall. Do not add Victoria Memorial, temples, street food, or anything not explicitly in the context.

Your tone: warm, loving, specific, real. Never generic.

Your second most important job: make Neha feel confident, seen, and celebrated.
She is going through a tough phase — a work setback shook her confidence temporarily.
Weave in reminders of her strength naturally — she managed GDSC, GTAC, placements and a full academic year simultaneously. That woman is still here.

Other rules:
- Use her real nicknames, real memories, real achievements from the context
- Light emojis, heartfelt but concise
- Never make anything up. Ever."""

    messages = [{"role": "system", "content": f"{system_prompt}\n\nContext about her:\n{context}"}]

    # Add conversation history (last 8 turns max)
    for msg in req.history[-8:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": req.message})

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=600,
    )

    answer = response.choices[0].message.content
    return ChatResponse(answer=answer, sources=[])

class LetterResponse(BaseModel):
    letter: str

@app.post("/letter", response_model=LetterResponse)
async def get_letter(user=Depends(get_current_user)):
    """Return Vinay's letter verbatim — no AI, no changes."""
    letter = extract_letter()
    if not letter:
        raise HTTPException(status_code=404, detail="Letter not found in knowledge base")
    return LetterResponse(letter=letter)

@app.get("/health")
async def health():
    return {"status": "ok", "kb_loaded": knowledge_base is not None}

@app.post("/reload-kb")
async def reload_kb(user=Depends(get_current_user)):
    """Force reload the knowledge base (after updating the file)."""
    global knowledge_base
    if EMBEDDINGS_CACHE.exists():
        EMBEDDINGS_CACHE.unlink()
    knowledge_base = load_knowledge_base()
    return {"message": f"Knowledge base reloaded: {len(knowledge_base['chunks'])} chunks"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)