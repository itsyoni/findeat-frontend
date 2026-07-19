import { useEffect, useMemo } from "react";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import { LockSimpleIcon } from "@phosphor-icons/react/dist/csr/LockSimple";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { Dish } from "@findeat/types";

type DishInsightsModalProps = {
  dish: Dish;
  allDishes: Dish[];
  onClose: () => void;
};

export function DishInsightsModal({
  dish,
  allDishes,
  onClose,
}: DishInsightsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const favoriteRank = useMemo(() => {
    const ranked = [...allDishes].sort(
      (left, right) =>
        (right.favoriteCount ?? 0) - (left.favoriteCount ?? 0) ||
        (right.reviewsCount ?? 0) - (left.reviewsCount ?? 0),
    );
    const index = ranked.findIndex((item) => item.id === dish.id);
    return index < 0 ? null : index + 1;
  }, [allDishes, dish.id]);

  return (
    <div
      className="dish-insights-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="dish-insights"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-insights-title"
      >
        <header className="dish-insights-header">
          <div className="dish-insights-identity">
            {dish.imageUrl ? (
              <img src={dish.imageUrl} alt="" />
            ) : (
              <span>{dish.name.charAt(0).toUpperCase()}</span>
            )}
            <div>
              <small>Dish statistics</small>
              <h2 id="dish-insights-title">{dish.name}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close statistics">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </header>

        <div className="dish-insights-body">
          <div className="dish-insights-section-heading">
            <div>
              <span className="dish-insights-plan free">Free</span>
              <h3>Quick statistics</h3>
              <p>Current performance at a glance.</p>
            </div>
            <ChartLineUpIcon size={25} weight="duotone" aria-hidden="true" />
          </div>

          <div className="dish-insights-quick-grid">
            <article>
              <StarIcon size={20} weight="fill" aria-hidden="true" />
              <span>Average rating</span>
              <strong>{dish.averageRating?.toFixed(1) ?? "—"}</strong>
            </article>
            <article>
              <ChartLineUpIcon size={20} weight="duotone" aria-hidden="true" />
              <span>Total reviews</span>
              <strong>{dish.reviewsCount ?? 0}</strong>
            </article>
            <article>
              <HeartIcon size={20} weight="fill" aria-hidden="true" />
              <span>Customer favorites</span>
              <strong>{dish.favoriteCount ?? 0}</strong>
            </article>
            <article>
              <ChartLineUpIcon size={20} weight="duotone" aria-hidden="true" />
              <span>Favorite rank</span>
              <strong>{favoriteRank ? `#${favoriteRank}` : "—"}</strong>
            </article>
          </div>

          <section className="dish-insights-pro">
            <div className="dish-insights-section-heading">
              <div>
                <span className="dish-insights-plan pro">Pro</span>
                <h3>Deep dish analytics</h3>
                <p>Understand discovery, conversion, and performance over time.</p>
              </div>
              <LockSimpleIcon size={23} weight="fill" aria-hidden="true" />
            </div>
            <div className="dish-insights-pro-grid" aria-hidden="true">
              <article><span>Menu impressions</span><strong>—</strong><small>Reach and discovery sources</small></article>
              <article><span>Dish page views</span><strong>—</strong><small>Views and engagement trend</small></article>
              <article><span>Favorite conversion</span><strong>—</strong><small>Favorites compared with views</small></article>
              <article><span>Performance trend</span><strong>—</strong><small>Changes after featuring</small></article>
            </div>
            <div className="dish-insights-pro-lock">
              <LockSimpleIcon size={22} weight="fill" aria-hidden="true" />
              <div>
                <strong>Available with FindEat Pro</strong>
                <small>Historical tracking and plan upgrades are coming next.</small>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
