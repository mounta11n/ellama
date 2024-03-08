const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let win;
let serverProcess;

app.on('ready', () => {
  serverProcess = spawn('./server', [
    '-t', '3',
    '--port', '8007',
    '-ngl', '0',
    '-c', '1024',
    '-b', '16',
    '--mlock',
    '-m', './Tiny-q4.gguf'
  ], {
    cwd: path.resolve(__dirname),
    detached: true,
    stdio: 'ignore'
  });

  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('http://localhost:8007');

  serverProcess.unref();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

