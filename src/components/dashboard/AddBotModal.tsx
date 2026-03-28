'use client'

import { useState } from 'react'
import { Modal, Form, Input, Upload, Avatar, App } from 'antd'
import { UserOutlined, UploadOutlined } from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'

interface AddBotModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
}

export default function AddBotModal({ open, onCancel, onSuccess }: AddBotModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  const handleAvatarUpload = async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `ai-bot-${Date.now()}.${fileExt}`
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

      message.success('头像上传成功！')
      setPreviewAvatar(publicUrl)
      return publicUrl
    } catch (error) {
      console.error('上传头像失败:', error)
      message.error('上传头像失败，请稍后重试')
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleAddBot = async () => {
    try {
      const values = await form.validateFields()
      const nickname = values.nickname?.trim()
      const description = values.description?.trim() || null
      const supabase = createClient()

      if (!nickname) {
        message.error('请输入昵称')
        return
      }

      setUploading(true)

      const { error } = await supabase.from('ai_bots').insert({
        nickname: nickname,
        avatar_url: previewAvatar || null,
        description: description,
      })

      if (error) {
        throw error
      }

      message.success('机器人创建成功！')
      handleClose()
      onSuccess()
    } catch (error) {
      console.error('创建机器人失败:', error)
      message.error('创建机器人失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setPreviewAvatar(null)
    onCancel()
  }

  return (
    <Modal
      title="新增机器人"
      open={open}
      onOk={handleAddBot}
      onCancel={handleClose}
      okText="创建"
      cancelText="取消"
      confirmLoading={uploading}
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
                  src={previewAvatar}
                  icon={<UserOutlined />}
                  style={{
                    border: '2px solid #d9d9d9',
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
                    border: '2px solid #fff',
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
          rules={[
            { required: true, message: '请输入昵称' },
            { max: 50, message: '昵称不能超过50个字符' },
          ]}
          style={{ textAlign: 'center' }}
        >
          <Input placeholder="请输入机器人昵称" maxLength={50} style={{ textAlign: 'center' }} />
        </Form.Item>

        <Form.Item
          label="介绍"
          name="description"
          rules={[{ max: 500, message: '介绍不能超过500个字符' }]}
          style={{ textAlign: 'center' }}
        >
          <Input.TextArea
            placeholder="请输入机器人介绍/简介（可选）"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}