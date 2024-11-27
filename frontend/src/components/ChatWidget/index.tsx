import { Box, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import styles from './ChatWidget.module.scss'
import { useEffect, useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { io } from 'socket.io-client'
import { v4 as uuidv4 } from "uuid"

const socket = io('ws://localhost:8080/assistant', {
  transports: ["websocket"],
})

type Message = {
  type: "message";
  from: "assistant" | "user";
  text: string;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [value, setValue] = useState<string>('')
  const sessionIdKey = "session_id"

  useEffect(() => {
    const storedSessionId = localStorage.getItem(sessionIdKey);
    const sessionId = storedSessionId || uuidv4();
    if (!storedSessionId) localStorage.setItem(sessionIdKey, sessionId)

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    })
    socket.emit("message", {
      method: "start_session",
      params: sessionId,
    })
    socket.emit("message", { method: "get_messages" })
    socket.on("message", (data: { messages?: Message[]; update?: Message }) => {
      if (data.messages) {
        // Если пришла история
        setMessages(data.messages);
      } else if (data.update) {
        // Если пришло новое сообщение
        setMessages((prev) => [...prev, data.update!]);
      }
    });

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleSendMessage = () => {
    if (!value.trim()) return;

    const newMessage: Message = {
      type: "message",
      from: "user",
      text: value.trim(),
    };

    // Отправляем сообщение на сервер
    socket.emit("message", {
      method: "send_message",
      params: { text: value },
    });

    // Добавляем сообщение пользователя локально
    setMessages((prev) => [...prev, newMessage]);
    setValue("");
  };

  console.log(messages)

  return (
    <div className={styles.widget}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default'
        }}
      >
        <Box
          sx={{
            width: 400,
            height: 500,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: '#FFFFFF',
              padding: 2
            }}
          >
            <Typography variant="h6">Ассистент</Typography>
          </Box>

          <List
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: 2,
            backgroundColor: "#FFFFFF",
          }}
        >
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent:
                  message.from === "assistant" ? "flex-start" : "flex-end",
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  padding: 1,
                  borderRadius: 1,
                  backgroundColor:
                    message.from === "assistant" ? "#E8EAF6" : "#BBDEFB",
                }}
              >
                <Typography variant="caption">
                  {message.from === "assistant" ? "Ассистент" : "Вы"}
                </Typography>
                <ListItemText primary={message.text} />
              </Box>
            </ListItem>
          ))}
        </List>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: 2,
              borderTop: '1px solid #E0E0E0'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Введите запрос.."
              value={value}
              onChange={e => setValue(e.target.value)}
              sx={{ marginRight: 1 }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!value.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
