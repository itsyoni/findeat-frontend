import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Dish = {
  id: string
  name: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
  category?: string | null
  isAvailable: boolean
  isFeatured: boolean
  createdAt?: string
  reviewsCount?: number
  averageRating?: number | null
  isNew?: boolean
}

type Menu = {
  id: string
  title: string
  description?: string | null
  items: Dish[]
}

type Restaurant = {
  id: string
  name: string
  logoUrl?: string | null
  coverUrl?: string | null
  address?: string | null
  city?: string | null
  phone?: string | null
  website?: string | null
  instagram?: string | null
  followersCount?: number
  averageRating?: number | null
  reviewsCount?: number
}

type Claim = {
  id: string
  evidenceText?: string | null
  evidenceUrl?: string | null
  createdAt: string
  restaurant: { id: string; name: string; address?: string | null; city?: string | null }
  user: { id: string; email: string; username: string; displayName: string }
}

type AdminUser = {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string | null
  isAdmin: boolean
  isProtectedAdmin: boolean
  isCurrentUser: boolean
}

type Review = {
  id: string
  imageUrl?: string | null
  description?: string | null
  rating?: number | null
  createdAt: string
  author: { id: string; username: string; displayName?: string | null; avatarUrl?: string | null }
  items: { id: string; name: string; rating?: number | null; text?: string | null }[]
  _count: { likes: number; comments: number }
}

type Section = 'overview' | 'dashboard' | 'menu' | 'reviews' | 'profile'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('findeat-business-token')
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.message || 'Something went wrong')
  }
  return body as T
}

async function uploadImage(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary is not configured for the web dashboard')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const body = await response.json()
  if (!response.ok || !body.secure_url) throw new Error(body.error?.message || 'Could not upload image')
  return body.secure_url as string
}

async function loadRestaurantReviews(restaurantId: string): Promise<Review[]> {
  try {
    const reviews = await request<Review[]>(`/restaurants/${restaurantId}/business/reviews`)
    return reviews.map((review) => ({ ...review, items: review.items ?? [] }))
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (!message.includes('cannot get') && !message.includes('not found')) throw error

    const fallback = await request<{ items: Review[] }>(
      `/restaurants/${restaurantId}/posts?section=REVIEWS&limit=30`,
    )
    return fallback.items.map((review) => ({
      ...review,
      items: review.items ?? [],
      createdAt: review.createdAt ?? '',
    }))
  }
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await request<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('findeat-business-token', result.accessToken)
      onLogin()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">F</div>
        <p className="eyebrow">FINDEAT FOR BUSINESS</p>
        <h1>Run your restaurant in one place.</h1>
        <p className="muted">Manage your public details and menus. Create official posts from the FindEat mobile app.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  )
}

