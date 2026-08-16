const { BrowserWindow, app } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,

    show: false, // <-- THIS IS THE FALSE

    frame: false,
    transparent: true,
    backgroundColor: "#00000000"
  });

  mainWindow.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow();
});