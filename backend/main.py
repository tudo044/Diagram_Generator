from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagramRequest(BaseModel):
    prompt: str

@app.post("/api/generate-diagram")
async def generate_diagram(request: DiagramRequest):
    # ATENȚIE: Tot ce e mai jos are un TAB în față!
    system_prompt = """
    You are an expert system architect and a React Flow JSON generator.
    Convert the user's description into a React Flow JSON object. ONLY return valid JSON.
    Use x:0, y:0 for all positions.

    Format required:
    {
      "nodes": [
        {
          "id": "1",
          "position": {"x": 0, "y": 0}, 
          "data": {"label": "Node Name"},
          "style": {"backgroundColor": "#4285F4", "color": "white", "borderRadius": "8px"}
        }
      ],
      "edges": [
        {"id": "e1-2", "source": "1", "target": "2", "label": "connection", "type": "smoothstep", "animated": true}
      ]
    }
    """

    try:
        response = ollama.chat(model='llama3', messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': request.prompt}
        ])

        raw_content = response['message']['content']
        start_idx = raw_content.find('{')
        end_idx = raw_content.rfind('}')

        if start_idx != -1 and end_idx != -1:
            json_str = raw_content[start_idx:end_idx+1]
            return json.loads(json_str)
        else:
            raise ValueError("Llama 3 nu a returnat JSON valid.")

    except Exception as e:
        print(f"Eroare: {e}")
        raise HTTPException(status_code=500, detail=str(e))