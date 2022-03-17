const electron = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');

const { app, BrowserWindow, ipcMain } = electron;

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: { backgroundThrottling: false }
  });
  mainWindow.loadURL(`file://${__dirname}/src/index.html`);
});

ipcMain.on('videos:added', (event, videos) => {
  const promises = _.map(videos, video => {
    return new Promise((res, rej) => {
      ffmpeg.ffprobe(video.path, (err, metadata) => {
        video.duration = metadata.format.duration;
        video.format = 'mov'
        res(video);
      });
    });
  });

  Promise.all(promises).then(results =>
    mainWindow.webContents.send('metadata:complete', results)
  );
});

ipcMain.on('conversion:start', (event, videos) => {
  const video = videos[0];
  const outputDirectory = video.path.split(video.name)[0];
  console.log(outputDirectory);

  // ffmpeg(video.path).output()
})