function MenuManager({ menus, reload }: { menus: Menu[]; reload: () => Promise<void> }) {
  const [newTitle, setNewTitle] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(menus[0]?.id ?? null)
  const [dishMenu, setDishMenu] = useState<string | null>(null)
  const [dishName, setDishName] = useState('')
  const [dishDescription, setDishDescription] = useState('')
  const [dishPrice, setDishPrice] = useState('')
  const [dishCategory, setDishCategory] = useState('')
  const [dishImage, setDishImage] = useState<File | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const popularDishIds = useMemo(() => new Set(
    menus
      .flatMap((menu) => menu.items)
      .filter((dish) => (dish.reviewsCount ?? 0) > 0)
      .sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0) || (b.averageRating ?? 0) - (a.averageRating ?? 0))
      .slice(0, 3)
      .map((dish) => dish.id),
  ), [menus])

  async function createMenu(event: FormEvent) {
    event.preventDefault()
    if (!newTitle.trim()) return
    try {
      await request('/business/menus', { method: 'POST', body: JSON.stringify({ title: newTitle }) })
      setNewTitle('')
      await reload()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not create menu section')
    }
  }

  async function createDish(event: FormEvent) {
    event.preventDefault()
    if (!dishMenu || !dishName.trim()) return
    try {
      const imageUrl = dishImage ? await uploadImage(dishImage) : undefined
      await request(`/business/menus/${dishMenu}/dishes`, {
        method: 'POST',
        body: JSON.stringify({
          name: dishName,
          description: dishDescription || undefined,
          price: dishPrice ? Number(dishPrice) : undefined,
          category: dishCategory || undefined,
          imageUrl,
        }),
      })
      setDishName('')
      setDishDescription('')
      setDishPrice('')
      setDishCategory('')
      setDishImage(null)
      setDishMenu(null)
      await reload()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not add dish')
    }
  }

  async function updateDish(dish: Dish, patch: Partial<Dish>) {
    await request(`/business/menus/dishes/${dish.id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    await reload()
  }

  async function deleteDish(id: string) {
    if (!window.confirm('Delete this dish?')) return
    await request(`/business/menus/dishes/${id}`, { method: 'DELETE' })
    await reload()
  }

  async function editDish(dish: Dish) {
    const name = window.prompt('Dish name', dish.name)
    if (name === null || !name.trim()) return
    const category = window.prompt('Category', dish.category || '')
    if (category === null) return
    const price = window.prompt('Price', dish.price?.toString() || '')
    if (price === null) return
    const description = window.prompt('Description', dish.description || '')
    if (description === null) return
    await updateDish(dish, {
      name: name.trim(),
      category: category.trim() || null,
      price: price.trim() ? Number(price) : null,
      description: description.trim() || null,
    })
  }

  async function replaceDishImage(dish: Dish, file?: File) {
    if (!file) return
    setUploadingId(dish.id)
    setError('')
    try {
      await updateDish(dish, { imageUrl: await uploadImage(file) })
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not upload dish image')
    } finally {
      setUploadingId(null)
    }
  }

  async function editMenu(menu: Menu) {
    const title = window.prompt('Section name', menu.title)
    if (title === null || !title.trim()) return
    await request(`/business/menus/${menu.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: title.trim() }),
    })
    await reload()
  }

  async function deleteMenu(menu: Menu) {
    if (menu.items.length) {
      setError('Delete the dishes in this section first.')
      return
    }
    if (!window.confirm(`Delete “${menu.title}”?`)) return
    await request(`/business/menus/${menu.id}`, { method: 'DELETE' })
    await reload()
  }

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">RESTAURANT MENU</p><h2>Menu</h2><p className="muted">Build the menu customers see on your FindEat profile.</p></div></div>
      {error && <p className="error banner">{error}</p>}
      <form className="inline-create" onSubmit={createMenu}>
        <input placeholder="New section, e.g. Breakfast" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
        <button className="primary">Add section</button>
      </form>
      {menus.length === 0 ? <div className="empty"><span>☰</span><h3>Your menu is empty</h3><p>Add your first section, then fill it with dishes.</p></div> : menus.map((menu) => (
        <section className="menu-section" key={menu.id}>
          <button className="section-heading" onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}>
            <div><h3>{menu.title}</h3><p>{menu.items.length} {menu.items.length === 1 ? 'item' : 'items'}</p></div><span>{openMenu === menu.id ? '−' : '+'}</span>
          </button>
          {openMenu === menu.id && <div className="section-body">
            {menu.items.map((dish) => <article className="dish-row" key={dish.id}>
              <label className="dish-image" title="Replace dish image">
                {dish.imageUrl ? <img src={dish.imageUrl} alt="" /> : <span>＋</span>}
                <input type="file" accept="image/*" onChange={(event) => void replaceDishImage(dish, event.target.files?.[0])} />
                {uploadingId === dish.id && <em>…</em>}
              </label>
              <div className="dish-copy"><div className="dish-title"><h4>{dish.name}</h4>{dish.category && <span>{dish.category}</span>}{dish.isFeatured && <span className="featured-tag">Restaurant pick</span>}{popularDishIds.has(dish.id) && <span className="popular-tag">Popular</span>}{dish.isNew && <span className="new-tag">New</span>}</div><p>{dish.description || 'No description'}</p>{(dish.reviewsCount ?? 0) > 0 && <small className="dish-rating">★ {dish.averageRating?.toFixed(1) || '—'} · {dish.reviewsCount} {dish.reviewsCount === 1 ? 'review' : 'reviews'}</small>}</div>
              <strong>{dish.price == null ? '—' : `₪${dish.price.toFixed(2)}`}</strong>
              <button className={`feature-button ${dish.isFeatured ? 'selected' : ''}`} title={dish.isFeatured ? 'Remove from restaurant picks' : 'Feature as a restaurant pick'} onClick={() => void updateDish(dish, { isFeatured: !dish.isFeatured })}>★</button>
              <label className="switch"><input type="checkbox" checked={dish.isAvailable} onChange={(event) => void updateDish(dish, { isAvailable: event.target.checked })} /><span /></label>
              <button className="icon-button edit" onClick={() => void editDish(dish)} aria-label="Edit dish">✎</button>
              <button className="icon-button danger" onClick={() => void deleteDish(dish.id)} aria-label="Delete dish">×</button>
            </article>)}
            {dishMenu === menu.id ? <form className="dish-form" onSubmit={createDish}>
              <input placeholder="Dish name" value={dishName} onChange={(event) => setDishName(event.target.value)} required />
              <input placeholder="Category" value={dishCategory} onChange={(event) => setDishCategory(event.target.value)} />
              <input placeholder="Price" type="number" min="0" step="0.01" value={dishPrice} onChange={(event) => setDishPrice(event.target.value)} />
              <textarea placeholder="Description (optional)" value={dishDescription} onChange={(event) => setDishDescription(event.target.value)} rows={3} />
              <label className="image-picker"><input type="file" accept="image/*" onChange={(event) => setDishImage(event.target.files?.[0] || null)} /><span>{dishImage ? `✓ ${dishImage.name}` : '＋ Add dish photo'}</span></label>
              <div className="form-actions"><button type="button" className="secondary" onClick={() => setDishMenu(null)}>Cancel</button><button className="primary">Save dish</button></div>
            </form> : <div className="section-actions"><div><button className="secondary" onClick={() => setDishMenu(menu.id)}>+ Add dish</button><button className="text-button" onClick={() => void editMenu(menu)}>Rename section</button></div><button className="text-danger" onClick={() => void deleteMenu(menu)}>Delete section</button></div>}
          </div>}
        </section>
      ))}
    </div>
  )
}

