
/* GrowUp AI course app — data lives in data/*.json, loaded on demand. */
let NAV = null;
let DAY_KEYS = [];
const DAYS = {};      // day key -> loaded day file
const GROUPS = {};
const ANCHORS = {};
let currentDay = null;
let rendered = {};

const DATA = 'data/';
const _pending = {};

function loadDay(dnum){
  if(DAYS[dnum]) return Promise.resolve(DAYS[dnum]);
  if(_pending[dnum]) return _pending[dnum];
  _pending[dnum] = fetch(DATA+'days/'+dnum+'.json')
    .then(r=>{ if(!r.ok) throw new Error('day '+dnum+' HTTP '+r.status); return r.json(); })
    .then(d=>{
      DAYS[dnum] = d;
      GROUPS[dnum] = d.group || {emoji:'📘', title:''};
      ANCHORS[dnum] = d.anchors || [];
      return fetch(DATA+'ins/'+dnum+'.json')
        .then(r=> r.ok ? r.json() : null)
        .catch(()=>null)
        .then(x=>{ d.ins = (x && x.ins) || {}; return d; });
    });
  return _pending[dnum];
}

function mountPage(dnum, d){
  if(document.getElementById('page-'+dnum)) return;
  const host = document.getElementById('pages');
  const wrap = document.createElement('div');
  wrap.innerHTML = d.shell;
  const node = wrap.firstElementChild;
  host.appendChild(node);
  buildFooter(dnum);
}

function buildFooter(dnum){
  const footer = document.getElementById('footer-'+dnum);
  if(!footer || footer.dataset.built) return;
  const idx = DAY_KEYS.indexOf(dnum);
  const T = NAV.titles;
  let html = '';
  if(idx>0){ const pd = DAY_KEYS[idx-1];
    html += '<a class="fbtn prev" href="#" onclick="showDay(\''+pd+'\');return false;"><div class="lbl">← আগের দিন</div><div class="ttl">Day '+pd+' — '+T[pd]+'</div></a>';
  } else { html += '<a class="fbtn prev" href="#" onclick="showHome();return false;"><div class="lbl">←</div><div class="ttl">সূচিপত্র</div></a>'; }
  if(idx<DAY_KEYS.length-1){ const nd = DAY_KEYS[idx+1];
    html += '<a class="fbtn next" href="#" onclick="showDay(\''+nd+'\');return false;"><div class="lbl">পরের দিন →</div><div class="ttl">Day '+nd+' — '+T[nd]+'</div></a>';
  } else { html += '<a class="fbtn next" href="#" onclick="showHome();return false;"><div class="lbl">🎉 সম্পন্ন</div><div class="ttl">সূচিপত্রে ফিরুন</div></a>'; }
  footer.innerHTML = html;
  footer.dataset.built = '1';
}

if(window.marked){ marked.setOptions({ breaks:false, gfm:true }); }

function pad(n){ return String(n).padStart(2,'0'); }

