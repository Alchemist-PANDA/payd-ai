<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payd.ai — Upgraded Master Plan v2</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #070707;
    --bg2: #101010;
    --bg3: #171717;
    --border: #252525;
    --border2: #303030;
    --text: #e6e4dc;
    --text2: #848480;
    --text3: #515150;
    --orange: #FF4D00;
    --orange2: #ff7040;
    --gold: #D4920A;
    --teal: #00A67E;
    --red: #E83030;
    --blue: #3A7FCC;
    --purple: #7C4DDE;
    --killed: #3a1010;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.7; -webkit-font-smoothing: antialiased; }
  .doc { max-width: 920px; margin: 0 auto; padding: 0 32px 140px; }

  /* HEADER */
  .header { border-bottom: 1px solid var(--border); padding: 56px 0 44px; margin-bottom: 64px; }
  .v-badge { display:inline-flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--red); border:1px solid var(--red); padding:4px 10px; border-radius:3px; margin-bottom:20px; }
  .v-badge::before { content:''; width:7px; height:7px; background:var(--red); border-radius:50%; }
  h1.main { font-family:'Syne',sans-serif; font-size:clamp(44px,8vw,80px); font-weight:800; line-height:0.95; letter-spacing:-0.03em; color:#fff; margin-bottom:8px; }
  h1.main span { color:var(--orange); }
  .header-version { font-family:'DM Mono',monospace; font-size:11px; color:var(--text3); letter-spacing:0.1em; text-transform:uppercase; margin-top:4px; }
  .header-sub { font-size:17px; font-weight:300; color:var(--text2); max-width:580px; margin-top:18px; line-height:1.55; }
  .header-meta { display:flex; flex-wrap:wrap; gap:24px; margin-top:28px; font-family:'DM Mono',monospace; font-size:11px; color:var(--text3); letter-spacing:0.08em; text-transform:uppercase; }
  .header-meta span { color:var(--text2); }

  /* SECTION */
  .section { margin-bottom:72px; }
  .sec-num { font-family:'DM Mono',monospace; font-size:11px; color:var(--orange); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px; }
  .section h2 { font-family:'Syne',sans-serif; font-size:clamp(26px,4vw,40px); font-weight:700; line-height:1.1; letter-spacing:-0.02em; color:#fff; margin-bottom:24px; }
  .section h3 { font-family:'Syne',sans-serif; font-size:19px; font-weight:600; color:#fff; margin:32px 0 10px; }
  .section p { color:var(--text2); margin-bottom:14px; max-width:700px; }
  .section p strong { color:var(--text); font-weight:500; }
  hr.divider { border:none; border-top:1px solid var(--border); margin:56px 0; }

  /* CALLOUTS */
  .box { padding:18px 22px; margin:20px 0; border-radius:0 6px 6px 0; }
  .box p { margin:0; max-width:100%; }
  .box-orange { border-left:3px solid var(--orange); background:#0f0700; }
  .box-orange p { color:var(--text); } .box-orange strong { color:var(--orange); }
  .box-teal { border-left:3px solid var(--teal); background:#061210; }
  .box-teal p { color:var(--text); } .box-teal strong { color:var(--teal); }
  .box-red { border-left:3px solid var(--red); background:#0f0505; }
  .box-red p { color:var(--text); } .box-red strong { color:var(--red); }
  .box-gold { border-left:3px solid var(--gold); background:#0a0800; }
  .box-gold p { color:var(--text); } .box-gold strong { color:var(--gold); }

  /* AUDIT TABLE */
  .audit-row { display:grid; grid-template-columns:140px 1fr; gap:0; border-bottom:1px solid var(--border); }
  .audit-row:last-child { border-bottom:none; }
  .audit-label { padding:14px 16px 14px 0; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text3); border-right:1px solid var(--border); }
  .audit-content { padding:14px 0 14px 16px; font-size:14px; color:var(--text2); }
  .audit-content strong { color:var(--text); }
  .status-strong { color:var(--teal); font-weight:500; }
  .status-weak { color:var(--red); font-weight:500; }
  .status-kill { text-decoration:line-through; color:var(--text3); }

  /* STAT GRID */
  .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:8px; overflow:hidden; margin:28px 0; }
  .stat { background:var(--bg2); padding:20px 18px; }
  .stat-val { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; line-height:1; margin-bottom:5px; }
  .sv-orange { color:var(--orange); } .sv-teal { color:var(--teal); } .sv-gold { color:var(--gold); } .sv-red { color:var(--red); }
  .stat-lbl { font-size:11px; color:var(--text3); letter-spacing:0.07em; text-transform:uppercase; font-family:'DM Mono',monospace; }

  /* FEATURE CARDS */
  .fc { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:22px; margin-bottom:14px; }
  .fc.keep { border-color:#1a2e10; }
  .fc.modify { border-color:#1a1800; }
  .fc.kill { border-color:var(--killed); opacity:0.6; }
  .fc.new { border-color:#0a1e2a; }
  .fc.diff { border-color:var(--teal); }
  .tag { display:inline-block; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; padding:3px 8px; border-radius:3px; margin-bottom:10px; }
  .t-keep { background:#0e1e08; color:#4CAF50; border:1px solid #1e3610; }
  .t-modify { background:#1a1800; color:var(--gold); border:1px solid #3a3000; }
  .t-kill { background:var(--killed); color:var(--red); border:1px solid #5a1818; }
  .t-new { background:#081420; color:var(--blue); border:1px solid #102840; }
  .t-diff { background:#061412; color:var(--teal); border:1px solid #0a2820; }
  .t-delay { background:#1a0a28; color:var(--purple); border:1px solid #2e1050; }
  .fc h4 { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#fff; margin-bottom:6px; }
  .fc p { font-size:14px; color:var(--text2); margin-bottom:10px; max-width:100%; }
  .fc-meta { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:10px; padding-top:14px; border-top:1px solid var(--border); }
  .fm-key { font-family:'DM Mono',monospace; font-size:10px; color:var(--text3); letter-spacing:0.07em; text-transform:uppercase; margin-bottom:2px; }
  .fm-val { font-size:13px; color:var(--text); font-weight:500; }
  .fm-val.easy { color:var(--teal); } .fm-val.med { color:var(--gold); } .fm-val.hard { color:var(--red); }

  /* COMPETITOR TABLE */
  table { width:100%; border-collapse:collapse; margin:22px 0; font-size:13px; }
  th { text-align:left; padding:9px 12px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); border-bottom:1px solid var(--border); font-weight:400; }
  td { padding:11px 12px; color:var(--text2); border-bottom:1px solid var(--border); vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  td:first-child { color:var(--text); font-weight:500; }
  td.g { color:var(--teal); }
  td.r { color:var(--red); }
  td.y { color:var(--gold); }
  tr.us-row td { background:#0a0f06; }
  tr.us-row td:first-child { color:var(--orange); }

  /* TIMELINE */
  .timeline { position:relative; margin:28px 0; }
  .timeline::before { content:''; position:absolute; left:14px; top:0; bottom:0; width:1px; background:var(--border); }
  .tl-item { padding-left:44px; padding-bottom:28px; position:relative; }
  .tl-dot { position:absolute; left:8px; top:5px; width:13px; height:13px; border-radius:50%; background:var(--bg); border:2px solid var(--orange); }
  .tl-dot.grey { border-color:var(--border2); }
  .tl-week { font-family:'DM Mono',monospace; font-size:11px; color:var(--orange); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:3px; }
  .tl-week.grey { color:var(--text3); }
  .tl-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#fff; margin-bottom:6px; }
  .tl-desc { font-size:13px; color:var(--text2); margin-bottom:8px; max-width:600px; }
  .tl-pills { display:flex; flex-wrap:wrap; gap:5px; }
  .tp { font-size:11px; background:var(--bg3); border:1px solid var(--border); color:var(--text2); padding:3px 9px; border-radius:100px; }
  .tp.danger { border-color:#3a1010; color:var(--red); background:#0f0505; }
  .tp.gate { border-color:#1a2e10; color:var(--teal); background:#061008; }

  /* PRICING */
  .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:8px; overflow:hidden; margin:28px 0; }
  @media(max-width:620px){.pricing-grid{grid-template-columns:1fr;}}
  .tier { background:var(--bg2); padding:26px 22px; }
  .tier.hero { background:#0d0900; border-top:2px solid var(--orange); }
  .tier-name { font-family:'DM Mono',monospace; font-size:10px; color:var(--text3); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:10px; }
  .tier-price { font-family:'Syne',sans-serif; font-size:38px; font-weight:800; color:#fff; line-height:1; }
  .tier-price span { font-size:14px; font-weight:400; color:var(--text3); }
  .tier-note { font-size:12px; color:var(--text3); margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border); }
  .tier ul { list-style:none; }
  .tier li { font-size:13px; color:var(--text2); padding:4px 0; display:flex; gap:7px; }
  .tier li::before { content:'✓'; color:var(--teal); font-size:11px; margin-top:3px; flex-shrink:0; }
  .tier li.locked::before { content:'—'; color:var(--text3); }
  .tier li.locked { opacity:0.5; }

  /* DIVISION */
  .div-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:24px 0; }
  @media(max-width:600px){.div-grid{grid-template-columns:1fr;}}
  .div-card { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:20px; }
  .div-card.full { grid-column:1/-1; }
  .div-head { display:flex; gap:10px; align-items:center; margin-bottom:14px; }
  .div-letter { width:32px; height:32px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:14px; font-weight:800; flex-shrink:0; }
  .dla { background:#2a1200; color:var(--orange); }
  .dlb { background:#061412; color:var(--teal); }
  .dlc { background:#080f1a; color:var(--blue); }
  .dld { background:#120820; color:var(--purple); }
  .dle { background:#0f0a00; color:var(--gold); }
  .div-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff; }
  .div-role { font-size:12px; color:var(--text3); }
  .div-card ul { list-style:none; }
  .div-card li { font-size:13px; color:var(--text2); padding:5px 0; border-bottom:1px solid var(--border); display:flex; gap:6px; }
  .div-card li:last-child { border-bottom:none; }
  .div-card li::before { content:'→'; color:var(--text3); flex-shrink:0; }
  .div-card li.warn { color:var(--gold); }
  .div-card li.warn::before { content:'⚠'; }

  /* VERDICT */
  .verdict { background:#0c0700; border:1px solid var(--orange); border-radius:8px; padding:36px; margin-top:40px; }
  .verdict-lbl { font-family:'DM Mono',monospace; font-size:11px; color:var(--orange); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:14px; }
  .verdict h3 { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#fff; margin-bottom:14px; }
  .verdict p { color:var(--text2); max-width:740px; margin-bottom:12px; }

  /* TOC */
  .toc { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:24px; margin-bottom:56px; }
  .toc-title { font-family:'DM Mono',monospace; font-size:10px; color:var(--text3); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:14px; }
  .toc-list { display:grid; grid-template-columns:1fr 1fr; gap:2px; list-style:none; }
  @media(max-width:480px){.toc-list{grid-template-columns:1fr;}}
  .toc-list li a { display:flex; gap:8px; font-size:13px; color:var(--text2); text-decoration:none; padding:4px 0; transition:color 0.1s; }
  .toc-list li a:hover { color:var(--orange); }
  .toc-n { font-family:'DM Mono',monospace; color:var(--text3); font-size:11px; min-width:22px; }

  /* ARCH */
  .arch-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:20px 0; }
  @media(max-width:580px){.arch-grid{grid-template-columns:1fr;}}
  .arch-card { background:var(--bg2); border:1px solid var(--border); border-radius:7px; padding:18px; }
  .arch-title { font-family:'DM Mono',monospace; font-size:10px; color:var(--text3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px; }
  .arch-card ul { list-style:none; }
  .arch-card li { font-size:12px; color:var(--text2); padding:4px 0; border-bottom:1px solid var(--border); }
  .arch-card li:last-child { border-bottom:none; }
  code { font-family:'DM Mono',monospace; font-size:11px; background:var(--bg3); color:var(--orange2); padding:1px 5px; border-radius:3px; }

  /* ICP */
  .icp-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin:22px 0; }
  @media(max-width:600px){.icp-grid{grid-template-columns:1fr;}}
  .icp { border:1px solid var(--border); border-radius:8px; padding:18px; }
  .icp.p1 { border-color:var(--orange); background:#0a0600; }
  .icp.p2 { background:var(--bg2); }
  .icp.p3 { background:var(--bg2); opacity:0.7; }
  .icp-badge { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px; }
  .icp.p1 .icp-badge { color:var(--orange); }
  .icp.p2 .icp-badge, .icp.p3 .icp-badge { color:var(--text3); }
  .icp h4 { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff; margin-bottom:6px; }
  .icp p { font-size:12px; color:var(--text3); margin:0; max-width:100%; }

  /* RISK */
  .risk-row { display:grid; grid-template-columns:90px 1fr 1fr; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); align-items:start; }
  .risk-row:last-child { border-bottom:none; }
  .risk-lv { font-family:'DM Mono',monospace; font-size:10px; padding:3px 7px; border-radius:3px; letter-spacing:0.07em; text-transform:uppercase; white-space:nowrap; }
  .rv-h { background:#220a0a; color:var(--red); border:1px solid #4a1010; }
  .rv-m { background:#160f00; color:var(--gold); border:1px solid #362400; }
  .rv-l { background:#071210; color:var(--teal); border:1px solid #0a2018; }
  .risk-name { font-size:13px; color:var(--text); font-weight:500; }
  .risk-name small { display:block; font-size:11px; color:var(--text3); font-weight:400; margin-top:2px; }
  .risk-mit { font-size:13px; color:var(--text3); }

  /* GTM STEPS */
  .step-list { list-style:none; counter-reset:step; margin:16px 0; }
  .step-list li { counter-increment:step; display:flex; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); }
  .step-list li:last-child { border-bottom:none; }
  .step-num { width:28px; height:28px; border-radius:50%; background:var(--bg3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:11px; color:var(--orange); flex-shrink:0; margin-top:1px; }
  .step-body { font-size:14px; color:var(--text2); }
  .step-body strong { color:var(--text); }

  /* REVENUE TABLE */
  tr.featured-r td { background:#0a0c06; }
  td.good { color:var(--teal); font-weight:500; }
  td.warn-val { color:var(--gold); }
</style>
</head>
<body>
<div class="doc">

  <!-- ── HEADER ── -->
  <header class="header">
    <div class="v-badge">Upgraded Plan — Version 3.0 — Legally Hardened · Architecture Revised</div>
    <h1 class="main"><span>Payd</span>.ai</h1>
    <div class="header-version">Revised Master Product Plan · Brutally Audited · Commercially Upgraded · v3 Additions Applied</div>
    <p class="header-sub">The AR collection system built specifically for agencies and service businesses. Not another reminder tool. A promise-tracking, client-scoring, cash-recovery engine.</p>
    <div class="header-meta">
      Stage <span>Pre-Build</span> &nbsp;·&nbsp; Version <span>v2.0</span> &nbsp;·&nbsp; Timeline <span>12 Weeks to Launch</span> &nbsp;·&nbsp; Floor Price <span>$99/mo</span> &nbsp;·&nbsp; ARR Target <span>$1M @ Month 20</span>
    </div>
  </header>

  <!-- TOC -->
  <nav class="toc">
    <div class="toc-title">Contents</div>
    <ul class="toc-list">
      <li><a href="#s1"><span class="toc-n">01</span> Brutal Audit of v1</a></li>
      <li><a href="#s2"><span class="toc-n">02</span> Competitive Landscape (missing from v1)</a></li>
      <li><a href="#s3"><span class="toc-n">03</span> Stronger Positioning</a></li>
      <li><a href="#s4"><span class="toc-n">04</span> Revised ICP</a></li>
      <li><a href="#s5"><span class="toc-n">05</span> Best Differentiator</a></li>
      <li><a href="#s6"><span class="toc-n">06</span> Revised MVP — Feature by Feature</a></li>
      <li><a href="#s6b"><span class="toc-n">06B</span> v3 Additions — Legal, Email, Shadow Mode, Currency</a></li>
      <li><a href="#s7"><span class="toc-n">07</span> Revised Technical Architecture</a></li>
      <li><a href="#s8"><span class="toc-n">08</span> Revised Build Divisions</a></li>
      <li><a href="#s9"><span class="toc-n">09</span> Revised 12-Week Timeline</a></li>
      <li><a href="#s10"><span class="toc-n">10</span> Revised Pricing</a></li>
      <li><a href="#s11"><span class="toc-n">11</span> Revised GTM — First 5, then 50</a></li>
      <li><a href="#s12"><span class="toc-n">12</span> Revised Risk Register</a></li>
      <li><a href="#s13"><span class="toc-n">13</span> Blunt Verdict</a></li>
    </ul>
  </nav>

  <!-- ── S1: BRUTAL AUDIT ── -->
  <section class="section" id="s1">
    <div class="sec-num">01 / Brutal Audit</div>
    <h2>Everything wrong<br>with the v1 plan.</h2>
    <p>This is a section-by-section teardown. What the original plan got right, what it got dangerously wrong, and what it missed entirely. Read every word before looking at the revisions.</p>

    <div class="box box-red" style="margin-bottom:24px;">
      <p><strong>The single biggest failure of v1:</strong> It was written in a vacuum. There are at least 6 funded competitors already solving this problem. The original plan does not mention a single one. That is not strategic confidence — it is dangerous ignorance that will get you killed on launch day.</p>
    </div>

    <div class="audit-row"><div class="audit-label">Name</div><div class="audit-content"><span class="status-weak">Weak.</span> "Payd.ai" sounds like a consumer payments app, not a B2B SaaS tool. It competes phonetically with Venmo, Cash App, and Paypal in the mind. A B2B product that manages a firm's cash flow needs to convey authority. Keep it only if you plan to own the positioning hard. Otherwise reconsider.</div></div>
    <div class="audit-row"><div class="audit-label">Positioning</div><div class="audit-content"><span class="status-weak">Too soft.</span> "Without the awkwardness" is the language of a therapy app, not a business tool. B2B buyers in finance and ops need ROI language, not emotional comfort language. The positioning needs to be sharper, more specific, and harder-edged.</div></div>
    <div class="audit-row"><div class="audit-label">Competitors</div><div class="audit-content"><span class="status-weak">Missing entirely.</span> Chaser (UK, $80M+ raised), Kolleno (YC-backed), Upflow (YC-backed), YayPay (Highradius acquired), InvoiceSherpa (Xero-native), Paidnice (Xero marketplace). You cannot build a differentiated product without knowing what already exists. This section being absent is a critical plan failure.</div></div>
    <div class="audit-row"><div class="audit-label">$49 Tier</div><div class="audit-content"><span class="status-weak">Actively harmful.</span> Freelancers at $49/month have high churn (cancel when revenue dips), low upgrade rate, high support burden, and make you feel like a cheap tool to premium agency buyers. The price floor signals quality. Kill this tier. Start at $99.</div></div>
    <div class="audit-row"><div class="audit-label">Revenue Model</div><div class="audit-content"><span class="status-weak">Fantasy math.</span> Month 2 = 20 paying customers assumes simultaneous peak product AND peak GTM from a standing start. Real bootstrapped SaaS: Month 2 is typically 3–8 paying customers. The model also applies no churn. Real early-stage B2B monthly churn is 5–8%, not 4%. The $1M ARR timeline should be 20 months, not 18.</div></div>
    <div class="audit-row"><div class="audit-label">8-Week Timeline</div><div class="audit-content"><span class="status-weak">Dangerously optimistic.</span> Google Gmail API production approval alone takes 4–6 weeks and requires a security review. Xero OAuth production takes 2–4 weeks. You cannot launch in 8 weeks if your core features depend on APIs that take longer than 8 weeks to approve. The realistic timeline is 12–14 weeks.</div></div>
    <div class="audit-row"><div class="audit-label">5 Divisions</div><div class="audit-content"><span class="status-weak">Assumes 5 senior engineers.</span> Most early-stage SaaS is built by 1–3 people. The plan presents "5 parallel divisions" as if you have a Series A engineering team. The division architecture is conceptually right but practically unrealistic for most founders. Needs to be reprioritized for a lean team.</div></div>
    <div class="audit-row"><div class="audit-label">Integration Priority</div><div class="audit-content"><span class="status-weak">Wrong order.</span> Xero AND QuickBooks integrations in Weeks 1–4 is wrong. Integration APIs require approval cycles that take longer than the development itself. Start with CSV-only. Ship the product. Get paying customers. Then add Xero in month 2–3 as a customer-retention feature, not an acquisition feature.</div></div>
    <div class="audit-row"><div class="audit-label">ProductHunt</div><div class="audit-content"><span class="status-weak">Wrong channel for this ICP.</span> Agency ops managers and CFOs do not browse ProductHunt. Developers and early-adopter consumers do. ProductHunt will get you signups from people who will never pay $149/month for invoice automation. It is a vanity metric. Do not prioritize it.</div></div>
    <div class="audit-row"><div class="audit-label">GTM — First 5</div><div class="audit-content"><span class="status-weak">Missing entirely.</span> The plan jumps from "launch" to "20 paying customers" with no roadmap for acquiring the first 5. This is the hardest part of any SaaS launch and the plan skips it completely. You need a specific, manual, founder-led playbook for customers 1 through 10.</div></div>
    <div class="audit-row"><div class="audit-label">Multi-Contact</div><div class="audit-content"><span class="status-weak">Missing from MVP.</span> Real B2B invoice chasing requires contacting multiple people per account: the ops contact, the finance contact, and sometimes a director at Stage 5. One email-per-invoice is not how real agencies collect. This needs to be in MVP or you'll get churn from any serious user on day 1.</div></div>
    <div class="audit-row"><div class="audit-label">Partial Payments</div><div class="audit-content"><span class="status-weak">Killed too early.</span> "Invoice is either paid or unpaid" is dangerously simplistic. Any agency doing milestone billing (50% upfront, 50% on delivery) has partial payments as a core workflow. This is not edge-case complexity — it is table stakes for the primary ICP.</div></div>
    <div class="audit-row"><div class="audit-label">Activation</div><div class="audit-content"><span class="status-weak">Not addressed at all.</span> The #1 SaaS killer for tools like this is signup-to-activation failure. If a user uploads a CSV and does not take a second action within 48 hours, they are gone. The plan has no activation strategy, no onboarding hooks, no time-to-value design.</div></div>
    <div class="audit-row"><div class="audit-label">GDPR Risk</div><div class="audit-content"><span class="status-weak">Severely underrated.</span> When Payd.ai reads email replies, it is processing personal data of third parties (invoice recipients) who have not consented to having their emails analyzed by an AI system. In the UK and EU, this is a live GDPR exposure. The plan rates this as "Low." It is High.</div></div>
    <div class="audit-row"><div class="audit-label">LLM Cost Math</div><div class="audit-content"><span class="status-weak">5x wrong.</span> The plan calculates $60/month at 600 customers using Claude Haiku for all calls. But email drafting requires Sonnet, not Haiku. Correct estimate: ~$300–400/month at 600 customers. Still fine — but the error shows the cost model was not seriously thought through.</div></div>
    <div class="audit-row"><div class="audit-label">Promise Tracker</div><div class="audit-content"><span class="status-strong">Strong — but not finished.</span> The core concept is correct and genuinely differentiated. But the implementation stops too early. The promise tracker should compound into a Client Reliability Score over time. That score is the data moat. That is what makes the product defensible against well-funded competitors.</div></div>
    <div class="audit-row"><div class="audit-label">Action Queue UI</div><div class="audit-content"><span class="status-strong">Correct and strong.</span> The human-in-the-loop approval screen is the right call. It provides brand safety, drives daily active usage, and is the product's stickiest screen. Keep it exactly as designed.</div></div>
    <div class="audit-row"><div class="audit-label">Auto-Pause Brake</div><div class="audit-content"><span class="status-strong">Essential and correct.</span> Any reply = pause. No exceptions. This is both the trust mechanism and the legal protection layer. Keep it. Make it the loudest feature in marketing.</div></div>
    <div class="audit-row"><div class="audit-label">Kill List</div><div class="audit-content"><span class="status-strong">Mostly right.</span> AI voice calls, full accounting suite, and generic analytics dashboard — all correctly killed. The kill list logic is solid.</div></div>
  </section>

  <hr class="divider">

  <!-- ── S2: COMPETITIVE LANDSCAPE ── -->
  <section class="section" id="s2">
    <div class="sec-num">02 / Competitive Landscape</div>
    <h2>The competitors v1<br>pretended don't exist.</h2>
    <p>This market is not empty. There are well-funded players, Xero-native tools, and enterprise solutions already solving parts of this problem. You cannot win without knowing exactly where each one is weak — and being better there.</p>

    <table>
      <thead><tr><th>Product</th><th>Backing / Scale</th><th>Core Strength</th><th>Core Weakness</th><th>Our Angle</th></tr></thead>
      <tbody>
        <tr><td>Chaser</td><td>$80M+ raised, UK-founded</td><td class="g">Deep Xero/QB integration, robust sequences</td><td class="r">Generic, no AI intelligence, no promise tracking, feels like a 2015 SaaS</td><td class="y">Promise Tracker + Client Score = intelligence they don't have</td></tr>
        <tr><td>Kolleno</td><td>YC-backed, EU-focused</td><td class="g">AI-assisted workflows, enterprise AR</td><td class="r">Enterprise-priced, complex onboarding, not SME/agency-friendly</td><td class="y">SME-first, setup in 10 minutes, emotional tone design</td></tr>
        <tr><td>Upflow</td><td>YC-backed, $15M raised</td><td class="g">Clean UX, modern stack, analytics</td><td class="r">No AI reply parsing, no promise extraction, US-focused</td><td class="y">The promise/reply intelligence layer they're missing</td></tr>
        <tr><td>InvoiceSherpa</td><td>Small/bootstrapped</td><td class="g">Xero-native, affordable</td><td class="r">No AI, clunky UX, no promise tracking, essentially just a cron job</td><td class="y">Far superior product at similar price point</td></tr>
        <tr><td>Paidnice</td><td>NZ-based, Xero marketplace</td><td class="g">Late payment fees automation, Xero-native</td><td class="r">Narrow feature set, no reply intelligence, no collection workflow</td><td class="y">Full AR workflow vs single-feature tool</td></tr>
        <tr><td>Xero native</td><td>$2B+ platform</td><td class="g">Already embedded in workflow</td><td class="r">Reminder-only, no classification, no tone adaptation, no promise tracking</td><td class="y">Intelligence where Xero is deliberately dumb</td></tr>
        <tr class="us-row"><td>Payd.ai</td><td>You (building now)</td><td class="g">Promise Tracker + Client Score + AI intent classification + agency-specific UX</td><td class="r">No customers yet, no brand, no integration approvals</td><td class="y">Win on speed, positioning sharpness, and a data moat no one else has</td></tr>
      </tbody>
    </table>

    <div class="box box-orange">
      <p><strong>The gap to exploit:</strong> Every competitor does reminders. Zero competitors have Promise Tracking with automatic resume logic. Zero have a Client Reliability Score. The AI intelligence gap is real and exploitable — but only if you move fast and ship before the funded players copy you.</p>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S3: POSITIONING ── -->
  <section class="section" id="s3">
    <div class="sec-num">03 / Stronger Positioning</div>
    <h2>Stop selling comfort.<br>Sell cash.</h2>

    <div class="box box-red">
      <p><strong>Why v1 positioning fails:</strong> "Without the awkwardness" is the language of anxiety management. B2B buyers — agency owners, studio founders — are not buying an emotional experience. They are buying cash flow recovery. They are buying time back. They are buying a system that replaces 8 hours of dread-filled admin. Lead with the business outcome, not the feeling.</p>
    </div>

    <h3>Rejected Positioning (v1)</h3>
    <p style="text-decoration:line-through;opacity:0.5;">"Your silent collections officer — gets you paid faster, without the awkwardness."</p>
    <p>Problems: "Silent" is weak. "Collections officer" has consumer/consumer-debt associations. "Without the awkwardness" is soft. It doesn't land hard on a business outcome.</p>

    <h3>New Positioning</h3>
    <div class="box box-teal" style="margin:20px 0;">
      <p style="font-size:18px; line-height:1.5; font-family:'Syne',sans-serif; font-weight:600;"><strong>"Payd.ai recovers your outstanding cash — and builds a permanent record of which clients actually keep their word."</strong></p>
    </div>

    <p><strong>One-liner for sales:</strong> "The AR tool that tracks client promises and collects your money — so you don't have to."</p>
    <p><strong>Homepage headline:</strong> "Your clients owe you money. Payd.ai makes sure they pay it."</p>
    <p><strong>Investor one-liner:</strong> "Payd.ai is an AI-powered accounts receivable system for agencies and service businesses that reduces DSO by 8–14 days and builds a proprietary Client Reliability Score over time."</p>

    <h3>What Changed and Why</h3>
    <p>The new positioning does three things the old one doesn't: (1) It leads with a hard business outcome — "recovers cash." (2) It introduces the data moat concept — "permanent record of which clients keep their word" — which is the Client Reliability Score. (3) It creates mild anxiety in the buyer: if they don't have this system, they are losing money right now. That is the correct emotional trigger for a B2B SaaS sale.</p>
  </section>

  <hr class="divider">

  <!-- ── S4: ICP ── -->
  <section class="section" id="s4">
    <div class="sec-num">04 / Revised ICP</div>
    <h2>Narrower target.<br>Faster conversion.</h2>
    <div class="icp-grid">
      <div class="icp p1">
        <div class="icp-badge">★ Primary — Build for these</div>
        <h4>Digital & Creative Agencies</h4>
        <p>8–30 staff, $80K–$600K/month AR, project billing with net-30 terms, Xero or QB users. Founder-led but have an ops/account manager. Invoice sizes $3K–$75K. Deeply hate chasing. Will pay $249 without flinching.</p>
      </div>
      <div class="icp p2">
        <div class="icp-badge">Secondary — Upgrade path</div>
        <h4>Consultancies & Pro Services</h4>
        <p>Management consultants, lawyers, architects. Time-and-materials billing. Invoice sizes $10K–$250K. Already have an AR problem but think of it as "relationship management." Frame DSO reduction as working capital improvement.</p>
      </div>
      <div class="icp p3">
        <div class="icp-badge">Tertiary — Watch carefully</div>
        <h4>Accounting Firms (Resellers)</h4>
        <p>Firms managing AR for 5–20 clients. Each client is worth $249–$549. If 20 accounting firms each deploy for 10 clients = 200 customers fast. Long sales cycle but high LTV. Target in month 6+.</p>
      </div>
    </div>
    <div class="box box-gold" style="margin-top:20px;">
      <p><strong>Kill the freelancer ICP immediately.</strong> Freelancers cancel at first sign of a slow month. They require identical support burden to agency customers. They will never refer agency owners because they don't run in those circles. The $49 tier exists for freelancers and that tier should not exist. Serve agencies. Full stop.</p>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S5: DIFFERENTIATOR ── -->
  <section class="section" id="s5">
    <div class="sec-num">05 / Best Differentiator</div>
    <h2>Promise Tracker is real.<br>But it's not enough alone.</h2>

    <p>The Promise Tracker is genuinely differentiated — no funded competitor has it. But a single feature is not a moat. Features can be copied in a sprint. What you need is a <strong>compounding data flywheel</strong> that gets harder to replicate the longer a customer uses the product.</p>

    <h3>The Client Reliability Score (CRS) — Your Real Moat</h3>
    <p>Every client that passes through Payd.ai gets a running reliability profile built from real interaction data. This is not AI speculation — it is hard behavioral evidence that accumulates with every invoice.</p>

    <div class="box box-teal">
      <p><strong>The CRS is built from:</strong> payment history (on-time vs late vs very late), promise history (made vs kept vs broken), communication patterns (responsive vs silent vs evasive), and DSO trend (improving or worsening). It produces a score of 0–100 per client with a letter grade (A–F).</p>
    </div>

    <h3>Why the CRS is the real moat</h3>
    <p><strong>1. It makes the product self-reinforcing.</strong> Every interaction — every email sent, every reply classified, every promise tracked — makes the score more accurate. After 6 months, a customer's CRS data is irreplaceable. They cannot export it to Chaser. They cannot replicate it. Switching cost is real.</p>
    <p><strong>2. It changes behavior upstream.</strong> When an agency owner sees that Client X has a CRS of 31/100 (has broken 4 out of 5 payment promises), they will demand a deposit on the next project. This turns Payd.ai from a "collections tool" into a "client risk management platform." That is a category upgrade worth 3× the price.</p>
    <p><strong>3. It is publishable and shareable.</strong> "Your Q1 2025 Client Reliability Report" is a document an agency owner will share with their business coach, their accountant, and their partner. It is organic marketing that no competitor has.</p>
    <p><strong>4. At scale, it becomes industry benchmark data.</strong> "Your client pays 14 days slower than the average for marketing agencies in your region." That data is only possible when you have thousands of accounts — which means early movers get a permanent advantage.</p>

    <h3>Promise Tracker: How to Make It Harder</h3>
    <p>The Promise Tracker in v1 is the mechanism. The CRS is what it builds toward. Specific upgrades:</p>
    <div class="fc diff">
      <div><span class="tag t-diff">Upgrade</span></div>
      <h4>Broken Promise Escalation Alert</h4>
      <p>When a client breaks a promise (sequence auto-resumes), the owner receives a specific alert: "Client X made a payment promise for 14 April and did not pay. This is their 2nd broken promise in 3 months. Their CRS has dropped from 58 to 44. Recommended action: require 50% deposit on next project." This converts a technical event into a strategic business recommendation.</p>
    </div>
    <div class="fc diff">
      <div><span class="tag t-diff">Upgrade</span></div>
      <h4>The Promise Timeline (Client View)</h4>
      <p>Every client profile shows a visual timeline of every promise made and whether it was kept or broken. This is the "receipts" feature — if a client ever disputes being chased aggressively, the owner can open Payd.ai and show them a documented history of 5 broken promises. This moves the product from automation into evidence management.</p>
    </div>
    <div class="fc diff">
      <div><span class="tag t-diff">Upgrade</span></div>
      <h4>CRS in Email Drafting Context</h4>
      <p>When the AI drafts Stage 4 and Stage 5 emails, it reads the client's CRS first. If CRS is below 40, the draft is firmer, references the previous broken promises by date, and signals escalation. If CRS is above 70, it stays conciliatory. The tone engine is not just "stage-based" — it is "stage + client history"-based. That is 2× smarter than any competitor.</p>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S6: REVISED MVP ── -->
  <section class="section" id="s6">
    <div class="sec-num">06 / Revised MVP</div>
    <h2>Every feature audited.<br>No passengers.</h2>

    <h3>KEEP — Core Product</h3>

    <div class="fc keep">
      <div><span class="tag t-keep">Keep — Painkiller</span></div>
      <h4>Invoice Ingestion via CSV (Day 1 only)</h4>
      <p>CSV upload is MVP. Xero/QB integrations are delayed to Week 10+. Why: API approvals take longer than development. Shipping on CSV-only keeps the launch timeline under control. If your core product works, users will connect their accounting software. If it doesn't work, the integration won't save you.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Drives</div><div class="fm-val">Activation</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val easy">Low</div></div>
        <div><div class="fm-key">Type</div><div class="fm-val">Deterministic</div></div>
        <div><div class="fm-key">Sell/Retain/Activate</div><div class="fm-val">Activate</div></div>
      </div>
    </div>

    <div class="fc keep">
      <div><span class="tag t-keep">Keep — Core Engine</span></div>
      <h4>Multi-Stage Reminder Sequence (6 Stages, Rule-Based Timing)</h4>
      <p>Day 0, +3, +7, +14, +30, +45. Timing is deterministic. Email body is AI-generated. Tone escalates per stage. This is the engine — without it, nothing else matters. Must be rock-solid before any AI features ship.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Drives</div><div class="fm-val">Core value</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val easy">Low-Medium</div></div>
        <div><div class="fm-key">Type</div><div class="fm-val">Hybrid</div></div>
        <div><div class="fm-key">Sell/Retain/Activate</div><div class="fm-val">Retain</div></div>
      </div>
    </div>

    <div class="fc keep">
      <div><span class="tag t-keep">Keep — The Magic Moment</span></div>
      <h4>Intent Parser &amp; Reply Classifier</h4>
      <p>Intent categories: Promise-to-Pay, Dispute, Info-Request, Out-of-Office, Unrelated/Ghost. Confidence threshold: if below 0.72, escalate to human queue — never guess on an ambiguous reply. This is the feature that justifies the word "AI" in every piece of marketing copy.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Drives</div><div class="fm-val">Core differentiation</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val med">Medium</div></div>
        <div><div class="fm-key">Type</div><div class="fm-val">AI (LLM)</div></div>
        <div><div class="fm-key">Sell/Retain/Activate</div><div class="fm-val">Sell + Retain</div></div>
      </div>
    </div>

    <div class="fc keep">
      <div><span class="tag t-keep">Keep — The Differentiator</span></div>
      <h4>Promise Tracker + Client Reliability Score (CRS)</h4>
      <p>Promise extraction from email body → auto-pause → resume if broken. CRS calculated from cumulative promise history + payment history. Starts building from invoice 1. This is the data moat. Every customer interaction makes it harder to leave.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Drives</div><div class="fm-val">Retention + moat</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val med">Medium</div></div>
        <div><div class="fm-key">Type</div><div class="fm-val">Hybrid</div></div>
        <div><div class="fm-key">Sell/Retain/Activate</div><div class="fm-val">Sell + Retain</div></div>
      </div>
    </div>

    <div class="fc keep">
      <div><span class="tag t-keep">Keep — Daily Driver</span></div>
      <h4>Action Queue (Approve / Edit / Skip)</h4>
      <p>Every pending email staged here before sending. This is the daily active screen. If users open this every morning, you win retention. Design it beautifully. Make it fast. "Send All Approved" in one click.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Drives</div><div class="fm-val">Daily active use</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val easy">Low</div></div>
        <div><div class="fm-key">Type</div><div class="fm-val">Deterministic</div></div>
        <div><div class="fm-key">Sell/Retain/Activate</div><div class="fm-val">Retain</div></div>
      </div>
    </div>

    <h3 style="margin-top:40px;">MODIFIED — Needs Upgrading</h3>

    <div class="fc modify">
      <div><span class="tag t-modify">Modified</span></div>
      <h4>Multi-Contact Per Invoice (Upgraded from "one email per invoice")</h4>
      <p><strong>v1 assumed one contact per invoice. That is wrong for B2B.</strong> Real agencies bill companies, not individuals. Invoice for $30K to a 50-person agency goes to the ops manager, but at Stage 4+ it needs to CC the CFO or Managing Director. Add multi-contact support to the customer record: Primary Contact, Finance Contact, Escalation Contact. Stage 4+ auto-CC the Escalation Contact. This feature alone prevents churn from power users.</p>
      <div class="fc-meta">
        <div><div class="fm-key">v1 Status</div><div class="fm-val">Missing</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val easy">Low</div></div>
        <div><div class="fm-key">Why MVP</div><div class="fm-val">Churn prevention</div></div>
      </div>
    </div>

    <div class="fc modify">
      <div><span class="tag t-modify">Modified</span></div>
      <h4>Partial Payment Support (Upgraded from "invoice is paid or unpaid")</h4>
      <p><strong>v1 killed this. That was wrong.</strong> At least 30% of your primary ICP (agencies doing milestone billing) will immediately hit a wall with binary paid/unpaid status. $50K project = $25K milestone 1 + $25K milestone 2. The invoice is partially paid — neither "paid" nor "unpaid." Add a "partial payment" status with a remaining balance field. This is 1 day of schema work and prevents a wave of early churn.</p>
      <div class="fc-meta">
        <div><div class="fm-key">v1 Status</div><div class="fm-val">Killed (wrongly)</div></div>
        <div><div class="fm-key">Complexity</div><div class="fm-val easy">Low</div></div>
        <div><div class="fm-key">Why MVP</div><div class="fm-val">ICP table stakes</div></div>
      </div>
    </div>

    <h3 style="margin-top:40px;">DELAY — Phase 2</h3>

    <div class="fc phase2" style="border-color:#1a1a2a; opacity:0.8;">
      <div><span class="tag t-delay">Delayed to Week 10+</span></div>
      <h4>Xero Integration</h4>
      <p>Do not build this in parallel with core product. Build it after you have 10+ paying CSV customers. The Xero integration is a retention upgrade, not an acquisition driver. Start the Xero approval process in Week 1 (it takes time), but do not let it block the launch.</p>
    </div>

    <div class="fc phase2" style="border-color:#1a1a2a; opacity:0.8;">
      <div><span class="tag t-delay">Phase 2 — Month 4+</span></div>
      <h4>QuickBooks Integration / SMS Pivot / Payment Links / DSO Analytics</h4>
      <p>These are all correct Phase 2 features. Ship them after you have validated the core. The only change: apply for QB integration in parallel with Xero (it takes 6–8 weeks for approval), so by the time you're ready to build it, the paperwork is done.</p>
    </div>

    <h3 style="margin-top:40px;">KILL — Cut Entirely</h3>

    <div class="fc kill">
      <div><span class="tag t-kill">Killed</span></div>
      <h4>$49 Starter Tier</h4>
      <p>It signals "cheap tool." It attracts price-sensitive buyers who churn fastest. It undermines premium positioning. The cost of supporting a $49/month customer is identical to a $249/month customer. Kill it. Your floor is $99.</p>
    </div>
    <div class="fc kill">
      <div><span class="tag t-kill">Killed</span></div>
      <h4>ProductHunt as Launch Strategy</h4>
      <p>Wrong channel. Wrong audience. Agency finance managers do not live on ProductHunt. The time investment in a ProductHunt campaign is better spent on 20 direct outreach calls to agency owners. Kill it as a priority. If someone submits you organically, fine — but do not plan around it.</p>
    </div>
    <div class="fc kill">
      <div><span class="tag t-kill">Killed (Already in v1, confirm kill)</span></div>
      <h4>AI Voice Calls / Legal Escalation Automation / Generic Analytics Dashboard</h4>
      <p>v1 killed these correctly. Confirming. Do not revisit any of these in the next 18 months.</p>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S6B: v3 ADDITIONS ── -->
  <section class="section" id="s6b">
    <div class="sec-num">06B / v3 Critical Additions</div>
    <h2>Four things that were<br>missing. Now they're not.</h2>

    <p>These additions were agreed after pressure-testing the v2 plan. Each one closes a real risk — legal, technical, trust, or financial. None of them are nice-to-haves. All four must be present at launch.</p>

    <div class="box box-red" style="margin-bottom:32px;">
      <p><strong>The one-sentence summary of all four:</strong> Payd.ai is a user-controlled AR workflow system for agencies that sends from the user's real mailbox, starts new accounts in Shadow Mode, handles multi-currency invoices correctly, uses Promise Tracker + CRS as the moat, and saves network intelligence for a later legally-safe phase.</p>
    </div>

    <!-- 1. LEGAL REFRAMING -->
    <h3>1. Legal Reframing — What Payd.ai Is (And Is Not)</h3>
    <p>This is not a cosmetic change. This is a product classification decision that affects your legal exposure, your enterprise sales motion, and how regulators in the US, UK, and EU interpret what you have built.</p>

    <div class="fc new">
      <div><span class="tag t-new">New — Critical</span></div>
      <h4>Payd.ai Is a Communications Workflow Platform</h4>
      <p>It is <strong>not a debt collection agency</strong>. Debt collection is a regulated activity in every major jurisdiction. In the US, the FDCPA governs third-party collectors. In the UK, the FCA regulates consumer credit and collections. In the EU, national implementations vary. None of these apply to a software tool that helps a business send its own communications from its own mailbox — <em>provided the product is architected accordingly</em>.</p>
      <div class="box box-gold" style="margin-top:14px;">
        <p><strong>The six rules that keep Payd.ai outside the regulatory perimeter:</strong><br><br>
        (1) The <strong>user remains the sender</strong> at all times — emails originate from their mailbox, their identity, their domain.<br>
        (2) The <strong>user remains the decision-maker</strong> — the AI drafts and suggests, it does not act autonomously in the sending path.<br>
        (3) <strong>No legal threats or coercive language</strong> is ever auto-generated by the AI. Phrases like "legal action will be taken" must require manual human input.<br>
        (4) <strong>Disputes always trigger manual review</strong> — the system must never auto-respond to a classified dispute without a human approving the reply.<br>
        (5) <strong>No impersonation of legal process</strong> — nothing that looks like a solicitor's letter, statutory demand, or court filing is ever generated.<br>
        (6) <strong>Jurisdiction-sensitive automation requires extra legal review</strong> before enabling — what is permitted in the UK is not always permitted in the US or Germany.</p>
      </div>
      <p style="margin-top:12px;">Add this language explicitly to your ToS, your onboarding, and your privacy policy. Get a lawyer who knows SaaS and fintech to review the data processing flow — specifically the fact that you are reading email replies from third parties (invoice recipients) who have no direct relationship with Payd.ai. This is where GDPR Article 6(1)(f) legitimate interest applies — but it must be documented, not assumed.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Risk if ignored</div><div class="fm-val hard">Regulatory shutdown</div></div>
        <div><div class="fm-key">When to action</div><div class="fm-val">Week 1 — before any production data</div></div>
        <div><div class="fm-key">Who does it</div><div class="fm-val">Founder + SaaS/fintech lawyer</div></div>
      </div>
    </div>

    <!-- 2. REAL MAILBOX SENDING -->
    <h3>2. Email Architecture — Send From the User's Real Mailbox</h3>
    <p>The v2 plan defaulted to managed subdomain sending (e.g. <code>hello@payd-mail.io</code>). That is the wrong architecture. It makes the product feel like a bot sender, breaks thread continuity, and reduces the credibility of every single email the user's clients receive.</p>

    <div class="fc new">
      <div><span class="tag t-new">New — Architecture Change</span></div>
      <h4>Primary Send Path: Google Workspace OAuth + Microsoft 365 OAuth</h4>
      <p>Emails go from the user's <strong>real mailbox</strong> — their actual Gmail or Outlook account. This means:</p>
      <ul style="list-style:none;margin:12px 0;">
        <li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--teal);flex-shrink:0;">→</span> Emails appear in the user's real Sent folder. Auditable. Professional. Natural.</li>
        <li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--teal);flex-shrink:0;">→</span> Thread continuity is maintained — the client replies to the same email chain they always use with the agency.</li>
        <li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--teal);flex-shrink:0;">→</span> The client sees it as a normal email from the founder or account manager — not from an automation platform.</li>
        <li style="padding:7px 0;font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--teal);flex-shrink:0;">→</span> Deliverability is the user's own inbox reputation — not a shared sending pool that one bad actor can poison for everyone.</li>
      </ul>
      <div class="fc-meta">
        <div><div class="fm-key">Primary path</div><div class="fm-val">Google OAuth + M365 OAuth</div></div>
        <div><div class="fm-key">Why it wins</div><div class="fm-val">Trust, threading, deliverability</div></div>
        <div><div class="fm-key">OAuth approval</div><div class="fm-val warn-val">Apply Google Day 1 — 6–10 week review</div></div>
      </div>
    </div>

    <div class="fc modify" style="margin-top:14px;">
      <div><span class="tag t-modify">Fallback Only</span></div>
      <h4>Fallback Send Path: Managed Subdomain Sending</h4>
      <p>Only activate this if direct OAuth mailbox sending is unavailable for a specific user (e.g. corporate IT restrictions, non-Gmail/Outlook providers). <strong>Treat this as the exception, not the default.</strong> When fallback is active, surface a clear UI warning to the user and recommend switching to OAuth. Never market the fallback path as a feature.</p>
      <div class="fc-meta">
        <div><div class="fm-key">Status</div><div class="fm-val">Fallback only — never default</div></div>
        <div><div class="fm-key">Risk if defaulted</div><div class="fm-val hard">Bot-feel, broken trust, pool risk</div></div>
      </div>
    </div>

    <!-- 3. SHADOW MODE -->
    <h3>3. Shadow Mode — Human Approval Before Autonomy Is Earned</h3>
    <p>The fastest way to destroy a new customer relationship is to send an incorrect or tone-deaf AI-drafted email at Stage 4 on Day 2 of their account. Shadow Mode prevents this. It is also the most powerful trust-building mechanism in the onboarding flow.</p>

    <div class="fc new">
      <div><span class="tag t-new">New — Onboarding Safeguard</span></div>
      <h4>Shadow Mode: AI Drafts. Human Approves. Nothing Else.</h4>
      <p><strong>What Shadow Mode means:</strong> All AI-drafted emails are queued in the Action Queue for human approval. Nothing sends automatically. The user reviews, edits if needed, and explicitly approves each send. The AI is a drafting assistant — not an autonomous agent.</p>

      <div class="box box-teal" style="margin:14px 0;">
        <p><strong>Shadow Mode is mandatory for:</strong> the first <strong>14 calendar days</strong> OR the first <strong>20 approved sends</strong> — whichever comes later. Only after both thresholds are crossed does the system offer to unlock higher automation. The user must explicitly opt in. Automation is never switched on silently.</p>
      </div>

      <p><strong>These categories stay in manual approval permanently — regardless of account age or automation tier:</strong></p>
      <ul style="list-style:none;margin:12px 0;">
        <li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--red);flex-shrink:0;">⚠</span> Replies classified as <strong>Dispute</strong> — always requires human decision before any follow-up</li>
        <li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--red);flex-shrink:0;">⚠</span> Any reply below the <strong>0.72 confidence threshold</strong> — classifier uncertainty = mandatory human review, no exceptions</li>
        <li style="padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--red);flex-shrink:0;">⚠</span> <strong>Broken-promise escalations</strong> — a client who missed a committed payment date needs a considered response, not an automated one</li>
        <li style="padding:7px 0;font-size:14px;color:var(--text2);display:flex;gap:8px;"><span style="color:var(--red);flex-shrink:0;">⚠</span> <strong>High-value invoices</strong> (define per-account, default $10K+) — the financial stakes are too high to delegate to automation</li>
      </ul>

      <div class="fc-meta">
        <div><div class="fm-key">Minimum duration</div><div class="fm-val">14 days + 20 sends</div></div>
        <div><div class="fm-key">Auto-unlock?</div><div class="fm-val hard">Never — explicit opt-in only</div></div>
        <div><div class="fm-key">What it prevents</div><div class="fm-val">Wrong emails, legal disputes, churn at Day 5</div></div>
      </div>
    </div>

    <div class="box box-orange" style="margin-top:14px;">
      <p><strong>Shadow Mode is also your best sales tool.</strong> When a prospect asks "but what if it sends something wrong?" — your answer is: "For the first two weeks, it never sends anything without your approval. You see every draft before it goes. You build confidence in the AI before you delegate to it." That removes the single biggest objection to AI-powered outreach tools in a single sentence.</p>
    </div>

    <!-- 4. CURRENCY-AWARE SCHEMA -->
    <h3>4. Currency-Aware Schema — Multi-Currency Correct From Day One</h3>
    <p>If your primary ICP is digital agencies, you will encounter multi-currency invoices within the first 10 customers. A UK agency billing a US client in USD. A Dubai studio billing in AED and EUR. The MVP does not need a full FX or treasury system — but the <em>data schema</em> must be correct from the start. Retrofitting currency support into a single-currency schema is expensive, error-prone, and embarrassing at a sales call.</p>

    <div class="fc new">
      <div><span class="tag t-new">New — Schema Requirement</span></div>
      <h4>Required Fields on the Invoice Object (v3 Schema)</h4>
      <p>Add these four fields from Day 1. They cost nothing to add now. They will cost weeks of engineering if added later.</p>

      <div class="arch-grid" style="margin-top:14px;">
        <div class="arch-card">
          <div class="arch-title">original_currency</div>
          <ul>
            <li>ISO 4217 code (USD, GBP, EUR, AED…)</li>
            <li>The currency the invoice was issued in</li>
            <li>Immutable after invoice creation</li>
          </ul>
        </div>
        <div class="arch-card">
          <div class="arch-title">original_amount</div>
          <ul>
            <li>Full invoice value in original_currency</li>
            <li>Immutable — set at creation</li>
            <li>Used for display and legal reference</li>
          </ul>
        </div>
        <div class="arch-card">
          <div class="arch-title">amount_paid</div>
          <ul>
            <li>Running total of all payments received</li>
            <li>Stored in original_currency</li>
            <li>Enables correct partial payment tracking</li>
          </ul>
        </div>
        <div class="arch-card">
          <div class="arch-title">amount_outstanding</div>
          <ul>
            <li>Derived: original_amount − amount_paid</li>
            <li>What the reminder engine references for AI draft amounts</li>
            <li>Updated on every partial payment event</li>
          </ul>
        </div>
      </div>

      <div class="box box-gold" style="margin-top:14px;">
        <p><strong>Optional — add later, not now:</strong> <code>functional_currency</code> — the account owner's home currency for consolidated AR reporting. Do not build FX conversion logic in the MVP. If a user wants to see total outstanding AR in GBP when invoices are in USD, that is a Month 6+ feature. The schema just needs to be <em>ready for it</em>.</p>
      </div>

      <div class="fc-meta">
        <div><div class="fm-key">Build cost now</div><div class="fm-val easy">Near zero — schema fields only</div></div>
        <div><div class="fm-key">Cost if skipped</div><div class="fm-val hard">Painful migration at Month 3</div></div>
        <div><div class="fm-key">FX conversion now?</div><div class="fm-val">No — schema readiness only</div></div>
      </div>
    </div>

    <!-- 5. GLOBAL NETWORK — DELAY -->
    <h3>5. Global Reliability Network — Deliberately and Explicitly Delayed</h3>
    <p>The CRS creates a compelling future possibility: an anonymized, cross-account benchmark network. "Your client pays 18 days slower than the average for agencies in your sector." This is powerful. It is also legally complex, privacy-sensitive, and completely unnecessary for launch.</p>

    <div class="fc">
      <div><span class="tag t-delay">Delayed — Not for Launch or Early Marketing</span></div>
      <h4>Future Network Benchmark Potential</h4>
      <p>Do <strong>not</strong> position or build this for launch. Do not mention it in marketing copy as a current feature. The correct language is: <em>"future network benchmark potential — possible as a later-stage anonymized intelligence layer, only after legal and privacy checkpoints are formally cleared."</em> GDPR, CCPA, and UK GDPR all have specific requirements around aggregating and sharing behavioral data about third parties (your users' clients) even in anonymized form. This requires a Data Protection Impact Assessment and likely a formal legal opinion before activation.</p>
      <div class="box box-red" style="margin-top:14px;">
        <p><strong>Never say:</strong> "Global reliability index — live now."<br>
        <strong>Always say:</strong> "The CRS has future potential as a network benchmark once we reach scale and complete our legal review for cross-account data use."</p>
      </div>
      <div class="fc-meta">
        <div><div class="fm-key">Current status</div><div class="fm-val">Concept only — not live</div></div>
        <div><div class="fm-key">Earliest activation</div><div class="fm-val">Month 12+ with formal legal sign-off</div></div>
        <div><div class="fm-key">Risk if rushed</div><div class="fm-val hard">GDPR enforcement + reputational damage</div></div>
      </div>
    </div>

    <!-- SUMMARY GRID -->
    <h3 style="margin-top:40px;">v3 Change Summary at a Glance</h3>
    <div class="div-grid">
      <div class="div-card">
        <div class="div-head"><div class="div-letter dla">+</div><div><div class="div-title">Add Now</div><div class="div-role">Required before build starts</div></div></div>
        <ul>
          <li>Legal reframing — communications workflow, not collections</li>
          <li>Real mailbox sending via Google + Microsoft OAuth</li>
          <li>Shadow Mode — 14 days + 20 sends mandatory minimum</li>
          <li>Currency-aware schema (4 fields added, no FX logic yet)</li>
        </ul>
      </div>
      <div class="div-card">
        <div class="div-head"><div class="div-letter dlb">✓</div><div><div class="div-title">Keep Strong</div><div class="div-role">Already correct in v2</div></div></div>
        <ul>
          <li>CRS as the compounding data moat</li>
          <li>Promise Tracker as the primary differentiator</li>
          <li>Action Queue as the daily-driver screen</li>
          <li>Agency-first ICP — no freelancer tier</li>
        </ul>
      </div>
      <div class="div-card full">
        <div class="div-head"><div class="div-letter dld">⏸</div><div><div class="div-title">Delay Deliberately</div><div class="div-role">Real idea, wrong timing</div></div></div>
        <ul>
          <li>Global reliability network / cross-account benchmark intelligence — Month 12+ with full GDPR/CCPA legal review only. Do not mention as a live feature.</li>
        </ul>
      </div>
    </div>

  </section>

  <hr class="divider">

  <!-- ── S7: TECHNICAL ARCHITECTURE ── -->
  <section class="section" id="s7">
    <div class="sec-num">07 / Revised Technical Architecture</div>
    <h2>Build for reliability.<br>Not for impressiveness.</h2>

    <div class="box box-red">
      <p><strong>The biggest technical risks v1 ignored:</strong> (1) Email thread matching — a client replying from a different address or changing the subject line will break your thread detection logic. Build it to be resilient. (2) Webhook idempotency — Xero can fire the same payment event twice. Your job must be idempotent or you'll mark invoices as paid/unpaid incorrectly. (3) Sending infrastructure blacklisting — if one customer sends too aggressively, your sending domain gets flagged and all customers suffer. You need per-customer subdomain sending or dedicated IP pools per account.</p>
    </div>

    <h3>Stack (Revised)</h3>
    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title">Backend (pick one)</div>
        <ul>
          <li><code>FastAPI</code> + Python (recommended — LLM ecosystem)</li>
          <li>OR <code>Node/Express</code> if team is JS-first</li>
          <li><code>PostgreSQL</code> primary store</li>
          <li><code>Redis</code> queue + idempotency keys</li>
          <li><code>BullMQ</code> or <code>Celery</code> background workers</li>
          <li><code>Resend</code> sending infrastructure (best deliverability)</li>
        </ul>
      </div>
      <div class="arch-card">
        <div class="arch-title">AI Layer</div>
        <ul>
          <li><code>Claude Haiku</code> — classification, date extraction</li>
          <li><code>Claude Sonnet</code> — email drafting only</li>
          <li>Prompt versioning table (A/B ready)</li>
          <li>Confidence score gate (&lt;0.72 → human queue)</li>
          <li>All LLM calls + responses logged</li>
          <li>Rate limiting: max 100 LLM calls/min/account</li>
        </ul>
      </div>
      <div class="arch-card">
        <div class="arch-title">Email Infrastructure</div>
        <ul>
          <li>Dedicated subdomain per customer account</li>
          <li>Custom <code>From</code> address per customer</li>
          <li><code>Message-ID</code> header tracking for thread match</li>
          <li>Reply-To = monitored inbox per customer</li>
          <li>IMAP polling + Gmail API (parallel build)</li>
          <li>Bounce + complaint rate monitoring per account</li>
        </ul>
      </div>
    </div>

    <h3>Database — Critical Additions vs v1</h3>
    <div class="arch-grid">
      <div class="arch-card">
        <div class="arch-title">contacts (NEW)</div>
        <ul>
          <li>customer_id FK</li>
          <li>email, name, role</li>
          <li>contact_type: primary / finance / escalation</li>
          <li>escalate_from_stage (INT, default: 4)</li>
          <li>opted_out BOOLEAN</li>
        </ul>
      </div>
      <div class="arch-card">
        <div class="arch-title">invoices (REVISED)</div>
        <ul>
          <li>status: draft/sent/partial/paid/void/disputed</li>
          <li>amount_paid DECIMAL (for partials)</li>
          <li>amount_outstanding (computed)</li>
          <li>paused_until TIMESTAMP</li>
          <li>sequence_stage INT</li>
          <li>thread_message_ids TEXT[] (for matching)</li>
        </ul>
      </div>
      <div class="arch-card">
        <div class="arch-title">client_reliability_scores (NEW)</div>
        <ul>
          <li>customer_id FK</li>
          <li>score FLOAT (0–100)</li>
          <li>grade TEXT (A/B/C/D/F)</li>
          <li>promises_made INT</li>
          <li>promises_kept INT</li>
          <li>avg_days_late FLOAT</li>
          <li>score_updated_at TIMESTAMP</li>
        </ul>
      </div>
    </div>

    <h3>Corrected LLM Cost Model</h3>
    <table>
      <thead><tr><th>Call Type</th><th>Model</th><th>Avg Tokens</th><th>Cost/Call</th><th>Calls/mo @ 600 customers</th><th>Monthly Cost</th></tr></thead>
      <tbody>
        <tr><td>Reply Classification</td><td>Haiku</td><td>~600 in + 80 out</td><td>~$0.0003</td><td>~18,000</td><td>~$5</td></tr>
        <tr><td>Date/Promise Extraction</td><td>Haiku</td><td>~400 in + 30 out</td><td>~$0.0002</td><td>~8,000</td><td>~$2</td></tr>
        <tr><td>Email Drafting</td><td>Sonnet</td><td>~700 in + 450 out</td><td>~$0.009</td><td>~30,000</td><td>~$270</td></tr>
        <tr class="featured-r"><td><strong>Total</strong></td><td></td><td></td><td></td><td></td><td class="good"><strong>~$280/mo</strong></td></tr>
      </tbody>
    </table>
    <p style="font-size:13px; color:var(--text3);">v1 estimated $60/month. Correct estimate is ~$280/month. At $249 avg revenue/customer, gross margin is still 88%+ at 600 customers. Not a problem — but be honest about it.</p>
  </section>

  <hr class="divider">

  <!-- ── S8: DIVISIONS (REVISED) ── -->
  <section class="section" id="s8">
    <div class="sec-num">08 / Revised Build Divisions</div>
    <h2>Realistic for a lean team.<br>Not a Series A squad.</h2>
    <p>The v1 "5 parallel divisions" assumed a 5-person fully-specialized team from day one. This is unrealistic for most founders. Below is the same architecture reframed for a <strong>2-person team</strong> (1 full-stack engineer + 1 founder who can do GTM and light product). Annotated for larger teams where applicable.</p>

    <div class="div-grid">
      <div class="div-card">
        <div class="div-head">
          <div class="div-letter dla">A</div>
          <div><div class="div-title">Core Product (Engineer 1)</div><div class="div-role">Full-stack — Weeks 1–10</div></div>
        </div>
        <ul>
          <li>DB schema, auth, CSV ingestion</li>
          <li>Invoice CRUD + status machine</li>
          <li>Sequence engine (cron-based, rule-driven)</li>
          <li>Email sending via Resend</li>
          <li>Reply fetching (IMAP + Gmail API)</li>
          <li>Action Queue backend logic</li>
          <li class="warn">DO NOT start Xero integration until Week 10</li>
          <li class="warn">Apply for Xero/QB approval on Day 1 (takes weeks)</li>
        </ul>
      </div>
      <div class="div-card">
        <div class="div-head">
          <div class="div-letter dlb">B</div>
          <div><div class="div-title">AI Intelligence (Engineer 1 or 2)</div><div class="div-role">Starts Week 4 — after reminder engine ships</div></div>
        </div>
        <ul>
          <li>ReplyClassifier prompts + evals</li>
          <li>DateExtractor + edge case testing</li>
          <li>EmailDrafter (all 6 stages × 3 tones)</li>
          <li>CRS calculation engine</li>
          <li>Confidence score calibration</li>
          <li class="warn">Do NOT start AI until deterministic engine is stable</li>
          <li>Minimum 100 test cases before shipping to beta</li>
        </ul>
      </div>
      <div class="div-card">
        <div class="div-head">
          <div class="div-letter dlc">C</div>
          <div><div class="div-title">Frontend (Engineer 1 or Designer)</div><div class="div-role">Starts Week 5 — after backend APIs are stable</div></div>
        </div>
        <ul>
          <li>Auth + onboarding wizard (CSV upload flow)</li>
          <li>Invoice List (table, filters, status)</li>
          <li>Action Queue — design this screen obsessively</li>
          <li>Promise Log + CRS display</li>
          <li>Customer profile page</li>
          <li class="warn">Do NOT build settings before core screens are done</li>
        </ul>
      </div>
      <div class="div-card">
        <div class="div-head">
          <div class="div-letter dld">D</div>
          <div><div class="div-title">Infra &amp; Deliverability (Engineer 1)</div><div class="div-role">Weeks 3–6 in parallel</div></div>
        </div>
        <ul>
          <li>Per-account sending subdomain setup</li>
          <li>DKIM/SPF/DMARC configuration</li>
          <li>Bounce + complaint rate monitoring</li>
          <li>Idempotency keys for all webhook handlers</li>
          <li>Rate limiting on LLM API calls</li>
          <li class="warn">Skip this = deliverability failure at launch</li>
        </ul>
      </div>
      <div class="div-card full">
        <div class="div-head">
          <div class="div-letter dle">E</div>
          <div><div class="div-title">GTM + Revenue (Founder) — Day 1, Never Stops</div><div class="div-role">Not sequential — runs in parallel from the first day of building</div></div>
        </div>
        <ul>
          <li>Start posting on LinkedIn in Week 1 — before product exists. Document the build.</li>
          <li>Apply for Xero + QuickBooks marketplace listing on Day 1 (approval takes 6–10 weeks)</li>
          <li>Identify and contact 5 target beta users by Week 2 (personal network first)</li>
          <li>Build waitlist landing page by end of Week 1 — even if product is not ready</li>
          <li>Stripe billing setup by Week 8 — before launch, not after</li>
          <li>Onboarding email sequence: 7-email series focused on activation, not features</li>
          <li>First 5 customers: free + feedback. Then charge. Do not let free usage last more than 30 days.</li>
          <li class="warn">Do NOT wait for a finished product to start GTM. Build audience while building product.</li>
        </ul>
      </div>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S9: TIMELINE (REVISED) ── -->
  <section class="section" id="s9">
    <div class="sec-num">09 / Revised 12-Week Timeline</div>
    <h2>8 weeks was a fantasy.<br>12 weeks is honest.</h2>

    <div class="box box-red" style="margin-bottom:24px;">
      <p><strong>Why 8 weeks fails:</strong> Gmail production API approval = 4–6 weeks. Xero production approval = 2–4 weeks. These run in parallel with development, but if there's a delay, you cannot launch without them if your product depends on them. The only solution: build CSV-first, launch without accounting integrations, and treat Xero/QB as a Month 3 upgrade.</p>
    </div>

    <div class="timeline">
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-week">Weeks 1–2 — Foundation</div>
        <div class="tl-title">Schema lock, auth, CSV ingestion, landing page</div>
        <div class="tl-desc">DB schema agreed and locked on Day 2. No schema changes after this without full-team sign-off. CSV parser working. Invoice CRUD API done. Auth and multi-tenancy live. GTM: landing page deployed, waitlist open, LinkedIn posting started. Apply for Xero/QB marketplace approval today — it runs in background.</div>
        <div class="tl-pills">
          <span class="tp gate">Schema locked Day 2</span>
          <span class="tp">Auth + multi-tenancy</span>
          <span class="tp">CSV parser live</span>
          <span class="tp">Invoice CRUD API</span>
          <span class="tp">Landing page deployed</span>
          <span class="tp gate">Xero/QB approval applied</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-week">Weeks 3–4 — The Sending Engine</div>
        <div class="tl-title">Reminder sequence + email sending + IMAP reader</div>
        <div class="tl-desc">InvoiceWatcher cron running hourly. 6-stage sequence engine firing on schedule. Emails going out via Resend with per-account sending subdomain. IMAP reader pulling replies and matching to threads. Sending infrastructure hardened (DKIM/SPF/DMARC). At end of Week 4: first automated email sequence is live for internal testing.</div>
        <div class="tl-pills">
          <span class="tp">InvoiceWatcher cron</span>
          <span class="tp">6-stage sequence engine</span>
          <span class="tp">Resend integration</span>
          <span class="tp">Per-account subdomains</span>
          <span class="tp gate">IMAP reader live</span>
          <span class="tp danger">No AI yet</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-week">Weeks 5–6 — The AI Core</div>
        <div class="tl-title">Reply classification, auto-pause, promise extraction</div>
        <div class="tl-desc">ReplyClassifier goes live. AutoPause fires on every detected reply. DateExtractor parses "I'll pay Friday" into a specific date. Promise stored in payment_promises table. PromiseChecker daily job running. EmailDrafter generating AI email drafts for all 6 stages. 100 test cases validated before shipping AI to any beta user. This is the hardest build week.</div>
        <div class="tl-pills">
          <span class="tp gate">100 classifier test cases</span>
          <span class="tp">AutoPause live</span>
          <span class="tp">DateExtractor working</span>
          <span class="tp">PromiseChecker job</span>
          <span class="tp">EmailDrafter all stages</span>
          <span class="tp danger">Confidence gate: &lt;0.72 → human</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-week">Weeks 7–8 — Frontend + Action Queue</div>
        <div class="tl-title">The cockpit UI ships. 3 beta users onboarded.</div>
        <div class="tl-desc">Action Queue UI live. Invoice List, Promise Log, and Customer Profile screens complete. Multi-contact per customer supported. Partial payment status in schema. First 3 beta users onboarded with real invoice data. Target: each beta user takes at least 3 actions in the product within their first 7 days.</div>
        <div class="tl-pills">
          <span class="tp gate">Action Queue UI live</span>
          <span class="tp">Invoice List + filters</span>
          <span class="tp">Promise Log screen</span>
          <span class="tp">Multi-contact support</span>
          <span class="tp gate">3 beta users active</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-week">Weeks 9–10 — Beta Hardening</div>
        <div class="tl-title">No new features. Fix everything. Observe obsessively.</div>
        <div class="tl-desc">Expand to 8 beta users. Watch every action they take. No new feature ships unless a beta user cannot complete a core workflow. Improve classifier accuracy from beta feedback. Refine email draft quality. Onboarding wizard polished. Activation metric target: 70%+ of new users taking second action within 48 hours of signup.</div>
        <div class="tl-pills">
          <span class="tp">8 beta users total</span>
          <span class="tp gate">Activation rate &gt;70%</span>
          <span class="tp">Classifier accuracy target: 88%+</span>
          <span class="tp">Onboarding polish</span>
          <span class="tp">Xero integration starts (if approval received)</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-week">Weeks 11–12 — Launch</div>
        <div class="tl-title">Billing live. Direct outreach. First paying customers.</div>
        <div class="tl-desc">Stripe billing integrated. All tiers live. Convert beta users to paid (free period was 30 days max). Direct outreach to personal network and LinkedIn audience. Target: 10 paying customers by end of Week 12. Do NOT launch publicly until Stripe is live and you have processed at least one successful payment.</div>
        <div class="tl-pills">
          <span class="tp gate">Stripe billing live</span>
          <span class="tp gate">Beta users converted to paid</span>
          <span class="tp">Direct outreach blast</span>
          <span class="tp">Target: 10 paying users</span>
          <span class="tp">CRS visible in customer profile</span>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot grey"></div>
        <div class="tl-week grey">Weeks 13–20 — Growth Phase</div>
        <div class="tl-title" style="color:var(--text2);">Xero integration, SMS pivot, first case studies</div>
        <div class="tl-desc">Xero integration ships (approval hopefully cleared by now). First two case studies published with real DSO data. LinkedIn content builds distribution. Direct outreach continues. Target: 50 paying customers by Week 20.</div>
        <div class="tl-pills">
          <span class="tp">Xero integration live</span>
          <span class="tp">2 customer case studies published</span>
          <span class="tp">50 paying customers</span>
          <span class="tp">QB integration underway</span>
        </div>
      </div>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S10: PRICING ── -->
  <section class="section" id="s10">
    <div class="sec-num">10 / Revised Pricing</div>
    <h2>Kill $49. Start at $99.<br>Target $249 as your center.</h2>

    <div class="box box-red" style="margin-bottom:24px;">
      <p><strong>Why v1 pricing is wrong:</strong> The $49 tier attracts the wrong buyer, signals "cheap tool," and has identical support cost to a $249 customer. The "Growth" tier at $149 is correct in concept but priced for a buyer who still thinks of this as a reminder tool. Repriced to $249 when positioned as "AR intelligence platform that builds client risk profiles." Same product, better positioning, higher willingness to pay from the right buyer.</p>
    </div>

    <div class="pricing-grid">
      <div class="tier">
        <div class="tier-name">Solo</div>
        <div class="tier-price">$99<span>/mo</span></div>
        <div class="tier-note">Freelancers &amp; solo ops with real AR volume</div>
        <ul>
          <li>30 active invoices</li>
          <li>1 user seat</li>
          <li>CSV import only</li>
          <li>All AI features (classifier, drafter, promise tracker)</li>
          <li>Action Queue</li>
          <li>Client Reliability Scores</li>
          <li class="locked">No Xero/QB integration</li>
          <li class="locked">No multi-contact per invoice</li>
        </ul>
      </div>
      <div class="tier hero">
        <div class="tier-name">Studio ★ Primary ICP</div>
        <div class="tier-price">$249<span>/mo</span></div>
        <div class="tier-note">The right tier for 8–30 person agencies</div>
        <ul>
          <li>Unlimited active invoices</li>
          <li>3 user seats</li>
          <li>Xero + QuickBooks sync</li>
          <li>Multi-contact per invoice (CC logic)</li>
          <li>All AI features + full email drafting</li>
          <li>Client Reliability Score + Promise Timeline</li>
          <li>Broken Promise Escalation alerts</li>
          <li>Priority support</li>
        </ul>
      </div>
      <div class="tier">
        <div class="tier-name">Agency</div>
        <div class="tier-price">$549<span>/mo</span></div>
        <div class="tier-note">Multi-client ops &amp; accounting firms</div>
        <ul>
          <li>Unlimited invoices, unlimited clients</li>
          <li>10 user seats</li>
          <li>All integrations + API access</li>
          <li>White-label email branding per client</li>
          <li>Quarterly CRS Reports per client</li>
          <li>Sequence customization per client</li>
          <li>Dedicated onboarding call</li>
          <li>SSO support</li>
        </ul>
      </div>
    </div>

    <h3>Why These Numbers Work</h3>
    <p>A 15-person agency doing $150K/month in AR with an average invoice of $12,000. If Payd.ai reduces their DSO by 8 days, they recover ~$40K in cash faster per month. The cost is $249. The ROI conversation is: <em>"This costs $249 and recovers $40,000 faster. Do you want to sign up?"</em> There is no pricing resistance at $249 for a buyer who actually understands that number.</p>

    <h3>Revised Path to $1M ARR (Honest)</h3>
    <table>
      <thead><tr><th>Month</th><th>Customers</th><th>Avg ARPU</th><th>MRR</th><th>ARR Run-Rate</th><th>Note</th></tr></thead>
      <tbody>
        <tr><td>Month 3</td><td>10</td><td>$180</td><td>$1,800</td><td>$21.6K</td><td class="warn-val">Realistic launch target</td></tr>
        <tr><td>Month 5</td><td>30</td><td>$210</td><td>$6,300</td><td>$75.6K</td><td></td></tr>
        <tr><td>Month 8</td><td>80</td><td>$220</td><td>$17,600</td><td>$211K</td><td></td></tr>
        <tr><td>Month 12</td><td>160</td><td>$235</td><td>$37,600</td><td>$451K</td><td></td></tr>
        <tr><td>Month 16</td><td>280</td><td>$245</td><td>$68,600</td><td>$823K</td><td></td></tr>
        <tr class="featured-r"><td>Month 20</td><td>380</td><td>$255</td><td>$96,900</td><td class="good">$1.16M ARR ✓</td><td class="good">Realistic at 5% monthly churn</td></tr>
      </tbody>
    </table>
    <p style="font-size:13px; color:var(--text3);">v1's model reached $1M ARR at Month 18 with 600 customers at $155/month. This model reaches it at Month 20 with 380 customers at $255/month. Fewer customers, higher ARPU, more realistic growth curve with churn modeled in. The second model is harder to achieve by volume but easier to achieve by economics because each customer is worth more.</p>
  </section>

  <hr class="divider">

  <!-- ── S11: GTM (REVISED) ── -->
  <section class="section" id="s11">
    <div class="sec-num">11 / Revised GTM</div>
    <h2>No vanity metrics.<br>Here's how to get customer #1.</h2>

    <p>The v1 GTM plan describes channels but not execution. It targets 20 paying customers at month 2 with no explanation of how to get them. Here is the specific, tactical playbook for the first 50 customers — no fluff.</p>

    <h3>Phase 1 — Customers 1–5 (Weeks 1–8, free)</h3>
    <ol class="step-list">
      <li><div class="step-num">1</div><div class="step-body"><strong>Personal network first.</strong> List every agency owner, studio founder, or consultant you know personally who has complained about invoice chasing in the last 12 months. Message them directly: "I'm building a tool to automate invoice follow-ups with AI. I need 5 people to use it for free for 30 days and give me 1 feedback call per week. Is that you?" Expect 50% yes rate from warm contacts. Target: 3 users from personal network.</div></li>
      <li><div class="step-num">2</div><div class="step-body"><strong>Xero community seeding.</strong> Join the Xero Community forum and the Xero Users Facebook Group. Spend 2 weeks answering questions about AR management with genuinely useful answers — no product mention. Then post: "I'm building an AI layer on top of Xero for invoice follow-ups. Looking for 2 Xero users to pilot it free. Anyone interested?" This is not spam — it is direct distribution in the right community. Target: 2 users from Xero community.</div></li>
      <li><div class="step-num">3</div><div class="step-body"><strong>Zero follower LinkedIn outreach.</strong> You do not need a LinkedIn audience to do outbound. Go to LinkedIn Sales Navigator, filter for: Agency Owner / Studio Founder / Creative Director, 5–50 employees, UK or US. Find ones who have posted about invoices, cash flow, or client payment in the last 90 days (LinkedIn search can do this). These are people who are actively experiencing the pain. Send 15 hyper-personalized messages per week. Use their specific post as context: "You posted about a client who took 60 days to pay last month — that's exactly what I built Payd.ai to fix." Expect 15% response, 5% conversion.</div></li>
    </ol>

    <div class="box box-orange">
      <p><strong>30-day free maximum.</strong> If a free beta user has not converted to paid after 30 days, ask them directly: "Are you getting value from this? If yes, I'm starting billing next week." If they hesitate, they will never pay. Remove their access. A free user who stays free forever is not a customer — they are a support burden with zero revenue.</p>
    </div>

    <h3>Phase 2 — Customers 6–50 (Months 2–5)</h3>
    <ol class="step-list">
      <li><div class="step-num">4</div><div class="step-body"><strong>Case studies first, content second.</strong> Before you write a single LinkedIn post about "AI invoice management," you need one real case study with real numbers. "Agency X reduced DSO from 43 to 29 days in 6 weeks." That case study is your entire sales deck. One page. One number. Named client. This is 100× more powerful than 50 LinkedIn posts about your feature set.</div></li>
      <li><div class="step-num">5</div><div class="step-body"><strong>LinkedIn content: Document the build.</strong> Do not wait to have a product before posting. Post weekly about the problem you're solving, the mistakes you're making, the things agencies told you in research calls. This builds trust and authority before you have a product. By launch, your ideal buyers already feel they know you. Target: 1,500+ targeted followers by Week 12.</div></li>
      <li><div class="step-num">6</div><div class="step-body"><strong>Xero App Marketplace.</strong> Getting listed in Xero's app marketplace is the highest-leverage distribution move you can make. Xero sends active buyer traffic. Thousands of Xero users search for AR tools every month. This takes 2–3 months to get approved — so apply in Week 1. When approved, your conversion rate from marketplace traffic is high because the user already uses Xero and is looking for exactly what you do.</div></li>
      <li><div class="step-num">7</div><div class="step-body"><strong>Targeted cold email (not LinkedIn DM).</strong> Use Apollo.io to build a list of 500 agency owners. Write one email sequence, 3 emails, with a very specific subject line: <em>"[Your Name] — invoice follow-up automation for agencies."</em> No hype. No vague AI promises. Specific, honest, short. Link to the case study. Target 2–3% conversion from a warm segment of this list. At 500 contacts × 2% = 10 customers.</div></li>
    </ol>

    <h3>What NOT to Do</h3>
    <p><strong>ProductHunt:</strong> Not worth the effort for this ICP. Agency finance decision-makers are not on ProductHunt. If you ship and someone else submits you, great — but do not spend a week preparing a PH launch campaign.</p>
    <p><strong>Paid ads before Month 6:</strong> Do not run ads until you understand exactly which message converts. Running ads to untested copy with an unknown conversion rate is burning money. Build organic proof first.</p>
    <p><strong>Content for content's sake:</strong> "10 tips for getting clients to pay on time" is the content every bookkeeper writes. It will not build an audience of people who pay $249/month. Write about the specific emotional experience of being owed money — that is the content that resonates with the people you want to reach.</p>
  </section>

  <hr class="divider">

  <!-- ── S12: RISK REGISTER (REVISED) ── -->
  <section class="section" id="s12">
    <div class="sec-num">12 / Revised Risk Register</div>
    <h2>More risks than v1 admitted.<br>More honest mitigation.</h2>

    <div class="risk-row">
      <span class="risk-lv rv-h">Critical</span>
      <div class="risk-name">Third-Party GDPR Exposure<small>Reading email replies of invoice recipients = processing 3rd-party personal data without their consent</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Legal review before launch. Your ToS must establish that the account owner's clients have an existing business relationship. You are a data processor, the account owner is the data controller. Under GDPR Article 6(1)(f), legitimate interest of recovering debts is a valid lawful basis — but it must be documented. Get a lawyer to review the data processing flow before you process a single email in production.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-h">Critical</span>
      <div class="risk-name">Sending Infrastructure Blacklisting<small>One customer sending aggressively damages deliverability for all customers</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Each customer account must use a dedicated sending subdomain from Day 1. Never pool sending IP addresses across accounts. Set hard limits: no more than 3 emails per day per invoice recipient from any account. Monitor bounce and complaint rates per account in real-time. Auto-suspend any account exceeding 0.5% complaint rate.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-h">High</span>
      <div class="risk-name">Activation Failure<small>Users sign up, upload a CSV, and never take a second action</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Design the onboarding wizard to show the user their first AI-drafted email within 3 minutes of signing up. Time-to-value must be under 5 minutes. If a user uploads a CSV and does not approve an email within 48 hours, trigger an automated "Are you stuck?" email with a Loom walkthrough. If they don't activate within 7 days, they will churn — reach out manually.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-h">High</span>
      <div class="risk-name">AI Misclassification at Scale<small>A dispute classified as "promise" and the sequence continues</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Confidence gate at 0.72 — anything below goes to the human queue, not auto-action. Run monthly accuracy audits against a labeled test set. Ship a "Report misclassification" button on every classification result so users can self-correct and improve training data. Never classify a reply as "Dispute" or "Promise" without surfacing it to the owner for the first 3 months of a customer account's life.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-m">Medium</span>
      <div class="risk-name">Funded Competitor Copies Promise Tracker<small>Chaser or Upflow ships a promise tracking feature with their marketing budget</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> The feature can be copied — the data cannot. Every month a customer uses Payd.ai, their Client Reliability Score becomes more accurate, more personalized, and more irreplaceable. Move fast on CRS. Get to 100 customers with 6+ months of data before a funded competitor ships this. The data moat is your only durable defense.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-m">Medium</span>
      <div class="risk-name">Gmail/Google API Production Approval Delay<small>Production approval requires security review — can take 6–10 weeks</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Apply for production access on Day 1. Build IMAP as the primary reply-reading mechanism for MVP. Gmail API is the upgrade path, not the requirement. Any customer who uses Gmail can use IMAP as fallback. Do not make the launch date dependent on Gmail API approval.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-m">Medium</span>
      <div class="risk-name">Email Thread Matching Failures<small>Client replies from different address, changes subject line, or starts new email chain</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Thread matching must use multiple signals: Message-ID references, In-Reply-To headers, AND fuzzy subject line matching. Store all sent Message-IDs per invoice. When no thread match is found, flag for human review rather than classifying. This edge case will appear frequently with less tech-savvy clients — do not ignore it.</div>
    </div>
    <div class="risk-row">
      <span class="risk-lv rv-l">Low-Medium</span>
      <div class="risk-name">Xero/QB Native Feature Competition<small>They add intelligent AR automation themselves</small></div>
      <div class="risk-mit"><strong>Mitigation:</strong> Both have been adding basic reminders for years without intelligence. The CRS is the moat — a platform with 10M+ customers cannot build a personalized reliability score for SMEs without fundamentally changing their product philosophy. Be fast, not afraid.</div>
    </div>
  </section>

  <hr class="divider">

  <!-- ── S13: VERDICT ── -->
  <section class="section" id="s13">
    <div class="sec-num">13 / Blunt Verdict</div>
    <div class="verdict">
      <div class="verdict-lbl">Pressure-Tested Commercial Assessment</div>
      <h3>Yes, this can win. But v1 would have killed it at launch.</h3>
      <p>The core idea is commercially sound. The pain is real, the market is large, the willingness to pay is high, and — critically — the existing solutions in this space are mediocre. Chaser is bloated. Upflow is enterprise-tilted. Xero native is dumb. There is a genuine gap for a sharp, intelligence-first AR tool built for agencies and service businesses.</p>
      <p><strong>What v1 got right:</strong> The Promise Tracker concept. The Action Queue design. The Auto-Pause safety brake. The decision to avoid accounting software competition. These are the four correct load-bearing pillars of the product and they should not change.</p>
      <p><strong>What v1 would have killed:</strong> The 8-week timeline would have caused a broken launch with Gmail API delays. The $49 tier would have filled your customer base with freelancers who churn at month 3. The missing competitor analysis would have meant entering a market blind. The ignored GDPR risk would have created a legal exposure on day 1 of processing real emails. The fantasy revenue model would have caused a cash planning failure.</p>
      <p><strong>The biggest remaining weakness:</strong> You have no proof yet that the AI reply classification works well enough to trust in a commercial environment. That is the single technical risk that can still kill this. You must — before public launch — run the classifier against 200+ real reply emails from real invoice collection threads and achieve above 88% accuracy on clearly labelled intent. If you cannot reach 88%, you do not launch until you can. An 82% classifier sounds good until it misclassifies a legal dispute as a payment promise and your customer sends another chasing email to a client who has already called a lawyer.</p>
      <p><strong>What must be fixed before build starts:</strong> (1) Legal review of GDPR data processing flow — get this done in Week 1, in parallel with everything else. (2) Apply for Xero and QuickBooks marketplace approval today — do not wait. (3) Remove the $49 tier from your pricing entirely. (4) Accept the 12-week timeline and stop telling yourself it can be done in 8. (5) Find your first 3 beta users before you write a single line of production code — their workflows will fix at least 5 things you have wrong in the schema right now.</p>
      <p><strong>The upside if you execute correctly:</strong> A narrow, opinionated AR tool with a compounding data moat, positioned as a client risk intelligence platform rather than a reminder tool, priced at $249 for a buyer who saves $40,000/month from using it. That is a very high-margin, low-churn SaaS business that can reach $1M ARR with fewer than 400 customers. Build it right, charge appropriately, and the economics are exceptional.</p>
    </div>
  </section>

</div>
</body>
</html>