function ProfileEditor({ restaurant, onSaved }: { restaurant: Restaurant; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({ name: restaurant.name, address: restaurant.address || '', city: restaurant.city || '', phone: restaurant.phone || '', website: restaurant.website || '', instagram: restaurant.instagram || '' })
  const [status, setStatus] = useState('')

  async function save(event: FormEvent) {
    event.preventDefault()
    setStatus('Saving…')
    try {
      await request('/restaurants/me', { method: 'PATCH', body: JSON.stringify(form) })
      await onSaved()
      setStatus('Saved')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save')
    }
  }

  return <div className="page-stack">
    <div className="page-heading"><div><p className="eyebrow">PUBLIC INFORMATION</p><h2>Restaurant profile</h2><p className="muted">Keep the information customers use to find and contact you accurate.</p></div></div>
    <form className="profile-form card" onSubmit={save}>
      <label className="full">Restaurant name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
      <label>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
      <label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
      <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label>Website<input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
      <label>Instagram<input value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} /></label>
      <div className="form-footer"><span className={status === 'Saved' ? 'success' : 'muted'}>{status}</span><button className="primary">Save changes</button></div>
    </form>
  </div>
}

function PerformanceDashboard({ menus, reviews }: { menus: Menu[]; reviews: Review[] }) {
  const ratedReviews = reviews.filter((review) => review.rating != null)
  const averageRating = ratedReviews.length
    ? ratedReviews.reduce((total, review) => total + (review.rating || 0), 0) / ratedReviews.length
    : null
  const menuItems = menus.flatMap((menu) => menu.items)
  const availableItems = menuItems.filter((item) => item.isAvailable).length
  const featuredItems = menuItems.filter((item) => item.isFeatured).length
  const ratingBands = [
    { label: '9–10', count: ratedReviews.filter((review) => (review.rating || 0) >= 9).length },
    { label: '7–8', count: ratedReviews.filter((review) => (review.rating || 0) >= 7 && (review.rating || 0) < 9).length },
    { label: '5–6', count: ratedReviews.filter((review) => (review.rating || 0) >= 5 && (review.rating || 0) < 7).length },
    { label: 'Below 5', count: ratedReviews.filter((review) => (review.rating || 0) < 5).length },
  ]
  const largestBand = Math.max(...ratingBands.map((band) => band.count), 1)

  return <div className="page-stack performance-page">
    <div className="page-heading"><div><div className="premium-title"><p className="eyebrow">PERFORMANCE DASHBOARD</p><span>Future premium</span></div><h2>Understand your restaurant</h2><p className="muted">Track customer sentiment and menu health now. Deeper business insights can be added here later.</p></div><select aria-label="Date range" defaultValue="all"><option value="all">All time</option><option value="30" disabled>Last 30 days · coming soon</option></select></div>

    <div className="performance-stats">
      <article><span>Average rating</span><strong>{averageRating?.toFixed(1) || '—'}</strong><small>From {ratedReviews.length} rated reviews</small></article>
      <article><span>Total reviews</span><strong>{reviews.length}</strong><small>Customer reviews received</small></article>
      <article><span>Menu availability</span><strong>{menuItems.length ? `${Math.round((availableItems / menuItems.length) * 100)}%` : '—'}</strong><small>{availableItems} of {menuItems.length} dishes available</small></article>
      <article><span>Featured dishes</span><strong>{featuredItems}</strong><small>Highlighted on your menu</small></article>
    </div>

    <div className="performance-grid">
      <section className="card rating-chart"><div className="panel-heading"><div><h3>Rating distribution</h3><p>How customers score their experience</p></div><span>★ {averageRating?.toFixed(1) || '—'}</span></div><div className="rating-bars">{ratingBands.map((band) => <div key={band.label}><label>{band.label}</label><div><i style={{ width: `${(band.count / largestBand) * 100}%` }} /></div><strong>{band.count}</strong></div>)}</div></section>
      <section className="card menu-health"><div className="panel-heading"><div><h3>Menu health</h3><p>Current menu setup</p></div></div><div className="health-row"><span>Menu sections</span><strong>{menus.length}</strong></div><div className="health-row"><span>Total dishes</span><strong>{menuItems.length}</strong></div><div className="health-row"><span>Available dishes</span><strong>{availableItems}</strong></div><div className="health-row"><span>Unavailable dishes</span><strong>{menuItems.length - availableItems}</strong></div></section>
    </div>

    <section className="premium-insights"><div><p className="eyebrow">COMING LATER</p><h3>Premium business insights</h3><p>These metrics require event tracking that isn’t collected yet. This area is ready for a future paid plan.</p></div><div className="locked-metrics"><article><span>Profile views</span><strong>—</strong><small>Trend and discovery sources</small></article><article><span>Map opens</span><strong>—</strong><small>Local discovery performance</small></article><article><span>Saves</span><strong>—</strong><small>Want-to-try and favorites</small></article><article><span>Post reach</span><strong>—</strong><small>Views and engagement</small></article></div></section>
  </div>
}

