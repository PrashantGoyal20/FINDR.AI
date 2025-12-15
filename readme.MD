# Findr

Findr is a full‑stack lost & found service. The backend is a Flask app that stores users and items, encodes images + text into embeddings, and indexes vectors in Qdrant. The frontend is a Next.js client.

Quick pointers
- Backend main app: [Server/App/app.py](Server/App/app.py)  
- Database models: [`App.models`](Server/App/models.py) — see symbols [`App.models.db`](Server/App/models.py), [`App.models.User`](Server/App/models.py), [`App.models.LostItem`](Server/App/models.py), [`App.models.FoundItem`](Server/App/models.py)  
- Embedding encoder used by the backend: [`src.training.encode_img_and_text`](src/training.py)  
- Server dependencies: [Server/requirements.txt](Server/requirements.txt)  
- Client package: [client/package.json](client/package.json)  
- Project ignore rules: [.gitignore](.gitignore)  
- Data & model folders: [datasets/](datasets/) and [model/](model/)

Requirements
- Python 3.8+ (recommended)  
- Node 16+ for the client  
- Qdrant instance (cloud or local)  
- Cloudinary account for image uploads

Environment
- Copy and populate [Server/.env](Server/.env) with required secrets (DATABASE_URL, JWT keys, Qdrant URL/API key, Cloudinary keys, CLIENT origin, etc.).

Backend — run locally
1. Create a virtual environment and install deps:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r Server/requirements.txt
   ```
2. Ensure [Server/.env](Server/.env) is populated.
3. Start the Flask server:
   ```bash
   cd ./Server
   python -m App.app
   ```
   The app file with the HTTP endpoints is [Server/App/app.py](Server/App/app.py). Endpoints include:
   - POST /register
   - POST /login
   - GET /logout
   - GET /get_user
   - POST /lostItem
   - POST /foundItem
   - GET /allLostItems
   - GET /allFoundItems

Frontend — run locally
1. From the repository root:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   See [client/package.json](client/package.json) for scripts.

Notes
- The backend uses the encoder [`src.training.encode_img_and_text`](src/training.py) to produce 512-d vectors and upserts to Qdrant collections `lost_items` and `found_items` in [Server/App/app.py](Server/App/app.py).
- Database tables are created at app startup via [`App.models.db`](Server/App/models.py) initialization in [Server/App/app.py](Server/App/app.py).
- Image uploads are sent to Cloudinary (configured in [Server/App/app.py](Server/App/app.py)).

Project layout (important files/dirs)
- [Server/App/app.py](Server/App/app.py) — Flask app and API routes  
- [Server/App/models.py](Server/App/models.py) — SQLAlchemy models & DB init  
- [Server/requirements.txt](Server/requirements.txt) — Python deps  
- [Server/.env](Server/.env) — environment variables (not committed)  
- [client/](client/) — Next.js frontend ([client/package.json](client/package.json))  
- [datasets/](datasets/) — data used for training / evaluation  
- [model/](model/) — model artifacts

Contributing
- Open an issue or PR with changes.
- Run the backend and client locally to verify behavior.

