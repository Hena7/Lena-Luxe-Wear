export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-lg">Total Orders: 5</p>
      <p className="text-lg">Total Revenue: $200</p>
    </div>
  );
}






// "use client";

// import LogoutButton from "@/components/LoguotBtn";
// import { redirect } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";

// export default function Dashboard() {

//   const { data: session, status } = useSession();
//   const [totalAmount, setTotalAmount] = useState<number | null>(null);

//   useEffect(() => {
//     if (session) {
//       fetch("/api/orders")
//         .then((res) => res.json())
//         .then((data) => setTotalAmount(data.totalAmount));
//     }
//   }, [session]);

//   if (status === "loading") return <p>Loading...</p>;
//   if (!session) return <p>You must be signed in to view the dashboard.</p>;
//   if (!session) {
//     redirect("/login") // Redirects if not authenticated
//     // return <p className="text-center mt-10 text-red-500">Access Denied. Please log in.</p>;
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-4xl mb-4 font-bold">Welcome, {session.user?.name}!</h1>
//       <p className="text-teal-300 text-2xl">Your email: {session.user?.email}</p>
//       <img className="max-w-50 m-5 border-2 border-amber-600" src="./heni.jpg" alt=""/>
//       <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
//       <p className="text-lg">Total Order Cost: ${totalAmount}</p>
//     </div>
//      <LogoutButton />
//     </div>
//   );
// }


// /*
// import LogoutButton from "@/components/LoguotBtn";
// import ProtectedRoute from "@/components/ProtectRoute";


// export default async function Dashboard() {
 

//   return (
//     <ProtectedRoute>
//   <div className="flex flex-col items-center justify-center min-h-screen">
//   <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
//      <LogoutButton />
//     </div>
//     </ProtectedRoute>
//   );
// }


// */