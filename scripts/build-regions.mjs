/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **테두리의 결**이다. 넓이도 거리도 재지 않는다.
 *   경계선을 이루는 꼭짓점을 차례로 훑으며 꺾이는 각을 재고,
 *   - 곧은 몫  : 한 번도 크게 꺾이지 않고 250m 넘게 이어지는 구간이 테두리에서 차지하는 길이 비율
 *   - 가장 긴 직선 : 한 번도 꺾이지 않고 이어지는 가장 긴 구간
 *   - 꺾임 : 60도 넘게 꺾이는 모서리의 개수
 *   - 꼭짓점 밀도 : 테두리 1km 에 찍힌 꼭짓점 수
 *   를 낸다.
 *
 *   곧은 테두리는 사람이 도로·철길·구획선을 따라 자로 그은 경계다. 그런 동네는
 *   길이 격자로 나고 번지가 가지런하다. 굽은 테두리는 하천이나 능선을 따라간
 *   선이라 골목이 휘고 막다른 길이 잦다. 찾아가는 쪽에서 성격이 꽤 다르다.
 *
 *   앞선 열 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·
 *   가로세로·둘레·뭉침 정도·안쪽 깊이·매듭점·시도 바깥선까지의 거리·이름 세기·
 *   해의 자리를 썼다. 테두리가 얼마나 반듯한지를 재는 축은 여기서 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}

const BREAK = 5;     // 이 각보다 크게 꺾이면 곧은 구간이 끊긴다
const MINRUN = 250;  // 250m 넘게 곧게 이어져야 '반듯한 변'으로 센다
/**
 * 테두리의 결을 잰다. 바깥 링만 본다(안쪽 구멍은 테두리의 성격이 아니다).
 *   꺾임 각 = 앞 변에서 뒤 변으로 넘어갈 때 방향이 바뀐 각
 *   곧은 몫 = 250m 넘게 곧게 이어진 구간의 길이 합 ÷ 테두리 전체 길이
 * ★★좌표가 거의 겹친 점(1m 미만)은 각이 요동쳐서 버린다. 안 버리면
 *   원자료의 미세한 흔들림이 '굽었다'로 읽혀 값이 전부 비슷해진다.
 */
function edgeTexture(geom, lat0) {
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;   // m 단위
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let total = 0, straight = 0, verts = 0, corners = 0, longest = 0;
  for (const poly of polys) {
    const ring = poly[0];
    const pts = [];
    for (const c of ring) {
      const x = c[0] * kx, y = c[1] * ky;
      const p = pts[pts.length - 1];
      if (p && Math.hypot(x - p[0], y - p[1]) < 1) continue;   // 1m 미만은 같은 점으로 본다
      pts.push([x, y]);
    }
    if (pts.length > 2 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1) pts.pop();
    const n = pts.length;
    if (n < 4) continue;
    verts += n;
    /* 변의 길이와, 그 변이 시작되는 꼭짓점에서 꺾인 각 */
    const len = new Array(n), bend = new Array(n);
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
      const v1x = b[0] - a[0], v1y = b[1] - a[1];
      const v2x = c[0] - b[0], v2y = c[1] - b[1];
      const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      len[i] = l2;
      bend[i] = (!l1 || !l2) ? 0 : deg(Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (l1 * l2)))));
      total += l2;
      if (bend[i] >= 60) corners += 1;
    }
    /* 꺾임이 5도를 넘는 자리에서 끊어 '곧게 이어진 구간'으로 묶는다.
       ★꼭짓점마다 재면 네 점짜리 네모가 0% 로 나온다 — 네 변이 전부 곧은데도.
         구간으로 묶어야 사람이 보는 '반듯함'과 맞는다. */
    let start = bend.findIndex((b) => b >= BREAK);
    if (start < 0) { straight += total; if (total > longest) longest = total; continue; }
    let run = 0;
    for (let k = 0; k < n; k++) {
      const i = (start + k) % n;
      run += len[i];
      const nxt = (i + 1) % n;
      if (bend[nxt] >= BREAK || k === n - 1) {
        if (run >= MINRUN) straight += run;
        if (run > longest) longest = run;
        run = 0;
      }
    }
  }
  if (!total) return null;
  return {
    straightPct: Math.round((straight / total) * 1000) / 10,
    longest: Math.round(longest),
    verts,
    corners,
    density: Math.round((verts / (total / 1000)) * 10) / 10,
    periKm: Math.round((total / 1000) * 10) / 10,
  };
}

