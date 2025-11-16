const DEFAULTS = {
  target: "chatgpt",
  selector: "body",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  size: "cover",
  position: "center",
  repeat: "no-repeat",
  useBeforeLayer: true
};

const els = {
  targetChatGPT: () => document.querySelector('input[name="target"][value="chatgpt"]'),
  targetPerplexity: () => document.querySelector('input[name="target"][value="perplexity"]'),
  selector: document.getElementById("selector"),
  imageUrl: document.getElementById("imageUrl"),
  size: document.getElementById("size"),
  position: document.getElementById("position"),
  repeat: document.getElementById("repeat"),
  useBeforeLayer: document.getElementById("useBeforeLayer"),
  save: document.getElementById("save"),
  reset: document.getElementById("reset")
};

function load() {
  chrome.storage.sync.get(DEFAULTS, (cfg) => {
    (cfg.target === "perplexity" ? els.targetPerplexity() : els.targetChatGPT()).checked = true;
    els.selector.value = cfg.selector || DEFAULTS.selector;
    els.imageUrl.value = cfg.imageUrl || DEFAULTS.imageUrl;
    els.size.value = cfg.size || DEFAULTS.size;
    els.position.value = cfg.position || DEFAULTS.position;
    els.repeat.value = cfg.repeat || DEFAULTS.repeat;
    els.useBeforeLayer.checked = cfg.useBeforeLayer ?? DEFAULTS.useBeforeLayer;
  });
}

function save() {
  const target = document.querySelector('input[name="target"]:checked')?.value || DEFAULTS.target;
  const cfg = {
    target,
    selector: els.selector.value.trim() || DEFAULTS.selector,
    imageUrl: els.imageUrl.value.trim() || DEFAULTS.imageUrl,
    size: els.size.value.trim() || DEFAULTS.size,
    position: els.position.value.trim() || DEFAULTS.position,
    repeat: els.repeat.value.trim() || DEFAULTS.repeat,
    useBeforeLayer: !!els.useBeforeLayer.checked
  };
  chrome.storage.sync.set(cfg, () => {
    els.save.textContent = "Saved ✓";
    setTimeout(() => (els.save.textContent = "Save"), 1200);
  });
}

function reset() {
  chrome.storage.sync.set(DEFAULTS, load);
}

els.save.addEventListener("click", save);
els.reset.addEventListener("click", reset);
document.addEventListener("DOMContentLoaded", load);
