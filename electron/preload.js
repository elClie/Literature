const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("DeckApp", {
  isElectron: true,
  toggleFullscreen() {
    return ipcRenderer.invoke("toggle-fullscreen");
  },
});
