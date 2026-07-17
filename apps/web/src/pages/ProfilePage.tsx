import { useState } from "react";
import type { FormEvent } from "react";
import {
  RESTAURANT_CATEGORY_OPTIONS,
  type ManagedRestaurant,
} from "@findeat/types";
import { request, uploadImage } from "../lib/api";

export function ProfilePage({
  restaurant,
  onSaved,
  setupMode = false,
}: {
  restaurant: ManagedRestaurant;
  onSaved: () => Promise<void>;
  setupMode?: boolean;
}) {
  const [form, setForm] = useState({
    name: restaurant.name,
    address: restaurant.address || "",
    city: restaurant.city || "",
    phone: restaurant.phone || "",
    website: restaurant.website || "",
    instagram: restaurant.instagram || "",
    bio: restaurant.bio || "",
  });
  const [categoryNames, setCategoryNames] = useState(restaurant.categories || []);
  const [status, setStatus] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(restaurant.logoUrl || "");
  const [coverPreview, setCoverPreview] = useState(restaurant.coverUrl || "");

  function selectImage(file: File | undefined, type: "logo" | "cover") {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = typeof reader.result === "string" ? reader.result : "";
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(preview);
      } else {
        setCoverFile(file);
        setCoverPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!logoPreview || !coverPreview || categoryNames.length === 0) {
      setStatus("Add a logo, cover photo, and at least one category.");
      return;
    }
    setStatus(logoFile || coverFile ? "Uploading photos…" : "Saving…");
    try {
      const [logoUrl, coverUrl] = await Promise.all([
        logoFile ? uploadImage(logoFile) : Promise.resolve(undefined),
        coverFile ? uploadImage(coverFile) : Promise.resolve(undefined),
      ]);
      await request(`/restaurants/me/${restaurant.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          categoryNames,
          ...(logoUrl ? { logoUrl } : {}),
          ...(coverUrl ? { coverUrl } : {}),
        }),
      });
      setLogoFile(null);
      setCoverFile(null);
      await onSaved();
      setStatus("Saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save");
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {setupMode ? "REQUIRED AFTER APPROVAL" : "PUBLIC INFORMATION"}
          </p>
          <h2>
            {setupMode ? `Finish setting up ${restaurant.name}` : "Restaurant profile"}
          </h2>
          <p className="muted">
            {setupMode
              ? "Your claim was approved. Complete the restaurant information before opening the management dashboard."
              : "Keep the information customers use to find and contact you accurate."}
          </p>
          {setupMode && restaurant.missingSetupFields.length > 0 && (
            <p className="setup-missing">
              Still needed: {restaurant.missingSetupFields.join(", ")}.
            </p>
          )}
        </div>
      </div>
      <form className="profile-form card" onSubmit={save}>
        <div className="restaurant-media-editor full">
          <div className="cover-editor">
            {coverPreview ? (
              <img src={coverPreview} alt="Restaurant cover preview" />
            ) : (
              <div className="media-placeholder">Add a cover photo</div>
            )}
            <label className="media-change-button">
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  selectImage(event.target.files?.[0], "cover")
                }
              />
              <span>{coverFile ? "Cover selected" : "Change cover"}</span>
            </label>
          </div>
          <div className="logo-editor">
            <div className="logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="Restaurant logo preview" />
              ) : (
                <span>{restaurant.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <label className="media-change-button dark">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    selectImage(event.target.files?.[0], "logo")
                  }
                />
                <span>{logoFile ? "Logo selected" : "Change logo"}</span>
              </label>
              <small>Use a square image for the best result.</small>
            </div>
          </div>
        </div>
        <label className="full">
          Restaurant name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label className="full">
          Restaurant description
          <textarea
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            placeholder="Tell customers what makes this place special"
            rows={4}
            required
          />
        </label>
        <fieldset className="restaurant-categories full">
          <legend>Restaurant categories</legend>
          <p className="muted">Choose every category that describes this place.</p>
          <div className="restaurant-category-options">
            {RESTAURANT_CATEGORY_OPTIONS.map((category) => {
              const selected = categoryNames.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={selected ? "selected" : ""}
                  aria-pressed={selected}
                  onClick={() =>
                    setCategoryNames((current) =>
                      selected
                        ? current.filter((item) => item !== category)
                        : [...current, category],
                    )
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label>
          City
          <input
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            required
          />
        </label>
        <label>
          Address
          <input
            value={form.address}
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
            required
          />
        </label>
        <label>
          Phone
          <input
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
            required
          />
        </label>
        <label>
          Website
          <input
            value={form.website}
            onChange={(event) =>
              setForm({ ...form, website: event.target.value })
            }
          />
        </label>
        <label>
          Instagram
          <input
            value={form.instagram}
            onChange={(event) =>
              setForm({ ...form, instagram: event.target.value })
            }
          />
        </label>
        <div className="form-footer">
          <span className={status === "Saved" ? "success" : "muted"}>
            {status}
          </span>
          <button className="primary">
            {setupMode ? "Complete setup" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
