/* ===== GrowUp Class Page v2 — interactions (video, quiz, outcome) ===== */
(function(){
if(window.__GU_CLASS2__) return; window.__GU_CLASS2__=1;
var OKEY='growup-outcomes';
function rd(){try{return JSON.parse(localStorage.getItem(OKEY)||'{}');}catch(e){return window.__guOut||{};}}
function wr(o){window.__guOut=o;try{localStorage.setItem(OKEY,JSON.stringify(o));}catch(e){}}

/* ---- outcome checklist sync ---- */
function syncOut(root){
  var db=rd();
  (root||document).querySelectorAll('.ls-out').forEach(function(bx){
    var done=0,all=bx.querySelectorAll('.oc');
    all.forEach(function(b){
      var id=b.dataset.oc; if(!id) return;
      var on=!!db[id]; b.classList.toggle('on',on); if(on)done++;
      var m=b.querySelector('.bx'); if(m)m.textContent=on?'✓':'';
    });
    var p=bx.querySelector('.oprog');
    if(p&&all.length)p.textContent=done+' / '+all.length+' সম্পন্ন'+(done===all.length?' — 🎉 আজকের আউটকাম পূর্ণ!':'');
  });
}
window.__guSyncOut=syncOut;

/* ---- quiz score ---- */
function score(q){
  var qs=q.querySelectorAll('.qz-q'),done=0,right=0;
  qs.forEach(function(x){ if(x.classList.contains('locked')){done++; if(x.dataset.got==='1')right++;} });
  var sc=q.querySelector('.sc'),fl=q.querySelector('.fill');
  if(sc)sc.textContent='স্কোর: '+right+' / '+qs.length;
  if(fl)fl.style.width=(qs.length?Math.round(done/qs.length*100):0)+'%';
  if(done===qs.length&&qs.length){
    q.classList.add('finished');
    var d=q.querySelector('.qz-done');
    if(d){
      var pct=Math.round(right/qs.length*100),msg;
      if(pct>=80)msg='<b>চমৎকার ('+right+'/'+qs.length+')।</b> আপনি আজকের ধারণাগুলো ধরে ফেলেছেন — এবার হোমওয়ার্কে হাত দিন।';
      else if(pct>=60)msg='<b>ভালো ('+right+'/'+qs.length+')।</b> যে প্রশ্নগুলো ভুল হয়েছে, সেই অংশ আরেকবার পড়ে নিন — তারপর হোমওয়ার্ক।';
      else msg='<b>আরেকবার দেখুন ('+right+'/'+qs.length+')।</b> ভুল উত্তরের ব্যাখ্যাগুলো পড়ুন, উপরের অংশ আবার পড়ুন, তারপর "আবার শুরু" চাপুন।';
      d.innerHTML=msg;
    }
  } else q.classList.remove('finished');
}

document.addEventListener('click',function(e){
  /* video */
  var vt=e.target.closest?e.target.closest('.ls-vid .vt'):null;
  if(vt&&vt.dataset.yt){
    var f=document.createElement('iframe');
    f.src='https://www.youtube-nocookie.com/embed/'+vt.dataset.yt+'?autoplay=1&rel=0';
    f.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture');
    f.setAttribute('allowfullscreen',''); f.setAttribute('loading','lazy'); f.setAttribute('title',vt.dataset.t||'video');
    vt.parentNode.replaceChild(f,vt); return;
  }
  /* quiz reset */
  var rs=e.target.closest?e.target.closest('.ls-quiz .rs'):null;
  if(rs){
    var qq=rs.closest('.ls-quiz');
    qq.querySelectorAll('.qz-q').forEach(function(x){x.classList.remove('locked');delete x.dataset.got;});
    qq.querySelectorAll('.qz-o').forEach(function(o){o.classList.remove('ok','no','done');var m=o.querySelector('.mk');if(m)m.remove();});
    qq.classList.remove('finished'); score(qq); return;
  }
  /* quiz answer */
  var op=e.target.closest?e.target.closest('.ls-quiz .qz-o'):null;
  if(op){
    var qz=op.closest('.qz-q'); if(!qz||qz.classList.contains('locked'))return;
    var ans=String(qz.dataset.a),mine=String(op.dataset.i),good=(ans===mine);
    qz.classList.add('locked'); qz.dataset.got=good?'1':'0';
    qz.querySelectorAll('.qz-o').forEach(function(o){
      o.classList.add('done');
      var m=document.createElement('span'); m.className='mk';
      if(String(o.dataset.i)===ans){o.classList.add('ok');m.textContent='✓ সঠিক';o.appendChild(m);}
      else if(o===op){o.classList.add('no');m.textContent='✗';o.appendChild(m);}
    });
    score(op.closest('.ls-quiz')); return;
  }
  /* outcome checkbox */
  var oc=e.target.closest?e.target.closest('.ls-out .oc'):null;
  if(oc&&oc.dataset.oc){
    var db=rd(); if(db[oc.dataset.oc])delete db[oc.dataset.oc]; else db[oc.dataset.oc]=1;
    wr(db); syncOut(document); return;
  }
},true);

var t=null;
new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){
  syncOut(document);
  document.querySelectorAll('.ls-quiz').forEach(function(q){ if(!q.dataset.init){q.dataset.init='1';score(q);} });
},120);}).observe(document.documentElement,{childList:true,subtree:true});

