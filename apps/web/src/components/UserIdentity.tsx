import type { AdminUser } from '@findeat/types'

export function UserIdentity({ user }: { user: AdminUser }) {
  return <div className="admin-user-identity">
    {user.avatarUrl
      ? <img src={user.avatarUrl} alt="" />
      : <span>{(user.displayName || user.username).charAt(0).toUpperCase()}</span>}
    <div>
      <strong>{user.displayName}</strong>
      <small>@{user.username} · {user.email}</small>
    </div>
  </div>
}
