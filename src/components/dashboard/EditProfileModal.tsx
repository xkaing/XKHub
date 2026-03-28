'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, Input, Upload, Avatar, App } from 'antd'
import { UserOutlined, UploadOutlined } from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface EditProfileModalProps {
  open: boolean
  onCancel: () => void
  user: any
  profile: Profile | null
  currentTheme: 'light' | 'dark'
  onProfileUpdate: () => void
}

export default function EditProfileModal({
  open,
  onCancel,
  user,
  profile,
  currentTheme,
  onProfileUpdate,
}: EditProfileModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [originalNickname, setOriginalNickname] = useState('')
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (open) {
      const initialNickname = profile?.nickname || ''
      const initialAvatar = profile?.avatar_url || null

      form.setFieldsValue({ nickname: initialNickname })
      setPreviewAvatar(initialAvatar)
      setOriginalNickname(initialNickname)
      setOriginalAvatar(initialAvatar)
      setHasChanges(false)
    } else {
      setPreviewAvatar(null)
      setHasChanges(false)
    }
  }, [open, profile, form])

  const checkChanges = () => {
    const currentNickname = form.getFieldValue('nickname')?.trim() || ''
    const currentAvatar = previewAvatar

    const nicknameChanged = currentNickname !== (originalNickname || '')
    const avatarChanged = currentAvatar !== originalAvatar

    setHasChanges(nicknameChanged || avatarChanged)
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return

    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('image')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('image').getPublicUrl(filePath)

      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        nickname: form.getFieldValue('nickname') || profile?.nickname || null,
        email: user.email,
      })

      if (updateError) {
        throw updateError
      }

      message.success('头像上传成功！')
      setPreviewAvatar(publicUrl)
      onProfileUpdate()
      setTimeout(() => checkChanges(), 0)
      return publicUrl
    } catch (error) {
      console.error('上传头像失败:', error)
      message.error('上传头像失败，请稍后重试')
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields()
      const nickname = values.nickname?.trim() || null
      const supabase = createClient()

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nickname: nickname,
        email: user.email,
        avatar_url: previewAvatar || profile?.avatar_url || null,
      })

      if (error) {
        throw error
      }

      message.success('资料更新成功！')
      onCancel()
      onProfileUpdate()
    } catch (error) {
      console.error('更新资料失败:', error)
      message.error('更新资料失败，请稍后重试')
    }
  }

  return (
    <Modal
      title="编辑资料"
      open={open}
      onOk={handleSaveProfile}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      confirmLoading={uploading}
      okButtonProps={{ disabled: !hasChanges }}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px',
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ width: '100%', maxWidth: '400px' }}
        labelCol={{ style: { textAlign: 'center' } }}
        onValuesChange={checkChanges}
      >
        <Form.Item
          label="头像"
          name="avatar"
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={(file) => {
                const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
                if (!isValidType) {
                  message.error('只支持 JPG、PNG、GIF、WEBP 格式的图片')
                  return false
                }

                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('图片大小不能超过 5MB')
                  return false
                }

                handleAvatarUpload(file)
                return false
              }}
            >
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Avatar
                  size={120}
                  src={previewAvatar || profile?.avatar_url}
                  icon={<UserOutlined />}
                  style={{
                    border: '2px solid',
                    borderColor: currentTheme === 'dark' ? '#404040' : '#d9d9d9',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    border: '2px solid',
                    borderColor: currentTheme === 'dark' ? '#1f1f1f' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <UploadOutlined />
                </div>
              </div>
            </Upload>
          </div>
        </Form.Item>

        <Form.Item
          label="昵称"
          name="nickname"
          rules={[{ max: 20, message: '昵称不能超过20个字符' }]}
          style={{ textAlign: 'center' }}
        >
          <Input
            placeholder={profile?.nickname || user?.email?.split('@')[0] || '请输入昵称'}
            maxLength={20}
            style={{ textAlign: 'center' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}