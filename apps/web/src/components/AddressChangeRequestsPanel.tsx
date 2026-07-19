import { useCallback, useEffect, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import type { AdminRestaurantAddressChangeRequest } from "@findeat/types";
import { request } from "../lib/api";
import { UserIdentity } from "./UserIdentity";

export function AddressChangeRequestsPanel() {
  const [items, setItems] = useState<AdminRestaurantAddressChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(
        await request<AdminRestaurantAddressChangeRequest[]>(
          "/restaurants/address-change-requests/pending",
        ),
      );
      setError("");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not load address requests",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading is intentionally tied to opening this admin panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function decide(
    item: AdminRestaurantAddressChangeRequest,
    decision: "approve" | "reject",
  ) {
    const reason = reasons[item.id]?.trim();
    if (decision === "reject" && !reason) {
      setError("Add a rejection reason before rejecting the request.");
      return;
    }
    setWorkingId(item.id);
    setError("");
    try {
      await request(
        `/restaurants/address-change-requests/${item.id}/${decision}`,
        {
          method: "POST",
          body:
            decision === "reject" ? JSON.stringify({ reason }) : undefined,
        },
      );
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : `Could not ${decision} request`,
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LOCATION VERIFICATION</p>
          <h2>Address change requests</h2>
          <p className="muted">
            Review restaurant moves and corrections before changing their map
            location.
          </p>
        </div>
        <span className="claim-count">{items.length} pending</span>
      </div>
      {error && <p className="error banner">{error}</p>}
      {loading ? (
        <div className="empty">Loading address requests…</div>
      ) : items.length === 0 ? (
        <div className="empty">
          <CheckCircleIcon size={30} weight="duotone" aria-hidden="true" />
          <h3>All addresses are up to date</h3>
          <p>There are no pending restaurant address requests.</p>
        </div>
      ) : (
        <div className="claims-grid">
          {items.map((item) => (
            <article className="claim-card address-review-card" key={item.id}>
              <div className="claim-top">
                {item.restaurant.logoUrl ? (
                  <img src={item.restaurant.logoUrl} alt="" />
                ) : (
                  <div className="restaurant-letter">
                    {item.restaurant.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3>{item.restaurant.name}</h3>
                  <p>{item.restaurant.city || "City not available"}</p>
                </div>
              </div>
              <div className="address-comparison">
                <div>
                  <span>Current address</span>
                  <p>{item.restaurant.address || "No current address"}</p>
                </div>
                <div className="proposed">
                  <span>Proposed address</span>
                  <p>{item.proposedAddress}</p>
                  <small>{item.proposedCity}</small>
                </div>
              </div>
              <div className="claim-person">
                <span>Requested by</span>
                <UserIdentity user={item.requestedBy} />
              </div>
              {item.reason && (
                <div className="claim-evidence">
                  <span>Reason</span>
                  <p>{item.reason}</p>
                </div>
              )}
              <textarea
                className="address-rejection-reason"
                value={reasons[item.id] || ""}
                onChange={(event) =>
                  setReasons((current) => ({
                    ...current,
                    [item.id]: event.target.value,
                  }))
                }
                placeholder="Rejection reason (required only when rejecting)"
                rows={2}
              />
              <div className="claim-actions">
                <button
                  className="secondary reject"
                  disabled={workingId === item.id}
                  onClick={() => void decide(item, "reject")}
                >
                  Reject
                </button>
                <button
                  className="primary approve"
                  disabled={workingId === item.id}
                  onClick={() => void decide(item, "approve")}
                >
                  {workingId === item.id ? "Working…" : "Approve address"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
