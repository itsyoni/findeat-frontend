import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Dish = {
  id: string
  name: string
  description?: string | null
  price?: number | null
  category?: string | null
  isAvailable: boolean
  isFeatured: boolean
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

type Section = 'overview' | 'menu' | 'profile'

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
  const [dishPrice, setDishPrice] = useState('')
  const [dishCategory, setDishCategory] = useState('')
  const [error, setError] = useState('')

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
      await request(`/business/menus/${dishMenu}/dishes`, {
        method: 'POST',
        body: JSON.stringify({
          name: dishName,
          price: dishPrice ? Number(dishPrice) : undefined,
          category: dishCategory || undefined,
        }),
      })
      setDishName('')
      setDishPrice('')
      setDishCategory('')
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
    await updateDish(dish, {
      name: name.trim(),
      category: category.trim() || null,
      price: price.trim() ? Number(price) : null,
    })
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
              <div className="dish-copy"><div className="dish-title"><h4>{dish.name}</h4>{dish.category && <span>{dish.category}</span>}</div><p>{dish.description || 'No description'}</p></div>
              <strong>{dish.price == null ? '—' : `₪${dish.price.toFixed(2)}`}</strong>
              <label className="switch"><input type="checkbox" checked={dish.isAvailable} onChange={(event) => void updateDish(dish, { isAvailable: event.target.checked })} /><span /></label>
              <button className="icon-button edit" onClick={() => void editDish(dish)} aria-label="Edit dish">✎</button>
              <button className="icon-button danger" onClick={() => void deleteDish(dish.id)} aria-label="Delete dish">×</button>
            </article>)}
            {dishMenu === menu.id ? <form className="dish-form" onSubmit={createDish}>
              <input placeholder="Dish name" value={dishName} onChange={(event) => setDishName(event.target.value)} required />
              <input placeholder="Category" value={dishCategory} onChange={(event) => setDishCategory(event.target.value)} />
              <input placeholder="Price" type="number" min="0" step="0.01" value={dishPrice} onChange={(event) => setDishPrice(event.target.value)} />
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

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [section, setSection] = useState<Section>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const restaurant = restaurants[0]

  const load = useCallback(async () => {
    try {
      const nextRestaurants = await request<Restaurant[]>('/restaurants/me')
      setRestaurants(nextRestaurants)
      setMenus(
        nextRestaurants.length
          ? await request<Menu[]>('/business/menus')
          : [],
      )
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
  if (!restaurant) return <div className="loading"><div><h2>No managed restaurant</h2><p>Once your restaurant claim is approved, it will appear here.</p><button className="secondary" onClick={onLogout}>Sign out</button></div></div>

  return <div className="dashboard">
    <aside>
      <div className="brand"><div className="brand-mark">F</div><div><strong>FindEat</strong><small>Business</small></div></div>
      <div className="restaurant-chip">{restaurant.logoUrl ? <img src={restaurant.logoUrl} alt="" /> : <span>{restaurant.name.charAt(0)}</span>}<div><strong>{restaurant.name}</strong><small>{restaurant.city || 'Restaurant'}</small></div></div>
      <nav>
        <button className={section === 'overview' ? 'active' : ''} onClick={() => setSection('overview')}><span>⌂</span> Overview</button>
        <button className={section === 'menu' ? 'active' : ''} onClick={() => setSection('menu')}><span>☰</span> Menu</button>
        <button className={section === 'profile' ? 'active' : ''} onClick={() => setSection('profile')}><span>◎</span> Restaurant profile</button>
      </nav>
      <div className="aside-footer"><p>Official posts stay mobile</p><small>Use the FindEat app to create and publish official content.</small><button onClick={onLogout}>Sign out</button></div>
    </aside>
    <main className="content">
      <header><div><strong>{restaurant.name}</strong><span className="claimed">Claimed</span></div><div className="avatar">{restaurant.name.charAt(0)}</div></header>
      {section === 'overview' && <div className="page-stack">
        <div className="page-heading"><div><p className="eyebrow">DASHBOARD</p><h2>Good to see you.</h2><p className="muted">Here’s how your restaurant profile is set up.</p></div><button className="primary" onClick={() => setSection('menu')}>Manage menu</button></div>
        <div className="stats"><article><span>Followers</span><strong>{restaurant.followersCount || 0}</strong><small>People following your place</small></article><article><span>Menu sections</span><strong>{menus.length}</strong><small>{itemCount} menu items</small></article><article><span>Rating</span><strong>{restaurant.averageRating?.toFixed(1) || '—'}</strong><small>{restaurant.reviewsCount || 0} customer reviews</small></article></div>
        <section className="card official-card"><div><p className="eyebrow">OFFICIAL CONTENT</p><h3>Post from your phone</h3><p className="muted">Official content creation remains in the mobile app so you can quickly take a photo, tag your restaurant, and publish.</p></div><div className="phone-art"><span>＋</span></div></section>
        <section className="card checklist"><h3>Restaurant setup</h3><div><span className={menus.length ? 'done' : ''}>{menus.length ? '✓' : '1'}</span><p><strong>Add your menu</strong><small>Help customers decide what to order.</small></p><button onClick={() => setSection('menu')}>{menus.length ? 'Manage' : 'Start'}</button></div><div><span className={restaurant.phone || restaurant.website ? 'done' : ''}>{restaurant.phone || restaurant.website ? '✓' : '2'}</span><p><strong>Complete contact details</strong><small>Add a phone number and website.</small></p><button onClick={() => setSection('profile')}>Edit</button></div></section>
      </div>}
      {section === 'menu' && <MenuManager menus={menus} reload={load} />}
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
