const DEFAULTS = {
  selector: "body",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  size: "cover",
  position: "center",
  repeat: "no-repeat",
  useBeforeLayer: false
};

const SITE = (() => {
  const h = location.hostname;
  if (h.includes("perplexity.ai")) return "perplexity";
  if (h.includes("chatgpt.com")) return "chatgpt";
  if (h.includes("gemini.google.com")) return "gemini";
  return "unknown";
})();

function styleEl(el, cfg) {
  if (!el) return;
  Object.assign(el.style, {
    backgroundImage: `url("${cfg.imageUrl}")`,
    backgroundSize: cfg.size || "cover",
    backgroundPosition: cfg.position || "center",
    backgroundRepeat: cfg.repeat || "no-repeat",
    backgroundColor: "transparent"
  });
}

function applyOnChatGPT(cfg) {
  const sel = (cfg.selector || DEFAULTS.selector).trim() || "body";
  const el = document.querySelector(sel);
  if (el) styleEl(el, cfg);
}

function applyOnGemini(cfg) {
  const el = document.body;
  
  if (el && cfg.imageUrl) {
    Object.assign(el.style, {
        backgroundImage: `url("${cfg.imageUrl}")`,
        backgroundSize: cfg.size || "cover",
        backgroundPosition: cfg.position || "center",
        backgroundRepeat: cfg.repeat || "no-repeat",
        backgroundAttachment: "fixed"
    });
    
    const seeThrough = 'rgba(0, 0, 0, 0.5)';
    const vars = [
        '--gm3-sys-color-background',
        '--gm3-sys-color-surface',
        '--gm3-sys-color-surface-container',
        '--gm3-sys-color-surface-container-high',
        '--gm3-sys-color-surface-container-highest'
    ];

    vars.forEach(v => {
        el.style.setProperty(v, seeThrough, 'important');
    });

    // Fallback standard background
    el.style.setProperty('background-color', seeThrough, 'important');
  }
}

function applyOnPerplexity(cfg) {
  const sel = ".scrollable-container";
  document.querySelectorAll(sel).forEach(el => styleEl(el, cfg));

  if (!window.__ppxBgObserver) {
    const obs = new MutationObserver(() => {
      document.querySelectorAll(sel).forEach(el => styleEl(el, cfg));
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    window.__ppxBgObserver = obs;
  }
}

function apply(cfg) {
  if (SITE === "perplexity") applyOnPerplexity(cfg);
  else if (SITE === "chatgpt") applyOnChatGPT(cfg);
  else if (SITE === "gemini") applyOnGemini(cfg);
}

// Init
chrome.storage.sync.get(DEFAULTS, (cfg) => apply(cfg));

// Listen for live updates
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "updateImage" && typeof msg.imageUrl === "string") {
    chrome.storage.sync.get(DEFAULTS, (cfg) => apply({ ...cfg, imageUrl: msg.imageUrl }));
  }
});