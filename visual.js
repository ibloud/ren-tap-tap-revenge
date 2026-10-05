'use strict';
(() => {
  const M=window.VisualStudy, $=id=>document.getElementById(id);
  let value=M.create(), beat=0;
  function read() {return M.validate({frames:[1,2,3,4].map(i=>$('frame-'+i).value),cue:$('cue').value,cueBeat:Number($('cue-beat').value),reflection:$('reflection').value});}
  function render() {
    const alternate=value.cueBeat===4?1:value.cueBeat+1;
    $('comparison').replaceChildren();
    for(const [name,cueBeat] of [['A',value.cueBeat],['B',alternate]]) {
      const heading=document.createElement('h3'); heading.textContent=`Version ${name}: cue on beat ${cueBeat}`; $('comparison').append(heading);
      const list=document.createElement('ol');
      for(const item of M.sequence(value,cueBeat)) {
        const li=document.createElement('li');li.textContent=`Beat ${item.beat}: ${item.frame}${item.cue?' · Cue: '+item.cue:''}`;
        if(item.beat===beat){li.setAttribute('aria-current','step');li.style.borderLeft='4px solid #ffe482';li.style.paddingLeft='12px';}
        list.append(li);
      }
      $('comparison').append(list);
    }
    $('preview').value=JSON.stringify(M.record(value),null,2);
    $('advance').disabled=beat===4;
    $('position').textContent=beat?`Beat ${beat} of 4. Compare the cue placement in A and B.`:'Ready. Advance one beat at your own pace.';
  }
  function apply() {try{value=read();beat=0;render();return true;}catch(e){$('position').textContent=e.message;return false;}}
  $('edit-visual').addEventListener('submit',e=>{e.preventDefault();apply();});
  $('reflection').addEventListener('input',()=>{try{value=M.validate({...value,reflection:$('reflection').value});$('preview').value=JSON.stringify(M.record(value),null,2);}catch(e){$('position').textContent=e.message;}});
  $('advance').addEventListener('click',()=>{if(beat<4){beat++;render();}});
  $('restart').addEventListener('click',()=>{beat=0;render();});
  $('check-evidence').addEventListener('click',()=>{$('evidence-feedback').textContent=$('evidence-answer').value==='not-stated'?'Correct: no specific audio plugin is identified in the supplied summary. This does not prove that no plugin was used.':'The summary does not identify a specific audio plugin. Choose “Not stated in the supplied summary.”';});
  $('download').addEventListener('click',()=>{if(!apply())return;const url=URL.createObjectURL(new Blob([$('preview').value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='visual-study.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  [1,2,3,4].forEach(i=>$('frame-'+i).value=value.frames[i-1]);$('cue').value=value.cue;$('cue-beat').value=String(value.cueBeat);render();
})();
