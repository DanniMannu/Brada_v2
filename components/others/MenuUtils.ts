import type { Menu } from "./Menu";

export const isProductUsedInMenus = (
  productId: string,
  menus: Menu[],
): boolean => {
  return menus.some((menu) => menu.productIds.includes(productId));
};
