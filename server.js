import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from './db.js';
import { hashPassword, verifyPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const TRUSTEDFORM_API_KEY = process.env.TRUSTEDFORM_API_KEY || '';

// ── Static Data ───────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 1,
    title: 'Health Insurance',
    description:
      'Find affordable health coverage plans tailored to your needs and budget. Compare options from leading providers.',
    icon: 'health',
    color: '#4ecdc4',
  },
  {
    id: 2,
    title: 'Home Improvement',
    description:
      'Connect with pre-screened, top-rated contractors in your area for renovations, repairs, and remodeling.',
    icon: 'home',
    color: '#f0a500',
  },
  {
    id: 3,
    title: 'Auto & Home Insurance',
    description:
      'Bundle your auto and home policies to unlock significant savings with trusted insurance carriers.',
    icon: 'auto',
    color: '#6c63ff',
  },
  {
    id: 4,
    title: 'Debt Relief',
    description:
      'Explore proven solutions to manage and reduce your debt. Get matched with certified financial advisors.',
    icon: 'debt',
    color: '#ff6b6b',
  },
  {
    id: 5,
    title: 'Legal Help',
    description:
      'Connect with qualified, experienced local attorneys who specialize in your specific legal needs.',
    icon: 'legal',
    color: '#a29bfe',
  },
  {
    id: 6,
    title: 'Medicare',
    description:
      'Navigate Medicare plans with confidence. Compare Medicare Advantage, Supplement, and Part D options.',
    icon: 'medicare',
    color: '#00b894',
  },
  {
    id: 7,
    title: 'Flight Booking',
    description:
      'Compare discounted airfares, book domestic and international flights, and explore exclusive travel deals.',
    icon: 'travel',
    color: '#2563eb',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Tell Us What You Need',
    description:
      "Answer a few quick questions about the service you're looking for. It takes less than 2 minutes.",
    icon: 'clipboard',
  },
  {
    step: 2,
    title: 'Compare Top Quotes',
    description:
      'We match you with pre-screened professionals and deliver competitive quotes directly to you.',
    icon: 'compare',
  },
  {
    step: 3,
    title: 'Choose & Save',
    description:
      'Review your options, pick the best fit, and start saving today. No obligations, no hidden fees.',
    icon: 'save',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Homeowner, Austin TX',
    quote:
      'SmartQuoteHub saved me over $1,200 on my home insurance. The comparison process was incredibly easy and I had quotes within minutes.',
    rating: 5,
    avatar_initial: 'S',
  },
  {
    id: 2,
    name: 'James Rodriguez',
    role: 'Small Business Owner, Miami FL',
    quote:
      "I was drowning in debt and didn't know where to turn. This platform connected me with an advisor who created a realistic payoff plan.",
    rating: 5,
    avatar_initial: 'J',
  },
  {
    id: 3,
    name: 'Linda Chen',
    role: 'Retiree, Portland OR',
    quote:
      'Navigating Medicare was so confusing until I found SmartQuoteHub. They made it simple to compare plans and find the right coverage.',
    rating: 5,
    avatar_initial: 'L',
  },
  {
    id: 4,
    name: 'Marcus Thompson',
    role: 'New Homeowner, Denver CO',
    quote:
      'Found an amazing contractor for my kitchen renovation through this site. The whole process from quote to completion was seamless.',
    rating: 4,
    avatar_initial: 'M',
  },
];

const FAQS = [
  {
    id: 1,
    question: 'Is SmartQuoteHub really free to use?',
    answer:
      'Yes, absolutely! Our comparison service is 100% free for consumers. We are compensated by our network of service providers, so you never pay a dime to use our platform.',
  },
  {
    id: 2,
    question: 'How do you find and vet professionals?',
    answer:
      'We partner with a nationwide network of licensed, insured, and pre-screened professionals. Every provider in our network undergoes a thorough background check and must meet our quality standards before they can offer quotes through our platform.',
  },
  {
    id: 3,
    question: 'How quickly will I receive quotes?',
    answer:
      'Most users receive their first quotes within minutes of submitting a request. Depending on the service type and your location, you may receive multiple quotes within the first hour.',
  },
  {
    id: 4,
    question: 'Is my personal information secure?',
    answer:
      'Absolutely. We use industry-standard 256-bit SSL encryption to protect your data. We never sell your personal information to third parties, and you can request deletion of your data at any time.',
  },
  {
    id: 5,
    question: 'Can I compare quotes from multiple providers?',
    answer:
      "Yes — that's our core feature! We present you with multiple competitive quotes side-by-side so you can easily compare pricing, coverage, and reviews to make the best decision.",
  },
  {
    id: 6,
    question: 'What areas do you serve?',
    answer:
      'We serve customers across all 50 US states. Our network includes thousands of professionals and providers nationwide, ensuring coverage no matter where you live.',
  },
];

