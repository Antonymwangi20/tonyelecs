
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Laptops' | 'Mobile' | 'Audio' | 'Home' | 'Components';
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  isHot?: boolean;
  reviewList?: Review[];
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  items: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  orders?: Order[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating';

export type UserRole = 'customer' | 'manager' | 'super-admin';
