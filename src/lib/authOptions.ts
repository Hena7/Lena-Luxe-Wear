// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import  prisma  from ".././lib/prisma";
// import bcrypt from "bcrypt";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const user = await prisma.user.findUnique({ where: { email: credentials.email } });

//         if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
//           throw new Error("Invalid credentials");
//         }

//         return { id: user.id, email: user.email, name: user.name };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id; // ✅ Include user ID in JWT
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id; // ✅ Ensure session includes user ID
//       }
//       return session;
//     },
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);
