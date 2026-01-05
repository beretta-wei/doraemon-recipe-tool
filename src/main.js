import { ingredients } from "./data/ingredients.js";
import { recipes } from "./data/recipes.js";
import { getCategoryHref } from "./logic/categories.js";
import { renderAppShell } from "./ui/appShell.js";
import { attachBackToTopButton } from "./ui/backToTop.js";
import { renderIngredientsView } from "./ui/ingredientsView.js";
import { renderTabsNavigation } from "./ui/navigation.js";
import { renderRecipesView } from "./ui/recipesView.js";
import ownedState from "./state/ownedState.js";

const root = document.getElementById("app");

const getCategories = () => {
  const categories = ingredients
    .map((item) => item.bigCategory)
    .filter(Boolean);
  return Array.from(new Set(categories));
};

const getPageContext = () => {
  const { page, category } = document.body.dataset;
  if (page === "category" && category) {
    return { type: "category", category };
  }
  return { type: "recipes" };
};

if (root) {
  ownedState.load();
  renderAppShell(root);

  const tabsList = root.querySelector("[data-tabs-list]");
  const panel = root.querySelector('[data-tab-panel="content"]');
  const categories = getCategories();
  const page = getPageContext();

  if (tabsList) {
    const activeTab =
      page.type === "category" ? page.category : "recipes";
    renderTabsNavigation(tabsList, categories, activeTab);
  }

  if (panel) {
    if (page.type === "category") {
      renderIngredientsView(panel, ingredients, page.category);
    } else {
      renderRecipesView(panel, recipes);
    }
  }

  const tabs = root.querySelector("[data-tabs]");
  if (tabs && panel) {
    attachBackToTopButton(tabs, panel);
  }

  const categoryLinks = root.querySelectorAll(".tabs__tab");
  categoryLinks.forEach((link) => {
    if (link.getAttribute("href") === getCategoryHref(page.category)) {
      link.setAttribute("aria-current", "page");
    }
  });
}
