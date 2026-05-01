<script>
// ============================================================
// CONFIG
// ============================================================
const GOOGLE_CLIENT_ID = '387324579052-6h4kfrged2l08n9vcbehqfuname7165n.apps.googleusercontent.com';
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// ============================================================
// CARD DATABASE — issuer → known cards with reward structures
// ============================================================
const CARD_DATABASE = {
  'amex': {
    color: '#006fcf',
    cards: {
      'Amex Gold': {rewards:{dining:'4x',groceries:'4x',travel:'3x',gas:'1x',other:'1x'},notes:'Best for dining & groceries. 4x MR points.'},
      'Amex Platinum': {rewards:{travel:'5x',dining:'1x',other:'1x'},notes:'Best for flights & hotels. 5x MR on flights booked directly.'},
      'Amex Blue Cash Preferred': {rewards:{groceries:'6%',streaming:'6%',gas:'3%',transit:'3%',other:'1%'},notes:'Best cashback for groceries (up to $6k/yr).'},
      'Amex Blue Cash Everyday': {rewards:{groceries:'3%',gas:'3%',online:'3%',other:'1%'},notes:'No annual fee cashback card.'},
      'Amex Green': {rewards:{travel:'3x',transit:'3x',dining:'3x',other:'1x'},notes:'Good all-around travel card.'},
      'Other Amex': {rewards:{other:'1x'},notes:'General Amex card.'},
    }
  },
  'capital-one': {
    color: '#d03027',
    cards: {
      'Venture X': {rewards:{travel:'10x',dining:'2x',other:'2x'},notes:'Premium travel card. 10x on hotels/cars via portal. No FTF.'},
      'Venture': {rewards:{travel:'5x',other:'2x'},notes:'2x miles on everything. No FTF. Great for international.'},
      'SavorOne': {rewards:{dining:'3%',entertainment:'3%',groceries:'3%',streaming:'3%',other:'1%'},notes:'Best no-AF card for dining & entertainment.'},
      'Savor': {rewards:{dining:'4%',entertainment:'4%',groceries:'3%',streaming:'3%',other:'1%'},notes:'Premium dining rewards.'},
      'Quicksilver': {rewards:{other:'1.5%'},notes:'Simple 1.5% cashback on everything.'},
      'Other Capital One': {rewards:{other:'1%'},notes:'General Capital One card.'},
    }
  },
  'wells-fargo': {
    color: '#d71e28',
    cards: {
      'Active Cash': {rewards:{other:'2%'},notes:'Flat 2% cashback on everything.'},
      'Autograph': {rewards:{dining:'3x',travel:'3x',gas:'3x',transit:'3x',streaming:'3x',other:'1x'},notes:'No-AF card with 3x on popular categories.'},
      'Autograph Journey': {rewards:{travel:'5x',dining:'4x',gas:'1x',other:'1x'},notes:'Premium travel card with no FTF.'},
      'Other Wells Fargo': {rewards:{other:'1x'},notes:'General Wells Fargo card.'},
    }
  },
  'discover': {
    color: '#ff6000',
    cards: {
      'Discover it Cash Back': {rewards:{rotating:'5%',other:'1%'},notes:'5% rotating quarterly categories (activate). 1% all else. Cashback match first year.'},
      'Discover it Miles': {rewards:{other:'1.5x'},notes:'1.5x miles on everything. Miles match first year.'},
      'Discover it Chrome': {rewards:{dining:'2%',gas:'2%',other:'1%'},notes:'2% at gas & restaurants.'},
      'Other Discover': {rewards:{other:'1%'},notes:'General Discover card.'},
    }
  },
  'chase': {
    color: '#1a6dcc',
    cards: {
      'Sapphire Preferred': {rewards:{travel:'5x',dining:'3x',streaming:'3x',online:'3x',other:'1x'},notes:'Great travel card. 5x on travel via Chase portal. No FTF.'},
      'Sapphire Reserve': {rewards:{travel:'10x',dining:'3x',other:'1x'},notes:'Premium. 10x on hotels/cars via portal. $300 travel credit. No FTF.'},
      'Freedom Unlimited': {rewards:{dining:'3%',drugstore:'3%',travel:'5%',other:'1.5%'},notes:'No-AF card. 3% dining. Pairs with Sapphire.'},
      'Freedom Flex': {rewards:{rotating:'5%',dining:'3%',drugstore:'3%',other:'1%'},notes:'5% rotating categories (activate). 3% dining.'},
      'Ink Business Preferred': {rewards:{travel:'3x',shipping:'3x',internet:'3x',advertising:'3x',other:'1x'},notes:'Business card. Great for travel & business expenses.'},
      'Amazon Prime Visa': {rewards:{shopping:'5%',dining:'2%',gas:'2%',drugstore:'2%',other:'1%'},notes:'5% back at Amazon & Whole Foods with Prime.'},
      'Other Chase': {rewards:{other:'1x'},notes:'General Chase card.'},
    }
  },
  'citi': {
    color: '#003B70',
    cards: {
      'Double Cash': {rewards:{other:'2%'},notes:'2% on everything (1% buy + 1% pay). Simple and effective.'},
      'Custom Cash': {rewards:{topCategory:'5%',other:'1%'},notes:'5% on your top eligible spend category each billing cycle (up to $500).'},
      'Strata Premier': {rewards:{dining:'3x',groceries:'3x',gas:'3x',travel:'3x',other:'1x'},notes:'Solid no-AF multi-category card.'},
      'Other Citi': {rewards:{other:'1%'},notes:'General Citi card.'},
    }
  },
  'usbank': {
    color: '#BE1E2D',
    cards: {
      'Altitude Go': {rewards:{dining:'4x',groceries:'2x',streaming:'2x',gas:'2x',other:'1x'},notes:'4x dining, no AF.'},
      'Altitude Connect': {rewards:{travel:'4x',gas:'2x',groceries:'2x',streaming:'2x',other:'1x'},notes:'4x travel. $30k annual spend bonus.'},
      'Cash+': {rewards:{chosen2:'5%',chosen1:'2%',other:'1%'},notes:'5% on 2 categories you choose, 2% on 1 you choose. Customizable.'},
      'Other US Bank': {rewards:{other:'1%'},notes:'General US Bank card.'},
    }
  },
  'bofa': {
    color: '#012169',
    cards: {
      'Customized Cash': {rewards:{chosen:'3%',groceries:'2%',other:'1%'},notes:'3% in category of your choice. Boosted with Preferred Rewards.'},
      'Premium Rewards': {rewards:{travel:'2x',dining:'2x',other:'1.5x'},notes:'1.5x everything. Good with Preferred Rewards tier.'},
      'Unlimited Cash': {rewards:{other:'1.5%'},notes:'Simple 1.5% cashback.'},
      'Travel Rewards': {rewards:{other:'1.5x'},notes:'1.5 points per dollar, no AF, no FTF.'},
      'Other BofA': {rewards:{other:'1%'},notes:'General BofA card.'},
    }
  },
  'other': {
    color: '#6c5ce7',
    cards: {
      'Other': {rewards:{other:'1%'},notes:''},
    }
  },
};

// Gmail search queries per issuer
const ISSUER_EMAIL_QUERIES = {
  'amex': 'from:(americanexpress.com OR aexp.com) subject:(transaction OR purchase OR charge OR spent OR "Large Purchase" OR "payment received" OR approved) newer_than:30d',
  'capital-one': 'from:(capitalone.com) subject:(transaction OR purchase OR charge OR spent) newer_than:30d',
  'wells-fargo': 'from:(wellsfargo.com OR wellsfargobank.com) subject:(transaction OR purchase OR charge OR "Your recent") newer_than:30d',
  'discover': 'from:(discover.com) subject:(transaction OR purchase OR charge OR "You made") newer_than:30d',
  'chase': 'from:(chase.com) subject:(transaction OR purchase OR charge OR alert OR payment) newer_than:30d',
  'citi': 'from:(citi.com OR citibank.com) subject:(transaction OR purchase OR charge) newer_than:30d',
  'usbank': 'from:(usbank.com) subject:(transaction OR purchase OR charge) newer_than:30d',
  'bofa': 'from:(bankofamerica.com OR ealerts.bankofamerica.com) subject:(transaction OR purchase OR charge OR alert) newer_than:30d',
};

// Separate queries specifically for payment confirmation emails
const PAYMENT_EMAIL_QUERIES = {
  'amex':        'from:(americanexpress.com OR aexp.com) subject:("payment received" OR "payment posted" OR "payment confirmed" OR "payment processed") newer_than:60d',
  'capital-one': 'from:(capitalone.com) subject:("payment received" OR "payment posted" OR "payment confirmed" OR "payment processed") newer_than:60d',
  'wells-fargo': 'from:(wellsfargo.com OR wellsfargobank.com) subject:("payment received" OR "payment posted" OR "payment confirmed") newer_than:60d',
  'discover':    'from:(discover.com) subject:("payment received" OR "payment posted" OR "payment confirmed") newer_than:60d',
  'chase':       'from:(chase.com) subject:("payment received" OR "payment posted" OR "payment confirmed" OR "payment processed") newer_than:60d',
  'citi':        'from:(citi.com OR citibank.com) subject:("payment received" OR "payment posted" OR "payment confirmed") newer_than:60d',
  'usbank':      'from:(usbank.com) subject:("payment received" OR "payment posted" OR "payment confirmed") newer_than:60d',
  'bofa':        'from:(bankofamerica.com OR ealerts.bankofamerica.com) subject:("payment received" OR "payment posted" OR "payment confirmed") newer_than:60d',
};

// ============================================================
// CATEGORIES
// ============================================================
const CATEGORIES = [
  {id:'dining',name:'Dining',icon:'🍽️',color:'#ff6b6b'},
  {id:'delivery',name:'Food Delivery',icon:'🛵',color:'#fd7e14'},
  {id:'groceries',name:'Groceries',icon:'🛒',color:'#00d2a0'},
  {id:'transport',name:'Transport',icon:'🚗',color:'#4dabf7'},
  {id:'travel',name:'Travel',icon:'✈️',color:'#339af0'},
  {id:'shopping',name:'Shopping',icon:'🛍️',color:'#ffd43b'},
  {id:'gas',name:'Gas',icon:'⛽',color:'#ff922b'},
  {id:'bills',name:'Bills',icon:'📄',color:'#845ef7'},
  {id:'fitness',name:'Health & Fitness',icon:'🏋️',color:'#51cf66'},
  {id:'entertainment',name:'Fun',icon:'🎬',color:'#e64980'},
  {id:'other',name:'Other',icon:'📦',color:'#868e96'},
];

// ============================================================
// STATE
// ============================================================
let CARDS = [];
let transactions = [];
let budgets = {};
let subscriptions = [];
let cardPayments = {};
let incomeEntries = [];
let savingsGoals = [];
let cardBalances = {};
let nextIncomeId = 1;
let nextGoalId = 1;
let debtStrategy = 'avalanche';
let selectedGoalIcon = '🎯';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedCard = 'all';
let trendView = 'overall';
let trendChart = null, dailyChart = null, pieChart = null;
let selectedCardInModal = '';
let selectedCatInModal = '';
let nextId = 1;
let nextCardId = 100;
let nextSubId = 1;
let gmailAccessToken = null;
let gmailUser = null;
let syncHistory = [];
let tokenClient = null;
let processedEmailIds = new Set();
let processedPaymentEmailIds = new Set();
let merchantRules = {};
let nightlySyncEnabled = false;
let nightlySyncTimer = null;
let newCardType = 'credit';
let newCardColor = '#6c5ce7';
let subCycle = 'monthly';
let yesterdayDismissed = false;
let yesterdayDismissedDate = '';

// ============================================================
// INIT
// ============================================================
function init() {
  loadFromStorage();
  if (CARDS.length === 0) {
    // Default cards
    CARDS = [
      {id:'amex',issuer:'amex',name:'Amex Gold',last4:'4521',color:'#006fcf',type:'credit'},
      {id:'capital-one',issuer:'capital-one',name:'Venture',last4:'8834',color:'#d03027',type:'credit'},
      {id:'wells-fargo',issuer:'wells-fargo',name:'Active Cash',last4:'3192',color:'#d71e28',type:'credit'},
      {id:'discover',issuer:'discover',name:'Discover it Cash Back',last4:'7760',color:'#ff6000',type:'credit'},
    ];
    saveToStorage();
  }
  const dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const hdEl = document.getElementById('headerDate'); if(hdEl) hdEl.textContent = dateStr;
  const hd2 = document.getElementById('headerDate2'); if(hd2) hd2.textContent = dateStr;
  document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
  updateMonthLabel();
  renderAll();
  autoPostSubscriptions(); // post any subscription charges whose billing day has passed
  updateGmailUI();
  updateNightlySyncUI();
  showYesterdaySummary();

  // Auto-sync if connected (silent re-auth attempt)
  if (gmailUser) {
    setTimeout(() => {
      if (gmailAccessToken) {
        syncGmail(true);
      } else {
        // Try silent re-auth
        trySilentReAuth();
      }
    }, 1500);
  }

  // Setup nightly sync timer
  if (nightlySyncEnabled) startNightlySyncTimer();
}

function loadFromStorage() {
  try {
    const s = localStorage.getItem('spendlens_v4');
    if (s) {
      const d = JSON.parse(s);
      transactions = d.transactions || [];
      CARDS = d.cards || [];
      budgets = d.budgets || {};
      subscriptions = d.subscriptions || [];
      nextId = d.nextId || 1;
      nextCardId = d.nextCardId || 100;
      nextSubId = d.nextSubId || 1;
      syncHistory = d.syncHistory || [];
      processedEmailIds = new Set(d.processedEmailIds || []);
      processedPaymentEmailIds = new Set(d.processedPaymentEmailIds || []);
      if (d.gmailUser) gmailUser = d.gmailUser;
      merchantRules = d.merchantRules || {};
      nightlySyncEnabled = d.nightlySyncEnabled || false;
      yesterdayDismissed = d.yesterdayDismissed || false;
      yesterdayDismissedDate = d.yesterdayDismissedDate || '';
      cardPayments = d.cardPayments || {};
      incomeEntries = d.incomeEntries || [];
      savingsGoals = d.savingsGoals || [];
      cardBalances = d.cardBalances || {};
      nextIncomeId = d.nextIncomeId || 1;
      nextGoalId = d.nextGoalId || 1;
    }
  } catch(e) {}
}

function saveToStorage() {
  try {
    localStorage.setItem('spendlens_v4', JSON.stringify({
      transactions, cards: CARDS, budgets, subscriptions,
      nextId, nextCardId, nextSubId, syncHistory,
      processedEmailIds: [...processedEmailIds],
      processedPaymentEmailIds: [...processedPaymentEmailIds],
      gmailUser, merchantRules, nightlySyncEnabled, yesterdayDismissed, yesterdayDismissedDate,
      cardPayments, incomeEntries, savingsGoals, cardBalances,
      nextIncomeId, nextGoalId,
    }));
  } catch(e) {}
}

