import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { db } from '../db/database.js';
import { inspectReportPhoto } from '../services/aiInspection.js';
import { ReportCategory } from '../../../shared/types.js';

export const reportsRouter = Router();

// Configure Multer storage
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = `report-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// GET /api/reports
reportsRouter.get('/', (_req, res) => {
  try {
    const reports = db.query<any>('SELECT * FROM reports ORDER BY created_at DESC');
    res.json({
      count: reports.length,
      reports: reports.map(r => ({
        ...r,
        is_simulated: true // Honest badge requirement
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// POST /api/reports (multipart photo upload)
reportsRouter.post('/', upload.single('photo'), (req, res) => {
  try {
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);
    const category = (req.body.category || 'other') as ReportCategory;
    const address = req.body.address || 'Reported Location, Delhi NCR';

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid numerical latitude and longitude are required.' });
    }

    const photoFilename = req.file ? req.file.filename : 'placeholder-smoke.jpg';
    const photoPath = `/uploads/${photoFilename}`;

    // Perform AI verification, GPS sanity check, and duplicate detection
    const inspection = inspectReportPhoto(lat, lng, category, photoFilename);

    const reportId = `rep-${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.execute(
      'INSERT INTO reports (id, lat, lng, category, photo_path, ai_label, ai_confidence, trust_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [reportId, lat, lng, category, photoPath, inspection.ai_label, inspection.ai_confidence, inspection.trust_score, createdAt]
    );

    // If report is high trust and near a severe blindspot, check if hotspot should be updated or created
    const createdReport = db.queryOne('SELECT * FROM reports WHERE id = ?', [reportId]);

    res.status(201).json({
      message: 'Citizen observation recorded and inspected',
      report: {
        ...createdReport,
        address,
        is_simulated: true
      },
      inspection,
      evidence_note: 'AI check labelled as evidence, not regulatory measurement.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
