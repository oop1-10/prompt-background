const DEFAULTS = { target: "chatgpt" };

function go(url) {
  location.replace(url);
}

function destFor(target) {
  if (target === "perplexity") return "https://www.perplexity.ai/";
  return "https://chatgpt.com/";
}

let didRedirect = false;
const fallback = setTimeout(() => {
  if (!didRedirect) {
    didRedirect = true;
    go(destFor(DEFAULTS.target));
  }
}, 600);

try {
  chrome.storage?.sync?.get(DEFAULTS, ({ target }) => {
    if (didRedirect) return;
    clearTimeout(fallback);
    didRedirect = true;
    go(destFor(target));
  });
} catch {
  if (!didRedirect) {
    clearTimeout(fallback);
    didRedirect = true;
    go(destFor(DEFAULTS.target));
  }
}
