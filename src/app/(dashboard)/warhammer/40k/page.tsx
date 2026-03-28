'use client'

import { Typography, Tabs } from 'antd'

const { Title } = Typography

const W40KIcons = ({ type, size = 48 }: { type: string; size?: number }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'space-marines':
      case '星际战士':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 200 200" width={size} height={size}>
            <path d="M91.24 129.59h.19-.44c.08 0 .16.01.25.01ZM88.03 122.27c.09 0 .19 0 .28-.01-.19 0-.37.01-.56 0 .09 0 .18.01.28.01ZM111.9 122.28a4.405 4.405 0 0 0-.06 0h.06ZM108.76 129.59c.09 0 .17 0 .25-.01h-.44.19ZM194.13 86.54c3.65-4.4 5.87-7.23 5.87-7.23h-77.71v4.91s6.7 0 6.7 7.46c0 3.55-4.54 7.62-9.43 8.44-.26 1.1-.61 2.09-.94 3.02-.54 1.5-1.05 2.92-1.13 4.71v.05c-.02.37-.06 1.09 0 1.41.08.1.22.26.34.39.45.5 1.02 1.15 1.34 2.03.81.33 1.42.8 1.42 1.48v16.9s2.67 2.52 6.62 4.44l-.47-18.13c.43-.09.85-.19 1.26-.31l3.25 19.97c1.43.39 2.94.63 4.5.63s3.42-.41 5.35-1.15l-6.76-22.31c.33-.22.66-.45.97-.68l9.31 21.38c2.98-1.58 6.2-3.77 9.53-6.37l-15.12-18.52c.5-.59.96-1.2 1.4-1.83l16.86 17.81c2.41-2.02 4.86-4.21 7.3-6.51L143.4 101.8c.16-.38.32-.77.47-1.16l24.01 14.72c2.69-2.64 5.36-5.36 7.92-8.08l-30.15-12.55c.11-.47.21-.94.3-1.41l34.15 9.32c3.78-4.14 7.25-8.12 10.2-11.58l-43.53-3.48c.03-.36.06-.72.09-1.06h47.25Z"></path>
            <path d="M115.67 109.98c-.19-.59-.14-1.52-.11-2.22.22-4.67 2.83-6.91 2.44-12.07-.22-2.91-1.67-5.97-3.28-7.94-3-3.67-8.2-6.67-14.72-6.67-9.08 0-17.4 6.25-18 14.72-.44 6.17 3.01 8.05 2.33 14.3-1.18 1.02-2.47 3.17-1.38 5.19 1.72 1.21.98 3.7 2.01 5.19.3.44.95 1.11 1.38 1.38.18.11.37.19.57.26.04.01.09.03.13.04.19.05.4.09.6.11h.11c.18.01.37.01.56 0h.16c.22-.02.43-.05.65-.08.05 0 .1-.02.15-.03.18-.03.35-.07.52-.12.06-.01.11-.03.17-.04a8 8 0 0 0 .58-.17.3.3 0 0 0 .1-.04c.16-.05.31-.1.45-.15.05-.02.11-.04.16-.06.14-.05.27-.1.39-.14-.73 2.38-1.64 5.14-1.48 8.05.18.05.38.08.59.1.08 0 .16 0 .25.01h.44c.17 0 .33 0 .5-.01h.63c.15 0 .3 0 .44.01.08-.84-.19-2.03.42-2.33.53.5-.08 1.49.11 2.33h3.07c.13-.86-.33-2.3.42-2.54.46.49-.08 1.64.11 2.54h2.44c.2-.75.06-1.85.42-2.44.36.59.22 1.68.42 2.44h2.44c.24-.9-.48-2.22.21-2.54.56.39.23 1.68.32 2.54h3.07c.23-.82-.53-2 .21-2.33.42.46.28 1.48.32 2.33.14 0 .29-.01.44-.01h.63c.17 0 .34 0 .5.01h.44c.08 0 .17 0 .25-.01.21-.02.42-.05.59-.1.18-2.97-.81-5.69-1.48-8.16.22.12.47.23.72.34.08.03.16.06.23.09.19.07.38.14.58.2.09.03.17.05.26.08.23.06.45.11.68.15.06 0 .11.02.17.03.28.04.56.07.84.07.2 0 .39 0 .58-.03.04 0 .08-.01.12-.02.16-.02.31-.06.46-.1.05-.02.1-.03.15-.05.18-.06.35-.14.5-.24 2.23-1.43 1.57-4.61 3.39-6.56.32-1.02.59-1.66.42-2.54-.23-1.21-1.54-1.97-1.8-2.75Zm-18.66 4.72c-.08.05-.18.1-.26.16-.22.14-.44.27-.67.4-.12.06-.24.12-.36.19-.21.11-.42.22-.64.32-.14.07-.29.12-.43.18-.21.09-.42.18-.63.26-.16.06-.32.11-.48.16-.21.07-.42.14-.64.21-.17.05-.35.09-.53.13l-.66.15c-.19.03-.38.06-.57.08-.23.03-.45.06-.69.08-.2.02-.4.02-.61.03-.16 0-.31.02-.47.02h-.48c-1.32-1.08-2.08-2.72-2.01-5.19.64-.92 1.81-1.3 2.96-1.69 1.85 1.05 3.8 1.99 6.35 2.33.56.53 1.46.73 1.69 1.59-.28.2-.57.4-.87.59Zm3.63 5.76h-1.17c-.57.84-1.26 1.56-2.12 2.12.27-2.67 1.13-5.28 2.75-6.25 1.49 1.44 2.29 3.57 2.54 6.25-.79-.59-1.6-1.15-2.01-2.12Zm10.48-3.39c-.2 0-.39.01-.59.01-.14 0-.28-.02-.42-.02-.2 0-.4-.02-.59-.03-.23-.02-.46-.05-.69-.08-.19-.03-.37-.05-.55-.09-.22-.04-.44-.1-.66-.15-.17-.04-.35-.08-.52-.13a7.75 7.75 0 0 1-.63-.21c-.16-.05-.32-.11-.48-.17-.21-.08-.41-.17-.61-.26-.15-.06-.29-.12-.44-.19-.21-.1-.41-.2-.61-.3-.13-.06-.26-.13-.39-.19-.22-.12-.43-.24-.65-.36-.1-.06-.2-.11-.3-.17-.31-.18-.61-.36-.9-.54.15-.98 1.13-1.13 1.69-1.69 2.56-.34 4.51-1.28 6.36-2.33 1.15.4 2.33.78 2.96 1.69.07 2.47-.69 4.11-2.01 5.19ZM100.05 79.31h5.88V75.9a7.402 7.402 0 0 0 1.57-4.56h6.27v-3.33H103.1V51.75h1.93v-5.16h-1.43c0-1.93-1.56-3.5-3.49-3.51s0 0-.02 0a3.51 3.51 0 0 0-3.49 3.51h-1.43v5.16h1.93v16.26H86.43v3.33h6.27c0 1.72.59 3.3 1.57 4.56v3.41h5.78ZM105.13 131.5H94.45v.1c.01 24.1 4.53 30.08 5.54 31.12v.19s.04-.03.1-.09c.06.06.1.09.1.09v-.19c1.01-1.04 5.53-7.03 5.54-31.14v-.09h-.61Z"></path>
            <path d="M81.38 103.41c-.36-1-.74-2.07-1.01-3.3-4.86-.84-9.37-4.89-9.37-8.43 0-7.46 6.7-7.46 6.7-7.46v-4.91H0s2.22 2.83 5.87 7.23h47.25c.03.34.06.7.09 1.06L9.68 91.08c2.95 3.47 6.43 7.45 10.2 11.58l34.15-9.32c.09.47.19.94.3 1.41L24.18 107.3c2.57 2.72 5.23 5.44 7.92 8.08l24.01-14.72c.15.39.31.77.47 1.16l-21.19 16.73c2.44 2.3 4.89 4.49 7.3 6.51l16.86-17.81c.44.63.9 1.24 1.4 1.83L45.83 127.6c3.33 2.6 6.55 4.79 9.53 6.37l9.31-21.38c.32.24.64.46.97.68l-6.76 22.31c1.94.74 3.74 1.15 5.35 1.15s3.07-.24 4.5-.63l3.25-19.97c.41.11.83.21 1.26.31l-.47 18.13c3.96-1.93 6.62-4.44 6.62-4.44v-16.9c0-.72.68-1.2 1.56-1.53.33-.93.86-1.78 1.49-2.47.14-2.38-.43-3.98-1.08-5.8Z"></path>
          </svg>
        )
      case 'imperial-forces':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" width={size} height={size}>
            <g fill="currentColor" fillRule="evenodd" clipPath="url(#a)" clipRule="evenodd">
              <path d="M29.23 15.9c6.25.13 12.51.24 18.77.36.01.1-.12.15-.19.2l-1.3 1.08c-.16.12-.4.36-.54.4-.19.05-.53-.01-.82-.03-3.95-.15-8.2-.35-12.05-.51-.05.11.08.24.1.37 4.07.3 8.13.63 12.18.96.03.1-.1.15-.16.2-.51.52-1.1 1.12-1.66 1.61-3.44-.61-6.93-1.2-10.37-1.82-.05.08-.01.24-.02.36 3.2.7 6.47 1.34 9.7 2.02.06.1-.09.16-.14.21-.49.45-1.04.99-1.54 1.43l-8.04-2.66-.1.28c2.36 1.08 4.83 2.04 7.2 3.1.04.1-.1.13-.16.19-.37.33-.72.63-1.16.98-.14.1-.35.34-.5.35-.2 0-.54-.3-.74-.42-1.67-1-3.44-2.14-5.01-3.13-.09.05-.1.18-.19.23 1.4 1.22 2.86 2.42 4.36 3.64.13.1.63.44.63.51 0 .06-.35.3-.42.35-.32.24-.6.4-.95.59-.17.08-.36.25-.54.23-.15-.02-.42-.35-.56-.51-1-1.15-1.93-2.32-2.9-3.52-.12-.17-.25-.53-.53-.38.72 1.16 1.52 2.3 2.26 3.53.24.4.56.79.66 1.28-.72.05-1.5.14-2.27.07-.72-1.35-1.19-2.94-1.81-4.39-.1 0-.15.06-.26.05.33 1.32.83 2.67 1.21 4.01a10.8 10.8 0 0 1-1.84-.89 169.3 169.3 0 0 0-.44-3.07c-.08-.04-.2-.02-.3-.03-.07.8.04 1.62.02 2.45-.01.1-.11-.06-.14-.1a5.87 5.87 0 0 1-1.14-1.11c-.03-.27.04-.55.1-.82.03-.23.17-.56-.1-.67-.23.2-.29.57-.4.88-.11-.28-.47-.56-.49-.95 0-.22.25-.65-.16-.63-.5.02.01.9.12 1.12.39.85.96 1.86 1.51 2.35-.48.33-.94.7-1.59.86-.44-.69-.66-1.53-.95-2.35-.3-.82-.59-1.64-.86-2.45.43-.5.88-1 1.37-1.44.84.45 2 .82 3.1.74 1.1-.07 1.84-.74 1.94-1.86.12-1.4-.96-2-1.96-2.38.04-.27-.01-.63.07-.86"></path>
            </g>
          </svg>
        )
      case 'chaos-forces':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 200 200" width={size} height={size}>
            <path d="m175 103.18-15.09-13.11v5.21h-40.88l15.39-15.43 3.68 3.68 1.42-19.97-19.92 1.43 3.67 3.68-15.39 15.43V43.13h5.2L100 28 86.92 43.13h5.19V84.1L76.72 68.67l3.68-3.68-19.92-1.43 1.42 19.97 3.67-3.68 15.39 15.43H40.09v-5.21L25 103.18l15.09 13.11v-5.21h40.87l-15.39 15.43-3.67-3.68-1.42 19.96 19.92-1.42-3.68-3.68 15.61-15.64v40.82h-5.2L100.21 178l13.08-15.13h-5.19v-40.4l15.18 15.22-3.68 3.68 19.92 1.43-1.42-19.97-3.67 3.68-15.4-15.43h40.88v5.21L175 103.18z"></path>
          </svg>
        )
      case 'xenos-threats':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 49 48" width={size} height={size}>
            <g fill="currentColor">
              <path d="M17.95 14.24 16 12.28c-.9-.9-.5-1.83-.04-2.29l.85-.83-1.23-1.24-3.49 3.46-3.49 3.46 1.23 1.24.84-.84c.46-.46 1.4-.84 2.29.06l2.21 2.23a7.5 7.5 0 0 1 2.77-3.29Zm20.78 17.29-.84.83c-.46.46-1.4.85-2.3-.05l-2.54-2.58.09.13v.17c0 .15 0 1.35-.52 2.31l3.85 3.88 3.49-3.46-1.23-1.23Z"></path>
            </g>
          </svg>
        )
      default:
        return null
    }
  }

  return getIcon(type)
}

