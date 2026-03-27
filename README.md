# Llama-Flow: Natural Language Diagramming 🧠⚡

A local-first architecture tool that transforms text descriptions into interactive, auto-layouted flowcharts. Powered by **Llama 3**, **FastAPI**, and **React Flow**.

---

## 📖 Overview

This project was born out of a simple frustration: manual diagramming is slow. **Llama-Flow** allows you to "talk" your architecture into existence. By combining the reasoning power of Llama 3 with the flexibility of React Flow, you can generate complex system designs in seconds, iterate on them via chat, and keep everything private on your local machine.

## ✨ Key Features

* **Natural Language to JSON:** Directly converts conversational prompts into structured React Flow data.
* **Auto-Layout Engine:** Uses `dagre` to automatically position nodes, ensuring zero overlap and a clean hierarchy.
* **Persistent Sessions:** Multiple chat sessions are saved to `localStorage`, allowing you to pick up where you left off.
* **Context-Aware Iteration:** The AI remembers previous steps—ask it to "change that blue node to red" or "add a database after the auth step."
* **Dark Mode UI:** A sleek, developer-centric interface designed for long sessions.
* **Privacy-Centric:** No external APIs or data logging. Everything stays on your hardware.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, @xyflow/react, Dagre, Axios |
| **Backend** | Python 3.9+, FastAPI, Uvicorn |
| **LLM** | Llama 3 (via Ollama) |
| **Styling** | Custom CSS / Dark Mode |

---

## ⚙️ Initial Setup

### 1. AI Engine (Ollama)
You need **Ollama** installed and running. [Download it here](https://ollama.com/).
Once installed, pull the model:
```bash
ollama pull llama3