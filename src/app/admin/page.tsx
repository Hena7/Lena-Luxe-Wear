"use client";

import { useState } from "react";

export default function Admin() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const addProduct = async () => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, imageUrl }),
    });

    if (res.ok) {
      alert("Product added successfully!");
      setName("");
      setPrice("");
      setImageUrl("");
    } else {
      alert("Failed to add product");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <input
        type="text"
        placeholder="Product Name"
        className="p-2 border rounded mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        className="p-2 border rounded mb-2"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Image URL"
        className="p-2 border rounded mb-2"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button
        onClick={addProduct}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Product
      </button>
    </div>
  );
}
