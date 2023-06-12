import { Card, CardContent, List, ListItem, ListItemText, ListSubheader, Stack, Typography, Box } from "@mui/material"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import CustomDialog from "./components/CustomDialog"
import socket from "./socket"

function Game({ players, room, orientation, cleanup }) {

    // first time using useMemo. It allows you to cache between renders. Here, chess is getting cached so that this instance doesn't it doesn't get created on every re-render. This instance is going to be used for move validation and generation.
    const chess = useMemo(() => new Chess(), [])

    // FEN stands for Forsyth-Edwards Notation, which i've never heard of before. but basically i think it stores the current position of all the pieces on the board so that it can properly restart a game. not sure. will update when i'm sure.
    const [fen, setFen] = useState(chess.fen())

    const [over, setOver] = useState("")

    // makeAMove is wrapped in a trycatch block. it first checks if that move is acceptable, because if not, it will be handled by onDrop. otherwise makeAMove will accept a a move and calls chess.move. the .move method validates the move that was made and updates the Chess instance. Then that move gets stored in the fen state. this apparently triggers a re-render and that's what updates the moves on the board. it checks if the game ends after every move. if that is true, it checks on whether it's because of a draw or checkmate and updates the game state.
    const makeAMove = useCallback((move) => {
        try {
            const result = chess.move(move); // update chess instance
            setFen(chess.fen()); // update fen state to trigger a re-render
            console.log("checkmate, bestie", chess.isGameOver(), chess.isCheckmate())

            if (chess.isGameOver()) { // check if move led to game over
                if (chess.isCheckmate()) {
                    // if game over is because of checkmate, display the following
                    setOver(
                        `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
                    )
                } else if (chess.isDraw()) {
                    setOver("Draw")
                } else {
                    setOver("Game Over")
                }
            }

            return result;
        } catch (error) {
            console.log("no good bestie", error)
            return null
        }
    }, [chess]);

    // onDrop receives two functions. sourceSquare is the initial position of selected piece and targetSquare is where the piece wants to go. 
    function onDrop(sourceSquare, targetSquare) {

        // first if statement says that if the current orientation isn't equal to the orientation that has been passed in, then the player will not be allowed to do anything. orientation is an object that's been passed in, and what it is is the orientation of the current player-- either black or white, which is what chess.turn() is supposed to return. this is meant to prohibit the player from moving a piece that is not theirs.
        //second if statement just says that if the other player has not joined, moves will be prohibited.
        if (chess.turn() !== orientation[0]) return false;
        if (players.length < 2) return false;

        // moveData stores the data of the move that you chose to play. chess.turn() returns the colour of the side that's playing-- either black or white. makeAMove then gets called, and it passes moveData to see if the move is valid. chess.js has all the logic i need for legal chess moves. so depending on if the move is valid, it will return a boolean which will decide if the piece gets moved.
        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            color: chess.turn(),
            promotion: "q",
        }
        const move = makeAMove(moveData);

        // illegal move
        if (move === null) return false;

        // lastly this function emits a "move" event after a move is validated and then played, which gets passed onto the server, then gets passed onto the server so that it can pass the move info to the second player. presumably, it updates the move and room states. or more accurately, it takes the move data and emits it to the opponent's client app.
        socket.emit("move", {
            move,
            room,
        })

        return true;
    }

    // this is an socket listener for each player to receive a "move" event. the move is passed through and goes through the makeAMove function to validate the move and play it on the board.
    useEffect(() => {
        socket.on("move", (move) => {
            makeAMove(move);
        })
    }, [makeAMove])

    // listens for the playerDisconnected event. once received, it ends the game and sends out a notification saying which player has disconnected.
    useEffect(() => {
        socket.on("playerDisconnected", (player) => {
            setOver(`${player.username} has disconnected.`)
        })
    }, [])

    // this hook cleans up the resources and exits the game environment. so when client receives the closeRoom event, it runs an if statement to check if the roomId of the closed room is the same as the current room that's open. if true, it triggers clean up which resets the app state and closes the game environment. when it is reset, it unmounts the game component and goes back to init game :)
    useEffect(() => {
        socket.on("closeRoom", ({ roomId }) => {
            if (roomId === room) {
                cleanup()
            }
        })
    }, [room, cleanup])

    return (
        <Stack>
            <Card>
                <CardContent>
                    <Typography variant="h5">Room ID: {room}</Typography>
                </CardContent>
            </Card>
            <Stack flexDirection="row" sx={{ pt: 2 }}>
                <div className="board" style={{
                    maxWidth: 600,
                    maxHeight: 600,
                    flexGrow: 1,
                }}>
                    {/* Chessboard will be coming from react-chessboard. fen is going to store position of pieces. onPieceDrop will be called every time a piece moves. boardOrientation passes the info of whether or not the player is playing b or w. */}
                    <Chessboard position={fen} onPieceDrop={onDrop} boardOrientation={orientation} />
                </div>

                {/* This is meant to display names of each player. So as long as there's at least one player in the room (or the players array has at least one item) then the player name(s) will be displayed */}
                {players.length > 0 && (
                    <Box>
                        <List>
                            <ListSubheader>Players</ListSubheader>
                            {players.map((p) => (
                                <ListItem key={p.id}>
                                    <ListItemText primary={p.username} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Stack>
            {/* This Dialog will be rendered when the state "over" is true. That state basically tells us when the game is over and it should tell us how the game ended-- checkmate, stalemate or draw. when they press continue, everything closes up. */}
            <CustomDialog
                open={Boolean(over)}
                title={over}
                contentText={over}
                handleContinue={() => {
                    socket.emit("closeRoom", { roomId: room });
                    cleanup();
                }}
            />
        </Stack>
    )
}

export default Game;