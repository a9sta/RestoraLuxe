import { layout, panel } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  edgeKin, spotIndex, ruralList, dongNameList, guIndex, nearList, summonBand,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  straightWord, longWord, cornerWord, denseWord, reachWord,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 경계선을 훑어 나온 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  const diff = s.straightPct - g.straightPct;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    straightPct: s.straightPct, longest: s.longest, verts: s.verts,
    corners: s.corners, density: s.density,
    straightRank: s.straightRank, longRank: s.longRank, denseRank: s.denseRank,
    guStraightRank: s.guStraightRank,
    guPct: g.straightPct, cornerTop: g.cornerTop,
    flatSpot: g.flatSpot, flatPct: g.flatPct, bentSpot: g.bentSpot, bentPct: g.bentPct,
    vsGu: Math.abs(diff) < 3 ? '그 한가운데쯤입니다'
      : diff > 0 ? `그보다 ${Math.round(Math.abs(diff) * 10) / 10}포인트 반듯한 쪽입니다`
        : `그보다 ${Math.round(Math.abs(diff) * 10) / 10}포인트 굽은 쪽입니다`,
    allSpots: counts.spot, guSpotCount: g.spotCount,
    straightNote: straightWord(s.straightPct), longNote: longWord(s.longest),
    cornerNote: cornerWord(s.corners), denseNote: denseWord(s.density),
    reachNote: reachWord(s.area),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 쪽 — 메인 네 시도에서만 낸다 ──────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const intro = `<div class="intro">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = panel('fact', 'measured', `${esc(s.name)} 테두리를 재면`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['곧은 몫', `${s.straightPct}% — ${esc(straightWord(s.straightPct))}`],
      ['가장 긴 직선 변', `${s.longest}m`],
      ['크게 꺾이는 자리', `${s.corners}군데`],
      ['꼭짓점', `${s.verts}개 · 테두리 1km마다 ${s.density}개`],
      ['시군구 안 차례', `곧은 몫 ${s.guStraightRank}번째 / ${g.spotCount}칸`],
      ['전체 차례', `곧은 몫 ${s.straightRank}번째 · 직선 길이 ${s.longRank}번째`],
      ['땅', `${km2(s.area)} — ${esc(reachWord(s.area))}`],
      ['여는 시각', `${esc(cfg.hours)} 통화 / 셈 ${esc(cfg.pay)} / 도착 ${esc(cfg.arrive)}`],
    ]),
    esc(at(h, SEC.factSub, 7)), 'I');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, 'VII');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    intro,
    facts,
    summonBand(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, 'II'),
    edgeKin(sd, g, s, seed, 'III'),
    spotIndex(sd, g, seed, s.slug, 'IV'),
    stepList(seed, 'V'),
    guIndex(sd, seed, g.slug, 'VI'),
    faqHtml,
    noticeBlock(seed, 'VIII'),
    longtail(pool, seed, 24, 'elsewhere', esc(at(h, SEC.crossHead, 8)), null, 'IX'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="hd-s">출장마사지 | 홈타이 방문 — 테두리의 곧은 몫 ${s.straightPct}% · 가장 긴 직선 ${s.longest}m</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 범위', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 쪽에서 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다(강화·가평·양평·연천·기장).
     쪽을 낼 칸이 0이므로 리드·장부·목록을 따로 갈라야 한다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const vertSum = g.spots.reduce((t, x) => t + x.verts, 0);
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area), straightPct: g.straightPct, bentShare: Math.round((100 - g.straightPct) * 10) / 10,
    density: g.density, cornerSum: g.cornerSum, vertSum: vertSum || Math.round(g.density * 10),
    flatSpot: g.flatSpot || '', flatPct: g.flatPct || 0,
    bentSpot: g.bentSpot || '', bentPct: g.bentPct || 0,
    longSpot: g.longSpot || '', longM: g.longM || 0,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const intro = `<div class="intro">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}칸`],
    mode === 'spot' ? ['쪽을 세운 동', `${g.spotCount}칸`]
      : mode === 'rural' ? ['쪽을 세운 동', '없음 — 행정동이 모두 읍·면입니다']
        : ['층을 끊은 자리', '시군구 — 동 이름은 아래 목록에'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}칸 — 이름만 실음(읍 ${g.eupCount}·면 ${g.myeonCount})` : '없음'],
    ['곧은 몫 평균', `${g.straightPct}%`],
    ['꼭짓점 밀도', `테두리 1km마다 ${g.density}개`],
    ['크게 꺾이는 자리', `${g.cornerSum}군데`],
    ['땅', km2(g.area)],
    ['여는 시각', `${esc(cfg.hours)} · 결제 ${esc(cfg.pay)}`],
  ];
  if (mode === 'spot' && g.flatSpot) {
    rows.splice(7, 0,
      ['가장 반듯한 칸', `<a href="/${sd.slug}/${g.slug}/${g.flatSpotSlug}/">${esc(g.flatSpot)}</a> ${g.flatPct}% · 가장 굽은 칸 <a href="/${sd.slug}/${g.slug}/${g.bentSpotSlug}/">${esc(g.bentSpot)}</a> ${g.bentPct}%`],
      ['가장 긴 직선 변', `<a href="/${sd.slug}/${g.slug}/${g.longSpotSlug}/">${esc(g.longSpot)}</a> ${g.longM}m`]);
  }
  const facts = panel('fact', 'measured', `${esc(g.name)} 경계 장부`, factTable(rows), esc(at(h, SEC.factSub, 7)), 'I');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, 'VI');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    intro,
    facts,
    summonBand(cfg, `${sd.name} ${g.name}`, seed),
    mode === 'spot' ? spotIndex(sd, g, seed, null, 'II') : mode === 'list' ? dongNameList(g, seed, 'II') : '',
    ruralList(g, seed, 'III'),
    courseGrid(courses, seed, g.name, 'IV'),
    nearList(sd, g, seed, 'V'),
    faqHtml,
    stepList(seed, 'VII'),
    noticeBlock(seed, 'VIII'),
    guIndex(sd, seed, g.slug, 'IX'),
    longtail(pool, seed, 20, 'districts', '옆 시군구에서 받는 자리', null, 'X'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="hd-s">출장마사지 | 홈타이 — ${mode === 'spot' ? `동 ${g.spotCount}칸에 쪽을 세웠습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}칸 모두 닿습니다` : `행정동 ${g.dongCount}칸 모두 닿습니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 범위', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    straightPct: sd.straightPct,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const intro = `<div class="intro"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = panel('fact', 'measured', `${esc(sd.name)} 경계 장부`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['층의 깊이', sd.main ? '시군구 → 동' : '시군구까지'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}칸`],
      sd.main ? ['쪽을 세운 동', `${sd.spotCount}칸`] : ['동 이름', '시군구 쪽 목록 안에'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}칸 · 시군구 쪽에 이름만 실음` : '없음'],
      ['곧은 몫 평균', `${sd.straightPct}%`],
      sd.main && sd.flatSpot ? ['가장 반듯한 동', `${esc(sd.flatSpot)} ${sd.flatPct}%`] : ['받는 땅', km2(sd.area)],
      sd.main && sd.bentSpot ? ['가장 굽은 동', `${esc(sd.bentSpot)} ${sd.bentPct}%`] : ['여는 시각', `${esc(cfg.hours)} · 결제 ${esc(cfg.pay)}`],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), 'I');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, 'VI');

  const csLinks = panel('sidocourse', 'courses', `${esc(sd.name)}에서 고를 수 있는 코스`,
    `<ul class="pills">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스마다 손이 길게 머무는 자리가 다릅니다. 요금은 ${esc(sd.name)} 전역이 한 가지입니다.`, 'IV');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.straightPct - a.s.straightPct || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = panel('flat', 'grid', `${esc(sd.name)}에서 테두리가 가장 반듯한 동`,
      `<ul class="pills">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${x.s.straightPct}%</a></li>`).join('\n')}\n</ul>`,
      `자로 그은 듯한 경계를 가진 칸입니다. 대개 길이 격자로 나 있어 번지를 찾기가 수월합니다. 나머지 칸은 시군구를 거쳐 들어가시면 됩니다.`, 'III');
  } else {
    pickBlock = panel('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="pills">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}칸</a></li>`).join('\n')}\n</ul>`,
      '행정동이 많으면 같은 땅을 더 잘게 갈라 이름 붙였다는 뜻입니다.', 'III');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    intro,
    facts,
    summonBand(cfg, sd.name, seed),
    guIndex(sd, seed, null, 'II'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, 'V'),
    faqHtml,
    stepList(seed, 'VII'),
    longtail(pool, seed, 20, 'provinces', '다른 시도에서 받는 자리', null, 'VIII'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="hd-s">출장마사지 | 홈타이 — ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} · 곧은 몫 평균 ${sd.straightPct}%</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '닿는 범위', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
