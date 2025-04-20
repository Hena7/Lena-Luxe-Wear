// import { authOptions } from "@/app/lib/authOptions";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";

// export default async function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const session = await getServerSession(authOptions);

//   if (!session) { 
//     redirect("/login");
//   }

//   return <>{children}</>;
// }
