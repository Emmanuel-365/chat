import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/types/user"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = {
    student: { label: "Étudiant", variant: "secondary" as const },
    teacher: { label: "Professeur", variant: "default" as const },
    admin: { label: "Administrateur", variant: "destructive" as const },
    staff: { label: "Personnel", variant: "outline" as const },
  }

  const config = roleConfig[role]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
