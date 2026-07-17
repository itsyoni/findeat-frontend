import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ListDashesIcon } from "@phosphor-icons/react/dist/csr/ListDashes";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type { Dish, Menu } from "@findeat/types";
import { DishEditorModal } from "../components/DishEditorModal";
import { DishFoodTags } from "../components/DishFoodTags";
import { foodTagLabel } from "../lib/foodTags";
import { request, uploadImage } from "../lib/api";

export function MenuPage({
  menus,
  restaurantId,
  reload,
}: {
  menus: Menu[];
  restaurantId: string;
  reload: () => Promise<void>;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(menus[0]?.id ?? null);
  const [dishMenu, setDishMenu] = useState<string | null>(null);
  const [dishName, setDishName] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishCategory, setDishCategory] = useState("");
  const [dishImage, setDishImage] = useState<File | null>(null);
  const [dishAllergens, setDishAllergens] = useState<string[]>([]);
  const [dishDietaryTags, setDishDietaryTags] = useState<string[]>([]);
  const [dishCuisineTags, setDishCuisineTags] = useState<string[]>([]);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [error, setError] = useState("");
  const popularDishIds = useMemo(
    () =>
      new Set(
        menus
          .flatMap((menu) => menu.items)
          .filter((dish) => (dish.reviewsCount ?? 0) > 0)
          .sort(
            (a, b) =>
              (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0) ||
              (b.averageRating ?? 0) - (a.averageRating ?? 0),
          )
          .slice(0, 3)
          .map((dish) => dish.id),
      ),
    [menus],
  );

  async function createMenu(event: FormEvent) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await request("/business/menus", {
        method: "POST",
        body: JSON.stringify({ title: newTitle, restaurantId }),
      });
      setNewTitle("");
      await reload();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not create menu section",
      );
    }
  }

  async function createDish(event: FormEvent) {
    event.preventDefault();
    if (!dishMenu || !dishName.trim()) return;
    try {
      const imageUrl = dishImage ? await uploadImage(dishImage) : undefined;
      await request(`/business/menus/${dishMenu}/dishes`, {
        method: "POST",
        body: JSON.stringify({
          name: dishName,
          description: dishDescription || undefined,
          price: dishPrice ? Number(dishPrice) : undefined,
          category: dishCategory || undefined,
          imageUrl,
          allergens: dishAllergens,
          dietaryTags: dishDietaryTags,
          cuisineTags: dishCuisineTags,
        }),
      });
      setDishName("");
      setDishDescription("");
      setDishPrice("");
      setDishCategory("");
      setDishImage(null);
      setDishAllergens([]);
      setDishDietaryTags([]);
      setDishCuisineTags([]);
      setDishMenu(null);
      await reload();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not add dish",
      );
    }
  }

  async function updateDish(dish: Dish, patch: Partial<Dish>) {
    setError("");
    try {
      await request(`/business/menus/dishes/${dish.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update dish");
    }
  }

  async function deleteDish(id: string) {
    if (!window.confirm("Delete this dish?")) return;
    await request(`/business/menus/dishes/${id}`, { method: "DELETE" });
    await reload();
  }

  async function editMenu(menu: Menu) {
    const title = window.prompt("Section name", menu.title);
    if (title === null || !title.trim()) return;
    await request(`/business/menus/${menu.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: title.trim() }),
    });
    await reload();
  }

  async function deleteMenu(menu: Menu) {
    if (menu.items.length) {
      setError("Delete the dishes in this section first.");
      return;
    }
    if (!window.confirm(`Delete “${menu.title}”?`)) return;
    await request(`/business/menus/${menu.id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESTAURANT MENU</p>
          <h2>Menu</h2>
          <p className="muted">
            Build the menu customers see on your FindEat profile.
          </p>
        </div>
      </div>
      {error && <p className="error banner">{error}</p>}
      <form className="inline-create" onSubmit={createMenu}>
        <input
          placeholder="New section, e.g. Breakfast"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
        />
        <button className="primary">Add section</button>
      </form>
      {menus.length === 0 ? (
        <div className="empty">
          <ListDashesIcon size={34} weight="duotone" aria-hidden="true" />
          <h3>Your menu is empty</h3>
          <p>Add your first section, then fill it with dishes.</p>
        </div>
      ) : (
        menus.map((menu) => (
          <section className="menu-section" key={menu.id}>
            <button
              className="section-heading"
              onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
            >
              <div>
                <h3>{menu.title}</h3>
                <p>
                  {menu.items.length}{" "}
                  {menu.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              {openMenu === menu.id ? <CaretDownIcon size={22} weight="bold" /> : <CaretRightIcon size={22} weight="bold" />}
            </button>
            {openMenu === menu.id && (
              <div className="section-body">
                {menu.items.map((dish) => (
                  <article className="dish-row" key={dish.id}>
                    <button type="button" className="dish-image" title="Edit dish" onClick={() => setEditingDish(dish)}>
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt="" />
                      ) : (
                        <PlusIcon size={22} weight="bold" aria-hidden="true" />
                      )}
                    </button>
                    <div className="dish-copy">
                      <div className="dish-title">
                        <h4>{dish.name}</h4>
                        {dish.category && <span>{dish.category}</span>}
                        {dish.isFeatured && (
                          <span className="featured-tag">Restaurant pick</span>
                        )}
                        {popularDishIds.has(dish.id) && (
                          <span className="popular-tag">Popular</span>
                        )}
                        {dish.isNew && <span className="new-tag">New</span>}
                      </div>
                      <p>{dish.description || "No description"}</p>
                      {(dish.allergens?.length > 0 || dish.dietaryTags?.length > 0) && (
                        <div className="dish-row-food-tags">
                          {dish.allergens?.slice(0, 2).map((tag) => (
                            <span className="warning" key={tag}>{foodTagLabel(tag)}</span>
                          ))}
                          {dish.dietaryTags?.slice(0, 2).map((tag) => (
                            <span className="positive" key={tag}>{foodTagLabel(tag)}</span>
                          ))}
                        </div>
                      )}
                      {(dish.reviewsCount ?? 0) > 0 && (
                        <small className="dish-rating">
                          <StarIcon size={13} weight="fill" aria-hidden="true" /> {dish.averageRating?.toFixed(1) || "—"} ·{" "}
                          {dish.reviewsCount}{" "}
                          {dish.reviewsCount === 1 ? "review" : "reviews"}
                        </small>
                      )}
                    </div>
                    <strong>
                      {dish.price == null ? "—" : `₪${dish.price.toFixed(2)}`}
                    </strong>
                    <button
                      type="button"
                      className={`feature-button ${dish.isFeatured ? "selected" : ""}`}
                      title={
                        dish.isFeatured
                          ? "Remove from restaurant picks"
                          : "Feature as a restaurant pick"
                      }
                      onClick={() =>
                        void updateDish(dish, { isFeatured: !dish.isFeatured })
                      }
                    >
                      <StarIcon size={18} weight={dish.isFeatured ? "fill" : "regular"} aria-hidden="true" />
                    </button>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dish.isAvailable}
                        onChange={(event) =>
                          void updateDish(dish, {
                            isAvailable: event.target.checked,
                          })
                        }
                      />
                      <span />
                    </label>
                    <button
                      type="button"
                      className="icon-button edit"
                      onClick={() => setEditingDish(dish)}
                      aria-label="Edit dish"
                    >
                      <PencilSimpleIcon size={17} weight="bold" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => void deleteDish(dish.id)}
                      aria-label="Delete dish"
                    >
                      <TrashIcon size={17} weight="bold" aria-hidden="true" />
                    </button>
                  </article>
                ))}
                {dishMenu === menu.id ? (
                  <form className="dish-form" onSubmit={createDish}>
                    <input
                      placeholder="Dish name"
                      value={dishName}
                      onChange={(event) => setDishName(event.target.value)}
                      required
                    />
                    <input
                      placeholder="Category"
                      value={dishCategory}
                      onChange={(event) => setDishCategory(event.target.value)}
                    />
                    <input
                      placeholder="Price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={dishPrice}
                      onChange={(event) => setDishPrice(event.target.value)}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={dishDescription}
                      onChange={(event) =>
                        setDishDescription(event.target.value)
                      }
                      rows={3}
                    />
                    <DishFoodTags
                      allergens={dishAllergens}
                      dietaryTags={dishDietaryTags}
                      cuisineTags={dishCuisineTags}
                      onAllergensChange={setDishAllergens}
                      onDietaryTagsChange={setDishDietaryTags}
                      onCuisineTagsChange={setDishCuisineTags}
                    />
                    <label className="image-picker">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setDishImage(event.target.files?.[0] || null)
                        }
                      />
                      <span className="icon-label">
                        {dishImage ? <><CheckIcon size={16} weight="bold" /> {dishImage.name}</> : <><PlusIcon size={16} weight="bold" /> Add dish photo</>}
                      </span>
                    </label>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setDishMenu(null)}
                      >
                        Cancel
                      </button>
                      <button className="primary">Save dish</button>
                    </div>
                  </form>
                ) : (
                  <div className="section-actions">
                    <div>
                      <button
                        className="secondary"
                        onClick={() => setDishMenu(menu.id)}
                      >
                        + Add dish
                      </button>
                      <button
                        className="text-button"
                        onClick={() => void editMenu(menu)}
                      >
                        Rename section
                      </button>
                    </div>
                    <button
                      className="text-danger"
                      onClick={() => void deleteMenu(menu)}
                    >
                      Delete section
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        ))
      )}
      {editingDish && <DishEditorModal dish={editingDish} onClose={() => setEditingDish(null)} onSaved={reload} />}
    </div>
  );
}
