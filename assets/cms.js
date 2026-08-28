
/* ========== GrowUp AI Course Notes — Content Editor v2 ========== */
(function(){
'use strict';
var KEY='ai-b01-cms-v2', mem={};
var store={
  read:function(){ try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):(mem.d||null);}catch(e){return mem.d||null;} },
  write:function(d){ mem.d=d; try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){} }
};
function seedHash(o){var s=JSON.stringify(o)||'',h=5381;for(var i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return s.length+'-'+h.toString(36);}

var DB=store.read()||{};
if(!DB.pages)DB.pages={};
/* Per-day seed merge. app.js calls this after a day's ins file loads.
   Each day carries its own hash, so shipping a new version of one day
   refreshes only that day and leaves the learner's other edits alone. */
window.__CMS_PAGE__=function(key,ins){
  if(!ins||typeof ins!=='object')return;
  var h=seedHash(ins),ap=null,sk=KEY+':seed:'+key;
  try{ap=localStorage.getItem(sk);}catch(e){ap=mem['s'+key]||null;}
  if(ap!==h){
    DB.pages[key]={sec:{},order:null,tail:[],ins:ins};
    store.write(DB); mem['s'+key]=h;
    try{localStorage.setItem(sk,h);}catch(e){}
  }
};
if(!DB.pages)DB.pages={};
if(!DB.settings)DB.settings={theme:'light',font:'m',width:'normal',accent:'#4f8cff'};

function page(k){ var p=DB.pages[k]; if(!p){p=DB.pages[k]={sec:{},ins:{},order:null,tail:[]};} 
  if(!p.sec)p.sec={}; if(!p.ins)p.ins={}; if(!p.tail)p.tail=[]; return p; }
function save(){ store.write(DB); }

var COLORS=['#4f8cff','#a06cf0','#3ec6a8','#f0a13d','#e35d8a','#14a800','#29b2fe','#d94f4f','#787774'];
var ICONS=('🎯 💡 📌 📖 ⚙️ 🧠 🚀 ✅ ⚠️ ❗ 🔑 📊 📈 📝 ✍️ 🗂️ 📚 🎓 🧩 🔍 💬 🗣️ 🤖 🖼️ 🎨 🎬 🎧 🔊 💼 💰 🛒 🏆 ⏰ 📅 🔗 🛠️ 🧪 🔬 ⭐ 🔥 ❤️ 👍 👉 ➡️ 🔄 🌐 📱 💻 🖨️ 🔒 ✨ 🎁 📩 📤 🧾 🏅 🥇 🧭 🪄 🌟 ⚡ 🧱 🪜 🎤 📷 🎞️ 🗒️ 📎 ✂️ 🧮 🔤 🅰️ 🔢 ♻️ 🚦 🛡️ 🎉').split(' ');
var TYPES=[
 {t:'h2',i:'🔠',n:'হেডিং (বড়)'},{t:'h3',i:'🔡',n:'হেডিং (ছোট)'},{t:'text',i:'📝',n:'প্যারাগ্রাফ'},
 {t:'list',i:'•',n:'লিস্ট'},{t:'callout',i:'💡',n:'Callout বক্স'},{t:'chips',i:'🏷️',n:'চিপ রো'},
 {t:'image',i:'🖼️',n:'ছবি'},{t:'table',i:'📊',n:'টেবিল'},{t:'code',i:'⌨️',n:'কোড / প্রম্পট'},
 {t:'flow',i:'➡️',n:'ফ্লো ডায়াগ্রাম'},{t:'quote',i:'❝',n:'উক্তি বক্স'},{t:'video',i:'▶️',n:'ভিডিও (YouTube)'},
 {t:'divider',i:'—',n:'বিভাজক রেখা'},{t:'html',i:'</>',n:'কাস্টম HTML'}
];
function uid(){return 'b'+Math.floor(performance.now()*1000).toString(36)+Math.floor(Math.random()*1e6).toString(36);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function nl2br(s){return esc(s).replace(/\n/g,'<br>');}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function toast(m){var t=document.getElementById('ed-toast');t.textContent=m;t.classList.add('show');clearTimeout(t.__h);t.__h=setTimeout(function(){t.classList.remove('show');},1900);}

/* ---------- block render ---------- */
function blockHTML(b){
  var d=b.data||{};
  switch(b.type){
    case 'h2': return '<div class="cb-h2">'+esc(d.text)+'</div>';
    case 'h3': return '<div class="cb-h3">'+esc(d.text)+'</div>';
    case 'text': return '<div class="cb-text">'+(d.html||nl2br(d.text))+'</div>';
    case 'list': var g=d.ordered?'ol':'ul';
      return '<'+g+' class="cb-list">'+(d.items||[]).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</'+g+'>';
    case 'callout': return '<div class="cb-callout" style="--cc:'+esc(d.color||'#4f8cff')+'"><div class="cb-co-h"><span class="ic">'+esc(d.icon||'💡')+'</span>'+esc(d.title||'')+'</div><div class="cb-co-b">'+nl2br(d.body)+'</div></div>';
    case 'chips': return '<div class="cb-chips">'+(d.label?'<div class="cb-chips-label">'+esc(d.label)+'</div>':'')+(d.items||[]).map(function(c){return '<span class="cb-chip" style="--pc:'+esc(c.color||'#4f8cff')+'">'+esc(c.text)+'</span>';}).join('')+'</div>';
    case 'image': return '<div class="cb-img">'+(d.src?'<img src="'+d.src+'" alt="'+esc(d.caption||'')+'">':'')+(d.caption?'<div class="cap">'+esc(d.caption)+'</div>':'')+'</div>';
    case 'table': return '<table class="cb-tbl"><thead><tr>'+(d.headers||[]).map(function(x){return '<th>'+esc(x)+'</th>';}).join('')+'</tr></thead><tbody>'+(d.rows||[]).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';
    case 'code': return '<div class="cb-code"><div class="hd"><span>'+esc(d.title||'প্রম্পট')+'</span><button type="button" data-copy="1">কপি</button></div><pre>'+esc(d.code)+'</pre></div>';
    case 'flow': var st=d.steps||[],p=[];
      st.forEach(function(s,i){p.push('<div class="st" style="--sc:'+esc(s.color||COLORS[i%COLORS.length])+'"><span class="ic">'+esc(s.icon||'🔹')+'</span><span class="tx">'+esc(s.text)+'</span></div>');if(i<st.length-1)p.push('<div class="ar">→</div>');});
      return '<div class="cb-flow">'+p.join('')+'</div>';
    case 'quote': return '<div class="cb-quote">'+nl2br(d.text)+'</div>';
    case 'divider': return '<hr class="cb-divider">';
    case 'video': var id=(d.url||'').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
      return id?'<div class="cb-video"><iframe src="https://www.youtube.com/embed/'+id[1]+'" allowfullscreen loading="lazy"></iframe></div>':'<div class="cb-quote">ভিডিও লিংক ঠিক নয়</div>';
    case 'html': return '<div class="cb-raw">'+(d.html||'')+'</div>';
  }
  return '';
}
function blockNode(b){
  var w=el('div','cb-item',blockHTML(b)); w.dataset.id=b.id;
  w.appendChild(el('div','cb-ctrls','<button type="button" data-a="up" title="উপরে">↑</button><button type="button" data-a="down" title="নিচে">↓</button><button type="button" data-a="edit" title="এডিট">✏️</button><button type="button" data-a="del" title="মুছুন">🗑️</button>'));
  return w;
}

/* ---------- modal ---------- */
var ov,modal;
function openModal(title,html,onSave){
  modal.innerHTML='<h3>'+esc(title)+'</h3>'+html+'<div class="ed-acts"><button type="button" class="ed-btn" data-x="c">বাতিল</button>'+(onSave?'<button type="button" class="ed-btn primary" data-x="s">সংরক্ষণ</button>':'')+'</div>';
  ov.classList.add('open');
  modal.querySelector('[data-x="c"]').onclick=closeModal;
  var s=modal.querySelector('[data-x="s"]'); if(s)s.onclick=function(){ if(onSave(modal)!==false) closeModal(); };
}
function closeModal(){ov.classList.remove('open');modal.innerHTML='';}
function colorPicker(sel){return '<div class="ed-colors">'+COLORS.map(function(c){return '<button type="button" class="ed-col'+(c===sel?' sel':'')+'" data-c="'+c+'" style="background:'+c+'"></button>';}).join('')+'</div>';}
function iconPicker(sel){return '<div class="ed-icons">'+ICONS.map(function(i){return '<button type="button" class="ed-ic'+(i===sel?' sel':'')+'" data-i="'+i+'">'+i+'</button>';}).join('')+'</div>';}
function wirePickers(r){
  r.querySelectorAll('.ed-colors').forEach(function(g){g.onclick=function(e){var b=e.target.closest('.ed-col');if(!b)return;g.querySelectorAll('.ed-col').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');};});
  r.querySelectorAll('.ed-icons').forEach(function(g){g.onclick=function(e){var b=e.target.closest('.ed-ic');if(!b)return;g.querySelectorAll('.ed-ic').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');};});
}
function pc(r,f){var s=r.querySelector('.ed-col.sel');return s?s.dataset.c:(f||COLORS[0]);}
function pi(r,f){var s=r.querySelector('.ed-ic.sel');return s?s.dataset.i:(f||'💡');}
function tblEd(hs,rs){var h='<table class="ed-tbl-e"><tr>'+hs.map(function(x){return '<td><input type="text" value="'+esc(x)+'" style="font-weight:700"></td>';}).join('')+'</tr>';rs.forEach(function(r){h+='<tr>'+r.map(function(c){return '<td><input type="text" value="'+esc(c)+'"></td>';}).join('')+'</tr>';});return h+'</table>';}
function readTbl(r){var rows=[].slice.call(r.querySelectorAll('.ed-tbl-e tr'));return {headers:[].slice.call(rows[0].querySelectorAll('input')).map(function(i){return i.value;}),rows:rows.slice(1).map(function(t){return [].slice.call(t.querySelectorAll('input')).map(function(i){return i.value;});})};}

function form(t,d){
  d=d||{};
  switch(t){
    case 'h2': case 'h3': return '<div class="ed-f"><label>শিরোনাম</label><input type="text" id="f-text" value="'+esc(d.text||'')+'"></div>';
    case 'text': return '<div class="ed-f"><label>লেখা</label><textarea id="f-text">'+esc(d.text||'')+'</textarea></div>';
    case 'quote': return '<div class="ed-f"><label>উক্তি / গুরুত্বপূর্ণ কথা</label><textarea id="f-text">'+esc(d.text||'')+'</textarea></div>';
    case 'list': return '<div class="ed-f"><label>তালিকা (প্রতি লাইনে একটি)</label><textarea id="f-items">'+esc((d.items||[]).join('\n'))+'</textarea></div><div class="ed-f"><label>ধরন</label><select id="f-ord"><option value="0"'+(!d.ordered?' selected':'')+'>বুলেট (•)</option><option value="1"'+(d.ordered?' selected':'')+'>নাম্বার</option></select></div>';
    case 'callout': return '<div class="ed-f"><label>শিরোনাম</label><input type="text" id="f-title" value="'+esc(d.title||'')+'"></div><div class="ed-f"><label>বিবরণ</label><textarea id="f-body">'+esc(d.body||'')+'</textarea></div><div class="ed-f"><label>আইকন</label>'+iconPicker(d.icon||'💡')+'</div><div class="ed-f"><label>রঙ</label>'+colorPicker(d.color||'#a06cf0')+'</div>';
    case 'chips': return '<div class="ed-f"><label>উপরের লেখা (ঐচ্ছিক)</label><input type="text" id="f-label" value="'+esc(d.label||'')+'"></div><div class="ed-f"><label>চিপ (প্রতি লাইনে একটি)</label><textarea id="f-items">'+esc((d.items||[]).map(function(c){return c.text;}).join('\n'))+'</textarea></div>';
    case 'image': return '<div class="ed-f"><label>ছবি</label><div class="ed-drop" id="f-drop">ক্লিক করুন বা ছবি টেনে আনুন</div><input type="file" id="f-file" accept="image/*" style="display:none"><div class="ed-prev" id="f-prev">'+(d.src?'<img src="'+d.src+'">':'')+'</div></div><div class="ed-f"><label>ক্যাপশন</label><input type="text" id="f-cap" value="'+esc(d.caption||'')+'"></div>';
    case 'table': return '<div class="ed-f"><label>টেবিল</label><div id="f-tbl">'+tblEd(d.headers||['কলাম ১','কলাম ২'],d.rows||[['',''],['','']])+'</div><div style="display:flex;gap:8px;margin-top:9px"><button type="button" class="ed-mini" id="f-ar">+ সারি</button><button type="button" class="ed-mini" id="f-ac">+ কলাম</button><button type="button" class="ed-mini" id="f-dr">− সারি</button><button type="button" class="ed-mini" id="f-dc">− কলাম</button></div></div>';
    case 'code': return '<div class="ed-f"><label>শিরোনাম</label><input type="text" id="f-title" value="'+esc(d.title||'প্রম্পট')+'"></div><div class="ed-f"><label>কোড / প্রম্পট</label><textarea id="f-code" style="min-height:150px;font-family:Consolas,monospace">'+esc(d.code||'')+'</textarea></div>';
    case 'flow': return '<div class="ed-f"><label>ধাপ (প্রতি লাইনে একটি, শুরুতে ইমোজি দিতে পারেন)</label><textarea id="f-steps" placeholder="📝 লেখা&#10;⚙️ টোকেন">'+esc((d.steps||[]).map(function(s){return (s.icon||'🔹')+' '+s.text;}).join('\n'))+'</textarea></div>';
    case 'video': return '<div class="ed-f"><label>YouTube লিংক</label><input type="text" id="f-url" value="'+esc(d.url||'')+'" placeholder="https://www.youtube.com/watch?v=..."></div>';
    case 'divider': return '<div class="ed-f"><div class="hint">একটি অনুভূমিক বিভাজক রেখা যোগ হবে।</div></div>';
    case 'html': return '<div class="ed-f"><label>কাস্টম HTML</label><textarea id="f-html" style="min-height:170px;font-family:Consolas,monospace">'+esc(d.html||'')+'</textarea><div class="hint">নিজের ডিজাইন/এম্বেড কোড বসাতে পারবেন।</div></div>';
  }
  return '';
}
function collect(t,r,prev){
  prev=prev||{}; var g=function(i){var e=r.querySelector('#'+i);return e?e.value:'';};
  switch(t){
    case 'h2': case 'h3': case 'text': case 'quote': return {text:g('f-text')};
    case 'list': return {items:g('f-items').split('\n').filter(function(x){return x.trim();}),ordered:g('f-ord')==='1'};
    case 'callout': return {title:g('f-title'),body:g('f-body'),icon:pi(r,'💡'),color:pc(r,'#a06cf0')};
    case 'chips': return {label:g('f-label'),items:g('f-items').split('\n').filter(function(x){return x.trim();}).map(function(x,i){return {text:x.trim(),color:COLORS[i%COLORS.length]};})};
    case 'image': var im=r.querySelector('#f-prev img');return {src:im?im.getAttribute('src'):(prev.src||''),caption:g('f-cap')};
    case 'table': return readTbl(r);
    case 'code': return {title:g('f-title'),code:g('f-code')};
    case 'flow': return {steps:g('f-steps').split('\n').filter(function(x){return x.trim();}).map(function(l,i){var m=l.trim().match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u);return m?{icon:m[1],text:m[2],color:COLORS[i%COLORS.length]}:{icon:'🔹',text:l.trim(),color:COLORS[i%COLORS.length]};})};
    case 'video': return {url:g('f-url')};
    case 'divider': return {};
    case 'html': return {html:g('f-html')};
  }
  return {};
}
function wireForm(t,r){
  wirePickers(r);
  if(t==='image'){
    var dp=r.querySelector('#f-drop'),fi=r.querySelector('#f-file'),pv=r.querySelector('#f-prev');
    var ld=function(f){if(!f||!/^image\//.test(f.type))return;var rd=new FileReader();rd.onload=function(){pv.innerHTML='<img src="'+rd.result+'">';};rd.readAsDataURL(f);};
    dp.onclick=function(){fi.click();}; fi.onchange=function(){ld(fi.files[0]);};
    dp.ondragover=function(e){e.preventDefault();dp.classList.add('over');};
    dp.ondragleave=function(){dp.classList.remove('over');};
    dp.ondrop=function(e){e.preventDefault();dp.classList.remove('over');ld(e.dataTransfer.files[0]);};
  }
  if(t==='table'){
    var host=r.querySelector('#f-tbl');
    r.querySelector('#f-ar').onclick=function(){var x=readTbl(r);x.rows.push(x.headers.map(function(){return '';}));host.innerHTML=tblEd(x.headers,x.rows);};
    r.querySelector('#f-ac').onclick=function(){var x=readTbl(r);x.headers.push('কলাম '+(x.headers.length+1));x.rows.forEach(function(q){q.push('');});host.innerHTML=tblEd(x.headers,x.rows);};
    r.querySelector('#f-dr').onclick=function(){var x=readTbl(r);if(x.rows.length>1){x.rows.pop();host.innerHTML=tblEd(x.headers,x.rows);}};
    r.querySelector('#f-dc').onclick=function(){var x=readTbl(r);if(x.headers.length>1){x.headers.pop();x.rows.forEach(function(q){q.pop();});host.innerHTML=tblEd(x.headers,x.rows);}};
  }
}

/* ---------- block CRUD ---------- */
function listFor(key,sid){ var p=page(key); if(sid==null) return p.tail; if(!p.ins[sid])p.ins[sid]=[]; return p.ins[sid]; }
function addBlock(key,sid){
  openModal('নতুন ব্লক যোগ করুন','<div class="ed-grid">'+TYPES.map(function(t){return '<button type="button" class="ed-type" data-t="'+t.t+'"><span class="i">'+t.i+'</span><span class="n">'+t.n+'</span></button>';}).join('')+'</div>',null);
  modal.querySelector('.ed-grid').onclick=function(e){var b=e.target.closest('.ed-type');if(!b)return;editBlock(key,sid,null,b.dataset.t);};
}
function editBlock(key,sid,id,type){
  var L=listFor(key,sid), ex=id?L.filter(function(x){return x.id===id;})[0]:null;
  var t=type||(ex&&ex.type), d=ex?ex.data:{};
  var nm=(TYPES.filter(function(x){return x.t===t;})[0]||{}).n||t;
  openModal((ex?'এডিট: ':'নতুন: ')+nm,form(t,d),function(r){
    var data=collect(t,r,d);
    if(ex)ex.data=data; else L.push({id:uid(),type:t,data:data});
    save(); rerender(key); toast('সংরক্ষিত ✅');
  });
  wireForm(t,modal);
}
function delBlock(key,sid,id){ if(!confirm('ব্লকটি মুছে ফেলবেন?'))return; var L=listFor(key,sid);
  var i=L.findIndex(function(x){return x.id===id;}); if(i>-1)L.splice(i,1); save(); rerender(key); toast('মুছে ফেলা হয়েছে'); }
function moveBlock(key,sid,id,dir){ var L=listFor(key,sid),i=L.findIndex(function(x){return x.id===id;}),j=i+dir;
  if(i<0||j<0||j>=L.length)return; var t=L[i];L[i]=L[j];L[j]=t; save(); rerender(key); }

/* ---------- sectionize ---------- */
function pageBody(key){ return key==='home'?document.getElementById('home-page'):document.querySelector('#page-'+key+' .md-body'); }

function sectionize(key){
  var body=pageBody(key); if(!body||body.dataset.sectioned)return;
  if(key==='home'){ body.dataset.sectioned='1'; return; }
  var kids=[].slice.call(body.childNodes), secs=[], cur=null, n=0;
  kids.forEach(function(node){
    var isH = node.nodeType===1 && /^H[12]$/.test(node.tagName);
    if(isH || !cur){ cur=el('section','cb-sec'); cur.dataset.sid=key+'-s'+(n++); secs.push(cur); }
    cur.appendChild(node);
  });
  body.innerHTML='';
  secs.forEach(function(s){
    var head=(s.querySelector('h1,h2')||{}).textContent||'অংশ';
    s.dataset.title=head.trim().slice(0,60);
    s.appendChild(el('div','sec-ctrls',
      '<button type="button" data-s="edit" title="এই অংশ এডিট করুন">✏️ এডিট</button>'+
      '<button type="button" data-s="add" title="এই অংশের পরে ব্লক">＋</button>'+
      '<button type="button" data-s="up" title="উপরে">↑</button>'+
      '<button type="button" data-s="down" title="নিচে">↓</button>'+
      '<button type="button" data-s="hide" title="লুকান/দেখান">👁</button>'+
      '<button type="button" data-s="del" title="মুছুন">🗑️</button>'));
    var ins=el('div','sec-ins','<button type="button" data-ins="'+s.dataset.sid+'">＋ এখানে নতুন ব্লক</button>');
    body.appendChild(s); body.appendChild(ins);
    var box=el('div','cb-container'); box.dataset.key=key; box.dataset.sid=s.dataset.sid;
    body.insertBefore(box, ins);
  });
  body.dataset.sectioned='1';
}

function applyState(key){
  var p=page(key), body=pageBody(key); if(!body)return;
  // section overrides
  body.querySelectorAll('.cb-sec').forEach(function(s){
    var st=p.sec[s.dataset.sid];
    if(st){
      if(st.html!=null && s.dataset.applied!==st.html){
        var ctrls=s.querySelector('.sec-ctrls');
        s.innerHTML=st.html; if(ctrls) s.appendChild(ctrls);
        s.dataset.applied=st.html;
      }
      s.classList.toggle('hidden',!!st.hidden);
    } else { s.classList.remove('hidden'); }
  });
  // ordering
  if(p.order&&p.order.length){
    p.order.forEach(function(sid){
      var s=body.querySelector('.cb-sec[data-sid="'+sid+'"]'); if(!s)return;
      var box=body.querySelector('.cb-container[data-sid="'+sid+'"]');
      var ins=box?box.nextElementSibling:null;
      body.appendChild(s); if(box)body.appendChild(box); if(ins)body.appendChild(ins);
    });
  }
  // inserted blocks
  body.querySelectorAll('.cb-container[data-sid]').forEach(function(box){
    box.innerHTML=''; (p.ins[box.dataset.sid]||[]).forEach(function(b){box.appendChild(blockNode(b));});
  });
  // tail blocks
  var tail=(key==='home'?document.getElementById('home-page'):document.getElementById('page-'+key)).querySelector('.cb-container.tail');
  if(tail){ tail.innerHTML=''; p.tail.forEach(function(b){tail.appendChild(blockNode(b));}); }
}
function rerender(key){ applyState(key); }

function enhance(key){
  if(!key) return;
  sectionize(key);
  var host=key==='home'?document.getElementById('home-page'):document.getElementById('page-'+key);
  if(host && !host.querySelector('.cb-container.tail')){
    var t=el('div','cb-container tail'); t.dataset.key=key;
    var a=el('div','cb-add','<button type="button" data-key="'+key+'">＋ পেজের শেষে নতুন ব্লক</button>');
    var ft=host.querySelector('.day-footer');
    if(ft){host.insertBefore(t,ft);host.insertBefore(a,ft);} else {host.appendChild(t);host.appendChild(a);}
  }
  applyState(key);
}

/* ---------- inline section editing ---------- */
var editingSec=null;
function secBody(s){ return s; }
function startEdit(s,key){
  if(editingSec) stopEdit(true);
  editingSec={s:s,key:key};
  s.classList.add('editing');
  s.setAttribute('contenteditable','true');
  s.focus();
  showFmt();
  toast('লেখা সরাসরি বদলান — শেষে "✅ সম্পন্ন" চাপুন');
  var c=s.querySelector('.sec-ctrls');
  if(c) c.innerHTML='<button type="button" data-s="done" class="go">✅ সম্পন্ন</button><button type="button" data-s="cancel">✖ বাতিল</button>';
}
function stopEdit(cancel){
  if(!editingSec)return;
  var s=editingSec.s,key=editingSec.key;
  s.removeAttribute('contenteditable'); s.classList.remove('editing');
  var ctrls=s.querySelector('.sec-ctrls'); if(ctrls) ctrls.remove();
  if(!cancel){
    var clone=s.cloneNode(true);
    clone.querySelectorAll('.sec-ctrls').forEach(function(x){x.remove();});
    var p=page(key); var sid=s.dataset.sid;
    p.sec[sid]=p.sec[sid]||{}; p.sec[sid].html=clone.innerHTML; s.dataset.applied=clone.innerHTML;
    save(); toast('সেকশন সংরক্ষিত ✅');
  }
  s.appendChild(el('div','sec-ctrls',
    '<button type="button" data-s="edit">✏️ এডিট</button><button type="button" data-s="add">＋</button>'+
    '<button type="button" data-s="up">↑</button><button type="button" data-s="down">↓</button>'+
    '<button type="button" data-s="hide">👁</button><button type="button" data-s="del">🗑️</button>'));
  editingSec=null; hideFmt();
  if(cancel){ applyState(key); }
}
var fmt;
function showFmt(){ fmt.classList.add('show'); positionFmt(); }
function hideFmt(){ fmt.classList.remove('show'); }
function positionFmt(){
  if(!editingSec)return; var r=editingSec.s.getBoundingClientRect();
  fmt.style.left=Math.max(10,Math.min(window.innerWidth-440,r.left))+'px';
  fmt.style.top=Math.max(10,r.top-52)+'px';
}
function exec(c,v){ document.execCommand(c,false,v||null); }

/* ---------- section ops ---------- */
function secOp(a,s,key){
  var p=page(key),sid=s.dataset.sid,body=pageBody(key);
  if(a==='edit'){ startEdit(s,key); return; }
  if(a==='done'){ stopEdit(false); return; }
  if(a==='cancel'){ stopEdit(true); return; }
  if(a==='add'){ addBlock(key,sid); return; }
  if(a==='hide'){ p.sec[sid]=p.sec[sid]||{}; p.sec[sid].hidden=!p.sec[sid].hidden; save(); applyState(key); toast(p.sec[sid].hidden?'অংশটি লুকানো হলো':'আবার দেখানো হচ্ছে'); return; }
  if(a==='del'){ if(!confirm('এই পুরো অংশটি মুছে ফেলবেন?'))return; p.sec[sid]=p.sec[sid]||{}; p.sec[sid].hidden=true; save(); applyState(key); toast('মুছে ফেলা হলো (👁 দিয়ে ফেরানো যাবে)'); return; }
  if(a==='up'||a==='down'){
    var all=[].slice.call(body.querySelectorAll('.cb-sec')).map(function(x){return x.dataset.sid;});
    var order=(p.order&&p.order.length)?p.order.slice():all;
    all.forEach(function(x){ if(order.indexOf(x)<0) order.push(x); });
    var i=order.indexOf(sid), j=i+(a==='up'?-1:1);
    if(i<0||j<0||j>=order.length)return;
    var t=order[i];order[i]=order[j];order[j]=t;
    p.order=order; save(); applyState(key);
    toast('ক্রম বদলানো হলো');
  }
}

/* ---------- settings ---------- */
function applySettings(){
  var s=DB.settings;
  document.body.classList.toggle('theme-dark',s.theme==='dark');
  document.body.classList.remove('fs-s','fs-l');
  if(s.font==='s')document.body.classList.add('fs-s');
  if(s.font==='l')document.body.classList.add('fs-l');
  document.body.classList.toggle('wide',s.width==='wide');
  document.documentElement.style.setProperty('--accent2',s.accent||'#4f8cff');
}
function openSettings(){
  var s=DB.settings;
  var seg=function(name,opts,cur){return '<div class="seg" data-set="'+name+'">'+opts.map(function(o){return '<button type="button" data-v="'+o[0]+'" class="'+(cur===o[0]?'on':'')+'">'+o[1]+'</button>';}).join('')+'</div>';};
  openModal('⚙️ কাস্টমাইজেশন',
    '<div class="set-row"><div><div class="lb">থিম</div><div class="sub">লাইট বা ডার্ক</div></div>'+seg('theme',[['light','☀️ লাইট'],['dark','🌙 ডার্ক']],s.theme)+'</div>'+
    '<div class="set-row"><div><div class="lb">লেখার আকার</div><div class="sub">পড়ার সুবিধামতো</div></div>'+seg('font',[['s','ছোট'],['m','মাঝারি'],['l','বড়']],s.font)+'</div>'+
    '<div class="set-row"><div><div class="lb">পেজের প্রস্থ</div><div class="sub">সরু বা চওড়া</div></div>'+seg('width',[['normal','সরু'],['wide','চওড়া']],s.width)+'</div>'+
    '<div class="set-row"><div><div class="lb">মূল রঙ</div><div class="sub">বাটন ও হাইলাইট</div></div>'+colorPicker(s.accent)+'</div>',
    function(r){
      r.querySelectorAll('.seg').forEach(function(g){var on=g.querySelector('button.on');if(on)DB.settings[g.dataset.set]=on.dataset.v;});
      DB.settings.accent=pc(r,s.accent); save(); applySettings(); toast('কাস্টমাইজেশন সংরক্ষিত ✅');
    });
  wirePickers(modal);
  modal.querySelectorAll('.seg').forEach(function(g){g.onclick=function(e){var b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');};});
}

/* ---------- export / import ---------- */
function dl(n,c,m){var b=new Blob([c],{type:m||'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove();},400);}
function expJSON(){dl('course-notes-content.json',JSON.stringify(DB,null,1),'application/json');toast('JSON ডাউনলোড হচ্ছে…');}
function expHTML(){
  if(editingSec) stopEdit(false);
  var doc=document.documentElement.cloneNode(true);
  ['.cb-container','.cb-add','.cb-item','.sec-ctrls','.sec-ins','.ed-bar','.ed-ov','.ed-toast','.fmt','#cms-seed'].forEach(function(s){doc.querySelectorAll(s).forEach(function(n){n.remove();});});
  // unwrap sections back to plain content so re-sectionizing works cleanly
  doc.querySelectorAll('.md-body').forEach(function(b){
    var secs=[].slice.call(b.querySelectorAll(':scope > .cb-sec'));
    if(!secs.length)return;
    var frag=doc.ownerDocument.createDocumentFragment?document.createDocumentFragment():null;
    var html=secs.map(function(s){return s.innerHTML;}).join('\n');
    b.innerHTML=html; b.removeAttribute('data-sectioned');
  });
  var body=doc.querySelector('body'); if(body){body.className='';}
  var sc=document.createElement('script'); sc.id='cms-seed';
  sc.textContent='window.__CMS_SEED__='+JSON.stringify({pages:{},settings:DB.settings}).replace(/</g,'\\u003c')+';';
  doc.querySelector('head').appendChild(sc);
  dl('course-notes.html','<!DOCTYPE html>\n'+doc.outerHTML,'text/html;charset=utf-8');
  toast('HTML ডাউনলোড হচ্ছে…');
}
function impJSON(){
  var f=document.createElement('input');f.type='file';f.accept='application/json,.json';
  f.onchange=function(){var file=f.files[0];if(!file)return;var r=new FileReader();
    r.onload=function(){try{var d=JSON.parse(r.result);if(!d||typeof d!=='object')throw 0;
      DB=d.pages?d:{pages:d,settings:DB.settings}; if(!DB.settings)DB.settings={theme:'light',font:'m',width:'normal',accent:'#4f8cff'};
      save();applySettings();document.querySelectorAll('.md-body[data-sectioned]').forEach(function(b){});
      Object.keys(DB.pages).forEach(function(k){ if(pageBody(k)) applyState(k); });
      toast('ইমপোর্ট সফল ✅ — পেজ রিলোড করলে সব দেখা যাবে');
    }catch(e){alert('ফাইলটি পড়া গেল না।');}};
    r.readAsText(file);};
  f.click();
}
function resetAll(){
  if(!confirm('সব কাস্টম এডিট মুছে আসল অবস্থায় ফিরে যাবেন?'))return;
  DB={pages:{},settings:DB.settings}; save();
  try{localStorage.removeItem(KEY+':seed');for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&k.indexOf(KEY+':seed:')===0)localStorage.removeItem(k);}}catch(e){}
  location.reload();
}

/* ---------- boot ---------- */
function init(){
  applySettings();
  var bar=el('div','ed-bar');
  bar.innerHTML='<div class="ed-tools">'+
    '<div class="ed-hint">যেকোনো অংশে মাউস নিলে <b>✏️ এডিট</b> আসবে — সরাসরি লেখা বদলান, ব্লক ঢোকান, ক্রম বদলান বা লুকান।</div>'+
    '<button type="button" class="ed-btn" data-a="set">⚙️ কাস্টমাইজ</button>'+
    '<button type="button" class="ed-btn" data-a="eh">⬇ HTML এক্সপোর্ট</button>'+
    '<button type="button" class="ed-btn" data-a="ej">⬇ JSON এক্সপোর্ট</button>'+
    '<button type="button" class="ed-btn" data-a="ij">⬆ JSON ইমপোর্ট</button>'+
    '<button type="button" class="ed-btn" data-a="rs">♻️ রিসেট</button>'+
    '</div><button type="button" class="ed-btn primary" data-a="tg">✏️ এডিট মোড</button>';
  document.body.appendChild(bar);

  ov=el('div','ed-ov'); modal=el('div','ed-modal'); ov.appendChild(modal); document.body.appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)closeModal();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(ov.classList.contains('open'))closeModal();else if(editingSec)stopEdit(true);}});
  var t=el('div','ed-toast');t.id='ed-toast';document.body.appendChild(t);

  fmt=el('div','fmt',
    '<button type="button" data-f="bold" title="বোল্ড"><b>B</b></button>'+
    '<button type="button" data-f="italic" title="ইটালিক"><i>I</i></button>'+
    '<button type="button" data-f="underline" title="আন্ডারলাইন"><u>U</u></button>'+
    '<span class="sep"></span>'+
    '<button type="button" data-f="h2">H2</button><button type="button" data-f="h3">H3</button>'+
    '<button type="button" data-f="p">¶</button>'+
    '<span class="sep"></span>'+
    '<button type="button" data-f="ul">• তালিকা</button><button type="button" data-f="ol">1. তালিকা</button>'+
    '<span class="sep"></span>'+
    '<button type="button" data-f="hl" title="হাইলাইট">🖍️</button>'+
    '<input type="color" data-f="color" value="#4f8cff" title="লেখার রঙ">'+
    '<button type="button" data-f="link">🔗</button>'+
    '<button type="button" data-f="clear" title="ফরম্যাট মুছুন">✖</button>');
  document.body.appendChild(fmt);
  fmt.addEventListener('mousedown',function(e){e.preventDefault();});
  fmt.addEventListener('click',function(e){
    var b=e.target.closest('[data-f]'); if(!b||b.tagName==='INPUT')return;
    var f=b.dataset.f;
    if(f==='bold'||f==='italic'||f==='underline')exec(f);
    else if(f==='h2')exec('formatBlock','<h2>'); else if(f==='h3')exec('formatBlock','<h3>');
    else if(f==='p')exec('formatBlock','<p>');
    else if(f==='ul')exec('insertUnorderedList'); else if(f==='ol')exec('insertOrderedList');
    else if(f==='hl')exec('hiliteColor','#fff3a3');
    else if(f==='link'){var u=prompt('লিংক দিন:','https://');if(u)exec('createLink',u);}
    else if(f==='clear')exec('removeFormat');
  });
  fmt.querySelector('input[data-f="color"]').addEventListener('input',function(e){exec('foreColor',e.target.value);});
  window.addEventListener('scroll',positionFmt,true);
  window.addEventListener('resize',positionFmt);

  bar.addEventListener('click',function(e){
    var b=e.target.closest('[data-a]'); if(!b)return; var a=b.dataset.a;
    if(a==='tg'){ if(editingSec)stopEdit(false);
      document.body.classList.toggle('ed-mode');
      var on=document.body.classList.contains('ed-mode');
      b.classList.toggle('on',on); b.textContent=on?'✅ এডিট শেষ':'✏️ এডিট মোড';
      toast(on?'এডিট মোড চালু':'এডিট মোড বন্ধ'); }
    else if(a==='set')openSettings(); else if(a==='eh')expHTML();
    else if(a==='ej')expJSON(); else if(a==='ij')impJSON(); else if(a==='rs')resetAll();
  });

  document.addEventListener('click',function(e){
    var sc=e.target.closest('.sec-ctrls button');
    if(sc){ var s=sc.closest('.cb-sec'); secOp(sc.dataset.s,s,curKey()); return; }
    var ins=e.target.closest('.sec-ins button');
    if(ins){ addBlock(curKey(),ins.dataset.ins); return; }
    var ad=e.target.closest('.cb-add button');
    if(ad){ addBlock(ad.dataset.key,null); return; }
    var cc=e.target.closest('.cb-ctrls button');
    if(cc){ var it=cc.closest('.cb-item'),box=it.closest('.cb-container');
      var key=box.dataset.key||curKey(), sid=box.dataset.sid||null, id=it.dataset.id, a=cc.dataset.a;
      if(a==='edit')editBlock(key,sid,id); else if(a==='del')delBlock(key,sid,id);
      else moveBlock(key,sid,id,a==='up'?-1:1); return; }
    var cp=e.target.closest('.cb-code .hd button[data-copy]');
    if(cp){ var code=cp.closest('.cb-code').querySelector('pre').textContent;
      if(navigator.clipboard)navigator.clipboard.writeText(code).then(function(){cp.textContent='কপি হয়েছে ✓';setTimeout(function(){cp.textContent='কপি';},1600);}); }
  });

  // hook page navigation
  var _sd=window.showDay, _sh=window.showHome;
  if(typeof _sd==='function'){ window.showDay=function(d){ if(editingSec)stopEdit(false); return Promise.resolve(_sd(d)).then(function(){ enhance(d); }); }; }
  if(typeof _sh==='function'){ window.showHome=function(){ if(editingSec)stopEdit(false); _sh(); setTimeout(function(){enhance('home');},30); }; }
  if(document.getElementById('home-page')) enhance('home');
  else window.addEventListener('nav-ready',function(){enhance('home');},{once:true});
}
function curKey(){
  var a=document.querySelector('.day-page.active');
  if(!a)return 'home';
  return a.id==='home-page'?'home':a.id.replace('page-','');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();

