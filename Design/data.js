// Mock data for SpendLens — realistic merchants & cards
const CARDS = [
  { id:'amex-gold', name:'Amex Gold',           last4:'4521', type:'credit', limit:15000, color:'#C49A6C', issuer:'amex'  },
  { id:'csr',       name:'Chase Sapphire Reserve', last4:'8834', type:'credit', limit:25000, color:'#2D7D6F', issuer:'chase' },
  { id:'active',    name:'WF Active Cash',      last4:'3192', type:'credit', limit:10000, color:'#9B2C5E', issuer:'wells' },
  { id:'discover',  name:'Discover it',         last4:'7760', type:'credit', limit:8000,  color:'#B87333', issuer:'discover' },
  { id:'ally',      name:'Ally Checking',       last4:'1108', type:'debit',  color:'#6654A3', issuer:'ally' },
];

const CATEGORIES = {
  dining:    { name:'Dining',     tone:'gold',   letter:'D' },
  groceries: { name:'Groceries',  tone:'teal',   letter:'G' },
  transport: { name:'Transport',  tone:'amethyst',letter:'T' },
  travel:    { name:'Travel',     tone:'amethyst',letter:'V' },
  shopping:  { name:'Shopping',   tone:'copper', letter:'S' },
  gas:       { name:'Gas',        tone:'copper', letter:'F' },
  bills:     { name:'Bills',      tone:'neutral',letter:'B' },
  fitness:   { name:'Fitness',    tone:'teal',   letter:'H' },
  entertainment:{name:'Entertainment',tone:'raspberry',letter:'E'},
  delivery:  { name:'Food Delivery',tone:'gold', letter:'D' },
  subscription:{name:'Subscriptions',tone:'amethyst',letter:'Su'},
  other:     { name:'Other',      tone:'neutral',letter:'O' },
};

// Generate this month's transactions (April 2026)
function makeTx(day, hour, merchant, amount, card, category, opts={}){
  return { id: Math.random().toString(36).slice(2), date: `2026-04-${String(day).padStart(2,'0')}`, time: `${String(hour).padStart(2,'0')}:${String(opts.min||0).padStart(2,'0')}`, merchant, amount, card, category, source: opts.source||'gmail' };
}

const TRANSACTIONS = [
  makeTx(19,19, 'Sushi Nozawa',          184.50, 'amex-gold', 'dining'),
  makeTx(19,14, 'Whole Foods Market',     87.32, 'amex-gold', 'groceries'),
  makeTx(19, 8, 'Blue Bottle Coffee',      6.25, 'csr',       'dining'),
  makeTx(18,22, 'Uber',                   24.80, 'csr',       'transport'),
  makeTx(18,20, 'Delilah',               312.00, 'amex-gold', 'dining'),
  makeTx(18,12, 'Sweetgreen',             18.95, 'amex-gold', 'dining'),
  makeTx(17, 9, 'Equinox',               215.00, 'csr',       'fitness', {source:'manual'}),
  makeTx(17,19, 'Erewhon',               142.18, 'amex-gold', 'groceries'),
  makeTx(16,21, 'Uber Eats',              32.40, 'csr',       'delivery'),
  makeTx(16,11, 'Shell',                  54.20, 'active',    'gas'),
  makeTx(16,14, 'Apple',                1299.00, 'csr',       'shopping'),
  makeTx(15,20, 'Hotel Bel-Air',         840.00, 'csr',       'travel'),
  makeTx(15,10, 'Trader Joes',            62.47, 'amex-gold', 'groceries'),
  makeTx(14,13, 'Spotify',                11.99, 'discover',  'subscription'),
  makeTx(14,13, 'Netflix',                22.99, 'discover',  'subscription'),
  makeTx(13,19, 'Nobu Malibu',           428.75, 'amex-gold', 'dining'),
  makeTx(13,15, 'Lyft',                   18.30, 'csr',       'transport'),
  makeTx(12,11, 'CVS Pharmacy',           23.48, 'active',    'other'),
  makeTx(12,19, 'Soho House',             95.00, 'amex-gold', 'entertainment', {source:'manual'}),
  makeTx(11, 8, 'SoulCycle',              40.00, 'csr',       'fitness'),
  makeTx(11,20, 'Bestia',                268.00, 'amex-gold', 'dining'),
  makeTx(10,12, 'Erewhon',                98.12, 'amex-gold', 'groceries'),
  makeTx(10, 9, 'Chevron',                48.75, 'active',    'gas'),
  makeTx( 9,21, 'DoorDash',               41.60, 'csr',       'delivery'),
  makeTx( 8,14, 'Amazon',                184.50, 'discover',  'shopping'),
  makeTx( 8, 9, 'Starbucks',               7.45, 'csr',       'dining'),
  makeTx( 7,19, 'The Nice Guy',          225.00, 'amex-gold', 'dining'),
  makeTx( 6,11, 'Whole Foods Market',    114.80, 'amex-gold', 'groceries'),
  makeTx( 5,22, 'Uber',                   31.20, 'csr',       'transport'),
  makeTx( 5,20, 'Catch LA',              398.00, 'amex-gold', 'dining'),
  makeTx( 4,15, 'Zara',                  178.00, 'discover',  'shopping'),
  makeTx( 4,10, 'Erewhon',               126.30, 'amex-gold', 'groceries'),
  makeTx( 3,13, 'NY Times',                4.25, 'discover',  'subscription'),
  makeTx( 3, 8, 'Peets Coffee',            5.75, 'csr',       'dining'),
  makeTx( 2,19, 'Bavel',                 312.50, 'amex-gold', 'dining'),
  makeTx( 2,12, 'Uber',                   22.40, 'csr',       'transport'),
  makeTx( 1,10, 'Trader Joes',            78.90, 'amex-gold', 'groceries'),
  makeTx( 1,22, 'Pump',                  165.00, 'amex-gold', 'entertainment'),
];