// ── TrustedForm Helper ────────────────────────────────────────────────
async function retainTrustedFormCert(certUrl) {
  if (!certUrl) {
    return { retained: false, cert_id: '', error: 'No certificate URL provided' };
  }
  if (!TRUSTEDFORM_API_KEY) {
    return { retained: false, cert_id: '', error: 'TrustedForm API key not configured' };
  }

  const authHeader = 'Basic ' + Buffer.from(`API:${TRUSTEDFORM_API_KEY}`).toString('base64');
  const headers = {
    Authorization: authHeader,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const resp = await fetch(certUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ vendor: 'SmartQuoteHub' }),
    });
    if (resp.status === 200 || resp.status === 201) {
      const data = await resp.json();
      return { retained: true, cert_id: data.id || data.cert_id || '', data };
    }

    const altResp = await fetch('https://api.trustedform.com/claims', {
      method: 'POST',
      headers,
      body: JSON.stringify({ match_lead_url: certUrl }),
    });
    if (altResp.status === 200 || altResp.status === 201) {
      const data = await altResp.json();
      return { retained: true, cert_id: data.id || '', data };
    }

    return {
      retained: false,
      cert_id: '',
      status_code: resp.status,
      error: await resp.text(),
    };
  } catch (err) {
    return { retained: false, cert_id: '', error: String(err) };
  }
}

function csvEscape(val) {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ── Express App Setup ─────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Public Endpoints ──────────────────────────────────────────────────
app.get('/api/services', (_req, res) => res.json({ services: SERVICES }));
app.get('/api/how-it-works', (_req, res) => res.json({ steps: HOW_IT_WORKS }));
app.get('/api/testimonials', (_req, res) => res.json({ testimonials: TESTIMONIALS }));
app.get('/api/faqs', (_req, res) => res.json({ faqs: FAQS }));
app.get('/api/health', (_req, res) => res.json({ status: 'healthy' }));

app.post('/api/quote-request', async (req, res) => {
  try {
    const body = req.body || {};
    const fullName = String(body.full_name || '').trim();
    const parts = fullName.split(/\s+/, 2);
    const first_name = parts[0] || '';
    const last_name = fullName.includes(' ') ? fullName.slice(fullName.indexOf(' ') + 1).trim() : '';

    const tf_cert_url = body.trusted_form_cert_url || body.xxTrustedFormCertUrl || '';
    const tf_result = tf_cert_url ? await retainTrustedFormCert(tf_cert_url) : { retained: false, cert_id: '' };

    const answers = body.answers || {};
    const household_size = body.household_size || answers.household_size || '';
    const annual_income =
      body.annual_income_range ||
      answers.annual_income_range ||
      answers.income_range ||
      answers.debt_amount ||
      answers.coverage_amount ||
      '';
    const current_provider =
      body.current_provider ||
      answers.current_provider ||
      answers.current_carrier ||
      answers.current_coverage ||
      '';
    const dob =
      body.date_of_birth ||
      answers.date_of_birth ||
      answers.age_group ||
      answers.age_range ||
      '';

    const notesParts = [];
    const formattedAnswers = Object.entries(answers)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`);
    if (formattedAnswers.length > 0) notesParts.push(formattedAnswers.join(' | '));
    if (body.message) notesParts.push(`Message: ${body.message}`);
    if (body.notes) notesParts.push(body.notes);

    const lead_id = await db.createLead({
      first_name,
      last_name,
      email: body.email || '',
      phone: body.phone || '',
      zip_code: body.zip_code || '',
      date_of_birth: dob,
      service_type: body.service_type || '',
      current_provider,
      household_size: String(household_size),
      annual_income_range: String(annual_income),
      consent: true,
      trusted_form_cert_url: tf_cert_url,
      trusted_form_retained: Boolean(tf_result.retained),
      trusted_form_cert_id: tf_result.cert_id || '',
      status: 'new',
      notes: notesParts.join('\n'),
    });

    const lead = await db.getLeadById(lead_id);
    res.json({
      success: true,
      lead_id,
      lead,
      trusted_form: tf_result,
      message: `Thank you, ${body.full_name}! Your quote request for ${body.service_type} has been received. We'll reach out shortly.`,
    });
  } catch (err) {
    res.status(500).json({ detail: String(err.message || err) });
  }
});

