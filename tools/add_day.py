#!/usr/bin/env python3
"""একটা দিনের মাস্টারক্লাস ব্লক অ্যাপে বসায়।

    python tools/add_day.py --day 24 --blocks blocks24r.json

blocks JSON-এর আকার: {'s0': [html, ...], 's1': [...], ...}
আগের পদ্ধতিতে এই কাজটায় ব্রাউজার, Monaco এডিটর আর ৪০০-অক্ষরের সেগমেন্ট লাগত।
এখন একটা কমান্ড — আর git-এ প্রতিটা পরিবর্তন আলাদা করে দেখা যায়।
"""
import argparse, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--day', required=True, help='দিনের নম্বর, যেমন 24')
    ap.add_argument('--blocks', required=True, help='blocksNN.json ফাইলের পথ')
    ap.add_argument('--slots', type=int, help='স্লট সংখ্যা = H2 সংখ্যা + 1 (দিলে যাচাই করা হবে)')
    a = ap.parse_args()

    day = str(int(a.day))
    pad = day.zfill(2)
    blk = json.load(open(a.blocks, encoding='utf-8'))

    day_file = os.path.join(ROOT, 'data', 'days', pad + '.json')
    if not os.path.exists(day_file):
        sys.exit('Day %s নেই: %s' % (pad, day_file))

    # H2 গুনে স্লট সংখ্যা যাচাই — ভুল স্লট সংখ্যা সবচেয়ে সাধারণ ভুল
    content = json.load(open(day_file, encoding='utf-8'))['content']
    h2 = sum(1 for ln in content.split('\n') if ln.startswith('## '))
    need = h2 + 1
    got = len(blk)
    if a.slots and a.slots != need:
        print('⚠️  --slots %d দিয়েছেন, কিন্তু H2 গুনে দরকার %d' % (a.slots, need))
    if got != need:
        print('⚠️  blocks-এ %d স্লট, দিনের গঠন অনুযায়ী দরকার %d (H2 = %d)' % (got, need, h2))
    empty = [k for k, v in blk.items() if not v]
    if empty:
        print('⚠️  খালি স্লট:', ', '.join(sorted(empty)))

    ins = {}
    for k in sorted(blk, key=lambda x: int(x[1:])):
        si = int(k[1:])
        ins['%s-%s' % (day, k)] = [
            {'id': 'd%ss%d%d' % (day, si, i), 'type': 'html', 'data': {'html': h}}
            for i, h in enumerate(blk[k])
        ]

    out = os.path.join(ROOT, 'data', 'ins', pad + '.json')
    json.dump({'ins': ins}, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print('✅ Day %s — %d স্লট, %d ব্লক → %s (%.0f KB)'
          % (pad, len(ins), sum(len(v) for v in ins.values()), out, os.path.getsize(out) / 1024))
    print('   এরপর:  git add -A && git commit -m "Day %s" && git push' % pad)

if __name__ == '__main__':
    main()
