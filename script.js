/* ==========================================================
   Fab Host — shared data & page logic
   ========================================================== */

const BDT_RATE = 126;
const SUPPORT_PHONE = '+8809638571140';
const SUPPORT_PHONE_DISPLAY = '+880 9638 571140';
const SUPPORT_EMAIL = 'support@fabhost.com';

/* ----------------------------------------------------------
   Stripe checkout
   ----------------------------------------------------------
   Paste your Stripe Payment Link below (Stripe Dashboard →
   Payment links → Create link). The customer clicks "Pay with
   card", lands on Stripe's own secure page, and types their
   card number, expiry and CVC there.

   Card fields must be served by Stripe, not by this site — a
   static page cannot protect card data, and Stripe will not
   accept raw card numbers collected by a merchant page.

   Example:
   const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/xxxxxxxxxxxx';
---------------------------------------------------------- */
const STRIPE_PAYMENT_LINK = '';

const PAYMENT_GATEWAYS = {
  stripe: { name: 'Stripe', note: 'Visa, Mastercard, American Express & UnionPay', url: STRIPE_PAYMENT_LINK }
};

const BILLING_CYCLES = {
  monthly:  { label: 'Monthly',  months: 1,  key: 'monthly' },
  annually: { label: 'Yearly',   months: 12, key: 'yearly'  }
};

/* Package lineup and specifications match the Pro Business range exactly. */
const COMMON_FEATURES = [
  'Unlimited Sub-Domains',
  'Unlimited Email Accounts',
  'Unlimited MySQL Databases',
  'Free SSL Certificate',
  'Daily Auto Backup',
  'Unlimited Monthly Visitors',
  'cPanel Control Panel',
  'LiteSpeed Web Server',
  'Imunify360 Security',
  'Ruby, Python & NodeJS',
  'Softaculous Auto Installer',
  'Shell (SSH) Access ON/OFF',
  '10 Mbps I/O & 80 Entry Processes',
  'Free Website Migration',
  'Unlimited File Inodes'
];

const PLANS = [
  { id: 'business-1', name: '1 GB Business Hosting', tier: 'Starter',
    storage: '1 GB', ram: '4 GB', cpu: '1 Core', bandwidth: '200 GB', addons: '2',
    freeDomain: '.shop / .website / .cyou / .cfd', monthly: 1.49, yearly: 15,
    tagline: 'For personal sites, portfolios and landing pages.' },
  { id: 'business-5', name: '5 GB Business Hosting', tier: 'Basic',
    storage: '5 GB', ram: '4 GB', cpu: '2 Core', bandwidth: '500 GB', addons: '5',
    freeDomain: '.xyz / .top / .online / .site / .store', monthly: 3.49, yearly: 35,
    tagline: 'For small businesses and growing blogs.' },
  { id: 'business-10', name: '10 GB Business Hosting', tier: 'Standard', featured: true,
    storage: '10 GB', ram: '5 GB', cpu: '2.5 Core', bandwidth: '1000 GB', addons: '10',
    freeDomain: '.com / .pro / .org / .info / .co', monthly: 4.99, yearly: 49,
    tagline: 'For business websites and online stores.' },
  { id: 'business-20', name: '20 GB Business Hosting', tier: 'Premium',
    storage: '20 GB', ram: '6 GB', cpu: '3 Core', bandwidth: 'Unlimited', addons: 'Unlimited',
    freeDomain: '.com / .app / .biz / .org', monthly: 6.99, yearly: 69,
    tagline: 'For news portals and high-traffic sites.' },
  { id: 'business-50', name: '50 GB Business Hosting', tier: 'Business',
    storage: '50 GB', ram: '8 GB', cpu: '4 Core', bandwidth: 'Unlimited', addons: 'Unlimited',
    freeDomain: '.com / .net / .org / .dev', monthly: 9.99, yearly: 99,
    tagline: 'For agencies and resource-heavy applications.' },
  { id: 'business-100', name: '100 GB Business Hosting', tier: 'Enterprise',
    storage: '100 GB', ram: '12 GB', cpu: '6 Core', bandwidth: 'Unlimited', addons: 'Unlimited',
    freeDomain: '.com / .net / .org / .io', monthly: 14.99, yearly: 149,
    extras: ['Free Dedicated IP', 'Priority Support Queue'],
    tagline: 'For large stores and busy media websites.' },
  { id: 'business-200', name: '200 GB Business Hosting', tier: 'Scale',
    storage: '200 GB', ram: '16 GB', cpu: '8 Core', bandwidth: 'Unlimited', addons: 'Unlimited',
    freeDomain: '.com / .net / .cloud / .io', monthly: 24.99, yearly: 249,
    extras: ['Free Dedicated IP', 'Priority Support Queue', 'Free Cloudflare CDN'],
    tagline: 'For multi-site portfolios and SaaS platforms.' },
  { id: 'business-500', name: '500 GB Business Hosting', tier: 'Ultimate',
    storage: '500 GB', ram: '24 GB', cpu: '12 Core', bandwidth: 'Unlimited', addons: 'Unlimited',
    freeDomain: '.com / .net / .cloud / .ai', monthly: 39.99, yearly: 399,
    extras: ['Free Dedicated IP', 'Priority Support Queue', 'Free Cloudflare CDN', 'Dedicated Account Manager'],
    tagline: 'For enterprises running mission-critical workloads.' }
];

