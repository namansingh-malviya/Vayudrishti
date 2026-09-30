import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { db } from '../db/database.js';
import { Case, CaseEvent, Hotspot, RoutingRule } from '../../../shared/types.js';

export const casesRouter = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `closure-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/cases
casesRouter.get('/', (_req, res) => {
  try {
    const rawCases = db.query<any>(`
      SELECT 
        c.*,
        h.city_id,
        h.lat,
        h.lng,
        h.fused_pm25,
        h.station_est_pm25,
        h.gap,
        h.confidence,
        h.likely_source
      FROM cases c
      JOIN hotspots h ON c.hotspot_id = h.id
      ORDER BY 
        CASE c.status
          WHEN 'open' THEN 1
          WHEN 'assigned' THEN 2
          WHEN 'in_progress' THEN 3
          WHEN 'closed' THEN 4
        END,
        c.due_at ASC
    `);

    const casesWithDetails = rawCases.map(c => {
      // Fetch events
      const events = db.query<CaseEvent>(
        'SELECT * FROM case_events WHERE case_id = ? ORDER BY ts ASC',
        [c.id]
      );

      // Calculate countdown hours
      const dueTime = new Date(c.due_at).getTime();
      const now = Date.now();
      const diffHours = (dueTime - now) / (3600 * 1000);
      const isEscalated = c.status !== 'closed' && diffHours <= 4;

      return {
        id: c.id,
        hotspot_id: c.hotspot_id,
        owner: c.owner,
        authority: c.authority,
        status: c.status,
        due_at: c.due_at,
        closure_photo: c.closure_photo,
        created_at: c.created_at,
        countdown_hours: Number(diffHours.toFixed(1)),
        is_escalated: isEscalated,
        hotspot: {
          id: c.hotspot_id,
          city_id: c.city_id,
          lat: c.lat,
          lng: c.lng,
          fused_pm25: c.fused_pm25,
          station_est_pm25: c.station_est_pm25,
          gap: c.gap,
          confidence: c.confidence,
          likely_source: c.likely_source,
          is_simulated: true
        },
        events
      };
    });

    res.json({
      count: casesWithDetails.length,
      cases: casesWithDetails
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// POST /api/cases (create a case from a hotspot)
const CreateCaseSchema = z.object({
  hotspot_id: z.string(),
  owner: z.string().optional(),
  authority: z.string().optional(),
  priority: z.enum(['standard', 'urgent']).default('standard')
});

casesRouter.post('/', (req, res) => {
  try {
    const { hotspot_id, owner, authority: customAuthority } = CreateCaseSchema.parse(req.body);

    // Verify hotspot exists
    const hotspot = db.queryOne<Hotspot>('SELECT * FROM hotspots WHERE id = ?', [hotspot_id]);
    if (!hotspot) {
      return res.status(404).json({ error: `Hotspot '${hotspot_id}' not found` });
    }

    // Check if case already exists for this hotspot
    const existingCase = db.queryOne<Case>('SELECT * FROM cases WHERE hotspot_id = ?', [hotspot_id]);
    if (existingCase) {
      return res.status(409).json({
        error: 'A case is already opened for this hotspot',
        case_id: existingCase.id
      });
    }

    // Determine authority from routing_rules based on hotspot likely_source
    const routing = db.queryOne<RoutingRule>(
      'SELECT * FROM routing_rules WHERE source_type = ?',
      [hotspot.likely_source]
    );

    const assignedAuthority = customAuthority || routing?.authority || 'Municipal Corporation of Delhi (MCD)';
    const assignedOwner = owner || 'Pending Assignment (District Nodal Officer)';
    const caseId = `CASE-${new Date().getFullYear()}-DEL-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    // 24-hour statutory countdown
    const dueAt = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    const createdAt = now.toISOString();

    db.execute(
      'INSERT INTO cases (id, hotspot_id, owner, authority, status, due_at, closure_photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [caseId, hotspot_id, assignedOwner, assignedAuthority, 'open', dueAt, null, createdAt]
    );

    // Insert initial creation event with rule action
    const actionDesc = routing ? routing.action : 'Standard site inspection initiated.';
    db.execute(
      'INSERT INTO case_events (case_id, type, note, ts) VALUES (?, ?, ?, ?)',
      [caseId, 'created', `Case opened for unmonitored hotspot (+${hotspot.gap} µg/m³ gap). Auto-routed under statutory rules: "${actionDesc}"`, createdAt]
    );

    const created = db.queryOne<Case>('SELECT * FROM cases WHERE id = ?', [caseId]);
    res.status(201).json({
      message: 'Enforcement case created successfully',
      case: created
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: err?.message });
  }
});

