import type { Menu, RestaurantReview } from '@findeat/types'
import { StarIcon } from '@phosphor-icons/react'

export function AnalyticsPage({ menus, reviews }: { menus: Menu[]; reviews: RestaurantReview[] }) {
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
      <section className="card rating-chart"><div className="panel-heading"><div><h3>Rating distribution</h3><p>How customers score their experience</p></div><span><StarIcon size={16} weight="fill" aria-hidden="true" /> {averageRating?.toFixed(1) || '—'}</span></div><div className="rating-bars">{ratingBands.map((band) => <div key={band.label}><label>{band.label}</label><div><i style={{ width: `${(band.count / largestBand) * 100}%` }} /></div><strong>{band.count}</strong></div>)}</div></section>
      <section className="card menu-health"><div className="panel-heading"><div><h3>Menu health</h3><p>Current menu setup</p></div></div><div className="health-row"><span>Menu sections</span><strong>{menus.length}</strong></div><div className="health-row"><span>Total dishes</span><strong>{menuItems.length}</strong></div><div className="health-row"><span>Available dishes</span><strong>{availableItems}</strong></div><div className="health-row"><span>Unavailable dishes</span><strong>{menuItems.length - availableItems}</strong></div></section>
    </div>
    <section className="premium-insights"><div><p className="eyebrow">COMING LATER</p><h3>Premium business insights</h3><p>These metrics require event tracking that isn’t collected yet. This area is ready for a future paid plan.</p></div><div className="locked-metrics"><article><span>Profile views</span><strong>—</strong><small>Trend and discovery sources</small></article><article><span>Map opens</span><strong>—</strong><small>Local discovery performance</small></article><article><span>Saves</span><strong>—</strong><small>Want-to-try and favorites</small></article><article><span>Post reach</span><strong>—</strong><small>Views and engagement</small></article></div></section>
  </div>
}