/* Premium add-ons that only the larger plans include. */
const EXTRA_FEATURES = ['Free Dedicated IP', 'Priority Support Queue', 'Free Cloudflare CDN', 'Dedicated Account Manager'];

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const fmtUSD = n => '$' + n.toFixed(2);
const fmtBDT = n => '৳' + Math.round(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function priceFor(plan, cycleKey) {
  const c = BILLING_CYCLES[cycleKey] || BILLING_CYCLES.monthly;
  const usd = plan[c.key];
  const listUSD = plan.monthly * c.months;          // cost if paid month by month
  const saveUSD = +(listUSD - usd).toFixed(2);
  return {
    usd, bdt: usd * BDT_RATE,
    perMonthUSD: usd / c.months,
    listUSD, saveUSD,
    savePct: listUSD > usd ? Math.round((saveUSD / listUSD) * 100) : 0,
    cycle: c
  };
}

function specList(plan) {
  return [
    `${plan.storage} NVMe SSD Storage`,
    `${plan.ram} RAM`,
    `${plan.cpu} CPU (AMD Ryzen 9)`,
    `${plan.bandwidth} Bandwidth`,
    `${plan.addons} Addon Domains`,
    ...(plan.extras || []),
    ...COMMON_FEATURES
  ];
}

const checkIcon = '<svg class="check" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.7 13.3 4.4 10l-1.1 1.1 4.4 4.4 9.4-9.4-1.1-1.1z"/></svg>';
const specItems = list => list.map(f => `<li>${checkIcon}<span>${f}</span></li>`).join('');

/* ---------- shared: nav, contact info, reveal ---------- */
function initShared() {
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', false);
    }));
  }
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
  $$('[data-phone]').forEach(el => {
    if (!el.hasAttribute('data-keep-text')) el.textContent = SUPPORT_PHONE_DISPLAY;
    if (el.tagName === 'A') el.href = 'tel:' + SUPPORT_PHONE;
  });
  $$('[data-email]').forEach(el => {
    el.textContent = SUPPORT_EMAIL;
    if (el.tagName === 'A') el.href = 'mailto:' + SUPPORT_EMAIL;
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }
}

/* ---------- index page ---------- */
function renderPlans(cycleKey) {
  const grid = $('#planGrid');
  grid.innerHTML = PLANS.map(plan => {
    const p = priceFor(plan, cycleKey);
    const specs = specList(plan);
    return `
    <article class="plan-card ${plan.featured ? 'featured' : ''}">
      ${plan.featured ? '<span class="plan-badge">Most popular</span>' : ''}
      <p class="plan-tier">${plan.tier}</p>
      <h3 class="plan-name">${plan.name}</h3>
      <p class="plan-tagline">${plan.tagline}</p>
      <div class="plan-price">
        <span class="usd">${fmtUSD(p.perMonthUSD)}<small>/mo</small></span>
        <span class="bdt">${fmtBDT(p.perMonthUSD * BDT_RATE)}<small>/mo</small></span>
        <span class="billed">${cycleKey === 'annually'
          ? `Billed <b>${fmtUSD(p.usd)}</b> / <b>${fmtBDT(p.bdt)}</b> yearly<em>Save ${p.savePct}%</em>`
          : `Billed <b>${fmtUSD(p.usd)}</b> / <b>${fmtBDT(p.bdt)}</b> monthly`}</span>
      </div>
      <a class="button ${plan.featured ? 'button-primary' : 'button-outline'} plan-cta" href="order.html?plan=${plan.id}&amp;cycle=${cycleKey}">Order Now</a>
      <p class="plan-domain"><strong>Free domain</strong> with yearly billing<br><span>${plan.freeDomain}</span></p>
      <ul class="plan-specs">${specItems(specs.slice(0, 6))}</ul>
      <details class="plan-more">
        <summary>View all ${specs.length} features</summary>
        <ul class="plan-specs">${specItems(specs.slice(6))}</ul>
      </details>
    </article>`;
  }).join('');
}

