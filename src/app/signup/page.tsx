"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Handle signup (will be connected to API later)
    router.push("/login");
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input type="text" placeholder="Name" className="border p-2" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" placeholder="Email" className="border p-2" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="text" placeholder="Phone Number" className="border p-2" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input type="password" placeholder="Password" className="border p-2" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" className="bg-green-500 text-white px-4 py-2">Sign Up</button>
      </form>
    </div>
  );
}



// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function SignupPage() {
//   const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
//   const [error, setError] = useState("");
//   const router = useRouter();

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");

//     const res = await fetch("/api/auth/signup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });

//     if (res.ok) {
//       router.push("/login");
//     } else {
//       const data = await res.json();
//       setError(data.error);
//     }
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit} className="flex flex-col gap-2">
//         <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2" />
//         <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2" />
//         <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border p-2" />
//         <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2" />
//         <button type="submit" className="px-4 py-2 bg-green-500 text-white">Sign Up</button>
//       </form>
//     </div>
//   );
// }
