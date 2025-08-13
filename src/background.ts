import { Storage } from "@plasmohq/storage"

import type { DevCookieSyncConfig } from "./type"

const storage = new Storage()

const syncCookie = (cookies: chrome.cookies.Cookie, target: string) => {
  chrome.cookies.set({
    url: target,
    name: cookies.name,
    value: cookies.value,
    path: cookies.path,
    secure: cookies.secure,
    httpOnly: cookies.httpOnly,
    sameSite: cookies.sameSite,
    expirationDate: cookies.expirationDate
  })
}

// 监听线上 Cookie 变化
chrome.cookies.onChanged.addListener(async (change) => {
  // 获取配置
  const config = await storage.get<DevCookieSyncConfig>("devCookieSyncConfig")

  if (!change.cookie || !config.enable) return

  config.domains.map(({ source, target }) => {
    const sourceDomain = source.replace(/^https?:\/\//, "")

    if (change.cookie.domain === sourceDomain) {
      syncCookie(change.cookie, target)
    }
  })
})
