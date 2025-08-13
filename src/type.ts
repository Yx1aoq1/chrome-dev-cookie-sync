export type DevCookieSyncConfig = {
  enable: boolean
  domains: {
    source: string
    target: string
  }[]
}
