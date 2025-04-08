"use client";
import { useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState([
    { id: "1", name: "T-Shirt", price: 20 },
    { id: "2", name: "Jeans", price: 50 },
  ]); 

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      {cart.length === 0 ? <p>No items in cart</p> : null}
      <ul>
        {cart.map((item) => (
          <li key={item.id} className="border p-2 my-2">
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
      <p className="text-lg font-bold mt-4">Total: ${total}</p>
      <button className="bg-green-500 text-white px-4 py-2 mt-2">Checkout</button>
    </div>
  );
}



// "use client";
// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function CartPage() {
//   const [cartItems, setCartItems] = useState<any[]>([]); // Retrieve from state or localStorage
//   const { data: session } = useSession();
//   const router = useRouter();

//   const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

//   const placeOrder = async () => {
//     if (!session) return router.push("/signup");

//     const res = await fetch("/api/order", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ items: cartItems, totalAmount }),
//     });

//     if (res.ok) {
//       alert("Order placed successfully!");
//       setCartItems([]); // Clear cart
//     } else {
//       alert("Failed to place order.");
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold">Your Cart</h1>
//       {cartItems.length === 0 ? (
//         <p>Cart is empty</p>
//       ) : (
//         <>
//           {cartItems.map((item) => (
//             <div key={item.id} className="border p-2 mb-2">
//               <h2>{item.name}</h2>
//               <p>${item.price}</p>
//             </div>
//           ))}
//           <p className="font-bold">Total: ${totalAmount}</p>
//           <button onClick={placeOrder} className="bg-green-500 text-white px-4 py-2">
//             Place Order
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
