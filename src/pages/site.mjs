import { layout, panel, hailBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, stepSet, factTable, faqBlock, noticeBlock,
  longtail, summonBand, siteLinks, topicLinks, courseTopic, docTopics,
} from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="gate" aria-label="첫 안내">
  <p class="gate-sl">${esc(cfg.brand.slogan)}</p>
  <p class="gate-p">머무는 가게가 없습니다. 연락 주시면 관리사가 댁 주소를 향해 나섭니다. 수도권과 부산은 동 한 칸까지 세워 두었고, 대전·대구·울산과 지정한 시·군은 시군구에서 층을 끊었습니다.</p>
  ${hailBtn(cfg, { size: 'l' })}
  <dl class="gate-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>밤에도 같은 줄로</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>지갑은 마지막에</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>이 범위에 도착합니다</dd></div>
    <div><dt>동 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}곳에 걸쳐</dd></div>
  </dl>
</section>`;

  /* ★지역 고르기 — 두 칸짜리 이름 목록을 쓰지 않는다. 어두운 바탕에 가는 괘선 표를
     놓고 시군구·동·곧은 몫을 열로 세워 한눈에 견주게 한다. 이 사이트가 재는 값이
     그대로 열 하나가 된다. */
  const allR = [...main, ...sub];
  const pcts = allR.map((r) => r.straightPct);
  const plo = Math.min(...pcts) - 3, phi = Math.max(...pcts) + 1;
  const areaBlock = panel('area', 'where', '어느 자리에서 부르시나요',
    `<table class="ledger2">
      <thead><tr><th scope="col">지역</th><th scope="col">시군구</th><th scope="col">쪽을 둔 동</th><th scope="col">곧은 몫</th></tr></thead>
      <tbody>${allR.map((r) => `<tr${r.main ? ' class="deep"' : ''}>
        <th scope="row"><a href="/${r.slug}/">${esc(r.name)}</a></th>
        <td>${r.gu.length}</td>
        <td>${r.main ? `${r.spotCount}` : '—'}</td>
        <td><span class="bar" aria-hidden="true"><i style="width:${Math.round(((r.straightPct - plo) / (phi - plo)) * 100)}%"></i></span>${r.straightPct}%</td>
      </tr>`).join('\n')}</tbody>
    </table>
    <p class="ledger2-key">이름 옆에 ▾ 가 붙은 줄은 동까지 쪽이 있는 지역이고, 나머지는 시군구에서 멈춥니다.
      맨 오른쪽은 그 지역 경계가 자로 그은 선에 얼마나 가까운지입니다. 층이 갈려도 받는 줄과 요금은 하나입니다.
      <a href="/area/">닿는 범위를 한 장에</a> 펼쳐 두었습니다.</p>`,
    '층을 둘로 둔 것은 적어 놓은 깊이가 다르다는 뜻입니다. 가는 지역을 솎아 낸 것이 아닙니다.', 'I');

  const whyBlock = panel('why', 'method', '왜 동네 경계부터 재나요?',
    `<div class="intro">
      <p>동 쪽을 열면 그 자리 <strong>테두리의 몇 퍼센트가 곧은 선인지</strong>가 적혀 있습니다. 가장 반듯한 칸은 ${esc(counts.flatName)}, 가장 굽은 칸은 ${esc(counts.bentName)}입니다. 쪽을 낸 ${counts.spot}칸의 한가운데 값은 ${counts.pctMid}%입니다.</p>
      <p>자로 그은 듯한 경계는 도로나 철길, 구획선을 따라 그은 선입니다. 그런 동네는 길이 격자로 나고 번지가 순서대로 붙습니다. 반대로 물길과 능선을 따라간 경계 쪽은 골목이 휘고 막다른 길이 잦습니다. <strong>굽은 쪽에서는 접수할 때 들어오는 방향을 한 번 더 여쭙습니다.</strong></p>
      <p>모두 공개된 경계 자료를 기계로 훑어 낸 값이고, 같은 방식으로 다시 재면 같은 숫자가 나옵니다. <a href="/magazine/why-straight-edges/">재는 방법을 기록에 풀어 두었습니다</a>.</p>
    </div>`, null, 'II');

  const postBlock = panel('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="shelfx">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="panel-f"><a href="/magazine/">기록 전부 보기</a></p>`,
    '체험담이 아닙니다. 읽어 두시면 통화가 짧아지는 것만 골랐습니다.', 'V');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, 'VI');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, 'VIII', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '부르시는 자리', 'III'),
    stepList(seed, 'IV'),
    postBlock,
    faqHtml,
    noticeBlock(seed, 'VII'),
    topics,
    summonBand(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="hd-s">서울·인천·경기·부산 동 ${counts.spot}칸 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 걸음', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const intro = `<div class="intro">
  <p>쪽이 걸린 자리를 이 화면 하나에 전부 늘어놓았습니다. 시군구가 ${counts.gu}곳이고 동이 ${counts.spot}칸입니다. 읍·면 ${counts.rural}칸은 쪽만 없고 받는 것도 가는 것도 같습니다.</p>
  <p>수도권과 부산은 동을 한 칸씩 눌러 들어가실 수 있고, 그 밖은 시군구 쪽 목록에 동 이름을 넣어 두었습니다. 깊이를 가른 것은 연락이 몰리는 쪽만 더 잘게 쪼갠 결과입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => panel(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}칸` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="cells">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="e-n">${esc(g.name)}</span><span class="e-s">${g.plainCount ? `동 ${g.plainCount}${g.ruralCount ? `+${g.ruralCount}` : ''}` : `읍면 ${g.ruralCount}`}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name} 시군구를 누르시면 그 밑의 동이 펼쳐집니다. 이 지역 경계의 곧은 몫 평균은 ${r.straightPct}%입니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구에서 끝납니다. 행정동 ${r.dongCount}칸 이름은 해당 시군구 쪽 목록에 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, 'XX');

  const body = [intro, summonBand(cfg, '사시는 곳', seed), blocks, faqHtml, stepList(seed, 'XXI')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `닿는 범위 <span class="hd-s">시군구 ${counts.gu}곳과 동 ${counts.spot}칸을 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '닿는 범위', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 방문 가능 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '사시는 자리에서 부르는 다섯 걸음', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const intro = `<div class="intro">
  <p>모두 ${courses.length}가지입니다. 고르실 것은 셋입니다 — 얼마나 세게, 몇 분, 기름을 쓸지. 남은 것은 통화에서 함께 맞춥니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 길게 받는다고 세게 받는 것이 아니며, 요금이 높다고 더 나은 것도 아닙니다.</p>
</div>`;

  const table = panel('all', 'table', `${courses.length}가지를 한 표에`,
    `<table class="table"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">요금</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '바름' : '없음'}</td></tr>`).join('\n')}</tbody></table>`,
    '요금이 낮은 것부터 올렸습니다. 어디서 부르셔도 같은 표를 씁니다.', 'I');

  const pickBy = panel('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="shelfx">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '고르신 뒤에 갈아타셔도 됩니다. 셈은 끝에 받으신 코스로 합니다.', 'II');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 곳'), 4, 'III');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [intro, table, pickBy, summonBand(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾아보기', null, 'IV')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한 표에 세웠습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="hd-s">세기와 길이, 기름 여부를 한 표에 놓고</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`), desc: clampDesc(`코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한 표에 세웠습니다.`), listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 요금 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const intro = `<div class="intro">
  <p>표 한 장으로 끝입니다. 표 바깥의 돈은 어떤 명목으로도 청구하지 않습니다.</p>
  <p>옆 블록이든 한 시간 거리의 읍내든 같은 코스면 같은 숫자를 받습니다. 먼 길을 가는 부담은 저희가 지기로 했습니다.</p>
</div>`;

  const table = panel('tbl', 'prices', '코스별 기본 길이와 요금',
    `<table class="table"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">요금</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 견주기용으로만 붙였습니다. 실제로 분 단위로 나눠 받는 일은 없습니다.', 'I');

  const noExtra = panel('nox', 'never', '붙지 않는 것들',
    `<ul class="keep">
      <li>차비 — 거리가 멀어도 셈에 넣지 않습니다.</li>
      <li>심야 할증 — 한밤에 부르셔도 표 그대로입니다.</li>
      <li>명절·휴일 할증 — 달력을 보고 요금을 올리지 않습니다.</li>
      <li>미리 보내는 돈 — 예약금이라는 항목이 아예 없습니다.</li>
      <li>취소 수수료 — 미루셔도 접으셔도 물지 않습니다.</li>
      <li>주차비 — 저희 쪽에서 냅니다.</li>
    </ul>`,
    '입금부터 요구하는 연락이라면 저희가 아닙니다.', 'II');

  const pay = panel('how', 'payment', '요금은 어떻게 내나요?',
    factTable([
      ['내는 때', '손을 놓은 그 자리에서'],
      ['수단', '현금과 카드 — 어느 쪽이든 같은 숫자'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받을 때', '접수 때 정하시면 늘어난 만큼만 붙습니다'],
      ['두 분이 받을 때', '사람 수대로 셈합니다. 묶어 깎는 제도가 없습니다'],
    ]), null, 'III');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, 'IV');

  const body = [intro, table, noExtra, pay, summonBand(cfg, '요금 확인', seed), faqHtml, docTopics(ctx, seed, 'XI', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`요금 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 요금입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 관리가 끝난 뒤 현금이나 카드로 받습니다.`),
      h1: `요금 <span class="hd-s">${won(sorted[0].price)}원부터 — 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '요금', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 요금`, desc: clampDesc(`코스별 기본 길이와 요금입니다. ${won(sorted[0].price)}원부터입니다.`), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 이용 전에 ────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const intro = `<div class="intro">
  <p>처음 연락하시는 분 기준으로 적었습니다. 전화 한 통에서 끝나는 일이라 붙들고 계실 일이 없습니다.</p>
</div>`;

  const what = panel('need', 'ready', '무엇을 챙겨 두면 되나요?',
    `<ul class="keep">
      <li>누울 자리 — 바닥이든 침대든 가리지 않습니다.</li>
      <li>수건 두 장 — 집에 있는 것으로 되고, 기름 없는 코스라면 한 장으로 끝입니다.</li>
      <li>문 달린 방 — 다른 식구가 계셔도 괜찮습니다.</li>
    </ul>
    <p class="panel-f">깔개와 기름, 접이식 베드는 전부 관리사 쪽에서 들고 옵니다. 따로 사실 것이 없습니다.</p>`,
    null, 'I');

  const timing = panel('when', 'hours', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 어느 시각이든 한 줄`],
      ['도착', `대개 ${esc(cfg.arrive)}, 골목이 휜 자리면 더 걸립니다`],
      ['시간 변경', '언제 하셔도 되고 수수료가 없습니다'],
      ['취소', '관리사가 이미 도착했다면 그 사실만 알려 주십시오'],
      ['붐비는 때', '금요일과 토요일 밤'],
      ['여유 있는 때', '주중 낮 — 거의 바로 출발합니다'],
    ]), null, 'II');

  const refuse = panel('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="keep">
      <li>성적인 말이 섞일 때 — 통화를 그 자리에서 끊습니다.</li>
      <li>열이 있거나 상처가 부었을 때 — 다른 날로 옮겨 드립니다.</li>
      <li>주소 끝자리를 주지 않으실 때 — 사람도 길도 정할 수 없습니다.</li>
      <li>관리사 개인 번호를 알려 달라 하실 때.</li>
      <li>병원이 먼저로 보일 때 — 진료를 권해 드립니다.</li>
      <li>만 열아홉 살 미만이실 때.</li>
    </ul>`,
    '받지 못하는 경우에도 비용이 생기지 않습니다.', 'III');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, 'V');

  const body = [intro, what, timing, stepList(seed, 'IV'), refuse, summonBand(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, 'VI'), docTopics(ctx, seed, 'XI', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용 전에 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 추렸습니다. 준비물, 접수 시각, 못 받는 경우, 요금 내는 법을 차례로 적었습니다.'),
      h1: `이용 전에 <span class="hd-s">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용 전에', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부르실 때 거치는 다섯 걸음', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: clampDesc('처음 부르실 때 필요한 것만 추렸습니다.'), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const intro = `<div class="intro">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판을 건 자리 없이 방문만 하는 곳입니다. 여러 업소를 걸어 놓고 연결만 해 주는 중개가 아닙니다. 접수도 방문도 저희가 합니다.</p>
  <p>이름은 회복(restore)과 품격(luxe)을 붙여 지었습니다. 요란하게 꾸미지 않고 할 일을 제대로 한다는 뜻으로 읽어 주시면 됩니다.</p>
</div>`;

  const line = panel('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="keep">
      <li>합니다 — 손으로 근육의 긴장을 풀어 내는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 꼴로도 두지 않습니다.</li>
      <li>안 합니다 — 진단과 치료. 의료기관이 할 일입니다.</li>
      <li>안 받습니다 — 만 열아홉 살 미만.</li>
      <li>안 싣습니다 — 후기와 별점. 진짜인지 걸러 낼 수가 없습니다.</li>
      <li>안 올립니다 — 인물 사진. 사진과 실제가 어긋나는 일이 흔합니다.</li>
      <li>안 받습니다 — 선입금. 앞당겨 받는 돈이 한 푼도 없습니다.</li>
    </ul>`, null, 'I');

  const how = panel('data', 'sources', '이 숫자들은 어떻게 쟀나요?',
    `<div class="intro">
      <p>지역 쪽의 곧은 몫과 꺾임 수는 공개된 행정동 경계선을 기계로 훑어 낸 값입니다. 경계를 이루는 꼭짓점을 차례대로 따라가며 방향이 몇 도 바뀌는지를 재고, 5도를 넘게 꺾이는 자리에서 선을 끊습니다.</p>
      <p>그렇게 토막 낸 구간 중 <strong>250m 넘게 곧게 이어지는 것만</strong> 모아 전체 테두리 길이로 나눈 것이 곧은 몫입니다. 쪽을 낸 ${counts.spot}칸에서 ${counts.pctMin}%부터 ${counts.pctMax}%까지 벌어지고, 한가운데는 ${counts.pctMid}%입니다.</p>
      <p>1m 안에 겹쳐 찍힌 점은 하나로 묶었습니다. 그러지 않으면 원자료의 미세한 흔들림이 전부 '굽었다'로 읽혀 어느 동네나 비슷한 값이 나옵니다.</p>
      <p>경계가 반듯하다고 꼭 길이 곧다는 보장은 없습니다. 경향이 그렇다는 것이고, 지도를 대신하는 수치가 아니라 들어가는 길의 성격을 가늠하는 참고값입니다.</p>
    </div>
    ${factTable([
      ['자료를 가져온 곳', esc(data.source)],
      ['자료 판 표기', esc(data.version)],
      ['재는 값', esc(data.axis)],
      ['재는 방법', esc(data.method)],
      ['쪽을 내는 기준', esc(data.coverageFrom)],
      ['쪽을 세운 단위', `시도 ${counts.sido} / 시군구 ${counts.gu} / 동 ${counts.spot}`],
      ['쪽이 없는 단위', `읍 ${counts.eup}칸과 면 ${counts.myeon}칸 — 이름만 목록에`],
      ['가장 반듯한 칸', `${esc(counts.flatName)} · 가장 굽은 칸 ${esc(counts.bentName)}`],
      ['가장 긴 직선 변', `${esc(counts.longName)}의 ${counts.longM}m`],
      ['훑은 꼭짓점', `${counts.vertSum.toLocaleString('ko-KR')}개`],
    ])}`, null, 'II');

  const body = [intro, line, how, summonBand(cfg, '문의', seed), docTopics(ctx, seed, 'XI', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽의 경계선을 어떤 자료로 어떻게 쟀는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="hd-s">하는 일의 끝과 재는 방법</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (이 약관이 하는 일)', '이 약관은 레스토라럭스(이하 "회사")가 제공하는 출장 방문 관리의 이용 조건과 절차, 회사와 이용자가 서로 지는 권리와 의무를 정합니다.'],
  ['제2조 (접수하는 길)', '접수는 사이트에 적힌 번호로 거시는 통화로만 받습니다. 이 번호는 중계 번호라 이용자의 전화번호가 관리사에게 그대로 넘어가지 않습니다. 메신저와 게시판, 전자우편으로는 접수를 받지 않습니다.'],
  ['제3조 (제공하는 것과 제공하지 않는 것)', '회사는 이용자가 정하신 장소로 관리사를 보내어 손으로 근육의 긴장을 푸는 일을 합니다. 질병을 진단하거나 치료하지 않고, 성적인 서비스도 어떤 형태로든 하지 않습니다.'],
  ['제4조 (이용할 수 있는 분)', '만 19세를 넘으신 분만 이용하실 수 있습니다. 그보다 어린 분의 접수는 어떤 사유로도 받지 않습니다.'],
  ['제5조 (경계 수치의 성격)', '사이트에 적힌 곧은 몫, 가장 긴 직선 변, 꺾임 수, 꼭짓점 밀도는 공개된 행정동 경계 자료를 기계로 훑어 낸 값입니다. 실제 도로 사정이나 이동 시간을 보장하지 않으며 들어가는 길의 성격을 가늠하는 참고 자료입니다.'],
  ['제6조 (요금과 결제)', '요금은 요금 안내에 적힌 것과 같고 지역에 따라 달라지지 않습니다. 셈은 관리를 마친 현장에서 현금 또는 카드로 합니다. 예약금과 보증금처럼 미리 받는 돈은 어떤 명목으로도 두지 않습니다.'],
  ['제7조 (바꾸기와 접기)', '방문 전에는 언제든 시간을 바꾸거나 접으실 수 있고 위약금이 없습니다. 관리사가 현장에 이미 도착한 뒤라면 곧바로 알려 주시기만 하면 됩니다.'],
  ['제8조 (접수 거절과 중단 사유)', '아래 어느 하나에 해당하면 회사는 접수를 받지 않거나 하던 관리를 멈출 수 있습니다. 1. 성적인 서비스를 요구하는 경우. 2. 관리사에게 폭언이나 물리력을 쓰거나 사적인 연락처를 요구하는 경우. 3. 방문할 주소를 끝까지 주지 않는 경우. 4. 발열이나 열린 상처가 있어 관리가 알맞지 않은 경우.'],
  ['제9조 (이용자의 준비)', '이용자께서는 관리를 받을 공간과 수건을 갖춰 두시고, 진행에 영향을 줄 수 있는 몸 상태를 접수 통화에서 알려 주셔야 합니다.'],
  ['제10조 (후기 제도를 두지 않음)', '회사는 이용 후기와 별점을 모으지 않고 화면에 올리지도 않습니다. 이 사이트의 문장 가운데 특정 이용자의 경험을 옮겨 적은 것은 하나도 없습니다.'],
  ['제11조 (중단과 요금)', '이용자의 요청이나 몸 상태로 멈춘 경우에는 흘러간 시간만큼만 요금을 셈합니다. 시작한 지 10분이 지나지 않았다면 받지 않습니다. 제8조 제1호에 따라 멈춘 경우에는 멈춘 시점까지 셈합니다.'],
  ['제12조 (책임)', '관리 중 회사의 잘못으로 생긴 손해는 회사가 배상합니다. 미리 알려 주지 않은 몸 상태에서 비롯한 손해와, 천재지변이나 통신 장애로 늦어진 일에는 책임을 지지 않습니다.'],
  ['제13조 (약관을 고칠 때)', '약관을 고치는 경우 사이트에 먼저 올리고 올린 날부터 적용합니다. 고친 뒤 접수하시면 바뀐 약관에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="intro"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 거신 시점에 아래 내용에 동의하신 것으로 봅니다.</p></div>`,
    panel('terms', 'terms', '전문', `<div class="clause">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, 'I'),
    summonBand(cfg, '약관 문의', 'terms'),
    docTopics(ctx, 'terms', 'XI', esc(at(hash('terms', 'dt'), SEC.topicHead, 8)), esc(at(hash('terms', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수하는 길과 제공 범위, 요금과 결제, 바꾸기와 접기를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="hd-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 받아 적는 것', '접수 통화에서 적는 것은 네 가지입니다 — 방문할 주소, 연락 가능한 번호, 고르신 코스, 원하시는 시각. 성함과 생년월일, 주민등록번호는 적지 않습니다.'],
  ['2. 쓰는 목적', '적어 둔 내용은 관리사를 정하고 출발과 도착을 알려 드리는 데에만 씁니다. 그 뒤에 광고 문자를 보내거나 먼저 연락드리는 일이 없습니다.'],
  ['3. 전화번호를 다루는 방식', '화면에 적힌 번호는 중계용입니다. 그래서 이용자 번호가 관리사에게 그대로 전달되지 않습니다.'],
  ['4. 얼마나 두는가', '방문이 탈 없이 끝나면 그날 지웁니다. 다툼이 생긴 건에 한해 마무리될 때까지 따로 보관합니다.'],
  ['5. 넘기거나 맡기는가', '바깥 사업자에게 넘기거나 맡기는 일이 없습니다. 법령에 근거한 수사기관의 적법한 요청에 한해 예외를 둡니다.'],
  ['6. 자동으로 모으는 장치', '이 사이트는 미리 만들어 둔 파일만 내보냅니다. 로그인도 장바구니도 댓글도 없고 광고 추적이나 방문자 분석 스크립트를 넣지 않았습니다. 쿠키도 쓰지 않습니다.'],
  ['7. 이용자의 권리', '보관 중인 내용을 보여 달라거나 지워 달라고 요구하실 수 있습니다. 같은 번호로 연락 주시면 그 통화에서 바로 처리합니다.'],
  ['8. 개인정보 책임자', '사업자 정보가 정해지면 이 항목과 화면 맨 아래에 함께 올립니다. 그때까지는 사이트에 적힌 번호가 창구 역할을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="intro"><p>내용이 짧습니다. 적는 항목 자체가 네 가지뿐이기 때문입니다.</p></div>`,
    panel('pp', 'privacy', '전문', `<div class="clause">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, 'I'),
    summonBand(cfg, '개인정보 문의', 'privacy'),
    docTopics(ctx, 'privacy', 'XI', esc(at(hash('privacy', 'dt'), SEC.topicHead, 8)), esc(at(hash('privacy', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 적는 항목과 쓰는 목적, 두는 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="hd-s">적는 항목 네 가지</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 기록 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="intro"><p>부르기 전에 알아 두면 통화가 짧아지는 것만 적습니다. 소감이나 평점은 올리지 않습니다.</p></div>`,
    panel('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="shelfx">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS 로도 같이 나갑니다.', 'I'),
    summonBand(cfg, '접수', 'magazine'),
    docTopics(ctx, 'magazine', 'XI', esc(at(hash('magazine', 'dt'), SEC.topicHead, 8)), esc(at(hash('magazine', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('선과 결 기록'),
      desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적었습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `선과 결 기록 <span class="hd-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '기록', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('선과 결 기록'), desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적었습니다.`), listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '선과 결 기록', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="dated"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 선과 결 기록</p>`,
    `<article class="text">${html}</article>`,
    summonBand(cfg, '접수', p.slug),
    panel('more', 'next', '함께 읽을 글',
      `<ul class="shelfx">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, 'I'),
    docTopics(ctx, p.slug, 'XI', esc(at(hash(p.slug, 'dt'), SEC.topicHead, 8)), esc(at(hash(p.slug, 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '기록', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="intro"><p>그 주소에 걸린 쪽이 없습니다. 자리가 바뀌었거나 아예 만들지 않은 주소입니다. 아래에서 다시 짚어 주십시오.</p></div>`,
    panel('back', 'back', '여기서 다시',
      `<ul class="pills">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">닿는 범위</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">요금</a></li>
        <li><a href="/guide/">이용 전에</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, 'I'),
    summonBand(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 쪽이 없습니다. 아래에서 다시 골라 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
