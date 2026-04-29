export type ProductImage = {
  uri: string;
  name?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  images: ProductImage[]; //1 obrigatório, máx. 2
};
