// const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// const resultImage = document.getElementById("resultImage");

// // Start webcam
// navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
//   video.srcObject = stream;
// });

// document.getElementById("captureBtn").onclick = () => {
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(video, 0, 0);
// };

// document.getElementById("generateBtn").onclick = async () => {
//   const templateName = document.getElementById("templateSelect").value;
//   const photoBlob = await new Promise((resolve) =>
//     canvas.toBlob(resolve, "image/jpeg")
//   );

//   const formData = new FormData();
//   formData.append("template", new File([], templateName)); // placeholder
//   formData.append("user", photoBlob, "user.jpg");

//   const response = await fetch("http://127.0.0.1:8000/generate/", {
//     method: "POST",
//     body: formData,
//   });

//   if (response.ok) {
//     const blob = await response.blob();
//     resultImage.src = URL.createObjectURL(blob);
//   } else {
//     alert("Something went wrong!");
//   }
// };

console.log("Backend URL is:", BACKEND_URL); // ✅ Should log correctly

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
  const response = await fetch(`${BACKEND_URL}/templates/`);
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

// Show camera when entering screen
document.getElementById("startBtn").onclick = () => {
  switchScreen("screen-template-selection");
  loadTemplates();
};

document.getElementById("nextToPhoto").onclick = () => {
  if (!selectedTemplate) return;
  switchScreen("screen-capture");
  startCamera(); // ✅ start webcam when we enter capture screen
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

  // Show generating screen
  switchScreen("screen-generating");

  const formData = new FormData();
  formData.append("template_name", selectedTemplate);
  formData.append("user", capturedImageBlob, "captured.png");

  try {
    const response = await fetch(`${BACKEND_URL}/generate/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Generation failed");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById("resultImage").src = url;

    //move to result screen
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


// async function loadTemplates() {
//   try {
//     const res = await fetch("http://127.0.0.1:8000/templates/");
//     const data = await res.json();
    
//     // ✅ Make sure templates is declared inside the function
//     const templates = data.templates;

//     templates.forEach((template) => {
//       const card = document.createElement("div");
//       card.classList.add("template-card");

//       const img = document.createElement("img");
//       img.src = `http://127.0.0.1:8000/static/templates/${template}?t=${Date.now()}`;
//       img.alt = template;

//       card.onclick = () => {
//         document.querySelectorAll(".template-card").forEach((el) => el.classList.remove("selected"));
//         card.classList.add("selected");
//         selectedTemplate = template;
//       };

//       card.appendChild(img);
//       templateList.appendChild(card);
//     });
//   } catch (error) {
//     console.error("Failed to load templates:", error);
//   }
// }



// const templateList = document.getElementById("templateList");
// const userUpload = document.getElementById("userUpload");
// const resultImage = document.getElementById("resultImage");
// const webcam = document.getElementById("webcam");
// const canvas = document.getElementById("canvas");
// const captureBtn = document.getElementById("captureBtn");

// let selectedTemplate = null;
// let capturedImageBlob = null; 

// async function loadTemplates() {
//   try {
//     const res = await fetch("http://127.0.0.1:8000/templates/");
//     const data = await res.json();
    
//     // ✅ Make sure templates is declared inside the function
//     const templates = data.templates;

//     templates.forEach((template) => {
//       const card = document.createElement("div");
//       card.classList.add("template-card");

//       const img = document.createElement("img");
//       img.src = `http://127.0.0.1:8000/static/templates/${template}?t=${Date.now()}`;
//       img.alt = template;

//       card.onclick = () => {
//         document.querySelectorAll(".template-card").forEach((el) => el.classList.remove("selected"));
//         card.classList.add("selected");
//         selectedTemplate = template;
//       };

//       card.appendChild(img);
//       templateList.appendChild(card);
//     });
//   } catch (error) {
//     console.error("Failed to load templates:", error);
//   }
// }

// // ✅ Run this once when the page loads
// loadTemplates();

// // Access webcam
// navigator.mediaDevices.getUserMedia({ video: true })
//   .then((stream) => {
//     webcam.srcObject = stream;
//   })
//   .catch((err) => {
//     console.error("Error accessing webcam:", err);
//   });


// // Handle capture
// captureBtn.onclick = () => {
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
//   canvas.toBlob((blob) => {
//     capturedImageBlob = blob;

//     // Optional: preview it
//     const previewURL = URL.createObjectURL(blob);
//     document.getElementById("resultImage").src = previewURL;

//     // Clear the manual file input (just for UX clarity)
//     userUpload.value = "";
//   }, "image/png");
// };

// document.getElementById("generateBtn").onclick = async () => {
//   let userFile = userUpload.files[0];
//   if (!userFile && capturedImageBlob) {
//     userFile = new File([capturedImageBlob], "captured.png", { type: "image/png" });
//   }
//   if (!userFile || !selectedTemplate) {
//     alert("Please upload a photo and select a template!");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("template_name", selectedTemplate);
//   formData.append("user", userFile);

//   const response = await fetch("http://127.0.0.1:8000/generate/", {
//     method: "POST",
//     body: formData,
//   });

//   if (response.ok) {
//     const blob = await response.blob();
//     resultImage.src = URL.createObjectURL(blob);
//   } else {
//     alert("Something went wrong!");
//   }
// };
