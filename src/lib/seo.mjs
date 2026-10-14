/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 열 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *     어반오아시스 `{동} 출장마사지 홈타이 / {구} {코스어} {행동어} · 어반오아시스`
 *     솔레이스바디 `{동} 출장마사지 홈타이 : {구} {코스어} {행동어} | 솔레이스바디`
 *   ★**'출장마사지'와 '홈타이'를 세로줄로 갈라 놓는** 모양은 여기서 처음 쓴다.
 *     열 곳 모두 두 낱말을 붙여 쓴다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다. 가운데 토막은 그 자리에서만 나오는 계산값
 *   (곧은 몫·가장 긴 직선·꺾임 수·꼭짓점 밀도)으로 채워 전부 달라지게 한다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '레스토라럭스';

/** 제목에 끼우는 코스어 — 실제로 받는 여덟 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '경락', '스포츠', '건식', '허리집중'];
/** 제목 꼬리 행동어 */
const ACT = ['지금 가능', '방문 시각 조율', '새벽 연결', '당일 접수', '바로 상담'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} 출장마사지 | 서울 인천 경기 부산 홈타이 동 방문 관리 24시 바로 상담`,
  areaHub: (c) => `출장마사지 닿는 범위 | 홈타이 동 ${c.spot}칸 시군구 ${c.gu}곳 전체 · ${BRAND}`,
  sido: (sd) => `${sd.name} 출장마사지 | ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} 홈타이 ${at(hash(sd.name, 'sdt'), ACT)} · ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}칸` : g.main ? `읍면 ${g.ruralCount}칸` : `행정동 ${g.dongCount}칸`;
    return `${g.name} 출장마사지 | ${sd.name} 홈타이 ${unit} ${at(h, ACT, 0)} · ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} 출장마사지 | ${g.name} 홈타이 ${at(h, COURSE_WORD, 0)} ${at(h, ACT, 1)} · ${BRAND}`;
  },
  course: (c) => `${c.ko} 출장마사지 | 홈타이 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 세기 ${c.pressure} · ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} 출장마사지 | ${sd.name} 홈타이 방문 ${at(hash(sd.name, c.slug), ACT)} · ${BRAND}`,
  page: (t) => `${t} · ${BRAND} 출장마사지 홈타이`,
  post: (p) => `${p.title} · ${BRAND} 선과 결 기록`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 테두리에서 나온 값으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `테두리의 ${s.straightPct}%가 자로 그은 듯 곧은 선입니다`,
    () => `가장 긴 직선 구간이 ${s.longest}m 이어집니다`,
    () => `경계가 ${s.corners}번 크게 꺾이고 꼭짓점이 ${s.verts}개입니다`,
    () => `테두리 1km마다 꼭짓점이 ${s.density}개 찍혀 있습니다`,
    () => `곧은 몫 ${s.straightPct}%로 ${g.name} 안에서 ${s.guStraightRank}번째입니다`,
    () => `땅 ${km2(s.area)}에 곧은 몫 ${s.straightPct}%`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '셈은 마친 뒤에 합니다',
  '앞서 보내실 돈이 없습니다',
  '거리로 숫자를 바꾸지 않습니다',
  '밤에도 표 그대로입니다',
  '값은 끝나고 받습니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 동네 경계가 얼마나 반듯한지를 칸마다 쟀습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이가 닿는 동 ${c.spot}칸과 시군구 ${c.gu}곳. 칸마다 테두리의 곧은 몫을 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} 출장마사지 홈타이 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}칸에 쪽이 있고 곧은 몫 평균이 ${sd.straightPct}%입니다.`
      : `${sd.name} 출장마사지 홈타이 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}칸에 쪽이 있고 곧은 몫 평균은 ${g.straightPct}%`,
        `가장 반듯한 칸이 ${g.flatSpot}, 가장 굽은 칸이 ${g.bentSpot}`,
        `가장 긴 직선은 ${g.longSpot}의 ${g.longM}m`,
        `경계가 크게 꺾이는 자리가 모두 ${g.cornerSum}군데`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}칸이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}칸과 면 ${g.myeonCount}칸을 이름으로 실었습니다`,
          `땅 ${km2(g.area)}에 곧은 몫 ${g.straightPct}%`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}칸이 들어 있고 곧은 몫은 ${g.straightPct}%`,
          `테두리 1km에 꼭짓점 ${g.density}개가 찍힌 ${km2(g.area)}`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}칸 모두 닿습니다` : `동 ${g.dongNames.length}칸 어디나 같은 줄로`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} 출장마사지 홈타이. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} 출장마사지 홈타이. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 쓰고 세기는 ${c.pressure} 쪽입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} 출장마사지 홈타이. ${c.focus}${josa(c.focus, '을/를')} 주로 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
