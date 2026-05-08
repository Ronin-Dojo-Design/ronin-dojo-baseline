const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

export const WEBHOOK_STALE_PROCESSING_MINUTES = 15
export const WEBHOOK_LAUNCH_WINDOW_DAYS = 7

export const getWebhookMonitoringWindows = (now = new Date()) => {
  return {
    now,
    lastHour: new Date(now.getTime() - HOUR_MS),
    last24Hours: new Date(now.getTime() - DAY_MS),
    last7Days: new Date(now.getTime() - WEBHOOK_LAUNCH_WINDOW_DAYS * DAY_MS),
    staleProcessingBefore: new Date(now.getTime() - WEBHOOK_STALE_PROCESSING_MINUTES * MINUTE_MS),
  }
}
