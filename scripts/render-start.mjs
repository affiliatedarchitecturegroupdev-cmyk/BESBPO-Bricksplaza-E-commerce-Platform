#!/usr/bin/env node
/**
 * Render start: migrate Supabase, then the Nitro Node server.
 * Build does not touch the database. This process must listen on PORT.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

if (!databaseUrl) {
  console.error(
    "[start] DATABASE_URL is missing. In Render, set the Supabase session pooler URI. The host looks like aws-0-<region>.pooler.supabase.com. Do not use db.<ref>.supabase.co.",
  );
  process.exit(1);
}

if (databaseUrl.includes("@db.") && databaseUrl.includes(".supabase.co")) {
  console.error(
    "[start] DATABASE_URL points at Supabase's direct host. Render cannot resolve it. In Supabase: Connect → Session pooler, and paste that URI.",
  );
  process.exit(1);
}

const env = { ...process.env, HOST: process.env.HOST || "0.0.0.0" };

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: root, env, stdio: "inherit" });
    const stop = (signal) => child.kill(signal);
    process.on("SIGTERM", stop);
    process.on("SIGINT", stop);
    child.on("exit", (code, signal) => {
      process.off("SIGTERM", stop);
      process.off("SIGINT", stop);
      resolve(code ?? (signal ? 1 : 0));
    });
  });
}

const migrated = await run(["scripts/migrate.mjs"]);
if (migrated !== 0) process.exit(migrated);

const server = join(root, ".output/server/index.mjs");
console.log(`[start] listening via ${server} on port ${env.PORT || "3000"}`);
process.exit(await run([".output/server/index.mjs"]));
