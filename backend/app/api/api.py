from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil

from app.services.data_loader import data_loader
from app.services.search_service import search_service
from app.services.voice_service import voice_service
from app.services.image_service import image_service
from app.services.navigation_service import navigation_service
from app.core.config import settings

router = APIRouter()

# --- Models ---
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    source: str # 'local', 'online', 'combined'
    images: List[str] = []

class ProductSearchResponse(BaseModel):
    query: str
    results: List[dict]

class LineInfoResponse(BaseModel):
    line_name: str
    items_sold: List[str]
    layout: dict
    image_url: Optional[str]

class NavigateResponse(BaseModel):
    line_name: str
    directions: str
    layout: dict

@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Answer general questions using local history, market data, and online search.
    """
    question = request.question.lower()
    
    # 1. Check local data (simple keyword match for now)
    local_context = ""
    local_answer_parts = []
    found_images = []
    
    # Check history
    if "history" in question or "built" in question or "old" in question:
        history_snippet = data_loader.get_history()[:500]
        if history_snippet:
            local_context += f"History Context: {history_snippet}... "
            local_answer_parts.append(f"According to market history: {history_snippet[:200]}...")
    
    # Check lines/products
    products = data_loader.search_products(question)
    if products:
        # Deduplicate line names
        line_names = sorted(list(set([p['line_name'] for p in products])))
        product_info = f"Found '{question}' in the following lines: {', '.join(line_names)}."
        local_context += product_info + " "
        local_answer_parts.append(product_info)
        
        # Find images for these lines
        if os.path.exists(settings.IMAGES_DIR):
            all_images = os.listdir(settings.IMAGES_DIR)
            for line_name in line_names:
                # Find matching image (case-insensitive)
                for img_file in all_images:
                    if img_file.lower().startswith(line_name.lower()):
                        found_images.append(f"/images/{img_file}")
                        break

    # 2. Construct Answer
    # If we have a strong local answer (products found), prioritize it.
    if local_answer_parts:
        full_local_answer = " ".join(local_answer_parts)
        return AskResponse(
            answer=full_local_answer,
            source="local",
            images=found_images
        )

    # 3. Use Tavily for comprehensive answer if no local data found
    search_query = f"{question}. Context: {local_context}" if local_context else question
    answer = search_service.search(search_query)
    
    return AskResponse(
        answer=answer,
        source="online" if not local_context else "combined",
        images=[]
    )

@router.get("/product/search", response_model=ProductSearchResponse)
async def search_product(q: str = Query(..., description="Product name to search for")):
    results = data_loader.search_products(q)
    return ProductSearchResponse(query=q, results=results)

@router.get("/line/info/{line_name}", response_model=LineInfoResponse)
async def get_line_info(line_name: str):
    line = data_loader.get_line_by_name(line_name)
    if not line:
        raise HTTPException(status_code=404, detail="Line not found")
    
    # Construct image URL
    # Assuming images are served at /images/{Line Name}.jpg
    # We need to find the matching file since extension/casing might vary
    image_filename = None
    if os.path.exists(settings.IMAGES_DIR):
        for f in os.listdir(settings.IMAGES_DIR):
            if f.lower().startswith(line_name.lower()):
                image_filename = f
                break
    
    image_url = f"/images/{image_filename}" if image_filename else None

    return LineInfoResponse(
        line_name=line["line_name"],
        items_sold=line["items_sold"],
        layout=line["layout"],
        image_url=image_url
    )

@router.get("/history")
async def get_history():
    history = data_loader.get_history()
    return {"history": history}

@router.post("/voice/query")
async def voice_query(file: UploadFile = File(...)):
    # Save temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # STT
    text = voice_service.speech_to_text(temp_path)
    
    # Cleanup input
    os.remove(temp_path)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not understand audio")

    # Process as a question (reuse logic or just return text)
    # For this endpoint, let's return the text and a spoken response to a simple search
    
    # Search for products
    products = data_loader.search_products(text)
    if products:
        response_text = f"I found {text} in {len(products)} lines: {', '.join([p['line_name'] for p in products[:3]])}"
    else:
        # Fallback to general search
        response_text = search_service.search(text)

    # TTS
    audio_response_path = voice_service.text_to_speech(response_text)
    
    return FileResponse(audio_response_path, media_type="audio/mpeg", filename="response.mp3")

@router.post("/image/identify")
async def identify_image(file: UploadFile = File(...)):
    contents = await file.read()
    result = image_service.identify_product(contents)
    return result

@router.get("/navigate", response_model=NavigateResponse)
async def navigate(line_name: str = Query(..., description="Target line name")):
    result = navigation_service.get_directions(line_name)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return NavigateResponse(**result)
