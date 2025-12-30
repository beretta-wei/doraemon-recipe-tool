import { renderAppShell } from "./ui/appShell.js";
import { initTabs } from "./ui/tabs.js";

const root = document.getElementById("app");

if (root) {
  renderAppShell(root);
  initTabs(root);
}
