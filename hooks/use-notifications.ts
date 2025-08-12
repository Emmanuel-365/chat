"use client"

import { useState, useEffect } from "react"
import { subscribeToNotifications } from "@/lib/notifications"
import type { Notification } from "@/types/user";

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToNotifications(userId, (newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter((n) => !n.isRead).length)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return { notifications, unreadCount, loading }
}
