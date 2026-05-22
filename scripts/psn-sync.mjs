#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
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
  const { authorization, accountId: storedAccountId } = await getAuthorization(now);
  const accountId = getAccountIdFromIdToken(authorization.idToken) ?? storedAccountId ?? "me";

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
  const includeTrophies = Boolean(args["include-trophies"]);
  const trophyTitleDetails = includeTrophies
    ? await fetchTrophyTitleDetails(authorization, trophyTitles, selectedTrophyTitles)
    : [];

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

async function fetchTrophyTitleDetails(authorization, trophyTitles, selectedTrophyTitles) {
  console.log(
    `Fetching trophy details for ${selectedTrophyTitles.length} of ${trophyTitles.length} titles...`
  );

  return mapWithConcurrency(selectedTrophyTitles, 2, async (title, index) => {
    const count = `${index + 1}/${selectedTrophyTitles.length}`;
    process.stdout.write(`  ${count} ${title.trophyTitleName}\n`);
    return fetchMergedTrophiesForTitle(authorization, title);
  });
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

async function getAuthorization(now) {
  const envNpsso = process.env.PSN_NPSSO?.trim();
  if (envNpsso) {
    return {
      authorization: await authenticateWithNpsso(envNpsso),
      accountId: null,
    };
  }

  if (args["use-stored-tokens"]) {
    return getStoredAuthorization(now);
  }

  const npsso = await getNpsso();
  return {
    authorization: await authenticateWithNpsso(npsso),
    accountId: null,
  };
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

async function getStoredAuthorization(now) {
  const supabase = createSupabaseServiceClient();
  const { data: tokenRows, error: tokenError } = await supabase
    .from("psn_auth_tokens")
    .select(
      "psn_account_id, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at, token_type, scope, updated_at"
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1);

  if (tokenError) throw tokenError;

  const token = tokenRows?.[0];
  if (!token?.refresh_token) {
    throw new Error(
      "No stored PSN refresh token was found. Run one sync with PSN_NPSSO and --save-tokens first."
    );
  }

  if (token.refresh_token_expires_at && Date.parse(token.refresh_token_expires_at) <= now.getTime()) {
    throw new Error("Stored PSN refresh token has expired. Set PSN_NPSSO and sync again to create a fresh token.");
  }

  const accountId = await getStoredPsnAccountId(supabase, token.psn_account_id);
  const expiresIn = secondsUntil(token.access_token_expires_at, now);

  if (expiresIn > 60 && token.access_token) {
    return {
      authorization: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn,
        refreshTokenExpiresIn: secondsUntil(token.refresh_token_expires_at, now),
        tokenType: token.token_type ?? "bearer",
        scope: token.scope ?? "",
      },
      accountId,
    };
  }

  const refreshedAuthorization = await exchangeRefreshTokenForAuthTokens(token.refresh_token);

  return {
    authorization: {
      ...refreshedAuthorization,
      refreshToken: refreshedAuthorization.refreshToken ?? token.refresh_token,
      tokenType: refreshedAuthorization.tokenType ?? token.token_type ?? "bearer",
      scope: refreshedAuthorization.scope ?? token.scope ?? "",
    },
    accountId,
  };
}

async function getStoredPsnAccountId(supabase, psnAccountRowId) {
  if (!psnAccountRowId) return null;

  const { data, error } = await supabase
    .from("psn_accounts")
    .select("account_id")
    .eq("id", psnAccountRowId)
    .maybeSingle();

  if (error) throw error;
  return data?.account_id ?? null;
}

function secondsUntil(value, now) {
  const expiresAt = Date.parse(value ?? "");
  if (!Number.isFinite(expiresAt)) return undefined;
  return Math.max(0, Math.floor((expiresAt - now.getTime()) / 1000));
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
  const supabase = createSupabaseServiceClient();

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
    .select("id, psn_title_id, psn_concept_id, title, localized_title, psn_concept_name")
    .in("psn_title_id", payload.playedGames.map((game) => game.titleId));
  if (gameLookupError) throw gameLookupError;

  const gameById = new Map(games.map((game) => [game.id, game]));
  const gameByTitleId = new Map(games.map((game) => [game.psn_title_id, game]));
  const gameByConceptId = new Map(
    games.filter((game) => game.psn_concept_id !== null).map((game) => [game.psn_concept_id, game])
  );
  const gameByNormalizedTitle = buildGameTitleMap(games);
  const playedGameByTitleId = new Map(payload.playedGames.map((game) => [game.titleId, game]));

  const { data: verifiedLinks, error: verifiedLinksError } = await supabase
    .from("psn_title_links")
    .select("np_communication_id, game_id, psn_title_id, match_method, match_confidence")
    .eq("psn_account_id", account.id)
    .eq("verified", true);
  const titleLinksAvailable = !isMissingRelationError(verifiedLinksError);
  if (verifiedLinksError && titleLinksAvailable) throw verifiedLinksError;

  const verifiedLinkByCommunicationId = new Map(
    (titleLinksAvailable ? (verifiedLinks ?? []) : []).map((link) => [link.np_communication_id, link])
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

  const titleLinkRows = [];
  const trophyTitleRows = payload.trophyTitles.map((title) => {
    const verifiedLink = verifiedLinkByCommunicationId.get(title.npCommunicationId);
    const verifiedGame = verifiedLink ? gameById.get(verifiedLink.game_id) : null;
    const match = verifiedGame ? {
      game: verifiedGame,
      method: verifiedLink.match_method ?? "manual",
      confidence: Number(verifiedLink.match_confidence ?? 1),
      verified: true
    } : findGameForTrophyTitle(
      title,
      gameByTitleId,
      gameByConceptId,
      gameByNormalizedTitle,
      playedGameByTitleId
    );
    const game = match?.game ?? null;

    if (game && !match?.verified) {
      titleLinkRows.push({
        psn_account_id: account.id,
        np_communication_id: title.npCommunicationId,
        game_id: game.id,
        psn_title_id: game.psn_title_id,
        match_method: match.method,
        match_confidence: match.confidence,
        verified: false,
        updated_at: now.toISOString(),
      });
    }

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

  if (titleLinksAvailable && titleLinkRows.length > 0) {
    const { error } = await supabase
      .from("psn_title_links")
      .upsert(titleLinkRows, { onConflict: "psn_account_id,np_communication_id" });
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

function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function findGameForTrophyTitle(title, gameByTitleId, gameByConceptId, gameByNormalizedTitle, playedGameByTitleId) {
  const byTitleId = gameByTitleId.get(title.npCommunicationId);
  if (byTitleId) {
    return {
      game: byTitleId,
      method: "np_communication_id_to_title_id",
      confidence: 0.6
    };
  }

  const normalizedTrophyTitle = normalizeTitle(title.trophyTitleName);
  const candidates = gameByNormalizedTitle.get(normalizedTrophyTitle) ?? [];
  if (candidates.length === 1) {
    return {
      game: candidates[0],
      method: "normalized_title",
      confidence: 0.9
    };
  }
  if (candidates.length > 1) {
    return selectNearestPlayedCandidate(title, candidates, playedGameByTitleId, "normalized_title_time_nearest", 0.86);
  }

  const conceptCandidatesById = new Map();

  for (const game of gameByConceptId.values()) {
    if (normalizeTitle(game.title) === normalizedTrophyTitle) {
      conceptCandidatesById.set(game.id, game);
    }
    if (game.localized_title && normalizeTitle(game.localized_title) === normalizedTrophyTitle) {
      conceptCandidatesById.set(game.id, game);
    }
    if (game.psn_concept_name && normalizeTitle(game.psn_concept_name) === normalizedTrophyTitle) {
      conceptCandidatesById.set(game.id, game);
    }
  }

  const conceptCandidates = Array.from(conceptCandidatesById.values());
  if (conceptCandidates.length === 1) {
    return {
      game: conceptCandidates[0],
      method: "normalized_concept_name",
      confidence: 0.84
    };
  }
  if (conceptCandidates.length > 1) {
    return selectNearestPlayedCandidate(title, conceptCandidates, playedGameByTitleId, "normalized_concept_time_nearest", 0.8);
  }

  const fuzzyCandidates = findFuzzyTitleCandidates(title.trophyTitleName, gameByNormalizedTitle);

  if (fuzzyCandidates.length === 0) return null;
  if (fuzzyCandidates.length === 1) {
    return {
      game: fuzzyCandidates[0],
      method: "fuzzy_title_contains",
      confidence: 0.7
    };
  }

  return selectNearestPlayedCandidate(
    title,
    fuzzyCandidates,
    playedGameByTitleId,
    "fuzzy_title_time_nearest",
    0.65
  );
}

function selectNearestPlayedCandidate(title, candidates, playedGameByTitleId, method, confidence) {
  const titleTime = Date.parse(title.lastUpdatedDateTime ?? "");

  const game = candidates
    .slice()
    .sort((a, b) => {
      const aPlayed = playedGameByTitleId.get(a.psn_title_id);
      const bPlayed = playedGameByTitleId.get(b.psn_title_id);
      const aDuration = parseIsoDurationSeconds(aPlayed?.playDuration) ?? 0;
      const bDuration = parseIsoDurationSeconds(bPlayed?.playDuration) ?? 0;
      if (aDuration !== bDuration) return bDuration - aDuration;

      const aPlayCount = aPlayed?.playCount ?? 0;
      const bPlayCount = bPlayed?.playCount ?? 0;
      if (aPlayCount !== bPlayCount) return bPlayCount - aPlayCount;

      const aDistance = getTimeDistance(aPlayed?.lastPlayedDateTime, titleTime);
      const bDistance = getTimeDistance(bPlayed?.lastPlayedDateTime, titleTime);

      if (aDistance !== bDistance) return aDistance - bDistance;
      return Date.parse(bPlayed?.lastPlayedDateTime ?? "") - Date.parse(aPlayed?.lastPlayedDateTime ?? "");
    })[0];

  return {
    game,
    method,
    confidence
  };
}

function findFuzzyTitleCandidates(title, gameByNormalizedTitle) {
  const trophyTitle = normalizeTitle(title);
  if (!trophyTitle) return [];

  const candidatesById = new Map();

  for (const [gameTitle, games] of gameByNormalizedTitle.entries()) {
    if (gameTitle.length < 4) continue;
    if (trophyTitle.includes(gameTitle) || gameTitle.includes(trophyTitle)) {
      for (const game of games) {
        candidatesById.set(game.id, game);
      }
    }
  }

  return Array.from(candidatesById.values());
}

function buildGameTitleMap(games) {
  const byTitle = new Map();

  for (const game of games) {
    for (const title of [game.title, game.localized_title, game.psn_concept_name]) {
      if (!title) continue;
      const key = normalizeTitle(title);
      const current = byTitle.get(key) ?? [];
      current.push(game);
      byTitle.set(key, current);
    }
  }

  return byTitle;
}

function normalizeTitle(value) {
  const normalized = String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[™®©]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[:：\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized
    .replace(/\biv\b/g, "4")
    .replace(/\biii\b/g, "3")
    .replace(/\bii\b/g, "2")
    .replace(/\bv\b/g, "5");
}

function getTimeDistance(value, targetTime) {
  const time = Date.parse(value ?? "");
  if (!Number.isFinite(time) || !Number.isFinite(targetTime)) return Number.MAX_SAFE_INTEGER;
  return Math.abs(time - targetTime);
}

function isMissingRelationError(error) {
  if (!error) return false;
  return error.code === "42P01" || String(error.message ?? "").includes("psn_title_links");
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