const W40KTabLabel = ({ type }: { type: string }) => {
  const iconPaths: Record<string, { icon: string; label: string }> = {
    sisters: { icon: '/assets/W40K/修女会.png', label: '修女会' },
    custodes: { icon: '/assets/W40K/帝皇禁军.png', label: '帝国禁军' },
    mechanicus: { icon: '/assets/W40K/机械修会.png', label: '机械修会' },
    imperialGuard: { icon: '/assets/W40K/帝国卫队.png', label: '帝国卫队' },
    chaosSpaceMarines: { icon: '/assets/W40K/混沌星际战士.png', label: '混沌星际战士' },
    deathGuard: { icon: '/assets/W40K/死亡守卫.png', label: '死亡守卫' },
    thousandSons: { icon: '/assets/W40K/千子.png', label: '千子' },
    worldEaters: { icon: '/assets/W40K/吞世者.png', label: '吞世者' },
    chaosDemons: { icon: '/assets/W40K/混沌恶魔.png', label: '混沌恶魔' },
    spaceMarines: { icon: '/assets/W40K/星际战士.png', label: '星际战士' },
    blackTemplars: { icon: '/assets/W40K/黑色圣堂.png', label: '黑色圣堂' },
    bloodAngels: { icon: '/assets/W40K/圣血天使.png', label: '圣血天使' },
    darkAngels: { icon: '/assets/W40K/暗黑天使.png', label: '暗黑天使' },
    deathwatch: { icon: '/assets/W40K/死亡守望.png', label: '死亡守望' },
    greyKnights: { icon: '/assets/W40K/灰骑士.png', label: '灰骑士' },
    spaceWolves: { icon: '/assets/W40K/太空野狼.png', label: '太空野狼' },
    aeldari: { icon: '/assets/W40K/艾达灵族.png', label: '艾达灵族' },
    darkEldar: { icon: '/assets/W40K/黑暗灵族.png', label: '黑暗灵族' },
    tyranids: { icon: '/assets/W40K/泰伦虫族.png', label: '泰伦虫族' },
    genestealerCults: { icon: '/assets/W40K/基金窃取者教派.png', label: '基因窃取者教派' },
    votann: { icon: '/assets/W40K/沃坦联盟.png', label: '沃坦联盟' },
    necrons: { icon: '/assets/W40K/太空死灵.png', label: '太空死灵' },
    orks: { icon: '/assets/W40K/欧克蛮人.png', label: '欧克蛮人' },
    tau: { icon: '/assets/W40K/钛帝国.png', label: '钛帝国' },
  }

  const data = iconPaths[type]
  if (!data) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <img src={data.icon} alt={data.label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      <span>{data.label}</span>
    </div>
  )
}

