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

const {v4: uuidV4} = require("uuid")

// set port to value received from environment variable. 8080 if null.
const port = process.env.PORT || 8080

// upgrade http server to websocket. so this will create a new websocket server by calling the constructor from the socket.io library. cors allows connections from any origin.
const io = new Server(server, {
    cors: "*",
})

// io.connection
io.on("connection", (socket) => {
    // each socket is provided an id, and it refers to the client that just got connected
    console.log(socket.id, "connected")
})

// server listens on specified port and logs a message to let us know that it is listening for incoming connections
server.listen(port, () => {
    console.log(`listening on *:${port}`)
})