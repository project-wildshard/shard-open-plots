// Ring 2, J186: Linux engine v0.1.0 repeatedly exceeded 9.5 seconds for
// complete product admission plus two real workers and save restoration,
// even after reducing the tape and checkpoint serializations. All eighteen
// worlds still run here. Ring 3 retains every package and source test.
import '@wildshard/engine/scripts/sim-node-loader.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { test } from 'node:test';

const { loadHeadlessProduct } = await import('@wildshard/engine/host/headlessProduct');
const { createTrustedHeadlessAdapter } = await import('@wildshard/engine/host/headlessRuntime');
const { HeadlessSimulation } = await import('@wildshard/engine/host/headless');
const { productHeadlessSections } = await import('@wildshard/engine/host/headlessSections');
const { outputDescriptor, serverReadsFile } = await import('@wildshard/engine/game/shardfile/outputDescriptor');
const { loadRapier } = await import('@wildshard/engine/physics/rapier');
const { manifestFolders, shardProducts } = await import('@wildshard/engine/scripts/shard-outputs.mjs');
const engineRequire = createRequire(import.meta.resolve('@wildshard/engine/package.json'));
const products = readdirSync('out', { withFileTypes: true }).filter(row => row.isDirectory() && !row.name.startsWith('.') && row.name !== 'tars');
assert.ok(products.length, 'Build this shard before running its product proof');
assert.deepEqual(products.map(row => row.name).sort(), shardProducts(process.cwd(), manifestFolders(process.cwd())).map(row => row.slug).sort(), 'Every declared product must be built');
// CI plays the eighteen products in parallel parts (WS_PLAY_PART=1/3 and so on);
// every part checks the full built set above, and the parts cover every product.
const [playPart, playParts] = (process.env.WS_PLAY_PART ?? '1/1').split('/').map(Number);
assert.ok(Number.isInteger(playPart) && Number.isInteger(playParts) && playPart >= 1 && playPart <= playParts, `Bad WS_PLAY_PART ${process.env.WS_PLAY_PART}`);
const partProducts = products.filter((_, index) => index % playParts === playPart - 1);
const tapes = existsSync('test/ci/content-tapes.json') ? JSON.parse(readFileSync('test/ci/content-tapes.json', 'utf8')) : {};

async function play(runtime, plan, declared) {
  if (!declared) return { report: await runtime.verbTape(plan), commit: runtime.commit() };
  const report = { ticks: 0, observations: [] };
  let commit;
  for (const segment of plan.segments) {
    const part = await runtime.verbTapePart({ ...plan, segments: [segment] });
    report.ticks += part.report.ticks; report.observations.push(...part.report.observations); commit = part.commit;
  }
  return { report, commit };
}

for (const { name: slug } of partProducts) test(`${slug}: boot, walk and resume on the installed engine`, { timeout: 45_000 }, async () => {
  const directory = resolve('out', slug), product = await loadHeadlessProduct(directory), shard = product.shardfile;
  const descriptor = outputDescriptor(shard);
  assert.ok(descriptor, 'The built shard must pass admission');
  const declared = shard.runtime === null && !product.has('sim/runtime-plan');
  const assets = new Map(descriptor.index.files.filter(file => declared || serverReadsFile(file, shard.terrain?.collider) && (file.name === undefined || file.kind === 'wasm' || file.kind === 'tile'))
    .map(file => [file.commons === true ? `commons:${file.hash}` : file.hash, readFileSync(join(directory, file.path))]));
  const owned = [];
  const rapier = declared ? undefined : await loadRapier(readFileSync(engineRequire.resolve('@dimforge/rapier3d-simd/rapier_wasm3d_bg.wasm')));
  const create = async snapshot => {
    const runtime = declared
      ? await HeadlessSimulation.create(shard, assets, snapshot, { deadline: 'advisory', sections: productHeadlessSections(product) })
      : await createTrustedHeadlessAdapter({ shard, assets, product, rapier }, snapshot);
    owned.push(runtime);
    return runtime;
  };
  try {
    const runtime = await create();
    if (tapes[slug]) {
      const { plan: content, expect } = tapes[slug];
      const { report: played } = await play(runtime, content, declared);
      for (const fact of expect) {
        const at = played.observations.find(row => row.id === fact.at);
        assert.ok(at, `Missing real observation ${fact.at}`);
        for (const flag of fact.flags ?? []) assert.ok(at.flags.includes(flag), `Playing must earn ${flag}`);
        for (const flag of fact.absent ?? []) assert.ok(!at.flags.includes(flag), `Unreachable input must not earn ${flag}`);
      }
    }
    const plan = { version: 1, observe: [], segments: [
      { id: 'spawn', ticks: 1, commands: [] },
      { id: 'walk', ticks: 30, commands: [{ kind: 'player', moveX: 0, moveZ: -1, yaw: 0 }] },
      { id: 'turn', ticks: 30, commands: [{ kind: 'player', moveX: 1, moveZ: 0, yaw: Math.PI / 2 }] },
    ] };
    const { report, commit: checkpoint } = await play(runtime, plan, declared);
    assert.equal(report.ticks, 61);
    const [spawn, walk, turn] = report.observations;
    assert.ok([spawn, walk, turn].every(row => row.position.every(Number.isFinite)));
    assert.ok([walk,turn].some(row=>Math.hypot(row.position[0]-spawn.position[0],row.position[2]-spawn.position[2])>0.25), `Walking must move the real player: ${JSON.stringify(report.observations)}`);
    const resumed = await create(checkpoint.snapshot);
    if (declared) {
      // One opaque commit after five real input ticks. Re-encoding the whole
      // world after each tick made the eighteen-product floor exceed J186.
      const suffix={version:1,observe:[],segments:[{id:'resume',ticks:5,commands:[{kind:'player',moveX:0,moveZ:-1,yaw:0}]}]};
      assert.deepEqual(await resumed.verbTapePart(suffix),await runtime.verbTapePart(suffix),'A saved world must continue identically');
      return;
    }
    for (let tick = 0; tick < 5; tick++) {
      const commands = [{ kind: 'player', moveX: 0, moveZ: -1, yaw: 0 }];
      runtime.step(commands); resumed.step(commands);
      assert.deepEqual(resumed.commit(), runtime.commit(), 'A saved world must continue identically');
    }
  } finally { for (const runtime of owned) await runtime.dispose(); }
});
