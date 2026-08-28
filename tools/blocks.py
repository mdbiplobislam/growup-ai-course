# -*- coding: utf-8 -*-
"""Block helpers for Md Biplob's training lessons.

Every function returns an HTML string. The class names are what the course app's CSS and JS hook
into, so use these rather than hand-writing markup — valid markup with different class names renders
unstyled and the interactive blocks (quiz, outcome, video) stop working.

    import sys; sys.path.insert(0, '<skill>/scripts')
    from blocks import *

    blk = {}
    blk['s0'] = [goal('আজ শেষে আপনি যা পারবেন', [...]), lanes(lead, [...])]
"""

# Accent palette. Index by position so sibling cards get distinct colours.
C = ['#4f8cff', '#a06cf0', '#3ec6a8', '#f0a13d', '#e35d8a']

# Lane colours are fixed by role, not by position — learners navigate by them.
LANE_COLORS = {
    'চাকরি': '#4f8cff',
    'ফ্রিল্যান্সিং': '#14a800',
    'ব্যবসা': '#f0a13d',
    'গবেষণা ও পড়াশোনা': '#a06cf0',
}

# Verified byline. Do not edit without checking references/trainer-identity.md.
BYLINE = ('NSDA CBT&amp;A সার্টিফায়েড ট্রেইনার ও অ্যাসেসর · SEO Specialist, Local Scaler · '
          'Digital Marketing for Freelancing (BNQF Level-04) — PencilBox Training Institute, ঢাকা · '
          'সরকারি ও বেসরকারি প্রতিষ্ঠান এবং প্রকল্পে ~১০ বছরের অভিজ্ঞতা')

# The money rule (references/quality-rules.md #2). Reuse verbatim in earn() blocks.
RATE_FORMULA = (
    '<p><b>রেট ঠিক করার সূত্র:</b> মাসিক আয়ের লক্ষ্য ÷ মাসে বাস্তবে কাজ করতে পারা ঘণ্টা = ঘণ্টা-রেট। '
    'দাম = ঘণ্টা-রেট × আনুমানিক ঘণ্টা × <b>১.৩</b>।</p>')

RATE_CAVEAT = (
    'এখানে কোনো নির্দিষ্ট দাম বসানো হয়নি — বাজারদর দেশ, ক্লায়েন্টের আকার ও আপনার প্রমাণ অনুযায়ী বদলায়। '
    '<b>ক্লাসে প্রশিক্ষক বাস্তব রেঞ্জ বলে দেবেন।</b>')

# The legal boundary (references/quality-rules.md #3). Include in every law-adjacent block.
LEGAL_DISCLAIMER = (
    '<b>একটি জরুরি কথা:</b> এটি <b>পেশাদার অনুশীলনের নির্দেশিকা, আইনি পরামর্শ নয়</b>। '
    'আইন দেশভেদে আলাদা এবং দ্রুত বদলায়। চুক্তি, দায়বদ্ধতা বা কোনো নির্দিষ্ট বিরোধের প্রশ্নে '
    '<b>আইনজীবীর মত নিন</b>।')


def esc(s):
    """Escape text destined for SVG <text> or any raw context."""
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


# ---------------------------------------------------------------- orientation

def goal(title, items):
    """items: list of HTML strings. Each should start with a verb the learner performs."""
    li = ''.join(f'<li>{i}</li>' for i in items)
    return (f'<div class="ls ls-goal"><div class="ls-h"><span class="ic">🎯</span>{title}</div>'
            f'<div class="ls-b"><ul>{li}</ul></div></div>')


def lanes(lead, items):
    """items: [(emoji, name, colour, [(label, text), ...]), ...] — four lanes, four different answers."""
    cs = ''
    for ic, nm, col, rows in items:
        rr = ''.join(f'<div class="row"><span class="lbl">{l}</span>{t}</div>' for l, t in rows)
        cs += f'<div class="ln" style="--c:{col}"><div class="hd"><span class="ic">{ic}</span>{nm}</div>{rr}</div>'
    return (f'<div class="ls ls-lane"><div class="ls-h"><span class="ic">🧭</span>এটা দিয়ে আপনি বাস্তবে কী করবেন</div>'
            f'<div class="ls-b"><div class="lane-lead">{lead}</div><div class="lanes">{cs}</div></div></div>')


