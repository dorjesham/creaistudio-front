/** 站点公网根地址（无尾斜杠）。优先 .env 的 VITE_PUBLIC_APP_URL，否则用当前访问 origin。 */
export function getPublicAppUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
}
