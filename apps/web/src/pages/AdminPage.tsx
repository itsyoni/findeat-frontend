import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type {
  AdminDashboardSection,
  AdminUser,
  BusinessAccount,
  RestaurantClaim,
} from "@findeat/types";
import { AccountAvatar } from "../components/AccountAvatar";
import { UserIdentity } from "../components/UserIdentity";
import { request } from "../lib/api";

export function AdminPage({
  claims,
  admins,
  account,
  reload,
  onLogout,
  onBackToBusiness,
}: {
  claims: RestaurantClaim[];
  admins: AdminUser[];
  account: BusinessAccount;
  reload: () => Promise<void>;
  onLogout: () => void;
  onBackToBusiness?: () => void;
}) {
  const [section, setSection] = useState<AdminDashboardSection>("claims");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  async function decide(claimId: string, decision: "approve" | "reject") {
    if (
      decision === "reject" &&
      !window.confirm("Reject this restaurant claim?")
    )
      return;
    setWorkingId(claimId);
    setError("");
    try {
      await request(`/restaurants/claims/${claimId}/${decision}`, {
        method: "POST",
        body:
          decision === "reject"
            ? JSON.stringify({ reason: "Rejected by admin" })
            : undefined,
      });
      await reload();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : `Could not ${decision} claim`,
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function searchUsers(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) {
      setError("Enter at least 2 characters to search users.");
      return;
    }
    setSearching(true);
    setSearched(true);
    setError("");
    try {
      setResults(
        await request<AdminUser[]>(
          `/admin/users?q=${encodeURIComponent(query.trim())}`,
        ),
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not search users",
      );
    } finally {
      setSearching(false);
    }
  }

  async function grantAdmin(user: AdminUser) {
    setWorkingId(user.id);
    setError("");
    try {
      await request(`/admin/admins/${user.id}`, { method: "POST" });
      setResults((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isAdmin: true } : item,
        ),
      );
      await reload();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not add admin",
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function revokeAdmin(user: AdminUser) {
    if (confirmRemoveId !== user.id) {
      setConfirmRemoveId(user.id);
      return;
    }
    setWorkingId(user.id);
    setError("");
    try {
      await request(`/admin/admins/${user.id}`, { method: "DELETE" });
      setConfirmRemoveId(null);
      setResults((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isAdmin: false } : item,
        ),
      );
      await reload();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not remove admin",
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="dashboard admin-dashboard">
      <aside>
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>FindEat</strong>
            <small>Admin workspace</small>
          </div>
        </div>
        <div className="admin-chip">
          <ShieldCheckIcon size={22} weight="duotone" aria-hidden="true" />
          <div>
            <strong>Platform administration</strong>
            <small>Restricted access</small>
          </div>
        </div>
        <nav>
          {onBackToBusiness && (
            <button onClick={onBackToBusiness}>
              <ArrowLeftIcon className="nav-icon" weight="duotone" /> Restaurant dashboard
            </button>
          )}
          <button
            className={section === "claims" ? "active" : ""}
            onClick={() => {
              setSection("claims");
              setError("");
            }}
          >
            <SealCheckIcon className="nav-icon" weight="duotone" /> Restaurant claims{" "}
            <small className="nav-count">{claims.length}</small>
          </button>
          <button
            className={section === "admins" ? "active" : ""}
            onClick={() => {
              setSection("admins");
              setError("");
            }}
          >
            <UsersThreeIcon className="nav-icon" weight="duotone" /> Admins{" "}
            <small className="nav-count neutral">{admins.length}</small>
          </button>
        </nav>
        <div className="aside-footer">
          <p>Admin access</p>
          <small>
            Only trusted users should be able to approve claims or manage other
            admins.
          </small>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <header>
          <div>
            <strong>Admin workspace</strong>
            <span className="admin-badge">Admin</span>
          </div>
          <AccountAvatar account={account} />
        </header>
        <div className="admin-content">
          {section === "claims" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">ADMINISTRATION</p>
                  <h2>Restaurant claims</h2>
                  <p className="muted">
                    Review ownership requests before granting access to
                    restaurant management.
                  </p>
                </div>
                <span className="claim-count">{claims.length} pending</span>
              </div>
              {error && <p className="error banner">{error}</p>}
              {claims.length === 0 ? (
                <div className="empty">
                  <CheckCircleIcon size={30} weight="duotone" aria-hidden="true" />
                  <h3>You’re all caught up</h3>
                  <p>There are no pending restaurant claims.</p>
                </div>
              ) : (
                <div className="claims-grid">
                  {claims.map((claim) => (
                    <article className="claim-card" key={claim.id}>
                      <div className="claim-top">
                        <div className="restaurant-letter">
                          {claim.restaurant.name.charAt(0)}
                        </div>
                        <div>
                          <h3>{claim.restaurant.name}</h3>
                          <p>
                            {[claim.restaurant.address, claim.restaurant.city]
                              .filter(Boolean)
                              .join(", ") || "No address provided"}
                          </p>
                        </div>
                      </div>
                      <div className="claim-person">
                        <span>Requested by</span>
                        <strong>{claim.user.displayName}</strong>
                        <p>
                          @{claim.user.username} · {claim.user.email}
                        </p>
                      </div>
                      {claim.evidenceText && (
                        <div className="claim-evidence">
                          <span>Evidence</span>
                          <p>{claim.evidenceText}</p>
                        </div>
                      )}
                      {claim.evidenceUrl && (
                        <a
                          className="evidence-link"
                          href={claim.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open attached evidence ↗
                        </a>
                      )}
                      <div className="claim-actions">
                        <button
                          className="secondary reject"
                          disabled={workingId === claim.id}
                          onClick={() => void decide(claim.id, "reject")}
                        >
                          Reject
                        </button>
                        <button
                          className="primary approve"
                          disabled={workingId === claim.id}
                          onClick={() => void decide(claim.id, "approve")}
                        >
                          {workingId === claim.id
                            ? "Working…"
                            : "Approve claim"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">ACCESS CONTROL</p>
                  <h2>Admins</h2>
                  <p className="muted">
                    Give trusted existing FindEat users access to this web
                    administration area.
                  </p>
                </div>
                <span className="admin-total">
                  {admins.length} {admins.length === 1 ? "admin" : "admins"}
                </span>
              </div>
              {error && <p className="error banner">{error}</p>}
              <section className="card admin-search-card">
                <div>
                  <h3>Add an admin</h3>
                  <p>Search by display name, username, or email address.</p>
                </div>
                <form onSubmit={searchUsers}>
                  <input
                    type="search"
                    placeholder="Search existing users…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <button className="primary" disabled={searching}>
                    {searching ? "Searching…" : "Search"}
                  </button>
                </form>
                {searched && (
                  <div className="admin-search-results">
                    {results.length === 0 && !searching ? (
                      <div className="inline-empty">
                        No users found. Try another name, username, or email.
                      </div>
                    ) : (
                      results.map((user) => (
                        <div className="admin-user-row" key={user.id}>
                          <UserIdentity user={user} />
                          {user.isAdmin ? (
                            <span className="access-status">Already admin</span>
                          ) : (
                            <button
                              className="primary compact"
                              disabled={workingId === user.id}
                              onClick={() => void grantAdmin(user)}
                            >
                              {workingId === user.id ? "Adding…" : "Add admin"}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>
              <section className="admin-list-section">
                <div className="section-title">
                  <div>
                    <h3>Current admins</h3>
                    <p>
                      People who can approve restaurant claims and manage admin
                      access.
                    </p>
                  </div>
                </div>
                <div className="admin-list">
                  {admins.map((user) => (
                    <div className="admin-user-row" key={user.id}>
                      <UserIdentity user={user} />
                      <div className="admin-row-actions">
                        {user.isProtectedAdmin && (
                          <span className="primary-admin-label">
                            Primary admin
                          </span>
                        )}
                        {user.isCurrentUser && !user.isProtectedAdmin && (
                          <span className="access-status">You</span>
                        )}
                        {!user.isProtectedAdmin && !user.isCurrentUser && (
                          <button
                            className={
                              confirmRemoveId === user.id
                                ? "confirm-remove"
                                : "remove-admin"
                            }
                            disabled={workingId === user.id}
                            onClick={() => void revokeAdmin(user)}
                          >
                            {workingId === user.id
                              ? "Removing…"
                              : confirmRemoveId === user.id
                                ? "Click again to remove"
                                : "Remove"}
                          </button>
                        )}
                        {confirmRemoveId === user.id && (
                          <button
                            className="cancel-remove"
                            onClick={() => setConfirmRemoveId(null)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