function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [query, setQuery] = useState('')
  const filteredReviews = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean) return reviews
    return reviews.filter((review) =>
      [review.author.displayName, review.author.username, review.description, ...review.items.map((item) => item.name)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(clean)),
    )
  }, [query, reviews])

  const average = reviews.length
    ? reviews.reduce((total, review) => total + (review.rating || 0), 0) / reviews.filter((review) => review.rating != null).length
    : 0

  return <div className="page-stack reviews-page">
    <div className="page-heading"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h2>Public reviews</h2><p className="muted">Only public reviews are visible here and included in your public rating. Friends-only and private reviews remain private.</p></div><div className="review-summary"><strong>{Number.isFinite(average) ? average.toFixed(1) : '—'}</strong><span>public average</span></div></div>
    <div className="review-toolbar"><input type="search" placeholder="Search reviewer, review, or dish…" value={query} onChange={(event) => setQuery(event.target.value)} /><span>{filteredReviews.length} of {reviews.length} reviews</span></div>
    {reviews.length === 0 ? <div className="empty"><span>☆</span><h3>No public reviews yet</h3><p>New public customer reviews will appear here automatically.</p></div> : filteredReviews.length === 0 ? <div className="empty"><h3>No matching reviews</h3><p>Try a different search.</p></div> : <div className="review-table-wrap"><table className="review-table">
      <thead><tr><th>Reviewer</th><th>Rating</th><th>Review</th><th>Dishes</th><th>Engagement</th><th>Date</th></tr></thead>
      <tbody>{filteredReviews.map((review) => <tr key={review.id}>
        <td><div className="reviewer">{review.author.avatarUrl ? <img src={review.author.avatarUrl} alt="" /> : <span>{review.author.username.charAt(0).toUpperCase()}</span>}<div><strong>{review.author.displayName || review.author.username}</strong><small>@{review.author.username}</small></div></div></td>
        <td><span className="rating-pill">★ {review.rating?.toFixed(1) || '—'}</span></td>
        <td><p className="review-copy">{review.description || 'No written comment'}</p></td>
        <td><div className="dish-tags">{review.items.length ? review.items.slice(0, 3).map((item) => <span key={item.id}>{item.name}{item.rating != null ? ` · ${item.rating}/10` : ''}</span>) : <small>—</small>}{review.items.length > 3 && <small>+{review.items.length - 3} more</small>}</div></td>
        <td><small>{review._count.likes} likes · {review._count.comments} comments</small></td>
        <td><small>{review.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(review.createdAt)) : '—'}</small></td>
      </tr>)}</tbody>
    </table></div>}
  </div>
}