// ---- Offline fallback markdown renderer (used only if the marked.js CDN can't load) ----
function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function inlineMd(s){
  s = escapeHtml(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}
function simpleMarkdown(md){
  const lines = md.split('\n');
  let html = '';
  let i = 0;
  let para = [];
  let listBuf = null;
  let tableBuf = null;

  function flushPara(){
    if(para.length){ html += '<p>'+inlineMd(para.join(' '))+'</p>'; para = []; }
  }
  function flushList(){
    if(listBuf){
      const tag = listBuf.type;
      html += '<'+tag+'>' + listBuf.items.map(it=>'<li>'+inlineMd(it)+'</li>').join('') + '</'+tag+'>';
      listBuf = null;
    }
  }
  function flushTable(){
    if(tableBuf){
      html += '<table><thead><tr>' + tableBuf.header.map(h=>'<th>'+inlineMd(h.trim())+'</th>').join('') + '</tr></thead><tbody>';
      tableBuf.rows.forEach(r=>{
        html += '<tr>' + r.map(c=>'<td>'+inlineMd(c.trim())+'</td>').join('') + '</tr>';
      });
      html += '</tbody></table>';
      tableBuf = null;
    }
  }
  function flushAll(){ flushPara(); flushList(); flushTable(); }

  while(i < lines.length){
    const line = lines[i];
    if(/^```/.test(line.trim())){
      flushAll();
      const codeLines = [];
      i++;
      while(i < lines.length && !/^```/.test(lines[i].trim())){ codeLines.push(lines[i]); i++; }
      html += '<pre><code>'+escapeHtml(codeLines.join('\n'))+'</code></pre>';
      i++; continue;
    }
    if(/^---+\s*$/.test(line.trim()) && line.trim().length>=3){
      flushAll(); html += '<hr>'; i++; continue;
    }
    let m;
    if((m = line.match(/^####\s+(.*)$/))){ flushAll(); html += '<h4>'+inlineMd(m[1])+'</h4>'; i++; continue; }
    if((m = line.match(/^###\s+(.*)$/))){ flushAll(); html += '<h3>'+inlineMd(m[1])+'</h3>'; i++; continue; }
    if((m = line.match(/^##\s+(.*)$/))){ flushAll(); html += '<h2>'+inlineMd(m[1])+'</h2>'; i++; continue; }
    if((m = line.match(/^#\s+(.*)$/))){ flushAll(); html += '<h1>'+inlineMd(m[1])+'</h1>'; i++; continue; }
    if((m = line.match(/^>\s?(.*)$/))){
      flushPara(); flushList(); flushTable();
      html += '<blockquote>'+inlineMd(m[1])+'</blockquote>'; i++; continue;
    }
    if(/^\|.*\|\s*$/.test(line.trim())){
      const cells = line.trim().replace(/^\||\|$/g,'').split('|');
      if(/^[\s:|-]+$/.test(line.trim()) && line.includes('-')){ i++; continue; }
      if(!tableBuf){ flushPara(); flushList(); tableBuf = {header:cells, rows:[]}; }
      else { tableBuf.rows.push(cells); }
      i++; continue;
    } else if(tableBuf){ flushTable(); }
    if((m = line.match(/^\s*[০-৯0-9]+[\.\)]\s+(.*)$/))){
      flushPara();
      if(!listBuf || listBuf.type!=='ol'){ flushList(); listBuf = {type:'ol', items:[]}; }
      listBuf.items.push(m[1]); i++; continue;
    }
    if((m = line.match(/^\s*[-*]\s+(.*)$/))){
      flushPara();
      if(!listBuf || listBuf.type!=='ul'){ flushList(); listBuf = {type:'ul', items:[]}; }
      listBuf.items.push(m[1]); i++; continue;
    }
    if(line.trim()===''){ flushAll(); i++; continue; }
    if(listBuf){ flushList(); }
    if(tableBuf){ flushTable(); }
    para.push(line.trim());
    i++;
  }
  flushAll();
  return html;
}

function renderDay(dnum){
  if(rendered[dnum]) return rendered[dnum];
  const raw = DAYS[dnum].content;
  const html = window.marked ? marked.parse(raw) : simpleMarkdown(raw);
  rendered[dnum] = html;
  return html;
}

function assignAnchors(dnum, body){
  const ids = ANCHORS[dnum] || [];
  const heads = body.querySelectorAll('h2, h3');
  heads.forEach((el, idx)=>{ if(ids[idx]) el.id = ids[idx]; });
}

function jumpTo(id){
  const el = document.getElementById(id);
  if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
}

function showDay(dnum){
  return loadDay(dnum).then(function(d){
    mountPage(dnum, d);
    currentDay = dnum;
    document.getElementById('home-page').classList.remove('active');
    document.querySelectorAll('.day-page').forEach(el=>el.classList.remove('active'));
    const page = document.getElementById('page-'+dnum);
    page.classList.add('active');
    const body = page.querySelector('.md-body');
    if(!body.dataset.loaded){
      body.innerHTML = renderDay(dnum);
      assignAnchors(dnum, body);
      body.dataset.loaded = "1";
    }
    if(window.__CMS_PAGE__) window.__CMS_PAGE__(dnum, d.ins || {});
    document.querySelectorAll('.day-link').forEach(a=>a.classList.remove('active'));
    const link = document.querySelector('.day-link[data-day="'+dnum+'"]');
    if(link){ link.classList.add('active'); link.scrollIntoView({block:'nearest'}); }
    const g = GROUPS[dnum] || {emoji:'📘', title:''};
    document.getElementById('crumb').innerHTML = '📚 <b>Day '+dnum+'</b> · '+g.emoji+' '+g.title;
    updateNavButtons();
    window.scrollTo(0,0);
    closeSidebarMobile();
    if(location.hash !== '#day-'+dnum) history.replaceState(null,'','#day-'+dnum);
    window.dispatchEvent(new CustomEvent('day-ready',{detail:dnum}));
    return dnum;
  }).catch(function(e){
    console.error(e);
    const c = document.getElementById('crumb');
    if(c) c.innerHTML = '⚠️ Day '+dnum+' লোড হয়নি — পাতাটি রিফ্রেশ করুন';
  });
}

function showHome(){
  currentDay = null;
  document.querySelectorAll('.day-page').forEach(el=>el.classList.remove('active'));
  document.getElementById('home-page').classList.add('active');
  document.querySelectorAll('.day-link').forEach(a=>a.classList.remove('active'));
  document.getElementById('crumb').innerHTML = '📚 <b>সূচিপত্র</b>';
  updateNavButtons();
  window.scrollTo(0,0);
  closeSidebarMobile();
  history.replaceState(null,'','#');
}

function updateNavButtons(){
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if(currentDay===null){ prevBtn.disabled=true; nextBtn.disabled=false; nextBtn.textContent='Day 01 শুরু করুন →'; return; }
  const idx = DAY_KEYS.indexOf(currentDay);
  prevBtn.disabled = false;
  nextBtn.disabled = (idx===DAY_KEYS.length-1);
  nextBtn.textContent = 'পরের দিন →';
}

function gotoPrev(){
  if(currentDay===null) return;
  const idx = DAY_KEYS.indexOf(currentDay);
  if(idx>0) showDay(DAY_KEYS[idx-1]); else showHome();
}
function gotoNext(){
  if(currentDay===null){ showDay(DAY_KEYS[0]); return; }
  const idx = DAY_KEYS.indexOf(currentDay);
  if(idx<DAY_KEYS.length-1) showDay(DAY_KEYS[idx+1]);
}

function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); }
function closeSidebarMobile(){ if(window.innerWidth<=820) document.getElementById('sidebar').classList.remove('open'); }

function boot(){
  return fetch(DATA+'nav.json').then(r=>r.json()).then(function(nav){
    NAV = nav;
    DAY_KEYS = nav.order.slice().sort();
    document.getElementById('app-root').innerHTML = nav.shell + '<div id="pages"></div>' + nav.shellBottom;
    updateNavButtons();
    window.dispatchEvent(new CustomEvent('nav-ready'));
    const m = /^#day-(\d\d)$/.exec(location.hash||'');
    if(m && DAY_KEYS.indexOf(m[1])>-1) return showDay(m[1]);
    showHome();
  }).catch(function(e){
    console.error(e);
    document.getElementById('app-root').innerHTML =
      '<div style="padding:40px;font-family:system-ui">অ্যাপের ডেটা লোড হয়নি।<br>' +
      'ফাইলগুলো একটি ওয়েব সার্ভার থেকে খুলতে হবে (সরাসরি file:// থেকে নয়)।</div>';
  });
}

window.addEventListener('hashchange', function(){
  const m = /^#day-(\d\d)$/.exec(location.hash||'');
  if(m && m[1]!==currentDay) showDay(m[1]);
  else if(!m && currentDay!==null) showHome();
});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
