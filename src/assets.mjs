import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **얇은 겹줄 액자**다. 칸마다 1px 테두리를 두르고 제목 위아래에
 *   가는 줄을 두 겹으로 깐다. 순번은 로마 숫자로 적는다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *     솔레이스바디 비스듬히 잘린 귀퉁이 · 각진 타일 · 상아+청록
 *   ★여기는 **어두운 남보라 바탕에 가는 겹줄**이다. 블리스놋도 어둡지만 그쪽은
 *     흑연 바탕에 시트론이고 무늬가 '엮인 두 줄'이다. 바탕 색도 강조색도 멀다.
 *   ★강조색은 색상환에서 파랑(215도)과 보라(270도) 사이의 빈 자리를 썼다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#15172B', card: '#1D2040', soft: '#262A52',
  ink: '#E9EAF6', dim: '#9FA4CB',
  acc: '#8E8BE8', accDk: '#AFADF2', accSoft: '#2A2C5E',
  line: '#343864', brass: '#C8B072',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--brass:${t.brass};
  --w:1080px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.86;font-size:16px;letter-spacing:-.004em;padding-bottom:90px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--brass);font-weight:700}
.jump{position:absolute;left:-9999px}
.jump:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#15172B;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.crown{background:var(--paper);border-bottom:1px solid var(--line)}
.crown-in{max-width:var(--w);margin:0 auto;padding:18px 20px 13px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.crest{display:inline-flex;align-items:center;gap:12px;color:var(--ink)}
.crest:hover{text-decoration:none}
.lmk{width:30px;height:30px;flex:none}
.crest-t b{display:block;font-size:19px;font-weight:700;letter-spacing:.01em;line-height:1.15}
.crest-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.24em;color:var(--brass)}
.crown-r{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.crown-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.crown-run span{display:block}
.band{background:var(--paper);border-bottom:1px solid var(--line)}
.band ul{max-width:var(--w);margin:0 auto;padding:0 20px;list-style:none;display:flex;gap:0;overflow-x:auto}
.band li+li{border-left:1px solid var(--line)}
.band a{display:block;padding:10px 18px;font-size:13.5px;font-weight:600;color:var(--dim);white-space:nowrap;letter-spacing:.02em}
.band a:hover{color:var(--accDk);text-decoration:none;background:var(--card)}
.band a[aria-current]{color:var(--brass);background:var(--card)}

/* ── 지나온 자리 ───────────────────────────────────── */
.path{max-width:var(--w);margin:0 auto;padding:12px 20px 0}
.path ol{list-style:none;display:flex;flex-wrap:wrap;gap:9px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.path li+li::before{content:"—";margin-right:9px;color:var(--line)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:20px 20px 60px}
.hd{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.34;margin:14px 0 20px}
@media (min-width:720px){.hd{font-size:34px}}
.hd-s{display:block;margin-top:12px;font-size:13.5px;font-weight:500;color:var(--dim);letter-spacing:.005em}
.intro{margin:0 0 30px;max-width:52rem}
.intro p{margin:0 0 .95em}
.intro p:last-child{margin-bottom:0}

/* ── 칸 = 가는 겹줄 액자 ───────────────────────────── */
.panel{background:var(--card);border:1px solid var(--line);padding:26px 22px;margin:0 0 15px}
.panel-h{margin:0 0 18px;border-bottom:1px solid var(--line);padding-bottom:13px;position:relative}
.panel-h::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:1px;background:var(--line);opacity:.55}
.panel-no{display:block;margin:0 0 8px;font-family:var(--mono);font-size:10px;letter-spacing:.26em;color:var(--brass);text-transform:uppercase}
.panel h2{margin:0;font-size:19px;font-weight:700;letter-spacing:-.015em;line-height:1.4}
@media (min-width:720px){.panel h2{font-size:21px}}
.panel-sb{margin:10px 0 0;font-size:13.5px;color:var(--dim)}
.panel-f{margin:18px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:12px}

/* ── 장부 ──────────────────────────────────────────── */
.book{width:100%;border-collapse:collapse;font-size:14.5px}
.book th,.book td{padding:11px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.book th{width:40%;font-weight:600;color:var(--brass);font-size:12.5px;letter-spacing:.01em}
.book tr:last-child th,.book tr:last-child td{border-bottom:0}
@media (min-width:600px){.book th{width:28%}}

/* ── 코스 ──────────────────────────────────────────── */
.bill{list-style:none;margin:0;padding:0;display:grid;gap:0}
.bill>li{border-bottom:1px dashed var(--line);padding:14px 2px}
.bill>li:last-child{border-bottom:0}
.bill a{display:flex;justify-content:space-between;align-items:baseline;gap:14px;color:var(--ink);flex-wrap:wrap}
.bill a:hover{text-decoration:none;color:var(--accDk)}
.b-n{font-size:16px;font-weight:700;letter-spacing:-.01em}
.b-w{font-family:var(--mono);font-size:15px;color:var(--brass);font-weight:700;white-space:nowrap}
.b-s{display:block;margin-top:5px;font-size:12.5px;color:var(--dim);width:100%}
.b-t{margin:8px 0 0;font-size:13px;color:var(--dim)}

/* ── 차례 ──────────────────────────────────────────── */
.steps{list-style:none;margin:0;padding:0;counter-reset:st;display:grid;gap:0}
.steps li{padding:15px 2px 15px 58px;position:relative;border-bottom:1px solid var(--line)}
.steps li:last-child{border-bottom:0}
.steps li::before{content:counter(st,upper-roman);counter-increment:st;position:absolute;left:4px;top:16px;
  font-family:var(--mono);font-size:12px;letter-spacing:.08em;color:var(--brass);width:40px}
.steps h3{margin:0 0 5px;font-size:15px;font-weight:700}
.steps p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.query{display:grid;gap:0}
.query>div{padding:16px 2px;border-bottom:1px solid var(--line)}
.query>div:last-child{border-bottom:0}
.query .qi{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--brass);margin-bottom:6px}
.query h3{margin:0 0 8px;font-size:16px;font-weight:700;letter-spacing:-.012em}
.query p{margin:0;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.keep{list-style:none;margin:0;padding:0;display:grid;gap:0}
.keep li{padding:11px 2px 11px 20px;font-size:14px;color:var(--dim);border-bottom:1px dotted var(--line);position:relative}
.keep li:last-child{border-bottom:0}
.keep li::before{content:"·";position:absolute;left:4px;color:var(--brass);font-weight:700}

/* ── 목록·링크 ─────────────────────────────────────── */
.pills{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0}
.pills li{border:1px solid var(--line);margin:-1px 0 0 -1px}
.pills a{display:block;padding:8px 14px;font-size:13.5px;color:var(--ink)}
.pills a:hover{background:var(--soft);color:var(--accDk);text-decoration:none}
.cells{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line);border-left:1px solid var(--line)}
@media (min-width:560px){.cells{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.cells{grid-template-columns:1fr 1fr 1fr}}
.cells li{border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.cells a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;padding:11px 14px;color:var(--ink)}
.cells a:hover{background:var(--soft);text-decoration:none}
.cells .at a,.cells a[aria-current]{background:var(--accSoft);color:var(--brass)}
.e-n{font-weight:600;font-size:14.5px}
.e-s{font-family:var(--mono);font-size:11px;color:var(--dim);white-space:nowrap}
.bare{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:3px 14px}
.bare li{font-size:13px;color:var(--dim)}

/* ── 견주기 ────────────────────────────────────────── */
.table{width:100%;border-collapse:collapse;font-size:14px}
.table th,.table td{padding:11px 10px;text-align:left;border-bottom:1px solid var(--line)}
.table thead th{font-size:12px;color:var(--brass);font-weight:600;border-bottom:1px solid var(--brass)}
.table tbody th{font-weight:700}
.table tbody tr.at th,.table tbody tr.at td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.hail{display:inline-flex;align-items:center;gap:13px;background:transparent;color:var(--brass);
  padding:11px 22px;border:1px solid var(--brass);text-decoration:none}
.hail:hover{background:var(--brass);color:#15172B;text-decoration:none}
.hail-m{flex:none;display:block;width:13px;height:13px;border:1px solid currentColor;transform:rotate(45deg)}
.hail-t{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.hail-k{font-size:10px;letter-spacing:.24em;opacity:.85;font-family:var(--mono)}
.hail-v{font-family:var(--mono);font-weight:700;white-space:nowrap}
.hail-s .hail-v{font-size:15px}
.hail-m2 .hail-v{font-size:18px}
.hail-l .hail-v{font-size:21px}
.hail-l{padding:13px 26px}
.hail-full{display:flex;width:100%;justify-content:center}
.summon{border:1px solid var(--brass);background:var(--card);padding:24px 22px;margin:0 0 15px}
.summon-p{margin:0 0 16px;font-size:15px;max-width:48rem}
.summon-s{margin:14px 0 0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.gate{border:1px solid var(--line);border-top:3px solid var(--brass);background:var(--card);padding:34px 24px;margin:0 0 15px}
.gate-sl{margin:0 0 16px;font-size:21px;font-weight:700;letter-spacing:-.02em;color:var(--ink);max-width:23em;line-height:1.45}
@media (min-width:720px){.gate-sl{font-size:27px}}
.gate-p{margin:0 0 22px;color:var(--dim);font-size:15px;max-width:46rem}
.gate-f{display:grid;gap:0;margin:24px 0 0;border-top:1px solid var(--line);border-left:1px solid var(--line)}
@media (min-width:640px){.gate-f{grid-template-columns:1fr 1fr 1fr 1fr}}
.gate-f div{padding:14px 16px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.gate-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--brass)}
.gate-f dd{margin:4px 0 0;font-size:12.5px;color:var(--dim)}
.twin{display:grid;gap:20px}
@media (min-width:760px){.twin{grid-template-columns:1fr 1fr}}
.twin-h{margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.14em;color:var(--brass);font-family:var(--mono)}
.twin ul{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.twin li{border-bottom:1px solid var(--line)}
.twin a{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:11px 4px;color:var(--ink)}
.twin a:hover{color:var(--accDk);text-decoration:none}
.twin b{font-size:15px;font-weight:600}
.twin span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 글 ────────────────────────────────────────────── */
.text{max-width:46rem}
.text h2{margin:32px 0 13px;font-size:18px;font-weight:700;color:var(--brass);border-left:2px solid var(--brass);padding-left:11px}
.text p{margin:0 0 1em}
.text ul{margin:0 0 1em;padding-left:1.1em;color:var(--dim)}
.shelfx{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.shelfx li{border-bottom:1px solid var(--line)}
.shelfx a{display:block;padding:16px 4px;color:var(--ink)}
.shelfx a:hover{text-decoration:none;background:var(--soft)}
.shelfx b{display:block;font-size:16px;font-weight:700;margin-bottom:6px}
.shelfx p{margin:0;font-size:13.5px;color:var(--dim)}
.shelfx time{display:block;margin-top:8px;font-family:var(--mono);font-size:11px;color:var(--brass)}
.clause h2{margin:26px 0 10px;font-size:16.5px;font-weight:700;color:var(--brass)}
.clause p,.clause li{font-size:14.5px;color:var(--dim)}
.clause ul,.clause ol{padding-left:1.2em;margin:0 0 1em}
.dated{margin:0 0 16px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.plinth{background:var(--card);margin-top:22px;border-top:1px solid var(--line)}
.plinth-in{max-width:var(--w);margin:0 auto;padding:32px 20px 24px;display:grid;gap:26px}
@media (min-width:860px){.plinth-in{grid-template-columns:1.3fr 1fr 1fr}}
.pl-h{margin:0 0 11px;font-family:var(--mono);font-size:10px;letter-spacing:.26em;color:var(--brass)}
.pl-nm{margin:0 0 9px;font-size:18px;font-weight:700;letter-spacing:.01em}
.pl-say{margin:0 0 15px;font-size:13.5px;color:var(--dim)}
.pl-run{margin:13px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.pl-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:13.5px}
.pl-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.pl-sm{margin:11px 0 0;font-size:12px;color:var(--dim)}
.plinth-end{background:var(--card)}
.plinth-end div{max-width:var(--w);margin:0 auto;padding:0 20px 24px;border-top:1px solid var(--line);padding-top:19px}
.pl-biz{margin:0 0 9px;font-size:12px;color:var(--dim)}
.pl-off{opacity:.7}
.pl-ai{margin:0 0 9px;font-size:12px;color:var(--dim);line-height:1.72}
.pl-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.rail2{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:1px solid var(--brass);
  padding:10px 16px calc(10px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;transition:transform .2s}
.rail2.away{transform:translateY(130%)}
.rail2-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.rail2{display:none}}
@media print{.rail2,.band,.summon{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.rail2'),ft=document.querySelector('.plinth');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('away',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 곧은 선 둘과 굽은 선 하나 — 이 사이트가 재는 것 그대로 */
const RULE = (a, b, w) => `<g fill="none" stroke-width="${w}" stroke-linecap="square">
<path d="M4 9h24" stroke="${a}"/><path d="M4 16h24" stroke="${a}"/>
<path d="M4 25c5-6 9 4 14-2 3-3 4-1 6-1" stroke="${b}"/></g>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${t.paper}"/><rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="${t.line}"/>${RULE(t.acc, t.brass, 2.2)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 48"><rect width="270" height="48" fill="${t.card}"/><rect x=".5" y=".5" width="269" height="47" fill="none" stroke="${t.line}"/><g transform="translate(9,8)">${RULE(t.acc, t.brass, 2.2)}</g><text x="52" y="27" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${t.ink}">레스토라럭스</text><text x="52" y="39" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3.5" fill="${t.brass}">RESTORALUXE</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<rect x="56" y="56" width="1088" height="518" fill="${t.card}" stroke="${t.line}"/>
<rect x="76" y="76" width="1048" height="478" fill="none" stroke="${t.line}" opacity=".6"/>
<g transform="translate(104,110) scale(3.0)">${RULE(t.acc, t.brass, 2.2)}</g>
<text x="104" y="326" font-family="system-ui,sans-serif" font-size="50" font-weight="700" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="104" y="388" font-family="system-ui,sans-serif" font-size="27" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="104" y="434" font-family="ui-monospace,monospace" font-size="21" fill="${t.brass}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="104" y="468" width="430" height="68" fill="none" stroke="${t.brass}" stroke-width="2"/>
<text x="136" y="498" font-family="ui-monospace,monospace" font-size="14" letter-spacing="5" fill="${t.brass}">${cfg.telLabel}</text>
<text x="136" y="528" font-family="ui-monospace,monospace" font-size="26" font-weight="700" fill="${t.ink}">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'luxe.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'luxe.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const RULEMARK = (t = THEME) => `<svg class="lmk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${RULE(t.acc, t.brass, 2.2)}</svg>`;
