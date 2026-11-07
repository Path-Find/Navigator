/**
 * Runs one job + resume through Navigator's two analysis steps (PARSE then SCORE)
 * on Haiku, Sonnet and Opus, twice each for scoring, and writes a side-by-side file.
 *
 * Usage (needs ANTHROPIC_API_KEY in the environment):
 *   npx tsx scripts/compare-job-analysis.ts <job.txt> <resume.txt> <out.md>
 */
import * as fs from 'fs';
import { callClaude } from '../api/_lib/claude';
import { JOB_ANALYSIS_PROMPTS } from '../src/prompts/jobAnalysis';

const [jobPath, resumePath, outPath] = process.argv.slice(2);
if (!jobPath || !resumePath || !outPath) throw new Error('usage: compare-job-analysis.ts <job.txt> <resume.txt> <out.md>');
const job = fs.readFileSync(jobPath, 'utf8');
const resume = fs.readFileSync(resumePath, 'utf8');

const MODELS = { Haiku: 'claude-haiku-5-5', Sonnet: 'claude-sonnet-5-5', Opus: 'claude-opus-5-5' } as const;
const PRICE: Record<string, [number, number]> = {
    'claude-haiku-5-5': [0.1, 0.5], 'claude-sonnet-5-5': [2, 10], 'claude-opus-5-5': [4, 20],
};

const run = async (model: string, task: 'extraction' | 'analysis', prompt: string) => {
    const t0 = Date.now();
    const r = await callClaude({
        model, task,
        generationConfig: { responseMimeType: 'application/json' },
        payload: { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
    });
    const [i, o] = PRICE[model];
    const cost = (r.usage.inputTokens * i + r.usage.outputTokens * o) / 1e6;
    return { text: r.text.trim(), cost, secs: (Date.now() - t0) / 1000 };
};
const parse = (t: string) => { try { return JSON.parse(t.replace(/^```json|```$/gim, '').trim()); } catch { return null; } };

const out: string[] = ['# Job analysis combos\n'];
let total = 0;

out.push('## Step 1: parse the posting (extraction)\n');
const parsed: Record<string, string> = {};
for (const [name, model] of Object.entries(MODELS)) {
    const r = await run(model, 'extraction', JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.PARSE(job));
    total += r.cost; parsed[name] = r.text;
    out.push(`### ${name} ($${r.cost.toFixed(4)}, ${r.secs.toFixed(1)}s, valid JSON: ${parse(r.text) ? 'yes' : 'NO'})\n\`\`\`json\n${r.text}\n\`\`\`\n`);
}

// Same input for every scorer: Opus's parse of the job.
out.push('## Step 2: score the match (analysis), same parsed job for all, run twice each\n');
const scoreInput = parsed.Opus;
for (const [name, model] of Object.entries(MODELS)) {
    const scores: unknown[] = [];
    for (let run_i = 1; run_i <= 2; run_i++) {
        const r = await run(model, 'analysis', JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.SCORE(scoreInput, resume));
        total += r.cost;
        const j = parse(r.text);
        scores.push(j?.compatibilityScore ?? 'invalid');
        out.push(`### ${name}, run ${run_i} ($${r.cost.toFixed(4)}, ${r.secs.toFixed(1)}s)\n\`\`\`json\n${r.text}\n\`\`\`\n`);
    }
    out.push(`**${name} scores: ${scores.join(' and ')}**\n`);
}
fs.writeFileSync(outPath, out.join('\n'));
console.log(`wrote ${outPath}; total spend ~$${total.toFixed(3)}`);
