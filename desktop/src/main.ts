import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface Balance {
  remaining: number | null;
  used: number;
  total: number | null;
  source: string;
}

const RING_CIRCUMFERENCE = 2 * Math.PI * 52;
const POLL_MS = 60_000;

let apiKey: string | null = null;
let pollTimer: number | undefined;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function show(view: "balance" | "key" | "loading") {
  $("balance-view").hidden = view !== "balance";
  $("key-view").hidden = view !== "key";
  $("loading-view").hidden = view !== "loading";
}

function fmt(amount: number | null): string {
  if (amount == null) return "—";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function render(balance: Balance) {
  $("amount").textContent = fmt(balance.remaining);
  $("used").textContent = fmt(balance.used);
  $("total").textContent = fmt(balance.total);

  const fraction =
    balance.total && balance.total > 0 && balance.remaining != null
      ? Math.max(0, Math.min(1, balance.remaining / balance.total))
      : 1;
  ($("ring-fill") as unknown as SVGCircleElement).style.strokeDashoffset = String(
    RING_CIRCUMFERENCE * (1 - fraction),
  );

  const footer = $("footer");
  footer.classList.remove("error");
  footer.textContent = `updated ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  show("balance");
}

function renderError(message: string) {
  show("balance");
  const footer = $("footer");
  footer.classList.add("error");
  footer.textContent = message;
}

async function refresh() {
  if (!apiKey) return;
  try {
    const balance = await invoke<Balance>("fetch_balance", { key: apiKey });
    render(balance);
  } catch (err) {
    renderError(String(err));
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = window.setInterval(refresh, POLL_MS);
}

async function saveKey() {
  const input = $<HTMLInputElement>("key-input");
  const value = input.value.trim();
  if (!value) {
    $("key-error").textContent = "Paste your key first.";
    return;
  }
  await invoke("set_api_key", { key: value });
  apiKey = value;
  input.value = "";
  $("key-error").textContent = "";
  show("loading");
  await refresh();
  startPolling();
}

async function boot() {
  show("loading");
  apiKey = await invoke<string | null>("get_api_key");
  if (!apiKey) {
    show("key");
    return;
  }
  await refresh();
  startPolling();
}

window.addEventListener("DOMContentLoaded", () => {
  $("key-save").addEventListener("click", saveKey);
  $("key-input").addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") saveKey();
  });
  $("refresh").addEventListener("click", refresh);
  $("settings").addEventListener("click", () => show("key"));
  $("close").addEventListener("click", () => getCurrentWindow().close());
  void boot();
});
