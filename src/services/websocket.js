export function initWebSocket() {
    return new Promise((resolve) => {
      const socket = new WebSocket("ws://localhost:8800");

      console.log("Inside initWebSocket function")
  
      socket.onopen = () => {
        console.log("WebSocket connected.");
        resolve(socket);
      };
  
      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        resolve(null); // App still loads
      };
  
      socket.onclose = () => {
        console.warn("WebSocket closed");
      };
  
      // store your socket in global state, context, etc.
      window.mySocket = socket;
    });
}