// ============================================================
// GOOGLE AUTH — Persistent Login
// ============================================================
function initGoogleAuth() {
  if (typeof google === 'undefined') return;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES,
    callback: async (response) => {
      if (response.error) {
        showSyncBar('error', '❌', `Sign-in failed: ${response.error}`);
        return;
      }
      gmailAccessToken = response.access_token;
      // Store expiry for silent re-auth scheduling
      const expiresIn = response.expires_in || 3600;
      localStorage.setItem('spendlens_token_expiry', Date.now() + (expiresIn * 1000));
      scheduleTokenRefresh(expiresIn);

      try {
        const profileResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${gmailAccessToken}` }
        });
        const profile = await profileResp.json();
        gmailUser = { name: profile.name, email: profile.email, picture: profile.picture };
        saveToStorage();
        updateGmailUI();
        await syncGmail(false);
      } catch(e) {
        showSyncBar('error', '❌', 'Could not fetch Google profile');
      }
    },
  });
}

// Silent re-auth: requests new token without user interaction
function trySilentReAuth() {
  if (!tokenClient) {
    if (typeof google !== 'undefined') initGoogleAuth();
    else return;
  }
  try {
    tokenClient.requestAccessToken({ prompt: '' }); // Empty prompt = silent
  } catch(e) {
    // If silent fails, user may need to click sync
    console.log('Silent re-auth needs user interaction');
  }
}

// Auto-refresh token before expiry
function scheduleTokenRefresh(expiresInSec) {
  const refreshIn = Math.max((expiresInSec - 300) * 1000, 60000); // Refresh 5 min before expiry
  setTimeout(() => {
    if (gmailUser) trySilentReAuth();
  }, refreshIn);
}

function signInWithGoogle() {
  if (!tokenClient) {
    if (typeof google !== 'undefined') initGoogleAuth();
    else { showSyncBar('error', '❌', 'Google Sign-in not ready. Please refresh.'); return; }
  }
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

function signOutGoogle() {
  if (gmailAccessToken) {
    try { google.accounts.oauth2.revoke(gmailAccessToken, () => {}); } catch(e){}
  }
  gmailAccessToken = null;
  gmailUser = null;
  localStorage.removeItem('spendlens_token_expiry');
  saveToStorage();
  updateGmailUI();
  showSyncBar('success', '👋', 'Disconnected from Gmail');
}

function handleGmailSync() {
  if (!gmailUser || !gmailAccessToken) signInWithGoogle();
  else syncGmail(false);
}

// ============================================================
// NIGHTLY AUTO-SYNC
// ============================================================
function toggleNightlySync() {
  nightlySyncEnabled = !nightlySyncEnabled;
  saveToStorage();
  updateNightlySyncUI();
  if (nightlySyncEnabled) {
    startNightlySyncTimer();
    showSyncBar('success', '🌙', 'Nightly auto-sync enabled — syncs at midnight');
  } else {
    clearNightlySyncTimer();
    showSyncBar('success', '🔕', 'Nightly auto-sync disabled');
  }
}

function updateNightlySyncUI() {
  const toggle = document.getElementById('nightlySyncToggle');
  const dot = document.getElementById('nightlyDot');
  const text = document.getElementById('nightlyStatusText');
  toggle.classList.toggle('on', nightlySyncEnabled);
  dot.classList.toggle('active', nightlySyncEnabled);
  dot.classList.toggle('inactive', !nightlySyncEnabled);
  if (nightlySyncEnabled) {
    const nextSync = getNextMidnight();
    text.textContent = `Active · Next sync: ${nextSync.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`;
  } else {
    text.textContent = 'Disabled';
  }
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight;
}

function startNightlySyncTimer() {
  clearNightlySyncTimer();
  const msToMidnight = getNextMidnight().getTime() - Date.now();
  nightlySyncTimer = setTimeout(async () => {
    if (nightlySyncEnabled && gmailUser) {
      if (!gmailAccessToken) trySilentReAuth();
      // Wait a bit for re-auth
      setTimeout(async () => {
        if (gmailAccessToken) {
          await syncGmail(true);
          yesterdayDismissed = false;
          saveToStorage();
          showYesterdaySummary();
        }
        // Schedule next
        startNightlySyncTimer();
      }, 5000);
    }
  }, msToMidnight);
}

function clearNightlySyncTimer() {
  if (nightlySyncTimer) { clearTimeout(nightlySyncTimer); nightlySyncTimer = null; }
}

function showYesterdaySummary() {
  // Reset dismissed flag if it was from a different day
  const todayStr = new Date().toISOString().split('T')[0];
  if (yesterdayDismissed && yesterdayDismissedDate !== todayStr) {
    yesterdayDismissed = false;
    saveToStorage();
  }
  if (yesterdayDismissed) return;
  const yesterday = new Date(Date.now() - 86400000);
  const yDate = yesterday.toISOString().split('T')[0];
  const yTx = transactions.filter(tx => tx.date === yDate);
  if (yTx.length === 0) return;
  const yTotal = yTx.reduce((s,tx) => s + tx.amount, 0);
  const banner = document.getElementById('yesterdayBanner');
  document.getElementById('yesterdayAmount').textContent = '$' + yTotal.toLocaleString('en-US',{minimumFractionDigits:2});
  document.getElementById('yesterdayDetail').textContent = `${yTx.length} transaction${yTx.length>1?'s':''} on ${yesterday.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}`;
  banner.classList.add('visible');
}

// ============================================================
// GMAIL SYNC ENGINE
// ============================================================
async function syncGmail(silent = false) {
  if (!gmailAccessToken) return;
  if (!silent) showSyncBar('syncing', '⏳', 'Syncing Gmail…');
  updateSyncButton('syncing');

  let totalNew = 0;
  let errors = [];

  // Build queries from active cards' issuers
  const activeIssuers = [...new Set(CARDS.map(c => c.issuer).filter(i => ISSUER_EMAIL_QUERIES[i]))];

  for (const issuer of activeIssuers) {
    const query = ISSUER_EMAIL_QUERIES[issuer];
    if (!query) continue;
    const issuerCards = CARDS.filter(c => c.issuer === issuer);
    try {
      const ids = await searchGmailMessages(query);
      for (const msgId of ids) {
        if (processedEmailIds.has(msgId)) continue;
        const msg = await fetchGmailMessage(msgId);
        if (!msg) continue;
        const tx = parseEmailToTransaction(msg, issuer, issuerCards);
        if (tx) {
          transactions.push(tx);
          nextId++;
          totalNew++;
        }
        processedEmailIds.add(msgId);
      }
    } catch(e) {
      if (e.status === 401) {
        gmailAccessToken = null;
        updateGmailUI();
        showSyncBar('error', '🔐', 'Session expired. Tap Sync to re-authenticate.');
        return;
      }
      errors.push(issuer);
    }
  }

  // ── PAYMENT EMAIL PASS ──────────────────────────────
  let totalPayments = 0;
  for (const issuer of activeIssuers) {
    const payQuery = PAYMENT_EMAIL_QUERIES[issuer];
    if (!payQuery) continue;
    const issuerCards = CARDS.filter(c => c.issuer === issuer);
    try {
      const ids = await searchGmailMessages(payQuery);
      for (const msgId of ids) {
        if (processedPaymentEmailIds.has(msgId)) continue;
        const msg = await fetchGmailMessage(msgId);
        if (!msg) continue;
        const payment = parsePaymentEmail(msg, issuer, issuerCards);
        if (payment) {
          savePayment(payment.cardId, 'gmail', payment.amount, payment.date);
          totalPayments++;
        }
        processedPaymentEmailIds.add(msgId);
      }
    } catch(e) { /* non-fatal — payment emails best-effort */ }
  }

  const syncRecord = { time: new Date().toISOString(), found: totalNew, payments: totalPayments, errors: errors.length };
  syncHistory.unshift(syncRecord);
  if (syncHistory.length > 20) syncHistory.pop();

  // Auto-detect subscriptions from transaction patterns
  detectSubscriptions();

  saveToStorage();
  updateSyncButton('connected');
  renderAll();
  renderSyncHistory();

  if (!silent) {
    if (totalNew > 0 || totalPayments > 0) {
      const parts = [];
      if (totalNew > 0) parts.push(`<strong>${totalNew} transaction${totalNew>1?'s':''}</strong>`);
      if (totalPayments > 0) parts.push(`<strong>${totalPayments} payment${totalPayments>1?'s':''}</strong>`);
      showSyncBar('success', '✅', `${parts.join(' & ')} imported from Gmail`);
    } else {
      showSyncBar('success', '✓', 'Already up to date — no new transactions found');
    }
  }
}

async function searchGmailMessages(query) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${gmailAccessToken}` } });
  if (!resp.ok) { const e = new Error('Gmail API error'); e.status = resp.status; throw e; }
  const data = await resp.json();
  return (data.messages || []).map(m => m.id);
}

async function fetchGmailMessage(msgId) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${gmailAccessToken}` } });
  if (!resp.ok) return null;
  return await resp.json();
}

// ============================================================
// IMPROVED EMAIL PARSER (better Amex support)
// ============================================================
function parseEmailToTransaction(msg, issuer, issuerCards) {
  const headers = msg.payload?.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const dateHeader = headers.find(h => h.name === 'Date')?.value || '';

  let bodyText = '';
  function extractText(part) {
    if (!part) return;
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += decodeBase64(part.body.data) + '\n';
    } else if (part.mimeType === 'text/html' && part.body?.data && !bodyText) {
      const html = decodeBase64(part.body.data);
      // Preserve structure: block elements → newlines
      const structured = html
        .replace(/<\/?(tr|td|th|div|p|br|li|h[1-6])[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&#[0-9]+;/g, ' ').replace(/&[a-z]+;/g, ' ');
      bodyText += structured + '\n';
    }
    if (part.parts) part.parts.forEach(extractText);
  }
  extractText(msg.payload);
  if (!bodyText && msg.payload?.body?.data) {
    try { bodyText = decodeBase64(msg.payload.body.data); } catch(e) {}
  }

  // Keep both line-aware and collapsed versions
  const fullTextLines = subject + '\n' + bodyText;
  const fullText = fullTextLines.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');

  if (issuer === 'amex') return parseAmexEmail(fullText, fullTextLines, dateHeader, issuerCards, msg.id);
  return parseGenericEmail(fullText, dateHeader, issuer, issuerCards, msg.id);
}

function decodeBase64(data) {
  try { return atob(data.replace(/-/g, '+').replace(/_/g, '/')); } catch(e) { return ''; }
}

function parseAmexEmail(fullText, fullTextLines, dateHeader, issuerCards, msgId) {
  // Skip payment confirmation emails
  if (/payment\s*(received|confirmed|processed|posted)|thank\s*you\s*for\s*your\s*payment/i.test(fullText)) return null;

  const lines = fullTextLines.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // ── AMOUNT ──────────────────────────────────────
  // Strip asterisks: "$10.96*" → "$10.96"
  const cleanText = fullText.replace(/(\$[\d,]+\.\d{2})\s*\*/g, '$1');
  let amount = null;

  // Check each line for a standalone dollar amount (Amex table format)
  for (const line of lines) {
    const m = line.match(/^\$\s*([\d,]+\.\d{2})\s*\*?\s*$/);
    if (m) { amount = parseFloat(m[1].replace(/,/g, '')); break; }
  }
  // Fallback: amount adjacent to a day name
  if (!amount) {
    const m = cleanText.match(/\$\s*([\d,]+\.\d{2})\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i);
    if (m) amount = parseFloat(m[1].replace(/,/g, ''));
  }
  // Fallback: any dollar amount
  if (!amount) {
    const m = cleanText.match(/\$\s*([\d,]+\.\d{2})/);
    if (m) amount = parseFloat(m[1].replace(/,/g, ''));
  }
  if (!amount || amount <= 0 || amount > 50000) return null;

  // ── MERCHANT ─────────────────────────────────────
  // Strategy 1: Line before the amount line (Amex table layout)
  // e.g. "AMAZON MARKETPLACE NA PA" then "$10.96*" then "Mon, Mar 16, 2026"
  let merchant = null;
  for (let i = 0; i < lines.length; i++) {
    const amtMatch = lines[i].match(/\$\s*([\d,]+\.\d{2})\s*\*?/);
    if (amtMatch && Math.abs(parseFloat(amtMatch[1].replace(/,/g, '')) - amount) < 0.01) {
      for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
        const candidate = lines[j].replace(/\*/g, '').trim();
        if (
          candidate.length >= 3 && candidate.length <= 50 &&
          !/^(amount|date|transaction|purchase|charge|dear|aditya|account|card|click|view|terms|manage|email|notify|large|more\s*than|\$1\.00|1\.00)/i.test(candidate) &&
          !/^https?:/i.test(candidate) &&
          /[A-Za-z]{2,}/.test(candidate)
        ) { merchant = candidate; break; }
      }
      if (merchant) break;
    }
  }
  // Strategy 2: "MERCHANT  $XX.XX" on same line
  if (!merchant) {
    const m = fullText.match(/([A-Z][A-Z0-9\s&'.#\-\/]{3,40})\s+\$\s*[\d,]+\.\d{2}\s*\*?/);
    if (m) { const c = m[1].trim(); if (!/^(LARGE|PURCHASE|YOUR|AMERICAN|ACCOUNT|CARD|DEAR|EMAIL|CLICK|VIEW|TERMS|AMOUNT)/i.test(c)) merchant = c; }
  }
  // Strategy 3: "at MERCHANT on/for/ending"
  if (!merchant) {
    const m = fullText.match(/(?:at|AT)\s+([A-Z][A-Za-z0-9\s&'*.\-#\/]{2,40})(?:\s+on\s|\s+for\s|\s+ending|\s+Card|\.|,)/);
    if (m) merchant = m[1].trim();
  }
  // Strategy 4: "Merchant:" or "Description:"
  if (!merchant) {
    const m = fullText.match(/(?:Merchant|Description|Where)[:\s]+([A-Za-z0-9\s&'.\-#\/]{3,40})(?:\n|\.|,|$)/i);
    if (m) merchant = m[1].trim();
  }
  // Strategy 5: All-caps before day name
  if (!merchant) {
    const m = fullText.match(/([A-Z][A-Z\s&'.\-]{4,40})\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),/);
    if (m) { const c = m[1].trim(); if (!/^(LARGE|YOUR|AMERICAN|ACCOUNT|CARD|EMAIL|DEAR)/i.test(c)) merchant = c; }
  }

  if (!merchant) merchant = 'Amex Purchase';
  merchant = cleanMerchant(merchant);

  const date = extractDate(fullText, dateHeader);
  const time = extractTime(dateHeader);

  // ── CARD MATCHING ──────────────────────────────────
  // Amex uses 5-digit account numbers in emails (e.g. "Account Ending: 81002")
  // Take last 4 digits to match saved card
  let cardId = issuerCards[0]?.id || 'amex';
  const last4Match = fullText.match(/(?:account\s+ending|ending\s+in|ending:|card\s+ending|x{3,})\s*[:\s]*(\d{4,5})/i);
  if (last4Match) {
    const last4 = last4Match[1].slice(-4);
    const found = issuerCards.find(c => c.last4 === last4);
    if (found) cardId = found.id;
  }

  return {
    id: nextId, amount, merchant, card: cardId,
    category: autoCategory(merchant),
    date, time, source: 'gmail', emailId: msgId,
  };
}

function parseGenericEmail(fullText, dateHeader, issuer, issuerCards, msgId) {
  // Skip payment confirmation emails
  if (/payment\s*(received|confirmed|processed|posted)|thank\s*you\s*for\s*your\s*payment/i.test(fullText)) return null;

  let amount = null;
  let merchant = null;
  let cardId = issuerCards[0]?.id || issuer;

  // ── CAPITAL ONE ──────────────────────────────────────
  // Format: "on March 15, 2026, at RAZ*FNP E Retail Priva, a pending authorization
  //          or purchase in the amount of $7.20 was placed or charged on your
  //          Platinum Card ending in 0444"
  if (issuer === 'capital-one') {
    // Amount: "in the amount of $7.20"
    const capAmt = fullText.match(/(?:in\s+the\s+amount\s+of|amount\s+of)\s*\$\s*([\d,]+\.\d{2})/i);
    if (capAmt) amount = parseFloat(capAmt[1].replace(/,/g, ''));
    // Fallback
    if (!amount) { const m = fullText.match(/\$\s*([\d,]+\.\d{2})/); if(m) amount = parseFloat(m[1].replace(/,/g,'')); }

    // Merchant: "at RAZ*FNP E Retail Priva, a pending" — lazy match up to ", a pending/purchase"
    const capMerch = fullText.match(/\bat\s+(.+?),\s+a\s+(?:pending|purchase)/i);
    if (capMerch) merchant = capMerch[1].trim();

    // Card: "Card ending in 0444" or "Platinum Card ending in 0444"
    const capCard = fullText.match(/(?:card|account)\s+ending\s+in\s+(\d{4})/i);
    if (capCard) { const found = issuerCards.find(c => c.last4 === capCard[1]); if (found) cardId = found.id; }
  }

  // ── WELLS FARGO ──────────────────────────────────────
  // Format table rows: "Credit card    ...9476"
  //                    "Amount         $44.94"
  //                    "Merchant detail  LYFT *TEMP AUTH HOLD in +1855..., CA, USA"
  else if (issuer === 'wells-fargo') {
    // Amount: labeled row "Amount  $44.94"
    const wfAmt = fullText.match(/(?:^|\n)\s*Amount\s+\$?\s*([\d,]+\.\d{2})/im);
    if (wfAmt) amount = parseFloat(wfAmt[1].replace(/,/g, ''));
    if (!amount) { const m = fullText.match(/\$\s*([\d,]+\.\d{2})/); if(m) amount = parseFloat(m[1].replace(/,/g,'')); }

    // Merchant: "Merchant detail  LYFT *TEMP AUTH HOLD in +1855..., CA, USA"
    // Use lookahead to stop at " in +digits" location suffix
    const wfMerch = fullText.match(/Merchant\s*detail\s+(.+?)(?=\s+in\s+[+\d]|\s*\n|$)/im);
    if (wfMerch) merchant = wfMerch[1].trim();
    else {
      // fallback: "purchase at MERCHANT"
      const m = fullText.match(/(?:purchase|transaction)\s+(?:at|of)\s+([A-Za-z0-9\s&'*.\-#]{3,40})(?:\s+on|\s+for|\.|,|$)/i);
      if (m) merchant = m[1].trim();
    }

    // Card: "...9476" or "Credit card  ...9476"
    const wfCard = fullText.match(/\.{2,3}(\d{4})/);
    if (wfCard) { const found = issuerCards.find(c => c.last4 === wfCard[1]); if (found) cardId = found.id; }
  }

  // ── GENERIC FALLBACK (Chase, Citi, Discover, US Bank, BofA) ──
  else {
    const amountPatterns = [
      /(?:amount|charge|purchase|spent|transaction)[^$\d]*\$?\s*([\d,]+\.\d{2})/i,
      /\$\s*([\d,]+\.\d{2})/,
    ];
    for (const p of amountPatterns) { const m = fullText.match(p); if(m){amount=parseFloat(m[1].replace(/,/g,''));break;} }

    const merchantPatterns = [
      /(?:Merchant\s*detail|Merchant|merchant)[:\s]+([A-Za-z0-9\s&'*.\-#\/]{3,50?})(?:\s+in\s+[+\d]|\n|\.|,|$)/i,
      /(?:at|AT|purchase\s+at|charged\s+at|spent\s+at)\s+([A-Z][A-Za-z0-9\s&'*.\-#]{2,40?})(?:\s+on\s|\s+for\s|\s+ending|\.|,|$)/,
      /(?:store|retailer|Description)[:\s]+([A-Za-z0-9\s&'.\-#\/]{3,40?})(?:\n|\.|$)/i,
    ];
    for (const p of merchantPatterns) { const m = fullText.match(p); if(m){merchant=m[1].trim().replace(/\s+/g,' ');break;} }

    // Card matching: "ending in XXXX" or "...XXXX" or "x+XXXX"
    const last4Match = fullText.match(/(?:ending\s+in|ending|\.{2,3}|x{3,})\s*(\d{4})/i);
    if (last4Match) { const found = issuerCards.find(c => c.last4 === last4Match[1]); if (found) cardId = found.id; }
  }

  if (!amount || amount <= 0 || amount > 50000) return null;
  if (!merchant) merchant = `${issuer.charAt(0).toUpperCase()+issuer.slice(1)} Purchase`;
  merchant = cleanMerchant(merchant);

  const date = extractDate(fullText, dateHeader);
  const time = extractTime(dateHeader);

  return {
    id: nextId, amount, merchant, card: cardId,
    category: autoCategory(merchant),
    date, time, source: 'gmail', emailId: msgId,
  };
}

function cleanMerchant(m) {
  return m
    .replace(/\s+in\s+[+\d][\d\s,]+.*$/i, '')    // strip " in +18552800278, CA, USA"
    .replace(/\s+in\s+[A-Z]{2,},\s+[A-Z]{2}.*$/i, '') // strip " in CITY, CA, USA"
    .replace(/,\s*[A-Z]{2},?\s*USA\s*$/i, '')      // strip trailing ", CA, USA"
    .replace(/\*+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[#\d]+$/, '')
    .trim()
    .substring(0, 40);
}

function extractDate(fullText, dateHeader) {
  let date = new Date().toISOString().split('T')[0];
  if (dateHeader) {
    try { const d = new Date(dateHeader); if (!isNaN(d)) date = d.toISOString().split('T')[0]; } catch(e) {}
  }
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s*(\d{4})/i,
  ];
  for (const p of datePatterns) {
    const m = fullText.match(p);
    if (m) {
      try {
        let parsed;
        if (m[1].match(/^\d+$/)) {
          const yr = m[3].length === 2 ? '20'+m[3] : m[3];
          parsed = new Date(`${yr}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`);
        } else {
          parsed = new Date(`${m[1]} ${m[2]}, ${m[3]}`);
        }
        if (!isNaN(parsed)) { date = parsed.toISOString().split('T')[0]; break; }
      } catch(e) {}
    }
  }
  return date;
}

function extractTime(dateHeader) {
  if (dateHeader) {
    try { const d = new Date(dateHeader); if (!isNaN(d)) return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; } catch(e) {}
  }
  return '12:00';
}

// ============================================================
// AUTO-CATEGORIZE ENGINE
// ============================================================
function autoCategory(merchant) {
  const m = merchant.toLowerCase();
  const learnedKey = Object.keys(merchantRules).find(k => m.includes(k));
  if (learnedKey) return merchantRules[learnedKey];

  if (/dd\s*\*|doordash|uber\s*eat|ubereats|grubhub|postmates|seamless|instacart|gopuff|caviar|waitr|deliveroo|favor\b|shipt|door dash/i.test(m)) return 'delivery';
  if (/restaurant|grill|kitchen|bar\b|cafe|bistro|tavern|eatery|diner\b|dining|steakhouse|trattoria|izakaya|cantina|tapas|buffet|coffee|starbucks|dunkin|peet|philz|dutch bros|boba|bakery|bagel|donut|krispy|chipotle|mcdonald|burger king|wendy|taco bell|subway|chick.fil|popeye|domino|pizza|sushi|panda express|ihop|denny|panera|olive garden|cheesecake factory|red lobster|applebee|outback|chili|five guys|shake shack|in-n-out|jack in the box|sonic drive|dairy queen|jamba/i.test(m)) return 'dining';
  if (/whole foods|trader joe|costco|sam.s club|grocery|kroger|safeway|walmart|wegman|publix|sprouts|aldi|lidl|food lion|h-e-b|piggly|stop.shop|giant food|meijer|harris teeter|vons|ralphs|gelson/i.test(m)) return 'groceries';
  if (/airbnb|vrbo|hotel|marriott|hilton|hyatt|westin|sheraton|four seasons|ritz|holiday inn|hampton|courtyard|doubletree|resort|delta air|united air|american air|southwest|jetblue|spirit air|frontier|alaska air|flight|airline|hertz|avis|enterprise rent|amtrak/i.test(m)) return 'travel';
  if (/\buber\b(?!.*eat)/i.test(m)) return 'transport';
  if (/lyft|taxi|parking|toll|transit|metro|bart|caltrain|bus\b|train\b|zipcar|scooter/i.test(m)) return 'transport';
  if (/shell|bp\b|chevron|exxon|mobil|arco|citgo|sunoco|marathon|valero|circle k|wawa|speedway|gas\b|fuel\b/i.test(m)) return 'gas';
  if (/gym\b|fitness|planet fitness|equinox|24 hour|la fitness|crossfit|peloton|classpass|orangetheory|yoga|cvs|walgreen|rite aid|pharmacy|doctor|dentist|medical|hospital|health/i.test(m)) return 'fitness';
  if (/amazon|amzn|ebay|etsy|target|bestbuy|best buy|apple store|nike|adidas|lululemon|gap\b|old navy|nordstrom|macy|zara|uniqlo|ikea|wayfair|home depot|lowe/i.test(m)) return 'shopping';
  if (/electric|utility|water bill|internet|comcast|xfinity|spectrum|att\b|at&t|verizon|t-mobile|phone bill|insurance|geico|progressive|rent\b|mortgage|usps|fedex|ups\b/i.test(m)) return 'bills';
  if (/netflix|hulu|disney|hbo|max\b|peacock|spotify|apple music|youtube|audible|steam|playstation|xbox|nintendo|movie|cinema|amc\b|concert|ticketmaster|museum|bowling/i.test(m)) return 'entertainment';
  return 'other';
}

// ============================================================
// SUBSCRIPTION DETECTION
// ============================================================
function detectSubscriptions() {
  const merchantCounts = {};
  const recent = transactions.filter(tx => {
    const d = new Date(tx.date + 'T12:00:00');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return d >= threeMonthsAgo;
  });

  recent.forEach(tx => {
    const key = tx.merchant.toLowerCase().replace(/[^a-z0-9]/g,'');
    if (!merchantCounts[key]) merchantCounts[key] = {name: tx.merchant, amounts:[], cards: new Set(), category: tx.category};
    merchantCounts[key].amounts.push(tx.amount);
    merchantCounts[key].cards.add(tx.card);
  });

  const knownSubscriptions = ['netflix','hulu','disney','spotify','apple music','youtube','hbo','max','peacock','paramount','audible','amazon prime','chatgpt','openai','claude','anthropic','adobe','microsoft 365','dropbox','icloud','google one','nordvpn','express vpn','grammarly','canva','notion','figma','slack','zoom','github','linkedin','nyt','new york times','wsj','medium','substack','patreon','crunchyroll','funimation','apple tv','tidal','pandora','siriusxm','peloton','classpass','planet fitness','equinox','gym','crossfit'];

  Object.entries(merchantCounts).forEach(([key, data]) => {
    // Check if this looks like a subscription
    const isKnown = knownSubscriptions.some(sub => key.includes(sub.replace(/[^a-z0-9]/g,'')));
    const hasConsistentAmount = data.amounts.length >= 2 && new Set(data.amounts.map(a => a.toFixed(2))).size === 1;
    
    if (isKnown || (hasConsistentAmount && data.amounts.length >= 2)) {
      const existingSub = subscriptions.find(s => s.name.toLowerCase().replace(/[^a-z0-9]/g,'') === key);
      if (!existingSub) {
        const avgAmount = data.amounts[data.amounts.length-1]; // Use most recent
        subscriptions.push({
          id: nextSubId++,
          name: data.name,
          amount: avgAmount,
          cardId: [...data.cards][0],
          cycle: 'monthly',
          category: data.category,
          active: true,
          autoDetected: true,
        });
      }
    }
  });
}

// ── autoPostSubscriptions ────────────────────────────────────
// Runs on init and after adding a subscription.
// For every active subscription with a debitDay set:
//   - If today's date >= debitDay this month (or the debitDay has passed),
//     and no transaction for this sub already exists this month,
//     automatically post it as a transaction.
// For yearly subs: only posts if this is the correct month (based on startMonth).
function autoPostSubscriptions() {
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();
  let posted = 0;

  subscriptions.filter(s => s.active && s.debitDay).forEach(sub => {
    // For yearly: only post if current month matches the month the sub was added
    if (sub.cycle === 'yearly') {
      const addedMonth = sub.addedMonth !== undefined ? sub.addedMonth : todayMonth;
      if (addedMonth !== todayMonth) return; // not billing month
    }

    // Only post if billing day has arrived or passed this month
    if (todayDay < sub.debitDay) return;

    // Build the date string for the post: this month on the debitDay
    const daysInMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
    const postDay = Math.min(sub.debitDay, daysInMonth);
    const postDate = `${todayYear}-${String(todayMonth + 1).padStart(2,'0')}-${String(postDay).padStart(2,'0')}`;

    // Check if already posted this month (any transaction matching sub name + same month)
    const thisMonthPrefix = `${todayYear}-${String(todayMonth + 1).padStart(2,'0')}`;
    const alreadyPosted = transactions.some(tx => {
      return (
        tx.source === 'subscription' &&
        tx.subscriptionId === sub.id &&
        tx.date && tx.date.startsWith(thisMonthPrefix)
      );
    });

    if (!alreadyPosted) {
      transactions.push({
        id: nextId++,
        amount: sub.amount,
        merchant: sub.name,
        card: sub.cardId,
        category: sub.category || 'bills',
        date: postDate,
        time: '00:00',
        source: 'subscription',
        subscriptionId: sub.id,
      });
      posted++;
    }
  });

  if (posted > 0) {
    saveToStorage();
    renderAll();
    showSyncBar('success', '🔄', `<strong>${posted}</strong> subscription${posted > 1 ? 's' : ''} auto-posted`);
  }
}
function openReassignModal(txId) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'reassignOverlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="modal" style="padding-bottom:calc(20px + var(--safe-bottom))">
      <div class="modal-top">
        <h2>Edit Transaction</h2>
        <button class="modal-close" onclick="document.getElementById('reassignOverlay').remove()">✕</button>
      </div>
      <div style="font-size:13px;color:var(--text-dim);margin-bottom:16px">
        <strong style="color:var(--text)">${tx.merchant}</strong> — $${tx.amount.toFixed(2)}<br>
        Currently: <span style="color:var(--accent)">${CATEGORIES.find(c=>c.id===tx.category)?.icon} ${CATEGORIES.find(c=>c.id===tx.category)?.name||'Other'}</span>
      </div>
      <div class="form-label">Change Category</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        ${CATEGORIES.map(cat => `
          <button onclick="reassignCategory(${txId},'${cat.id}')" style="padding:12px 8px;border-radius:10px;border:1px solid ${tx.category===cat.id?'var(--accent)':'var(--border)'};background:${tx.category===cat.id?'rgba(108,92,231,0.15)':'var(--bg)'};color:var(--text);font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500">
            <span style="font-size:18px">${cat.icon}</span>${cat.name}
          </button>`).join('')}
      </div>
      <button class="submit-btn danger" style="font-size:14px;padding:12px" onclick="deleteTransaction(${txId})">🗑️ Delete Transaction</button>
      <div style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:10px">Category changes are remembered for future "${tx.merchant.split(' ')[0]}" transactions</div>
    </div>`;
  document.body.appendChild(overlay);
}

