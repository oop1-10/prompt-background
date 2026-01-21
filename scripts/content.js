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
    backgroundSize: cfg.size,
    backgroundPosition: cfg.position,
    backgroundRepeat: cfg.repeat,
    backgroundColor: "transparent"
  });
}

function applyOnChatGPT(cfg) {
  const sel = "bard-sidenav-content";
  const el = document.querySelector(sel);
  if (el) styleEl(el, cfg);
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
  else if (SITE === "gemini") applyOnChatGPT(cfg);
}

chrome.storage.sync.get(DEFAULTS, (cfg) => apply(cfg));

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "updateImage" && typeof msg.imageUrl === "string") {
    chrome.storage.sync.get(DEFAULTS, (cfg) => apply({ ...cfg, imageUrl: msg.imageUrl }));
  }
});
