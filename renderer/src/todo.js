const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { OverlayController, OVERLAY_WINDOW_OPTS } = require('electron-overlay-window');

let window;

const toggleMouseKey = 'CmdOrCtrl + J';
const toggleShowKey = 'CmdOrCtrl + K';

app.disableHardwareAcceleration();
app.enableSandbox();

const createWindow = () => {
  window = new BrowserWindow({
    ...OVERLAY_WINDOW_OPTS,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // window.loadFile('index.html')

  window.loadURL(`data:text/html;charset=utf-8,
  <head>
    <title>overlay-demo</title>
  </head>
  <body style="padding: 0; margin: 0;">
    <div style="position: absolute; width: 100%; height: 100%; border: 4px solid red; background: rgba(255,255,255,0.1); box-sizing: border-box; pointer-events: none;"></div>
    <div style="padding-top: 50vh; text-align: center;">
      <div style="padding: 16px; border-radius: 8px; background: rgb(255,255,255); border: 4px solid red; display: inline-block;">
        <span>Overlay Window</span>
        <span id="text1"></span>
        <br><span><b>${toggleMouseKey}</b> to toggle setIgnoreMouseEvents</span>
        <br><span><b>${toggleShowKey}</b> to "hide" overlay using CSS</span>
      </div>
    </div>
    <script>
      const electron = require('electron');

      electron.ipcRenderer.on('focus-change', (e, state) => {
        document.getElementById('text1').textContent = (state) ? ' (overlay is clickable) ' : 'clicks go through overlay'
      });

      electron.ipcRenderer.on('visibility-change', (e, state) => {
        if (document.body.style.display) {
          document.body.style.display = null
        } else {
          document.body.style.display = 'none'
        }
      });
    </script>
  </body>
`);

  setupHotKeys();

  OverlayController.attachByTitle(
    window,
    'Untitled - Notepad',
    // 'Path of Exile',
  );
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const setupHotKeys = () => {
  let isInteractable = false;

  function toggleOverlayState() {
    if (isInteractable) {
      isInteractable = false;
      OverlayController.focusTarget();
      window.webContents.send('focus-change', false);
    } else {
      isInteractable = true;
      OverlayController.activateOverlay();
      window.webContents.send('focus-change', true);
    }
  }

  window.on('blur', () => {
    isInteractable = false;
    window.webContents.send('focus-change', false);
  });

  globalShortcut.register(toggleMouseKey, toggleOverlayState);

  globalShortcut.register(toggleShowKey, () => {
    window.webContents.send('visibility-change', false);
  });
};
