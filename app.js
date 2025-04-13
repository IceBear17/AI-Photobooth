const screens = {
  welcome: document.getElementById("screen-welcome"),
  template: document.getElementById("screen-template-selection"),
  capture: document.getElementById("screen-capture"),
  generating: document.getElementById("screen-generating"),
  result: document.getElementById("screen-result"),
};

function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

// On page load
switchScreen("screen-welcome");

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

captureBtn.onclick = () => {
  canvas.width = webcam.videoWidth;
  canvas.height = webcam.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    capturedImageBlob = blob;
    nextToGenerating.disabled = false;
  }, "image/jpeg");
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
