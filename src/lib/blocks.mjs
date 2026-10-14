import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { panel, hailBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function summonBand(cfg, place, seedKey) {
  const h = hash(seedKey, 'sb');
  const lines = [
    `${place}이라고만 짚어 주셔도 됩니다. 남은 주소는 저희가 되물으며 맞춥니다.`,
    `${place}까지 지금 닿을 수 있는지 통화 중에 바로 확인해 드립니다.`,
    `${place} 방문에 필요한 것은 코스와 시각, 주소입니다. 그 밖에 여쭐 것이 없습니다.`,
    `${place} 접수는 이 한 줄에서만 받습니다. 다른 통로는 처음부터 열지 않았습니다.`,
  ];
  return `<section class="summon" aria-label="${esc(place)} 예약 문의">
  <p class="summon-p">${esc(at(h, lines))}</p>
  ${hailBtn(cfg, { size: 'l' })}
  <p class="summon-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ───────────────────────────────────────────────────────
   ★★쪽마다 여덟 가지를 통째로 되풀이하면 그 표가 본문에서 가장 큰 덩어리가 되고
     동 쪽끼리 겹침이 20%대로 올라간다. 동·시군구 쪽에서는 **시드로 고른 셋만**
     띠로 보이고 나머지는 코스 쪽으로 보낸다. 허브·시도 쪽에서만 전체를 편다. */
export function courseGrid(courses, seedKey, place, num = '01', { full = true } = {}) {
  const h = hash(seedKey, 'cg');
  const show = full ? courses : shuffle(courses.slice(), h).slice(0, 3);
  const withText = new Set(shuffle(show.map((c) => c.slug), h).slice(0, full ? 2 : 1));
  const list = show.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="b-n">${esc(c.ko)}</span>
      <span class="b-w">${won(c.price)}원</span>
      <span class="b-s">${c.min}분 — 세기 ${esc(c.pressure)}${c.oil ? ' — 기름 바름' : ' — 기름 없음'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="b-t">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  const short = [
    `${esc(place)}에서도 여덟 가지를 다 받습니다. 여기 없는 다섯은 <a href="/course/">코스 쪽</a>에, 숫자는 <a href="/price/">요금</a>에 있습니다.`,
    `${esc(place)} 접수에서 손이 가장 자주 가는 셋입니다. <a href="/course/">여덟 가지를 한 표에</a> 세웠고 <a href="/price/">요금은 따로</a> 모았습니다.`,
    `${esc(place)}이라고 고를 수 있는 폭이 좁아지지 않습니다. <a href="/course/">나머지 다섯</a>과 <a href="/price/">전체 요금</a>을 함께 두었습니다.`,
    `세기나 길이가 맞지 않으면 <a href="/course/">여덟 가지</a>를 펼쳐 보십시오. ${esc(place)} 요금은 <a href="/price/">이 표</a>와 같습니다.`,
  ];
  const tail = full
    ? `${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}`
    : at(h, short, 4);
  return panel('course', 'courses', full ? `${esc(place)}으로 가져가는 여덟 가지` : `${esc(place)}에서 많이 나가는 셋`,
    `<ul class="bill">\n${list}\n</ul>
     <p class="panel-f">${tail}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepSet(seedKey) {
  return at(hash(seedKey, 'st'), STEP_SETS);
}
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return panel('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="steps">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="book"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = panel('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="query">\n${qa.map((x, i) => `<div><span class="qi" aria-hidden="true">${i + 1}번째</span><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return panel('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="keep">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return panel('longtail', label, heading, `<ul class="pills">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 롱테일 주제 묶음 ──────────────────────────────────────────
   ★★'다른 지역' 한 덩어리로만 링크를 걸면 코스 이름·요금 같은 말로 들어오는 길이
     없다. 주제별로 갈라 묶고 묶음마다 앵커 틀을 달리 둔다. */
export function topicLinks(groups, seedKey, num, heading, sub) {
  const h = hash(seedKey, 'tp');
  const body = groups.filter((g) => g.items && g.items.length).map((g, gi) => {
    const picked = (g.pick ? shuffle(g.items, hash(seedKey, 'tp', gi)) : g.items).slice(0, g.pick || g.items.length);
    const li = picked.map((p) => {
      const base = p.labels ? p.labels[parseInt(hash(seedKey, p.href).substr(0, 3), 16) % p.labels.length] : p.label;
      const tpl = g.anchor ? g.anchor[parseInt(hash(seedKey, g.label, base).substr(0, 3), 16) % g.anchor.length] : null;
      return `<li><a href="${p.href}">${esc(tpl ? tpl(base) : base)}</a></li>`;
    }).join('\n');
    return `<div class="topic">
      <p class="topic-h">${esc(g.label)}</p>
      <ul class="pills">\n${li}\n</ul>
    </div>`;
  }).join('\n');
  return panel('topic', 'ways in', heading, `<div class="topics">${body}</div>`,
    sub || esc(at(h, SEC.ltSub, 6)), num);
}

/** 코스 묶음 — 시도별 코스 쪽으로 가는 롱테일. 동 쪽에서 여기로 처음 길이 난다. */
export function courseTopic(sd, courses) {
  return courses.map((c) => ({ label: `${sd.name} ${c.ko}`, href: `/${sd.slug}/course/${c.slug}/` }));
}

/* ── 테두리가 닮은 이웃 칸 ─────────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리순이 아니라
     **곧은 몫이 가까운 칸**과 **가장 반듯하고 가장 굽은 칸**을 건다. */
export function edgeKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const pick = [];
  const seen = new Set();
  const add = (x, why) => { if (x && !seen.has(x.slug)) { seen.add(x.slug); pick.push({ x, why }); } };
  pool.slice().sort((a, b) => Math.abs(a.straightPct - s.straightPct) - Math.abs(b.straightPct - s.straightPct))
    .slice(0, 4).forEach((x) => add(x, `곧은 몫 ${x.straightPct}%`));
  const byFlat = pool.slice().sort((a, b) => b.straightPct - a.straightPct);
  add(byFlat[0], `가장 반듯 ${byFlat[0].straightPct}%`);
  add(byFlat[byFlat.length - 1], `가장 굽음 ${byFlat[byFlat.length - 1].straightPct}%`);
  const byLong = pool.slice().sort((a, b) => b.longest - a.longest);
  add(byLong[0], `직선 ${byLong[0].longest}m`);
  for (const x of pool) add(x, `꺾임 ${x.corners}군데`);
  return panel('kin', 'edges', `${esc(g.name)} 안에서 테두리로 견주기`,
    `<ul class="cells">\n${pick.slice(0, 8).map(({ x, why }) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="e-n">${esc(x.name)}</span><span class="e-s">${esc(why)}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ek'), SEC.edgeKinSub)), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="at"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="e-n">${esc(s.name)}</span><span class="e-s">${s.straightPct}%</span></a></li>`).join('\n');
  return panel('spotidx', 'places', `${esc(g.name)}에서 쪽을 가진 ${g.spotCount}칸`,
    `<ul class="cells">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 쪽을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return panel('rural', 'rural', `${esc(g.name)} 소속 ${esc(label)}칸`,
    `<ul class="bare">\n${g.rural.map((m) => `<li>${esc(m.name)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return panel('dongidx', 'dong', `${esc(g.name)}에 속한 동 ${g.dongNames.length}칸`,
    `<ul class="bare">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="at"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="e-n">${esc(g.name)}</span><span class="e-s">${g.plainCount ? `동 ${g.plainCount}${g.ruralCount ? `+${g.ruralCount}` : ''}` : `읍면 ${g.ruralCount}`}</span></a></li>`).join('\n');
  return panel('guidx', 'districts', `${esc(sd.name)}${josa(sd.name, '을/를')} 이루는 시군구 ${sd.gu.length}곳`,
    `<ul class="cells">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 옆 시군구 (길을 거는 용도) ──────────────────────────────── */
export function nearList(sd, g, seedKey, num) {
  if (!g.nearCount) return '';
  const items = g.near.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="e-n">${esc(t.gu)}</span><span class="e-s">${t.same ? esc(sd.name) : '시도 밖'}</span></a></li>`).join('\n');
  return panel('near', 'next', `${esc(g.name)}${josa(g.name, '과/와')} 경계를 나눈 시군구 ${g.nearCount}곳`,
    `<ul class="cells">\n${items}\n</ul>`,
    '구 경계에 바짝 붙은 주소라면 옆 시군구 쪽에서 들어가는 편이 빠를 때가 있습니다.', num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return panel('also', 'more', '이어서 볼 곳',
    `<ul class="pills">
      <li><a href="/area/">닿는 범위 전부</a></li>
      <li><a href="/guide/">이용 전에</a></li>
      <li><a href="/price/">요금</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">기록</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도에서 시군구로 내려가고 수도권과 부산에서만 동이 한 겹 더 붙습니다. 읍·면과 그 밖 지역의 동은 목록에 이름만 올라 있습니다.');
}

/** 문서·글 쪽에 다는 주제 묶음. 지역 목록 대신 쓰는 말로 갈라 건다. */
export function docTopics(ctx, seedKey, num, heading, sub) {
  const { regions, courses } = ctx;
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  return topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 12, anchor: COURSE_ANCHOR },
    { label: '시군구로', items: guList, pick: 14, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seedKey, num, heading, sub);
}
