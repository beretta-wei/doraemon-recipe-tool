import { renderCropsTab } from "./tabs/cropsTab.js";
import { renderFishTab } from "./tabs/fishTab.js";
import { renderProcessedTab } from "./tabs/processedTab.js";
import { renderRecipeTab } from "./tabs/recipeTab.js";

const TAB_RENDERERS = new Map([
  ["recipes", renderRecipeTab],
  ["crops", renderCropsTab],
  ["fish", renderFishTab],
  ["processed", renderProcessedTab],
]);

function setActiveTab(tabButtons, tabPanels, tabId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === tabId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  tabPanels.forEach((panel, panelId) => {
    const isActive = panelId === tabId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

export function initTabs(container) {
  const tabButtons = Array.from(
    container.querySelectorAll("[data-tab-target]")
  );
  const tabPanels = new Map();

  tabButtons.forEach((button) => {
    const tabId = button.dataset.tabTarget;
    if (!tabId) {
      return;
    }

    const panel = container.querySelector(`[data-tab-panel="${tabId}"]`);
    if (!panel) {
      return;
    }

    tabPanels.set(tabId, panel);

    const renderer = TAB_RENDERERS.get(tabId);
    if (renderer) {
      renderer(panel);
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tabTarget;
      if (tabId) {
        setActiveTab(tabButtons, tabPanels, tabId);
      }
    });
  });

  const defaultTab =
    tabButtons.find((button) => button.dataset.tabTarget === "recipes") ??
    tabButtons[0];

  if (defaultTab?.dataset.tabTarget) {
    setActiveTab(tabButtons, tabPanels, defaultTab.dataset.tabTarget);
  }
}
