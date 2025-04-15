const screens = {
  welcome: document.getElementById("screen-welcome"),
  template: document.getElementById("screen-template-selection"),
  capture: document.getElementById("screen-capture"),
  generating: document.getElementById("screen-generating"),
  result: document.getElementById("screen-result"),
};

function goFullScreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

// To trigger lock
function lockKiosk() {
  const lockOverlay = document.createElement("div");
  lockOverlay.style.position = "fixed";
  lockOverlay.style.inset = "0";
  lockOverlay.style.background = "black";
  lockOverlay.style.zIndex = "9999";
  lockOverlay.innerHTML = `
    <input id="pinInput" type="password" placeholder="Enter PIN" style="font-size: 2rem; padding: 10px; margin-top: 50vh; display: block; margin-left: auto; margin-right: auto;">
  `;
  document.body.appendChild(lockOverlay);

  const pinInput = document.getElementById("pinInput");
  pinInput.focus();
  pinInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && pinInput.value === "1234") {
      lockOverlay.remove();
    }
  });
}


function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

// On page load
switchScreen("screen-welcome");

// 🔒 LOCK BUTTON LOGIC STARTS HERE
let isLocked = false;

const lockBtn = document.getElementById("lockBtn");
const lockIcon = document.getElementById("lockIcon");

function updateLockIcon() {
  lockIcon.src = isLocked ? "./icons/unlock.svg" : "./icons/lock.svg";
}

function enterFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function showLockOverlay() {
  const lockOverlay = document.createElement("div");
  lockOverlay.id = "lockOverlay";
  lockOverlay.style.position = "fixed";
  lockOverlay.style.inset = "0";
  lockOverlay.style.background = "black";
  lockOverlay.style.zIndex = "9999";
  lockOverlay.innerHTML = `
    <input id="pinInput" type="password" placeholder="Enter PIN" style="font-size: 2rem; padding: 10px; margin-top: 50vh; display: block; margin-left: auto; margin-right: auto;">
  `;
  document.body.appendChild(lockOverlay);

  const pinInput = document.getElementById("pinInput");
  pinInput.focus();
  pinInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      if (pinInput.value === "1234") {
        document.getElementById("lockOverlay").remove();
        isLocked = false;
        updateLockIcon();

        // ✅ Exit fullscreen here
        exitFullscreen();
      } else {
        pinInput.style.border = "2px solid red";
        pinInput.value = "";
      }
    }
  });
}

lockBtn.onclick = () => {
  enterFullscreen();

  if (!isLocked) {
    isLocked = true;
    updateLockIcon();
    showLockOverlay();
  } else {
    showLockOverlay(); // Show PIN prompt again
  }
};
// 🔒 LOCK BUTTON LOGIC ENDS HERE



function setEventBackground(imageUrl) {
  document.getElementById("screen-welcome").style.backgroundImage = `url(${imageUrl})`;
}

document.getElementById("startBtn").onclick = () => {
  switchScreen("screen-template-selection");
  loadTemplates();
};

document.getElementById("backToWelcome").onclick = () => {
  switchScreen("screen-welcome");
};

document.getElementById("nextToPhoto").onclick = () => {
  if (!selectedTemplate) return;
  switchScreen("screen-capture");
};

// Load template cards dynamically
const templateList = document.getElementById("templateList");
const nextBtn = document.getElementById("nextToPhoto");
let selectedTemplate = null;

async function loadTemplates() {
  try {
    const response = await fetch(`${BACKEND_URL}/templates/`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });
    const templates = await response.json();

    templateList.innerHTML = "";

    templates.forEach((template) => {
      const card = document.createElement("div");
      card.classList.add("template-card");

      const img = document.createElement("img");
      img.src = `${BACKEND_URL}/static/templates/${template}`;
      img.alt = template;

      card.onclick = () => {
        document.querySelectorAll(".template-card").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
        selectedTemplate = template;
        nextBtn.disabled = false;
      };

      card.appendChild(img);
      templateList.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading templates:", err);
  }
}

// Phase 3 - Webcam & Upload
const webcam = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const uploadBtn = document.getElementById("uploadBtn");
const uploadInput = document.getElementById("uploadInput");
const nextToGenerating = document.getElementById("nextToGenerating");

let capturedImageBlob = null;
let streamStarted = false;

async function startCamera() {
  if (streamStarted) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcam.srcObject = stream;
    streamStarted = true;
  } catch (err) {
    console.error("Camera access error:", err);
  }
}

