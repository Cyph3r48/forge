import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const require = createRequire(new URL('../forge/package.json', import.meta.url));
const ts = require('typescript');
let requests = 0;

function client(name) {
  const source = readFileSync(new URL(`../forge/src/lib/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = {
    exports: {}, process: { env: {} }, AbortSignal,
    fetch: async () => { requests++; throw new Error('Unexpected engine request'); },
  };
  runInNewContext(outputText, context);
  return context.exports;
}

const pc = client('paperclip');
const hermes = client('hermes');
assert.equal(pc.paperclipConfigured(), false);
assert.equal(hermes.hermesConfigured(), false);
await Promise.all([
  pc.getCompany(), pc.listAgents(), pc.listRuns(), pc.listIssues(),
  hermes.hermesHealth(), hermes.hermesSkills(), hermes.hermesToolsets(), hermes.hermesSessions(),
]);
const task = await pc.createIssue({ title: 'Offline check', description: '', priority: 'medium' });
assert.equal(task.ok, false);
assert.equal(requests, 0, 'Unconfigured clients must not contact any engine');
console.log('PASS: all unconfigured clients make zero engine requests');
