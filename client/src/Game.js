import { useState, useMemo, useCallback, useEffect } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import CustomDialog from "./components/CustomDialog"

function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), []) 
    // first time using useMemo. It allows you to cache between renders. Here, chess is getting cached so that this instance doesn't it doesn't get created on every re-render. This instance is going to be used for move validation and generation.

    const [fen, setFen] = useState(chess.fen())
    // FEN stands for Forsyth-Edwards Notation, which i've never heard of before. but basically i think it stores the current position of all the pieces on the board so that it can properly restart a game. not sure. will update when i'm sure.

    const [over, setOver] = useState("")

    function onDrop() { }

    return (
        <>
            <div className="board">
                {/* Chessboard will be coming from react-chessboard. fen is going to store position of pieces. onPieceDrop will be called every time a piece moves. */}
                <Chessboard position={fen} onPieceDrop={onDrop} />                
            </div>
            {/* This Dialog will be rendered when the state "over" is true. That state basically tells us when the game is over and it should tell us how the game ended-- checkmate, stalemate or draw. */}
            <CustomDialog
                open={Boolean(over)}
                title={over}
                contentText={over}
                handleContinue={() => {
                    setOver("")
                }}
            />
        </>
    )
}

export default Game;