function boot(){syncOut(document);document.querySelectorAll('.ls-quiz').forEach(function(q){q.dataset.init='1';score(q);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* ===== GrowUp Classroom Layer v3 — trainer mode + copy buttons ===== */
(function(){
if(window.__GU_CLASS3__) return; window.__GU_CLASS3__=1;
var TKEY='growup-trainer';
function rd(){try{return localStorage.getItem(TKEY)==='1';}catch(e){return !!window.__guTrainer;}}
function wr(v){window.__guTrainer=v;try{localStorage.setItem(TKEY,v?'1':'0');}catch(e){}}

function label(btn){
  var on=document.body.classList.contains('trainer-on');
  btn.textContent=on?'👩‍🏫 ট্রেইনার মোড চালু':'👩‍🏫 ট্রেইনার মোড';
  btn.setAttribute('aria-pressed',on?'true':'false');
  btn.title=on?'ক্লাস চালানোর অংশগুলো দেখা যাচ্ছে — শিক্ষার্থীদের দেখানোর আগে বন্ধ করুন':'রান-শিট, ডেমো স্ক্রিপ্ট ও ট্রেইনার নোট দেখতে চাপুন';
}
function mountBtn(){
  if(document.querySelector('.gu-tbtn')) return;
  var b=document.createElement('button');
  b.type='button'; b.className='gu-tbtn';
  b.onclick=function(){ var on=!document.body.classList.contains('trainer-on');
    document.body.classList.toggle('trainer-on',on); wr(on); label(b); };
  document.body.appendChild(b);
  document.body.classList.toggle('trainer-on', rd());
  label(b);
}

document.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('.gu-copy .hd button'):null;
  if(!t) return;
  var box=t.closest('.gu-copy'), pre=box&&box.querySelector('pre');
  if(!pre) return;
  var txt=pre.textContent, done=function(){ var o=t.textContent; t.textContent='✓ কপি হয়েছে';
    setTimeout(function(){t.textContent=o;},1600); };
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,fallback); }
  else fallback();
  function fallback(){
    var ta=document.createElement('textarea'); ta.value=txt;
    ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta);
    ta.select(); try{document.execCommand('copy');}catch(err){}
    document.body.removeChild(ta); done();
  }
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountBtn);else mountBtn();
var t=null;
new MutationObserver(function(){clearTimeout(t);t=setTimeout(mountBtn,200);})
  .observe(document.documentElement,{childList:true,subtree:true});
})();
/* ===== GrowUp Instructor Identity v5 — interactive journey ===== */
(function(){
if(window.__GU_CLASS5__) return; window.__GU_CLASS5__=1;
function show(root, idx){
  var nodes=root.querySelectorAll('.jn'), panel=root.querySelector('.jd');
  if(!panel) return;
  nodes.forEach(function(n,i){ n.classList.toggle('on', i===idx); });
  var n=nodes[idx]; if(!n) return;
  var d=n.dataset;
  root.style.setProperty('--jc', d.c||'#4f8cff');
  panel.innerHTML='<div class="k">ধাপ '+d.step+' — '+(d.k||'')+'</div>'
    +'<div class="t">'+(d.t||'')+'</div><div class="b">'+(d.b||'')+'</div>'
    +(d.q?'<div class="q">'+d.q+'</div>':'');
}
document.addEventListener('click',function(e){
  var n=e.target.closest?e.target.closest('.gu-jour .jn'):null;
  if(!n) return;
  var root=n.closest('.gu-jour');
  var nodes=[].slice.call(root.querySelectorAll('.jn'));
  show(root, nodes.indexOf(n));
},true);
function boot(){
  document.querySelectorAll('.gu-jour').forEach(function(r){
    if(r.dataset.init) return; r.dataset.init='1'; show(r,0);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
var t=null;
new MutationObserver(function(){clearTimeout(t);t=setTimeout(boot,200);})
  .observe(document.documentElement,{childList:true,subtree:true});
})();
