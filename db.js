import { hashPassword } from './auth.js';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GNPrimelink@1322';
const TURSO_DB_URL = process.env.TURSO_DATABASE_URL || '';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

let TURSO_HTTP_URL = TURSO_DB_URL;
if (TURSO_DB_URL.startsWith('libsql://')) {
  TURSO_HTTP_URL = TURSO_DB_URL.replace('libsql://', 'https://') + '/v2/pipeline';
} else if (TURSO_DB_URL.startsWith('https://') && !TURSO_DB_URL.endsWith('/v2/pipeline')) {
  TURSO_HTTP_URL = TURSO_DB_URL + '/v2/pipeline';
}

export const USE_TURSO = Boolean(
  TURSO_AUTH_TOKEN && (TURSO_HTTP_URL.includes('turso.io') || TURSO_DB_URL.includes('libsql'))
);

let tursoAvailable = USE_TURSO;

export const DEFAULT_CONTACT_CONFIG = {
  enabled: true,
  phone_number: '+18558312264',
  modal_title: 'Speak With an Advisor Right Now',
  modal_message:
    'Your request has been received! Our support specialists are available immediately to provide personal assistance and lowest quote rates.',
  auto_redirect: true,
  auto_redirect_seconds: 5,
  services: {
    'Health Insurance': '+18558312264',
    'Home Improvement': '+18558312264',
    'Auto & Home Insurance': '+18558312264',
    'Debt Relief': '+18558312264',
    'Legal Help': '+18558312264',
    'Medicare': '+18558312264',
    'Flight Booking': '+18558312264',
  },
};

// ── In-Memory Fallback Store ──────────────────────────────────────────
const memoryStore = {
  users: [],
  leads: [],
  flightBookings: [],
  settings: new Map(),
  nextIds: {
    users: 1,
    leads: 1,
    flightBookings: 1,
  },
  initialized: false,
};

function nowIso() {
  return new Date().toISOString();
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// ── Turso HTTP Pipeline Helpers ───────────────────────────────────────
function formatTursoArgs(params = []) {
  return params.map((p) => {
    if (typeof p === 'number' && Number.isInteger(p)) {
      return { type: 'integer', value: String(p) };
    }
    if (typeof p === 'number') {
      return { type: 'float', value: p };
    }
    if (p === null || p === undefined) {
      return { type: 'null' };
    }
    return { type: 'text', value: String(p) };
  });
}

function parseTursoResult(result) {
  const cols = (result.cols || []).map((c) => c.name);
  const rows = (result.rows || []).map((r) => {
    const obj = {};
    r.forEach((val, idx) => {
      const colName = cols[idx];
      let v = val?.value ?? null;
      if (['id', 'consent', 'trusted_form_retained', 'count'].includes(colName)) {
        v = v !== null ? Number.parseInt(v, 10) || 0 : 0;
      }
      obj[colName] = v;
    });
    return obj;
  });
  return {
    rows,
    affected: result.affected_row_count || 0,
    lastId:
      result.last_insert_rowid !== null && result.last_insert_rowid !== undefined
        ? Number(result.last_insert_rowid)
        : null,
  };
}

async function queryTurso(sql, params = []) {
  const stmt = { sql };
  if (params && params.length > 0) {
    stmt.args = formatTursoArgs(params);
  }
  const resp = await fetch(TURSO_HTTP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt }, { type: 'close' }],
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) {
    throw new Error(`Turso HTTP ${resp.status}`);
  }
  const data = await resp.json();
  const wrapper = data.results?.[0];
  if (!wrapper || wrapper.type === 'error') {
    throw new Error(wrapper?.error?.message || 'Turso query error');
  }
  return parseTursoResult(wrapper.response.result);
}

