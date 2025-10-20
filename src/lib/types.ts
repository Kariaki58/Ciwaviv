export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: {
    src: string;
    alt: string;
    aiHint: string;
  }[];
  category: string;
  tags: string[];
  sizes: string[];
  colors: string[];
};

export type CartItem = {
  id: string; // Composite ID: productId-size-color
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};
