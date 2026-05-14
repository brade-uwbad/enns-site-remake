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
  const listingIdArg = process.argv.find((arg) => arg.startsWith("--listing-id="));
  const apply = process.argv.includes("--apply");
  const listingId = listingIdArg ? listingIdArg.split("=")[1] : "";
  if (!listingId) {
    throw new Error("Missing --listing-id=<uuid>.");
  }
  return { listingId, apply };
}

function postalPrefix(postalCode) {
  const normalized = (postalCode ?? "").replace(/\s+/g, "").toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : "";
}

async function getPostalCentroid(supabase, postalCode) {
  const prefix = postalPrefix(postalCode);
  if (!prefix) {
    return { prefix: "", point: null };
  }

  const { data, error } = await supabase
    .from("postal_code_centroids")
    .select("latitude,longitude")
    .eq("postal_prefix", prefix)
    .maybeSingle();

  if (error || !data) {
    return { prefix, point: null };
  }

  const lat = typeof data.latitude === "string" ? Number(data.latitude) : data.latitude;
  const lng = typeof data.longitude === "string" ? Number(data.longitude) : data.longitude;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { prefix, point: null };
  }
  return { prefix, point: { latitude: lat, longitude: lng } };
}

async function main() {
  const { listingId, apply } = parseArgs();
  const { supabaseUrl, serviceRoleKey } = readEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id,title,postal_code,latitude,longitude")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    throw new Error(`Failed to fetch listing: ${listingError.message}`);
  }
  if (!listing) {
    throw new Error(`Listing not found for id ${listingId}`);
  }

  const beforeLat = listing.latitude;
  const beforeLng = listing.longitude;
  const { prefix, point } = await getPostalCentroid(supabase, listing.postal_code);

  console.log(`[listing] id=${listing.id} title="${listing.title}" postal_code="${listing.postal_code}"`);
  console.log(`[before] latitude=${beforeLat} longitude=${beforeLng}`);
  console.log(`[lookup] postal_prefix="${prefix}" found=${point ? "yes" : "no"}`);

  if (!point) {
    console.log("[result] No centroid match. Nothing to update.");
    return;
  }

  console.log(`[centroid] latitude=${point.latitude} longitude=${point.longitude}`);

  if (!apply) {
    console.log("[result] Dry run only. Re-run with --apply to update this listing.");
    return;
  }

  const { error: updateError } = await supabase
    .from("listings")
    .update({ latitude: point.latitude, longitude: point.longitude })
    .eq("id", listing.id);

  if (updateError) {
    throw new Error(`Failed to update listing: ${updateError.message}`);
  }

  console.log("[result] Listing updated from centroid.");
}

main().catch((err) => {
  console.error(`[error] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
