from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagramRequest(BaseModel):
    history: list 

@app.post("/api/generate-diagram")
async def generate_diagram(request: DiagramRequest):
    system_prompt = """
    You are an expert system architect. Return ONLY a valid JSON object. 
    NO introduction, NO markdown, NO backticks.
    
    JSON STRUCTURE:
    {
      "nodes": [{"id": "1", "data": {"label": "Name"}, "style": {"backgroundColor": "color"}, "position": {"x":0, "y":0}}],
      "edges": [{"id": "e1-2", "source": "1", "target": "2", "label": "action", "animated": true}]
    }
    
    COLORS: Use the specific color requested by the user. If they say 'portocaliu', use 'orange' or '#ffa500'.
    """

    try:
        response = ollama.chat(model='llama3', messages=[{'role': 'system', 'content': system_prompt}] + request.history)
        raw_content = response['message']['content'].strip()
        
        # Extragem DOAR ce este între primele și ultimele acolade (Regex robust)
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        
        raise ValueError("AI didn't return a valid JSON block.")
    except Exception as e:
        print(f"Backend Error: {e}")
        # Returnăm o diagramă goală în caz de eroare, să nu crape frontend-ul
        return {"nodes": [], "edges": []}