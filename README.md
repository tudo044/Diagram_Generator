Llama-Diagram-Generator 🗂️
A local, privacy-focused tool that transforms natural language descriptions into structured, interactive flowcharts. Built with FastAPI, React Flow, and Llama 3 (via Ollama).

Why I built this
Standard diagramming tools require manual dragging and dropping. I wanted a way to simply "describe" a system or a logic flow and have it rendered instantly. By running Llama 3 locally, the data never leaves your machine, making it ideal for sensitive architecture planning.

🚀 Features
Natural Language to JSON: Uses Llama 3 to interpret logic and output React Flow compatible data.

Auto-Layout: Integrated with dagre to ensure nodes are never overlapping.

Persistent Sessions: Multiple chat threads saved to localStorage.

Dynamic Styling: Change colors or shapes by simply asking the AI.

Local-First: No API keys required. Everything runs on your hardware.

🛠️ Tech Stack
Frontend: React, React Flow (XYFlow), Dagre (layout engine), Axios.

Backend: Python, FastAPI, Uvicorn.

AI Engine: Ollama running Llama 3.

⚙️ Initial Setup
1. Prerequisites
Node.js (v18+)

Python (3.9+)

Ollama: Download here

2. Local AI Setup
Once Ollama is installed, pull the Llama 3 model:

Bash
ollama pull llama3
3. Backend Setup
Navigate to the backend folder:

Bash
cd backend
pip install fastapi uvicorn ollama pydantic
# Run the server
python -m uvicorn main:app --reload
4. Frontend Setup
Navigate to the frontend folder:

Bash
cd frontend
npm install

# Run the development server
npm run dev
📖 How to use
Open your browser at http://localhost:5173.

Start a New Project.

Type a description like: "Create a login flow: User enters email -> Check if exists -> If no, go to Register. If yes, go to Password."

Use the chat to iterate: "Make the Register node green" or "Add a step for 2FA."

🗺️ Roadmap
[ ] Export diagrams as PNG/SVG.

[ ] Add support for custom node types (Database, Cloud icons).

[ ] Drag-and-drop manual editing that syncs back to AI context.