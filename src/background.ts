import { Storage } from "@plasmohq/storage"

import type { DevCookieSyncConfig } from "./type"

const storage = new Storage()

const PROTOCOL_REG = /(^\w+:|^)\/\//
const DOMAIN_REG = /^(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/ //extra domain
const SECOND_LEVEL_DOMAIN_REG = /.[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/ //extra 2nd levels domains

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

function removeProtocol(url: string) {
  return url.replace(PROTOCOL_REG, "")
}

function getDomain(url: string) {
  // 去掉协议
  const urlWithoutProtocol = removeProtocol(url)
  // 获取域名
  const domain = urlWithoutProtocol.match(DOMAIN_REG)?.[0]
  // 获取二级域名
  const secondLevelDomain = domain.match(SECOND_LEVEL_DOMAIN_REG)?.[0]

  if (!secondLevelDomain || secondLevelDomain === domain) {
    return [domain]
  }

  return [domain, secondLevelDomain]
}

const init = async () => {
  // 监听线上 Cookie 变化
  chrome.cookies.onChanged.addListener(async (change) => {
    // 获取配置
    const config = await storage.get<DevCookieSyncConfig>("devCookieSyncConfig")

    if (!change.cookie || !config?.enable) return

    config?.domains.map(({ source, target }) => {
      if (getDomain(source).some((domain) => change.cookie.domain === domain)) {
        syncCookie(change.cookie, target)
      }
    })
  })
}

init()
