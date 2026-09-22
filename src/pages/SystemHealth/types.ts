export interface DiskMetrics {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usedPercent: number;
  totalFormatted: string;
  freeFormatted: string;
  usedFormatted: string;
  warningThreshold: number;
  criticalThreshold: number;
  isWarning: boolean;
  isCritical: boolean;
  mountPath: string;
}

export interface MemoryMetrics {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usedPercent: number;
  totalFormatted: string;
  freeFormatted: string;
  usedFormatted: string;
  warningThreshold: number;
  criticalThreshold: number;
  isWarning: boolean;
  isCritical: boolean;
  process?: {
    rssFormatted: string;
    heapTotalFormatted: string;
    heapUsedFormatted: string;
    externalFormatted: string;
  };
}

export interface CpuMetrics {
  model: string;
  cores: number;
  loadAvg1m: number;
  loadAvg5m: number;
  loadAvg15m: number;
  usedPercent: number;
}

export interface DatabaseMetrics {
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  sizeBytes: number | null;
  sizeFormatted: string;
  pool: {
    total: number;
    idle: number;
    using: number;
    max: number;
  };
  error?: string | null;
}

export interface MqttMetrics {
  connected: boolean;
  status: "connected" | "reconnecting" | "offline" | "error";
  brokerUrl: string | null;
  reconnectAttempts: number;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  lastError: string | null;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  nodeVersion: string;
  nodeEnv: string;
  pid: number;
  uptimeSeconds: number;
  uptimeFormatted: string;
  processUptimeSeconds: number;
  processUptimeFormatted: string;
}

export interface SystemHealthData {
  status: "healthy" | "warning" | "critical";
  timestamp: string;
  disk: DiskMetrics;
  memory: MemoryMetrics;
  cpu: CpuMetrics;
  database: DatabaseMetrics;
  mqtt: MqttMetrics;
  system: SystemInfo;
}

export interface SystemAlert {
  alert_id: string;
  category: "DISK" | "DATABASE" | "MEMORY" | "MQTT" | "STORAGE" | "API_ERROR" | "RUNTIME" | "SYSTEM";
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" | "FATAL" | "RECOVERY";
  title: string;
  message: string;
  stack_trace?: string | null;
  metadata?: Record<string, any> | null;
  fingerprint?: string | null;
  occurrences: number;
  is_resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthSnapshot {
  snapshot_id: string;
  cpu_percent: number;
  memory_used_bytes: number;
  memory_total_bytes: number;
  memory_percent: number;
  disk_used_bytes: number;
  disk_total_bytes: number;
  disk_percent: number;
  db_status: string;
  db_latency_ms: number;
  db_size_bytes?: number | null;
  mqtt_status: string;
  active_devices_count: number;
  created_at: string;
}

export interface SeverityCounts {
  FATAL: number;
  CRITICAL: number;
  ERROR: number;
  WARNING: number;
  INFO: number;
  UNRESOLVED_TOTAL: number;
}

export interface LogFileInfo {
  name: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  lastModified: string | null;
  createdAt: string | null;
  isWritable: boolean;
  empty?: boolean;
}

export interface LogLineEntry {
  id: number;
  timestamp: string | null;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG" | "HTTP" | string;
  message: string;
  stack?: string | null;
  meta?: Record<string, any>;
  raw: string;
}

export interface LogFileContentResponse {
  file: string;
  totalLinesInFile: number;
  matchedLines: number;
  returnedCount: number;
  lines: LogLineEntry[];
  stats: {
    sizeBytes: number;
    sizeFormatted: string;
    lastModified: string | null;
  };
}

export interface LogFilterOptions {
  file: string;
  lines: number;
  level: string;
  search: string;
  reverse: boolean;
}

export interface PartitionTableInfo {
  tableName: string;
  category: string;
  prefix: string;
  isProtected: boolean;
  canClear: boolean;
  protectionReason?: string | null;
  badgeVariant: string;
  iconType: string;
  partitionDate: string;
  year: number | null;
  month: number | null;
  formattedDate: string;
  isCurrentMonth: boolean;
  isFutureMonth: boolean;
  isPastMonth: boolean;
  rowCount: number;
  sizeBytes: number;
  indexSizeBytes: number;
  sizeFormatted: string;
  sizeMB: string;
  indexSizeMB: string;
}

export interface PartitionGroupSummary {
  partitionCount: number;
  rowCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  sizeMB: string;
  isProtected?: boolean;
}

export interface PartitionSummary {
  totalPartitions: number;
  totalRows: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  clearableSizeBytes: number;
  clearableSizeFormatted: string;
  clearableRows: number;
  telemetry: PartitionGroupSummary;
  events: PartitionGroupSummary;
  proofOfPlay: PartitionGroupSummary;
}

export interface PartitionListResponse {
  partitions: PartitionTableInfo[];
  summary: PartitionSummary;
}

