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

    // onDrop receives two functions. sourceSquare is the initial position of selected piece and targetSquare is where the piece wants to go. moveData stores the data of the move that you chose to play. chess.turn() returns the colour of the side that's playing-- either black or white. makeAMove then gets called, and it passes moveData to see if the move is valid. Depending on if the move is valid, it will return a boolean which will decide if the piece gets moved.
    function onDrop(sourceSquare, targetSquare) {
        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            color: chess.turn(),
        }
        const move = makeAMove(moveData);

        // illegal move
        if (move === null) return false;

        return true;
    }

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