"use client"; // Ensures this runs on the client side

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function LogoutButton() {
  return (
    <button
    
      onClick={() => signOut()}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
