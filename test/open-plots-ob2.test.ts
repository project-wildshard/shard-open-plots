import { expect, test } from 'vitest';
import { plotAudioRows } from '../scripts/open-plots/ob2.mjs';
import { plotAudioRequest } from '../scripts/open-plots/audio-template.mjs';
import { parseAudioData } from '@wildshard/format/audio';

const audio = () => ({ idea: 'lantern-bayou', spots: Array.from({ length: 4 }, (_, i) => ({ id: `spot-${i + 1}`, at: null })) });

test('all five template audio requests use planned spots and remain unplaced',async()=>{
  for(const idea of ['frostline-peaks','lantern-bayou','ember-forge','mosslight-ruins','coral-drift']){
    const request=plotAudioRequest(idea),rows=await plotAudioRows(request);
    expect(request.spots).toHaveLength(4);expect(request.spots.every(row=>row.at===null)).toBe(true);
    expect(rows.assets).toHaveLength(6);expect(rows.activation).toBe('inert-authoring-template');
  }
  expect(()=>plotAudioRequest('../escape')).toThrow('No planned');
});

test('audio template emits silent native rows and explicit unfulfilled per-plot asset/position requests',async()=>{
  const result=await plotAudioRows(audio());
  expect(parseAudioData(result.audio)).toMatchObject({cues:[],routing:[],ambience:null,score:'silent'});
  expect(result.manifest.audio).toEqual({ambience:'none',score:'none'});
  expect(result.assets.map(row=>row.file)).toEqual(['public/assets/music/lantern-bayou/score.m4a','public/assets/sfx/lantern-bayou/ambience.m4a',...Array.from({length:4},(_,i)=>`public/assets/sfx/lantern-bayou/spot-${i+1}.m4a`)]);
  expect(result.pending.filter(row=>row.startsWith('position '))).toHaveLength(4);
  expect(result.activation).toBe('inert-authoring-template');expect(result.pending).toContain('OB7: verified loop metadata, retained credits and native catalogue binding before activation');
});

test('audio refuses a short/duplicate spot catalogue, escaping slug and out-of-cell position',async()=>{
  const source=audio();await expect(plotAudioRows({...source,spots:source.spots.slice(0,3)})).rejects.toThrow();
  await expect(plotAudioRows({...source,spots:source.spots.map(()=>source.spots[0])})).rejects.toThrow();
  await expect(plotAudioRows({...source,idea:'../other'})).rejects.toThrow();
  await expect(plotAudioRows({...source,spots:source.spots.map(row=>({id:row.id,at:[251,0,0]}))})).rejects.toThrow();
});