async function batchQueryTurso(statements) {
  const requests = statements.map((item) => {
    const sql = typeof item === 'string' ? item : item.sql;
    const params = typeof item === 'string' ? [] : item.params || [];
    const stmt = { sql };
    if (params.length > 0) {
      stmt.args = formatTursoArgs(params);
    }
    return { type: 'execute', stmt };
  });
  requests.push({ type: 'close' });

  const resp = await fetch(TURSO_HTTP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) {
    throw new Error(`Turso HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return (data.results || []).slice(0, -1).map((wrapper) => {
    if (!wrapper || wrapper.type === 'error') return [];
    return parseTursoResult(wrapper.response.result).rows;
  });
}

function getSampleLeads() {
  return [
    {
      first_name: 'Eleanor',
      last_name: 'Vance',
      email: 'eleanor.vance@example.com',
      phone: '(555) 234-5678',
      zip_code: '78701',
      date_of_birth: '1988-04-12',
      service_type: 'Health Insurance',
      current_provider: 'BlueCross',
      household_size: '3',
      annual_income_range: '$60k-$90k',
      consent: 1,
      trusted_form_cert_url: 'https://cert.trustedform.com/samplecert1',
      trusted_form_retained: 1,
      trusted_form_cert_id: 'tf_9081237a',
      status: 'new',
      notes: 'Looking for family PPO coverage in Austin area.',
      created_at: daysAgoIso(0),
    },
    {
      first_name: 'Marcus',
      last_name: 'Sterling',
      email: 'marcus.s@example.com',
      phone: '(555) 876-5432',
      zip_code: '30301',
      date_of_birth: '1975-11-20',
      service_type: 'Home Improvement',
      current_provider: 'N/A',
      household_size: '4',
      annual_income_range: '$100k+',
      consent: 1,
      trusted_form_cert_url: 'https://cert.trustedform.com/samplecert2',
      trusted_form_retained: 1,
      trusted_form_cert_id: 'tf_887162bc',
      status: 'contacted',
      notes: 'Contacted via phone, kitchen renovation estimate requested.',
      created_at: daysAgoIso(1),
    },
    {
      first_name: 'Sophia',
      last_name: 'Chen',
      email: 'sophia.chen@example.com',
      phone: '(555) 345-6789',
      zip_code: '94102',
      date_of_birth: '1992-08-05',
      service_type: 'Auto & Home Insurance',
      current_provider: 'State Farm',
      household_size: '2',
      annual_income_range: '$90k-$120k',
      consent: 1,
      trusted_form_cert_url: 'https://cert.trustedform.com/samplecert3',
      trusted_form_retained: 1,
      trusted_form_cert_id: 'tf_771829cd',
      status: 'qualified',
      notes: 'Bundling 2 vehicles and SF condominium.',
      created_at: daysAgoIso(2),
    },
    {
      first_name: 'David',
      last_name: 'Miller',
      email: 'david.m@example.com',
      phone: '(555) 901-2345',
      zip_code: '60601',
      date_of_birth: '1980-01-15',
      service_type: 'Debt Relief',
      current_provider: 'N/A',
      household_size: '1',
      annual_income_range: '$40k-$60k',
      consent: 1,
      trusted_form_cert_url: '',
      trusted_form_retained: 0,
      trusted_form_cert_id: '',
      status: 'closed',
      notes: 'Consolidation plan active and confirmed.',
      created_at: daysAgoIso(3),
    },
    {
      first_name: 'Rachel',
      last_name: 'Green',
      email: 'rachel.green@example.com',
      phone: '(555) 654-3210',
      zip_code: '10001',
      date_of_birth: '1985-06-30',
      service_type: 'Medicare',
      current_provider: 'Humana',
      household_size: '2',
      annual_income_range: '$30k-$50k',
      consent: 1,
      trusted_form_cert_url: 'https://cert.trustedform.com/samplecert5',
      trusted_form_retained: 1,
      trusted_form_cert_id: 'tf_661902ef',
      status: 'new',
      notes: 'Comparing Medicare Advantage Part C options.',
      created_at: daysAgoIso(4),
    },
    {
      first_name: 'Arthur',
      last_name: 'Pendelton',
      email: 'arthur.p@example.com',
      phone: '(555) 789-0123',
      zip_code: '02108',
      date_of_birth: '1959-03-22',
      service_type: 'Legal Help',
      current_provider: 'N/A',
      household_size: '2',
      annual_income_range: '$80k-$110k',
      consent: 1,
      trusted_form_cert_url: 'https://cert.trustedform.com/samplecert6',
      trusted_form_retained: 1,
      trusted_form_cert_id: 'tf_551093gh',
      status: 'contacted',
      notes: 'Estate planning consultation scheduled.',
      created_at: daysAgoIso(5),
    },
    {
      first_name: 'Jessica',
      last_name: 'Alba',
      email: 'jessica.a@example.com',
      phone: '(555) 432-1098',
      zip_code: '90210',
      date_of_birth: '1990-12-14',
      service_type: 'Health Insurance',
      current_provider: 'Kaiser',
      household_size: '3',
      annual_income_range: '$120k+',
      consent: 1,
      trusted_form_cert_url: 'https://cert.trustedform.com/samplecert7',
      trusted_form_retained: 1,
      trusted_form_cert_id: 'tf_440982ij',
      status: 'qualified',
      notes: 'Individual deductible review completed.',
      created_at: daysAgoIso(6),
    },
  ];
}

function seedMemoryStore() {
  if (memoryStore.initialized) return;
  memoryStore.initialized = true;

  const adminPwHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
  for (const uname of ['GNPrimeLink', 'admin']) {
    memoryStore.users.push({
      id: memoryStore.nextIds.users++,
      username: uname,
      password_hash: adminPwHash,
      role: 'admin',
      created_at: nowIso(),
    });
  }

  for (const lead of getSampleLeads()) {
    memoryStore.leads.push({
      id: memoryStore.nextIds.leads++,
      ...lead,
    });
  }
}

export async function initDb() {
  seedMemoryStore();
  if (!USE_TURSO) {
    console.log('[DB] In-memory store initialized with default admins & sample leads.');
    return;
  }

  try {
    await batchQueryTurso([
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin', 'staff')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        date_of_birth TEXT,
        service_type TEXT NOT NULL,
        current_provider TEXT,
        household_size TEXT,
        annual_income_range TEXT,
        consent INTEGER NOT NULL DEFAULT 0,
        trusted_form_cert_url TEXT,
        trusted_form_retained INTEGER NOT NULL DEFAULT 0,
        trusted_form_cert_id TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'closed')),
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS flight_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        trip_type TEXT NOT NULL,
        departure TEXT DEFAULT '',
        destination TEXT DEFAULT '',
        departure_city TEXT DEFAULT '',
        destination_city TEXT DEFAULT '',
        address TEXT DEFAULT '',
        state TEXT DEFAULT '',
        zip_code TEXT DEFAULT '',
        trusted_form_cert_url TEXT DEFAULT '',
        trusted_form_retained INTEGER NOT NULL DEFAULT 0,
        trusted_form_cert_id TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'booked', 'cancelled')),
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ]);

    const adminPwHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
    for (const uname of ['GNPrimeLink', 'admin']) {
      const { rows } = await queryTurso('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [uname]);
      if (rows.length === 0) {
        await queryTurso('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
          uname,
          adminPwHash,
          'admin',
        ]);
      } else {
        await queryTurso("UPDATE users SET password_hash = ?, role = 'admin' WHERE LOWER(username) = LOWER(?)", [
          adminPwHash,
          uname,
        ]);
      }
    }

    const { rows: leadCountRows } = await queryTurso('SELECT COUNT(*) as count FROM leads');
    if (!leadCountRows.length || leadCountRows[0].count === 0) {
      for (const lead of getSampleLeads()) {
        await createLead(lead);
      }
    }
    tursoAvailable = true;
    console.log(`[DB] Turso Database connected & initialized: ${TURSO_DB_URL}`);
  } catch (err) {
    tursoAvailable = false;
    console.warn(`[DB] Turso init failed (${err.message}). Using in-memory store.`);
  }
}

// ── Lead CRUD ─────────────────────────────────────────────────────────
export async function createLead(data) {
  const lead = {
    id: memoryStore.nextIds.leads++,
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    phone: data.phone || '',
    zip_code: data.zip_code || '',
    date_of_birth: data.date_of_birth || '',
    service_type: data.service_type || '',
    current_provider: data.current_provider || '',
    household_size: data.household_size || '',
    annual_income_range: data.annual_income_range || '',
    consent: data.consent ? 1 : 0,
    trusted_form_cert_url: data.trusted_form_cert_url || '',
    trusted_form_retained: data.trusted_form_retained ? 1 : 0,
    trusted_form_cert_id: data.trusted_form_cert_id || '',
    status: data.status || 'new',
    notes: data.notes || '',
    created_at: nowIso(),
  };

  if (tursoAvailable) {
    try {
      const sql = `
        INSERT INTO leads (
          first_name, last_name, email, phone, zip_code, date_of_birth,
          service_type, current_provider, household_size, annual_income_range,
          consent, trusted_form_cert_url, trusted_form_retained, trusted_form_cert_id,
          status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const { lastId } = await queryTurso(sql, [
        lead.first_name, lead.last_name, lead.email, lead.phone, lead.zip_code,
        lead.date_of_birth, lead.service_type, lead.current_provider,
        lead.household_size, lead.annual_income_range, lead.consent,
        lead.trusted_form_cert_url, lead.trusted_form_retained, lead.trusted_form_cert_id,
        lead.status, lead.notes,
      ]);
      if (lastId) return lastId;
    } catch (err) {
      console.warn('[DB] Turso createLead fallback:', err.message);
    }
  }

  memoryStore.leads.push(lead);
  return lead.id;
}

export async function getLeads({
  search = '',
  status = '',
  service_type = '',
  page = 1,
  per_page = 20,
  sort_by = 'created_at',
  sort_order = 'desc',
} = {}) {
  if (tursoAvailable) {
    try {
      const conditions = [];
      const params = [];
      if (search) {
        conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR zip_code LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s, s);
      }
      if (status && status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
      }
      if (service_type && service_type !== 'all') {
        conditions.push('service_type = ?');
        params.push(service_type);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const validCols = ['created_at', 'first_name', 'last_name', 'service_type', 'status', 'email'];
      const orderCol = validCols.includes(sort_by) ? sort_by : 'created_at';
      const orderDir = String(sort_order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      const isUnlimited = !per_page || per_page <= 0 || per_page >= 50000;

      const results = await batchQueryTurso([
        { sql: `SELECT COUNT(*) as count FROM leads ${where}`, params },
        isUnlimited
          ? { sql: `SELECT * FROM leads ${where} ORDER BY ${orderCol} ${orderDir}`, params }
          : {
              sql: `SELECT * FROM leads ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`,
              params: [...params, per_page, (page - 1) * per_page],
            },
      ]);
      const total = results[0]?.[0]?.count || 0;
      const rows = results[1] || [];

      return {
        leads: rows,
        total,
        page: isUnlimited ? 1 : page,
        per_page: isUnlimited ? total : per_page,
        total_pages: isUnlimited || total === 0 ? 1 : Math.max(1, Math.ceil(total / per_page)),
      };
    } catch (err) {
      console.warn('[DB] Turso getLeads fallback:', err.message);
    }
  }

  let filtered = [...memoryStore.leads];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((l) =>
      [l.first_name, l.last_name, l.email, l.phone, l.zip_code].some((v) =>
        String(v || '').toLowerCase().includes(q)
      )
    );
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((l) => l.status === status);
  }
  if (service_type && service_type !== 'all') {
    filtered = filtered.filter((l) => l.service_type === service_type);
  }

  const validCols = ['created_at', 'first_name', 'last_name', 'service_type', 'status', 'email'];
  const orderCol = validCols.includes(sort_by) ? sort_by : 'created_at';
  const dir = String(sort_order).toLowerCase() === 'asc' ? 1 : -1;

  filtered.sort((a, b) => {
    const va = String(a[orderCol] ?? '');
    const vb = String(b[orderCol] ?? '');
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return (a.id - b.id) * dir;
  });

  const total = filtered.length;
  const isUnlimited = !per_page || per_page <= 0 || per_page >= 50000;
  const leads = isUnlimited
    ? filtered
    : filtered.slice((page - 1) * per_page, (page - 1) * per_page + per_page);

  return {
    leads,
    total,
    page: isUnlimited ? 1 : page,
    per_page: isUnlimited ? total : per_page,
    total_pages: isUnlimited || total === 0 ? 1 : Math.max(1, Math.ceil(total / per_page)),
  };
}

export async function getDashboardStats() {
  if (tursoAvailable) {
    try {
      const results = await batchQueryTurso([
        { sql: 'SELECT COUNT(*) as count FROM leads' },
        { sql: "SELECT COUNT(*) as count FROM leads WHERE date(created_at) = date('now')" },
        { sql: "SELECT COUNT(*) as count FROM leads WHERE created_at >= date('now', '-7 days')" },
        { sql: 'SELECT status, COUNT(*) as count FROM leads GROUP BY status' },
        { sql: 'SELECT service_type, COUNT(*) as count FROM leads GROUP BY service_type ORDER BY COUNT(*) DESC' },
        { sql: 'SELECT COUNT(*) as count FROM leads WHERE trusted_form_retained = 1' },
        { sql: "SELECT COUNT(*) as count FROM leads WHERE trusted_form_cert_url != ''" },
        {
          sql: "SELECT date(created_at) as day, COUNT(*) as count FROM leads WHERE created_at >= date('now', '-6 days') GROUP BY date(created_at) ORDER BY day ASC",
        },
        { sql: 'SELECT * FROM leads ORDER BY created_at DESC LIMIT 5' },
      ]);

      const total_leads = results[0]?.[0]?.count || 0;
      const new_today = results[1]?.[0]?.count || 0;
      const new_this_week = results[2]?.[0]?.count || 0;
      const status_counts = { new: 0, contacted: 0, qualified: 0, closed: 0 };
      for (const r of results[3] || []) {
        status_counts[r.status] = r.count || 0;
      }
      const service_counts = {};
      for (const r of results[4] || []) {
        service_counts[r.service_type] = r.count || 0;
      }
      const tf_retained = results[5]?.[0]?.count || 0;
      const tf_total = results[6]?.[0]?.count || 0;
      const percentage = tf_total > 0 ? Math.round((tf_retained / tf_total) * 1000) / 10 : 0;
      const daily_trends = (results[7] || []).map((r) => ({ day: r.day, count: r.count || 0 }));
      const recent_leads = results[8] || [];

      return {
        total_leads,
        new_today,
        new_this_week,
        status_counts,
        service_counts,
        daily_trends,
        trusted_form: { retained: tf_retained, total_with_cert: tf_total, percentage },
        recent_leads,
      };
    } catch (err) {
      console.warn('[DB] Turso getDashboardStats fallback:', err.message);
    }
  }

  const { leads } = await getLeads({ per_page: 0, sort_by: 'created_at', sort_order: 'desc' });
  const total_leads = leads.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekCutoff = Date.now() - 7 * 86400000;

  let new_today = 0;
  let new_this_week = 0;
  const status_counts = { new: 0, contacted: 0, qualified: 0, closed: 0 };
  const service_counts = {};
  let tf_retained = 0;
  let tf_total = 0;
  const dayMap = new Map();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    dayMap.set(d, 0);
  }

  for (const l of leads) {
    const dayStr = String(l.created_at || '').slice(0, 10);
    const ts = Date.parse(l.created_at || '') || Date.now();
    if (dayStr === todayStr) new_today++;
    if (ts >= weekCutoff) new_this_week++;
    if (l.status) status_counts[l.status] = (status_counts[l.status] || 0) + 1;
    if (l.service_type) service_counts[l.service_type] = (service_counts[l.service_type] || 0) + 1;
    if (l.trusted_form_retained) tf_retained++;
    if (l.trusted_form_cert_url) tf_total++;
    if (dayMap.has(dayStr)) dayMap.set(dayStr, dayMap.get(dayStr) + 1);
  }

  const daily_trends = Array.from(dayMap.entries()).map(([day, count]) => ({ day, count }));
  const percentage = tf_total > 0 ? Math.round((tf_retained / tf_total) * 1000) / 10 : 0;

  return {
    total_leads,
    new_today,
    new_this_week,
    status_counts,
    service_counts,
    daily_trends,
    trusted_form: { retained: tf_retained, total_with_cert: tf_total, percentage },
    recent_leads: leads.slice(0, 5),
  };
}