def runsheet(meta, rows, note=''):
    """meta: [(label, value)]. rows: 4-tuples (time, section, trainer does, learner does);
    a 2-tuple renders as a break row. note: say what to cut and what never to cut."""
    ms = ''.join(f'<div class="m"><div class="l">{l}</div><div class="v">{v}</div></div>' for l, v in meta)
    rs = ''
    for r in rows:
        if len(r) == 2:
            rs += f'<tr class="brk"><td class="tm">{r[0]}</td><td colspan="3">{r[1]}</td></tr>'
        else:
            rs += f'<tr><td class="tm">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>'
    n = f'<div class="rnote">{note}</div>' if note else ''
    return (f'<div class="ls ls-run ls-teach"><div class="ls-h"><span class="ic">🕒</span>ক্লাস রান-শিট</div><div class="ls-b">'
            f'<div class="rmeta">{ms}</div>'
            f'<table><thead><tr><th>সময়</th><th>অংশ</th><th>ট্রেইনার যা করবেন</th><th>শিক্ষার্থী যা করবে</th></tr></thead>'
            f'<tbody>{rs}</tbody></table>{n}</div></div>')


# ------------------------------------------------------------------ grounding

def analogy(title, lead, pairs):
    """pairs: [(term, meaning)] mapping the analogy onto the real concept."""
    cs = ''.join(f'<div class="c"><div class="t">{t}</div><div class="d">{d}</div></div>' for t, d in pairs)
    return (f'<div class="ls ls-ana"><div class="ls-h"><span class="ic">💡</span>উপমা — {title}</div>'
            f'<div class="ls-b"><p>{lead}</p><div class="pair">{cs}</div></div></div>')


def mentor(body, take):
    """body: HTML paragraphs of a VERIFIED story (references/trainer-identity.md).
    take: one sentence the learner can act on today."""
    return (f'<div class="ls ls-mentor"><div class="mn-top">'
            f'<div class="mn-av">বি</div>'
            f'<div class="mn-id"><div class="mn-name">মো. বিপ্লব</div><div class="mn-cred">{BYLINE}</div></div>'
            f'<div class="mn-tag">👨‍🏫 প্রশিক্ষকের ফিল্ড নোট</div></div>'
            f'<div class="ls-b">{body}</div>'
            f'<div class="mn-take"><b>আপনার জন্য শিক্ষা —</b> {take}</div>'
            f'<div class="mn-edit">এই নোটটি ট্রেইনারের নিজস্ব অভিজ্ঞতা থেকে লেখা। '
            f'এডিট মোড চালু করে নিজের ভাষায় বা নতুন ঘটনায় বদলে নিতে পারেন।</div>'
            f'</div>')


def say(t):
    """One spoken line that sets the frame. Use once or twice a day — rarity is the point."""
    return f'<div class="say">“{t}”</div>'


# ------------------------------------------------------------------- teaching

def fig(svg, cap):
    """Caption should be a claim about what to notice, not a label. Number them চিত্র ১, চিত্র ২ …"""
    return f'<figure class="lsfig"><div class="box">{svg}</div><figcaption>{cap}</figcaption></figure>'


def steps(title, items):
    """items: [(bold heading, detail)]. The detail explains WHY the step exists."""
    li = ''.join(f'<li><b>{h}</b>{d}</li>' for h, d in items)
    return (f'<div class="ls ls-step"><div class="ls-h"><span class="ic">📋</span>ধাপে ধাপে — {title}</div>'
            f'<div class="ls-b"><ol>{li}</ol></div></div>')


def example(title, bad, good, note=''):
    """Both versions must be about the same task; note explains what changed and why."""
    n = f'<div class="ls-note">{note}</div>' if note else ''
    return (f'<div class="ls ls-ex"><div class="ls-h"><span class="ic">✍️</span>উদাহরণ — {title}</div><div class="ls-b">'
            f'<div class="ls-ba"><div class="bad"><div class="lbl">✖ দুর্বল</div>{bad}</div>'
            f'<div class="good"><div class="lbl">✔ শক্তিশালী</div>{good}</div></div>{n}</div></div>')


