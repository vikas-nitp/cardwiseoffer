/**
 * Simple Logger Utility
 * 
 * Provides structured logging with log levels.
 * In production, only warnings and errors are logged.
 */

const isDev = import.meta.env.DEV;

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_STYLES: Record<LogLevel, string> = {
  debug: "color: #888",
  info: "color: #2196F3",
  warn: "color: #FF9800",
  error: "color: #F44336; font-weight: bold",
};

const shouldLog = (level: LogLevel): boolean => {
  if (isDev) return true;
  return level === "warn" || level === "error";
};

const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

export const log = {
  debug: (message: string, data?: unknown) => {
    if (!shouldLog("debug")) return;
    console.log(`%c${formatMessage("debug", message)}`, LOG_STYLES.debug, data ?? "");
  },

  info: (message: string, data?: unknown) => {
    if (!shouldLog("info")) return;
    console.info(`%c${formatMessage("info", message)}`, LOG_STYLES.info, data ?? "");
  },

  warn: (message: string, data?: unknown) => {
    if (!shouldLog("warn")) return;
    console.warn(`%c${formatMessage("warn", message)}`, LOG_STYLES.warn, data ?? "");
  },

  error: (message: string, data?: unknown) => {
    if (!shouldLog("error")) return;
    console.error(`%c${formatMessage("error", message)}`, LOG_STYLES.error, data ?? "");
  },
};

export default log;
