import uuid
from enum import Enum

from fastapi import FastAPI
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Настраиваем CORS (если необходимо)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Указать разрешенные источники
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Хранилище сессий и сообщений
sessions = {}
messages_history = {}


class SenderKind(Enum, str):
    User = 'user'
    Assistant = 'assistant'


# Модель для сообщения
class Message:
    def __init__(self, message_type: str, sender: str, text: str):
        self.type = message_type
        self.sender = sender
        self.text = text

    def to_dict(self):
        return {
            "type": self.type,
            "from": self.sender,
            "text": self.text
        }


@app.websocket("/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = None

    try:
        while True:
            data = await websocket.receive_json()

            if data["method"] == "start_session":
                session_id = data["params"].get("session_id") or str(uuid.uuid4())
                sessions[session_id] = websocket
                if session_id not in messages_history:
                    messages_history[session_id] = []
                await websocket.send_json({"message": f"OK"})

            elif data["method"] == "get_messages":
                if session_id in messages_history:
                    await websocket.send_json({"messages": [msg.to_dict() for msg in messages_history[session_id]]})
                else:
                    await websocket.send_json({"messages": []})

            elif data["method"] == "send_message":
                message_text = data["params"]["text"]
                new_message = Message("message", "user", message_text)
                messages_history[session_id].append(new_message)

                if session_id in sessions:
                    await sessions[session_id].send_json({"update": new_message.to_dict()})

    except WebSocketDisconnect:
        if session_id and session_id in sessions:
            del sessions[session_id]
        print(f"Session {session_id} disconnected")
