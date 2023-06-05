// this page is to establish a websocket connection from client to server using socket.io

import { io } from "socket.io-client"

// this is to initialise the websocket connection
const socket = io("localhost:8080")

export default socket;