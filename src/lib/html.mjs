import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { RULEMARK } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **hailBtn() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 * ★어두운 바탕에 가는 겹줄로 칸을 가른다. 둥근 모서리를 쓰지 않는다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#15172B">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/luxe.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="jump" href="#main">본문으로 넘어가기</a>
${header(ctx, path)}
${crumbs.length > 1 ? pathHtml(crumbs) : ''}
<main id="main">
<h1 class="hd">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${railBar(cfg)}
<script src="/assets/luxe.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 황동 테를 두른 네모지만 `<a href="tel:">` 이다. <button> 으로 두면
   스크립트 없이는 아무 일도 일어나지 않는다.
   size: s(머리) · m2(본문) · l(대문·아래 줄) */
export function hailBtn(cfg, { size = 'm2', full = false } = {}) {
  return `<a class="hail hail-${size}${full ? ' hail-full' : ''}" href="tel:${cfg.telRaw}">
  <span class="hail-m" aria-hidden="true"></span>
  <span class="hail-t"><span class="hail-k">${esc(cfg.telLabel)}</span><span class="hail-v">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리 — 어두운 띠에 상호와 버튼, 메뉴는 칸을 가른 줄로 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '닿는 범위'], ['/course/', '코스'], ['/price/', '요금'], ['/guide/', '이용 전에'], ['/magazine/', '기록']];
  return `<header class="crown">
  <div class="crown-in">
    <a class="crest" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">
      ${RULEMARK()}<span class="crest-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    <div class="crown-r">
      <p class="crown-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
      ${hailBtn(cfg, { size: 's' })}
    </div>
  </div>
  <nav class="band" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
</header>`;
}

function pathHtml(crumbs) {
  return `<nav class="path" aria-label="지나온 자리"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="plinth">
  <div class="plinth-in">
    <section>
      <p class="pl-nm">${esc(cfg.brand.ko)}</p>
      <p class="pl-say">손님을 기다리는 자리가 따로 없습니다. 연락이 오면 관리사가 그 주소를 향해 출발합니다. 쪽을 둔 층은 시군구 ${counts.gu}곳과 동 ${counts.spot}칸, 들어오는 길은 아래 한 줄입니다.</p>
      ${hailBtn(cfg, { size: 'm2' })}
      <p class="pl-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 앞서 보내실 돈 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="pl-h">동 한 칸까지</p>
      <ul class="pills">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="pl-h" style="margin-top:16px">시군구 선까지</p>
      <ul class="pills">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="pl-sm"><a href="/area/">닿는 범위를 한 장에</a> · 읍·면 ${counts.rural}칸은 이름만 실었습니다</p>
    </nav>
    <div>
      <p class="pl-h">문서</p>
      <ul class="pl-ul">
        <li><a href="/guide/">이용 전에</a></li>
        <li><a href="/price/">요금</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="pl-h" style="margin-top:18px">최근 기록</p>
      <ul class="pl-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="pl-h" style="margin-top:18px">가져가는 길</p>
      <ul class="pills"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="pl-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="plinth-end"><div>
    ${biz ? `<p class="pl-biz">${biz}</p>` : '<p class="pl-biz pl-off">사업자 정보는 확정되는 대로 이 줄에 적습니다.</p>'}
    <p class="pl-ai">지역 쪽의 곧은 몫과 꺾임 수는 공개된 행정동 경계선을 기계로 훑어 계산한 값이며, 문장은 <strong>AI 도구로 초고를 만든 뒤</strong> 사람이 손봐 실었습니다. 후기·체험담·별점을 받지도 싣지도 않고 인물 사진을 쓰지 않습니다. 밑자료: ${esc(data.source)}</p>
    <p class="pl-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 병을 고치는 의료 행위가 아니며 성적인 서비스를 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 줄 */
function railBar(cfg) {
  return `<div class="rail2">
  ${hailBtn(cfg, { size: 'l', full: true })}
  <span class="rail2-s">도착까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/**
 * 칸 틀 — 가는 겹줄로 두른 액자. 번호는 제목 위에 작게.
 */
export function panel(id, label, h2, inner, sub, n) {
  return `<section class="panel" id="${id}" aria-labelledby="${id}-h">
  <header class="panel-h">
    <span class="panel-no" aria-hidden="true" data-eyebrow="${esc(label)}${n ? ` — ${n}` : ''}"></span>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="panel-sb">${sub}</p>` : ''}
  </header>
  <div class="panel-b">${inner}</div>
</section>`;
}
