(function(root) {
  'use strict';
  function text(value, max) {
    if (typeof value !== 'string' || value.length > max) throw new Error('Text exceeds the allowed length.');
    return value;
  }
  function validate(value) {
    if (!value || !Array.isArray(value.frames) || value.frames.length !== 4) throw new Error('Use exactly four frames.');
    if (!Number.isInteger(value.cueBeat) || value.cueBeat < 1 || value.cueBeat > 4) throw new Error('Choose cue beat 1–4.');
    return {frames:value.frames.map(v=>text(v,80)), cue:text(value.cue,120), cueBeat:value.cueBeat, reflection:text(value.reflection,500)};
  }
  function create() { return validate({frames:['Still frame','A hand rises','The view turns','Return to stillness'],cue:'A new direction',cueBeat:2,reflection:''}); }
  function sequence(value, cueBeat=value.cueBeat) {
    const v=validate({...value,cueBeat});
    return v.frames.map((frame,i)=>({beat:i+1,frame,cue:i+1===v.cueBeat?v.cue:''}));
  }
  function record(value) {
    return {schema:'tarantula-visual-study/v1',exercise:validate(value),comparison:{cueBeatA:value.cueBeat,cueBeatB:value.cueBeat===4?1:value.cueBeat+1},source:{url:'https://www.youtube.com/watch?v=HiPY_BcyaoM',title:'Ren - KUJO BEAT DOWN | Behind The Scenes',evidence:'user-supplied summary',verification:'pending',timestamps:[],quotationVerification:'pending'},rightsReview:'Review your material and permissions before sharing. This record does not establish clearance.'};
  }
  const api={create,validate,sequence,record};
  if(typeof module==='object'&&module.exports) module.exports=api; else root.VisualStudy=api;
})(typeof globalThis==='object'?globalThis:this);
