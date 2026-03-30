import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./jp-notes.db" });
const prisma = new PrismaClient({ adapter });

export default prisma;
