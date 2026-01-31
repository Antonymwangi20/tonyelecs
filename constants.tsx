
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Zenith Pro 16 Laptop',
    category: 'Laptops',
    price: 1499.99,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    description: 'Ultra-thin performance laptop with M3 Max equivalent power and 120Hz OLED display.',
    specs: { 'CPU': '12-Core', 'RAM': '32GB', 'Storage': '1TB SSD' },
    isHot: true
  },
  {
    id: '2',
    name: 'VoltX 5G Smartphone',
    category: 'Mobile',
    price: 899.00,
    rating: 4.9,
    reviews: 2150,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    description: 'The fastest smartphone on the market with a revolutionary camera system.',
    specs: { 'Screen': '6.7 inch', 'Camera': '108MP', 'Battery': '5000mAh' }
  },
  {
    id: '3',
    name: 'SonicWave Noise Cancelling Headphones',
    category: 'Audio',
    price: 349.50,
    rating: 4.7,
    reviews: 843,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description: 'Premium over-ear headphones with industry-leading active noise cancellation.',
    specs: { 'Battery': '40 Hours', 'Weight': '250g', 'Bluetooth': '5.3' },
    isHot: true
  },
  {
    id: '4',
    name: 'Lumina Smart Home Hub',
    category: 'Home',
    price: 129.99,
    rating: 4.5,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    description: 'Control your entire home with one simple, elegant interface.',
    specs: { 'Compatibility': 'Zigbee, Matter', 'Display': '7 inch Touch' }
  },
  {
    id: '5',
    name: 'Titan GT-X 4090 GPU',
    category: 'Components',
    price: 1599.00,
    rating: 5.0,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    description: 'The ultimate graphics processing unit for creators and gamers alike.',
    specs: { 'VRAM': '24GB GDDR6X', 'TDP': '450W' },
    isHot: true
  },
  {
    id: '6',
    name: 'AeroPods Lite',
    category: 'Audio',
    price: 99.99,
    rating: 4.4,
    reviews: 3200,
    image: 'https://images.unsplash.com/photo-1588423770119-9455373038d8?w=800&q=80',
    description: 'Crystal clear audio in a compact, pocketable design.',
    specs: { 'Drivers': '10mm', 'Waterproof': 'IPX4' }
  }
];

export const CATEGORIES = ['All', 'Laptops', 'Mobile', 'Audio', 'Home', 'Components'] as const;