// ── Admin Auth & Analytics ────────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = await db.getUserByUsername(username);
  if (!user || !verifyPassword(password || '', user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid username or password' });
  }
  res.json({
    success: true,
    token: `session-${user.id}-${user.username}`,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    },
  });
});

app.get('/api/admin/stats', async (_req, res) => {
  res.json(await db.getDashboardStats());
});

// ── Leads Management ──────────────────────────────────────────────────
app.get('/api/leads', async (req, res) => {
  const {
    search = '',
    status = '',
    service_type = '',
    page = '1',
    per_page = '0',
    sort_by = 'created_at',
    sort_order = 'desc',
  } = req.query;

  const result = await db.getLeads({
    search: String(search),
    status: String(status),
    service_type: String(service_type),
    page: Number(page) || 1,
    per_page: Number(per_page) || 0,
    sort_by: String(sort_by),
    sort_order: String(sort_order),
  });
  res.json(result);
});

app.get('/api/admin/leads/export-csv', async (req, res) => {
  const {
    search = '',
    status = '',
    service_type = '',
    sort_by = 'created_at',
    sort_order = 'desc',
  } = req.query;

  const result = await db.getLeads({
    search: String(search),
    status: String(status),
    service_type: String(service_type),
    page: 1,
    per_page: 0,
    sort_by: String(sort_by),
    sort_order: String(sort_order),
  });

  const headers = [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Zip Code',
    'Service Type', 'Current Provider', 'Income Range', 'Household Size',
    'Date of Birth', 'Status', 'TrustedForm Certificate', 'Created At',
  ];
  const rows = [headers.map(csvEscape).join(',')];

  for (const l of result.leads) {
    const certUrl = String(l.trusted_form_cert_url || '').trim();
    const tfCell = certUrl ? `=HYPERLINK("${certUrl}", "${certUrl}")` : '';
    rows.push(
      [
        l.id, l.first_name, l.last_name, l.email, l.phone, l.zip_code,
        l.service_type, l.current_provider || '', l.annual_income_range || '',
        l.household_size || '', l.date_of_birth || '', l.status, tfCell, l.created_at,
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="smartquotehub_customers_${stamp}.csv"`);
  res.send('\ufeff' + rows.join('\r\n'));
});

app.post('/api/admin/leads', async (req, res) => {
  const b = req.body || {};
  const lead_id = await db.createLead({
    first_name: b.first_name || '',
    last_name: b.last_name || '',
    email: b.email || '',
    phone: b.phone || '',
    zip_code: b.zip_code || '',
    service_type: b.service_type || 'Health Insurance',
    current_provider: b.current_provider || '',
    household_size: '1',
    annual_income_range: b.annual_income_range || '',
    date_of_birth: b.date_of_birth || '',
    consent: true,
    trusted_form_cert_url: '',
    trusted_form_retained: false,
    trusted_form_cert_id: '',
    status: b.status || 'new',
    notes: b.notes || '',
  });
  res.json({ success: true, lead_id, lead: await db.getLeadById(lead_id) });
});

app.post('/api/leads/bulk-status', async (req, res) => {
  const { lead_ids = [], status = '' } = req.body || {};
  const updated_count = await db.bulkUpdateLeadStatus(lead_ids, status);
  res.json({ success: true, updated_count, message: `Updated ${updated_count} leads to ${status}` });
});

app.post('/api/leads/bulk-delete', async (req, res) => {
  const { lead_ids = [] } = req.body || {};
  const deleted_count = await db.bulkDeleteLeads(lead_ids);
  res.json({ success: true, deleted_count, message: `Deleted ${deleted_count} leads` });
});

app.get('/api/leads/:leadId', async (req, res) => {
  const lead = await db.getLeadById(req.params.leadId);
  if (!lead) return res.status(404).json({ detail: 'Lead not found' });
  res.json(lead);
});

app.put('/api/leads/:leadId', async (req, res) => {
  const ok = await db.updateLead(req.params.leadId, req.body || {});
  if (!ok) return res.status(400).json({ detail: 'Failed to update lead or no fields changed' });
  res.json({
    success: true,
    message: 'Lead updated successfully',
    lead: await db.getLeadById(req.params.leadId),
  });
});

app.delete('/api/leads/:leadId', async (req, res) => {
  const ok = await db.deleteLead(req.params.leadId);
  if (!ok) return res.status(404).json({ detail: 'Lead not found' });
  res.json({ success: true, message: 'Lead deleted successfully' });
});

// ── Flight Bookings API ───────────────────────────────────────────────
app.post('/api/travel/flight-booking', async (req, res) => {
  const b = req.body || {};
  const fullName = String(b.full_name || '').trim();
  const phone = String(b.phone || '').trim();
  if (!fullName) return res.status(400).json({ detail: 'Full Name is required' });
  if (!phone) return res.status(400).json({ detail: 'Phone Number is required' });

  const departure = String(b.departure || b.departure_city || '').trim();
  const destination = String(b.destination || b.destination_city || '').trim();
  const emailVal = String(b.email || '').trim();
  const address = String(b.address || '').trim();
  const state = String(b.state || '').trim();
  const zip_code = String(b.zip_code || '').trim();

  const tf_cert_url = String(b.trusted_form_cert_url || b.xxTrustedFormCertUrl || '').trim();
  const tf_result = tf_cert_url ? await retainTrustedFormCert(tf_cert_url) : { retained: false, cert_id: '' };

  const booking_id = await db.createFlightBooking({
    full_name: fullName,
    email: emailVal,
    phone,
    trip_type: b.trip_type || 'Round Trip',
    departure,
    destination,
    departure_city: departure,
    destination_city: destination,
    address,
    state,
    zip_code,
    trusted_form_cert_url: tf_cert_url,
    trusted_form_retained: Boolean(tf_result.retained),
    trusted_form_cert_id: tf_result.cert_id || '',
    status: 'new',
    notes: b.notes || '',
  });

  // Mirror into leads table for unified staff visibility
  const spaceIdx = fullName.indexOf(' ');
  const first_name = spaceIdx === -1 ? fullName : fullName.slice(0, spaceIdx);
  const last_name = spaceIdx === -1 ? '' : fullName.slice(spaceIdx + 1).trim();
  const routeDesc = departure || destination ? `${departure} -> ${destination}` : 'Direct Flight Assistance';
  let flightNotes = `Trip Type: ${b.trip_type || 'Round Trip'} | Service: ${routeDesc}`;
  if (address) flightNotes += ` | Address: ${address}`;
  if (state) flightNotes += ` | State: ${state}`;
  if (zip_code) flightNotes += ` | Zip: ${zip_code}`;
  if (b.notes) flightNotes += `\nCustomer Notes: ${b.notes}`;

  await db.createLead({
    first_name,
    last_name,
    email: emailVal || 'no-email@smartquotehub.com',
    phone,
    zip_code: zip_code || '00000',
    date_of_birth: '',
    service_type: 'Flight Booking',
    current_provider: 'Flight Desk',
    household_size: '1',
    annual_income_range: '',
    consent: true,
    trusted_form_cert_url: tf_cert_url,
    trusted_form_retained: Boolean(tf_result.retained),
    trusted_form_cert_id: tf_result.cert_id || '',
    status: 'new',
    notes: flightNotes,
  });

  res.json({
    success: true,
    booking_id,
    booking: await db.getFlightBookingById(booking_id),
    trusted_form: tf_result,
    message: `Thank you, ${b.full_name}! Your flight booking request has been received. Our flight desk will send your fare options shortly.`,
  });
});

app.get('/api/travel/flight-bookings', async (req, res) => {
  const {
    search = '',
    status = '',
    page = '1',
    per_page = '20',
    sort_by = 'created_at',
    sort_order = 'desc',
  } = req.query;

  res.json(
    await db.getFlightBookings({
      search: String(search),
      status: String(status),
      page: Number(page) || 1,
      per_page: Number(per_page) || 20,
      sort_by: String(sort_by),
      sort_order: String(sort_order),
    })
  );
});

app.get('/api/travel/flight-bookings/:bookingId', async (req, res) => {
  const booking = await db.getFlightBookingById(req.params.bookingId);
  if (!booking) return res.status(404).json({ detail: 'Flight booking not found' });
  res.json(booking);
});

app.put('/api/travel/flight-bookings/:bookingId', async (req, res) => {
  const ok = await db.updateFlightBooking(req.params.bookingId, req.body || {});
  if (!ok) return res.status(400).json({ detail: 'Failed to update flight booking or no fields changed' });
  res.json({
    success: true,
    message: 'Flight booking updated successfully',
    booking: await db.getFlightBookingById(req.params.bookingId),
  });
});

app.delete('/api/travel/flight-bookings/:bookingId', async (req, res) => {
  const ok = await db.deleteFlightBooking(req.params.bookingId);
  if (!ok) return res.status(404).json({ detail: 'Flight booking not found' });
  res.json({ success: true, message: 'Flight booking deleted successfully' });
});

// ── Admin Staff Users ─────────────────────────────────────────────────
app.get('/api/admin/users', async (_req, res) => {
  res.json({ users: await db.getAllStaff() });
});

app.post('/api/admin/users', async (req, res) => {
  const { username = '', password = '', role = 'staff' } = req.body || {};
  if (String(username).trim().length < 3) {
    return res.status(400).json({ detail: 'Username must be at least 3 characters long' });
  }
  if (String(password).trim().length < 4) {
    return res.status(400).json({ detail: 'Password must be at least 4 characters long' });
  }
  const hashed = hashPassword(password);
  const user_id = await db.createUser(String(username).trim(), hashed, role || 'staff');
  if (user_id === -1) {
    return res.status(400).json({ detail: 'Username already exists' });
  }
  res.json({ success: true, user_id, message: 'User created successfully' });
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  const ok = await db.deleteUser(req.params.userId);
  if (!ok) {
    return res.status(400).json({ detail: 'Cannot delete this user (it may be the last remaining admin)' });
  }
  res.json({ success: true, message: 'User deleted successfully' });
});

// ── System Backup & Restore ───────────────────────────────────────────
app.get('/api/admin/backup', async (_req, res) => {
  res.json(await db.getSystemBackup());
});

app.get('/api/admin/backup/download', async (_req, res) => {
  const backupData = await db.getSystemBackup();
  const dateStr = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="smartquotehub_backup_${dateStr}.json"`);
  res.setHeader('Cache-Control', 'no-cache');
  res.send(JSON.stringify(backupData, null, 2));
});

app.post('/api/admin/restore', async (req, res) => {
  const backupData = req.body;
  if (!backupData || !Array.isArray(backupData.leads)) {
    return res.status(400).json({ detail: 'Invalid backup file format' });
  }
  res.json(await db.restoreSystemBackup(backupData));
});

// ── Contact Configuration ─────────────────────────────────────────────
app.get('/api/settings/contact', async (_req, res) => {
  res.json(await db.getContactConfig());
});

app.post('/api/admin/settings/contact', async (req, res) => {
  const updated = await db.updateContactConfig(req.body || {});
  res.json({
    success: true,
    config: updated,
    message: 'Contact redirection settings saved successfully',
  });
});

// ── Frontend Serving (Vite Dev Middleware or Built Static Dist) ───────
async function startServer() {
  await db.initDb();

  const frontendDir = path.join(__dirname, 'frontend');
  const distDir = path.join(frontendDir, 'dist');
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: frontendDir,
      configFile: path.join(frontendDir, 'vite.config.js'),
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartQuoteHub server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
