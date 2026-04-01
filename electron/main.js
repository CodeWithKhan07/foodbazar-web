import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICON = path.join(__dirname, "../public/icon.png");

// dist-electron/main.js is the built output; dist/ is the web app output
const DIST = path.join(__dirname, "../dist");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "FoodBazar POS",
    icon: ICON,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      // Keep Node integration off for security; use preload for any bridge APIs
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Open external links in the system browser instead of Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Notify the renderer whenever maximize state changes
  win.on("maximize", () => win.webContents.send("win-maximize-change", true));
  win.on("unmaximize", () =>
    win.webContents.send("win-maximize-change", false),
  );

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(DIST, "index.html"));
  }
}

app.whenReady().then(() => {
  // Window control IPC handlers
  ipcMain.handle("win-minimize", () => win?.minimize());
  ipcMain.handle("win-maximize", () =>
    win?.isMaximized() ? win.unmaximize() : win.maximize(),
  );
  ipcMain.handle("win-close", () => win?.close());
  ipcMain.handle("win-is-maximized", () => win?.isMaximized() ?? false);

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    win = null;
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
