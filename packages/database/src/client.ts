import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
    log: [{ emit: "event", level: "query" }],
  });

  client.$on("query", (e) => {
    console.log("QUERY DURATION:", e.duration, "ms");
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