def warn(title, body):
    """The misconception that actually appears in the room. Structure: believed → wrong → do instead."""
    return (f'<div class="ls ls-warn"><div class="ls-h"><span class="ic">⚠️</span>সাধারণ ভুল — {title}</div>'
            f'<div class="ls-b">{body}</div></div>')


def oops(t):
    """One-line 'what usually goes wrong'."""
    return f'<div class="oops"><b>যা প্রায়ই ভুল হয়:</b> {t}</div>'


# ---------------------------------------------------------------------- doing

def try_it(title, task, sol):
    """sol is read alone at night — be generous. Where the answer is 'no', model how to say no well."""
    return (f'<div class="ls ls-try"><div class="ls-h"><span class="ic">✅</span>নিজে করুন — {title}</div>'
            f'<div class="ls-b"><div class="task">{task}</div><div class="ans"><details>'
            f'<summary>উত্তর দেখুন</summary><div class="sol">{sol}</div></details></div></div></div>')


def copy_box(label, text):
    """A copy-paste prompt. See references/prompt-design.md for the house structure."""
    t = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return (f'<div class="gu-copy"><div class="hd"><span>⌨️ {label}</span>'
            f'<button type="button">কপি</button></div><pre>{t}</pre></div>')


def demoblk(title, setup, steps):
    """setup: what to have open before starting. steps: [(heading, body)] — followable cold."""
    li = ''.join(f'<li><b>{h}</b>{b}</li>' for h, b in steps)
    return (f'<div class="ls ls-demo ls-teach"><div class="ls-h"><span class="ic">🖥️</span>লাইভ ডেমো — {title}</div>'
            f'<div class="ls-b"><div class="setup">{setup}</div><ol>{li}</ol></div></div>')


def lab(title, meta, steps, stuck, check):
    """All four collection args are lists of STRINGS (meta is not tuples).
    meta e.g. ['⏱ ২৫ মিনিট', '👤 একা', '💻 Docs', '📤 জমা: PDF'].
    check must be observable — what the trainer looks at to know it worked."""
    ms = ''.join(f'<span>{m}</span>' for m in meta)
    st = ''.join(f'<li>{s}</li>' for s in steps)
    sk = ''.join(f'<li>{s}</li>' for s in stuck)
    return (f'<div class="ls ls-lab"><div class="ls-h"><span class="ic">🧪</span>হাতে-কলমে ল্যাব — {title}</div><div class="ls-b">'
            f'<div class="lmeta">{ms}</div><ol>{st}</ol>'
            f'<div class="stuck"><div class="t">🚧 আটকে গেলে</div><ul>{sk}</ul></div>'
            f'<div class="check"><b>ট্রেইনার যা দেখে বুঝবেন কাজ হয়েছে:</b> {check}</div></div></div>')


# -------------------------------------------------------------------- closing

def tnote(qas, miss):
    """qas: [(question asked every batch, answer that takes it seriously)]. miss: list of strings."""
    q = ''.join(f'<div class="qa"><div class="q">{a}</div><div class="a">{b}</div></div>' for a, b in qas)
    m = ''.join(f'<li>{x}</li>' for x in miss)
    return (f'<div class="ls ls-tnote ls-teach"><div class="ls-h"><span class="ic">📌</span>ট্রেইনার নোট</div><div class="ls-b">'
            f'{q}<div class="miss"><div class="t">যে ভুল ধারণাগুলো ক্লাসে ঠিক করে দিতে হবে</div><ul>{m}</ul></div></div></div>')


