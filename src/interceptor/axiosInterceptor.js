// // src/api/globalInterceptor.js
// import axios from "axios";
// import { connectSocket } from "../components/AppBar";
// import { socketState } from "../socketRef";

// // Helper to wait until socket is open
// function waitForSocketOpen() {
//   return new Promise((resolve) => {
//     const interval = setInterval(() => {
//       if (socketState.socket && socketState.socket.readyState === WebSocket.OPEN) {
//         clearInterval(interval);
//         resolve();
//       }
//     }, 100); // check every 100ms
//   });
// }

// // Attach interceptor globally
// axios.interceptors.request.use(
//   async (config) => {
//     if (!socketState.socket || socketState.socket.readyState !== WebSocket.OPEN) {
//       console.warn("Socket is closed. Triggering reconnect from interceptor...");
//       connectSocket(); // reconnect WebSocket
//       await waitForSocketOpen(); // wait until open
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
import axios from "axios";
import { socketState } from "../socketRef";

function waitForSocketOpen(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (socketState.socket && socketState.socket.readyState === WebSocket.OPEN) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("WebSocket not open within timeout"));
      }
    }, 100);
  });
}

axios.interceptors.request.use(
  async (config) => {
    if (!socketState.socket || socketState.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready — request will not wait for it.");
      // try {
      //   // await waitForSocketOpen();
      // } catch (err) {
      //   console.error("Interceptor wait failed:", err);
      // }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

