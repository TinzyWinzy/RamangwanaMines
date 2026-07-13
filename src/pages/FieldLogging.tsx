import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';

interface FieldLog {
  id: string;
  projectId: string;
  date: string;
  shift: 'day' | 'night';
  depthMeters: number;
  rockType: string;
  waterIngress: 'none' | 'minor' | 'moderate' | 'heavy';
  notes: string;
  loggedBy: string;
  synced: boolean;
  createdAt: string;
}

const DB_NAME = 'ramangwana-field-logs';
const STORE_NAME = 'logs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveLogOffline(log: FieldLog): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(log);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getOfflineLogs(): Promise<FieldLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function markSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const log = getReq.result;
      if (log) {
        log.synced = true;
        store.put(log);
      }
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

const ROCK_TYPES = [
  { value: 'hard', label: 'Hard Rock (Granite/Basalt)' },
  { value: 'medium', label: 'Medium Rock (Limestone/Sandstone)' },
  { value: 'soft', label: 'Soft Rock (Shale/Tuff)' },
  { value: 'mixed', label: 'Mixed / Transition Zone' },
];

const PROJECT_OPTIONS = [
  { value: 'proj-1', label: 'Shaft Rehabilitation — Mazowe Mine' },
  { value: 'proj-2', label: 'Borehole Drilling — Farm 47' },
  { value: 'proj-3', label: 'Headgear Fabrication — Trojan Mine' },
];

export default function FieldLogging() {
  const [logs, setLogs] = useState<FieldLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [projectId, setProjectId] = useState('proj-1');
  const [depth, setDepth] = useState('');
  const [rockType, setRockType] = useState('medium');
  const [waterIngress, setWaterIngress] = useState<'none' | 'minor' | 'moderate' | 'heavy'>('none');
  const [notes, setNotes] = useState('');
  const [loggedBy, setLoggedBy] = useState('');

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const loadLogs = useCallback(async () => {
    const stored = await getOfflineLogs();
    setLogs(stored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const syncLogs = async () => {
    setSyncing(true);
    const unsynced = logs.filter((l) => !l.synced);
    let syncedCount = 0;
    for (const log of unsynced) {
      try {
        await markSynced(log.id);
        syncedCount++;
      } catch {
        console.warn('Failed to sync log:', log.id);
      }
    }
    await loadLogs();
    setSyncing(false);
    if (syncedCount > 0) toast.success(`${syncedCount} log${syncedCount > 1 ? 's' : ''} synced`);
    else toast('All logs up to date', { icon: '✓' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depth || !loggedBy) {
      toast.error('Depth and logger name are required');
      return;
    }
    const log: FieldLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      date: new Date().toISOString(),
      shift: 'day',
      depthMeters: parseFloat(depth),
      rockType,
      waterIngress,
      notes,
      loggedBy,
      synced: false,
      createdAt: new Date().toISOString(),
    };
    await saveLogOffline(log);
    toast.success('Log saved offline');
    setDepth('');
    setNotes('');
    await loadLogs();

    if (navigator.onLine) {
      syncLogs();
    }
  };

  const unsyncedCount = logs.filter((l) => !l.synced).length;

  return (
    <div className="py-8 md:py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Logging</h1>
            <p className="text-gray-500 text-sm mt-1">Offline-first geological data collection</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${online ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              {online ? 'Online' : 'Offline'}
            </span>
            {unsyncedCount > 0 && (
              <Button variant="outline" size="sm" onClick={syncLogs} isLoading={syncing}>
                Sync ({unsyncedCount})
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">New Log Entry</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <Select label="Project" options={PROJECT_OPTIONS} value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                <Input label="Depth (meters) *" type="number" step="0.1" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 12.5" />
                <Select label="Rock Type" options={ROCK_TYPES} value={rockType} onChange={(e) => setRockType(e.target.value)} />
                <Select label="Water Ingress" options={[
                  { value: 'none', label: 'None — Dry' },
                  { value: 'minor', label: 'Minor — Damp' },
                  { value: 'moderate', label: 'Moderate — Seeping' },
                  { value: 'heavy', label: 'Heavy — Flowing' },
                ]} value={waterIngress} onChange={(e) => setWaterIngress(e.target.value as any)} />
                <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations, rock condition, issues..." rows={3} />
                <Input label="Logged By *" value={loggedBy} onChange={(e) => setLoggedBy(e.target.value)} placeholder="Your name" />
                <Button type="submit" variant="primary" className="w-full">Save Log Entry</Button>
              </form>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Logs</h2>
                <span className="text-xs text-gray-400">{logs.length} entries</span>
              </div>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No field logs yet</p>
                  <p className="text-xs mt-1">Logs are stored offline and sync automatically</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{log.depthMeters}m — {log.rockType}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.synced ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {log.synced ? 'Synced' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>💧 {log.waterIngress}</span>
                        <span>👤 {log.loggedBy}</span>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      {log.notes && <p className="text-xs text-gray-600 mt-1">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
