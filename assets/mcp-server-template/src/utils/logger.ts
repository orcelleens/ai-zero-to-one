type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL];
}

function formatEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export function createLogger(name: string) {
  const prefix = `[${name}]`;

  return {
    debug: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog("debug")) {
        console.error(formatEntry({ level: "debug", message: `${prefix} ${message}`, context, timestamp: new Date().toISOString() }));
      }
    },
    info: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog("info")) {
        console.error(formatEntry({ level: "info", message: `${prefix} ${message}`, context, timestamp: new Date().toISOString() }));
      }
    },
    warn: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog("warn")) {
        console.error(formatEntry({ level: "warn", message: `${prefix} ${message}`, context, timestamp: new Date().toISOString() }));
      }
    },
    error: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog("error")) {
        console.error(formatEntry({ level: "error", message: `${prefix} ${message}`, context, timestamp: new Date().toISOString() }));
      }
    },
  };
}

export class MCPError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly recoverable: boolean = true,
    public readonly suggestion?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "MCPError";
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      recoverable: this.recoverable,
      suggestion: this.suggestion,
    };
  }
}