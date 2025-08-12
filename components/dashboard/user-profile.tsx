import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleBadge } from "@/components/auth/role-badge"
import type { SchoolUser } from "@/types/user"

interface UserProfileProps {
  user: SchoolUser
}

export function UserProfile({ user }: UserProfileProps) {
  const initials = user.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center space-x-3 mt-3">
      <Avatar>
        <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
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