function renderCompare() {
  const table = $('#compareTable');
  const rows = [
    ['NVMe SSD Storage', p => `<strong>${p.storage}</strong>`],
    ['RAM', p => p.ram],
    ['CPU (AMD Ryzen 9)', p => p.cpu],
    ['Bandwidth', p => p.bandwidth],
    ['Addon Domains', p => p.addons],
    ...EXTRA_FEATURES.map(f => [f, p => (p.extras || []).includes(f) ? checkIcon : '<span class="no">—</span>']),
    ...COMMON_FEATURES.map(f => [f, () => checkIcon])
  ];
  table.innerHTML = `
    <thead><tr><th scope="col">Features</th>${PLANS.map(p =>
      `<th scope="col">${p.storage}<span>${fmtUSD(p.monthly)}/mo · ${fmtUSD(p.yearly)}/yr</span></th>`).join('')}</tr></thead>
    <tbody>${rows.map(([label, fn]) =>
      `<tr><th scope="row">${label}</th>${PLANS.map(p => `<td>${fn(p)}</td>`).join('')}</tr>`).join('')}</tbody>
    <tfoot><tr><th scope="row"></th>${PLANS.map(p =>
      `<td><a class="button button-small ${p.featured ? 'button-primary' : 'button-outline'}" href="order.html?plan=${p.id}">Order</a></td>`).join('')}</tr></tfoot>`;
}

