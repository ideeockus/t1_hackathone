import { Box, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import styles from './ChatWidget.module.scss'
import { useEffect, useState, useRef } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { v4 as uuidv4 } from "uuid"

type Message = {
  type: "message";
  from: "assistant" | "user";
  text: string;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [value, setValue] = useState<string>('')
  const sessionIdKey = "session_id"
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem(sessionIdKey);
    const sessionId = storedSessionId || uuidv4();
    if (!storedSessionId) localStorage.setItem(sessionIdKey, sessionId)

    socketRef.current = new WebSocket('ws://localhost:8081/assistant');

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
      socketRef.current?.send(JSON.stringify({
        method: "start_session",
        params: { session_id: sessionId },
      }));
      socketRef.current?.send(JSON.stringify({ method: "get_messages" }));
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.messages) {
        // Если пришла история
        setMessages(data.messages);
      } else if (data.update) {
        // Если пришло новое сообщение
        assistantMessage : Message = {
          type: "message",
          from: "assistant",
          text: data.update!,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socketRef.current?.close();
    }
  }, []);

  const handleSendMessage = () => {
    if (!value.trim()) return;

    const newMessage: Message = {
      type: "message",
      from: "user",
      text: value.trim(),
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Отправляем сообщение на сервер
      socketRef.current.send(JSON.stringify({
        method: "send_message",
        params: { text: value },
      }));

//       // Добавляем сообщение пользователя локально
//       setMessages((prev) => [...prev, newMessage]);
      setValue("");
    } else {
      console.error("WebSocket connection is not open");
    }
  };

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
                  alignItems: "flex-start",
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
