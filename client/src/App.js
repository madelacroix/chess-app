import { Container, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import CustomDialog from "./components/CustomDialog";
import Game from "./Game";
import InitGame from "./InitGame";
import socket from "./socket"

function App() {
  const [username, setUsername] = useState("")
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)

  // room state stores the current room id, players store the number of players in a room (hence the array) orientation stores the board orientation for the user (whether they're black or white). these states are initialised when initgame is called. they are passed through to initialise the game.
  const [room, setRoom] = useState("")
  const [orientation, setOrientation] = useState("")
  const [players, setPlayers] = useState([])

  // cleanup will reset states above so that a new game can be initialised. this variable is passed through on the Games tag, and it will be called inside the if statement when the game is over.
  const cleanup = useCallback(() => {
    setRoom("")
    setOrientation("")
    setPlayers("")
  }, [])

  // this hook is a listener for the opponentJoined event, which is what the server will be emitting when an opponent has joined a room that the user created. this event takes with it the room data, including the info the player that has just joined.
  useEffect(() => {
    socket.on("opponentJoined", (roomData) => {
      console.log("roomData", roomData)
      setPlayers(roomData.players)
    })
  }, [])

  return (
    <Container>
      {/* This Dialogue is triggered by default when username is not yet submitted. inside handleContinue, if the username field is empty, it will do nothing, but when username is populated, it will emit a websocket event called "username" and will set the usernameSubmitted state to true */}
      <CustomDialog
        open={!usernameSubmitted}
        title="Enter your username"
        contentText="What are you calling yourself?"
        handleClose={() => setUsernameSubmitted(true)}
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
      {/* below is an if statement to only initialise or continue a game when a room ID is valid. so if room === true, Game component will be rendered, but if an existing game is invalid, it will create a new game through InitGame. That then receives/initialises three functions and those will be used to update the room, orientation and players states when a game is started */}
      {room ? (
        <Game 
          room={room}
          orientation={orientation}
          username={username}
          players={players}
          cleanup={cleanup}
        />
      ) : (
        <InitGame
          setRoom={setRoom}
          setOrientation={setOrientation}
          setPlayers={setPlayers}
        />
      )}
    </Container>
  );
}

export default App;