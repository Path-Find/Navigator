#!/usr/bin/env bun
/**
 * Navigator Test Harness
 *
 * Runs a job description through Navigator's full generation pipeline
 * (job fit analysis → cover letter → critique loop) and saves outputs locally.
 *
 * Usage:
 *   bun scripts/test-harness.ts <path-to-job-description.txt> [--variant v1_direct|v2_storytelling|v3_experimental_pro]
 *
 * Requires in .env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   TEST_EMAIL       ← your Navigator account email
 *   TEST_PASSWORD    ← your Navigator account password
 *
 * Outputs to: test-runs/[date]-[company]-[role]/
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

const MAX_JOB_DESCRIPTION_LENGTH = 15000;
const AGENT_MAX_RETRIES = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExperienceBlock {
  id: string;
  type: string;
  title: string;
  organization: string;
  dateRange: string;
  bullets: string[];
  isVisible: boolean;
  narrativeContext?: string;
}

interface ResumeProfile {
  id: string;
  name: string;
  blocks: ExperienceBlock[];
}

interface CritiqueResult {
  decision: "Reject" | "Weak" | "Average" | "Strong" | "Exceptional";
  feedback: string[];
  hallucinationAlerts: string[];
}

interface RunResult {
  jobDescription: string;
  distilledJob: {
    roleTitle: string;
    companyName: string;
    canonicalTitle: string;
    category: string;
    keySkills: string[];
    coreResponsibilities: string[];
  };
  compatibilityScore: number;
  strengths: string[];
  weaknesses: string[];
  coverLetterTailoringInstructions: string[];
  coverLetter: string;
  promptVariant: string;
  critique: CritiqueResult;
  attempts: number;
  finalDecision: string;
  resumeUsed: string;
  timestamp: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function preCleanJobText(text: string): string {
  const junkPatterns = [
    /^ontario\.ca homepage/i, /^français/i, /^search job openings/i,
    /^menu$/i, /^\← back to search/i, /^back to search results/i,
    /^home$/i, /^accessibility$/i, /^privacy$/i, /^terms of use$/i,
    /^contact us$/i, /^site map$/i, /^top$/i, /^skip to main content/i,
    /^skip to footer/i, /^view all jobs/i, /^apply now/i,
    /facebook|twitter|linkedin|email/i, /^sign in/i, /^create account/i,
    /©|copyright/i, /^all rights reserved/i, /^powered by/i,
    /^cookies/i, /^breadcrumb/i, /^footer/i, /^header/i,
  ];
  return text
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (t.length < 3) return false;
      if (t.length > 500 && (t.includes("http") || t.includes("www."))) return false;
      return !junkPatterns.some((p) => p.test(t));
    })
    .join("\n")
    .substring(0, MAX_JOB_DESCRIPTION_LENGTH);
}

function stringifyProfile(profile: ResumeProfile): string {
  return profile.blocks
    .filter((b) => b.isVisible)
    .map(
      (b) =>
        `BLOCK_ID: ${b.id}\nROLE: ${b.title}\nORG: ${b.organization}\nDATE: ${b.dateRange}\nDETAILS:\n${b.bullets.map((bull) => `- ${bull}`).join("\n")}\n`
    )
    .join("\n---\n");
}

function cleanJsonOutput(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

function cleanCoverLetterOutput(text: string): string {
  return text
    .replace(/\(BLOCK_ID:\s*[a-zA-Z0-9-]+\)/g, "")
    .replace(/BLOCK_ID:\s*[a-zA-Z0-9-]+/g, "")
    .trim();
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// ─── AI Proxy Call ────────────────────────────────────────────────────────────

async function callProxy(
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
  promptText: string,
  task: string,
  generationConfig?: Record<string, unknown>,
  feature?: string
): Promise<string> {
  const fnUrl = `${supabaseUrl}/functions/v1/gemini-proxy`;
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      payload: { contents: [{ role: "user", parts: [{ text: promptText }] }] },
      task,
      generationConfig,
      feature,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Proxy error ${res.status}: ${body}`);
  }

  const data = await res.json();
  // Edge function returns Gemini response — extract text
  const candidates = data?.candidates ?? data?.response?.candidates;
  if (candidates?.[0]?.content?.parts?.[0]?.text) {
    return candidates[0].content.parts[0].text;
  }
  // Some proxy wrappers return text directly
  if (typeof data?.text === "string") return data.text;
  if (typeof data?.content === "string") return data.content;
  throw new Error(`Unexpected proxy response shape: ${JSON.stringify(data).slice(0, 300)}`);
}

// ─── Prompts (mirrored from src/prompts/) ─────────────────────────────────────

const COVER_LETTER_VARIANTS: Record<string, string> = {
  v1_direct: `
You are a Strategic Career Architect. Write a professional, high-impact cover letter (approx. 400 words).

INSTRUCTIONS:
- **Grounding Rule**: Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills.
- **Functional Connections**: Do NOT use robotic transitions like "Additionally" or "Moreover." Instead, build thematic bridges between experiences (e.g., "My technical proficiency in [Skill A] is complemented by a track record in [Skill B] where I...").
- **Thematic Cohesion**: Group resume evidence by impact theme (e.g., Scaling Operations, Community Engagement) rather than a simple chronological list. A single paragraph should weave evidence from at least two different roles if they share a common theme.
- **Evidence Variety Rule**: Each body paragraph must anchor to a DIFFERENT resume block. Do not lean on the same 2-3 experiences across every letter — scan the full resume for the evidence that best fits THIS specific role.
- **Fit Calibration**: If the STRATEGY section indicates a fit gap or low compatibility, use a learning-trajectory framing — lead with transferable skills and genuine interest in the field, acknowledge the gap honestly rather than glossing over it. Do not inflate credentials.
- **Category-Aware Metrics**: If technical/academic: preserve literal statistics. If creative/managerial/general: paraphrase into narrative.
- **Substance**: Avoid filler. Every sentence must add new, evidence-backed weight.
- Structure:
  1. THE HOOK: A sophisticated observation about the company's specific mission or market challenge.
  2. THE SYNTHESIS: Unified body paragraphs combining achievements to prove mastery.
  3. STRATEGIC ROI: How this trajectory makes the candidate the most reliable, high-impact choice.
`,
  v2_storytelling: `
You are a Career Architect helping a candidate stand out with narrative. Write a detailed, compelling letter (approx. 450 words).

INSTRUCTIONS:
- **Grounding Rule**: Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills.
- **Narrative Arc**: Create a thread connecting the candidate's journey to the role's mission.
- **Functional Connections**: Use logic-driven transitions explaining how one experience prepared the candidate for the next.
- **Thematic Cohesion**: Group achievements by impact area rather than chronological lists.
- **Substance**: Avoid filler. Every sentence must add new, evidence-backed weight.
`,
  v3_experimental_pro: `
You are a senior executive writing a high-level strategic letter. Focus on ROI, value proposition, and long-term trajectory.

INSTRUCTIONS:
- **Grounding Rule**: Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills.
- **Thematic Depth**: Focus on the core pillars of the candidate's value.
- **Synthesis**: Weave multi-role evidence into sophisticated arguments about leadership and impact.
- **Substance**: Avoid filler. Every sentence must add new, evidence-backed weight.
`,
};

function buildCoverLetterPrompt(
  variant: string,
  jobDescription: string,
  resumeText: string,
  tailoringInstructions: string[]
): string {
  const template = COVER_LETTER_VARIANTS[variant] ?? COVER_LETTER_VARIANTS.v1_direct;
  return `${template}

JOB DESCRIPTION:
${jobDescription}

MY EXPERIENCE (Full Resume for Context):
${resumeText}

STRATEGY:
${tailoringInstructions.join("\n")}

FINAL CHECK:
- Ensure no (BLOCK_ID) tags remain in the output.
- REFLECT: Is this a list or a narrative? If it feels like a list, use a functional bridge to connect two thoughts.
`;
}

function buildCritiquePrompt(
  jobDescription: string,
  coverLetter: string,
  resumeContext: string
): string {
  return `You are a strict technical hiring manager. Review this cover letter for technical fidelity and narrative cohesion against the candidate's resume and the job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeContext}

PROPOSED COVER LETTER:
${coverLetter}

1. TECHNICAL FIDELITY: Does it hallucinate or copy-paste?
2. NARRATIVE SUBSTANCE: Is it a cohesive argument or a robotic list?
3. FUNCTIONAL BRIDGING: Are the transitions thematic or additive?

Return JSON:
{
  "decision": "Reject" | "Weak" | "Average" | "Strong" | "Exceptional",
  "feedback": ["3 extremely concise, 1-sentence feedback points"],
  "hallucinationAlerts": ["string"]
}`;
}

function buildAnalysisPrompt(jobDescription: string, resumeContext: string): string {
  return `You are a Strategic Career Architect and Hiring Expert. Your job is to analyze this candidate's fit for the role with absolute professional objectivity.

INPUT DATA:
1. RAW JOB TEXT:
"${jobDescription.substring(0, MAX_JOB_DESCRIPTION_LENGTH)}"

2. CANDIDATE CONTEXT (Resume, Skills, & Academics):
${resumeContext}

TASK:
1. DISTILL: Extract the job requirements into a structured format.
2. DOMAIN-AWARE ANALYSIS:
   - If Entry-Level or Academic role, leverage Transcript/Academic Background to substitute for missing work experience.
   - If Technical role, prioritize Hard Skill Stacks and Project Complexity.
3. GROUNDING RULE: Only credit the candidate for skills and experience explicitly present in the Candidate Context. Do NOT hallucinate seniority.
4. PROGRAM REQUIREMENT INTERPRETATION — read the JD language carefully before penalizing for program mismatch:
   - "or related program/field/diploma" → treat adjacent programs as meeting the requirement. Urban Planning or Environmental Studies (Cities/Planning specialisation) qualifies for transit, infrastructure, municipal, and environmental roles. A BES (Bachelor of Environmental Studies) with a planning/cities concentration is functionally an urban planning degree — treat it as such.
   - "considered an asset" or "preferred" → this is a bonus, NOT a requirement. Do NOT penalize the compatibility score for not having an asset.
   - "Don't meet every requirement? We encourage you to apply" → treat soft requirement gaps more generously; score on demonstrated skills and experience rather than credentials alone.
   - Only penalize hard program mismatch when the JD explicitly states the program as mandatory with no adjacent/related clause.
5. MATCH BREAKDOWN: Identify key strengths and HONEST gaps.
6. SCORE: Rate compatibility (0-100) based on hard evidence.

OUTPUT SCHEMA — Return ONLY valid JSON:
{
  "compatibilityScore": number,
  "reasoning": "Ultra-concise professional insight (max 1 sentence).",
  "strengths": ["3 specific match points"],
  "weaknesses": ["3 specific gaps or missing qualifications"],
  "distilledJob": {
    "roleTitle": "Official title",
    "companyName": "Company name",
    "location": "City, State or Remote",
    "category": "technical" | "managerial" | "trades" | "healthcare" | "creative" | "general",
    "canonicalTitle": "The most standard high-level name for this role",
    "keySkills": ["5-8 priority skills from the job post"],
    "coreResponsibilities": ["4-6 primary duties"]
  },
  "coverLetterTailoringInstructions": [
    "EVIDENCE_BRIDGE_1: Map the single most critical job requirement to the best-matching resume block ID — format as: '[Requirement] → [Block ID]: [one-sentence explanation of the connection]'",
    "EVIDENCE_BRIDGE_2: Map the second most critical job requirement to a DIFFERENT resume block ID (must not reuse the block from bridge 1)",
    "FIT_FRAME: If compatibility score < 60, write a one-sentence framing instruction for the gap. If score >= 60, write one sentence on the candidate's strongest differentiator for this specific role."
  ],
  "recommendedBlockIds": ["IDs of the 3-5 resume blocks most relevant to this job"],
  "internalAnalysis": "scratchpad only"
}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Parse args
  const args = process.argv.slice(2);
  const jobFilePath = args.find((a) => !a.startsWith("--"));
  const variantArg = args.find((a) => a.startsWith("--variant="))?.split("=")[1] ?? "v1_direct";

  if (!jobFilePath) {
    console.error("Usage: bun scripts/test-harness.ts <job-description.txt> [--variant=v1_direct|v2_storytelling|v3_experimental_pro]");
    process.exit(1);
  }

  if (!fs.existsSync(jobFilePath)) {
    console.error(`File not found: ${jobFilePath}`);
    process.exit(1);
  }

  const rawJobText = fs.readFileSync(jobFilePath, "utf-8");
  const jobDescription = preCleanJobText(rawJobText);

  // 2. Auth
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let email = TEST_EMAIL;
  let password = TEST_PASSWORD;
  if (!email) email = await prompt("Navigator email: ");
  if (!password) password = await prompt("Password: ");

  console.log("\n🔐 Signing in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  if (authError || !authData.session) {
    console.error("Auth failed:", authError?.message);
    process.exit(1);
  }
  const accessToken = authData.session.access_token;
  console.log("✅ Signed in as", authData.user?.email);

  // 3. Fetch resume
  console.log("\n📄 Fetching resume...");
  const { data: resumeRows, error: resumeError } = await supabase
    .from("resumes")
    .select("profile_id, content")
    .eq("user_id", authData.user!.id)
    .order("profile_id");

  if (resumeError || !resumeRows?.length) {
    console.error("Could not fetch resume:", resumeError?.message ?? "No resume found");
    process.exit(1);
  }

  const resumes: ResumeProfile[] = resumeRows.map(row =>
    (typeof row.content === "string" ? JSON.parse(row.content) : row.content) as ResumeProfile
  );
  const resume = resumes[0];
  if (!resume) {
    console.error("No resume profiles found in your account.");
    process.exit(1);
  }
  console.log(`✅ Using resume: "${resume.name}" (${resume.blocks.filter((b) => b.isVisible).length} visible blocks)`);

  const resumeText = stringifyProfile(resume);

  // 4. Job fit analysis
  console.log("\n🔍 Running job fit analysis...");
  const analysisPrompt = buildAnalysisPrompt(jobDescription, resumeText);
  const analysisRaw = await callProxy(
    SUPABASE_URL, SUPABASE_ANON_KEY, accessToken,
    analysisPrompt, "analysis",
    { responseMimeType: "application/json" },
    undefined
  );
  const analysis = JSON.parse(cleanJsonOutput(analysisRaw));
  const { distilledJob, compatibilityScore, strengths, weaknesses, coverLetterTailoringInstructions } = analysis;
  console.log(`✅ Analysis complete — Score: ${compatibilityScore}/100 | Role: ${distilledJob?.roleTitle} @ ${distilledJob?.companyName}`);

  // 5. Cover letter generation + critique loop
  console.log(`\n✍️  Generating cover letter (variant: ${variantArg})...`);
  let coverLetter = "";
  let attempts = 0;
  let finalCritique: CritiqueResult = { decision: "Average", feedback: [], hallucinationAlerts: [] };
  let finalDecision = "Average";

  while (attempts <= AGENT_MAX_RETRIES) {
    const clPrompt = buildCoverLetterPrompt(variantArg, jobDescription, resumeText, coverLetterTailoringInstructions ?? []);
    const clRaw = await callProxy(
      SUPABASE_URL, SUPABASE_ANON_KEY, accessToken,
      clPrompt, "analysis", undefined, "cover_letter"
    );
    coverLetter = cleanCoverLetterOutput(clRaw);
    attempts++;

    console.log(`   Draft ${attempts} — critiquing...`);
    const critiquePrompt = buildCritiquePrompt(jobDescription, coverLetter, resumeText);
    const critiqueRaw = await callProxy(
      SUPABASE_URL, SUPABASE_ANON_KEY, accessToken,
      critiquePrompt, "analysis",
      { responseMimeType: "application/json" },
      "cover_letter"
    );
    finalCritique = JSON.parse(cleanJsonOutput(critiqueRaw));
    finalDecision = finalCritique.decision;

    console.log(`   → ${finalDecision} ${finalCritique.hallucinationAlerts?.length ? `⚠️  ${finalCritique.hallucinationAlerts.length} hallucination alert(s)` : ""}`);

    if (finalDecision === "Strong" || finalDecision === "Exceptional") break;
    if (attempts > AGENT_MAX_RETRIES) break;

    // Inject critique feedback into tailoring for next round
    const improvementNote = `PREVIOUS DECISION: ${finalDecision}\nCRITIQUE FEEDBACK: ${finalCritique.feedback.join("; ")}\n${finalCritique.hallucinationAlerts.length > 0 ? `HALLUCINATION WARNINGS: ${finalCritique.hallucinationAlerts.join("; ")}` : ""}\nFix these issues. Do not regress on strengths.`;
    coverLetterTailoringInstructions.push(improvementNote);
    console.log(`   Polishing (attempt ${attempts + 1})...`);
  }

  // 6. Save outputs
  const timestamp = new Date().toISOString().slice(0, 10);
  const company = slugify(distilledJob?.companyName ?? "unknown-company");
  const role = slugify(distilledJob?.roleTitle ?? "unknown-role");
  const folderName = `${timestamp}-${company}-${role}`;
  const outDir = path.join(path.dirname(path.dirname(path.resolve(jobFilePath))), "test-runs", folderName);

  // If run from scripts/, go up to Navigator root, then test-runs/
  const projectRoot = path.resolve(import.meta.dir, "..");
  const runDir = path.join(projectRoot, "test-runs", folderName);
  fs.mkdirSync(runDir, { recursive: true });

  // Save cover letter
  fs.writeFileSync(path.join(runDir, "cover-letter.txt"), coverLetter, "utf-8");

  // Save full review JSON
  const result: RunResult = {
    jobDescription,
    distilledJob,
    compatibilityScore,
    strengths,
    weaknesses,
    coverLetterTailoringInstructions,
    coverLetter,
    promptVariant: variantArg,
    critique: finalCritique,
    attempts,
    finalDecision,
    resumeUsed: resume.name,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(runDir, "review.json"), JSON.stringify(result, null, 2), "utf-8");

  // Save raw job description (cleaned)
  fs.writeFileSync(path.join(runDir, "job-description.txt"), jobDescription, "utf-8");

  // Append to summary log
  const summaryPath = path.join(projectRoot, "test-runs", "results-summary.jsonl");
  const summaryEntry = {
    timestamp: result.timestamp,
    folder: folderName,
    company: distilledJob?.companyName,
    role: distilledJob?.roleTitle,
    score: compatibilityScore,
    decision: finalDecision,
    attempts,
    hallucinationAlerts: finalCritique.hallucinationAlerts?.length ?? 0,
    variant: variantArg,
  };
  fs.appendFileSync(summaryPath, JSON.stringify(summaryEntry) + "\n", "utf-8");

  console.log(`\n✅ Done! Saved to test-runs/${folderName}/`);
  console.log(`   cover-letter.txt  — ${coverLetter.length} chars`);
  console.log(`   review.json       — full analysis + critique`);
  console.log(`   job-description.txt`);
  console.log(`\n📊 Final verdict: ${finalDecision} (${attempts} draft${attempts > 1 ? "s" : ""})`);
  if (finalCritique.feedback.length) {
    console.log(`\n💬 Feedback:`);
    finalCritique.feedback.forEach((f) => console.log(`   • ${f}`));
  }
  if (finalCritique.hallucinationAlerts?.length) {
    console.log(`\n⚠️  Hallucination alerts:`);
    finalCritique.hallucinationAlerts.forEach((h) => console.log(`   • ${h}`));
  }
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