function reassignCategory(txId, newCatId) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;
  tx.category = newCatId;
  const key = tx.merchant.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).find(w => w.length > 2) || tx.merchant.toLowerCase().substring(0,6);
  merchantRules[key] = newCatId;
  saveToStorage();
  document.getElementById('reassignOverlay')?.remove();
  renderAll();
}

function deleteTransaction(txId) {
  if (!confirm('Delete this transaction?')) return;
  transactions = transactions.filter(t => t.id !== txId);
  saveToStorage();
  document.getElementById('reassignOverlay')?.remove();
  renderAll();
}

// ============================================================
// UI HELPERS
// ============================================================
function updateGmailUI() {
  const cta = document.getElementById('gmailCTA');
  const dot = document.getElementById('gmailDot');
  const btnText = document.getElementById('gmailBtnText');
  const btn = document.getElementById('gmailSyncBtn');
  const avatarWrap = document.getElementById('userAvatarWrap');
  if (gmailUser) {
    if(cta) cta.style.display = 'none';
    dot.className = 'gmail-dot on';
    btnText.textContent = 'Sync';
    btn.className = 'gmail-btn connected';
    if (gmailUser.picture && avatarWrap) avatarWrap.innerHTML = `<img class="user-avatar" src="${gmailUser.picture}" onclick="openSidePanel()">`;
  } else {
    if(cta) cta.style.display = 'flex';
    dot.className = 'gmail-dot';
    btnText.textContent = 'Sync';
    btn.className = 'gmail-btn';
    if(avatarWrap) avatarWrap.innerHTML = `<div class="user-avatar-placeholder" onclick="openSidePanel()">👤</div>`;
  }
  renderSettingsGmailSection();
  updateSidePanel();
}

function updateSyncButton(state) {
  const dot = document.getElementById('gmailDot');
  const btn = document.getElementById('gmailSyncBtn');
  if (state === 'syncing') {
    dot.className = 'gmail-dot syncing';
    btn.className = 'gmail-btn syncing';
    document.getElementById('gmailBtnText').textContent = 'Syncing…';
  } else if (state === 'connected') {
    dot.className = 'gmail-dot on';
    btn.className = 'gmail-btn connected';
    document.getElementById('gmailBtnText').textContent = 'Sync Now';
  }
}

function showSyncBar(type, icon, msg) {
  const bar = document.getElementById('syncBar');
  bar.className = `sync-bar visible ${type}`;
  document.getElementById('syncBarIcon').textContent = icon;
  document.getElementById('syncBarText').innerHTML = msg;
  if (type === 'success') setTimeout(hideSyncBar, 5000);
}
function hideSyncBar() { document.getElementById('syncBar').classList.remove('visible'); }

function renderSettingsGmailSection() {
  const el = document.getElementById('settingsGmailSection');
  if (!gmailUser) {
    el.innerHTML = `<div class="gmail-account-card" style="text-align:center;padding:24px">
      <div style="font-size:32px;margin-bottom:12px">📧</div>
      <div style="font-size:14px;color:var(--text-dim);margin-bottom:16px">Not connected to Gmail</div>
      <button class="gmail-cta-btn" style="margin:0 auto;display:flex" onclick="signInWithGoogle()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Connect Gmail
      </button>
    </div>`;
  } else {
    el.innerHTML = `<div class="gmail-account-card">
      <div class="gmail-account-info">
        ${gmailUser.picture ? `<img class="gmail-account-avatar" src="${gmailUser.picture}" alt="">` : '<div class="gmail-account-avatar" style="background:var(--bg);display:flex;align-items:center;justify-content:center">👤</div>'}
        <div><div class="gmail-account-name">${gmailUser.name}</div><div class="gmail-account-email">${gmailUser.email}</div></div>
      </div>
      <div class="gmail-account-actions">
        <button class="gmail-action-btn primary" onclick="syncGmail(false)">🔄 Sync Now</button>
        <button class="gmail-action-btn danger" onclick="signOutGoogle()">Disconnect</button>
      </div>
    </div>`;
  }
}

function renderSyncHistory() {
  const el = document.getElementById('syncHistoryList');
  if (syncHistory.length === 0) { el.textContent = 'No syncs yet'; return; }
  el.innerHTML = syncHistory.slice(0, 5).map(s => {
    const d = new Date(s.time);
    const label = d.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' ' + d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    return `<div class="sync-history-item"><span style="color:var(--text)">${label}</span><span style="color:${s.found>0?'var(--green)':'var(--text-dim)'}">+${s.found} transactions</span></div>`;
  }).join('');
}

// ============================================================
// SETTINGS — CARDS MANAGEMENT
// ============================================================
function renderSettingsCards() {
  const el = document.getElementById('settingsCardsList');
  el.innerHTML = CARDS.map(card => {
    const issuerDb = CARD_DATABASE[card.issuer];
    const cardInfo = issuerDb?.cards?.[card.name];
    return `<div class="setting-item" style="flex-wrap:wrap;gap:8px" onclick="openEditCardModal('${card.id}')">
      <div style="display:flex;align-items:center;gap:10px;flex:1">
        <div style="width:12px;height:36px;border-radius:3px;background:${card.color};flex-shrink:0"></div>
        <div>
          <div class="setting-label">${card.name} <span class="card-type-badge ${card.type||'credit'}">${card.type||'credit'}</span></div>
          <div class="setting-desc">•••• ${card.last4} · ${issuerDb ? card.issuer.replace(/-/g,' ') : 'Custom'}</div>
        </div>
      </div>
      <div class="setting-arrow">›</div>
    </div>`;
  }).join('');
}

// openAddCardModal defined below with full field reset (limit, payDay)

function onCardIssuerChange() {
  const issuer = document.getElementById('newCardIssuer').value;
  const sel = document.getElementById('newCardName');
  sel.innerHTML = '<option value="">Select card...</option>';
  if (issuer && CARD_DATABASE[issuer]) {
    const db = CARD_DATABASE[issuer];
    newCardColor = db.color;
    Object.keys(db.cards).forEach(name => {
      sel.innerHTML += `<option value="${name}">${name}</option>`;
    });
    renderColorPicker();
  }
}

function selectCardType(type) {
  newCardType = type;
  document.getElementById('cardTypeCredit').classList.toggle('selected', type==='credit');
  document.getElementById('cardTypeDebit').classList.toggle('selected', type==='debit');
}

function renderColorPicker() {
  const colors = ['#006fcf','#d03027','#d71e28','#ff6000','#1a6dcc','#003B70','#BE1E2D','#012169','#6c5ce7','#00d2a0','#e64980','#ff922b','#ffd43b','#51cf66','#868e96'];
  document.getElementById('colorPicker').innerHTML = colors.map(c =>
    `<div onclick="newCardColor='${c}';renderColorPicker()" style="width:32px;height:32px;border-radius:8px;background:${c};cursor:pointer;border:2px solid ${c===newCardColor?'white':'transparent'};transition:border 0.2s"></div>`
  ).join('');
}

// openEditCardModal defined below with full editing (name, limit, payDay, color, payments)

function getCardRewardsHTML(card) {
  const db = CARD_DATABASE[card.issuer]?.cards?.[card.name];
  if (!db) return '<em>No reward data available for this card.</em>';
  let html = '<div style="margin-bottom:8px;font-weight:600;color:var(--text)">Rewards:</div>';
  Object.entries(db.rewards).forEach(([cat, rate]) => {
    const catInfo = CATEGORIES.find(c => c.id === cat);
    html += `<div style="display:flex;justify-content:space-between;padding:4px 0"><span>${catInfo?.icon||'📌'} ${cat.charAt(0).toUpperCase()+cat.slice(1)}</span><span style="color:var(--green);font-family:'JetBrains Mono',monospace;font-weight:600">${rate}</span></div>`;
  });
  if (db.notes) html += `<div style="margin-top:8px;font-size:12px;color:var(--text-muted);font-style:italic">${db.notes}</div>`;
  return html;
}

function removeCard(cardId) {
  if (!confirm('Remove this card? Existing transactions will be kept.')) return;
  CARDS = CARDS.filter(c => c.id !== cardId);
  saveToStorage();
  document.getElementById('editCardOverlay')?.remove();
  renderAll();
  renderSettingsCards();
}

// ============================================================
// BUDGET SYSTEM
// ============================================================
function openSetBudgetModal() {
  const sel = document.getElementById('budgetTarget');
  sel.innerHTML = '<option value="overall">📊 Overall Monthly</option>';
  CARDS.forEach(card => {
    sel.innerHTML += `<option value="${card.id}">💳 ${card.name} (•••• ${card.last4})</option>`;
  });
  CATEGORIES.forEach(cat => {
    sel.innerHTML += `<option value="cat-${cat.id}">${cat.icon} ${cat.name}</option>`;
  });
  document.getElementById('budgetAmount').value = '';
  document.getElementById('setBudgetModal').classList.add('open');
}

function saveBudget() {
  const target = document.getElementById('budgetTarget').value;
  const amount = parseFloat(document.getElementById('budgetAmount').value);
  if (!target || !amount || amount <= 0) { alert('Please set a valid budget amount'); return; }
  budgets[target] = amount;
  saveToStorage();
  closeModal('setBudgetModal');
  renderAll();
  renderBudgets();
  showSyncBar('success', '🎯', `Budget set: $${amount.toLocaleString()}/month`);
}

