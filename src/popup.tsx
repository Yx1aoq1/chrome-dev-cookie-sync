import React, { useEffect, useState } from "react"

import "antd/dist/reset.css"

import { Card, Divider, Form, Input, Space, Switch, Typography } from "antd"

import { useStorage } from "@plasmohq/storage/hook"

import type { DevCookieSyncConfig } from "./type"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const parseMappingText = (text: string) => {
  if (!text) return []
  return text.split("\n").map((line) => {
    const [source, target] = line.split(" ")
    return { source, target }
  })
}

const formatMappingText = (domains: DevCookieSyncConfig["domains"]) => {
  return domains
    .map((domain) => {
      if (!domain.source || !domain.target) return ""
      return `${domain.source} ${domain.target}`
    })
    .join("\n")
}

function Popup() {
  const [configs, setConfigs] = useStorage<DevCookieSyncConfig>(
    "devCookieSyncConfig",
    {
      enable: false,
      domains: []
    }
  )

  const [mappingText, setMappingText] = useState<string>("")

  useEffect(() => {
    if (!mappingText) {
      setMappingText(formatMappingText(configs.domains))
    }
  }, [configs.domains])

  return (
    <div style={{ width: 360, padding: 12 }}>
      <Card size="small">
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            Cookie 同步
          </Title>
          <Text type="secondary">将目标域名的 Cookie 同步到本地指定地址</Text>

          <Divider style={{ margin: "8px 0" }} />

          <Space
            align="center"
            style={{ justifyContent: "space-between", width: "100%" }}>
            <Text strong>启用同步</Text>
            <Switch
              checked={configs.enable}
              onChange={(checked) => {
                setConfigs({
                  ...configs,
                  enable: checked
                })
              }}
            />
          </Space>

          <Form layout="vertical" style={{ marginTop: 8 }}>
            <Form.Item
              label={<Text strong>同步规则</Text>}
              extra={
                <Text type="secondary">
                  每行一个映射：目标地址 和 本地地址（含端口）以空格分隔
                </Text>
              }>
              <TextArea
                autoSize={{ minRows: 6, maxRows: 12 }}
                placeholder={"http://example.com http://localhost:3000"}
                value={mappingText}
                onChange={(e) => {
                  const value = e.target.value
                  setMappingText(value)
                  setConfigs({
                    ...configs,
                    domains: parseMappingText(value)
                  })
                }}
              />
            </Form.Item>
          </Form>

          <Paragraph style={{ marginTop: -8 }} type="secondary">
            例如：
            <br />
            http://example.com http://localhost:3000
            <br />
            https://foo.bar https://localhost:5173
          </Paragraph>
        </Space>
      </Card>
    </div>
  )
}

export default Popup
