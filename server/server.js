/*
   this page is going to enable multiplayer connectivity using ExpressJS and Socket.io
   - express is a node.js framework that helps with setting up http an http server in a node.js environment
   - socket.io is also a framework made for creating websocket servers and connections using straightforward api. websocket connections provide two-way communication between client and server. these connections are established over http connections through a process of upgrading the connection.
   - nodemon was also installed as a dependency. it will automatically restart the server whenever changes are made.
*/

// initialize express 
const express = require("express")
const app = express()

// http server is created with express application passed as the argument
const http = require("http")
const { Server } = require("socket.io")
const server = http.createServer(app);

const { v4: uuidV4 } = require("uuid")

// set port to value received from environment variable. 8080 if null.
const port = process.env.PORT || 8080

// upgrade http server to websocket. so this will create a new websocket server by calling the constructor from the socket.io library. cors allows connections from any origin.
const io = new Server(server, {
    cors: "*",
})

// this will be a data structure to store the room's data-- i.e. room ID and a list of players in the room. right now, this going to use JS Map, but for prod i need to use a database. Tutorial recommends Redis for storing room data and game state.
const rooms = new Map();

// io.connection
io.on("connection", (socket) => {
    // each socket is provided an id, and it refers to the client that just got connected
    console.log(socket.id, "connected")

    // listen to username event and log it. you should also see this in server side console.log when user inputs their username
    socket.on("username", (username) => {
        console.log("username:", username)
        socket.data.username = username;
    })

    // listens for createRoom from client. "callback" inside callback function refers to callback function from client passed as data. a uuid is generated and stored inside the roomId function, which it will pass on to client. when user clicks the start game button, socket.join will automatically join them to the room and pass in the room id. "rooms" is then taken from the data structure thing that i created earlier. this will store the data using JS Map. it generates a key value pair; it sets roomId as a key, and it stores the data of the players' usernames as a value inside the Map. then after the Map function stores all of that data, it gets passed onto callback which will be passed onto client. when callback is called, client will receive the key-value pair as a response from server.
    socket.on("createRoom", async (callback) => {
        const roomId = uuidV4()
        await socket.join(roomId)
        rooms.set(roomId, {
            roomId,
            players: [{ id: socket.id, username: socket.data?.username }]
        })
        callback(roomId)
    })

    // this is a websocket server-side event listener that is triggered when client calls "joinRoom".
    socket.on("joinRoom", async (args, callback) => {

        // this stores the info of the room and what's inside JS Map
        const room = rooms.get(args.roomId)
        let error, message;

        // this checks room validity. its checking if rooms exist, is empty or full, where it will throw an error.
        if (!room) {
            error = true;
            message = "room does not exist"
        } else if (room.length <= 0) {
            error = true
            message = "room is empty"
        } else if (room.length >= 2) {
            error = true
            message = "room is full"
        }

        // if there is an error, check for a callback on client side. if it exists, callback will be called and we pass on the error and the message. if callback is not called, it will just exit.
        if (error) {
            if (callback) {
                callback({
                    error,
                    message
                })
            }
            return;
        }

        // this pushes the joining client to join the room
        await socket.join(args.roomId)

        // this takes the joining user's data and adds it to the list of players in the room
        const roomUpdate = {
            ...room,
            players: [...room.players,
            {
                id: socket.id,
                username: socket.data?.username
            }]
        }

        rooms.set(args.roomId, roomUpdate)

        // this delivers roomUpdate back to the client
        callback(roomUpdate)

        // websocket emits an "opponentJoined" event to the room and this updates the state and lets the player know that their opponent has joined and game is ready to begin
        socket.to(args.roomId).emit("opponentJoined", roomUpdate)
    })
    
    // this listens for the move event. passes in the data from the room and emits the move to the opponent's client app. so when a move is received in the backend, this event is broadcasted to all sockets in the room except for the socket that generated the event.
    socket.on("move", (data) => {
        socket.to(data.room).emit("move", data.move)
    })
})

// server listens on specified port and logs a message to let us know that it is listening for incoming connections
server.listen(port, () => {
    console.log(`listening on *:${port}`)
})