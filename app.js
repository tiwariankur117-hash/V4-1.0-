/* VYRA V4: frontend-only UX demonstration. Not production authentication or AI. */
const $=id=>document.getElementById(id);const get=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));const page=(location.pathname.split('/').filter(Boolean).pop()||'index').replace(/\.html$/,'');
if(page==='login'){
 let mode='login';const update=()=>{const sign=mode==='signup';$('tabLogin').classList.toggle('active',!sign);$('tabSignup').classList.toggle('active',sign);$('authTitle').textContent=sign?'Create your space.':'Welcome back.';$('authSubtitle').textContent=sign?'Pick a unique username to begin.':'Sign in to continue creating.';$('authSubmit').textContent=sign?'Create local preview account ↗':'Continue to Studio ↗';$('authError').textContent='';};
 $('tabLogin').onclick=()=>{mode='login';update()};$('tabSignup').onclick=()=>{mode='signup';update()};
 $('authForm').onsubmit=e=>{e.preventDefault();const name=$('username').value.trim().toLowerCase();const password=$('password').value;const users=get('vyra_demo_users',{});if(mode==='signup'){if(users[name]){$('authError').textContent='That username is already taken in this browser demo.';return;}users[name]=password;put('vyra_demo_users',users);}else if(users[name]!==password){$('authError').textContent='Demo account not found or password incorrect. Try Sign Up first.';return;}sessionStorage.setItem('vyra_demo_session',name);location.href='dashboard.html';};
}
if(['dashboard','studio','result','learn','video-generator','photo-generator','video-editor'].includes(page)){
 const user=sessionStorage.getItem('vyra_demo_session');if(!user){location.replace('login.html');}else{if($('userDisplay'))$('userDisplay').textContent='@'+user;if($('logoutBtn'))$('logoutBtn').onclick=()=>openVyraLogoutDialog();}
}
if(['video-generator','photo-generator'].includes(page)){
 const prompt=$('prompt');if(prompt){prompt.style.minHeight='104px';prompt.style.height='104px';prompt.addEventListener('input',()=>{prompt.style.height='104px';prompt.style.height=prompt.scrollHeight+'px';});}
 document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.example-prompt').forEach(card=>{card.classList.toggle('is-selected',card===b);card.setAttribute('aria-pressed',String(card===b));});prompt.value=b.dataset.prompt;prompt.dispatchEvent(new Event('input'));prompt.focus();});
 $('reference').onchange=()=>{$('fileLabel').textContent=$('reference').files[0]?.name||'Optional · local only';};
 $('createForm').onsubmit=e=>{e.preventDefault();const val=prompt.value.trim();if(val.length<5)return;const project={prompt:val,mediaType:$('mediaType').value,style:$('style').value,format:$('format').value,voice:!!$('voice')?.checked,referenceName:$('reference').files[0]?.name||'',revisions:[]};put('vyra_demo_project',project);const overlay=$('vyraGenerationOverlay');if(overlay){overlay.hidden=false;setTimeout(()=>{location.href='result.html'},950);}else{location.href='result.html';}};
}
if(page==='result'){
 let project=get('vyra_demo_project',null);if(!project){$('conceptText').textContent='No project yet. Go to the Studio to create your first concept.';$('conceptNotes').textContent='';$('reviseForm').querySelector('button').disabled=true;$('downloadBtn').disabled=true;}else{
 const render=()=>{$('projectType').textContent=project.mediaType+' concept · '+project.format;$('conceptText').textContent=project.prompt;$('conceptNotes').textContent='Style: '+project.style+' · Format: '+project.format+' · Voiceover requested: '+(project.voice?'Yes':'No')+(project.referenceName?' · Local reference: '+project.referenceName:'')+(project.revisions.length?'\n\nRequested changes:\n'+project.revisions.map((r,i)=>(i+1)+'. '+r).join('\n'):'');$('revisionHistory').innerHTML='';if(!project.revisions.length)$('revisionHistory').textContent='No revisions yet';else project.revisions.forEach((r,i)=>{const s=document.createElement('span');s.textContent=(i+1)+'. '+r;$('revisionHistory').append(s);});};render();
 $('reviseForm').onsubmit=e=>{e.preventDefault();const val=$('changes').value.trim();if(!val)return;project.revisions.push(val);put('vyra_demo_project',project);$('changes').value='';render();};
 $('downloadBtn').onclick=()=>{const content=['VYRA STUDIO — CONCEPT BRIEF','(Design demo; not AI-generated media)','', 'Prompt:',project.prompt,'','Type: '+project.mediaType,'Style: '+project.style,'Format: '+project.format,'Voiceover requested: '+(project.voice?'Yes':'No'),'Reference filename: '+(project.referenceName||'None'),'','Requested revisions:',...(project.revisions.length?project.revisions:['None'])].join('\n');const url=URL.createObjectURL(new Blob([content],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='vyra-creative-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 }
}


/* Accessible, custom VYRA logout confirmation (demo session only) */
function openVyraLogoutDialog(){
 if(document.getElementById('vyraLogoutOverlay'))return;
 const overlay=document.createElement('div');overlay.id='vyraLogoutOverlay';overlay.className='vyra-logout-overlay';
 overlay.innerHTML='<section class="vyra-logout-dialog" role="dialog" aria-modal="true" aria-labelledby="vyraLogoutTitle" aria-describedby="vyraLogoutDescription"><span class="vyra-logout-mark" aria-hidden="true">↪</span><h2 id="vyraLogoutTitle">Leaving VYRA Studio?</h2><p id="vyraLogoutDescription">Are you sure you want to log out? You can sign back in whenever you’re ready.</p><div class="vyra-logout-actions"><button type="button" class="vyra-cancel-logout">Cancel</button><button type="button" class="vyra-confirm-logout">Log Out ↗</button></div></section>';
 document.body.appendChild(overlay);const previous=document.activeElement;const cancel=overlay.querySelector('.vyra-cancel-logout');const confirm=overlay.querySelector('.vyra-confirm-logout');
 const close=()=>{document.removeEventListener('keydown',onKey);overlay.remove();previous?.focus?.()};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const next=e.shiftKey?cancel:confirm;if((e.shiftKey&&document.activeElement===cancel)||(!e.shiftKey&&document.activeElement===confirm)){e.preventDefault();(e.shiftKey?confirm:cancel).focus()}}};
 cancel.onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 confirm.onclick=()=>{sessionStorage.removeItem('vyra_demo_session');location.href='login.html'};
 document.addEventListener('keydown',onKey);cancel.focus();
}
