import { recipes } from "../../data/recipes.js";
import { renderRecipesView } from "../recipesView.js";

export function renderRecipeTab(container) {
  if (!Array.isArray(recipes) || recipes.length === 0) {
    console.warn(
      "recipes 資料為空或格式不正確，請確認 src/data/recipes.js 的匯出內容。"
    );
  }
  renderRecipesView(container, recipes);
}
