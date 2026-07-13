import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';

interface ShaftReading {
  id: string;
  projectId: string;
  date: string;
  waterLevelMeters: number;
  shaftDepth: number;
  structuralScore: number;
  notes: string;
  loggedBy: string;
}

interface Alert {
  id: string;
  project: string;
  type: 'water' | 'structural' | 'weather';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

// Keep alerts in localStorage so they survive refresh
const ALERTS_KEY = 'ramangwana-rain-alerts';

function loadAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: Alert[]) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

const SHAFT_LOCATIONS = [
  { value: 'proj-1', label: 'Shaft Rehabilitation — Mazowe Mine', depth: 85 },
  { value: 'proj-3', label: 'Headgear Footing — Trojan Mine', depth: 45 },
];

export default function RainTracker() {
  const [readings, setReadings] = useState<ShaftReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>(loadAlerts);
  const [projectId, setProjectId] = useState('proj-1');
  const [waterLevel, setWaterLevel] = useState('');
  const [structuralScore, setStructuralScore] = useState('95');
  const [notes, setNotes] = useState('');
  const [loggedBy, setLoggedBy] = useState('');

  const shaftDepth = SHAFT_LOCATIONS.find((s) => s.value === projectId)?.depth || 80;

  // Subscribe to Firestore readings for the selected project
  useEffect(() => {
    const q = query(
      collection(db, 'projects', projectId, 'dailyLogs'),
      orderBy('date', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: ShaftReading[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          projectId,
          date: data.date?.toDate?.()?.toISOString() || data.date || new Date().toISOString(),
          waterLevelMeters: data.waterLevelMeters ?? data.depthMeters ?? 0,
          shaftDepth: data.shaftDepth ?? 80,
          structuralScore: data.structuralScore ?? 95,
          notes: data.notes || '',
          loggedBy: data.loggedBy || '',
        });
      });
      setReadings(items);
    });
    return () => unsub();
  }, [projectId]);

  // Persist alerts to localStorage
  useEffect(() => { saveAlerts(alerts); }, [alerts]);

  const handleLogReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterLevel || !loggedBy) {
      toast.error('Water level and your name are required');
      return;
    }
    const wl = parseFloat(waterLevel);
    const ss = parseInt(structuralScore);
    const reading: ShaftReading = {
      id: '',
      projectId,
      date: new Date().toISOString(),
      waterLevelMeters: wl,
      shaftDepth,
      structuralScore: ss,
      notes,
      loggedBy,
    };

    // Save to Firestore
    try {
      await addDoc(collection(db, 'projects', projectId, 'dailyLogs'), {
        waterLevelMeters: wl,
        shaftDepth,
        structuralScore: ss,
        notes,
        loggedBy,
        date: serverTimestamp(),
        synced: true,
      });
      toast.success('Reading saved to cloud');
    } catch (err) {
      toast.error('Failed to save reading');
      console.warn(err);
    }

    // Generate alerts client-side
    const newAlerts: Alert[] = [];
    const dangerThreshold = shaftDepth * 0.6;
    if (wl >= dangerThreshold) {
      newAlerts.push({
        id: `alert-${Date.now()}`,
        project: SHAFT_LOCATIONS.find((s) => s.value === projectId)?.label || '',
        type: 'water',
        message: `Water level at ${wl}m (${Math.round((wl / shaftDepth) * 100)}% of shaft depth) — threshold exceeded!`,
        severity: wl >= shaftDepth * 0.8 ? 'critical' : 'high',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (ss < 60) {
      newAlerts.push({
        id: `alert-str-${Date.now()}`,
        project: SHAFT_LOCATIONS.find((s) => s.value === projectId)?.label || '',
        type: 'structural',
        message: `Structural integrity score at ${ss}% — requires immediate inspection!`,
        severity: ss < 40 ? 'critical' : 'high',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);
      newAlerts.forEach((a) => toast.error(a.message, { duration: 6000 }));
    }

    setWaterLevel('');
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const currentReading = readings[0];
  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;

  useEffect(() => {
    if (criticalCount > 0 && Notification.permission === 'granted') {
      new Notification('⚠️ Ramangwana Risk Alert', {
        body: `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} — check Rainy-Season Tracker`,
        icon: '/logo.jpg',
      });
    }
  }, [criticalCount]);

  const requestNotif = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const waterPct = currentReading ? Math.round((currentReading.waterLevelMeters / currentReading.shaftDepth) * 100) : 0;
  const statusColor = waterPct >= 60 ? 'text-red-500' : waterPct >= 35 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="py-8 md:py-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rainy-Season Risk Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor shaft water levels and structural integrity in real time</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={requestNotif}>
              🔔 Enable Alerts
            </Button>
            <Link to="/lead-form">
              <Button variant="primary" size="sm">Report Issue</Button>
            </Link>
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Active Alerts ({activeAlerts.length})
            </h3>
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-xl px-4 py-3 text-sm flex items-start justify-between gap-4 ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                alert.severity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <div>
                  <span className="font-semibold">{alert.type === 'water' ? '💧' : alert.type === 'structural' ? '🏗️' : '🌧️'} {alert.project}</span>
                  <p className="text-xs mt-0.5">{alert.message}</p>
                  <span className="text-xs opacity-60">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => acknowledgeAlert(alert.id)}>Dismiss</Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">Current Water Level</p>
            <p className={`text-3xl font-bold mt-1 ${statusColor}`}>
              {currentReading ? `${currentReading.waterLevelMeters}m` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              of {shaftDepth}m shaft depth ({waterPct}%)
            </p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">Structural Score</p>
            <p className={`text-3xl font-bold mt-1 ${(currentReading?.structuralScore ?? 95) < 60 ? 'text-red-500' : (currentReading?.structuralScore ?? 95) < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
              {currentReading ? `${currentReading.structuralScore}%` : '95%'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Last inspection grade</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">Risk Status</p>
            <p className={`text-xl font-bold mt-1 ${waterPct >= 60 ? 'text-red-500' : waterPct >= 35 ? 'text-yellow-500' : 'text-green-500'}`}>
              {waterPct >= 60 ? '⚠️ Critical' : waterPct >= 35 ? '⚡ Elevated' : '✅ Normal'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Based on latest reading</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Reading</h2>
              <form onSubmit={handleLogReading} className="space-y-4">
                <Select label="Location" options={SHAFT_LOCATIONS} value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                <Input label="Water Level (meters) *" type="number" step="0.1" value={waterLevel} onChange={(e) => setWaterLevel(e.target.value)} placeholder={`0 — ${shaftDepth}m`} />
                <Input label="Structural Integrity Score (%)" type="number" min="0" max="100" value={structuralScore} onChange={(e) => setStructuralScore(e.target.value)} />
                <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cracks, seepage, loose rock, etc." rows={2} />
                <Input label="Logged By *" value={loggedBy} onChange={(e) => setLoggedBy(e.target.value)} placeholder="Your name" />
                <Button type="submit" variant="primary" className="w-full">Log Reading</Button>
              </form>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reading History</h2>
              {readings.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <div className="text-4xl mb-2">📏</div>
                  <p>No readings logged yet</p>
                  <p className="text-xs mt-1">Log your first shaft reading to start monitoring</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {readings.map((r) => {
                    const pct = Math.round((r.waterLevelMeters / r.shaftDepth) * 100);
                    return (
                      <div key={r.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{r.waterLevelMeters}m / {r.shaftDepth}m</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${pct >= 60 ? 'bg-red-50 text-red-600' : pct >= 35 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                            {pct}% full
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>🏗️ Score: {r.structuralScore}%</span>
                          <span>👤 {r.loggedBy}</span>
                          <span>{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {r.notes && <p className="text-xs text-gray-600 mt-1">{r.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-semibold">🛡️ Ramangwana Shaft Support</p>
              <p className="text-xs mt-1">If water levels exceed 60% or structural scores drop below 60%, schedule a civil works inspection immediately. Ramangwana provides shuttering, steel reinforcement, and weatherproofing to keep your operation running through the rainy season.</p>
              <Link to="/lead-form" className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline">Schedule Inspection →</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