def video(vids, slot=None, note=''):
    """vids: [(youtube_id, real title, real channel, what to watch for)] — oEmbed-verified only.
    slot: (title, description) marking a place for the trainer's own recording.
    Passing vids=[] with a slot is a legitimate outcome when no good video exists."""
    sl = ''
    if slot:
        sl = f'<div class="slot"><div class="st">🎥 {slot[0]}</div><div class="sd">{slot[1]}</div></div>'
    cards = ''
    for vid, title, chan, why in vids:
        cards += (f'<div class="vc"><button type="button" class="vt" data-yt="{vid}" data-t="{title}">'
                  f'<img loading="lazy" src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="">'
                  f'<span class="pl"><span>▶</span></span></button>'
                  f'<div class="vm"><div class="vn">{title}</div>'
                  f'<div class="vs">চ্যানেল: {chan} · ভাষা: ইংরেজি (সাবটাইটেল চালু করে নিন)</div>'
                  f'<div class="vw"><b>কী দেখবেন:</b> {why}</div></div></div>')
    nt = f'<div class="vnote">{note}</div>' if note else ''
    return (f'<div class="ls ls-vid"><div class="ls-h"><span class="ic">▶️</span>ভিডিও লার্নিং</div>'
            f'<div class="ls-b">{sl}<div class="vgrid">{cards}</div>{nt}</div></div>')


def quiz(title, qs):
    """qs: [(question, [options], answer_index, why)]. The 'why' must teach, not restate."""
    body = ('<div class="qz-bar"><span class="sc">স্কোর: 0 / %d</span><span class="track"><span class="fill"></span></span>'
            '<button type="button" class="rs">↺ আবার শুরু</button></div>') % len(qs)
    for i, (q, opts, ans, why) in enumerate(qs):
        os_ = ''.join(f'<button type="button" class="qz-o" data-i="{j}">{o}</button>' for j, o in enumerate(opts))
        body += (f'<div class="qz-q" data-a="{ans}"><div class="qz-t"><span class="n">{i+1}</span>{q}</div>{os_}'
                 f'<div class="qz-why"><b>কেন:</b> {why}</div></div>')
    body += '<div class="qz-done"></div>'
    return (f'<div class="ls ls-quiz"><div class="ls-h"><span class="ic">❓</span>ক্লাস কুইজ — {title}</div>'
            f'<div class="ls-b">{body}</div></div>')


def homework(task, meta, rubric, total):
    """rubric: [(criterion, what earns full marks, marks)]. Marks MUST sum to total, and every
    'what earns full marks' cell must be checkable by looking at the submission."""
    ms = ''.join(f'<div class="m"><div class="l">{l}</div><div class="v">{v}</div></div>' for l, v in meta)
    rs = ''.join(f'<tr><td>{c}</td><td>{g}</td><td class="mk">{m}</td></tr>' for c, g, m in rubric)
    return (f'<div class="ls ls-hw"><div class="ls-h"><span class="ic">📝</span>হোমওয়ার্ক ও মূল্যায়ন</div><div class="ls-b">'
            f'<div class="hw-task">{task}</div><div class="hw-meta">{ms}</div>'
            f'<table><thead><tr><th>মানদণ্ড</th><th>পূর্ণ নম্বর পাবেন যখন</th><th class="mk">নম্বর</th></tr></thead>'
            f'<tbody>{rs}<tr class="tot"><td colspan="2">মোট</td><td class="mk">{total}</td></tr></tbody></table></div></div>')


def earn(lead, packs, rate, first, caveat):
    """packs: [(name, who it is for, [deliverables], time)] — starter / core / retainer.
    rate: use RATE_FORMULA. caveat: use RATE_CAVEAT. Never put a currency figure anywhere."""
    ps = ''
    for i, (name, who, items, time) in enumerate(packs):
        li = ''.join(f'<li>{x}</li>' for x in items)
        mid = ' mid' if i == 1 else ''
        ps += f'<div class="p{mid}"><div class="n">{name}</div><div class="w">{who}</div><ul>{li}</ul><div class="t">⏱ {time}</div></div>'
    fs = ''.join(f'<li>{x}</li>' for x in first)
    return (f'<div class="ls ls-earn"><div class="ls-h"><span class="ic">💰</span>আজকের দক্ষতা → আয়</div><div class="ls-b">'
            f'<p>{lead}</p><div class="pk">{ps}</div>'
            f'<div class="rate"><div class="t">রেট ঠিক করার সূত্র</div>{rate}</div>'
            f'<p style="font-weight:700;margin-bottom:6px">প্রথম তিনটা অর্ডার কীভাবে আসবে</p><ol class="first">{fs}</ol>'
            f'<div class="cav">{caveat}</div></div></div>')


