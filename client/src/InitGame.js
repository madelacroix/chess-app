/* created this page so that a game can have a "room" with two players. this component will initialise a game and allow users to join or start a game. hope to also have messaging enabled in the rooms */

import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import CustomDialog from "./components/CustomDialog";
import socket from "./socket";

export default function InitGame({ setRoom, setOrientation, setPlayers }) {

    /* roomDialogOpen is a boolean for the open variable of the CustomDialog component. if it is set to true, it will appear on screen, meaning there is no active game room open at them. inside that dialog, the user will be able to enter the ID of the room they'd like to join. roomInput stores the value of whatever the user puts in the textfield for the room ID. roomError keeps track of whatever error comes up when the user tries to enter a room */
    const [roomDialogOpen, setRoomDialogOpen] = useState(false)
    const [roomInput, setRoomInput] = useState("")
    const [roomError, setRoomError] = useState("")

    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ py: 1, height: "100vh" }}
        >

            {/* so that a user can join rooms, client has to emit a socket called "joinRoom" that will be handled by server(server will be listening for this). user will input the number of the room that they want to join. this data will be stored in the handleContinue event data. so when user clicks on the "continue" button on the dialogue, "joinRoom" will be emitted. then it checks the validity of roomId to what was put inside the roomInput state. it then takes the response from server and, if no errors are returned, it sets the room and players into its respective state as the data that was gathered from the callback. the orientation is also set to black, because if user is joining room, it means that they didn't create it, so they will be black by default. */}
            <CustomDialog
                open={roomDialogOpen}
                handleClose={() => setRoomDialogOpen(false)}
                title="Select room to join"
                contentText="Enter a valid Room ID to join a room"
                handleContinue={() => {
                    if (!roomInput) return;
                    socket.emit("joinRoom", { roomId: roomInput }, (r) => {
                        if (r.error) return setRoomError(r.message)
                        console.log("response:", r)

                        setRoom(r?.roomId)
                        setPlayers(r?.players)
                        setOrientation("black")
                        setRoomDialogOpen(false)
                    })
                }}
            >
                <TextField
                    margin="dense"
                    id="room"
                    label="Room ID"
                    name="room"
                    variant="standard"
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    error={Boolean(roomError)}
                    helperText={!roomError ? "Enter a room ID" : `Invalid room ID: ${roomError}`}
                    autoFocus
                    required
                    fullWidth
                />
            </CustomDialog>

            {/* button for starting game. when user clicks, it triggers websocket, which will "emit" an event called createRoom. in the server side, i will have to create something to listen for this event and create a new room. when createRoom is emitted, a callback function is also triggered client-side, which will take the value of the roomID that server provides and puts in inside "r". so value of "r" is going to be the room ID. inside the callback function, we want to see the room id, we update the room state(setRoom) and it takes in the value of the room ID and sets the orientation to white. this means that whoever starts a game is going to be white by default */}
            <Button
                variant="contained"
                onClick={() => {
                    socket.emit("createRoom", (r) => {
                        console.log("room:", r)
                        setRoom(r)
                        setOrientation("white")
                    })
                }}
            >
                Start a Game
            </Button>
            {/* button for joining game */}
            <Button
                onClick={() => {
                    setRoomDialogOpen(true)
                }}
            >
                Join a Game
            </Button>
        </Stack>
    )
}