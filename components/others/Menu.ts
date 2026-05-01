import type { ImageAsset } from "./ImageAsset";

export type Menu = {
  id: string;
  name: string;
  description: string;
  price: string;
  productIds: string[];
  images: ImageAsset[];
};
