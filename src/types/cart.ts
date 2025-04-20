// src/types/cart.ts (Optional file)
import type { Product } from '@prisma/client'; // Assuming Product includes id, name, price, imageUrl

// Define what information we need for each item in the cart
export interface CartItem extends Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'> {
    // Add other relevant fields from Product if needed (e.g., maybe 'stock' to prevent adding more than available)
    quantity: number;
}

// Define the overall cart state
export interface CartState {
    items: CartItem[];
    // Could add other cart properties like total amount, item count later
}