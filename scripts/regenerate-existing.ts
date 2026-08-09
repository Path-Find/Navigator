#!/usr/bin/env bun
/**
 * Regenerate cover letters for existing saved jobs through the live production pipeline.
 *
 * Unlike web-planning-batch.ts (which scrapes + inserts new jobs), this takes a list of
 * existing jobIds already in Neon, re-runs analysis + cover letter + critique loop against
 * them through the real gemini-proxy, and UPDATEs those same rows.
 *
 * Usage:
 *   bun scripts/regenerate-existing.ts <jobId1> <jobId2> ...
 *
 * Requires Navigator .env: NEON_*, TEST_EMAIL, TEST_PASSWORD (or NEON_AUTH_PASSWORD)
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { JOB_ANALYSIS_PROMPTS, COVER_LETTER_PROMPTS } from "../src/prompts/index.ts";
import { AGENT_LOOP, AI_TEMPERATURE } from "../src/constants.ts";

const ROOT = join(import.meta.dir, "..");
const PAIRS_DIR = join(ROOT, "tests/runs/pairs/2026-08-08-realistic-fit-pilot");
const PROXY = "https://navigator-two-jet.vercel.app/api/gemini-proxy";

function loadEnv() {
  const raw = readFileSync(join(ROOT, ".env"), "utf8");
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnv();

const sql = neon(process.env.NEON_DATABASE_URL!);
const AUTH = (process.env.NEON_AUTH_BASE_URL || process.env.VITE_NEON_AUTH_URL)!.replace(/\/$/, "");
const EMAIL = process.env.TEST_EMAIL!;
const PASSWORD = process.env.TEST_PASSWORD || process.env.NEON_AUTH_PASSWORD!;

type ResumeProfile = {
  id: string;
  name: string;
  blocks: Array<{
    id: string;
    type: string;
    title: string;
    organization: string;
    dateRange: string;
    bullets: string[];
    isVisible: boolean;
  }>;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

function stringifyProfile(profile: ResumeProfile) {
  return profile.blocks
    .filter((b) => b.isVisible !== false)
    .map(
      (b) =>
        `BLOCK_ID: ${b.id}\nROLE: ${b.title}\nORG: ${b.organization}\nDATE: ${b.dateRange}\nDETAILS:\n${(b.bullets || []).map((x) => `- ${x}`).join("\n")}\n`
    )
    .join("\n---\n");
}

function cleanJson(text: string) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

function cleanLetter(text: string) {
  return text
    .replace(/\(BLOCK_ID:\s*[a-zA-Z0-9-]+\)/g, "")
    .replace(/BLOCK_ID:\s*[a-zA-Z0-9-]+/g, "")
    .replace(/^```[\w]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

async function auth(): Promise<{ userId: string; jwt: string; fullName: string | null }> {
  const sign = await fetch(`${AUTH}/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!sign.ok) throw new Error(`Sign-in failed ${sign.status}: ${await sign.text()}`);
  const setCookie = sign.headers.getSetCookie?.() ?? [];
  let cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  if (!cookie.includes("session")) {
    const all = [...sign.headers.entries()].filter(([k]) => k.toLowerCase() === "set-cookie").map(([, v]) => v.split(";")[0]);
    cookie = all.join("; ");
  }
  const tokenRes = await fetch(`${AUTH}/token`, { headers: { Cookie: cookie } });
  if (!tokenRes.ok) throw new Error(`JWT failed ${tokenRes.status}: ${await tokenRes.text()}`);
  const { token } = (await tokenRes.json()) as { token: string };
  const user = (await sign.json()) as { user: { id: string } };
  const userId = user.user.id;
  const profileRows = await sql`SELECT full_name FROM profiles WHERE id = ${userId}`;
  const fullName = (profileRows[0]?.full_name as string | null) || null;
  return { userId, jwt: token, fullName };
}

async function callProxy(
  jwt: string,
  prompt: string,
  task: string,
  feature?: string,
  generationConfig?: Record<string, unknown>
): Promise<string> {
  let lastErr = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({
        payload: { contents: [{ role: "user", parts: [{ text: prompt }] }] },
        task,
        feature,
        generationConfig,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && typeof body?.text === "string") return body.text;
    if (res.ok && body?.error) {
      lastErr = `Proxy error: ${JSON.stringify(body)}`;
    } else {
      lastErr = `Proxy ${res.status}: ${JSON.stringify(body).slice(0, 400)}`;
    }
    if (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(lastErr);
  }
  throw new Error(lastErr || "Proxy failed after retries");
}

async function loadResume(userId: string): Promise<ResumeProfile> {
  const rows = await sql`SELECT profile_id, name, content FROM resumes WHERE user_id = ${userId}`;
  let best: ResumeProfile | null = null;
  let bestN = 0;
  for (const row of rows) {
    const p = (typeof row.content === "string" ? JSON.parse(row.content) : row.content) as ResumeProfile;
    const n = (p.blocks || []).filter((b) => b.isVisible !== false).length;
    if (n > bestN) {
      best = p;
      bestN = n;
    }
  }
  if (!best || bestN === 0) throw new Error("No non-empty resume profile for user");
  return best;
}

async function processOne(
  jobId: string,
  userId: string,
  jwt: string,
  resume: ResumeProfile,
  candidateName: string | undefined,
  n: number
) {
  const rows = await sql`SELECT job_title, company, description, original_text, url FROM jobs WHERE id = ${jobId} AND user_id = ${userId}`;
  const job = rows[0];
  if (!job) throw new Error(`Job ${jobId} not found for user`);

  const cleaned = (job.description || job.original_text) as string;
  if (!cleaned) throw new Error(`No description/original_text for job ${jobId}`);
  const resumeCtx = stringifyProfile(resume);

  const parsePrompt = JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.PARSE(cleaned);
  const parsedRaw = await callProxy(jwt, parsePrompt, "extraction", undefined, { responseMimeType: "application/json", temperature: AI_TEMPERATURE.STRICT });
  const parsedJob = JSON.parse(cleanJson(parsedRaw));
  const scorePrompt = JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.SCORE(
    JSON.stringify(parsedJob, null, 2),
    `VISIBLE RESUME EVIDENCE:\n${resumeCtx}`
  );
  const scoreRaw = await callProxy(jwt, scorePrompt, "analysis", undefined, { responseMimeType: "application/json", temperature: AI_TEMPERATURE.STRICT });
  const analysis = { ...JSON.parse(cleanJson(scoreRaw)), distilledJob: parsedJob };
  const score = analysis.compatibilityScore ?? null;
  const tailoring: string[] = analysis.coverLetterTailoringInstructions || [
    "Lead with the strongest transferable evidence from the resume.",
  ];

  const focusedJd = [
    `Role: ${analysis.distilledJob?.roleTitle || job.job_title}`,
    `Company: ${analysis.distilledJob?.companyName || job.company}`,
    `Key skills: ${(analysis.distilledJob?.keySkills || []).join(", ")}`,
    `Responsibilities: ${(analysis.distilledJob?.coreResponsibilities || []).join("; ")}`,
    "",
    cleaned.slice(0, 2000),
  ].join("\n");

  let letterResume = resume;
  const rec: string[] | undefined = analysis.recommendedBlockIds;
  if (rec?.length) {
    const filtered = { ...resume, blocks: resume.blocks.filter((b) => rec.includes(b.id) || b.isVisible !== false) };
    const onlyRec = { ...resume, blocks: resume.blocks.filter((b) => rec.includes(b.id)) };
    letterResume = onlyRec.blocks.length >= 2 ? onlyRec : filtered;
  }

  const template = COVER_LETTER_PROMPTS.COVER_LETTER.VARIANTS.v1_direct;
  // Mirrors jobAiService.ts: for an extreme mismatch, go straight to an honestly-framed
  // first draft instead of burning retry attempts on persuasion that's unlikely to work.
  const EXTREME_MISMATCH_THRESHOLD = 20;
  const isExtremeMismatch = typeof score === "number" && score < EXTREME_MISMATCH_THRESHOLD;
  const initialInstruction = isExtremeMismatch
    ? `STRICT INSTRUCTION: This role's compatibility score is extremely low (${score}/100) — a large, hard-to-bridge gap exists. Do not attempt to persuade past it. Include one clear, plain-language sentence that honestly names the specific gap (e.g. missing credential, licence, or years of direct experience) rather than glossing over it. Lead with genuine transferable strengths, but stay honest about the mismatch.`
    : undefined;
  let letterPrompt = COVER_LETTER_PROMPTS.COVER_LETTER.GENERATE(
    template,
    focusedJd,
    stringifyProfile(letterResume),
    tailoring,
    initialInstruction,
    undefined,
    undefined,
    candidateName
  );
  if (score != null) {
    letterPrompt += `\n\nCOMPATIBILITY SCORE CONTEXT: ${score}/100. Calibrate framing accordingly.`;
  }

  let letter = cleanLetter(await callProxy(jwt, letterPrompt, "analysis", "cover_letter"));
  let critique: Record<string, unknown> | null = null;
  let attempts = 1;
  let decision = "Average";

  if (isExtremeMismatch) {
    // Mirrors jobAiService.ts: an honest admission of an extreme mismatch will
    // essentially never score Strong/Exceptional, so skip the retry loop entirely.
    const critRaw = await callProxy(
      jwt,
      COVER_LETTER_PROMPTS.CRITIQUE_COVER_LETTER(focusedJd, letter, stringifyProfile(letterResume)),
      "analysis",
      "cover_letter",
      { responseMimeType: "application/json" }
    );
    critique = JSON.parse(cleanJson(critRaw));
    decision = String(critique.decision || "Average");
  } else {
  while (attempts <= AGENT_LOOP.MAX_RETRIES + 1) {
    const critRaw = await callProxy(
      jwt,
      COVER_LETTER_PROMPTS.CRITIQUE_COVER_LETTER(focusedJd, letter, stringifyProfile(letterResume)),
      "analysis",
      "cover_letter",
      { responseMimeType: "application/json" }
    );
    critique = JSON.parse(cleanJson(critRaw));
    decision = String(critique.decision || "Average");
    if (decision === "Strong" || decision === "Exceptional") break;
    if (attempts > AGENT_LOOP.MAX_RETRIES) {
      // Mirrors jobAiService.ts's generateCoverLetterWithQuality: force one final
      // honest rewrite instead of silently shipping the last unacknowledged draft.
      const feedback = Array.isArray(critique.feedback) ? (critique.feedback as string[]) : [];
      const honestyInstruction = `FINAL ATTEMPT: this draft has not met the internal quality bar after ${attempts} attempts.\nCRITIQUE FEEDBACK: ${feedback.join("; ")}\nSTRICT INSTRUCTION: Stop attempting further persuasion. Include one clear, plain-language sentence that honestly names the specific gap identified above (e.g. a missing credential, licence, or years of direct experience) rather than glossing over it. The letter should read as self-aware about the gap, not falsely confident. Keep everything else about the letter's real strengths intact.`;
      const rewrite = COVER_LETTER_PROMPTS.COVER_LETTER.GENERATE(
        template,
        focusedJd,
        stringifyProfile(letterResume),
        tailoring,
        honestyInstruction,
        undefined,
        undefined,
        candidateName
      );
      letter = cleanLetter(await callProxy(jwt, rewrite, "analysis", "cover_letter"));
      attempts++;
      break;
    }
    const fixInstr = [...tailoring, "CRITIQUE_FIX", ...(Array.isArray(critique.feedback) ? (critique.feedback as string[]) : [])];
    const rewrite = COVER_LETTER_PROMPTS.COVER_LETTER.GENERATE(
      template,
      focusedJd,
      stringifyProfile(letterResume),
      fixInstr,
      Array.isArray(critique.feedback) ? (critique.feedback as string[]).join("\n") : undefined,
      undefined,
      undefined,
      candidateName
    );
    letter = cleanLetter(await callProxy(jwt, rewrite, "analysis", "cover_letter"));
    attempts++;
  }
  }

  const company = analysis.distilledJob?.companyName || job.company;
  const title = analysis.distilledJob?.roleTitle || job.job_title;

  await sql`
    UPDATE jobs SET
      cover_letter = ${letter},
      fit_score = ${score},
      analysis = ${JSON.stringify(analysis)}::jsonb,
      cover_letter_critique = ${critique ? JSON.stringify(critique) : null}::jsonb,
      job_title = ${title},
      company = ${company},
      canonical_role = ${analysis.distilledJob?.canonicalTitle || null},
      updated_at = ${new Date().toISOString()}
    WHERE id = ${jobId} AND user_id = ${userId}
  `;

  const folder = `${String(n).padStart(3, "0")}-${slugify(company)}-${slugify(title)}`;
  const outDir = join(PAIRS_DIR, folder);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "job-description.txt"), cleaned);
  writeFileSync(join(outDir, "cover-letter.txt"), letter);
  writeFileSync(
    join(outDir, "meta.json"),
    JSON.stringify(
      {
        jobId,
        job_title: title,
        company,
        url: job.url,
        fit_score: score,
        source: "realistic-fit-pilot-regen",
        jd_chars: cleaned.length,
        letter_chars: letter.length,
        critique_decision: decision,
        attempts,
      },
      null,
      2
    )
  );

  return { ok: true as const, n, company, title, score, jobId, decision, attempts, folder };
}

async function main() {
  const jobIds = process.argv.slice(2);
  if (jobIds.length === 0) {
    console.error("Usage: bun scripts/regenerate-existing.ts <jobId1> <jobId2> ...");
    process.exit(1);
  }
  if (!EMAIL || !PASSWORD) throw new Error("TEST_EMAIL / TEST_PASSWORD missing");

  const { userId, jwt, fullName } = await auth();
  console.log(`Auth OK user=${userId} full_name=${fullName || "(unset)"}`);
  const resume = await loadResume(userId);
  console.log(`Resume: blocks=${resume.blocks.filter((b) => b.isVisible !== false).length}`);

  mkdirSync(PAIRS_DIR, { recursive: true });
  const summary: unknown[] = [];
  let n = 1;

  for (const jobId of jobIds) {
    try {
      console.log(`\n[${n}] ${jobId}`);
      const result = await processOne(jobId, userId, jwt, resume, fullName || undefined, n);
      console.log(`  OK score=${result.score} decision=${result.decision} attempts=${result.attempts} -> ${result.folder}`);
      summary.push(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  FAIL ${msg}`);
      summary.push({ ok: false, jobId, error: msg });
    }
    n++;
  }

  writeFileSync(join(PAIRS_DIR, `summary-${Date.now()}.json`), JSON.stringify(summary, null, 2));
  console.log(`\nDone. ${summary.filter((s: any) => s.ok).length}/${jobIds.length} succeeded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
