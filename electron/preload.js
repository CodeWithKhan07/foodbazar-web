// Preload script runs in the renderer process with access to Node.js APIs
// Use contextBridge here to safely expose any desktop-specific APIs to the renderer
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke("win-minimize"),
  maximize: () => ipcRenderer.invoke("win-maximize"),
  close: () => ipcRenderer.invoke("win-close"),
  isMaximized: () => ipcRenderer.invoke("win-is-maximized"),
  onMaximizeChange: (cb) => {
    ipcRenderer.on("win-maximize-change", (_e, val) => cb(val));
  },
});