function renderBudgets() {
  const el = document.getElementById('budgetsList');
  const f = getMonthTransactions(currentYear, currentMonth, 'all');
  
  if (Object.keys(budgets).length === 0) {
    el.innerHTML = `<div class="empty-state" style="padding:40px 20px"><div class="empty-state-icon">🎯</div>
      <div class="empty-state-title">No budgets set</div>
      <div class="empty-state-desc">Tap "Set Budget" to track spending limits per card or category</div></div>`;
    return;
  }

  el.innerHTML = Object.entries(budgets).map(([key, limit]) => {
    let label, spent, icon, color;
    if (key === 'overall') {
      label = 'Overall Monthly';
      icon = '📊';
      spent = f.reduce((s,tx) => s+tx.amount, 0);
      color = 'var(--accent)';
    } else if (key.startsWith('cat-')) {
      const catId = key.replace('cat-','');
      const cat = CATEGORIES.find(c => c.id === catId);
      label = cat?.name || catId;
      icon = cat?.icon || '📌';
      spent = f.filter(tx => tx.category === catId).reduce((s,tx) => s+tx.amount, 0);
      color = cat?.color || 'var(--accent)';
    } else {
      const card = CARDS.find(c => c.id === key);
      label = card ? `${card.name} (•••• ${card.last4})` : key;
      icon = '💳';
      spent = f.filter(tx => tx.card === key).reduce((s,tx) => s+tx.amount, 0);
      color = card?.color || 'var(--accent)';
    }
    const pct = Math.min((spent/limit)*100, 100);
    const remaining = limit - spent;
    const status = remaining > 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget!`;
    const barClass = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';
    const barColor = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : color;

    return `<div class="budget-card">
      <div class="budget-header">
        <div class="budget-card-name">${icon} ${label}</div>
        <div class="budget-amounts"><span class="budget-spent" style="color:${pct>=100?'var(--red)':'var(--text)'}">$${spent.toFixed(0)}</span><span class="budget-limit">/ $${limit.toLocaleString()}</span></div>
      </div>
      <div class="budget-bar"><div class="budget-bar-fill ${barClass}" style="width:${pct}%;background:${barColor}"></div></div>
      <div class="budget-status" style="display:flex;justify-content:space-between">
        <span style="color:${remaining<0?'var(--red)':'var(--text-dim)'}">${status}</span>
        <span style="cursor:pointer;color:var(--red);font-size:11px" onclick="deleteBudget('${key}')">Remove</span>
      </div>
    </div>`;
  }).join('');
}

function deleteBudget(key) {
  delete budgets[key];
  saveToStorage();
  renderBudgets();
  renderAll();
}

function renderTotalBudgetProgress(total) {
  const el = document.getElementById('totalBudgetProgress');
  if (!budgets.overall) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const limit = budgets.overall;
  const pct = Math.min((total/limit)*100, 100);
  document.getElementById('budgetSpentLabel').textContent = `$${total.toFixed(0)} spent`;
  document.getElementById('budgetLimitLabel').textContent = `$${limit.toLocaleString()} budget`;
  const fill = document.getElementById('budgetProgressFill');
  fill.style.width = pct + '%';
  fill.className = 'budget-progress-fill' + (pct >= 100 ? ' over' : pct >= 80 ? ' warn' : '');
}

// ============================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================
function renderSubscriptions() {
  const el = document.getElementById('subscriptionsList');
  const active = subscriptions.filter(s => s.active);
  if (active.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px">
      ${transactions.length > 0 ? 'No subscriptions detected yet. Sync more months of data or add manually.' : 'Add transactions to auto-detect subscriptions.'}
    </div>`;
    return;
  }
  const totalMonthly = active.reduce((s,sub) => s + (sub.cycle === 'yearly' ? sub.amount/12 : sub.amount), 0);
  el.innerHTML = `<div class="insight-card" style="margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="insight-title">Monthly Subscription Cost</div><div class="insight-value">$${totalMonthly.toFixed(2)}</div></div>
      <div style="text-align:right"><div style="font-size:12px;color:var(--text-dim)">Yearly</div><div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:600;color:var(--amber)">$${(totalMonthly*12).toFixed(0)}</div></div>
    </div>
  </div>` +
  active.map(sub => {
    const card = CARDS.find(c => c.id === sub.cardId);
    const cat = CATEGORIES.find(c => c.id === sub.category);
    // Check if already auto-posted this month
    const now = new Date();
    const nowMonthPrefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const postedThisMonth = transactions.some(tx =>
      tx.source === 'subscription' && tx.subscriptionId === sub.id &&
      tx.date && tx.date.startsWith(nowMonthPrefix)
    );
    const dayLabel = sub.debitDay ? ` · Bills on ${sub.debitDay}${['st','nd','rd'][((sub.debitDay+90)%100-10)%10-1]||'th'}` : '';
    return `<div class="sub-card">
      <div class="sub-icon" style="background:${cat?.color||'var(--accent)'}22">${cat?.icon||'📦'}</div>
      <div class="sub-info">
        <div class="sub-name">${sub.name} ${sub.autoDetected?'<span class="tx-sub-badge">Auto</span>':''}${postedThisMonth?'<span class="tx-sub-badge" style="background:rgba(0,210,160,0.15);color:var(--green)">✓ Posted</span>':''}</div>
        <div class="sub-meta">${card?.name||'Unknown'} · ${sub.cycle}${dayLabel}</div>
      </div>
      <div class="sub-amount">$${sub.amount.toFixed(2)}<span style="font-size:11px;color:var(--text-muted)">/${sub.cycle==='yearly'?'yr':'mo'}</span></div>
      <div class="sub-actions">
        <button class="sub-action-btn cancel" onclick="cancelSubscription(${sub.id})">✕</button>
      </div>
    </div>`;
  }).join('');
}

function openAddSubscriptionModal() {
  document.getElementById('addSubModal').classList.add('open');
  document.getElementById('subName').value = '';
  document.getElementById('subAmount').value = '';
  document.getElementById('subDebitDay').value = '';
  subCycle = 'monthly';
  document.getElementById('subCycleMonthly').classList.add('selected');
  document.getElementById('subCycleYearly').classList.remove('selected');
  const cardSel = document.getElementById('subCard');
  cardSel.innerHTML = CARDS.map(c => `<option value="${c.id}">${c.name} (•••• ${c.last4})</option>`).join('');
  const catSel = document.getElementById('subCategory');
  catSel.innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  catSel.value = 'entertainment';
}

function selectSubCycle(cycle) {
  subCycle = cycle;
  document.getElementById('subCycleMonthly').classList.toggle('selected', cycle==='monthly');
  document.getElementById('subCycleYearly').classList.toggle('selected', cycle==='yearly');
}

function saveSubscription() {
  const name = document.getElementById('subName').value.trim();
  const amount = parseFloat(document.getElementById('subAmount').value);
  const cardId = document.getElementById('subCard').value;
  const category = document.getElementById('subCategory').value;
  const debitDay = parseInt(document.getElementById('subDebitDay').value) || 1;
  if (!name || !amount) { alert('Please fill name and amount'); return; }
  subscriptions.push({ id: nextSubId++, name, amount, cardId, cycle: subCycle, category, active: true, autoDetected: false, debitDay, addedMonth: new Date().getMonth() });
  saveToStorage();
  closeModal('addSubModal');
  renderSubscriptions();
  // Auto-post immediately if billing day has already passed this month
  autoPostSubscriptions();
  renderAll();
}

function cancelSubscription(subId) {
  const sub = subscriptions.find(s => s.id === subId);
  if (!sub) return;
  if (confirm(`Mark "${sub.name}" as cancelled?`)) {
    sub.active = false;
    saveToStorage();
    renderSubscriptions();
  }
}

// ============================================================
// CARD OPTIMIZER
// ============================================================
function renderOptimizer() {
  const el = document.getElementById('optimizerList');
  
  // For each spending category, find the best card
  const spendingCategories = ['dining','groceries','travel','gas','transport','shopping','entertainment','delivery','bills','fitness','other'];
  const categoryMap = {
    'dining': ['dining'],
    'groceries': ['groceries'],
    'travel': ['travel'],
    'gas': ['gas'],
    'transport': ['transit','transport'],
    'shopping': ['shopping','online'],
    'entertainment': ['entertainment','streaming'],
    'delivery': ['dining','delivery'],
    'bills': ['bills'],
    'fitness': ['fitness','drugstore'],
    'other': ['other'],
  };

  el.innerHTML = spendingCategories.map(catId => {
    const cat = CATEGORIES.find(c => c.id === catId);
    let bestCard = null;
    let bestRate = '0';
    let bestRateNum = 0;

    CARDS.forEach(card => {
      const db = CARD_DATABASE[card.issuer]?.cards?.[card.name];
      if (!db) return;
      const lookupKeys = categoryMap[catId] || [catId];
      let rate = '0';
      for (const key of lookupKeys) {
        if (db.rewards[key]) { rate = db.rewards[key]; break; }
      }
      if (!rate || rate === '0') rate = db.rewards.other || '1%';
      
      const num = parseFloat(rate.replace(/[x%]/g, ''));
      if (num > bestRateNum) {
        bestRateNum = num;
        bestRate = rate;
        bestCard = card;
      }
    });

    if (!bestCard) return '';

    return `<div class="optimizer-card">
      <div class="opt-category"><span class="opt-cat-icon">${cat?.icon||'📌'}</span><span class="opt-cat-name">${cat?.name||catId}</span></div>
      <div class="opt-recommendation">
        <div class="opt-card-dot" style="background:${bestCard.color}"></div>
        <div style="flex:1"><div class="opt-card-name">${bestCard.name}</div><div class="opt-card-reason">•••• ${bestCard.last4}</div></div>
        <div class="opt-reward">${bestRate}</div>
      </div>
    </div>`;
  }).filter(Boolean).join('');

  // Calculate potential savings
  const f = getMonthTransactions(currentYear, currentMonth, 'all');
  let currentRewards = 0, optimalRewards = 0;
  f.forEach(tx => {
    const card = CARDS.find(c => c.id === tx.card);
    const currentDb = CARD_DATABASE[card?.issuer]?.cards?.[card?.name];
    const currentRate = parseFloat((currentDb?.rewards?.[tx.category] || currentDb?.rewards?.other || '1%').replace(/[x%]/g,''));
    currentRewards += tx.amount * (currentRate / 100);

    // Find optimal
    let bestRate = 0;
    CARDS.forEach(c => {
      const db = CARD_DATABASE[c.issuer]?.cards?.[c.name];
      if (!db) return;
      const lookupKeys = categoryMap[tx.category] || [tx.category];
      let rate = db.rewards.other || '1%';
      for (const key of lookupKeys) { if (db.rewards[key]) { rate = db.rewards[key]; break; } }
      const num = parseFloat(rate.replace(/[x%]/g,''));
      if (num > bestRate) bestRate = num;
    });
    optimalRewards += tx.amount * (bestRate / 100);
  });

  const missed = optimalRewards - currentRewards;
  document.getElementById('optimizerSavings').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="insight-title">You're earning</div><div class="insight-value" style="color:var(--green)">$${currentRewards.toFixed(2)}</div><div class="insight-note">in rewards this month</div></div>
      <div style="text-align:right"><div style="font-size:12px;color:var(--text-dim)">Could earn</div><div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:600;color:var(--amber)">$${optimalRewards.toFixed(2)}</div>
      ${missed > 1 ? `<div style="font-size:12px;color:var(--red);margin-top:2px">Missing $${missed.toFixed(2)}</div>` : '<div style="font-size:12px;color:var(--green);margin-top:2px">Optimized!</div>'}
      </div>
    </div>`;
}

// ============================================================
// MONTH NAV
// ============================================================
function updateMonthLabel() {
  const d = new Date(currentYear, currentMonth);
  document.getElementById('monthLabel').textContent = d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const now = new Date();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  document.getElementById('monthToday').classList.toggle('visible', !isCurrentMonth);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth()-5, 1);
  document.getElementById('monthPrev').disabled = (new Date(currentYear, currentMonth) <= sixMonthsAgo);
  document.getElementById('monthNext').disabled = isCurrentMonth;
}
function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  updateMonthLabel(); renderAll();
}
function goToCurrentMonth() {
  const now = new Date(); currentMonth = now.getMonth(); currentYear = now.getFullYear();
  updateMonthLabel(); renderAll();
}

// ============================================================
// FILTERING
// ============================================================
function getMonthTransactions(year, month, card) {
  // Build "YYYY-MM" prefix for the target month to compare directly against tx.date strings.
  // This avoids new Date(dateString) which parses as UTC and causes off-by-one month errors
  // in timezones behind UTC (e.g. "2026-04-01" UTC = March 31 in US timezones).
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return transactions.filter(tx => {
    return tx.date && tx.date.startsWith(monthStr) && (!card || card === 'all' || tx.card === card);
  }).sort((a,b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
}
function getFiltered() { return getMonthTransactions(currentYear, currentMonth, selectedCard); }

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  const f = getFiltered();
  renderTotal(f); renderCards(); renderTrendChart(); renderDailyChart(f);
  renderCategories(f); renderTransactions(f);
  renderSyncHistory(); renderSettingsCards();
}

function renderTotal(f) {
  const t = f.reduce((s,tx) => s+tx.amount, 0);
  document.getElementById('totalAmount').textContent = '$'+t.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('txCount').textContent = f.length;
  renderTotalBudgetProgress(t);
}

function renderCards() {
  const c = document.getElementById('cardsScroll');
  const allTx = getMonthTransactions(currentYear, currentMonth, 'all');
  const allTotal = allTx.reduce((s,tx) => s+tx.amount, 0);
  
  let h = `<div class="card-chip ${selectedCard==='all'?'active':''}" data-card="all" onclick="selectCard('all')">
    <div class="card-name">All Cards</div><div class="card-last4">Combined</div>
    <div class="card-amount">$${allTotal.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
    <div class="card-count">${allTx.length} transactions</div></div>`;

  CARDS.forEach(card => {
    const ctx = getMonthTransactions(currentYear, currentMonth, card.id);
    const ct = ctx.reduce((s,tx) => s+tx.amount, 0);
    const budget = budgets[card.id];
    const pct = budget ? Math.min((ct/budget)*100, 100) : 0;
    const barColor = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : card.color;
    h += `<div class="card-chip ${selectedCard===card.id?'active':''}" data-card="${card.id}" onclick="selectCard('${card.id}')" style="--card-color:${card.color}">
      <style>.card-chip[data-card="${card.id}"]::before{background:${card.color}}</style>
      <div class="card-name">${card.name}</div><div class="card-last4">•••• ${card.last4}</div>
      <div class="card-amount">$${ct.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
      <div class="card-count">${ctx.length} transactions</div>
      ${budget ? `<div class="card-budget-mini"><div class="card-budget-mini-fill" style="width:${pct}%;background:${barColor}"></div></div>` : ''}
    </div>`;
  });
  c.innerHTML = h;
}

function renderTrendChart() {
  const ctx = document.getElementById('trendChart').getContext('2d');
  if (trendChart) trendChart.destroy();
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    months.push({year:d.getFullYear(),month:d.getMonth(),label:d.toLocaleDateString('en-US',{month:'short'})});
  }
  if (trendView === 'overall') {
    const data = months.map(m => getMonthTransactions(m.year,m.month,'all').reduce((s,tx) => s+tx.amount,0));
    trendChart = new Chart(ctx,{type:'bar',data:{labels:months.map(m=>m.label),datasets:[{data,backgroundColor:months.map((m)=>(m.month===currentMonth&&m.year===currentYear)?'rgba(108,92,231,0.8)':'rgba(108,92,231,0.3)'),borderColor:'#6c5ce7',borderWidth:1,borderRadius:8}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(42,42,58,0.3)'},ticks:{color:'#7a7a90',font:{size:12,family:'DM Sans'}}},y:{grid:{color:'rgba(42,42,58,0.3)'},ticks:{color:'#7a7a90',font:{size:11,family:'JetBrains Mono'},callback:v=>'$'+v.toLocaleString()}}}}});
  } else {
    const datasets = CATEGORIES.map(cat => ({label:cat.name,backgroundColor:cat.color+'99',borderColor:cat.color,borderWidth:1,borderRadius:4,
      data:months.map(m => getMonthTransactions(m.year,m.month,'all').filter(tx=>tx.category===cat.id).reduce((s,tx)=>s+tx.amount,0))
    })).filter(ds => ds.data.some(v=>v>0));
    trendChart = new Chart(ctx,{type:'bar',data:{labels:months.map(m=>m.label),datasets},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7a90',font:{size:10,family:'DM Sans'},boxWidth:10,padding:8}}},
        scales:{x:{stacked:true,grid:{color:'rgba(42,42,58,0.3)'},ticks:{color:'#7a7a90',font:{size:12,family:'DM Sans'}}},y:{stacked:true,grid:{color:'rgba(42,42,58,0.3)'},ticks:{color:'#7a7a90',font:{size:11,family:'JetBrains Mono'},callback:v=>'$'+v.toLocaleString()}}}}});
  }
}

function setTrendView(view, btn) {
  trendView = view;
  document.querySelectorAll('.chart-toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTrendChart();
}

function renderDailyChart(f) {
  const ctx = document.getElementById('dailyChart').getContext('2d');
  if (dailyChart) dailyChart.destroy();
  const grouped = {};
  f.forEach(tx => { const d = tx.date.substring(8); grouped[d] = (grouped[d]||0)+tx.amount; });
  const labels = Object.keys(grouped).sort();
  dailyChart = new Chart(ctx,{type:'bar',data:{labels,datasets:[{data:labels.map(l=>grouped[l]),backgroundColor:'rgba(108,92,231,0.5)',borderColor:'#6c5ce7',borderWidth:1,borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(42,42,58,0.3)'},ticks:{color:'#7a7a90',font:{size:10,family:'JetBrains Mono'}}},y:{grid:{color:'rgba(42,42,58,0.3)'},ticks:{color:'#7a7a90',font:{size:10,family:'JetBrains Mono'},callback:v=>'$'+v}}}}});
}

function renderCategories(f) {
  const c = document.getElementById('categoriesGrid');
  const catTotals = {}; let mx = 0;
  CATEGORIES.forEach(cat => { const t = f.filter(tx=>tx.category===cat.id).reduce((s,tx)=>s+tx.amount,0); catTotals[cat.id]=t; if(t>mx)mx=t; });
  const sorted = [...CATEGORIES].sort((a,b) => catTotals[b.id]-catTotals[a.id]);
  c.innerHTML = sorted.map(cat => {
    const t = catTotals[cat.id]; const p = mx>0?(t/mx*100):0;
    return `<div class="cat-card"><div class="cat-icon">${cat.icon}</div><div class="cat-name">${cat.name}</div>
      <div class="cat-amount">$${t.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
      <div class="cat-bar"><div class="cat-bar-fill" style="width:${p}%;background:${cat.color}"></div></div></div>`;
  }).join('');
}

function renderTransactions(f) {
  const c = document.getElementById('transactionsList');
  if (f.length === 0) {
    c.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${gmailUser?'🔄':'📱'}</div>
      <div class="empty-state-title">${gmailUser?'No transactions found':'No transactions yet'}</div>
      <div class="empty-state-desc">${gmailUser?'Tap "Sync Now" to check for new emails':'Tap + to add or connect Gmail to auto-import'}</div></div>`;
    return;
  }
  const grouped = {};
  f.forEach(tx => { if (!grouped[tx.date]) grouped[tx.date]=[]; grouped[tx.date].push(tx); });
  const dates = Object.keys(grouped).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
  c.innerHTML = dates.map(date => {
    const d = new Date(date+'T12:00:00');
    let label = d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    if (date===today) label='Today'; if (date===yesterday) label='Yesterday';
    return `<div class="tx-date-group"><div class="tx-date">${label}</div>${grouped[date].map(tx => {
      const cat = CATEGORIES.find(c=>c.id===tx.category)||CATEGORIES[10];
      const card = CARDS.find(c=>c.id===tx.card);
      // Check if this is a subscription
      const isSub = subscriptions.some(s => s.active && tx.merchant.toLowerCase().includes(s.name.toLowerCase().substring(0,5)));
      return `<div class="tx-item ${tx.source==='gmail'?'gmail-sourced':''}" onclick="openReassignModal(${tx.id})">
        <div class="tx-icon" style="background:${cat.color}22">${cat.icon}</div>
        <div class="tx-details">
          <div class="tx-merchant">${tx.merchant}</div>
          <div class="tx-meta">
            <span class="tx-card-dot" style="background:${card?.color||'#666'}"></span>
            ${card?.name||'Unknown'} •••• ${card?.last4||'????'}
            ${tx.time!=='00:00'&&tx.time!=='12:00'?' · '+formatTime(tx.time):''}
            ${tx.source==='gmail'?'<span class="tx-source-badge">Gmail</span>':''}
            ${isSub?'<span class="tx-sub-badge">Subscription</span>':''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
          <div class="tx-amount" style="color:var(--red)">-$${tx.amount.toFixed(2)}</div>
          <div style="font-size:10px;color:var(--text-muted)">${cat.icon} Edit</div>
        </div></div>`;
    }).join('')}</div>`;
  }).join('');
}

function formatTime(t) {
  const [h,m] = t.split(':'); const hr = parseInt(h);
  return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?'PM':'AM'}`;
}

// ============================================================
// INSIGHTS
// ============================================================
function renderInsights(f) {
  const c = document.getElementById('insightsContent');
  const total = f.reduce((s,tx)=>s+tx.amount,0);
  const avg = f.length>0?total/f.length:0;
  const max = f.length>0?Math.max(...f.map(tx=>tx.amount)):0;
  const maxTx = f.find(tx=>tx.amount===max);
  const daysInMonth = new Date(currentYear,currentMonth+1,0).getDate();
  const merchants = {}; f.forEach(tx=>{merchants[tx.merchant]=(merchants[tx.merchant]||0)+tx.amount});
  const topM = Object.entries(merchants).sort((a,b)=>b[1]-a[1])[0];
  const gmailCount = f.filter(tx=>tx.source==='gmail').length;
  c.innerHTML = `
    <div class="insight-card"><div class="insight-title">Average Per Transaction</div><div class="insight-value">$${avg.toFixed(2)}</div><div class="insight-note">Across ${f.length} transactions</div></div>
    <div class="insight-card"><div class="insight-title">Daily Average</div><div class="insight-value">$${(total/daysInMonth).toFixed(2)}</div><div class="insight-note">Based on ${daysInMonth} days</div></div>
    <div class="insight-card"><div class="insight-title">Largest Transaction</div><div class="insight-value">$${max.toFixed(2)}</div><div class="insight-note">${maxTx?maxTx.merchant:'N/A'}</div></div>
    <div class="insight-card"><div class="insight-title">Top Merchant</div><div class="insight-value">${topM?topM[0]:'N/A'}</div><div class="insight-note">${topM?'$'+topM[1].toFixed(2)+' total':''}</div></div>
    ${gmailCount>0?`<div class="insight-card"><div class="insight-title">📧 Auto-Imported from Gmail</div><div class="insight-value">${gmailCount}</div><div class="insight-note">of ${f.length} total transactions this month</div></div>`:''}`;
  const pCtx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  const catData = CATEGORIES.map(cat=>({label:cat.name,value:f.filter(tx=>tx.category===cat.id).reduce((s,tx)=>s+tx.amount,0),color:cat.color})).filter(d=>d.value>0);
  if (catData.length===0) return;
  pieChart = new Chart(pCtx,{type:'doughnut',data:{labels:catData.map(d=>d.label),datasets:[{data:catData.map(d=>d.value),backgroundColor:catData.map(d=>d.color),borderColor:'#13131a',borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'right',labels:{color:'#7a7a90',font:{family:'DM Sans',size:12},padding:12}}}}});
}

// ============================================================
// MODAL & MANUAL ENTRY
// ============================================================
function openAddModal() {
  document.getElementById('addModal').classList.add('open');
  selectedCardInModal=''; selectedCatInModal='';
  document.getElementById('smsPaste').value='';
  document.getElementById('parsedPreview').classList.remove('visible');
  document.getElementById('txAmountInput').value='';
  document.getElementById('txMerchant').value='';
  document.getElementById('txDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('txTime').value='12:00';
  document.getElementById('cardSelectGroup').innerHTML=CARDS.map(card=>
    `<button class="card-select-btn" onclick="selectModalCard('${card.id}',this)" style="border-left:3px solid ${card.color}">${card.name} (${card.last4})</button>`).join('');
  document.getElementById('catSelectGroup').innerHTML=CATEGORIES.map(cat=>
    `<button class="cat-select-btn" onclick="selectModalCat('${cat.id}',this)"><span class="cat-sel-icon">${cat.icon}</span>${cat.name}</button>`).join('');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function selectModalCard(id,btn) { selectedCardInModal=id; document.querySelectorAll('#cardSelectGroup .card-select-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }
function selectModalCat(id,btn) { selectedCatInModal=id; document.querySelectorAll('#catSelectGroup .cat-select-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }

function parseSMS() {
  const text = document.getElementById('smsPaste').value.trim();
  if (!text) { alert('Please paste a bank text message first'); return; }
  let amount=null, merchant=null, cardId=null, date=null;
  const textLower = text.toLowerCase();

  // Detect card from text
  for (const card of CARDS) {
    const issuerNames = {
      'amex':'amex|american express','capital-one':'capital one','wells-fargo':'wells fargo',
      'discover':'discover','chase':'chase','citi':'citi','usbank':'us bank|usbank',
      'bofa':'bank of america|bofa',
    };
    const pattern = issuerNames[card.issuer];
    if (pattern && new RegExp(pattern, 'i').test(textLower)) { cardId = card.id; break; }
  }
  // Also try matching by last4
  if (!cardId) {
    const last4Match = text.match(/(\d{4})/);
    if (last4Match) {
      const found = CARDS.find(c => c.last4 === last4Match[1]);
      if (found) cardId = found.id;
    }
  }

  const amountMatch = text.match(/\$\s*([\d,]+\.?\d*)/);
  if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g,''));
  const merchantPatterns = [/(?:at|AT)\s+([A-Za-z0-9\s&'./-]+?)(?:\s+on\s|\s+ending|\s*\.|$)/i,/(?:purchase|transaction|charge)\s+(?:at|of)\s+([A-Za-z0-9\s&'./-]+?)(?:\s+on\s|\s+for\s|\s*\.|$)/i];
  for (const p of merchantPatterns) { const m=text.match(p); if(m){merchant=m[1].trim();break;} }
  const datePatterns = [/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s*(\d{2,4})/i];
  for (const p of datePatterns) {
    const m=text.match(p);
    if(m){
      if(m[1].match(/\d/)){const yr=m[3].length===2?'20'+m[3]:m[3];date=`${yr}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;}
      else{const months={jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};const mo=months[m[1].substring(0,3).toLowerCase()];const yr=m[3].length===2?'20'+m[3]:m[3];date=`${yr}-${mo}-${m[2].padStart(2,'0')}`;}
      break;
    }
  }
  if (!amount&&!merchant) { alert('Could not parse. Try entering manually.'); return; }
  if (amount) document.getElementById('txAmountInput').value=amount;
  if (merchant) document.getElementById('txMerchant').value=merchant;
  if (date) document.getElementById('txDate').value=date;
  if (cardId) { selectedCardInModal=cardId; document.querySelectorAll('#cardSelectGroup .card-select-btn').forEach(btn=>{ const card=CARDS.find(c=>c.id===cardId); btn.classList.toggle('selected',btn.textContent.includes(card?.last4||'xxxx')); }); }
  const autoCat = autoCategory(merchant || '');
  selectedCatInModal=autoCat;
  document.querySelectorAll('#catSelectGroup .cat-select-btn').forEach(btn=>{const matchCat=CATEGORIES.find(c=>c.id===autoCat);btn.classList.toggle('selected',matchCat&&btn.textContent.trim().toLowerCase().includes(matchCat.name.toLowerCase()));});
  const preview=document.getElementById('parsedPreview');preview.classList.add('visible');
  document.getElementById('parsedAmount').textContent=amount?'$'+amount.toFixed(2):'Not found';
  document.getElementById('parsedMerchant').textContent=merchant||'Not found';
  document.getElementById('parsedCard').textContent=cardId?CARDS.find(c=>c.id===cardId)?.name||cardId:'Not detected';
  document.getElementById('parsedDate').textContent=date||'Not found';
}

