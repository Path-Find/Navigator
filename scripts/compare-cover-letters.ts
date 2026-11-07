/**
 * Runs one job + resume through four Claude model combos for cover letters and
 * writes the letters side by side in a markdown file.
 *
 * Usage (needs ANTHROPIC_API_KEY in the environment):
 *   npx tsx scripts/compare-cover-letters.ts <job.txt> <resume.txt> <out.md>
 */
import * as fs from 'fs';
import { callClaude } from '../api/_lib/claude';
import { COVER_LETTER_PROMPTS } from '../src/prompts/coverLetter';

const [jobPath, resumePath, outPath] = process.argv.slice(2);
if (!jobPath || !resumePath || !outPath) throw new Error('usage: compare-cover-letters.ts <job.txt> <resume.txt> <out.md>');
const job = fs.readFileSync(jobPath, 'utf8');
const resume = fs.readFileSync(resumePath, 'utf8');

const SONNET = 'claude-sonnet-5-5';
const OPUS = 'claude-opus-5-5';
const PRICE: Record<string, [number, number]> = { [SONNET]: [2, 10], [OPUS]: [4, 20] };

let spent = 0;
const run = async (model: string, prompt: string, json = false) => {
    const r = await callClaude({
        model, task: 'analysis',
        generationConfig: json ? { responseMimeType: 'application/json' } : undefined,
        payload: { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
    });
    const [i, o] = PRICE[model];
    spent += (r.usage.inputTokens * i + r.usage.outputTokens * o) / 1e6;
    return r.text;
};

const style = COVER_LETTER_PROMPTS.COVER_LETTER.STYLE_MODULES.v1_direct;
const write = (extra?: string) =>
    COVER_LETTER_PROMPTS.COVER_LETTER.GENERATE(style, job, resume, [], extra);
const judge = async (letter: string) => {
    const raw = await run(OPUS, COVER_LETTER_PROMPTS.CRITIQUE_COVER_LETTER(job, letter, resume), true);
    return JSON.parse(raw.replace(/^```json|```$/gim, '').trim()) as { decision: string; feedback: string[] };
};
const passes = (d: string) => d === 'Strong' || d === 'Exceptional';
const notes = (c: { feedback: string[] }) => `CRITIQUE FEEDBACK: ${c.feedback.join('; ')}`;

const out: string[] = [`# Cover letter combos\n`];
const section = (name: string, cost: number, body: string, verdict?: string) =>
    out.push(`## ${name}\n_Cost: $${cost.toFixed(3)}${verdict ? ` · judge verdict on first draft: ${verdict}` : ''}_\n\n${body.trim()}\n`);

const cost = async <T>(fn: () => Promise<T>): Promise<[T, number]> => { const before = spent; const v = await fn(); return [v, spent - before]; };

const [opusAlone, c1cost] = await cost(() => run(OPUS, write()));
section('1. Opus alone', c1cost, opusAlone);
const [sonnetAlone, c2cost] = await cost(() => run(SONNET, write()));
section('2. Sonnet alone', c2cost, sonnetAlone);

// Combos 3 and 4 share the first draft and the judge's verdict.
const [shared, sharedCost] = await cost(async () => { const d = await run(SONNET, write()); return { d, c: await judge(d) }; });
const draft = shared.d; const c1 = shared.c;
const [rewriteOpus, c3cost] = await cost(async () => (passes(c1.decision) ? draft : run(OPUS, write(notes(c1)))));
section('3. Sonnet drafts, Opus judges, Opus rewrites if it fails', sharedCost + c3cost, rewriteOpus, c1.decision);
const [redoSonnet, c4cost] = await cost(async () => (passes(c1.decision) ? draft : run(SONNET, write(notes(c1)))));
section('4. Sonnet drafts, Opus judges, Sonnet redoes with the notes', sharedCost + c4cost, redoSonnet, c1.decision);

out.push(`## Judge notes on the Sonnet draft\n${c1.feedback.map((f) => `- ${f}`).join('\n')}\n`);
fs.writeFileSync(outPath, out.join('\n'));
console.log(`wrote ${outPath}; total spend ~$${spent.toFixed(3)}`);
