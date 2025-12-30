import { recipes } from "../../data/recipes.js";
import { renderRecipesView } from "../recipesView.js";

export function renderRecipeTab(container) {
  renderRecipesView(container, recipes);
}
