import { RoleBadge } from "@/components/auth/role-badge"
import type { SchoolUser } from "@/types/user"
import { EditableAvatar } from "@/components/auth/editable-avatar"

interface UserProfileProps {
  user: SchoolUser
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center space-x-3 mt-3">
      <EditableAvatar user={user} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
        <div className="flex items-center space-x-2">
          <RoleBadge role={user.role} />
          {user.role === "student" && user.studentProfile?.className && (
            <span className="text-xs text-muted-foreground">
              {user.studentProfile.className}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