export async function getLeadById(leadId) {
  if (tursoAvailable) {
    try {
      const { rows } = await queryTurso('SELECT * FROM leads WHERE id = ?', [Number(leadId)]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[DB] Turso getLeadById fallback:', err.message);
    }
  }
  return memoryStore.leads.find((l) => l.id === Number(leadId)) || null;
}

export async function updateLead(leadId, data) {
  const allowed = [
    'status', 'notes', 'first_name', 'last_name', 'email', 'phone',
    'zip_code', 'service_type', 'annual_income_range', 'current_provider', 'date_of_birth',
  ];
  const entries = Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined && v !== null);
  if (entries.length === 0) return false;

  if (tursoAvailable) {
    try {
      const fields = entries.map(([k]) => `${k} = ?`).join(', ');
      const params = [...entries.map(([, v]) => v), Number(leadId)];
      const { affected } = await queryTurso(`UPDATE leads SET ${fields} WHERE id = ?`, params);
      return affected > 0;
    } catch (err) {
      console.warn('[DB] Turso updateLead fallback:', err.message);
    }
  }

  const lead = memoryStore.leads.find((l) => l.id === Number(leadId));
  if (!lead) return false;
  for (const [k, v] of entries) lead[k] = v;
  return true;
}

export async function bulkUpdateLeadStatus(leadIds, status) {
  if (!leadIds?.length || !status) return 0;
  const idList = leadIds.map(Number);

  if (tursoAvailable) {
    try {
      const placeholders = idList.map(() => '?').join(',');
      const { affected } = await queryTurso(
        `UPDATE leads SET status = ? WHERE id IN (${placeholders})`,
        [status, ...idList]
      );
      return affected;
    } catch (err) {
      console.warn('[DB] Turso bulkUpdateLeadStatus fallback:', err.message);
    }
  }

  const idSet = new Set(idList);
  let count = 0;
  for (const l of memoryStore.leads) {
    if (idSet.has(l.id)) {
      l.status = status;
      count++;
    }
  }
  return count;
}

