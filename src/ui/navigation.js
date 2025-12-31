import { getCategoryHref } from "../logic/categories.js";

export function renderTabsNavigation(container, categories, activeTab) {
  const tabs = [
    {
      id: "recipes",
      label: "料理",
      href: "index.html",
    },
    ...categories.map((category) => ({
      id: category,
      label: category,
      href: getCategoryHref(category),
    })),
  ];

  container.innerHTML = "";

  tabs.forEach((tab) => {
    const link = document.createElement("a");
    link.className = "tabs__tab btn btn-outline-primary";
    link.setAttribute("role", "tab");
    link.href = tab.href;
    link.textContent = tab.label;

    const isActive = activeTab === tab.id;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-selected", isActive ? "true" : "false");
    link.classList.toggle("btn-primary", isActive);
    link.classList.toggle("btn-outline-primary", !isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    }

    container.appendChild(link);
  });
}
