/**
 * IndexedDB Service using Dexie
 * Local-first data storage for offline operation
 */

import Dexie, { Table } from 'dexie';
import type { Invoice, Product, Order, Payment, AttendanceRecord, User, Device, SyncOperation } from '@bharatmesh/shared';

export class BharatMeshDB extends Dexie {
  invoices!: Table<Invoice, string>;
  products!: Table<Product, string>;
  orders!: Table<Order, string>;
  payments!: Table<Payment, string>;
  attendance!: Table<AttendanceRecord, string>;
  users!: Table<User, string>;
  devices!: Table<Device, string>;
  syncQueue!: Table<SyncOperation, string>;

  constructor() {
    super('BharatMeshDB');
    
    this.version(1).stores({
      invoices: 'id, deviceId, userId, ts, sync, tender, [customer.phone]',
      products: 'id, name, category, *barcodes, stock, isActive',
      orders: 'id, ts, channel, status, [customer.phone]',
      payments: 'id, invoiceId, ts, match, mode',
      attendance: 'id, employeeId, date, status',
      users: 'id, phone, role, isActive',
      devices: 'id, ownerId, role, isActive, lastSeen',
      syncQueue: 'id, priority, ts, status'
    });
  }
}

export const db = new BharatMeshDB();

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('✅ IndexedDB initialized successfully');
  } catch (error) {
    console.error('❌ IndexedDB initialization failed:', error);
    throw error;
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
  });
  console.log('🗑️ All local data cleared');
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<number> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return 0;
  }
  const estimate = await navigator.storage.estimate();
  return estimate.usage || 0;
}

/**
 * Export database to JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  const data: Record<string, any[]> = {};
  
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import database from JSON (restore from backup)
 */
export async function importDatabase(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  
  await db.transaction('rw', db.tables, async () => {
    for (const tableName in data) {
      const table = (db as any)[tableName];
      if (table) {
        await table.bulkPut(data[tableName]);
      }
    }
  });
  
  console.log('✅ Database imported successfully');
}