function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky, lat0 };
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
const vertex = new Map();
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const [sidoKey, meta, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const tx = edgeTexture(ft.geometry, st.lat0);
  if (!tx) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
    ...tx,
  };
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
    /* 시군구 전체를 한 덩어리로 본 평균 — 동마다 잰 값을 길이로 가중한다 */
    straightPct: r1(list.reduce((s, d) => s + d.straightPct * d.periKm, 0) / list.reduce((s, d) => s + d.periKm, 0)),
    density: r1(list.reduce((s, d) => s + d.verts, 0) / list.reduce((s, d) => s + d.periKm, 0)),
    cornerSum: list.reduce((s, d) => s + d.corners, 0),
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      g.spots.push({
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        straightPct: d.straightPct, longest: d.longest,
        verts: d.verts, corners: d.corners, density: d.density, periKm: d.periKm,
      });
      spotAll.push(g.spots[g.spots.length - 1]);
    }
  }
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* ── 옆 시군구 ────────────────────────────────────────────── */
const touchPair = new Map();
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
      if (!touchPair.has(a)) touchPair.set(a, new Map());
      touchPair.get(a).set(b, (touchPair.get(a).get(b) || 0) + 1);
    }
  }
}
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
for (const g of guAll) {
  const set = new Set();
  for (const c of g.codes) {
    const m = touchPair.get(c);
    if (!m) continue;
    for (const [n, cnt] of m) {
      if (cnt < 2) continue;
      const o = codeGu.get(n);
      if (o && o !== g) set.add(o);
    }
  }
  g.near = [...set].map((o) => ({ sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.nearCount = g.near.length;
}

/* ── 차례 매기기 ──────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.straightPct - a.straightPct).forEach((s, i) => { s.straightRank = i + 1; });
spotAll.slice().sort((a, b) => b.longest - a.longest).forEach((s, i) => { s.longRank = i + 1; });
spotAll.slice().sort((a, b) => b.density - a.density).forEach((s, i) => { s.denseRank = i + 1; });
for (const g of guAll) {
  if (!g.spots.length) continue;
  g.spots.slice().sort((a, b) => b.straightPct - a.straightPct).forEach((s, i) => { s.guStraightRank = i + 1; });
  const by = g.spots.slice().sort((a, b) => b.straightPct - a.straightPct);
  g.flatSpot = by[0].name; g.flatSpotSlug = by[0].slug; g.flatPct = by[0].straightPct;
  g.bentSpot = by[by.length - 1].name; g.bentSpotSlug = by[by.length - 1].slug; g.bentPct = by[by.length - 1].straightPct;
  const byLong = g.spots.slice().sort((a, b) => b.longest - a.longest);
  g.longSpot = byLong[0].name; g.longSpotSlug = byLong[0].slug; g.longM = byLong[0].longest;
  g.cornerTop = g.spots.slice().sort((a, b) => b.corners - a.corners)[0].name;
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes;
  }
  const flat = allSpots.slice().sort((a, b) => b.straightPct - a.straightPct)[0];
  const bent = allSpots.slice().sort((a, b) => a.straightPct - b.straightPct)[0];
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    straightPct: r1(gus.reduce((s, g) => s + g.straightPct * g.area, 0) / gus.reduce((s, g) => s + g.area, 0)),
    flatSpot: flat ? flat.name : '', flatPct: flat ? flat.straightPct : 0,
    bentSpot: bent ? bent.name : '', bentPct: bent ? bent.straightPct : 0,
    gu: gus,
  });
}

const pcts = spotAll.map((s) => s.straightPct).sort((a, b) => a - b);
const out = {
  version: VERSION,
  source: 'admdongkor 행정동 경계 자료(CC BY 4.0) — 원자료는 국가공간정보포털, 배포는 github.com/vuski/admdongkor',
  built: new Date().toISOString().slice(0, 10),
  axis: '테두리의 결 — 곧은 몫·가장 긴 직선·꺾임 수·꼭짓점 밀도',
  method: '경계 바깥 선을 이루는 꼭짓점을 차례로 훑으며 꺾이는 각을 재고, 5도를 넘게 꺾이는 자리에서 선을 끊어 구간으로 묶은 뒤, 250m 넘게 곧게 이어진 구간이 테두리 전체 길이에서 차지하는 몫을 냈다. 1m 안에 겹친 점은 하나로 묶어 원자료의 미세한 흔들림을 걸러 냈다.',
  coverageFrom: '서울·인천·경기·부산에서는 동 한 칸마다 쪽을 세우고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구 선에서 끊는다. 읍과 면은 쪽을 두지 않고 시군구 쪽 목록에 이름만 싣는다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    pctMin: pcts[0], pctMid: pcts[pcts.length >> 1], pctMax: pcts[pcts.length - 1],
    flatName: spotAll.slice().sort((a, b) => b.straightPct - a.straightPct)[0].name,
    bentName: spotAll.slice().sort((a, b) => a.straightPct - b.straightPct)[0].name,
    longName: spotAll.slice().sort((a, b) => b.longest - a.longest)[0].name,
    longM: spotAll.slice().sort((a, b) => b.longest - a.longest)[0].longest,
    vertSum: spotAll.reduce((s, x) => s + x.verts, 0),
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`곧은 몫 최소 ${C.pctMin}% · 중앙 ${C.pctMid}% · 최대 ${C.pctMax}% · 가장 반듯 ${C.flatName} · 가장 굽음 ${C.bentName}`);
console.log(`가장 긴 직선 ${C.longName} ${C.longM}m · 꼭짓점 합계 ${C.vertSum}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 곧은 몫 ${String(s.straightPct).padStart(5)}%`);
