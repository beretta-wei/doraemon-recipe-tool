import { ingredientsSource } from "./ingredients-source.js";

const splitMultiValue = (value) => {
  if (!value) {
    return [];
  }
  return String(value)
    .split("、")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const ingredients = ingredientsSource.map((item, index) => ({
  id: `ingredient-${String(index + 1).padStart(3, "0")}`,
  name: item.name,
  bigCategory: item.bigCategory,
  smallCategory: item.smallCategory,
  seasons: splitMultiValue(item.seasons),
  obtainMethod: splitMultiValue(item.obtainMethod),
  obtainLocation: splitMultiValue(item.obtainLocation),
  owned: item.owned ?? false,
}));

export default ingredients;
