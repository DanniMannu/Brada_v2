import type { ImageAsset } from "./ImageAsset";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  images: ImageAsset[];
};