function saveTransaction() {
  const amount=parseFloat(document.getElementById('txAmountInput').value);
  const merchant=document.getElementById('txMerchant').value.trim();
  const date=document.getElementById('txDate').value;
  const time=document.getElementById('txTime').value||'12:00';
  if(!amount||!merchant||!date||!selectedCardInModal||!selectedCatInModal){alert('Please fill in all fields');return;}
  transactions.push({id:nextId++,amount,merchant,card:selectedCardInModal,category:selectedCatInModal,date,time,source:'manual'});
  saveToStorage(); closeModal('addModal');
  // Parse date string directly to avoid UTC timezone offset issue
  const parts=date.split('-'); currentYear=parseInt(parts[0]); currentMonth=parseInt(parts[1])-1;
  updateMonthLabel(); renderAll();
}

// ============================================================
// NAV & MISC
// ============================================================
function selectCard(id) { selectedCard=id; renderAll(); }

// ── Side Panel ──────────────────────────────────────
function openSidePanel() {
  document.getElementById('sidePanel').classList.add('open');
  document.getElementById('sideOverlay').classList.add('open');
}
function closeSidePanel() {
  document.getElementById('sidePanel').classList.remove('open');
  document.getElementById('sideOverlay').classList.remove('open');
}
function navTo(id) { showPage(id); closeSidePanel(); }

function updateSidePanel() {
  const nameEl=document.getElementById('spName');
  const emailEl=document.getElementById('spEmail');
  const userEl=document.getElementById('spUser');
  const dot=document.getElementById('spSyncDot');
  const syncEl=document.getElementById('spSync');
  const syncText=document.getElementById('spSyncText');
  if(gmailUser){
    if(nameEl) nameEl.textContent=gmailUser.name;
    if(emailEl) emailEl.textContent=gmailUser.email;
    if(gmailUser.picture&&userEl){
      const ph=userEl.querySelector('.sp-avatar-ph');
      if(ph){const img=document.createElement('img');img.className='sp-avatar';img.src=gmailUser.picture;ph.replaceWith(img);}
    }
    if(dot) dot.className='sp-sync-dot on';
    if(syncEl) syncEl.className='sp-sync on';
    if(syncText) syncText.textContent='Sync Now';
  } else {
    if(nameEl) nameEl.textContent='Not signed in';
    if(emailEl) emailEl.textContent='Connect Gmail to sync';
    if(dot) dot.className='sp-sync-dot';
    if(syncEl) syncEl.className='sp-sync';
    if(syncText) syncText.textContent='Connect Gmail';
  }
}

function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  // Scroll to top
  const scroll = document.getElementById('pageScroll');
  if(scroll) scroll.scrollTop = 0;
  // Update side panel active item
  document.querySelectorAll('.sp-item').forEach(n=>n.classList.remove('active'));
  document.querySelector(`.sp-item[data-page="${id}"]`)?.classList.add('active');
  if(id==='pageOptimizer'){renderInsights(getFiltered());renderOptimizer();}
  if(id==='pageBudget'){renderBudgets();renderSubscriptions();}
  if(id==='pageSettings'){renderSettingsGmailSection();renderSyncHistory();renderSettingsCards();updateNightlySyncUI();}
  if(id==='pageFinance') renderFinanceHub();
  if(id==='pageCashFlow') renderCashFlowCalendar();
  if(id==='pageGoals') renderGoals();
  if(id==='pageDebt') renderDebtPlanner();
  if(id==='pagePayments') renderPaymentsPage();
}

function exportData() {
  const headers=['Date','Time','Merchant','Amount','Card','Last4','Category','Source'];
  const rows=transactions.map(tx=>{const card=CARDS.find(c=>c.id===tx.card);const cat=CATEGORIES.find(c=>c.id===tx.category);return[tx.date,tx.time,tx.merchant,tx.amount.toFixed(2),card?.name,card?.last4,cat?.name,tx.source||'manual']});
  let csv=headers.join(',')+'\n';rows.forEach(r=>{csv+=r.map(v=>`"${v}"`).join(',')+'\n'});
  const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`spendlens_${new Date().toISOString().split('T')[0]}.csv`;a.click();URL.revokeObjectURL(url);
}

function clearAllData() {
  if (confirm('Clear ALL data? This removes everything including income, goals, and balances.')) {
    transactions=[]; CARDS=[]; budgets={}; subscriptions=[];
    cardPayments={}; incomeEntries=[]; savingsGoals=[]; cardBalances={};
    nextId=1; nextCardId=100; nextSubId=1; nextIncomeId=1; nextGoalId=1;
    syncHistory=[]; processedEmailIds=new Set(); processedPaymentEmailIds=new Set(); merchantRules={};
    saveToStorage(); location.reload();
  }
}

// ══════════════════════════════════════════════════════
// ADD CARD MODAL — credit limit + payDay fields
// ══════════════════════════════════════════════════════
function openAddCardModal() {
  document.getElementById('addCardModal').classList.add('open');
  document.getElementById('newCardIssuer').value='';
  document.getElementById('newCardName').innerHTML='<option value="">Select card...</option>';
  document.getElementById('newCardCustomName').value='';
  document.getElementById('newCardLast4').value='';
  const lim=document.getElementById('newCardLimit'); if(lim)lim.value='';
  const pay=document.getElementById('newCardPayDay'); if(pay)pay.value='';
  newCardType='credit'; newCardColor='#6c5ce7';
  document.getElementById('cardTypeCredit').classList.add('selected');
  document.getElementById('cardTypeDebit').classList.remove('selected');
  renderColorPicker();
}

function saveNewCard() {
  const issuer=document.getElementById('newCardIssuer').value;
  const cardName=document.getElementById('newCardName').value;
  const customName=document.getElementById('newCardCustomName').value.trim();
  const last4=document.getElementById('newCardLast4').value.trim();
  const creditLimit=parseFloat(document.getElementById('newCardLimit')?.value)||0;
  const payDay=parseInt(document.getElementById('newCardPayDay')?.value)||0;
  if(!issuer||!last4||last4.length!==4){alert('Please fill issuer and last 4 digits');return;}
  const name=customName||cardName||`${issuer} Card`;
  const id=`${issuer}-${last4}-${nextCardId++}`;
  CARDS.push({id,issuer,name,last4,color:newCardColor,type:newCardType,creditLimit,payDay});
  saveToStorage(); closeModal('addCardModal'); renderAll(); renderSettingsCards();
  showSyncBar('success','💳',`<strong>${name}</strong> added`);
}

