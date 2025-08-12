"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  )
}
