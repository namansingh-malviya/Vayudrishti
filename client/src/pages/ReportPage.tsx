import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Upload,
  ArrowRight,
  Info
} from 'lucide-react';
import { submitReport } from '../api/client';
import { PlateBlurCanvas } from '../components/PlateBlurCanvas';
import { SimulationBadge } from '../components/SimulationBadge';
import { ReportCategory } from '@shared/types';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [blurredBlob, setBlurredBlob] = useState<Blob | null>(null);

  const [lat, setLat] = useState<number>(28.7412);
  const [lng, setLng] = useState<number>(77.1528);
  const [address, setAddress] = useState('Bhalaswa Bypass, North Delhi');
  const [category, setCategory] = useState<ReportCategory>('garbage_burning');
  const [description, setDescription] = useState('');
  
  const [gettingGps, setGettingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setBlurredBlob(null);
    }
  };

  // Auto GPS
  const handleAutoGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(4)));
        setLng(Number(pos.coords.longitude.toFixed(4)));
        setAddress(`GPS Coords: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
        setGettingGps(false);
      },
      (err) => {
        console.warn('GPS position error:', err);
        // Fallback preset
        setLat(28.7412);
        setLng(77.1528);
        setAddress('Bhalaswa Environs, Delhi NCR');
        setGettingGps(false);
      },
      { timeout: 8000 }
    );
  };

  // Quick coordinate presets
  const presets = [
    { name: 'Bhalaswa Landfill', lat: 28.7412, lng: 77.1528, cat: 'garbage_burning' as ReportCategory },
    { name: 'Mayapuri Industrial', lat: 28.6315, lng: 77.1142, cat: 'industrial_plume' as ReportCategory },
    { name: 'Dwarka Sector 24', lat: 28.5721, lng: 77.0345, cat: 'construction' as ReportCategory },
    { name: 'Ghazipur Border', lat: 28.6234, lng: 77.3298, cat: 'garbage_burning' as ReportCategory },
  ];

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('lat', lat.toString());
      formData.append('lng', lng.toString());
      formData.append('category', category);
      formData.append('address', address);
      formData.append('description', description);

      // Attach blurred blob if available, otherwise original file
      if (blurredBlob) {
        formData.append('photo', blurredBlob, 'blurred-evidence.jpg');
      } else if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await submitReport(formData);
      setSubmissionResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl font-bold text-ink">
            Report Pollution Hotspot
          </h1>
          <SimulationBadge label="Citizen Telemetry" />
        </div>
        <p className="text-xs text-slate font-sans mt-0.5">
          Submit geotagged visual evidence to trigger flying squad investigation. Client-side privacy redaction ensures DPDP Act 2023 compliance.
        </p>
      </div>

      {/* Success View */}
      {submissionResult ? (
        <div className="card-frame p-6 bg-emerald-50/50 border-emerald-300 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-emerald-950">
                Observation Recorded & Inspected
              </h2>
              <span className="font-mono text-xs text-emerald-800">
                Report ID: {submissionResult.report?.id}
              </span>
            </div>
          </div>

          {/* AI Inspection Card */}
          <div className="p-4 bg-white rounded-card border border-hairline shadow-subtle space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-signal" />
                <span>AI Computer Vision Triage Label</span>
              </span>
              <span className="font-mono font-bold text-signal">
                {Math.round(submissionResult.inspection?.ai_confidence * 100)}% Confidence
              </span>
            </div>

            <p className="font-medium text-ink text-sm">
              {submissionResult.inspection?.ai_label}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate pt-1">
              <span>Data Integrity Trust Score:</span>
              <span className="font-mono font-semibold text-ink">
                {Math.round(submissionResult.inspection?.trust_score * 100)}%
              </span>
            </div>

            {/* Mandatory Honesty Label */}
            <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] flex items-start gap-1.5 mt-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Advisory Note:</strong> AI check is advisory evidence for enforcement triage; it does not substitute for statutory CPCB/DPCC regulatory gravimetric measurements.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setSubmissionResult(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setBlurredBlob(null);
              }}
              className="px-3 py-1.5 rounded-button text-xs text-slate hover:bg-paper"
            >
              Submit Another Report
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-button bg-signal hover:bg-signal-hover text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5"
            >
              <span>View On Live Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-button bg-alert-light border border-alert/30 text-alert text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Photo Capture & Privacy Tool */}
          <div className="card-frame p-4 space-y-3">
            <label className="block text-xs font-semibold text-ink">
              1. Photographic Evidence
            </label>

            {!photoPreview ? (
              <div className="border-2 border-dashed border-hairline rounded-card p-6 text-center hover:bg-paper/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-signal-light text-signal flex items-center justify-center mx-auto">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-ink block">
                      Take photo or upload image
                    </span>
                    <span className="text-[11px] text-slate block">
                      JPEG, PNG up to 10MB
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Client-Side Plate & Face Blur Tool */}
                <PlateBlurCanvas
                  imageSrc={photoPreview}
                  onBlurredImageReady={(blob) => setBlurredBlob(blob)}
                />

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setBlurredBlob(null);
                    }}
                    className="text-slate hover:text-alert text-[11px]"
                  >
                    Remove & choose another photo
                  </button>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    ✓ Privacy filters active
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Geolocation */}
          <div className="card-frame p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">
                2. Geolocation Coordinates
              </label>
              <button
                type="button"
                onClick={handleAutoGps}
                disabled={gettingGps}
                className="flex items-center gap-1 text-[11px] text-signal font-semibold bg-signal-light hover:bg-signal/20 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                <MapPin className="w-3 h-3" />
                <span>{gettingGps ? 'Locating...' : 'Auto-Detect GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none font-mono text-xs"
                  required
                />
              </div>
            </div>

            {/* Quick Presets for Demo */}
            <div>
              <span className="text-[10px] text-slate block mb-1">Demonstration presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setLat(p.lat);
                      setLng(p.lng);
                      setAddress(p.name);
                      setCategory(p.cat);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-paper hover:bg-slate-200 text-slate-700 transition-colors border border-hairline"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Category */}
          <div className="card-frame p-4 space-y-3">
            <label className="block text-xs font-semibold text-ink">
              3. Suspected Pollution Source
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'garbage_burning', label: 'Open Garbage / Plastic Fire' },
                { id: 'industrial_plume', label: 'Fugitive Factory Stack Plume' },
                { id: 'road_dust', label: 'Unpaved Silt / Heavy Resuspension' },
                { id: 'construction', label: 'Demolition / Uncovered Sand Aggregate' },
                { id: 'biomass', label: 'Stubble / Crop Residue Burning' },
                { id: 'other', label: 'Other Hazardous Emission' },
              ].map((c) => (
                <label
                  key={c.id}
                  className={`p-2.5 rounded-button border cursor-pointer flex items-center gap-2 transition-all ${
                    category === c.id
                      ? 'border-signal bg-signal-light text-ink font-semibold'
                      : 'border-hairline bg-white hover:bg-paper text-slate'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={c.id}
                    checked={category === c.id}
                    onChange={() => setCategory(c.id as ReportCategory)}
                    className="accent-signal"
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Description Note */}
          <div className="card-frame p-4 space-y-2">
            <label className="block text-xs font-semibold text-ink">
              4. Additional Details / Location Landmarks
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Thick dark plume observed near perimeter wall between 22:00 and 02:00 IST."
              className="w-full text-xs p-2 rounded border border-hairline bg-paper/50 focus:bg-white focus:ring-1 focus:ring-signal outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || (!photoFile && !blurredBlob)}
            className="w-full py-3 px-4 rounded-button bg-signal hover:bg-signal-hover text-white text-xs font-semibold shadow-subtle hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Running AI Verification & Submitting...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Submit Geotagged Report for Action</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