// ══════════════════════════════════════════════════════
// EDIT CARD MODAL — full fields
// ══════════════════════════════════════════════════════
function openEditCardModal(cardId) {
  const card=CARDS.find(c=>c.id===cardId); if(!card)return;
  document.getElementById('editCardOverlay')?.remove();
  const cardNames=card.issuer&&CARD_DATABASE[card.issuer]?Object.keys(CARD_DATABASE[card.issuer].cards):[];
  const nameOpts=cardNames.map(n=>`<option value="${n}" ${n===card.name?'selected':''}>${n}</option>`).join('');
  const colors=['#006fcf','#d03027','#d71e28','#ff6000','#1a6dcc','#003B70','#BE1E2D','#012169','#6c5ce7','#00d2a0','#e64980','#ff922b','#ffd43b','#51cf66','#868e96'];
  const swatches=colors.map(c=>`<div id="esw-${c.replace('#','')}" onclick="pickEditColor('${c}')" style="width:26px;height:26px;border-radius:6px;background:${c};cursor:pointer;border:2px solid ${c===card.color?'white':'transparent'};flex-shrink:0"></div>`).join('');
  const payments=(cardPayments?.[cardId]||[]).slice(0,3);
  const pHtml=payments.length?payments.map(p=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text-dim)">${p.date} ${p.source==='gmail'?'📧':'✏️'}</span><span style="color:var(--green);font-family:'JetBrains Mono',monospace;font-weight:600">+$${p.amount.toFixed(2)}</span></div>`).join(''):'<div style="font-size:12px;color:var(--text-muted);padding:8px 0">No payments logged</div>';
  const overlay=document.createElement('div');
  overlay.className='modal-overlay open'; overlay.id='editCardOverlay';
  overlay.onclick=(e)=>{if(e.target===overlay)overlay.remove();};
  overlay.innerHTML=`<div class="modal" style="padding-bottom:calc(20px + var(--safe-bottom))">
    <div class="modal-top"><h2>Edit Card</h2><button class="modal-close" onclick="document.getElementById('editCardOverlay').remove()">✕</button></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><div style="width:5px;height:44px;border-radius:3px;background:${card.color};flex-shrink:0"></div><div><div style="font-size:15px;font-weight:700">${card.name}</div><div style="font-size:12px;color:var(--text-dim)">•••• ${card.last4} · ${card.type||'credit'}</div></div></div>
    ${cardNames.length?`<div class="form-group"><label class="form-label">Card Product</label><select class="form-input" id="editCardName" onchange="refreshEditRewards('${cardId}')">${nameOpts}<option value="">Other</option></select></div>`:''}
    <div class="form-group"><label class="form-label">Display Name (override)</label><input type="text" class="form-input" id="editCardDisplayName" value="${card.displayName||''}" placeholder="Custom name"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Credit Limit ($)</label><input type="number" class="form-input" id="editCardLimit" value="${card.creditLimit||''}" placeholder="10000" inputmode="decimal"></div>
      <div class="form-group"><label class="form-label">Payment Due Day</label><input type="number" class="form-input" id="editCardPayDay" value="${card.payDay||''}" placeholder="25" min="1" max="31" inputmode="numeric"></div>
    </div>
    <div class="form-group"><label class="form-label">Color</label><div style="display:flex;gap:5px;flex-wrap:wrap">${swatches}</div></div>
    <div id="editCardRewards" style="font-size:13px;color:var(--text-dim);margin-bottom:14px">${getCardRewardsHTML(card)}</div>
    <div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Payment History</span><button style="padding:4px 11px;border:1px solid var(--accent);border-radius:6px;background:transparent;color:var(--accent);font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer" onclick="openLogPaymentModal('${cardId}')">+ Log</button></div>${pHtml}</div>
    <button class="submit-btn" style="margin-bottom:8px" onclick="saveEditCard('${cardId}')">Save Changes</button>
    <button class="submit-btn danger" onclick="removeCard('${cardId}')">Remove Card</button>
  </div>`;
  document.body.appendChild(overlay);
}
function pickEditColor(c){document.querySelectorAll('[id^="esw-"]').forEach(e=>e.style.border='2px solid transparent');document.getElementById('esw-'+c.replace('#',''))?.style.setProperty('border','2px solid white');document.getElementById('editCardOverlay').dataset.color=c;}
function refreshEditRewards(cardId){const card=CARDS.find(c=>c.id===cardId);const name=document.getElementById('editCardName')?.value||card?.name;const el=document.getElementById('editCardRewards');if(el)el.innerHTML=getCardRewardsHTML({...card,name});}
function saveEditCard(cardId){
  const card=CARDS.find(c=>c.id===cardId);if(!card)return;
  const overlay=document.getElementById('editCardOverlay');
  const newName=document.getElementById('editCardName')?.value;
  const displayName=document.getElementById('editCardDisplayName')?.value.trim();
  const limit=parseFloat(document.getElementById('editCardLimit')?.value)||0;
  const payDay=parseInt(document.getElementById('editCardPayDay')?.value)||0;
  const color=overlay?.dataset?.color;
  if(newName&&newName!=='')card.name=newName;
  if(displayName){card.displayName=displayName;card.name=displayName;}
  card.creditLimit=limit; card.payDay=payDay;
  if(color)card.color=color;
  saveToStorage(); overlay?.remove(); renderAll(); renderSettingsCards();
  showSyncBar('success','💳','Card updated');
}
function openLogPaymentModal(cardId){
  document.getElementById('editCardOverlay')?.remove();
  const card=CARDS.find(c=>c.id===cardId);if(!card)return;
  const overlay=document.createElement('div');overlay.className='modal-overlay open';overlay.id='logPaymentOverlay';
  overlay.onclick=(e)=>{if(e.target===overlay)overlay.remove();};
  overlay.innerHTML=`<div class="modal" style="padding-bottom:calc(20px + var(--safe-bottom))"><div class="modal-top"><h2>Log Payment</h2><button class="modal-close" onclick="document.getElementById('logPaymentOverlay').remove()">✕</button></div><div style="font-size:13px;color:var(--text-dim);margin-bottom:14px">Payment for <strong style="color:var(--text)">${card.name} ••••${card.last4}</strong></div><div class="form-group"><label class="form-label">Amount ($)</label><input type="number" class="form-input" id="paymentAmount" placeholder="0.00" step="0.01" inputmode="decimal"></div><div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="paymentDate" value="${new Date().toISOString().split('T')[0]}"></div><button class="submit-btn green" onclick="savePayment('${cardId}','manual')">Save Payment</button></div>`;
  document.body.appendChild(overlay);
}
function savePayment(cardId,source,amount=null,date=null){
  const payAmt=amount||parseFloat(document.getElementById('paymentAmount')?.value);
  const payDate=date||document.getElementById('paymentDate')?.value;
  if(!payAmt||payAmt<=0||!payDate){if(!amount)alert('Enter a valid amount');return;}
  if(!cardPayments)cardPayments={};
  if(!cardPayments[cardId])cardPayments[cardId]=[];
  const exists=cardPayments[cardId].some(p=>p.date===payDate&&Math.abs(p.amount-payAmt)<0.01);
  if(!exists){cardPayments[cardId].unshift({date:payDate,amount:payAmt,source});if(cardPayments[cardId].length>20)cardPayments[cardId].pop();saveToStorage();showSyncBar('success','✅',`Payment of <strong>$${payAmt.toFixed(2)}</strong> recorded`);}
  document.getElementById('logPaymentOverlay')?.remove();
}

// ══════════════════════════════════════════════════════
// FINANCE HUB
// ══════════════════════════════════════════════════════
const INCOME_ICONS={salary:'💼',freelance:'💻',bonus:'🎁',investment:'📈',rental:'🏠',other:'📦'};
const INCOME_LABELS={salary:'Salary',freelance:'Freelance',bonus:'Bonus',investment:'Investment',rental:'Rental',other:'Other'};

function onFrequencyChange(){
  const freq=document.getElementById('incomeFrequency').value;
  const lbl=document.getElementById('incomeStartDateGroup')?.querySelector('.form-label');
  if(lbl){lbl.textContent=freq==='once'?'Date':freq==='monthly'?'Monthly Pay Day (any date this month)':'First Pay Date';}
}

function openIncomeModal(){
  document.getElementById('addIncomeModal').classList.add('open');
  document.getElementById('incomeAmount').value='';
  document.getElementById('incomeNote').value='';
  document.getElementById('incomeDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('incomeFrequency').value='monthly';
  onFrequencyChange();
}

function saveIncome(){
  const amount=parseFloat(document.getElementById('incomeAmount').value);
  const source=document.getElementById('incomeSource').value;
  const date=document.getElementById('incomeDate').value;
  const note=document.getElementById('incomeNote').value.trim();
  const frequency=document.getElementById('incomeFrequency').value;
  if(!amount||amount<=0||!date){alert('Please enter amount and date');return;}
  // For recurring entries, store payDay
  let payDay=0, recurring=false;
  if(frequency==='monthly'){recurring=true;payDay=new Date(date + 'T12:00:00').getDate();}
  else if(frequency==='biweekly'||frequency==='weekly'){recurring=true;payDay=0;}// use date as anchor
  incomeEntries.push({id:nextIncomeId++,amount,source,date,note,frequency,recurring,payDay});
  saveToStorage(); closeModal('addIncomeModal'); renderFinanceHub();
  showSyncBar('success','💵',`Income of <strong>$${amount.toLocaleString()}</strong> logged`);
}

function deleteIncome(id){incomeEntries=incomeEntries.filter(e=>e.id!==id);saveToStorage();renderFinanceHub();}

function getMonthIncome(year,month){
  const now=new Date();
  const monthPrefix = `${year}-${String(month+1).padStart(2,'0')}`;
  return incomeEntries.filter(e=>{
    if(e.frequency==='once') return e.date && e.date.startsWith(monthPrefix);
    if(e.frequency==='monthly') return true; // shows every month
    if(e.frequency==='biweekly'||e.frequency==='weekly'){
      // Count occurrences in this month
      return true; // simplified: always show if recurring
    }
    return e.date && e.date.startsWith(monthPrefix);
  }).reduce((s,e)=>{
    if(e.frequency==='biweekly') return s+(e.amount*2.17); // avg biweekly in a month
    if(e.frequency==='weekly') return s+(e.amount*4.33);
    return s+e.amount;
  },0);
}

// Get recurring income entries for calendar display
function getIncomeOccurrencesInMonth(year,month){
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthPrefix = `${year}-${String(month+1).padStart(2,'0')}`;
  const result=[]; // [{day, label, amount}]
  incomeEntries.forEach(e=>{
    // Parse date with T12:00:00 to avoid UTC offset issues
    const startDate=new Date(e.date + 'T12:00:00');
    if(e.frequency==='once'){
      if(e.date && e.date.startsWith(monthPrefix))
        result.push({day:startDate.getDate(),label:INCOME_LABELS[e.source]||'Income',amount:e.amount});
    } else if(e.frequency==='monthly'){
      const day=Math.min(e.payDay||startDate.getDate(),daysInMonth);
      result.push({day,label:INCOME_LABELS[e.source]||'Income',amount:e.amount});
    } else if(e.frequency==='biweekly'){
      // Generate biweekly dates starting from start date
      let d=new Date(startDate);
      while(d.getMonth()<month||(d.getFullYear()<year)) d=new Date(d.getTime()+14*86400000);
      while(d.getFullYear()===year&&d.getMonth()===month){
        result.push({day:d.getDate(),label:INCOME_LABELS[e.source]||'Income',amount:e.amount});
        d=new Date(d.getTime()+14*86400000);
      }
    } else if(e.frequency==='weekly'){
      let d=new Date(startDate);
      while(d.getMonth()<month||(d.getFullYear()<year)) d=new Date(d.getTime()+7*86400000);
      while(d.getFullYear()===year&&d.getMonth()===month){
        result.push({day:d.getDate(),label:INCOME_LABELS[e.source]||'Income',amount:e.amount});
        d=new Date(d.getTime()+7*86400000);
      }
    }
  });
  return result;
}

function renderFinanceHub(){
  const f=getFiltered();
  const totalSpent=f.reduce((s,tx)=>s+tx.amount,0);
  const totalIncome=getMonthIncome(currentYear,currentMonth);
  const savings=totalIncome-totalSpent;
  const savingsRate=totalIncome>0?(savings/totalIncome)*100:0;
  const hero=document.getElementById('finHero');
  if(hero){
    const rc=savingsRate>=20?'var(--green)':savingsRate>=10?'var(--amber)':'var(--red)';
    const rcls=savingsRate>=20?'':savingsRate>=10?' warn':' bad';
    hero.innerHTML=`<div class="fin-hero-row">
      <div class="fin-hero-item"><div class="fin-hero-label">Income</div><div class="fin-hero-value" style="color:var(--green)">${totalIncome>0?'$'+totalIncome.toLocaleString('en-US',{minimumFractionDigits:0}):'—'}</div><div class="fin-hero-sub">${totalIncome>0?'This month':'Tap + to add'}</div></div>
      <div class="fin-hero-item"><div class="fin-hero-label">Spent</div><div class="fin-hero-value" style="color:var(--red)">$${totalSpent.toLocaleString('en-US',{minimumFractionDigits:0})}</div><div class="fin-hero-sub">${f.length} transactions</div></div>
    </div>
    <div class="fin-divider"></div>
    <div class="fin-hero-row">
      <div class="fin-hero-item"><div class="fin-hero-label">Net Savings</div><div class="fin-hero-value" style="color:${savings>=0?'var(--green)':'var(--red)'}">${savings>=0?'+':'-'}$${Math.abs(savings).toLocaleString('en-US',{minimumFractionDigits:0})}</div><div class="fin-hero-sub">${savings>=0?'Saved 🎉':'Over budget'}</div></div>
      <div class="fin-hero-item"><div class="fin-hero-label">Savings Rate</div><div class="fin-hero-value" style="color:${rc}">${totalIncome>0?savingsRate.toFixed(1)+'%':'—'}</div><div class="fin-hero-sub">${savingsRate>=20?'Excellent 🌟':savingsRate>=10?'Good':savingsRate>0?'Try for 20%':'Log income first'}</div></div>
    </div>
    ${totalIncome>0?`<div class="savings-rate-bar"><div class="savings-rate-fill${rcls}" style="width:${Math.min(savingsRate,100)}%"></div></div>`:''}`;
  }
  renderVelocityCard(totalSpent);
  renderFinCardBalances(); // NEW: card balance vs transactions section
  const incEl=document.getElementById('incomeList');
  if(incEl){
    const entries=incomeEntries.filter(e=>{
      if(e.recurring)return true;
      const incMonthPrefix = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}`;
      return e.date && e.date.startsWith(incMonthPrefix);
    });
    if(!entries.length){incEl.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;border:1px dashed var(--border);border-radius:var(--radius-sm)">No income logged. Tap + to add.</div>`;}
    else incEl.innerHTML=entries.map(e=>`<div class="income-item"><div class="income-icon">${INCOME_ICONS[e.source]||'📦'}</div><div class="income-details"><div class="income-source">${INCOME_LABELS[e.source]||'Income'}${e.recurring?` <span style="font-size:9px;color:var(--accent);font-weight:700;padding:1px 5px;border-radius:4px;background:rgba(108,92,231,0.15)">${e.frequency==='biweekly'?'Bi-weekly':e.frequency==='weekly'?'Weekly':'Monthly'}</span>`:''}</div><div class="income-meta">${e.date}${e.note?' · '+e.note:''}</div></div><div class="income-amount">+$${e.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</div><span class="income-del" onclick="deleteIncome(${e.id})">✕</span></div>`).join('');
  }
  renderNetWorth(totalSpent);
}

function renderVelocityCard(currentSpent){
  const el=document.getElementById('velocityCard');if(!el)return;
  const now=new Date();
  const daysInMonth=new Date(currentYear,currentMonth+1,0).getDate();
  const dayOfMonth=(currentYear===now.getFullYear()&&currentMonth===now.getMonth())?now.getDate():daysInMonth;
  const dailyRate=dayOfMonth>0?currentSpent/dayOfMonth:0;
  const projectedTotal=dailyRate*daysInMonth;
  const pastTotals=[];
  for(let i=1;i<=3;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const t=getMonthTransactions(d.getFullYear(),d.getMonth(),'all').reduce((s,tx)=>s+tx.amount,0);if(t>0)pastTotals.push(t);}
  const baseline=pastTotals.length>0?pastTotals.reduce((a,b)=>a+b,0)/pastTotals.length:null;
  const pct=baseline?Math.min((currentSpent/baseline)*100,120):0;
  const fillColor=pct>=100?'var(--red)':pct>=80?'var(--amber)':'var(--green)';
  const daysLeft=daysInMonth-dayOfMonth;
  el.innerHTML=`<div class="velocity-card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="font-size:12px;color:var(--text-dim);font-weight:600">Daily Rate</div><div style="font-family:'JetBrains Mono',monospace;font-size:21px;font-weight:600;margin-top:2px">$${dailyRate.toFixed(2)}<span style="font-size:12px;color:var(--text-muted)">/day</span></div></div><div style="text-align:right"><div style="font-size:12px;color:var(--text-dim);font-weight:600">Projection</div><div style="font-family:'JetBrains Mono',monospace;font-size:21px;font-weight:600;margin-top:2px;color:${pct>=100?'var(--red)':pct>=80?'var(--amber)':'var(--text)'}">$${projectedTotal.toFixed(0)}</div></div></div>${baseline?`<div class="velocity-bar"><div class="velocity-fill" style="width:${pct}%;background:${fillColor}"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)"><span>${pct.toFixed(0)}% of avg ($${baseline.toFixed(0)})</span><span>${daysLeft}d left</span></div><div class="velocity-projection">${pct>=100?`⚠️ On track to <strong style="color:var(--red)">exceed</strong> avg by $${(projectedTotal-baseline).toFixed(0)}`:pct>=80?`📊 Approaching average — $${(baseline-currentSpent).toFixed(0)} buffer left`:`✅ Healthy — $${(baseline-projectedTotal).toFixed(0)} under average`}</div>`:'<div style="font-size:12px;color:var(--text-muted);margin-top:8px">More months of data needed for velocity</div>'}</div>`;
}

function renderNetWorth(currentSpent){
  const el=document.getElementById('netWorthCard');if(!el)return;
  // Use getEstimatedBalance so payments are reflected in the debt total
  const totalDebt=CARDS.filter(c=>(c.type||'credit')==='credit').reduce((s,card)=>s+getEstimatedBalance(card.id).estimated,0);
  const now=new Date();let estimatedCash=0;
  for(let i=0;i<3;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const inc=getMonthIncome(d.getFullYear(),d.getMonth());const spent=getMonthTransactions(d.getFullYear(),d.getMonth(),'all').reduce((s,tx)=>s+tx.amount,0);estimatedCash+=Math.max(inc-spent,0);}
  const netWorth=estimatedCash-totalDebt;
  el.innerHTML=`<div class="net-worth-card"><div class="nw-row"><span style="color:var(--text-dim)">💰 Estimated Cash (3mo)</span><span style="color:var(--green);font-family:'JetBrains Mono',monospace;font-weight:600">+$${estimatedCash.toLocaleString('en-US',{minimumFractionDigits:0})}</span></div><div class="nw-row"><span style="color:var(--text-dim)">💳 Card Debt (est.)</span><span style="color:${totalDebt>0?'var(--red)':'var(--text-dim)'};font-family:'JetBrains Mono',monospace;font-weight:600">${totalDebt>0?'-$'+totalDebt.toLocaleString('en-US',{minimumFractionDigits:0}):'$0'}</span></div><div class="nw-total"><span>Net Worth Est.</span><span style="color:${netWorth>=0?'var(--green)':'var(--red)'};font-family:'JetBrains Mono',monospace">${netWorth>=0?'+':'-'}$${Math.abs(netWorth).toLocaleString('en-US',{minimumFractionDigits:0})}</span></div>${totalDebt===0?'<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Log card balances in Debt Planner for accuracy</div>':''}</div>`;
}

