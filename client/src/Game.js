import { useState, useMemo, useCallback, useEffect } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import CustomDialog from "./components/CustomDialog"

function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), [])
    const [fen, setFen] = useState(chess.fen())
    const [over, setOver] = useState("")

    function onDrop() { }

    return (
        <>
            <div className="board">
                <Chessboard position={fen} onPieceDrop={onDrop} />
            </div>
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