const SUBSCRIPTIONS = [
  { id:'s1', name:'Netflix',      amount:22.99, card:'discover',  category:'entertainment', day:14 },
  { id:'s2', name:'Spotify',      amount:11.99, card:'discover',  category:'entertainment', day:14 },
  { id:'s3', name:'NYT',          amount: 4.25, card:'discover',  category:'subscription',  day: 3 },
  { id:'s4', name:'Equinox',      amount:215.00,card:'csr',       category:'fitness',       day:17 },
  { id:'s5', name:'iCloud+',      amount: 9.99, card:'csr',       category:'subscription',  day:22 },
  { id:'s6', name:'ChatGPT Plus', amount:20.00, card:'csr',       category:'subscription',  day:25 },
];

const GOALS = [
  { id:'g1', name:'Emergency Fund',   letter:'E', target:15000, saved:8400,  deadline:'2026-12-31', tone:'teal' },
  { id:'g2', name:'Japan Trip',       letter:'J', target: 6000, saved:2350,  deadline:'2026-09-15', tone:'amethyst' },
  { id:'g3', name:'Down Payment',     letter:'H', target:60000, saved:22100, deadline:'2027-06-01', tone:'gold' },
];

const DEBTS = [
  { cardId:'amex-gold', balance:2840.50, apr:0,     min: 0,   statement:'2026-04-25' },
  { cardId:'csr',       balance:4120.00, apr:22.99, min:125,  statement:'2026-04-28' },
  { cardId:'active',    balance: 684.20, apr:24.99, min: 35,  statement:'2026-05-02' },
  { cardId:'discover',  balance:1245.78, apr:19.99, min: 45,  statement:'2026-05-05' },
];

const BUDGETS = {
  overall:   { limit: 5500 },
  dining:    { limit: 1800 },
  groceries: { limit:  700 },
  transport: { limit:  250 },
  shopping:  { limit:  400 },
  entertainment:{limit: 400 },
};

const INCOME = [
  { id:'i1', source:'Salary',     amount:6800, frequency:'biweekly', date:'2026-04-10', note:'Bi-weekly paycheck' },
  { id:'i2', source:'Salary',     amount:6800, frequency:'biweekly', date:'2026-04-24', note:'Bi-weekly paycheck' },
  { id:'i3', source:'Freelance',  amount:1400, frequency:'once',     date:'2026-04-08', note:'Design project' },
];

Object.assign(window, { CARDS, CATEGORIES, TRANSACTIONS, SUBSCRIPTIONS, GOALS, DEBTS, BUDGETS, INCOME });