def comp(meta, rows, evidence):
    """rows: [(Learning Outcome, Performance Criteria, 'D · P')]. Pair a doing method with an
    explaining method. Keep the unit code as an institution placeholder."""
    ms = ''.join(f'<span>{m}</span>' for m in meta)
    rs = ''.join(f'<tr><td>{lo}</td><td>{pc}</td><td class="m">{me}</td></tr>' for lo, pc, me in rows)
    ev = ''.join(f'<li>{e}</li>' for e in evidence)
    return (f'<div class="ls ls-comp ls-teach"><div class="ls-h"><span class="ic">🎓</span>CBT&amp;A কম্পিটেন্সি ম্যাপিং</div><div class="ls-b">'
            f'<div class="cmeta">{ms}</div>'
            f'<table><thead><tr><th>Learning Outcome</th><th>Performance Criteria</th><th class="m">Assessment</th></tr></thead>'
            f'<tbody>{rs}</tbody></table>'
            f'<div class="ev"><div class="t">📁 পোর্টফোলিও এভিডেন্স যা এই দিনে তৈরি হবে</div><ul>{ev}</ul></div>'
            f'<div class="mn-edit" style="margin-top:10px;font-size:11.6px;color:var(--text-light);font-style:italic">'
            f'D = Demonstration · O = Oral Questioning · W = Written Test · P = Portfolio। '
            f'ইউনিট কোড ও PC নম্বর আপনার প্রতিষ্ঠানের অনুমোদিত Competency Standard অনুযায়ী বসিয়ে নিন।</div>'
            f'</div></div>')


def outcome(items, portfolio):
    """items: [(n, 'আমি ___ পারি')] in the learner's voice. portfolio: what was produced, what
    tomorrow covers, and where this returns later in the course."""
    cs = ''.join(f'<button type="button" class="oc" data-oc="{i}"><span class="bx"></span><span class="tx">{t}</span></button>'
                 for i, t in items)
    return (f'<div class="ls ls-out"><div class="ls-h"><span class="ic">🏁</span>আজকের আউটকাম — নিজে টিক দিন</div><div class="ls-b">'
            f'{cs}<div class="oprog"></div>'
            f'<div class="port"><div class="pt">🗂️ পোর্টফোলিও আর্টিফ্যাক্ট</div>{portfolio}</div></div></div>')


# --------------------------------------------------------------- SVG helpers

def wrap_words(text, max_chars):
    """Wrap Bengali text on WORD boundaries.

    Never slice a Bengali string by character index — conjuncts are multi-codepoint clusters and
    text[:44] will cut one in half, producing a broken glyph that is invisible in the source.
    """
    lines, cur = [], ''
    for w in str(text).split(' '):
        if len(cur) + len(w) > max_chars:
            if cur:
                lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    if cur:
        lines.append(cur)
    return lines


def roadmap(title, items):
    """items: [(emoji, label)] — five stages. The map the trainer draws on the board."""
    n = len(items); W = 960; cw = (W - 40 - (n - 1) * 12) / n; H = 170
    p = [f'<svg viewBox="0 0 {W} {H}" width="100%" style="font-family:inherit;display:block">']
    p.append(f'<text x="20" y="24" font-size="14.5" font-weight="700" fill="currentColor">{esc(title)}</text>')
    for i, (ic, lab_) in enumerate(items):
        x = 20 + i * (cw + 12); c = C[i % len(C)]
        p.append(f'<rect x="{x:.0f}" y="46" width="{cw:.0f}" height="104" rx="12" fill="{c}" fill-opacity="0.10" stroke="{c}" stroke-width="1.4"/>')
        p.append(f'<circle cx="{x+cw/2:.0f}" cy="76" r="15" fill="{c}"/>')
        p.append(f'<text x="{x+cw/2:.0f}" y="81" font-size="12.5" font-weight="800" text-anchor="middle" fill="#fff">{i+1}</text>')
        p.append(f'<text x="{x+cw/2:.0f}" y="110" font-size="19" text-anchor="middle">{ic}</text>')
        p.append(f'<text x="{x+cw/2:.0f}" y="134" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor">{esc(lab_)}</text>')
    p.append('</svg>')
    return ''.join(p)


