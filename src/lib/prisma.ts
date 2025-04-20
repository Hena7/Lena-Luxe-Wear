// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client instance.
// This helps prevent multiple instances during development with hot-reloading.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Check if we are in production or if the global prisma instance doesn't exist yet.
// If so, create a new instance. Otherwise, reuse the existing global instance.
const prisma = global.prisma || new PrismaClient({
    // Optional: Add logging configuration
    // log: ['query', 'info', 'warn', 'error'], // Uncomment to see SQL queries in console
});

// In development, assign the created prisma client to the global variable.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the single prisma instance.
export default prisma;





// import { PrismaClient } from "@prisma/client";
//  const prisma = new PrismaClient();
//  export default prisma;