export async function bulkDeleteLeads(leadIds) {
  if (!leadIds?.length) return 0;
  const idList = leadIds.map(Number);

  if (tursoAvailable) {
    try {
      const placeholders = idList.map(() => '?').join(',');
      const { affected } = await queryTurso(`DELETE FROM leads WHERE id IN (${placeholders})`, idList);
      return affected;
    } catch (err) {
      console.warn('[DB] Turso bulkDeleteLeads fallback:', err.message);
    }
  }

  const idSet = new Set(idList);
  const before = memoryStore.leads.length;
  memoryStore.leads = memoryStore.leads.filter((l) => !idSet.has(l.id));
  return before - memoryStore.leads.length;
}

export async function deleteLead(leadId) {
  const numId = Number(leadId);
  if (tursoAvailable) {
    try {
      const { affected } = await queryTurso('DELETE FROM leads WHERE id = ?', [numId]);
      return affected > 0;
    } catch (err) {
      console.warn('[DB] Turso deleteLead fallback:', err.message);
    }
  }
  const before = memoryStore.leads.length;
  memoryStore.leads = memoryStore.leads.filter((l) => l.id !== numId);
  return memoryStore.leads.length < before;
}

// ── Flight Booking CRUD ───────────────────────────────────────────────
export async function createFlightBooking(data) {
  const departure = data.departure || data.departure_city || '';
  const destination = data.destination || data.destination_city || '';
  const booking = {
    id: memoryStore.nextIds.flightBookings++,
    full_name: data.full_name || '',
    email: data.email || '',
    phone: data.phone || '',
    trip_type: data.trip_type || 'Round Trip',
    departure,
    destination,
    departure_city: departure,
    destination_city: destination,
    address: data.address || '',
    state: data.state || '',
    zip_code: data.zip_code || '',
    trusted_form_cert_url: data.trusted_form_cert_url || '',
    trusted_form_retained: data.trusted_form_retained ? 1 : 0,
    trusted_form_cert_id: data.trusted_form_cert_id || '',
    status: data.status || 'new',
    notes: data.notes || '',
    created_at: nowIso(),
  };

  if (tursoAvailable) {
    try {
      const sql = `
        INSERT INTO flight_bookings (
          full_name, email, phone, trip_type,
          departure, destination, departure_city, destination_city,
          address, state, zip_code,
          trusted_form_cert_url, trusted_form_retained, trusted_form_cert_id,
          status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const { lastId } = await queryTurso(sql, [
        booking.full_name, booking.email, booking.phone, booking.trip_type,
        booking.departure, booking.destination, booking.departure_city, booking.destination_city,
        booking.address, booking.state, booking.zip_code,
        booking.trusted_form_cert_url, booking.trusted_form_retained, booking.trusted_form_cert_id,
        booking.status, booking.notes,
      ]);
      if (lastId) return lastId;
    } catch (err) {
      console.warn('[DB] Turso createFlightBooking fallback:', err.message);
    }
  }

  memoryStore.flightBookings.push(booking);
  return booking.id;
}

export async function getFlightBookings({
  search = '',
  status = '',
  page = 1,
  per_page = 20,
  sort_by = 'created_at',
  sort_order = 'desc',
} = {}) {
  if (tursoAvailable) {
    try {
      const conditions = [];
      const params = [];
      if (search) {
        conditions.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR departure LIKE ? OR destination LIKE ? OR address LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s, s, s);
      }
      if (status && status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const validCols = ['created_at', 'full_name', 'departure_city', 'destination_city', 'status', 'email'];
      const orderCol = validCols.includes(sort_by) ? sort_by : 'created_at';
      const orderDir = String(sort_order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      const isUnlimited = !per_page || per_page <= 0 || per_page >= 50000;

      const results = await batchQueryTurso([
        { sql: `SELECT COUNT(*) as count FROM flight_bookings ${where}`, params },
        isUnlimited
          ? { sql: `SELECT * FROM flight_bookings ${where} ORDER BY ${orderCol} ${orderDir}`, params }
          : {
              sql: `SELECT * FROM flight_bookings ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`,
              params: [...params, per_page, (page - 1) * per_page],
            },
      ]);
      const total = results[0]?.[0]?.count || 0;
      const rows = results[1] || [];

      return {
        bookings: rows,
        total,
        page: isUnlimited ? 1 : page,
        per_page: isUnlimited ? total : per_page,
        total_pages: isUnlimited || total === 0 ? 1 : Math.max(1, Math.ceil(total / per_page)),
      };
    } catch (err) {
      console.warn('[DB] Turso getFlightBookings fallback:', err.message);
    }
  }

  let filtered = [...memoryStore.flightBookings];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((b) =>
      [b.full_name, b.email, b.phone, b.departure, b.destination, b.address].some((v) =>
        String(v || '').toLowerCase().includes(q)
      )
    );
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((b) => b.status === status);
  }

  const validCols = ['created_at', 'full_name', 'departure_city', 'destination_city', 'status', 'email'];
  const orderCol = validCols.includes(sort_by) ? sort_by : 'created_at';
  const dir = String(sort_order).toLowerCase() === 'asc' ? 1 : -1;

  filtered.sort((a, b) => {
    const va = String(a[orderCol] ?? '');
    const vb = String(b[orderCol] ?? '');
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return (a.id - b.id) * dir;
  });

  const total = filtered.length;
  const isUnlimited = !per_page || per_page <= 0 || per_page >= 50000;
  const bookings = isUnlimited
    ? filtered
    : filtered.slice((page - 1) * per_page, (page - 1) * per_page + per_page);

  return {
    bookings,
    total,
    page: isUnlimited ? 1 : page,
    per_page: isUnlimited ? total : per_page,
    total_pages: isUnlimited || total === 0 ? 1 : Math.max(1, Math.ceil(total / per_page)),
  };
}

export async function getFlightBookingById(bookingId) {
  if (tursoAvailable) {
    try {
      const { rows } = await queryTurso('SELECT * FROM flight_bookings WHERE id = ?', [Number(bookingId)]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[DB] Turso getFlightBookingById fallback:', err.message);
    }
  }
  return memoryStore.flightBookings.find((b) => b.id === Number(bookingId)) || null;
}

export async function updateFlightBooking(bookingId, data) {
  const allowed = ['status', 'notes', 'departure_city', 'destination_city', 'trip_type'];
  const entries = Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined && v !== null);
  if (entries.length === 0) return false;

  if (tursoAvailable) {
    try {
      const fields = entries.map(([k]) => `${k} = ?`).join(', ');
      const params = [...entries.map(([, v]) => v), Number(bookingId)];
      const { affected } = await queryTurso(`UPDATE flight_bookings SET ${fields} WHERE id = ?`, params);
      return affected > 0;
    } catch (err) {
      console.warn('[DB] Turso updateFlightBooking fallback:', err.message);
    }
  }

  const booking = memoryStore.flightBookings.find((b) => b.id === Number(bookingId));
  if (!booking) return false;
  for (const [k, v] of entries) booking[k] = v;
  return true;
}

export async function deleteFlightBooking(bookingId) {
  const numId = Number(bookingId);
  if (tursoAvailable) {
    try {
      const { affected } = await queryTurso('DELETE FROM flight_bookings WHERE id = ?', [numId]);
      return affected > 0;
    } catch (err) {
      console.warn('[DB] Turso deleteFlightBooking fallback:', err.message);
    }
  }
  const before = memoryStore.flightBookings.length;
  memoryStore.flightBookings = memoryStore.flightBookings.filter((b) => b.id !== numId);
  return memoryStore.flightBookings.length < before;
}

// ── User Management ───────────────────────────────────────────────────
export async function getUserByUsername(username) {
  const clean = String(username || '').trim();
  if (tursoAvailable) {
    try {
      const { rows } = await queryTurso('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [clean]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[DB] Turso getUserByUsername fallback:', err.message);
    }
  }
  return memoryStore.users.find((u) => u.username.toLowerCase() === clean.toLowerCase()) || null;
}

export async function getAllStaff() {
  if (tursoAvailable) {
    try {
      const { rows } = await queryTurso('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
      return rows;
    } catch (err) {
      console.warn('[DB] Turso getAllStaff fallback:', err.message);
    }
  }
  return [...memoryStore.users]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map(({ password_hash, ...rest }) => rest);
}

export async function createUser(username, passwordHash, role = 'staff') {
  const clean = String(username || '').trim();
  if (tursoAvailable) {
    try {
      const { lastId } = await queryTurso(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [clean, passwordHash, role]
      );
      return lastId || 1;
    } catch (err) {
      if (String(err.message).includes('UNIQUE') || String(err.message).includes('already exists')) {
        return -1;
      }
      console.warn('[DB] Turso createUser fallback:', err.message);
    }
  }

  if (memoryStore.users.some((u) => u.username.toLowerCase() === clean.toLowerCase())) {
    return -1;
  }
  const user = {
    id: memoryStore.nextIds.users++,
    username: clean,
    password_hash: passwordHash,
    role,
    created_at: nowIso(),
  };
  memoryStore.users.push(user);
  return user.id;
}

export async function deleteUser(userId) {
  const numId = Number(userId);
  if (tursoAvailable) {
    try {
      const { rows } = await queryTurso('SELECT role FROM users WHERE id = ?', [numId]);
      if (rows[0]?.role === 'admin') {
        const { rows: admRows } = await queryTurso("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        if ((admRows[0]?.count || 0) <= 1) return false;
      }
      const { affected } = await queryTurso('DELETE FROM users WHERE id = ?', [numId]);
      return affected > 0;
    } catch (err) {
      console.warn('[DB] Turso deleteUser fallback:', err.message);
    }
  }

  const target = memoryStore.users.find((u) => u.id === numId);
  if (!target) return false;
  if (target.role === 'admin') {
    const adminCount = memoryStore.users.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) return false;
  }
  const before = memoryStore.users.length;
  memoryStore.users = memoryStore.users.filter((u) => u.id !== numId);
  return memoryStore.users.length < before;
}

// ── System Backup & Restore ───────────────────────────────────────────
export async function getSystemBackup() {
  let users = [];
  let leads = [];
  let flight_bookings = [];

  if (tursoAvailable) {
    try {
      const results = await batchQueryTurso([
        'SELECT id, username, role, created_at FROM users ORDER BY id ASC',
        'SELECT * FROM leads ORDER BY id ASC',
        'SELECT * FROM flight_bookings ORDER BY id ASC',
      ]);
      users = results[0] || [];
      leads = results[1] || [];
      flight_bookings = results[2] || [];
    } catch (err) {
      console.warn('[DB] Turso backup fallback:', err.message);
    }
  } else {
    users = await getAllStaff();
    leads = (await getLeads({ per_page: 0, sort_by: 'created_at', sort_order: 'asc' })).leads;
    flight_bookings = (await getFlightBookings({ per_page: 0, sort_by: 'created_at', sort_order: 'asc' })).bookings;
  }

  return {
    version: '1.0.0',
    export_date: nowIso(),
    platform: 'SmartQuoteHub Enterprise',
    database_backend: tursoAvailable ? 'Turso Cloud (AWS Mumbai)' : 'In-Memory Store',
    stats: {
      total_users: users.length,
      total_leads: leads.length,
      total_flights: flight_bookings.length,
    },
    users,
    leads,
    flight_bookings,
  };
}

export async function restoreSystemBackup(backup) {
  let leads_restored = 0;
  for (const lead of backup.leads || []) {
    await createLead({
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      zip_code: lead.zip_code || '',
      date_of_birth: lead.date_of_birth || '',
      service_type: lead.service_type || 'Health Insurance',
      current_provider: lead.current_provider || '',
      household_size: lead.household_size || '1',
      annual_income_range: lead.annual_income_range || '',
      consent: Boolean(lead.consent ?? 1),
      trusted_form_cert_url: lead.trusted_form_cert_url || '',
      trusted_form_retained: Boolean(lead.trusted_form_retained ?? 0),
      trusted_form_cert_id: lead.trusted_form_cert_id || '',
      status: lead.status || 'new',
      notes: lead.notes || '',
    });
    leads_restored++;
  }

  let flights_restored = 0;
  for (const fb of backup.flight_bookings || []) {
    await createFlightBooking({
      full_name: fb.full_name || '',
      email: fb.email || '',
      phone: fb.phone || '',
      trip_type: fb.trip_type || 'Round Trip',
      departure: fb.departure || fb.departure_city || '',
      destination: fb.destination || fb.destination_city || '',
      address: fb.address || '',
      state: fb.state || '',
      zip_code: fb.zip_code || '',
      trusted_form_cert_url: fb.trusted_form_cert_url || '',
      trusted_form_retained: Boolean(fb.trusted_form_retained ?? 0),
      trusted_form_cert_id: fb.trusted_form_cert_id || '',
      status: fb.status || 'new',
      notes: fb.notes || '',
    });
    flights_restored++;
  }

  return {
    success: true,
    leads_restored,
    flights_restored,
    message: `Successfully restored ${leads_restored} lead records and ${flights_restored} flight bookings to ${
      tursoAvailable ? 'Turso Cloud' : 'Local Database'
    }`,
  };
}

// ── App Settings & Contact Configuration ──────────────────────────────
export async function getContactConfig() {
  let raw = memoryStore.settings.get('contact_config') || null;
  if (tursoAvailable) {
    try {
      const { rows } = await queryTurso('SELECT value FROM app_settings WHERE key = ?', ['contact_config']);
      if (rows.length > 0) raw = rows[0].value;
    } catch (err) {
      console.warn('[DB] Turso getContactConfig fallback:', err.message);
    }
  }

  const base = JSON.parse(JSON.stringify(DEFAULT_CONTACT_CONFIG));
  if (!raw) return base;
  try {
    const data = JSON.parse(raw);
    if (data.services && typeof data.services === 'object') {
      base.services = { ...base.services, ...data.services };
    }
    for (const [k, v] of Object.entries(data)) {
      if (k !== 'services') base[k] = v;
    }
    return base;
  } catch {
    return base;
  }
}

export async function updateContactConfig(newConfig) {
  const current = await getContactConfig();
  if (newConfig.services && typeof newConfig.services === 'object') {
    current.services = { ...current.services, ...newConfig.services };
  }
  for (const [k, v] of Object.entries(newConfig)) {
    if (k !== 'services' && v !== undefined) {
      current[k] = v;
    }
  }
  const serialized = JSON.stringify(current);
  memoryStore.settings.set('contact_config', serialized);

  if (tursoAvailable) {
    try {
      await queryTurso(
        'INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        ['contact_config', serialized, nowIso()]
      );
    } catch (err) {
      console.warn('[DB] Turso updateContactConfig fallback:', err.message);
    }
  }
  return current;
}