def trustmeter(title, rows):
    """rows: [(colour, name, description, percent, verdict)]."""
    W = 960; rh = 64; H = 54 + len(rows) * rh
    p = [f'<svg viewBox="0 0 {W} {H}" width="100%" style="font-family:inherit;display:block">']
    p.append(f'<text x="20" y="24" font-size="14.5" font-weight="700" fill="currentColor">{esc(title)}</text>')
    for i, (col, name, desc, pct, verdict) in enumerate(rows):
        y = 48 + i * rh
        p.append(f'<rect x="20" y="{y}" width="{W-40}" height="{rh-10}" rx="10" fill="{col}" fill-opacity="0.08" stroke="{col}" stroke-width="1.2"/>')
        p.append(f'<circle cx="42" cy="{y+27}" r="9" fill="{col}"/>')
        p.append(f'<text x="60" y="{y+22}" font-size="13.5" font-weight="700" fill="currentColor">{esc(name)}</text>')
        p.append(f'<text x="60" y="{y+40}" font-size="11.5" fill="currentColor" opacity="0.68">{esc(desc)}</text>')
        bx = 520; bw = 250
        p.append(f'<rect x="{bx}" y="{y+20}" width="{bw}" height="9" rx="4.5" fill="currentColor" fill-opacity="0.12"/>')
        p.append(f'<rect x="{bx}" y="{y+20}" width="{bw*pct/100:.0f}" height="9" rx="4.5" fill="{col}"/>')
        p.append(f'<text x="{bx+bw+12}" y="{y+29}" font-size="12" font-weight="700" fill="{col}">{esc(verdict)}</text>')
    p.append('</svg>')
    return ''.join(p)


def tonescale(title, items):
    """items: [(emoji, name, dress, when, is_default)] — three options along an axis."""
    W = 960; H = 210; cw = (W - 40 - 2 * 16) / 3
    p = [f'<svg viewBox="0 0 {W} {H}" width="100%" style="font-family:inherit;display:block">']
    p.append(f'<text x="20" y="24" font-size="14.5" font-weight="700" fill="currentColor">{esc(title)}</text>')
    p.append(f'<line x1="20" y1="176" x2="{W-20}" y2="176" stroke="currentColor" stroke-opacity="0.18" stroke-width="2"/>')
    p.append('<text x="24" y="196" font-size="11" fill="currentColor" opacity="0.6">বেশি আনুষ্ঠানিক</text>')
    p.append(f'<text x="{W-24}" y="196" font-size="11" text-anchor="end" fill="currentColor" opacity="0.6">বেশি ঘনিষ্ঠ</text>')
    for i, (ic, name, dress, when, star) in enumerate(items):
        x = 20 + i * (cw + 16); c = C[i % len(C)]; h = 118
        p.append(f'<rect x="{x:.0f}" y="44" width="{cw:.0f}" height="{h}" rx="12" fill="{c}" fill-opacity="0.10" stroke="{c}" stroke-width="{2.2 if star else 1.4}"/>')
        p.append(f'<text x="{x+16:.0f}" y="72" font-size="19">{ic}</text>')
        p.append(f'<text x="{x+46:.0f}" y="72" font-size="13.5" font-weight="700" fill="currentColor">{esc(name)}</text>')
        if star:
            p.append(f'<rect x="{x+cw-78:.0f}" y="55" width="66" height="20" rx="10" fill="{c}"/>')
            p.append(f'<text x="{x+cw-45:.0f}" y="69" font-size="10.5" font-weight="800" text-anchor="middle" fill="#fff">ডিফল্ট</text>')
        p.append(f'<text x="{x+16:.0f}" y="98" font-size="12" fill="currentColor" opacity="0.85">👔 {esc(dress)}</text>')
        p.append(f'<text x="{x+16:.0f}" y="122" font-size="11.5" fill="currentColor" opacity="0.68">{esc(when)}</text>')
        p.append(f'<circle cx="{x+cw/2:.0f}" cy="176" r="7" fill="{c}"/>')
        p.append(f'<line x1="{x+cw/2:.0f}" y1="162" x2="{x+cw/2:.0f}" y2="169" stroke="{c}" stroke-width="2"/>')
    p.append('</svg>')
    return ''.join(p)
