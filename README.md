# VectorShift Pipeline Builder

This project is a full-stack web application designed for the VectorShift Frontend Technical Assessment. It provides a drag-and-drop canvas interface to build and manage pipelines composed of various nodes, which are parsed and processed by a FastAPI backend.

## Architecture

- **Frontend:** Built with React, utilizing [React Flow](https://reactflow.dev/) for the node-based interactive canvas, [Zustand](https://github.com/pmndrs/zustand) for global state management, and Tailwind CSS for modern styling.
- **Backend:** A highly concurrent FastAPI server that parses the pipeline structure (calculating nodes, edges, and checking for Directed Acyclic Graphs (DAGs) using Kahn's algorithm) and provides an execution endpoint with optional live LLM integration (via Groq).

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+

## How to Run

### Option 1: Using the Launcher Script (Linux/macOS/Git Bash)
You can run both the frontend and backend simultaneously using the provided convenience script:
```bash
bash ./run.sh
```
*Note: On Windows, ensure you execute this script using Git Bash.*

### Option 2: Running Manually

**Backend:**
1. Navigate to the `backend` folder: `cd backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Run the FastAPI development server: `uvicorn main:app --reload --port 8000`
5. The backend will be available at `http://localhost:8000` (API documentation at `/docs`).

**Frontend:**
1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the React development server: `npm start`
4. The frontend will automatically open at `http://localhost:3000`.

## Features
- **Interactive Canvas:** Easily drag and drop nodes, connect endpoints, and configure variables dynamically.
- **DAG Validation:** The backend automatically ensures that your pipeline components form a Directed Acyclic Graph (DAG) before execution.
- **LLM Node Support:** Execute Large Language Model completion nodes on the fly.

## Environment Configuration
To enable the optional `/pipelines/run` endpoint for the LLM node, create a `.env` file inside the `backend` directory (a `.env.example` is provided) containing your API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```
