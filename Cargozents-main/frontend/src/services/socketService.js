import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "import.meta.env.VITE_API_URL";
const socketUrl = apiUrl.replace(/\/api$/, "");

const socket = io(socketUrl, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;