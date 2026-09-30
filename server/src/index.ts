import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.js';
import { citiesRouter } from './routes/cities.js';
import { stationsRouter } from './routes/stations.js';
import { fieldRouter } from './routes/field.js';
import { hotspotsRouter } from './routes/hotspots.js';
import { forecastRouter } from './routes/forecast.js';
import { reportsRouter } from './routes/reports.js';
import { casesRouter } from './routes/cases.js';
import { federationRouter } from './routes/federation.js';
import { sourcesRouter } from './routes/sources.js';
import { startCronJobs } from './jobs/refreshJob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos statically
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Mount REST API routes
app.use('/api/health', healthRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/field', fieldRouter);
app.use('/api/hotspots', hotspotsRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/federation', federationRouter);
app.use('/api/sources', sourcesRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'Unknown error'
  });
});

// Start Background Jobs & Server
const server = app.listen(PORT, () => {
  console.log(`💨 Vayu Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  startCronJobs();
});

export default app;
