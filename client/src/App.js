import { Container, TextField } from "@mui/material";
import { useState } from "react";
import CustomDialog from "./components/CustomDialog";
import Game from "./Game";
import socket from "./socket"

function App() {
  const [username, setUsername] = useState("")
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)

  return (
    <Container>
      {/* This Dialogue is triggered by default when username is not yet submitted. inside handleContinue, if the username field is empty, it will do nothing, but when username is populated, it will emit a websocket event called "username" and will set the usernameSubmitted state to true */}
      <CustomDialog
        open={!usernameSubmitted}
        title="Enter your username"
        contentText="What are you calling yourself?"
        handleContinue={() => {
          if (!username) return
          socket.emit("username", username)
          setUsernameSubmitted(true)
        }}
      >
        {/* This is where user will input their name */}
        <TextField
          autoFocus
          margin="dense"
          label="username"
          id="username"
          name="username"
          value={username}
          type="text"
          variant="standard"
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
        />
      </CustomDialog>
      <Game />
    </Container>
  );
}

export default App;