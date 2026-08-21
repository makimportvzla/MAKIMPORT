import { supabase } from './supabase';

export interface QueueItem {
  id: string;
  type: 'bid' | 'postulacion' | 'cotizacion' | 'custom_request' | 'purchase_request' | 'owner_machinery';
  table: string;
  payload: any;
  createdAt: number;
}

const QUEUE_KEY = 'makimport_offline_queue';

/**
 * Retrieves the list of queued items from LocalStorage.
 */
export function getOfflineQueue(): QueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline queue:', err);
    return [];
  }
}

/**
 * Overwrites the LocalStorage offline queue.
 */
export function saveOfflineQueue(queue: QueueItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Error saving offline queue:', err);
  }
}

/**
 * Appends a new action payload to the offline queue.
 */
export function addToOfflineQueue(
  type: QueueItem['type'],
  table: string,
  payload: any
): string {
  const queue = getOfflineQueue();
  const id = Math.random().toString(36).substring(2, 9) + Date.now();
  const newItem: QueueItem = {
    id,
    type,
    table,
    payload,
    createdAt: Date.now()
  };
  queue.push(newItem);
  saveOfflineQueue(queue);
  console.log(`[OfflineQueue] Enqueued action of type "${type}" to table "${table}"`);
  return id;
}

/**
 * Attempts to sync all queued items to Supabase.
 * Should be called when the device recovers network connection.
 */
export async function syncOfflineQueue(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!navigator.onLine) return;

  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  console.log(`[OfflineQueue] Starting synchronization of ${queue.length} items...`);
  const remaining: QueueItem[] = [];
  let syncSuccessCount = 0;

  for (const item of queue) {
    try {
      const { error } = await supabase.from(item.table).insert(item.payload);
      if (error) {
        console.error(`[OfflineQueue] Failed to sync item ${item.id} to table "${item.table}":`, error);
        
        // If it's a database constraint/data validation error (e.g. Postgres class 22/23),
        // we discard the item so the queue doesn't get blocked indefinitely.
        if (error.code && (error.code.startsWith('22') || error.code.startsWith('23') || error.code === '23505')) {
          console.warn(`[OfflineQueue] Discarding invalid/duplicate item ${item.id} due to DB constraint: ${error.message}`);
        } else {
          remaining.push(item);
        }
      } else {
        console.log(`[OfflineQueue] Item ${item.id} synced successfully to table "${item.table}"`);
        syncSuccessCount++;
      }
    } catch (err) {
      console.error(`[OfflineQueue] Exception syncing item ${item.id}:`, err);
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);

  if (syncSuccessCount > 0) {
    window.dispatchEvent(
      new CustomEvent('offline_queue_synced', {
        detail: { syncedCount: syncSuccessCount }
      })
    );
  }
}