function UserIdentity({ user }: { user: AdminUser }) {
  return <div className="admin-user-identity">
    {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{(user.displayName || user.username).charAt(0).toUpperCase()}</span>}
    <div><strong>{user.displayName}</strong><small>@{user.username} · {user.email}</small></div>
  </div>
}

function AdminPortal({ claims, admins, reload, onLogout }: { claims: Claim[]; admins: AdminUser[]; reload: () => Promise<void>; onLogout: () => void }) {
  const [section, setSection] = useState<'claims' | 'admins'>('claims')
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminUser[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  async function decide(claimId: string, decision: 'approve' | 'reject') {
    if (decision === 'reject' && !window.confirm('Reject this restaurant claim?')) return
    setWorkingId(claimId)
    setError('')
    try {
      await request(`/restaurants/claims/${claimId}/${decision}`, {
        method: 'POST',
        body: decision === 'reject' ? JSON.stringify({ reason: 'Rejected by admin' }) : undefined,
      })
      await reload()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : `Could not ${decision} claim`)
    } finally {
      setWorkingId(null)
    }
  }

  async function searchUsers(event: FormEvent) {
    event.preventDefault()
    if (query.trim().length < 2) {
      setError('Enter at least 2 characters to search users.')
      return
    }
    setSearching(true)
    setSearched(true)
    setError('')
    try {
      setResults(await request<AdminUser[]>(`/admin/users?q=${encodeURIComponent(query.trim())}`))
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not search users')
    } finally {
      setSearching(false)
    }
  }

  async function grantAdmin(user: AdminUser) {
    setWorkingId(user.id)
    setError('')
    try {
      await request(`/admin/admins/${user.id}`, { method: 'POST' })
      setResults((current) => current.map((item) => item.id === user.id ? { ...item, isAdmin: true } : item))
      await reload()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not add admin')
    } finally {
      setWorkingId(null)
    }
  }

  async function revokeAdmin(user: AdminUser) {
    if (confirmRemoveId !== user.id) {
      setConfirmRemoveId(user.id)
      return
    }
    setWorkingId(user.id)
    setError('')
    try {
      await request(`/admin/admins/${user.id}`, { method: 'DELETE' })
      setConfirmRemoveId(null)
      setResults((current) => current.map((item) => item.id === user.id ? { ...item, isAdmin: false } : item))
      await reload()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not remove admin')
    } finally {
      setWorkingId(null)
    }
  }

  return <div className="dashboard admin-dashboard">
    <aside>
      <div className="brand"><div className="brand-mark">F</div><div><strong>FindEat</strong><small>Admin workspace</small></div></div>
      <div className="admin-chip"><span>◆</span><div><strong>Platform administration</strong><small>Restricted access</small></div></div>
      <nav>
        <button className={section === 'claims' ? 'active' : ''} onClick={() => { setSection('claims'); setError('') }}><span>✓</span> Restaurant claims <small className="nav-count">{claims.length}</small></button>
        <button className={section === 'admins' ? 'active' : ''} onClick={() => { setSection('admins'); setError('') }}><span>♙</span> Admins <small className="nav-count neutral">{admins.length}</small></button>
      </nav>
      <div className="aside-footer"><p>Admin access</p><small>Only trusted users should be able to approve claims or manage other admins.</small><button onClick={onLogout}>Sign out</button></div>
    </aside>
    <main className="content">
      <header><div><strong>Admin workspace</strong><span className="admin-badge">Admin</span></div><div className="avatar">A</div></header>
      <div className="admin-content">
        {section === 'claims' ? <>
          <div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h2>Restaurant claims</h2><p className="muted">Review ownership requests before granting access to restaurant management.</p></div><span className="claim-count">{claims.length} pending</span></div>
          {error && <p className="error banner">{error}</p>}
          {claims.length === 0 ? <div className="empty"><span>✓</span><h3>You’re all caught up</h3><p>There are no pending restaurant claims.</p></div> : <div className="claims-grid">{claims.map((claim) => <article className="claim-card" key={claim.id}>
            <div className="claim-top"><div className="restaurant-letter">{claim.restaurant.name.charAt(0)}</div><div><h3>{claim.restaurant.name}</h3><p>{[claim.restaurant.address, claim.restaurant.city].filter(Boolean).join(', ') || 'No address provided'}</p></div></div>
            <div className="claim-person"><span>Requested by</span><strong>{claim.user.displayName}</strong><p>@{claim.user.username} · {claim.user.email}</p></div>
            {claim.evidenceText && <div className="claim-evidence"><span>Evidence</span><p>{claim.evidenceText}</p></div>}
            {claim.evidenceUrl && <a className="evidence-link" href={claim.evidenceUrl} target="_blank" rel="noreferrer">Open attached evidence ↗</a>}
            <div className="claim-actions"><button className="secondary reject" disabled={workingId === claim.id} onClick={() => void decide(claim.id, 'reject')}>Reject</button><button className="primary approve" disabled={workingId === claim.id} onClick={() => void decide(claim.id, 'approve')}>{workingId === claim.id ? 'Working…' : 'Approve claim'}</button></div>
          </article>)}</div>}
        </> : <>
          <div className="page-heading"><div><p className="eyebrow">ACCESS CONTROL</p><h2>Admins</h2><p className="muted">Give trusted existing FindEat users access to this web administration area.</p></div><span className="admin-total">{admins.length} {admins.length === 1 ? 'admin' : 'admins'}</span></div>
          {error && <p className="error banner">{error}</p>}
          <section className="card admin-search-card">
            <div><h3>Add an admin</h3><p>Search by display name, username, or email address.</p></div>
            <form onSubmit={searchUsers}><input type="search" placeholder="Search existing users…" value={query} onChange={(event) => setQuery(event.target.value)} /><button className="primary" disabled={searching}>{searching ? 'Searching…' : 'Search'}</button></form>
            {searched && <div className="admin-search-results">
              {results.length === 0 && !searching ? <div className="inline-empty">No users found. Try another name, username, or email.</div> : results.map((user) => <div className="admin-user-row" key={user.id}>
                <UserIdentity user={user} />
                {user.isAdmin ? <span className="access-status">Already admin</span> : <button className="primary compact" disabled={workingId === user.id} onClick={() => void grantAdmin(user)}>{workingId === user.id ? 'Adding…' : 'Add admin'}</button>}
              </div>)}
            </div>}
          </section>
          <section className="admin-list-section">
            <div className="section-title"><div><h3>Current admins</h3><p>People who can approve restaurant claims and manage admin access.</p></div></div>
            <div className="admin-list">{admins.map((user) => <div className="admin-user-row" key={user.id}>
              <UserIdentity user={user} />
              <div className="admin-row-actions">
                {user.isProtectedAdmin && <span className="primary-admin-label">Primary admin</span>}
                {user.isCurrentUser && !user.isProtectedAdmin && <span className="access-status">You</span>}
                {!user.isProtectedAdmin && !user.isCurrentUser && <button className={confirmRemoveId === user.id ? 'confirm-remove' : 'remove-admin'} disabled={workingId === user.id} onClick={() => void revokeAdmin(user)}>{workingId === user.id ? 'Removing…' : confirmRemoveId === user.id ? 'Click again to remove' : 'Remove'}</button>}
                {confirmRemoveId === user.id && <button className="cancel-remove" onClick={() => setConfirmRemoveId(null)}>Cancel</button>}
              </div>
            </div>)}</div>
          </section>
        </>}
      </div>
    </main>
  </div>
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [section, setSection] = useState<Section>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const restaurant = restaurants[0]

  const load = useCallback(async () => {
    try {
      const me = await request<{ email: string; isAdmin?: boolean }>('/auth/me')
      const isAdminAccount = me.isAdmin === true || me.email.trim().toLowerCase() === 'yonagona@gmail.com'
      if (isAdminAccount) {
        setIsAdmin(true)
        const [nextClaims, nextAdmins] = await Promise.all([
          request<Claim[]>('/restaurants/claims/pending'),
          request<AdminUser[]>('/admin/admins'),
        ])
        setClaims(nextClaims)
        setAdmins(nextAdmins)
        setRestaurants([])
        setMenus([])
        setReviews([])
        setError('')
        return
      }
      setIsAdmin(false)
      const nextRestaurants = await request<Restaurant[]>('/restaurants/me')
      setRestaurants(nextRestaurants)
      if (nextRestaurants.length) {
        const [nextMenus, nextReviews] = await Promise.all([
          request<Menu[]>('/business/menus'),
          loadRestaurantReviews(nextRestaurants[0].id),
        ])
        setMenus(nextMenus)
        setReviews(nextReviews)
      } else {
        setMenus([])
        setReviews([])
      }
      setError('')
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Could not load dashboard'
      if (message.toLowerCase().includes('unauthorized')) onLogout()
      else setError(message)
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => {
    // Loading is intentionally tied to mounting the authenticated dashboard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const itemCount = useMemo(() => menus.reduce((total, menu) => total + menu.items.length, 0), [menus])
  if (loading) return <div className="loading">Loading your restaurant…</div>
  if (error) return <div className="loading"><div><h2>We couldn’t open your dashboard</h2><p>{error}</p><div className="loading-actions"><button className="primary" onClick={() => void load()}>Try again</button><button className="secondary" onClick={onLogout}>Sign out</button></div></div></div>
  if (isAdmin) return <AdminPortal claims={claims} admins={admins} reload={load} onLogout={onLogout} />
  if (!restaurant) return <div className="loading"><div><h2>No managed restaurant</h2><p>Once your restaurant claim is approved, it will appear here.</p><button className="secondary" onClick={onLogout}>Sign out</button></div></div>

  return <div className="dashboard">
    <aside>
      <div className="brand"><div className="brand-mark">F</div><div><strong>FindEat</strong><small>Business</small></div></div>
      <div className="restaurant-chip">{restaurant.logoUrl ? <img src={restaurant.logoUrl} alt="" /> : <span>{restaurant.name.charAt(0)}</span>}<div><strong>{restaurant.name}</strong><small>{restaurant.city || 'Restaurant'}</small></div></div>
      <nav>
        <button className={section === 'overview' ? 'active' : ''} onClick={() => setSection('overview')}><span>⌂</span> Overview</button>
        <button className={section === 'dashboard' ? 'active' : ''} onClick={() => setSection('dashboard')}><span>⌁</span> Dashboard <small className="nav-premium">PRO</small></button>
        <button className={section === 'menu' ? 'active' : ''} onClick={() => setSection('menu')}><span>☰</span> Menu</button>
        <button className={section === 'reviews' ? 'active' : ''} onClick={() => setSection('reviews')}><span>☆</span> Reviews</button>
        <button className={section === 'profile' ? 'active' : ''} onClick={() => setSection('profile')}><span>◎</span> Restaurant profile</button>
      </nav>
      <div className="aside-footer"><p>Official posts stay mobile</p><small>Use the FindEat app to create and publish official content.</small><button onClick={onLogout}>Sign out</button></div>
    </aside>
    <main className="content">
      <header><div><strong>{restaurant.name}</strong><span className="claimed">Claimed</span></div><div className="avatar">{restaurant.name.charAt(0)}</div></header>
      {section === 'overview' && <div className="page-stack">
        <div className="page-heading"><div><p className="eyebrow">DASHBOARD</p><h2>Good to see you.</h2><p className="muted">Here’s how your restaurant profile is set up.</p></div><button className="primary" onClick={() => setSection('menu')}>Manage menu</button></div>
        <div className="stats"><article><span>Followers</span><strong>{restaurant.followersCount || 0}</strong><small>People following your place</small></article><article><span>Menu sections</span><strong>{menus.length}</strong><small>{itemCount} menu items</small></article><article><span>Reviews</span><strong>{reviews.length}</strong><small>Customer reviews</small></article></div>
        <section className="card official-card"><div><p className="eyebrow">OFFICIAL CONTENT</p><h3>Post from your phone</h3><p className="muted">Official content creation remains in the mobile app so you can quickly take a photo, tag your restaurant, and publish.</p></div><div className="phone-art"><span>＋</span></div></section>
        <section className="card checklist"><h3>Restaurant setup</h3><div><span className={menus.length ? 'done' : ''}>{menus.length ? '✓' : '1'}</span><p><strong>Add your menu</strong><small>Help customers decide what to order.</small></p><button onClick={() => setSection('menu')}>{menus.length ? 'Manage' : 'Start'}</button></div><div><span className={restaurant.phone || restaurant.website ? 'done' : ''}>{restaurant.phone || restaurant.website ? '✓' : '2'}</span><p><strong>Complete contact details</strong><small>Add a phone number and website.</small></p><button onClick={() => setSection('profile')}>Edit</button></div></section>
      </div>}
      {section === 'dashboard' && <PerformanceDashboard menus={menus} reviews={reviews} />}
      {section === 'menu' && <MenuManager menus={menus} reload={load} />}
      {section === 'reviews' && <ReviewsTable reviews={reviews} />}
      {section === 'profile' && <ProfileEditor restaurant={restaurant} onSaved={load} />}
    </main>
  </div>
}

function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem('findeat-business-token')))
  const logout = useCallback(() => { localStorage.removeItem('findeat-business-token'); setAuthenticated(false) }, [])
  return authenticated ? <Dashboard onLogout={logout} /> : <Login onLogin={() => setAuthenticated(true)} />
}

export default App
