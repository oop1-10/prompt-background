const DEFAULTS = {
  target: "chatgpt",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
};

const imgInput = document.getElementById("img");
const savedEl = document.getElementById("saved");
const openNowBtn = document.getElementById("openNow");

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function flashSaved(text = "Saved ✓") {
  savedEl.textContent = text;
  setTimeout(() => (savedEl.textContent = ""), 1200);
}

function notifyActiveTabImage(imageUrl) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "updateImage", imageUrl });
  });
}

function saveImageUrl(url) {
  const imageUrl = (url || "").trim() || DEFAULTS.imageUrl;
  chrome.storage.sync.set({ imageUrl }, () => {
    notifyActiveTabImage(imageUrl);
    flashSaved();
  });
}

function saveTarget(target) {
  const validTargets = ["chatgpt", "perplexity", "gemini"];
  const next = validTargets.includes(target) ? target : "chatgpt";
  
  chrome.storage.sync.set({ target: next }, () => {
    flashSaved("Homepage set ✓");
  });
}

function destFor(target) {
  if (target === "perplexity") return "https://www.perplexity.ai/";
  if (target === "gemini") return "https://gemini.google.com/";
  return "https://chatgpt.com/";
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(DEFAULTS, ({ imageUrl, target }) => {
    imgInput.value = imageUrl || "";
    const radio = document.querySelector(`input[name="target"][value="${target}"]`) 
               || document.querySelector(`input[name="target"][value="${DEFAULTS.target}"]`);
    if (radio) radio.checked = true;
  });

  $all('input[name="target"]').forEach(r =>
    r.addEventListener("change", () => saveTarget(r.value))
  );

  imgInput.addEventListener("input", debounce(() => {
    saveImageUrl(imgInput.value);
  }, 150));

  openNowBtn.addEventListener("click", () => {
    chrome.storage.sync.get(DEFAULTS, ({ target }) => {
      const url = destFor(target);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs?.[0]?.id;
        if (!tabId) return;
        chrome.tabs.update(tabId, { url });
      });
    });
  });
});