// ── NEW: Card balances panel in Finance Hub ──────────────────
// Shows each card's: logged statement balance + current month charges
// = estimated total owed before next payment posts
// ── getEstimatedBalance ──────────────────────────────────────
// Returns the current real-time estimated amount owed on a card:
//   statementBalance (last logged) 
//   + all transactions on that card AFTER the statement date
//   - all payments made AFTER the statement date
// If no statement balance is logged, uses all transactions this month minus payments.
function getEstimatedBalance(cardId) {
  const b = cardBalances[cardId] || {};
  const statBal = b.statementBalance || 0;
  const lastUpdated = b.lastUpdated || null;

  // Current month prefix for filtering
  const now = new Date();
  const curMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  // All transactions on this card
  const allTx = transactions.filter(tx => tx.card === cardId);

  // All logged payments for this card
  const allPayments = cardPayments[cardId] || [];

  let charges = 0;
  let payments = 0;

  if (statBal > 0 && lastUpdated) {
    // Check if lastUpdated is in the current month
    const updatedInCurrentMonth = lastUpdated.startsWith(curMonthStr);

    if (updatedInCurrentMonth) {
      // Statement was logged this month — normal behavior
      charges = allTx.filter(tx => tx.date >= lastUpdated).reduce((s, tx) => s + tx.amount, 0);
      payments = allPayments.filter(p => p.date >= lastUpdated).reduce((s, p) => s + p.amount, 0);
    } else {
      // Statement was logged in a PREVIOUS month — roll forward:
      // 1. Compute what the balance was at end of last month (stat + old charges - old payments)
      const oldCharges = allTx.filter(tx => tx.date >= lastUpdated && !tx.date.startsWith(curMonthStr)).reduce((s, tx) => s + tx.amount, 0);
      const oldPayments = allPayments.filter(p => p.date >= lastUpdated && !p.date.startsWith(curMonthStr)).reduce((s, p) => s + p.amount, 0);
      const rolledBalance = Math.max(statBal + oldCharges - oldPayments, 0);

      // 2. Only show THIS month's charges and payments going forward
      charges = allTx.filter(tx => tx.date.startsWith(curMonthStr)).reduce((s, tx) => s + tx.amount, 0);
      payments = allPayments.filter(p => p.date.startsWith(curMonthStr)).reduce((s, p) => s + p.amount, 0);

      // Use rolled balance as the effective statement balance
      const estimated = Math.max(rolledBalance + charges - payments, 0);
      return { statBal: rolledBalance, charges, payments, estimated, lastUpdated: curMonthStr + '-01' };
    }
  } else {
    // No statement balance logged — only count current month
    charges = allTx.filter(tx => tx.date.startsWith(curMonthStr)).reduce((s, tx) => s + tx.amount, 0);
    payments = allPayments.filter(p => p.date.startsWith(curMonthStr)).reduce((s, p) => s + p.amount, 0);
  }

  const estimated = Math.max(statBal + charges - payments, 0);
  return { statBal, charges, payments, estimated, lastUpdated };
}

