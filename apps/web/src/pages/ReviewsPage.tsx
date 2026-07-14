import { useMemo, useState } from 'react'
import type { RestaurantReview } from '@findeat/types'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'

export function ReviewsPage({ reviews }: { reviews: RestaurantReview[] }) {
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
  const ratedReviews = reviews.filter((review) => review.rating != null)
  const average = ratedReviews.length
    ? ratedReviews.reduce((total, review) => total + (review.rating || 0), 0) / ratedReviews.length
    : 0

  return <div className="page-stack reviews-page">
    <div className="page-heading"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h2>Public reviews</h2><p className="muted">Only public reviews are visible here and included in your public rating. Friends-only and private reviews remain private.</p></div><div className="review-summary"><strong>{Number.isFinite(average) ? average.toFixed(1) : '—'}</strong><span>public average</span></div></div>
    <div className="review-toolbar"><input type="search" placeholder="Search reviewer, review, or dish…" value={query} onChange={(event) => setQuery(event.target.value)} /><span>{filteredReviews.length} of {reviews.length} reviews</span></div>
    {reviews.length === 0 ? <div className="empty"><StarIcon size={34} weight="duotone" aria-hidden="true" /><h3>No public reviews yet</h3><p>New public customer reviews will appear here automatically.</p></div> : filteredReviews.length === 0 ? <div className="empty"><h3>No matching reviews</h3><p>Try a different search.</p></div> : <div className="review-table-wrap"><table className="review-table">
      <thead><tr><th>Reviewer</th><th>Rating</th><th>Review</th><th>Dishes</th><th>Engagement</th><th>Date</th></tr></thead>
      <tbody>{filteredReviews.map((review) => <tr key={review.id}>
        <td><div className="reviewer">{review.author.avatarUrl ? <img src={review.author.avatarUrl} alt="" /> : <span>{review.author.username.charAt(0).toUpperCase()}</span>}<div><strong>{review.author.displayName || review.author.username}</strong><small>@{review.author.username}</small></div></div></td>
        <td><span className="rating-pill"><StarIcon size={13} weight="fill" aria-hidden="true" /> {review.rating?.toFixed(1) || '—'}</span></td>
        <td><p className="review-copy">{review.description || 'No written comment'}</p></td>
        <td><div className="dish-tags">{review.items.length ? review.items.slice(0, 3).map((item) => <span key={item.id}>{item.name}{item.rating != null ? ` · ${item.rating}/10` : ''}</span>) : <small>—</small>}{review.items.length > 3 && <small>+{review.items.length - 3} more</small>}</div></td>
        <td><small>{review._count.likes} likes · {review._count.comments} comments</small></td>
        <td><small>{review.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(review.createdAt)) : '—'}</small></td>
      </tr>)}</tbody>
    </table></div>}
  </div>
}
