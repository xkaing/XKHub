import {
  FolderOpenOutlined,
  TrophyOutlined,
  BankOutlined,
  TagOutlined,
  FileTextOutlined,
  AppleOutlined,
  TeamOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";

export const menuItems = [
  {
    key: "psn",
    label: "PSN",
    icon: <FolderOpenOutlined />,
    children: [
      {
        key: "psn-trophies",
        label: "PSN TROPHIES",
        icon: <TrophyOutlined />,
      },
      {
        key: "psn-companies",
        label: "GAME COMPANY",
        icon: <BankOutlined />,
      },
      {
        key: "psn-ips",
        label: "GAME IP",
        icon: <TagOutlined />,
      },
    ],
  },
  {
    key: "warhammer",
    label: "Warhammer",
    icon: <FolderOpenOutlined />,
    children: [
      {
        key: "warhammer-30k",
        label: "30K",
        icon: <FileTextOutlined />,
      },
      {
        key: "warhammer-40k",
        label: "40K",
        icon: <FileTextOutlined />,
      },
    ],
  },
  {
    key: "xkailive",
    label: "XKALLive",
    icon: <AppleOutlined />,
    children: [
      {
        key: "xkailive-account",
        label: "Accounts",
        icon: <TeamOutlined />,
      },
      {
        key: "xkailive-moments",
        label: "Moments",
        icon: <CloudServerOutlined />,
      },
    ],
  },
];