document.getElementById("startBtn").onclick = () => {
  switchScreen("screen-template-selection");
  loadTemplates();
};

document.getElementById("nextToPhoto").onclick = () => {
  if (!selectedTemplate) return;
  switchScreen("screen-capture");
  startCamera();
};

// captureBtn.onclick = () => {
//   canvas.width = webcam.videoWidth;
//   canvas.height = webcam.videoHeight;

//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

//   canvas.toBlob((blob) => {
//     capturedImageBlob = blob;
//     nextToGenerating.disabled = false;
//   }, "image/jpeg");
// };

let countdownInterval;
let countdownEl = document.getElementById("countdown");
if (!countdownEl) {
  countdownEl = document.createElement("div");
  countdownEl.id = "countdown";
  countdownEl.style.position = "absolute";
  countdownEl.style.top = "50%";
  countdownEl.style.left = "50%";
  countdownEl.style.transform = "translate(-50%, -50%)";
  countdownEl.style.fontSize = "4rem";
  countdownEl.style.color = "white";
  document.getElementById("screen-capture").appendChild(countdownEl);
}

function stopCamera() {
  const stream = webcam.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    webcam.srcObject = null;
    streamStarted = false;
  }
}

function showRetakeOption() {
  const retakeBtn = document.getElementById("retakeBtn");
  retakeBtn.classList.remove("hidden");
}

function startCountdownAndCapture() {
  let countdown = 3;
  countdownEl.textContent = countdown;
  countdownEl.style.display = "block";

  countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countdownEl.textContent = countdown;
    } else {
      clearInterval(countdownInterval);
      countdownEl.style.display = "none";
      capturePhoto();
    }
  }, 1000);
}

function capturePhoto() {
  canvas.width = webcam.videoWidth;
  canvas.height = webcam.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    capturedImageBlob = blob;
    nextToGenerating.disabled = false;
    webcam.classList.add("hidden");
    canvas.classList.remove("hidden");
    stopCamera();
    showRetakeOption();
  }, "image/jpeg");
}

captureBtn.onclick = () => {
  startCountdownAndCapture();
};

document.getElementById("retakeBtn").onclick = () => {
  webcam.classList.remove("hidden");
  canvas.classList.add("hidden");
  capturedImageBlob = null;
  nextToGenerating.disabled = true;
  startCamera();
  document.getElementById("retakeBtn").classList.add("hidden");
};


uploadBtn.onclick = () => {
  uploadInput.click();
};

uploadInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  capturedImageBlob = file;
  nextToGenerating.disabled = false;
};

document.getElementById("backToTemplates").onclick = () => {
  switchScreen("screen-template-selection");
};

const generateBtn = document.getElementById("generateBtn");
nextToGenerating.onclick = async () => {
  if (!selectedTemplate || !capturedImageBlob) return;

  switchScreen("screen-generating");

  const formData = new FormData();
  formData.append("template_name", selectedTemplate);
  formData.append("user", capturedImageBlob, "captured.png");

  try {
    const response = await fetch(`${BACKEND_URL}/generate/`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true"
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Generation failed");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById("resultImage").src = url;

    switchScreen("screen-result");
  } catch (err) {
    console.error("Error generating image:", err);
  }
};

document.getElementById("downloadBtn").onclick = () => {
  const link = document.createElement("a");
  link.href = document.getElementById("resultImage").src;
  link.download = "ai_photo.png";
  link.click();
};

document.getElementById("tryAgainBtn").onclick = () => {
  switchScreen("screen-capture");
};

document.getElementById("newPhotoBtn").onclick = () => {
  capturedImageBlob = null;
  selectedTemplate = null;
  document.getElementById("nextToPhoto").disabled = true;
  switchScreen("screen-template-selection");
};
