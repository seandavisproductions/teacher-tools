import { io } from "socket.io-client";

export const socket = io("https://teacher-toolkit-back-end.onrender.com:3000", {
    withCredentials: true,
    extraHeaders: {
    "Access-Control-Allow-Origin": "*"
    }
});
