/**
 * Sync Types - P2P Mesh, Conflicts, Priority Lanes
 */
export type SyncPriority = 'critical' | 'high' | 'medium' | 'low';
export interface SyncOperation {
    id: string;
    collection: string;
    operation: 'create' | 'update' | 'delete';
    documentId: string;
    data: any;
    priority: SyncPriority;
    deviceId: string;
    userId: string;
    ts: number;
    vectorClock: Record<string, number>;
    checksum: string;
    retries: number;
    status: 'queued' | 'syncing' | 'synced' | 'failed' | 'conflict';
    error?: string;
}
export interface ConflictResolution {
    id: string;
    operationIds: string[];
    collection: string;
    documentId: string;
    strategies: ConflictStrategy[];
    resolution?: 'lww' | 'manual' | 'merge' | 'discard';
    resolvedBy?: string;
    resolvedAt?: number;
    notes?: string;
}
export type ConflictStrategy = 'last_write_wins' | 'first_write_wins' | 'manual_review' | 'additive_merge' | 'field_level_merge';
export interface SyncConfig {
    enabledModules: string[];
    priorityLanes: Record<string, SyncPriority>;
    batchSize: number;
    retryAttempts: number;
    retryBackoffMs: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
}
export interface PeerInfo {
    deviceId: string;
    name: string;
    role: 'primary' | 'secondary';
    capabilities: string[];
    lastSeen: number;
    connectionType: 'webrtc' | 'socket' | 'bluetooth';
    latencyMs?: number;
    status: 'online' | 'offline' | 'syncing';
}
export interface MeshTopology {
    primary: string;
    peers: PeerInfo[];
    discoveredAt: number;
    lastUpdated: number;
}
export interface SyncStats {
    pendingOps: number;
    syncedOps: number;
    failedOps: number;
    conflictOps: number;
    lastSyncAt?: number;
    avgLatencyMs: number;
    bytesUp: number;
    bytesDown: number;
}
//# sourceMappingURL=sync.d.ts.map