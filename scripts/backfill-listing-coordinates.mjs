#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq < 1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function readEnv() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));

  const supabaseUrl = process.env.STORAGE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.STORAGE_SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin config. Set STORAGE_SUPABASE_URL and STORAGE_SUPABASE_SECRET_KEY (or compatible env names).",
    );
  }
  return { supabaseUrl, serviceRoleKey };
}

function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const pauseArg = process.argv.find((arg) => arg.startsWith("--pause-ms="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
  const pauseMs = pauseArg ? Number(pauseArg.split("=")[1]) : 150;
  return {
    dryRun,
    limit: Number.isFinite(limit) && limit > 0 ? limit : Infinity,
    pauseMs: Number.isFinite(pauseMs) && pauseMs >= 0 ? pauseMs : 150,
  };
}

function buildAddress(row) {
  return [row.address_line, row.city, row.province, row.postal_code]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

function postalPrefix(postalCode) {
  const normalized = (postalCode ?? "").replace(/\s+/g, "").toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : "";
}

async function getPostalCentroid(supabase, postalCode) {
  const prefix = postalPrefix(postalCode);
  if (!prefix) {
    return null;
  }

  const { data, error } = await supabase
    .from("postal_code_centroids")
    .select("latitude,longitude")
    .eq("postal_prefix", prefix)
    .maybeSingle();
  if (error || !data) {
    return null;
  }

  const lat = typeof data.latitude === "string" ? Number(data.latitude) : data.latitude;
  const lng = typeof data.longitude === "string" ? Number(data.longitude) : data.longitude;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { latitude: lat, longitude: lng };
}

async function sleep(ms) {
  if (ms <= 0) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { dryRun, limit, pauseMs } = parseArgs();
  const { supabaseUrl, serviceRoleKey } = readEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const pageSize = 200;
  let scanned = 0;
  let updated = 0;
  let notFound = 0;
  let skippedNoAddress = 0;
  let filledByCentroid = 0;

  console.log(
    `[start] Backfilling listing coordinates${dryRun ? " (dry-run)" : ""}. limit=${
      Number.isFinite(limit) ? limit : "all"
    }`,
  );

  while (updated < limit) {
    const { data, error } = await supabase
      .from("listings")
      .select("id,address_line,city,province,postal_code,latitude,longitude")
      .or("latitude.is.null,longitude.is.null")
      .order("created_at", { ascending: true })
      .range(0, pageSize - 1);

    if (error) {
      throw new Error(`Failed to read listings: ${error.message}`);
    }
    if (!data || data.length === 0) {
      break;
    }

    for (const row of data) {
      if (updated >= limit) {
        break;
      }
      scanned += 1;

      const address = buildAddress(row);
      if (!address) {
        skippedNoAddress += 1;
        continue;
      }

      const pointFromCentroid = await getPostalCentroid(supabase, row.postal_code);
      if (!pointFromCentroid) {
        notFound += 1;
        continue;
      }

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from("listings")
          .update({ latitude: pointFromCentroid.latitude, longitude: pointFromCentroid.longitude })
          .eq("id", row.id);
        if (updateError) {
          console.warn(`[warn] Failed update for ${row.id}: ${updateError.message}`);
          continue;
        }
      }

      updated += 1;
      filledByCentroid += 1;
      if (updated % 25 === 0) {
        console.log(`[progress] updated=${updated} scanned=${scanned}`);
      }
      await sleep(pauseMs);
    }
  }

  console.log(
    `[done] scanned=${scanned} updated=${updated} centroid=${filledByCentroid} no_centroid_match=${notFound} skipped_no_address=${skippedNoAddress}`,
  );
}

main().catch((err) => {
  console.error(`[error] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