function initIndex() {
  if (!$('#planGrid')) return;
  let cycle = 'annually';
  renderPlans(cycle);
  renderCompare();
  $$('.cycle-toggle button').forEach(btn => btn.addEventListener('click', () => {
    cycle = btn.dataset.cycle;
    $$('.cycle-toggle button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    renderPlans(cycle);
  }));
}

/* ---------- order page ---------- */
function initOrder() {
  const root = $('#orderRoot');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const plan = PLANS.find(p => p.id === params.get('plan'));
  let cycle = BILLING_CYCLES[params.get('cycle')] ? params.get('cycle') : 'annually';

  if (!plan) {
    root.innerHTML = `
      <div class="empty-state card">
        <h1>Choose a hosting plan</h1>
        <p>We couldn't find the package you selected. Pick a plan to continue your order.</p>
        <a class="button button-primary" href="index.html#plans">View hosting plans</a>
      </div>`;
    return;
  }

  document.title = `Order ${plan.name} | Fab Host`;
  $('#planTier').textContent = plan.tier + ' plan';
  $('#planTitle').textContent = plan.name;
  $('#planTagline').textContent = plan.tagline;
  $('#planDomain').textContent = plan.freeDomain;
  $('#planSpecs').innerHTML = specItems(specList(plan));
  $('#keyStats').innerHTML = [
    ['Storage', plan.storage + ' NVMe'], ['RAM', plan.ram], ['CPU', plan.cpu], ['Bandwidth', plan.bandwidth]
  ].map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('');

  const cycleSelect = $('#cycle');
  cycleSelect.value = cycle;

  function updateSummary() {
    const p = priceFor(plan, cycle);
    $('#sumPlan').textContent = plan.name;
    $('#sumCycle').textContent = p.cycle.label;
    $('#sumSubtotal').textContent = fmtUSD(p.listUSD);
    $('#sumDiscountRow').hidden = p.saveUSD <= 0;
    $('#sumDiscountLabel').textContent = `Yearly discount (${p.savePct}%)`;
    $('#sumDiscount').textContent = '−' + fmtUSD(p.saveUSD);
    $('#sumDomainRow').hidden = cycle !== 'annually';
    $('#sumTotalUSD').textContent = fmtUSD(p.usd);
    $('#sumTotalBDT').textContent = fmtBDT(p.bdt);
    $('#sumPerMonth').textContent = `${fmtUSD(p.perMonthUSD)}/mo · ${fmtBDT(p.perMonthUSD * BDT_RATE)}/mo`;
    history.replaceState(null, '', `?plan=${plan.id}&cycle=${cycle}`);
  }
  cycleSelect.addEventListener('change', () => { cycle = cycleSelect.value; updateSummary(); });
  updateSummary();

  /* Step 1: customer details */
  const form = $('#detailsForm');
  const payStep = $('#paymentStep');
  const steps = $$('#stepper li');
  let order = null;

  const cleanDomain = v => v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  const validators = {
    name: v => v.trim().length >= 3,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: v => /^\+?[0-9][0-9\s-]{7,15}$/.test(v.trim()),
    domain: v => /^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{2,63})+$/.test(cleanDomain(v))
  };

  $$('.field input', form).forEach(input => input.addEventListener('input', () => {
    if (validators[input.name](input.value)) input.closest('.field').classList.remove('invalid');
  }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    $$('.field input', form).forEach(input => {
      const ok = validators[input.name](input.value);
      input.closest('.field').classList.toggle('invalid', !ok);
      input.setAttribute('aria-invalid', !ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    const p = priceFor(plan, cycle);
    order = {
      ref: 'FH-' + Date.now().toString(36).toUpperCase().slice(-6),
      planName: plan.name, cycle,
      name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim(),
      domain: cleanDomain(data.domain),
      usd: p.usd, bdt: Math.round(p.bdt)
    };

    form.classList.add('done');
    cycleSelect.disabled = true;
    $('#detailsSummary').innerHTML =
      `<strong>${esc(order.name)}</strong><span>${esc(order.email)}</span><span>${esc(order.phone)}</span><span>${esc(order.domain)}</span>`;
    payStep.hidden = false;
    $('#payAmount').textContent = `${fmtUSD(order.usd)} · ${fmtBDT(order.bdt)}`;
    steps[1].classList.add('active');
    payStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#editDetails').addEventListener('click', () => {
    form.classList.remove('done');
    cycleSelect.disabled = false;
    payStep.hidden = true;
    steps[1].classList.remove('active');
    $('input', form).focus();
  });

  /* Step 2: payment gateway */
  $('#gatewayList').innerHTML = `
    <div class="gateway selected">
      <input type="radio" name="gateway" value="stripe" checked hidden>
      <span class="gateway-body">
        <span class="gateway-logo gw-stripe">Pay by card <small>via Stripe</small></span>
        <span class="gateway-note">${PAYMENT_GATEWAYS.stripe.note}</span>
      </span>
      <span class="card-brands" aria-label="Accepted cards">
        <i class="brand visa">VISA</i>
        <i class="brand mc"><b></b><b></b></i>
        <i class="brand amex">AMEX</i>
      </span>
    </div>
    <ol class="next-steps">
      <li>Click <strong>Pay with card</strong> below.</li>
      <li>Stripe's secure payment page opens.</li>
      <li>Enter your <strong>card number, expiry date and CVC</strong> there.</li>
      <li>Your hosting is activated as soon as the payment clears.</li>
    </ol>`;

  $('#payButton').addEventListener('click', () => {
    if (!order) return;
    const key = $('input[name="gateway"]:checked').value;
    const gw = PAYMENT_GATEWAYS[key];

    if (gw.url) {
      const qs = new URLSearchParams({
        ref: order.ref, plan: order.planName, cycle: order.cycle,
        amount_usd: order.usd, amount_bdt: order.bdt,
        name: order.name, email: order.email, phone: order.phone, domain: order.domain
      });
      location.href = gw.url + (gw.url.includes('?') ? '&' : '?') + qs;
      return;
    }

    steps[2].classList.add('active');
    $('#orderLayout').hidden = true;
    $('#orderDone').hidden = false;
    $('#doneRef').textContent = order.ref;
    $('#doneGateway').textContent = gw.name;
    $('#donePlan').textContent = `${order.planName} · ${BILLING_CYCLES[order.cycle].label}`;
    $('#doneDomain').textContent = order.domain;
    $('#doneAmount').textContent = `${fmtUSD(order.usd)} · ${fmtBDT(order.bdt)}`;
    $('#doneEmail').textContent = order.email;
    const body = [
      `Order reference: ${order.ref}`,
      `Plan: ${order.planName}`,
      `Billing: ${BILLING_CYCLES[order.cycle].label}`,
      `Amount: ${fmtUSD(order.usd)} (${fmtBDT(order.bdt)})`,
      `Preferred payment: ${gw.name}`,
      '',
      `Name: ${order.name}`,
      `Email: ${order.email}`,
      `Phone: ${order.phone}`,
      `Domain: ${order.domain}`
    ].join('\n');
    $('#sendOrder').href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('New hosting order ' + order.ref)}&body=${encodeURIComponent(body)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- FAQ ---------- */
function initFaq() {
  $$('.faq-item > button').forEach(btn => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  initShared();
  initIndex();
  initOrder();
  initFaq();
});