export default function W40KPage() {
  const tabItems = [
    {
      key: 'space-marines',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <W40KIcons type="space-marines" />
          <span>星际战士</span>
        </div>
      ),
      children: (
        <Tabs
          tabPosition="left"
          defaultActiveKey="space-marines"
          items={[
            { key: 'space-marines', label: <W40KTabLabel type="spaceMarines" />, children: <p>星际战士内容</p> },
            { key: 'black-templars', label: <W40KTabLabel type="blackTemplars" />, children: <p>黑色圣堂内容</p> },
            { key: 'blood-angels', label: <W40KTabLabel type="bloodAngels" />, children: <p>圣血天使内容</p> },
            { key: 'dark-angels', label: <W40KTabLabel type="darkAngels" />, children: <p>暗黑天使内容</p> },
            { key: 'deathwatch', label: <W40KTabLabel type="deathwatch" />, children: <p>死亡守望内容</p> },
            { key: 'grey-knights', label: <W40KTabLabel type="greyKnights" />, children: <p>灰骑士内容</p> },
            { key: 'space-wolves', label: <W40KTabLabel type="spaceWolves" />, children: <p>太空野狼内容</p> },
          ]}
        />
      ),
    },
    {
      key: 'imperial-forces',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <W40KIcons type="imperial-forces" />
          <span>帝国之军</span>
        </div>
      ),
      children: (
        <Tabs
          tabPosition="left"
          defaultActiveKey="sisters"
          items={[
            { key: 'sisters', label: <W40KTabLabel type="sisters" />, children: <p>修女会内容</p> },
            { key: 'custodes', label: <W40KTabLabel type="custodes" />, children: <p>帝国禁军内容</p> },
            { key: 'mechanicus', label: <W40KTabLabel type="mechanicus" />, children: <p>机械修会内容</p> },
            { key: 'imperial-guard', label: <W40KTabLabel type="imperialGuard" />, children: <p>帝国卫队内容</p> },
          ]}
        />
      ),
    },
    {
      key: 'chaos-forces',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <W40KIcons type="chaos-forces" />
          <span>混沌势力</span>
        </div>
      ),
      children: (
        <Tabs
          tabPosition="left"
          defaultActiveKey="chaos-space-marines"
          items={[
            { key: 'chaos-space-marines', label: <W40KTabLabel type="chaosSpaceMarines" />, children: <p>混沌星际战士内容</p> },
            { key: 'death-guard', label: <W40KTabLabel type="deathGuard" />, children: <p>死亡守卫内容</p> },
            { key: 'thousand-sons', label: <W40KTabLabel type="thousandSons" />, children: <p>千子内容</p> },
            { key: 'world-eaters', label: <W40KTabLabel type="worldEaters" />, children: <p>吞世者内容</p> },
            { key: 'chaos-demons', label: <W40KTabLabel type="chaosDemons" />, children: <p>混沌恶魔内容</p> },
          ]}
        />
      ),
    },
    {
      key: 'xenos-threats',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <W40KIcons type="xenos-threats" />
          <span>异形威胁</span>
        </div>
      ),
      children: (
        <Tabs
          tabPosition="left"
          defaultActiveKey="aeldari"
          items={[
            { key: 'aeldari', label: <W40KTabLabel type="aeldari" />, children: <p>艾达灵族内容</p> },
            { key: 'dark-eldar', label: <W40KTabLabel type="darkEldar" />, children: <p>黑暗灵族内容</p> },
            { key: 'tyranids', label: <W40KTabLabel type="tyranids" />, children: <p>泰伦虫族内容</p> },
            { key: 'genestealer-cults', label: <W40KTabLabel type="genestealerCults" />, children: <p>基因窃取者教派内容</p> },
            { key: 'votann', label: <W40KTabLabel type="votann" />, children: <p>沃坦联盟内容</p> },
            { key: 'necrons', label: <W40KTabLabel type="necrons" />, children: <p>太空死灵内容</p> },
            { key: 'orks', label: <W40KTabLabel type="orks" />, children: <p>欧克蛮人内容</p> },
            { key: 'tau', label: <W40KTabLabel type="tau" />, children: <p>钛帝国内容</p> },
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>W40K</Title>
      <Tabs defaultActiveKey="space-marines" items={tabItems} />
    </div>
  )
}