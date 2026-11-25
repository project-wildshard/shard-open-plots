// Match the installed direct edge, its resolved immutable tarball and
// Node’s actual engine package path before accepting candidate receipts.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,realpathSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import { enginePackageUrl, enginePin, engineRoot } from '@wildshard/sdk/headless';
const engine=process.env.COOKED_ENGINE_CANDIDATE;
assert.match(engine??'',/^[a-f0-9]{40}$/u,'An exact candidate engine is required');
const producer=process.argv.includes('--producer');
let installed;
if(producer){
 // SHARD-COMPAT SI8c: the shard no longer depends on the engine; the producer runs the engine the sdk pins.
 // J475/FS28: npm next carries an exact prerelease, 0.1.54-next.<sha>, before the tag.
 assert.match(enginePin,/^\d+\.\d+\.\d+(?:-next\.[0-9a-f]{7,40})?$/u,'Producer uses its exact released pin');
 installed={version:enginePin,path:engineRoot,resolved:`npm:${enginePin}`};
}else{
 // select-candidate.mjs names the candidate as a direct dependency for this run only.
 const listed=spawnSync('pnpm',['list','@wildshard/engine','--depth','0','--json'],{encoding:'utf8'});
 assert.equal(listed.status,0,listed.stderr);
 installed=JSON.parse(listed.stdout)[0]?.dependencies?.['@wildshard/engine'];assert.ok(installed);
 assert.equal(installed.resolved,`https://codeload.github.com/project-wildshard/engine/tar.gz/${engine}`);
}
assert.equal(realpathSync(installed.path),realpathSync(dirname(fileURLToPath(enginePackageUrl))));
const result={complete:true,engine:producer?installed.version:engine,resolved:installed.resolved,version:installed.version};
const directory=process.env.COOKED_REPORT_DIR??'tmp/cooked-products';mkdirSync(directory,{recursive:true});
writeFileSync(join(directory,producer?'producer.json':'runtime.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
