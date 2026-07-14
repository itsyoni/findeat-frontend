import type { ManagedRestaurant } from '@findeat/types'
import { CheckIcon, PlusIcon } from '@phosphor-icons/react'

type OverviewPageProps = {
  restaurant: ManagedRestaurant
  menuCount: number
  itemCount: number
  reviewCount: number
  onOpenMenu: () => void
  onOpenProfile: () => void
}

export function OverviewPage({
  restaurant,
  menuCount,
  itemCount,
  reviewCount,
  onOpenMenu,
  onOpenProfile,
}: OverviewPageProps) {
  return <div className="page-stack">
    <div className="page-heading"><div><p className="eyebrow">DASHBOARD</p><h2>Good to see you.</h2><p className="muted">Here’s how your restaurant profile is set up.</p></div><button className="primary" onClick={onOpenMenu}>Manage menu</button></div>
    <div className="stats">
      <article><span>Followers</span><strong>{restaurant.followersCount || 0}</strong><small>People following your place</small></article>
      <article><span>Menu sections</span><strong>{menuCount}</strong><small>{itemCount} menu items</small></article>
      <article><span>Reviews</span><strong>{reviewCount}</strong><small>Customer reviews</small></article>
    </div>
    <section className="card official-card"><div><p className="eyebrow">OFFICIAL CONTENT</p><h3>Post from your phone</h3><p className="muted">Official content creation remains in the mobile app so you can quickly take a photo, tag your restaurant, and publish.</p></div><div className="phone-art"><PlusIcon size={34} weight="bold" aria-hidden="true" /></div></section>
    <section className="card checklist">
      <h3>Restaurant setup</h3>
      <div><span className={menuCount ? 'done' : ''}>{menuCount ? <CheckIcon size={17} weight="bold" /> : '1'}</span><p><strong>Add your menu</strong><small>Help customers decide what to order.</small></p><button onClick={onOpenMenu}>{menuCount ? 'Manage' : 'Start'}</button></div>
      <div><span className={restaurant.phone || restaurant.website ? 'done' : ''}>{restaurant.phone || restaurant.website ? <CheckIcon size={17} weight="bold" /> : '2'}</span><p><strong>Complete contact details</strong><small>Add a phone number and website.</small></p><button onClick={onOpenProfile}>Edit</button></div>
    </section>
  </div>
}