// PATCH /api/cases/:id (assign or change status)
const UpdateCaseSchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'closed']).optional(),
  owner: z.string().optional(),
  authority: z.string().optional(),
  note: z.string().optional()
});

casesRouter.patch('/:id', (req, res) => {
  try {
    const caseId = req.params.id;
    const { status, owner, authority, note } = UpdateCaseSchema.parse(req.body);

    const existing = db.queryOne<Case>('SELECT * FROM cases WHERE id = ?', [caseId]);
    if (!existing) {
      return res.status(404).json({ error: `Case '${caseId}' not found` });
    }

    const newStatus = status || existing.status;
    const newOwner = owner || existing.owner;
    const newAuthority = authority || existing.authority;

    db.execute(
      'UPDATE cases SET status = ?, owner = ?, authority = ? WHERE id = ?',
      [newStatus, newOwner, newAuthority, caseId]
    );

    // Record audit event
    const now = new Date().toISOString();
    let eventType: CaseEvent['type'] = 'status_change';
    if (owner && owner !== existing.owner) eventType = 'assigned';

    const eventNote = note || `Case updated: status set to '${newStatus}', assigned to '${newOwner}'.`;
    db.execute(
      'INSERT INTO case_events (case_id, type, note, ts) VALUES (?, ?, ?, ?)',
      [caseId, eventType, eventNote, now]
    );

    const updated = db.queryOne<Case>('SELECT * FROM cases WHERE id = ?', [caseId]);
    res.json({
      message: 'Case updated successfully',
      case: updated
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: err?.message });
  }
});

// POST /api/cases/:id/close (closure photo strictly required!)
casesRouter.post('/:id/close', upload.single('closure_photo'), (req, res) => {
  try {
    const caseId = req.params.id;
    const existing = db.queryOne<Case>('SELECT * FROM cases WHERE id = ?', [caseId]);
    if (!existing) {
      return res.status(404).json({ error: `Case '${caseId}' not found` });
    }

    if (!req.file && !req.body.closure_photo) {
      return res.status(400).json({
        error: 'A verified on-ground closure photo is mandatory to resolve and close an enforcement case.'
      });
    }

    const photoPath = req.file ? `/uploads/${req.file.filename}` : req.body.closure_photo;
    const note = req.body.note || 'Enforcement team verified remediation on site: fire doused / misting deployed. Verification photo archived.';
    const now = new Date().toISOString();

    // Mark case closed with photo
    db.execute(
      'UPDATE cases SET status = ?, closure_photo = ? WHERE id = ?',
      ['closed', photoPath, caseId]
    );

    // Insert closure audit event
    db.execute(
      'INSERT INTO case_events (case_id, type, note, ts) VALUES (?, ?, ?, ?)',
      [caseId, 'closed', note, now]
    );

    // Recalculate or mitigate the hotspot gap!
    db.execute(
      'UPDATE hotspots SET fused_pm25 = station_est_pm25 + 15, gap = 15 WHERE id = ?',
      [existing.hotspot_id]
    );

    const closed = db.queryOne<Case>('SELECT * FROM cases WHERE id = ?', [caseId]);
    res.json({
      message: 'Enforcement case successfully verified and closed with photographic evidence',
      case: closed
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