function renderFinCardBalances(){
  const el=document.getElementById('finCardBalances');
  if(!el)return;
  const creditCards=CARDS.filter(c=>(c.type||'credit')==='credit');
  if(!creditCards.length){
    el.innerHTML=`<div style="font-size:13px;color:var(--text-muted);padding:10px 0">No credit cards found. Add cards in Settings.</div>`;
    return;
  }
  let anyData=false;
  const rows=creditCards.map(card=>{
    const {statBal, charges, payments, estimated, lastUpdated} = getEstimatedBalance(card.id);
    const limit=card.creditLimit||0;
    const usedPct=limit>0?Math.min((estimated/limit)*100,100):0;
    const barColor=usedPct>=80?'var(--red)':usedPct>=50?'var(--amber)':'var(--green)';
    if(statBal>0||charges>0) anyData=true;
    // Determine how many columns we need in the stats grid
    const hasPayments = payments > 0;
    const cols = hasPayments ? '1fr 1fr 1fr' : '1fr 1fr';
    return `<div style="background:var(--bg-card);border:1px solid var(--border);border-left:4px solid ${card.color};border-radius:var(--radius-sm);padding:13px;margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:600">${card.name}</div>
          <div style="font-size:11px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-top:1px">•••• ${card.last4}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:${estimated>0?'var(--red)':'var(--green)'}">$${estimated.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:1px">Est. owed now</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:${cols};gap:7px;margin-bottom:${limit>0?'10px':'0'}">
        <div style="background:var(--bg);border-radius:7px;padding:9px">
          <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:0.3px">Statement Bal</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--amber);margin-top:3px">${statBal>0?'$'+statBal.toLocaleString('en-US',{minimumFractionDigits:2}):'$0.00'}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${lastUpdated?'as of '+lastUpdated:'Not logged'}</div>
        </div>
        <div style="background:var(--bg);border-radius:7px;padding:9px">
          <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:0.3px">${statBal>0?'New Charges':'This Month'}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--red);margin-top:3px">${charges>0?'+$'+charges.toLocaleString('en-US',{minimumFractionDigits:2}):'$0.00'}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${statBal>0&&lastUpdated?'since '+lastUpdated:'this month'}</div>
        </div>
        ${hasPayments?`<div style="background:var(--bg);border-radius:7px;padding:9px">
          <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:0.3px">Payments Made</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--green);margin-top:3px">-$${payments.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${statBal>0&&lastUpdated?'since '+lastUpdated:'this month'}</div>
        </div>`:''}
      </div>
      ${limit>0?`<div style="margin-top:2px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:3px">
          <span>${usedPct.toFixed(0)}% of $${limit.toLocaleString()} limit</span>
          <span>$${Math.max(limit-estimated,0).toLocaleString('en-US',{minimumFractionDigits:0})} available</span>
        </div>
        <div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
          <div style="height:100%;border-radius:3px;width:${usedPct}%;background:${barColor};transition:width 0.6s ease"></div>
        </div>
      </div>`:''}
    </div>`;
  }).join('');
  el.innerHTML=rows;
  if(!anyData){
    el.innerHTML+=`<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:8px 0">Log statement balances in the Debt Planner for accurate totals</div>`;
  }
}

// ══════════════════════════════════════════════════════
// CASH FLOW CALENDAR
// ══════════════════════════════════════════════════════
function renderCashFlowCalendar(){
  const calEl=document.getElementById('cashFlowCalendar');
  const warnEl=document.getElementById('cashFlowWarnings');
  if(!calEl)return;
  const year=currentYear,month=currentMonth;
  const today=new Date();
  const todayDay=(year===today.getFullYear()&&month===today.getMonth())?today.getDate():null;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstDay=new Date(year,month,1).getDay();
  const events={};
  const addEvent=(day,type,label,amount)=>{if(day<1||day>daysInMonth)return;if(!events[day])events[day]=[];events[day].push({type,label,amount});};
  subscriptions.filter(s=>s.active).forEach(s=>{const day=s.debitDay||1;addEvent(day,'sub',s.name,s.amount);});
  CARDS.forEach(card=>{if(card.payDay)addEvent(card.payDay,'payment',card.name+' due',cardBalances[card.id]?.statementBalance||0);});
  getIncomeOccurrencesInMonth(year,month).forEach(e=>addEvent(e.day,'income',e.label,e.amount));

  // Tight days: only UPCOMING days (today or future in current month, all days in future months)
  const warnings=[];
  Object.entries(events)
    .map(([d,evs])=>({day:parseInt(d),outflow:evs.filter(e=>e.type!=='income').reduce((s,e)=>s+e.amount,0),events:evs}))
    .filter(d=>d.outflow>50 && (todayDay===null || d.day>=todayDay)) // skip past days
    .sort((a,b)=>a.day-b.day) // chronological order
    .slice(0,3)
    .forEach(d=>{
      const date=new Date(year,month,d.day);
      const daysAway=todayDay!==null?d.day-todayDay:null;
      const urgency=daysAway!==null&&daysAway<=3?'var(--red)':daysAway!==null&&daysAway<=7?'var(--amber)':'var(--text-dim)';
      const label=daysAway===0?'Today':daysAway===1?'Tomorrow':daysAway!==null?`In ${daysAway}d`:'';
      warnings.push(`<div class="cf-warning${daysAway!==null&&daysAway<=3?' has-urgent':''}"><div class="cf-warning-title" style="color:${urgency}">⚠️ ${date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}${label?' · '+label:''} — $${d.outflow.toFixed(0)} due</div><div class="cf-warning-detail">${d.events.filter(e=>e.type!=='income').map(e=>e.label+(e.amount>0?' ($'+e.amount.toFixed(0)+')':'')).join(', ')}</div></div>`);
    });

  const dayNames=['S','M','T','W','T','F','S'];
  let html=`<div class="cf-legend"><div class="cf-legend-item"><div class="cf-legend-dot" style="background:rgba(108,92,231,0.6)"></div>Sub</div><div class="cf-legend-item"><div class="cf-legend-dot" style="background:rgba(255,107,107,0.6)"></div>Payment</div><div class="cf-legend-item"><div class="cf-legend-dot" style="background:rgba(0,210,160,0.6)"></div>Income</div></div><div class="cf-month-grid">`;
  dayNames.forEach(d=>html+=`<div class="cf-day-header">${d}</div>`);
  for(let i=0;i<firstDay;i++)html+='<div class="cf-day empty"></div>';
  for(let day=1;day<=daysInMonth;day++){
    const isToday=todayDay===day;
    const isPast=todayDay!==null&&day<todayDay;
    const evs=events[day]||[];
    const hasUrgent=evs.some(e=>e.type==='payment')&&!isPast;
    const hasEvs=evs.length>0&&!isPast;
    html+=`<div class="cf-day${isToday?' today':''}${hasUrgent?' has-urgent':hasEvs?' has-events':''}${isPast?' past':''}"><div class="cf-day-num" style="${isPast?'opacity:0.3':''}">${day}</div>${(!isPast?evs.slice(0,2).map(e=>`<div class="cf-event ${e.type}">${e.label.split(' ')[0]}</div>`).join(''):'')+(evs.length>2&&!isPast?`<div style="font-size:8px;color:var(--text-muted)">+${evs.length-2}</div>`:'')} </div>`;
  }
  html+='</div>';
  calEl.innerHTML=html;
  if(warnEl)warnEl.innerHTML=warnings.length?warnings.join(''):'<div style="font-size:13px;color:var(--text-dim);padding:10px 0">No upcoming high-outflow days 🎉</div>';
}

// ══════════════════════════════════════════════════════
// SAVINGS GOALS
// ══════════════════════════════════════════════════════
function selectGoalIcon(icon,el){selectedGoalIcon=icon;document.querySelectorAll('#goalIconPicker>div').forEach(d=>d.style.border='2px solid var(--border)');el.style.border='2px solid var(--accent)';}
function openGoalModal(goalId=null){
  document.getElementById('addGoalModal').classList.add('open');
  document.getElementById('goalEditId').value=goalId||'';
  document.getElementById('goalSaveBtn').textContent=goalId?'Save':'Create Goal';
  document.getElementById('goalModalTitle').textContent=goalId?'Edit Goal':'New Goal';
  if(goalId){const g=savingsGoals.find(g=>g.id===goalId);if(g){document.getElementById('goalName').value=g.name;document.getElementById('goalTarget').value=g.target;document.getElementById('goalSaved').value=g.savedSoFar;document.getElementById('goalDeadline').value=g.deadline||'';selectedGoalIcon=g.icon||'🎯';}}
  else{document.getElementById('goalName').value='';document.getElementById('goalTarget').value='';document.getElementById('goalSaved').value='';document.getElementById('goalDeadline').value='';selectedGoalIcon='🎯';}
  document.querySelectorAll('#goalIconPicker>div').forEach(d=>{d.style.border=d.textContent.trim()===selectedGoalIcon?'2px solid var(--accent)':'2px solid var(--border)';});
}
function saveGoal(){
  const name=document.getElementById('goalName').value.trim();
  const target=parseFloat(document.getElementById('goalTarget').value);
  const savedSoFar=parseFloat(document.getElementById('goalSaved').value)||0;
  const deadline=document.getElementById('goalDeadline').value;
  const editId=parseInt(document.getElementById('goalEditId').value)||null;
  if(!name||!target||target<=0){alert('Please enter name and target');return;}
  const colors=['#6c5ce7','#00d2a0','#4dabf7','#ffd43b','#ff6b6b','#e64980','#ff922b','#51cf66'];
  if(editId){const g=savingsGoals.find(g=>g.id===editId);if(g){g.name=name;g.target=target;g.savedSoFar=savedSoFar;g.deadline=deadline;g.icon=selectedGoalIcon;}}
  else savingsGoals.push({id:nextGoalId++,name,target,savedSoFar,deadline,icon:selectedGoalIcon,color:colors[savingsGoals.length%colors.length],createdAt:new Date().toISOString().split('T')[0]});
  saveToStorage();closeModal('addGoalModal');renderGoals();showSyncBar('success','🎯',`Goal <strong>${name}</strong> saved`);
}
function addToGoal(goalId){
  const g=savingsGoals.find(g=>g.id===goalId);if(!g)return;
  const amt=parseFloat(prompt(`Add to "${g.name}" (currently $${(g.savedSoFar||0).toFixed(0)} saved):`));
  if(!amt||amt<=0)return;
  g.savedSoFar=Math.min((g.savedSoFar||0)+amt,g.target);saveToStorage();renderGoals();
  showSyncBar('success','💰',`$${amt.toFixed(2)} added to <strong>${g.name}</strong>`);
}
function deleteGoal(goalId){if(!confirm('Delete this goal?'))return;savingsGoals=savingsGoals.filter(g=>g.id!==goalId);saveToStorage();renderGoals();}
function renderGoals(){
  const el=document.getElementById('goalsList');if(!el)return;
  if(!savingsGoals.length){el.innerHTML=`<div style="text-align:center;padding:36px 20px;color:var(--text-muted);border:1px dashed var(--border);border-radius:var(--radius-sm)"><div style="font-size:34px;margin-bottom:10px">🎯</div><div style="font-size:14px;font-weight:600;color:var(--text-dim);margin-bottom:5px">No goals yet</div><div style="font-size:13px">Tap "+ New Goal" to get started</div></div>`;renderPayYourself();return;}
  el.innerHTML=savingsGoals.map(g=>{
    const pct=g.target>0?Math.min(((g.savedSoFar||0)/g.target)*100,100):0;
    const remaining=g.target-(g.savedSoFar||0);
    let daysLeft=null,perMonth=null,onTrack=null;
    if(g.deadline){const dead=new Date(g.deadline+'T23:59:59');const tod=new Date();daysLeft=Math.max(Math.ceil((dead-tod)/86400000),0);const monthsLeft=Math.max(daysLeft/30.4,0.1);perMonth=remaining/monthsLeft;const avail=Math.max(getMonthIncome(currentYear,currentMonth)-getMonthTransactions(currentYear,currentMonth,'all').reduce((s,tx)=>s+tx.amount,0),0);onTrack=avail>=perMonth;}
    return `<div class="goal-card"><div class="goal-header"><div class="goal-icon-wrap" style="background:${g.color}22">${g.icon||'🎯'}</div><div style="flex:1"><div class="goal-name">${g.name}</div><div class="goal-deadline">${g.deadline?`📅 ${new Date(g.deadline+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}${daysLeft!==null?' · '+daysLeft+'d':''}`:' No deadline'}</div></div><div class="goal-actions"><button class="goal-action-btn" onclick="addToGoal(${g.id})">+ Add</button><button class="goal-action-btn" onclick="openGoalModal(${g.id})">Edit</button><button class="goal-action-btn" style="color:var(--red)" onclick="deleteGoal(${g.id})">✕</button></div></div><div class="goal-progress-row"><span style="font-weight:600">$${(g.savedSoFar||0).toLocaleString('en-US',{minimumFractionDigits:0})} saved</span><span>of $${g.target.toLocaleString()} · ${pct.toFixed(0)}%</span></div><div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%;background:${g.color}"></div></div><div class="goal-stats"><div class="goal-stat"><div class="goal-stat-val" style="color:var(--red)">$${remaining.toLocaleString('en-US',{minimumFractionDigits:0})}</div><div class="goal-stat-lbl">Remaining</div></div><div class="goal-stat"><div class="goal-stat-val" style="color:var(--blue)">${perMonth?'$'+perMonth.toFixed(0):'—'}</div><div class="goal-stat-lbl">Per Month</div></div><div class="goal-stat"><div class="goal-stat-val">${onTrack===null?'—':onTrack?'✅':'⚠️'}</div><div class="goal-stat-lbl">On Track</div></div></div></div>`;
  }).join('');
  renderPayYourself();
}
function renderPayYourself(){
  const el=document.getElementById('payYourselfCard');if(!el)return;
  const monthlyIncome=getMonthIncome(currentYear,currentMonth);
  const monthlySpent=getMonthTransactions(currentYear,currentMonth,'all').reduce((s,tx)=>s+tx.amount,0);
  const available=Math.max(monthlyIncome-monthlySpent,0);
  const rec20=monthlyIncome*0.20;
  const totalTarget=savingsGoals.filter(g=>(g.savedSoFar||0)<g.target).reduce((s,g)=>s+(g.target-(g.savedSoFar||0)),0);
  el.innerHTML=`<div class="pay-yourself-card"><div style="font-size:13px;color:var(--text-dim);line-height:1.6;margin-bottom:12px">The <strong style="color:var(--text)">Pay Yourself First</strong> rule: set aside savings before spending. Aim for 20% of income.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px"><div style="background:var(--bg);border-radius:8px;padding:11px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700">20% Target</div><div style="font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;color:var(--green);margin-top:3px">${monthlyIncome>0?'$'+rec20.toFixed(0):'—'}</div></div><div style="background:var(--bg);border-radius:8px;padding:11px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Available Now</div><div style="font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;color:${available>0?'var(--green)':'var(--red)'};margin-top:3px">${monthlyIncome>0?(available>0?'$'+available.toFixed(0):'-$'+Math.abs(available).toFixed(0)):'—'}</div></div></div>${totalTarget>0?`<div style="margin-top:10px;padding:9px 11px;background:rgba(108,92,231,0.07);border-radius:8px;font-size:13px;color:var(--text-dim)">Total goal gap: <strong style="color:var(--text)">$${totalTarget.toLocaleString('en-US',{minimumFractionDigits:0})}</strong></div>`:''}</div>`;
}

// ══════════════════════════════════════════════════════
// DEBT PAYOFF PLANNER
// ══════════════════════════════════════════════════════
function openLogBalanceModal(cardId){
  const card=CARDS.find(c=>c.id===cardId);if(!card)return;
  document.getElementById('logBalanceModal').classList.add('open');
  document.getElementById('balanceCardId').value=cardId;
  document.getElementById('logBalanceCardName').innerHTML=`<strong>${card.name}</strong> •••• ${card.last4}`;
  const ex=cardBalances[cardId]||{};
  document.getElementById('balanceAmount').value=ex.statementBalance||'';
  document.getElementById('balanceAPR').value=ex.apr||'';
  document.getElementById('balanceMinPay').value=ex.minPay||'';
}
function saveCardBalance(){
  const cardId=document.getElementById('balanceCardId').value;
  const balance=parseFloat(document.getElementById('balanceAmount').value)||0;
  const apr=parseFloat(document.getElementById('balanceAPR').value)||0;
  const minPay=parseFloat(document.getElementById('balanceMinPay').value)||0;
  cardBalances[cardId]={statementBalance:balance,apr,minPay,lastUpdated:new Date().toISOString().split('T')[0]};
  saveToStorage();closeModal('logBalanceModal');renderDebtPlanner();showSyncBar('success','💳','Balance updated');
}
function setDebtStrategy(s){debtStrategy=s;document.querySelectorAll('.strategy-btn').forEach(b=>b.classList.remove('active'));document.getElementById('strategy-'+s)?.classList.add('active');renderDebtProjection();}
function renderDebtPlanner(){
  const el=document.getElementById('debtCardsList');if(!el)return;
  const creditCards=CARDS.filter(c=>(c.type||'credit')==='credit');
  if(!creditCards.length){el.innerHTML=`<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px">No credit cards found. Add cards in Settings.</div>`;return;}
  el.innerHTML=creditCards.map(card=>{
    const b=cardBalances[card.id]||{};
    const apr=b.apr||0;const minPay=b.minPay||0;
    // Use getEstimatedBalance so payments reduce the displayed balance
    const {estimated:bal, statBal, payments:pmts, lastUpdated} = getEstimatedBalance(card.id);
    const monthlyInterest=bal>0&&apr>0?bal*(apr/100/12):0;
    const limit=card.creditLimit||0;
    const util=limit>0?Math.min((bal/limit)*100,100):0;
    return `<div class="debt-card"><div class="debt-card-header"><div class="debt-card-dot" style="background:${card.color}"></div><div><div class="debt-card-name">${card.name}</div><div class="debt-card-sub">•••• ${card.last4}${lastUpdated?' · '+lastUpdated:''}</div></div><button class="debt-update-btn" onclick="openLogBalanceModal('${card.id}')">Update</button></div><div class="debt-stats"><div class="debt-stat"><div class="debt-stat-val" style="color:${bal>0?'var(--red)':'var(--green)'}">${bal>0?'$'+bal.toLocaleString('en-US',{minimumFractionDigits:0}):'$0'}</div><div class="debt-stat-lbl">Est. Owed</div></div><div class="debt-stat"><div class="debt-stat-val" style="color:var(--amber)">${apr>0?apr.toFixed(1)+'%':'—'}</div><div class="debt-stat-lbl">APR</div></div><div class="debt-stat"><div class="debt-stat-val" style="color:var(--red)">${monthlyInterest>0?'$'+monthlyInterest.toFixed(0):'—'}</div><div class="debt-stat-lbl">Mo. Interest</div></div></div>${limit>0?`<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:3px"><span>Utilization: ${util.toFixed(0)}%</span><span>${util>=70?'⚠️ High':util>=30?'Moderate':'✅ Low'}</span></div><div class="debt-payoff-bar"><div class="debt-payoff-fill" style="width:${util}%;background:${util>=70?'var(--red)':util>=30?'var(--amber)':'var(--green)'}"></div></div>`:''}</div>`;
  }).join('');
  renderDebtProjection();
}
function renderDebtProjection(){
  const stratEl=document.getElementById('debtStrategyCard');
  const projEl=document.getElementById('debtProjectionCard');
  if(!stratEl||!projEl)return;
  // Build debts using getEstimatedBalance so payments already made are reflected
  const debts=CARDS.filter(c=>(c.type||'credit')==='credit').map(c=>{
    const b=cardBalances[c.id]||{};
    const {estimated}=getEstimatedBalance(c.id);
    return {card:c, statementBalance:estimated, apr:b.apr||0, minPay:b.minPay||0};
  }).filter(d=>d.statementBalance>0&&d.apr>0&&d.minPay>0);
  if(!debts.length){stratEl.innerHTML=`<div style="font-size:13px;color:var(--text-dim);padding:10px 0">Update balances, APR &amp; minimum payments above to see your payoff plan.</div>`;projEl.innerHTML='';return;}
  const totalDebt=debts.reduce((s,d)=>s+d.statementBalance,0);
  const totalMinPay=debts.reduce((s,d)=>s+d.minPay,0);
  const totalMonthlyInterest=debts.reduce((s,d)=>s+(d.statementBalance*(d.apr/100/12)),0);
  stratEl.innerHTML=`<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px"><div style="background:var(--bg);border-radius:6px;padding:9px"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Total Debt</div><div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--red);margin-top:3px">$${totalDebt.toLocaleString('en-US',{minimumFractionDigits:0})}</div></div><div style="background:var(--bg);border-radius:6px;padding:9px"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Min Payments</div><div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--amber);margin-top:3px">$${totalMinPay.toFixed(0)}/mo</div></div><div style="background:var(--bg);border-radius:6px;padding:9px"><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Mo. Interest</div><div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--red);margin-top:3px">$${totalMonthlyInterest.toFixed(0)}</div></div></div><div style="font-size:13px;font-weight:600;margin-bottom:9px">Payoff Strategy</div><div class="strategy-toggle"><div class="strategy-btn ${debtStrategy==='avalanche'?'active':''}" id="strategy-avalanche" onclick="setDebtStrategy('avalanche')">🔥 Avalanche<div style="font-size:10px;color:var(--text-muted);font-weight:400;margin-top:1px">Highest APR first</div></div><div class="strategy-btn ${debtStrategy==='snowball'?'active':''}" id="strategy-snowball" onclick="setDebtStrategy('snowball')">❄️ Snowball<div style="font-size:10px;color:var(--text-muted);font-weight:400;margin-top:1px">Smallest balance first</div></div></div></div>`;
  const sorted=[...debts].sort((a,b)=>debtStrategy==='avalanche'?b.apr-a.apr:a.statementBalance-b.statementBalance);
  const _now=new Date();const _rYear=_now.getFullYear();const _rMonth=_now.getMonth();
  const monthlyIncome=getMonthIncome(_rYear,_rMonth);
  const monthlySpent=getMonthTransactions(_rYear,_rMonth,'all').reduce((s,tx)=>s+tx.amount,0);
  const extraPayment=Math.max(monthlyIncome-monthlySpent-totalMinPay,0);
  const totalPayment=totalMinPay+extraPayment;
  let balances=sorted.map(d=>({...d,bal:d.statementBalance}));
  let months=0,totalInterestPaid=0;
  const MAX_MONTHS=360;
  while(balances.some(d=>d.bal>0.01)&&months<MAX_MONTHS){months++;let remaining=totalPayment;balances=balances.map(d=>{if(d.bal<=0)return d;const interest=d.bal*(d.apr/100/12);totalInterestPaid+=interest;const newBal=d.bal+interest;const pay=Math.min(d.minPay,newBal);remaining-=pay;return{...d,bal:Math.max(newBal-pay,0)};});for(const d of balances){if(d.bal>0&&remaining>0){const pay=Math.min(remaining,d.bal);d.bal-=pay;remaining-=pay;}}}
  const years=Math.floor(months/12),mos=months%12;
  const payoffDate=new Date();payoffDate.setMonth(payoffDate.getMonth()+months);
  projEl.innerHTML=`<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px"><div style="background:var(--bg);border-radius:7px;padding:11px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Debt-Free In</div><div style="font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;color:var(--green);margin-top:3px">${months>=MAX_MONTHS?'360+ mo':years>0?years+'y '+mos+'m':mos+' mo'}</div><div style="font-size:11px;color:var(--text-muted);margin-top:1px">${months<MAX_MONTHS?payoffDate.toLocaleDateString('en-US',{month:'short',year:'numeric'}):'Increase payments'}</div></div><div style="background:var(--bg);border-radius:7px;padding:11px"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Total Interest</div><div style="font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;color:var(--amber);margin-top:3px">$${totalInterestPaid.toFixed(0)}</div><div style="font-size:11px;color:var(--text-muted);margin-top:1px">At current pace</div></div></div>${extraPayment>0?`<div style="padding:9px 11px;background:rgba(0,210,160,0.07);border-radius:7px;font-size:12px;color:var(--text-dim);margin-bottom:10px">💡 Using <strong style="color:var(--text)">$${extraPayment.toFixed(0)}/mo extra</strong> from savings</div>`:`<div style="padding:9px 11px;background:rgba(255,107,107,0.07);border-radius:7px;font-size:12px;color:var(--text-dim);margin-bottom:10px">Log income in Finance Hub to calculate extra payments</div>`}<div style="font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:7px">Payoff Order</div>${sorted.map(d=>{const card=CARDS.find(c=>c.id===d.card?.id);return`<div class="projection-row"><div style="display:flex;align-items:center;gap:7px"><div style="width:7px;height:7px;border-radius:50%;background:${card?.color||'#666'}"></div><span>${card?.name||'Card'} ••${card?.last4?.slice(-2)||'??'}</span></div><span style="color:var(--text-dim);font-size:11px">${debtStrategy==='avalanche'?d.apr.toFixed(1)+'% APR':'$'+d.statementBalance.toFixed(0)}</span></div>`;}).join('')}</div>`;
}

// ══════════════════════════════════════════════════════
// PAYMENT EMAIL PARSER
// ══════════════════════════════════════════════════════
function parsePaymentEmail(msg, issuer, issuerCards) {
  const headers = msg.payload?.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const dateHeader = headers.find(h => h.name === 'Date')?.value || '';

  // Only process actual payment confirmation emails
  if (!/payment\s*(received|posted|confirmed|processed)|thank\s*you\s*for\s*your\s*payment/i.test(subject)) return null;

  let bodyText = '';
  function extractText(part) {
    if (!part) return;
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += decodeBase64(part.body.data) + '\n';
    } else if (part.mimeType === 'text/html' && part.body?.data && !bodyText) {
      const html = decodeBase64(part.body.data);
      bodyText += html.replace(/<\/?(tr|td|th|div|p|br|li)[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#[0-9]+;/g, ' ') + '\n';
    }
    if (part.parts) part.parts.forEach(extractText);
  }
  extractText(msg.payload);
  if (!bodyText && msg.payload?.body?.data) {
    try { bodyText = decodeBase64(msg.payload.body.data); } catch(e) {}
  }
  const fullText = (subject + '\n' + bodyText).replace(/[ \t]+/g, ' ');

  // ── AMOUNT ────────────────────────────────────────────
  // Payment emails have patterns like:
  //   Amex:        "A payment of $1,240.00 has been received"
  //   Capital One: "Your payment of $500.00 has been posted"
  //   Chase:       "We received your payment of $350.00"
  //   Wells Fargo: "Payment Amount: $800.00"
  //   Discover:    "Your payment of $150.00 was received"
  let amount = null;
  const amountPatterns = [
    /payment\s+of\s+\$\s*([\d,]+\.\d{2})/i,
    /payment\s+amount[:\s]+\$?\s*([\d,]+\.\d{2})/i,
    /received\s+your\s+payment\s+of\s+\$\s*([\d,]+\.\d{2})/i,
    /amount[:\s]+\$?\s*([\d,]+\.\d{2})/i,
    /\$\s*([\d,]+\.\d{2})\s+(?:payment|has been)/i,
    /\$\s*([\d,]+\.\d{2})/,
  ];
  for (const p of amountPatterns) {
    const m = fullText.match(p);
    if (m) { amount = parseFloat(m[1].replace(/,/g, '')); break; }
  }
  if (!amount || amount <= 0 || amount > 100000) return null;

  // ── DATE ──────────────────────────────────────────────
  const date = extractDate(fullText, dateHeader);

  // ── CARD MATCHING ─────────────────────────────────────
  let cardId = issuerCards[0]?.id || issuer;
  // Try matching last 4 digits mentioned in email
  const last4Patterns = [
    /(?:account|card)\s+ending\s+in\s+(\d{4})/i,
    /(?:account|card)\s+ending\s+(\d{4})/i,
    /ending\s+in\s+(\d{4,5})/i,
    /\.{2,3}(\d{4})/,
    /x{3,}(\d{4})/i,
  ];
  for (const p of last4Patterns) {
    const m = fullText.match(p);
    if (m) {
      const last4 = m[1].slice(-4);
      const found = issuerCards.find(c => c.last4 === last4);
      if (found) { cardId = found.id; break; }
    }
  }

  return { cardId, amount, date };
}

// ══════════════════════════════════════════════════════
// PAYMENTS PAGE
// ══════════════════════════════════════════════════════
function renderPaymentsPage() {
  const el = document.getElementById('paymentsPageContent');
  if (!el) return;

  const creditCards = CARDS.filter(c => (c.type || 'credit') === 'credit');
  if (!creditCards.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-muted);font-size:13px">No credit cards found. Add cards in Settings.</div>`;
    return;
  }

  // Summary row: total paid this month across all cards
  const now = new Date();
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  let totalPaidThisMonth = 0;
  creditCards.forEach(card => {
    (cardPayments[card.id] || []).forEach(p => {
      if (p.date && p.date.startsWith(thisMonthStr)) totalPaidThisMonth += p.amount;
    });
  });

  let html = '';

  // Total paid banner
  if (totalPaidThisMonth > 0) {
    html += `<div style="background:linear-gradient(135deg,rgba(0,210,160,0.1),rgba(0,210,160,0.04));border:1px solid rgba(0,210,160,0.25);border-radius:var(--radius-sm);padding:14px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Paid This Month</div><div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--green);margin-top:3px">$${totalPaidThisMonth.toLocaleString('en-US',{minimumFractionDigits:2})}</div></div>
      <div style="font-size:28px">✅</div>
    </div>`;
  }

  // Per-card sections
  creditCards.forEach(card => {
    const payments = (cardPayments[card.id] || []).slice().sort((a,b) => b.date.localeCompare(a.date));
    // Use getEstimatedBalance so "remaining" = statement + new charges - payments
    const { statBal, charges, payments: paymentsMade, estimated } = getEstimatedBalance(card.id);
    const totalPaid = payments.reduce((s,p) => s+p.amount, 0);

    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-left:4px solid ${card.color};border-radius:var(--radius-sm);padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:14px;font-weight:700">${card.name}</div>
          <div style="font-size:11px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-top:1px">•••• ${card.last4}</div>
        </div>
        <button onclick="openAddPaymentModal('${card.id}')" style="padding:6px 13px;border:1px solid var(--accent);border-radius:7px;background:transparent;color:var(--accent);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer">+ Log Payment</button>
      </div>
      ${statBal > 0 ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px">
        <div style="background:var(--bg);border-radius:6px;padding:9px">
          <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Statement Bal</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--amber);margin-top:3px">$${statBal.toLocaleString('en-US',{minimumFractionDigits:0})}</div>
        </div>
        <div style="background:var(--bg);border-radius:6px;padding:9px">
          <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Total Paid</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--green);margin-top:3px">$${totalPaid.toLocaleString('en-US',{minimumFractionDigits:0})}</div>
        </div>
        <div style="background:var(--bg);border-radius:6px;padding:9px">
          <div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Est. Owed Now</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:${estimated>0?'var(--red)':'var(--green)'};margin-top:3px">${estimated>0?'$'+estimated.toLocaleString('en-US',{minimumFractionDigits:0}):'Paid ✓'}</div>
        </div>
      </div>${charges>0?`<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;padding:7px 10px;background:rgba(255,107,107,0.06);border-radius:6px">+$${charges.toLocaleString('en-US',{minimumFractionDigits:2})} in new charges since statement</div>`:''}` : ''}
      ${payments.length === 0
        ? `<div style="font-size:13px;color:var(--text-muted);padding:10px 0;text-align:center">No payments logged yet</div>`
        : payments.map((p,i) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:8px;background:rgba(0,210,160,0.12);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${p.source==='gmail'?'📧':'✏️'}</div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text)">$${p.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
                <div style="font-size:11px;color:var(--text-dim);margin-top:1px">${p.date} · ${p.source==='gmail'?'Auto from Gmail':p.source==='manual'?'Manual':'Logged'}${p.note?' · '+p.note:''}</div>
              </div>
            </div>
            <button onclick="deletePayment('${card.id}','${p.date}',${p.amount})" style="color:var(--text-muted);background:none;border:none;cursor:pointer;font-size:15px;padding:4px 6px">✕</button>
          </div>`).join('')
      }
    </div>`;
  });

  el.innerHTML = html;
}

function openAddPaymentModal(cardId) {
  document.getElementById('addPaymentModal').classList.add('open');
  const sel = document.getElementById('paymentCardSelect');
  sel.innerHTML = CARDS.filter(c=>(c.type||'credit')==='credit')
    .map(c=>`<option value="${c.id}" ${c.id===cardId?'selected':''}>${c.name} •••• ${c.last4}</option>`).join('');
  document.getElementById('paymentAmountInput').value = '';
  document.getElementById('paymentDateInput').value = new Date().toISOString().split('T')[0];
  document.getElementById('paymentNoteInput').value = '';
}

function saveManualPayment() {
  const cardId = document.getElementById('paymentCardSelect').value;
  const amount = parseFloat(document.getElementById('paymentAmountInput').value);
  const date = document.getElementById('paymentDateInput').value;
  const note = document.getElementById('paymentNoteInput').value.trim();
  if (!cardId || !amount || amount <= 0 || !date) { alert('Please fill in card, amount, and date'); return; }
  if (!cardPayments) cardPayments = {};
  if (!cardPayments[cardId]) cardPayments[cardId] = [];
  const exists = cardPayments[cardId].some(p => p.date === date && Math.abs(p.amount - amount) < 0.01);
  if (!exists) {
    cardPayments[cardId].unshift({ date, amount, source: 'manual', note });
    if (cardPayments[cardId].length > 50) cardPayments[cardId].pop();
  }
  saveToStorage();
  closeModal('addPaymentModal');
  showSyncBar('success', '✅', `Payment of <strong>$${amount.toFixed(2)}</strong> logged`);
  renderPaymentsPage();
  renderFinCardBalances(); // refresh Finance Hub card balances if visible
}

function deletePayment(cardId, pDate, pAmount) {
  if (!confirm('Remove this payment record?')) return;
  if (cardPayments[cardId]) {
    const idx = cardPayments[cardId].findIndex(p => p.date === pDate && Math.abs(p.amount - pAmount) < 0.01);
    if (idx !== -1) cardPayments[cardId].splice(idx, 1);
    saveToStorage();
    renderPaymentsPage();
    showSyncBar('success', '🗑️', 'Payment removed');
  }
}

// SpendLens v5.0 — Finance Edition ═════════════════════

// Init Google Auth once GIS loads
window.addEventListener('load', () => {
  const check = setInterval(() => {
    if (typeof google !== 'undefined' && google.accounts) { clearInterval(check); initGoogleAuth(); }
  }, 300);
});

init();
</script>