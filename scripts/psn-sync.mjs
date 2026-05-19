#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  getProfileFromAccountId,
  getTitleTrophies,
  getUserPlayedGames,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  getUserTrophyProfileSummary,
  TrophyRarity,
} from "psn-api";

const rarityMap = {
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common",
};

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  loadEnvLocal();

  const now = new Date();
  const { payload, authorization } = args["from-file"]
    ? loadPayloadFromFile(String(args["from-file"]))
    : await fetchPayloadFromPsn(now);

  if (args["sync-supabase"]) {
    await syncSupabase(payload, authorization, now);
    console.log("Synced PSN export into Supabase.");
  }
}

async function fetchPayloadFromPsn(now) {
  const npsso = await getNpsso();
  const authorization = await authenticateWithNpsso(npsso);
  const accountId = getAccountIdFromIdToken(authorization.idToken) ?? "me";

  console.log("Authenticated with PSN. Fetching account summary...");
  const [profile, trophySummary] = await Promise.all([
    getOptionalProfile(authorization, accountId),
    getUserTrophyProfileSummary(authorization, "me"),
  ]);

  console.log("Fetching played games...");
  const playedGames = await fetchAllPlayedGames(authorization);

  console.log("Fetching trophy titles...");
  const trophyTitles = await fetchAllTrophyTitles(authorization);
  const trophyTitleLimit = numberArg("max-trophy-titles");
  const selectedTrophyTitles =
    trophyTitleLimit === undefined ? trophyTitles : trophyTitles.slice(0, trophyTitleLimit);

  console.log(
    `Fetching trophy details for ${selectedTrophyTitles.length} of ${trophyTitles.length} titles...`
  );
  const trophyTitleDetails = await mapWithConcurrency(selectedTrophyTitles, 2, async (title, index) => {
    const count = `${index + 1}/${selectedTrophyTitles.length}`;
    process.stdout.write(`  ${count} ${title.trophyTitleName}\n`);
    return fetchMergedTrophiesForTitle(authorization, title);
  });

  const payload = {
    syncedAt: now.toISOString(),
    account: {
      accountId,
      profile,
      trophySummary,
    },
    playedGames,
    trophyTitles,
    trophyTitleDetails,
  };

  const outPath = args.out ?? defaultOutputPath(now);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote PSN export to ${outPath}`);

  return { payload, authorization };
}

function loadPayloadFromFile(filePath) {
  const payloadPath = path.resolve(filePath);
  const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
  console.log(`Loaded PSN export from ${payloadPath}`);
  return { payload, authorization: null };
}

async function authenticateWithNpsso(npsso) {
  const accessCode = await exchangeNpssoForAccessCode(npsso);
  return exchangeAccessCodeForAuthTokens(accessCode);
}

async function getNpsso() {
  const envNpsso = process.env.PSN_NPSSO?.trim();
  if (envNpsso) return envNpsso;

  if (process.stdin.isTTY) {
    throw new Error("Set PSN_NPSSO or pass the NPSSO on stdin.");
  }

  const stdin = await readStdin();
  const value = stdin.trim();
  if (!value) throw new Error("No NPSSO was provided.");

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed.npsso === "string" && parsed.npsso.trim()) {
      return parsed.npsso.trim();
    }
  } catch {
    // Plain-token stdin is also supported.
  }

  return value;
}

async function readStdin() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  return input;
}

async function getOptionalProfile(authorization, accountId) {
  try {
    return await getProfileFromAccountId(authorization, accountId);
  } catch {
    return null;
  }
}

async function fetchAllPlayedGames(authorization) {
  const limit = numberArg("played-limit") ?? 200;
  const pages = [];
  let offset = 0;

  for (;;) {
    const page = await getUserPlayedGames(authorization, "me", { limit, offset });
    pages.push(...page.titles);

    if (!page.nextOffset || pages.length >= page.totalItemCount) break;
    offset = page.nextOffset;
  }

  return pages;
}

async function fetchAllTrophyTitles(authorization) {
  const limit = numberArg("title-limit") ?? 800;
  const pages = [];
  let offset = 0;

  for (;;) {
    const page = await getUserTitles(authorization, "me", { limit, offset });
    pages.push(...page.trophyTitles);

    if (!page.nextOffset || pages.length >= page.totalItemCount) break;
    offset = page.nextOffset;
  }

  return pages;
}

async function fetchMergedTrophiesForTitle(authorization, title) {
  const options = title.npServiceName === "trophy" ? { npServiceName: "trophy" } : {};

  const [{ trophies: titleTrophies }, { trophies: earnedTrophies }] = await Promise.all([
    getTitleTrophies(authorization, title.npCommunicationId, "all", options),
    getUserTrophiesEarnedForTitle(authorization, "me", title.npCommunicationId, "all", options),
  ]);

  return {
    npCommunicationId: title.npCommunicationId,
    name: title.trophyTitleName,
    platform: title.trophyTitlePlatform,
    trophies: mergeTrophyLists(titleTrophies, earnedTrophies),
  };
}

function mergeTrophyLists(titleTrophies, earnedTrophies) {
  const titleById = new Map(titleTrophies.map((trophy) => [trophy.trophyId, trophy]));

  return earnedTrophies.map((earnedTrophy) => {
    const trophy = { ...titleById.get(earnedTrophy.trophyId), ...earnedTrophy };
    return {
      trophyId: trophy.trophyId,
      isEarned: Boolean(trophy.earned),
      earnedOn: trophy.earned ? trophy.earnedDateTime : null,
      type: trophy.trophyType,
      rarity: trophy.trophyRare ?? null,
      rarityLabel: trophy.trophyRare === undefined ? null : rarityMap[trophy.trophyRare],
      earnedRate: trophy.trophyEarnedRate === undefined ? null : Number(trophy.trophyEarnedRate),
      trophyName: trophy.trophyName ?? null,
      trophyDetail: trophy.trophyDetail ?? null,
      groupId: trophy.trophyGroupId ?? null,
      iconUrl: trophy.trophyIconUrl ?? null,
      hidden: Boolean(trophy.trophyHidden),
      raw: trophy,
    };
  });
}

async function syncSupabase(payload, authorization, now) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const accountId = payload.account.accountId;
  const avatarUrl = payload.account.profile?.avatars?.find((avatar) => avatar.size === "xl")?.url
    ?? payload.account.profile?.avatars?.[0]?.url
    ?? null;

  const { data: account, error: accountError } = await supabase
    .from("psn_accounts")
    .upsert(
      {
        account_id: accountId,
        online_id: payload.account.profile?.onlineId ?? null,
        avatar_url: avatarUrl,
        is_plus: payload.account.profile?.isPlus ?? null,
        trophy_summary: payload.account.trophySummary,
        raw_profile: payload.account.profile ?? {},
        last_synced_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: "account_id" }
    )
    .select("id")
    .single();

  if (accountError) throw accountError;

  const gameRows = payload.playedGames.map((game) => ({
    title: game.name,
    localized_title: game.localizedName ?? game.name,
    category: game.category ?? null,
    cover_url: game.localizedImageUrl ?? game.imageUrl ?? null,
    hero_url: game.media?.screenshotUrl ?? null,
    psn_title_id: game.titleId,
    psn_concept_id: game.concept?.id ?? null,
    psn_concept_name: game.concept?.name ?? null,
    raw_psn: game,
    updated_at: now.toISOString(),
  }));

  const { error: gamesError } = await supabase
    .from("games")
    .upsert(gameRows, { onConflict: "psn_title_id" });
  if (gamesError) throw gamesError;

  const { data: games, error: gameLookupError } = await supabase
    .from("games")
    .select("id, psn_title_id, psn_concept_id, title")
    .in("psn_title_id", payload.playedGames.map((game) => game.titleId));
  if (gameLookupError) throw gameLookupError;

  const gameByTitleId = new Map(games.map((game) => [game.psn_title_id, game]));
  const gameByConceptId = new Map(
    games.filter((game) => game.psn_concept_id !== null).map((game) => [game.psn_concept_id, game])
  );

  const progressRows = payload.playedGames
    .map((game) => {
      const savedGame = gameByTitleId.get(game.titleId);
      if (!savedGame) return null;

      return {
        psn_account_id: account.id,
        game_id: savedGame.id,
        service: game.service ?? null,
        play_count: game.playCount ?? null,
        play_duration_iso: game.playDuration ?? null,
        play_duration_seconds: parseIsoDurationSeconds(game.playDuration),
        first_played_at: game.firstPlayedDateTime ?? null,
        last_played_at: game.lastPlayedDateTime ?? null,
        raw_psn: game,
        last_synced_at: now.toISOString(),
      };
    })
    .filter(Boolean);

  if (progressRows.length > 0) {
    const { error } = await supabase
      .from("psn_game_progress")
      .upsert(progressRows, { onConflict: "psn_account_id,game_id" });
    if (error) throw error;
  }

  const trophyTitleRows = payload.trophyTitles.map((title) => {
    const game = findGameForTrophyTitle(title, gameByTitleId, gameByConceptId);

    return {
      psn_account_id: account.id,
      game_id: game?.id ?? null,
      np_communication_id: title.npCommunicationId,
      np_service_name: title.npServiceName,
      trophy_set_version: title.trophySetVersion ?? null,
      name: title.trophyTitleName,
      platform: title.trophyTitlePlatform ?? null,
      icon_url: title.trophyTitleIconUrl ?? null,
      has_trophy_groups: title.hasTrophyGroups ?? null,
      defined_trophies: title.definedTrophies ?? {},
      earned_trophies: title.earnedTrophies ?? {},
      progress: title.progress ?? null,
      hidden: title.hiddenFlag ?? null,
      last_updated_at: title.lastUpdatedDateTime ?? null,
      raw_psn: title,
      last_synced_at: now.toISOString(),
    };
  });

  if (trophyTitleRows.length > 0) {
    const { error } = await supabase
      .from("psn_trophy_titles")
      .upsert(trophyTitleRows, { onConflict: "psn_account_id,np_communication_id" });
    if (error) throw error;
  }

  const trophyRows = payload.trophyTitleDetails.flatMap((title) =>
    title.trophies.map((trophy) => ({
      psn_account_id: account.id,
      np_communication_id: title.npCommunicationId,
      trophy_id: trophy.trophyId,
      group_id: trophy.groupId,
      type: trophy.type,
      rarity: trophy.rarity,
      rarity_label: trophy.rarityLabel,
      earned_rate: trophy.earnedRate,
      hidden: trophy.hidden,
      earned: trophy.isEarned,
      earned_at: trophy.earnedOn,
      name: trophy.trophyName,
      detail: trophy.trophyDetail,
      icon_url: trophy.iconUrl,
      raw_psn: trophy.raw,
      last_synced_at: now.toISOString(),
    }))
  );

  if (trophyRows.length > 0) {
    const { error } = await supabase
      .from("psn_trophies")
      .upsert(trophyRows, { onConflict: "psn_account_id,np_communication_id,trophy_id" });
    if (error) throw error;
  }

  if (args["save-tokens"]) {
    if (!authorization) {
      throw new Error("--save-tokens requires a fresh PSN auth run, not --from-file.");
    }

    const { error } = await supabase.from("psn_auth_tokens").upsert(
      {
        psn_account_id: account.id,
        access_token: authorization.accessToken,
        refresh_token: authorization.refreshToken,
        access_token_expires_at: new Date(now.getTime() + authorization.expiresIn * 1000).toISOString(),
        refresh_token_expires_at: authorization.refreshTokenExpiresIn
          ? new Date(now.getTime() + authorization.refreshTokenExpiresIn * 1000).toISOString()
          : null,
        token_type: authorization.tokenType,
        scope: authorization.scope,
        updated_at: now.toISOString(),
      },
      { onConflict: "psn_account_id" }
    );
    if (error) throw error;
  }
}

function findGameForTrophyTitle(title, gameByTitleId, gameByConceptId) {
  const byTitleId = gameByTitleId.get(title.npCommunicationId);
  if (byTitleId) return byTitleId;

  for (const game of gameByConceptId.values()) {
    if (game.title === title.trophyTitleName) return game;
  }

  return null;
}

function parseIsoDurationSeconds(duration) {
  if (!duration) return null;
  const match = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return null;

  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match;
  return (
    Number(days) * 86400 +
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds)
  );
}

function getAccountIdFromIdToken(idToken) {
  if (!idToken) return null;

  const [, payload] = idToken.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
    return decoded.sub ?? decoded.account_id ?? null;
  } catch {
    return null;
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const [key, inlineValue] = arg.slice(2).split("=");
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }

  return parsed;
}

function numberArg(name) {
  const value = args[name];
  if (value === undefined || value === true) return undefined;

  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) {
    throw new Error(`--${name} must be a positive number.`);
  }

  return number;
}

function defaultOutputPath(now) {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return path.join("exports", "psn", `psn-sync-${stamp}.json`);
}

function loadEnvLocal() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
