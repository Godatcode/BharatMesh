/**
 * P2P Sync Service - WebSocket & WebRTC based synchronization
 */

import { io, Socket } from 'socket.io-client';
import { db } from './db';
import type { SyncOperation } from '@bharatmesh/shared';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:5001';

class SyncService {
  private socket: Socket | null = null;
  private deviceId: string | null = null;
  private userId: string | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(deviceId: string, userId: string): Promise<void> {
    this.deviceId = deviceId;
    this.userId = userId;

    // Connect to Socket.io
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    this.socket.on('connect', () => {
      this.registerDevice();
    });

    this.socket.on('disconnect', () => {
    });

    this.socket.on('sync:operation', this.handleIncomingOperation.bind(this));
    this.socket.on('sync:conflict', this.handleConflict.bind(this));
    this.socket.on('peer:discovered', this.handlePeerDiscovered.bind(this));

    // Start periodic sync
    this.startPeriodicSync();
  }

  private registerDevice(): void {
    if (this.socket && this.deviceId && this.userId) {
      this.socket.emit('device:register', {
        deviceId: this.deviceId,
        userId: this.userId
      });
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
    }, 30000);
  }

  async processSyncQueue(): Promise<void> {
    try {
      const queuedOps = await db.syncQueue
        .where('status')
        .equals('queued')
        .sortBy('ts');

      for (const op of queuedOps) {
        await this.sendOperation(op.operation);
        
        // Mark as synced
        await db.syncQueue.update(op.id, { status: 'synced' });
      }

      if (queuedOps.length > 0) {
      }
    } catch (error) {
    }
  }

  async queueOperation(operation: SyncOperation): Promise<void> {
    await db.syncQueue.add({
      id: operation.id,
      operation,
      priority: operation.priority,
      ts: Date.now(),
      status: 'queued'
    } as any);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  private sendOperation(operation: SyncOperation): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('sync:operation', {
        ...operation,
        userId: this.userId,
        deviceId: this.deviceId
      });
    }
  }

  private async handleIncomingOperation(data: SyncOperation): Promise<void> {

    try {
      const table = (db as any)[data.collection];
      if (!table) {
        return;
      }

      switch (data.operation) {
        case 'create':
          await table.add(data.data);
          break;
        case 'update':
          await table.update(data.documentId, data.data);
          break;
        case 'delete':
          await table.delete(data.documentId);
          break;
      }

    } catch (error) {
      // TODO: Queue for conflict resolution
    }
  }

  private handleConflict(data: any): void {
    // TODO: Implement conflict resolution UI
  }

  private handlePeerDiscovered(data: any): void {
    // TODO: Establish WebRTC connection for direct P2P sync
  }

  disconnect(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const syncService = new SyncService();

export async function initializeSync(): Promise<void> {
  // Get current device and user info
  const deviceId = localStorage.getItem('deviceId') || 'web-' + Math.random().toString(36).substr(2, 9);
  const userId = localStorage.getItem('userId');

  if (!userId) {
    return;
  }

  // Store device ID for future use
  localStorage.setItem('deviceId', deviceId);

  await syncService.initialize(deviceId, userId);
}

