export interface Profile {
  id: string
  email: string
  nickname: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_sign_in_at: string | null
}

export interface AIBot {
  id: string
  nickname: string | null
  description: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Moment {
  id: string
  content: string
  image_urls: string[] | null
  created_at: string
  updated_at: string
  profile_id: string
}

export interface GameIP {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface GameCompany {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}
