// src/contexts/CartContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
// Assuming you created the types file:
// import type { CartItem, CartState } from '@/types/cart';
// OR define types directly here if you prefer:
import type { Product } from '@prisma/client';

export interface CartItem extends Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'> {
    quantity: number;
}
export interface CartState {
    items: CartItem[];
}
// End type definitions

interface CartContextProps extends CartState {
    addItem: (item: Product, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, newQuantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getCartTotal: () => number;
    isCartLoading: boolean; // Add loading state for persistence
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

// Helper function to get cart from local storage
const getInitialCart = (): CartState => {
    if (typeof window === 'undefined') return { items: [] }; // Return empty on server
    try {
        const storedCart = localStorage.getItem('shoppingCart');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            // Basic validation (check if it has an items array)
            if (Array.isArray(parsedCart?.items)) {
                 // TODO: Add more robust validation of item structure if needed
                 return parsedCart as CartState;
            }
        }
    } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
    }
    return { items: [] }; // Default empty cart
};


export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<CartState>({ items: [] }); // Initialize empty
    const [isCartLoading, setIsCartLoading] = useState(true); // Cart starts loading

    // Load cart from localStorage on initial mount (client-side only)
    useEffect(() => {
        setCart(getInitialCart());
        setIsCartLoading(false); // Mark loading as finished
        console.log("Cart loaded from localStorage");
    }, []);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
         // Don't save during initial load before hydration is complete
        if (!isCartLoading) {
            try {
                localStorage.setItem('shoppingCart', JSON.stringify(cart));
                console.log("Cart saved to localStorage");
            } catch (error) {
                console.error("Failed to save cart to localStorage:", error);
            }
        }
    }, [cart, isCartLoading]);

    // Function to add an item (or increase quantity)
    const addItem = useCallback((product: Product, quantity: number = 1) => {
        if (quantity <= 0) return; // Ignore invalid quantity

        setCart((prevCart) => {
            const existingItemIndex = prevCart.items.findIndex(item => item.id === product.id);
            let newItems = [...prevCart.items];

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const updatedItem = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
                 // Optional: Check against stock if available in product data
                 // if(product.stock && updatedItem.quantity > product.stock) {
                 //    alert("Cannot add more than available stock!"); // Or other feedback
                 //    return prevCart; // Don't update if stock exceeded
                 // }
                newItems[existingItemIndex] = updatedItem;
            } else {
                // Item doesn't exist, add new item
                 // Optional: Check against stock
                 // if(product.stock && quantity > product.stock) {
                 //    alert("Cannot add more than available stock!");
                 //    return prevCart; // Don't add if stock exceeded
                 // }
                newItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl, // Make sure imageUrl exists on product
                    quantity: quantity,
                });
            }
            return { ...prevCart, items: newItems };
        });
    }, []); // Empty dependency array is okay for useCallback if it doesn't depend on external state besides setCart setter

    // Function to completely remove an item
    const removeItem = useCallback((itemId: string) => {
        setCart((prevCart) => ({
            ...prevCart,
            items: prevCart.items.filter(item => item.id !== itemId)
        }));
    }, []);

    // Function to update the quantity of an existing item
    const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
         if (newQuantity <= 0) {
            // If quantity is zero or less, remove the item
             removeItem(itemId);
             return;
        }
        setCart((prevCart) => ({
            ...prevCart,
            items: prevCart.items.map(item =>
                item.id === itemId
                ? { ...item, quantity: newQuantity }
                // Optional: Add stock check here too if product data is available
                : item
            )
        }));
    }, [removeItem]); // Include removeItem in dependency array

    // Function to clear the entire cart
    const clearCart = useCallback(() => {
        setCart({ items: [] });
    }, []);

    // Helper function to get total number of items (sum of quantities)
    const getItemCount = useCallback(() => {
         return cart.items.reduce((total, item) => total + item.quantity, 0);
    }, [cart.items]); // Depends on items array


    // Helper function to calculate the total price of the cart
    const getCartTotal = useCallback(() => {
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart.items]); // Depends on items array

    return (
        <CartContext.Provider value={{
            ...cart, // Spread current cart items
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getItemCount,
            getCartTotal,
            isCartLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the CartContext
export const useCart = (): CartContextProps => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};