import os
import typing as t
import uuid
from enum import Enum

import httpx
from fastapi import FastAPI
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI

app = FastAPI()

# Настраиваем CORS (если необходимо)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Указать разрешенные источники
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_aclient = AsyncOpenAI(
    api_key="",
    base_url="https://openrouter.ai/api/v1",

    # api_key="",
    # base_url="https://d.dgx:8001/v1",

    # http_client=httpx.AsyncClient(proxy='socks5://localhost:8077'),
)


class Role(Enum):
    System = 'system'
    User = 'user'
    Assistant = 'assistant'


# Модель для сообщения
class Message:
    def __init__(self, message_type: str, sender: Role, text: str):
        self.type = message_type
        self.sender = sender
        self.text = text

    def to_dict(self):
        return {
            "type": self.type,
            "from": str(self.sender),
            "text": self.text
        }


# Хранилище сессий и сообщений
sessions = {}
messages_history: t.Dict[str, list[Message]] = {}


def convert_messages_to_openai_format(messages: list[Message]) -> list[dict]:
    openai_messages = []
    for message in messages:
        openai_messages.append({
            "role": message.sender.value,
            "content": message.text
        })
    return openai_messages


async def get_gpt_response(messages: list[Message]) -> str:
    try:
        response_big = await openai_aclient.chat.completions.create(
            model="gpt-3.5-turbo",
            # model="/model",
            messages=[
                {"role": "system", "content": "Ты база знаний магазина цветов"},
                *convert_messages_to_openai_format(messages),
            ]
        )
        print(response_big)
        return response_big.choices[0].message.content
    except Exception as e:
        print(f"Error communicating with OpenAI: {e}")
        return "Sorry, I couldn't process your request right now."


@app.websocket("/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = None

    try:
        while True:
            data = await websocket.receive_json()

            print(data)
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
                new_message = Message("message", Role.User, message_text)
                messages_history[session_id].append(new_message)

                if session_id in sessions:
                    await sessions[session_id].send_json({"update": new_message.to_dict()})

                # assistant response
                messages = messages_history[session_id]
                assistant_response = await get_gpt_response(messages)
                assistant_message = Message("message", Role.Assistant, assistant_response)
                messages_history[session_id].append(assistant_message)
                await sessions[session_id].send_json({"update": assistant_message.to_dict()})

    except WebSocketDisconnect:
        if session_id and session_id in sessions:
            del sessions[session_id]
        print(f"Session {session_id} disconnected")
