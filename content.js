let isSnipping = false;
let startX, startY, endX, endY;
let snipBox;

function startSnipping() {
  isSnipping = true;
  document.body.style.cursor = 'crosshair';
}

function stopSnipping() {
  isSnipping = false;
  document.body.style.cursor = 'default';
  if (snipBox) {
    snipBox.remove();
    snipBox = null;
  }
}

function createSnipBox(x, y) {
  snipBox = document.createElement('div');
  snipBox.style.position = 'absolute';
  snipBox.style.border = '2px dashed #000';
  snipBox.style.background = 'rgba(0, 0, 0, 0.1)';
  snipBox.style.left = `${x}px`;
  snipBox.style.top = `${y}px`;
  document.body.appendChild(snipBox);
}

function updateSnipBox(x, y) {
  snipBox.style.width = `${x - startX}px`;
  snipBox.style.height = `${y - startY}px`;
}

document.addEventListener('mousedown', (e) => {
  if (!isSnipping) return;
  startX = e.clientX;
  startY = e.clientY;
  createSnipBox(startX, startY);
});

document.addEventListener('mousemove', (e) => {
  if (!isSnipping || !snipBox) return;
  updateSnipBox(e.clientX, e.clientY);
});

document.addEventListener('mouseup', async (e) => {
  if (!isSnipping) return;
  endX = e.clientX;
  endY = e.clientY;
  stopSnipping();
  
  const screenshotUrl = await takeScreenshot(startX, startY, endX - startX, endY - startY);
  storeScreenshot(screenshotUrl);
});

function takeScreenshot(x, y, width, height) {
  return new Promise((resolve) => {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
    });
  });
}

function storeScreenshot(dataUrl) {
  chrome.storage.local.get({snips: []}, (result) => {
    const snips = result.snips;
    snips.push(dataUrl);
    chrome.storage.local.set({snips});
    displaySnippets();
  });
}

function displaySnippets() {
  chrome.storage.local.get({snips: []}, (result) => {
    const snips = result.snips;
    const sidebarContent = document.getElementById('sidebar-content');
    sidebarContent.innerHTML = '';
    snips.forEach((snip) => {
      const img = document.createElement('img');
      img.src = snip;
      img.style.width = '100%';
      sidebarContent.appendChild(img);
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSnipping') {
    startSnipping();
    sendResponse({status: 'snipping started'});
  }
});
