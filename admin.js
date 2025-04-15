const status = document.getElementById("status");

// ✅ Upload Background
document.getElementById("upload-bg-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("/upload-background", {
    method: "POST",
    body: formData,
  });

  status.textContent = res.ok ? "Background updated 🎨" : "Failed to update ❌";
});
