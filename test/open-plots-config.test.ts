import { GridAssembly } from '@wildshard/engine/game/grid/assembly'
import { declarationOnlyConfig } from '@wildshard/engine/scripts/shard-platform.mjs'
import { expect, test } from 'vitest'

import layout from '../src/shards/open-plots/data/layouts/night-market.json' with { type: 'json' }
import {
  audioOutputs,
  outputs as worldDeclarations,
} from '../src/shards/open-plots/generators/shardfile'
import declared from '../src/shards/open-plots/outputs.json' with { type: 'json' }
import project, { outputs } from '../src/shards/open-plots/shard.config'
import configSource from '../src/shards/open-plots/shard.config.ts?raw'

// G604: the open-plots entry is a thin declaration (its outputs assemble in generators/shardfile.ts at build time), one
// output per idea row
test('the open-plots entry is declaration-only and declares one output per idea', () => {
  expect(declarationOnlyConfig(configSource)).toBe(true)
  expect(Object.keys(outputs)).toEqual(declared.outputs.map(row => row.slug))
  for (const row of declared.outputs)
    expect(worldDeclarations[row.slug]).toMatchObject({
      identity: { slug: row.slug },
      accent: row.accent,
      world: { glb: `assets/${row.idea}/world.glb` },
    })
  expect(outputs).toBe(audioOutputs)
  expect(project).toEqual(worldDeclarations[declared.outputs[0]?.slug ?? ''])
})

test('Night Market road B lowers only its layout curtain and keeps road A posters', () => {
  const grid = new GridAssembly({ developer: false, devserver: false })
  const low = grid.cells.filter(cell => cell.edgeLook !== undefined)
  expect(low.map(cell => cell.slug)).toEqual(['open-plot-night-market'])
  for (const cell of low) expect(cell.edgeLook).toEqual({ height: 1.2 })
  expect(layout.posters.entry).toMatchObject({
    width: 10,
    bottom: 1.8,
    inset: 247,
    posts: 4,
    offset: 18,
  })
})

test('all plot poster faces use the unlit map or baked mean without fog', () => {
  for (const output of Object.values(worldDeclarations))
    expect(output.look.materials.billboard).toMatchObject({
      family: 'graph',
      graph: {
        model: 'unlit',
        effectState: { fog: false },
        nodes: { picture: { op: 'meshMap', name: 'colourOrVertex' } },
      },
    })
})
