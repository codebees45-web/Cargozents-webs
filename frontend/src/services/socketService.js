import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "import.meta.env.VITE_API_URL";
const socketUrl = apiUrl.replace(/\/api$/, "");

const socket = io(socketUrl, {
  autoConnect: true,
});

export default socket;