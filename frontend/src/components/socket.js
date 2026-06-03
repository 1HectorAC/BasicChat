import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL;

export default io(URL);

//{autoConnect: false, transports: ["websocket"]}