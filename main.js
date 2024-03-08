const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let serverProcess = null; // Schritt 1: Variable für den Serverprozess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 960,
    webPreferences: {
      nodeIntegration: true
    }
  });

  waitForServerToBeReady(() => {
    mainWindow.loadURL('http://localhost:8007');
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function waitForServerToBeReady(callback) {
  const options = {
    host: 'localhost',
    port: 8007,
    path: '/',
    timeout: 1000 // 1 Sekunde Timeout
  };

  const request = http.request(options, (res) => {
    console.log('Server ist bereit. Lade UI...');
    callback();
  });

  request.on('error', function(err) {
    console.log('Server noch nicht bereit, versuche es erneut...');
    setTimeout(() => waitForServerToBeReady(callback), 2000); // Warte 2 Sekunden, bevor erneut versucht wird
  });

  request.end();
}

function startServerAndCreateWindow() {
  const serverPath = path.join(__dirname, 'assets/server');
  const modelPath = path.join(__dirname, 'assets/Tiny-q4.gguf');
  const serverCommand = `${serverPath} -t 3 --host 0.0.0.0 --port 8007 -ngl 0 -c 1024 -b 16 --mlock -m ${modelPath}`;

  serverProcess = exec(serverCommand, (error, stdout, stderr) => { // Schritt 1: Speichere die Referenz des Serverprozesses
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  createWindow();
}

app.on('ready', startServerAndCreateWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => { // Schritt 2: Event-Listener für app.quit()
  if (serverProcess !== null) {
    serverProcess.kill(); // Beendet den Serverprozess
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    startServerAndCreateWindow();
  }
});
