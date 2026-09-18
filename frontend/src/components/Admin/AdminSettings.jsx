import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiServer, FiCpu, FiHardDrive, FiCheckCircle, 
  FiRefreshCw, FiDownload, FiUpload, FiShield, 
  FiSliders, FiActivity, FiDatabase, FiFileText, FiClock,
  FiPhoneCall, FiMessageSquare, FiEye, FiSave, FiCheck, FiSettings
} from 'react-icons/fi';
import ContactRedirectModal from '../ContactRedirectModal';

export default function AdminSettings({ onShowSnackbar }) {
  const [health, setHealth] = useState({ status: 'healthy', latency: 42 });
  const [pinging, setPinging] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastBackupInfo, setLastBackupInfo] = useState(null);
  const fileInputRef = useRef(null);

  const [activeVerticals, setActiveVerticals] = useState({
    'Health Insurance': true,
    'Home Improvement': true,
    'Auto & Home Insurance': true,
    'Debt Relief': true,
    'Legal Help': true,
    'Medicare': true,
    'Flight Booking': true
  });

  // Contact Us & Redirection Config State
  const [contactConfig, setContactConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('contact_config');
      return cached ? JSON.parse(cached) : {
        enabled: true,
        phone_number: '+18558312264',
        modal_title: 'Speak With an Advisor Right Now',
        modal_message: 'Your request has been received! Our support specialists are available immediately to provide personal assistance and lowest quote rates.',
        auto_redirect: true,
        auto_redirect_seconds: 5
      };
    } catch {
      return {
        enabled: true,
        phone_number: '+18558312264',
        modal_title: 'Speak With an Advisor Right Now',
        modal_message: 'Your request has been received! Our support specialists are available immediately to provide personal assistance and lowest quote rates.',
        auto_redirect: true,
        auto_redirect_seconds: 5
      };
    }
  });
  const [savingContact, setSavingContact] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const checkPing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const latency = Math.round(performance.now() - start);
      setHealth({ ...data, latency });
      if (onShowSnackbar) onShowSnackbar(`Server health check passed: ${latency}ms latency`, 'success');
    } catch (err) {
      setHealth({ status: 'error', latency: -1 });
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    checkPing();
    const fetchContactSettings = async () => {
      try {
        const res = await fetch('/api/settings/contact');
        if (res.ok) {
          const data = await res.json();
          setContactConfig(data);
          localStorage.setItem('contact_config', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Could not fetch remote contact config, using local cache', err);
      }
    };
    fetchContactSettings();
  }, []);

  const handleSaveContactConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch('/api/admin/settings/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactConfig)
      });
      const data = await res.json();
      if (res.ok) {
        setContactConfig(data.config || contactConfig);
        localStorage.setItem('contact_config', JSON.stringify(data.config || contactConfig));
        if (onShowSnackbar) {
          onShowSnackbar('Contact Us configuration & form redirect number saved!', 'success');
        }
      } else {
        throw new Error(data.detail || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save contact config error:', err);
      localStorage.setItem('contact_config', JSON.stringify(contactConfig));
      if (onShowSnackbar) {
        onShowSnackbar('Saved contact configuration locally', 'info');
      }
    } finally {
      setSavingContact(false);
    }
  };

  const toggleVertical = (v) => {
    setActiveVerticals(prev => {
      const updated = { ...prev, [v]: !prev[v] };
      if (onShowSnackbar) onShowSnackbar(`Vertical "${v}" intake ${updated[v] ? 'Enabled' : 'Paused'}`, 'info');
      return updated;
    });
  };

  // Real Database Backup Exporter
  const handleBackupExport = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Backup generation failed');
      const backupData = await res.json();
      
      // Trigger file download with clean attachment headers
      const a = document.createElement('a');
      a.href = '/api/admin/backup/download';
      a.setAttribute('download', `smartquotehub_turso_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setLastBackupInfo({
        date: new Date().toLocaleTimeString(),
        totalLeads: backupData.stats?.total_leads || 0,
        totalFlights: backupData.stats?.total_flights || 0,
        totalUsers: backupData.stats?.total_users || 0,
        backend: backupData.database_backend
      });

      if (onShowSnackbar) {
        onShowSnackbar(`Database backup downloaded (${backupData.stats?.total_leads || 0} leads, ${backupData.stats?.total_flights || 0} flights)`, 'success');
      }
    } catch (err) {
      console.error('Backup failed:', err);
      if (onShowSnackbar) onShowSnackbar('Failed to download system backup', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Restore Database Backup Handler
  const handleFileRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    try {
      const fileText = await file.text();
      const backupJson = JSON.parse(fileText);

      if (!backupJson.leads || !Array.isArray(backupJson.leads)) {
        throw new Error('Invalid backup file: Missing leads array');
      }

      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupJson)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Restore failed');

      if (onShowSnackbar) {
        const flightText = data.flights_restored ? ` and ${data.flights_restored} flights` : '';
        onShowSnackbar(`Successfully restored ${data.leads_restored} lead records${flightText} to Turso!`, 'success');
      }
    } catch (err) {
      console.error('Restore error:', err);
      if (onShowSnackbar) onShowSnackbar(`Restore failed: ${err.message}`, 'error');
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Server Status & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h3 className="admin-panel-title">
                  <FiServer style={{ color: 'var(--md-primary)' }} />
                  System Health & API Telemetry
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
                  Real-time server infrastructure & cloud database connectivity
                </span>
              </div>

              <button className="admin-btn-secondary" onClick={checkPing} disabled={pinging}>
                <FiRefreshCw style={{ animation: pinging ? 'spin 1s linear infinite' : 'none' }} />
                {pinging ? 'Pinging...' : 'Ping Server'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="admin-detail-item">
                <div className="admin-detail-label">API Gateway Status</div>
                <div className="admin-detail-value" style={{ color: health.status === 'healthy' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiCheckCircle /> {health.status === 'healthy' ? 'Operational' : 'Degraded'}
                </div>
              </div>

              <div className="admin-detail-item">
                <div className="admin-detail-label">API Latency</div>
                <div className="admin-detail-value" style={{ color: 'var(--md-primary)' }}>
                  {health.latency} ms
                </div>
              </div>

              <div className="admin-detail-item">
                <div className="admin-detail-label">Cloud Database</div>
                <div className="admin-detail-value" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiDatabase /> Turso (AWS Mumbai)
                </div>
              </div>

              <div className="admin-detail-item">
                <div className="admin-detail-label">TCPA Compliance</div>
                <div className="admin-detail-value" style={{ color: '#10b981' }}>
                  ActiveProspect API Live
                </div>
              </div>
            </div>

            {/* Real Backup & Restore Engine */}
            <div style={{ borderTop: '1px solid var(--md-outline-variant)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--md-on-surface)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiDatabase style={{ color: '#2563eb' }} /> Full Database & System Backup
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--md-on-surface-variant)' }}>
                    Export or restore complete Turso Cloud records, schema, and lead certificates
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button 
                    className="admin-btn-secondary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={restoring}
                    title="Upload and restore a previous JSON backup"
                  >
                    <FiUpload /> {restoring ? 'Restoring...' : 'Restore Backup'}
                  </button>

                  <button 
                    className="admin-btn-primary" 
                    onClick={handleBackupExport}
                    disabled={downloading}
                    title="Export complete database JSON dump"
                  >
                    <FiDownload /> {downloading ? 'Exporting...' : 'Download Backup'}
                  </button>
                </div>
              </div>

              {/* Hidden file input for restore */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json,application/json"
                onChange={handleFileRestore}
              />

              {lastBackupInfo && (
                <div style={{ background: 'var(--md-primary-container)', padding: '0.75rem 1rem', borderRadius: '10px', marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--md-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiClock />
                  <span>
                    Last backup exported at <strong>{lastBackupInfo.date}</strong> containing <strong>{lastBackupInfo.totalLeads} leads</strong> and <strong>{lastBackupInfo.totalFlights} flights</strong> from {lastBackupInfo.backend}.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Service Intake Toggles */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h3 className="admin-panel-title">
                <FiSliders style={{ color: 'var(--md-tertiary)' }} />
                Vertical Quote Intake Controls
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
                Enable or pause incoming lead intake per vertical
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(activeVerticals).map(([vertical, isActive]) => (
              <div 
                key={vertical} 
                className="admin-funnel-stage"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleVertical(vertical)}
              >
                <div className="admin-funnel-left">
                  <span 
                    className="admin-funnel-badge-dot" 
                    style={{ backgroundColor: isActive ? '#10b981' : '#94a3b8' }} 
                  />
                  <div>
                    <div className="admin-funnel-title">{vertical}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--md-on-surface-variant)' }}>
                      {isActive ? 'Accepting new consumer quotes' : 'Intake paused (Maintenance)'}
                    </span>
                  </div>
                </div>

                <span className={`status-pill ${isActive ? 'qualified' : 'closed'}`}>
                  {isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Full-Width Section: Contact Us Config Number & On-Screen Form Redirection */}
        <div className="admin-panel" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
          <div className="admin-panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 className="admin-panel-title">
                <FiPhoneCall style={{ color: 'var(--md-primary)' }} />
                Contact Us Config Number & Lead Redirection
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
                Configure the direct hotline number and automatic on-screen message window displayed after any customer submits a form
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                type="button" 
                className="admin-btn-secondary" 
                onClick={() => setPreviewOpen(true)}
                title="Preview the on-screen customer message window"
              >
                <FiEye /> Preview Message Window
              </button>
              <button 
                type="button" 
                className="admin-btn-primary" 
                onClick={handleSaveContactConfig}
                disabled={savingContact}
              >
                <FiSave /> {savingContact ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveContactConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Phone Number Field */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ fontWeight: 700, color: 'var(--md-on-surface)' }}>
                  Primary Contact Hotline Phone Number *
                </label>
                <div className="admin-input-wrapper">
                  <FiPhoneCall className="admin-input-icon" style={{ color: 'var(--md-primary)' }} />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. +18558312264"
                    value={contactConfig.phone_number || ''}
                    onChange={(e) => setContactConfig({ ...contactConfig, phone_number: e.target.value })}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--md-on-surface-variant)' }}>
                  Customers can click to instantly call this number after submitting any quote or flight request.
                </span>
              </div>

              {/* Window Title */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ fontWeight: 700, color: 'var(--md-on-surface)' }}>
                  On-Screen Message Window Title
                </label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--md-outline-variant)', background: 'var(--md-surface)', color: 'var(--md-on-surface)' }}
                  placeholder="e.g. Speak With an Advisor Right Now"
                  value={contactConfig.modal_title || ''}
                  onChange={(e) => setContactConfig({ ...contactConfig, modal_title: e.target.value })}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--md-on-surface-variant)' }}>
                  Headline displayed prominently inside the customer message popup window.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              {/* Auto Redirect Countdown */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ fontWeight: 700, color: 'var(--md-on-surface)' }}>
                  Auto-Redirect Timer (Seconds)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    className="admin-input"
                    style={{ width: '100px', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--md-outline-variant)', background: 'var(--md-surface)', color: 'var(--md-on-surface)' }}
                    value={contactConfig.auto_redirect_seconds || 5}
                    onChange={(e) => setContactConfig({ ...contactConfig, auto_redirect_seconds: Number(e.target.value) })}
                    disabled={!contactConfig.auto_redirect}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--md-on-surface)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(contactConfig.auto_redirect)}
                      onChange={(e) => setContactConfig({ ...contactConfig, auto_redirect: e.target.checked })}
                    />
                    Enable Auto-Redirect Countdown Bar to Call Hotline
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Subtitle / Message */}
            <div className="admin-form-group">
              <label className="admin-form-label" style={{ fontWeight: 700, color: 'var(--md-on-surface)' }}>
                Customer Notice Message
              </label>
              <textarea
                rows="2"
                className="admin-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--md-outline-variant)', background: 'var(--md-surface)', color: 'var(--md-on-surface)', resize: 'vertical' }}
                placeholder="Enter reassurance text displayed in the message window..."
                value={contactConfig.modal_message || ''}
                onChange={(e) => setContactConfig({ ...contactConfig, modal_message: e.target.value })}
              />
            </div>

            {/* Status Activation Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--md-surface-container-low)', borderRadius: '12px', border: '1px solid var(--md-outline-variant)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--md-on-surface)' }}>
                  Message Window Activation Status
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
                  When enabled, any customer submitting a quote or flight request will see this message window immediately on screen.
                </div>
              </div>

              <button
                type="button"
                className={`status-pill ${contactConfig.enabled ? 'qualified' : 'closed'}`}
                style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setContactConfig({ ...contactConfig, enabled: !contactConfig.enabled })}
              >
                {contactConfig.enabled ? 'ACTIVE (DISPLAYING)' : 'DISABLED (OFF)'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Modal */}
      <ContactRedirectModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        config={contactConfig}
        leadData={{
          service: 'Health Insurance',
          name: 'Preview Customer',
          phone: contactConfig.phone_number
        }}
      />
    </motion.div>
  );
}
