import { app, Menu, Tray,ipcMain, BrowserWindow } from 'electron'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

var appTray = null;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 670,
    useContentSize: true,
    width: 160,
    webPreferences: {webSecurity: false},//跨域请求
    transparent: true,
    frame:false,//隐藏边框
    skipTaskbar:true,//不显示在任务栏
  })

  //系统托盘右键菜单
  var trayMenuTemplate = [
    {
      label: '退出',
      click: function () {
        //ipc.send('close-main-window');
        app.quit();
      }
    }
  ];

  //系统托盘图标
  appTray = new Tray(path.join(__static,'/icon.png'));

  //图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  //设置此托盘图标的悬停提示内容
  appTray.setToolTip('应用主进程');
  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  appTray.on('click', function(){
      // 显示主程序
      mainWindow.show();
      // 关闭托盘显示
      //appTray.destroy();
  });

  //mainWindow.setAlwaysOnTop(true,'pop-up-menu',1);

  mainWindow.loadURL(winURL)

  ipcMain.on('window-min', function() {
    mainWindow.hide(); 
    mainWindow.setSkipTaskbar(true);
    //mainWindow.minimize();
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
