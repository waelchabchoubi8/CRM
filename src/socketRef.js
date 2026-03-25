// src/socketRef.js
export const socketState = {
  socket: null,
  isConnected: false,
};


// socketEvents.js
const listeners = new Set();

export const addNotificationListener = (fn) => listeners.add(fn);
export const removeNotificationListener = (fn) => listeners.delete(fn);

export const emitNotification = (data) => {
  listeners.forEach((fn) => fn(data));
 } ;
