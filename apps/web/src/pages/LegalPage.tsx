import { useEffect } from "react";
import {
  LEGAL_URLS,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
} from "@findeat/legal";
import type { LegalDocument } from "@findeat/legal";
import type { LegalPageKind } from "../lib/legalRoutes";

function LegalHeader({ active }: { active: LegalPageKind }) {
  return (
    <header className="legal-header">
      <a className="legal-brand" href="/">
        <span>F</span>
        <strong>FindEat</strong>
      </a>
      <nav aria-label="Legal pages">
        <a className={active === "privacy" ? "active" : ""} href="/privacy">
          Privacy
        </a>
        <a className={active === "terms" ? "active" : ""} href="/terms">
          Terms
        </a>
        <a
          className={active === "account-deletion" ? "active" : ""}
          href="/account-deletion"
        >
          Delete account
        </a>
      </nav>
      <a className="legal-login-link" href="/login">
        Business sign in
      </a>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="legal-footer">
      <strong>FindEat</strong>
      <span>Find places worth sharing.</span>
      <nav aria-label="Footer legal links">
        <a href={LEGAL_URLS.privacy}>Privacy Policy</a>
        <a href={LEGAL_URLS.terms}>Terms of Service</a>
        <a href={LEGAL_URLS.accountDeletion}>Account deletion</a>
      </nav>
    </footer>
  );
}

function DocumentPage({
  active,
  document: legalDocument,
}: {
  active: "privacy" | "terms";
  document: LegalDocument;
}) {
  useEffect(() => {
    document.title = `${legalDocument.title} | FindEat`;
  }, [legalDocument.title]);

  return (
    <div className="legal-site">
      <LegalHeader active={active} />
      <main className="legal-layout">
        <aside className="legal-toc">
          <span>ON THIS PAGE</span>
          {legalDocument.sections.map((section) => (
            <a
              key={section.title}
              href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              {section.title.replace(/^\d+\.\s*/, "")}
            </a>
          ))}
        </aside>
        <article className="legal-document">
          <div className="legal-hero">
            <p className="eyebrow">FINDEAT LEGAL</p>
            <h1>{legalDocument.title}</h1>
            <p className="legal-effective">
              Effective date: {legalDocument.effectiveDate}
            </p>
            {legalDocument.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {legalDocument.sections.map((section) => (
            <section
              key={section.title}
              id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            >
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </main>
      <LegalFooter />
    </div>
  );
}

function AccountDeletionPage() {
  useEffect(() => {
    document.title = "Delete your FindEat account | FindEat";
  }, []);

  return (
    <div className="legal-site">
      <LegalHeader active="account-deletion" />
      <main className="deletion-page">
        <section className="deletion-hero">
          <p className="eyebrow">YOUR ACCOUNT, YOUR CHOICE</p>
          <h1>Delete your FindEat account</h1>
          <p>
            You can permanently delete your account and associated data from
            the FindEat app. If you cannot access the app, you can submit a
            deletion request by email.
          </p>
        </section>

        <div className="deletion-grid">
          <section className="deletion-card">
            <span className="deletion-step">Recommended</span>
            <h2>Delete from the app</h2>
            <ol>
              <li>Open your profile and tap Settings.</li>
              <li>Open Password and security.</li>
              <li>Choose Delete account.</li>
              <li>Review what will be deleted and confirm with your password.</li>
            </ol>
            <p>
              The app completes the deletion after you confirm. You will be
              signed out and the account cannot be recovered.
            </p>
          </section>

          <section className="deletion-card">
            <span className="deletion-step">No app access?</span>
            <h2>Request deletion by email</h2>
            <p>
              Email us from the address connected to your FindEat account. Use
              the subject “Delete my FindEat account” and include your
              username.
            </p>
            <a
              className="deletion-email"
              href="mailto:privacy@findeat.space?subject=Delete%20my%20FindEat%20account"
            >
              privacy@findeat.space
            </a>
            <p>
              We may ask you to verify account ownership. We will respond and
              complete a valid request within 30 days, unless applicable law
              requires a different period.
            </p>
          </section>
        </div>

        <section className="deletion-details">
          <h2>What deletion removes</h2>
          <ul>
            <li>Profile details, settings, profile photo, and cover photo.</li>
            <li>Posts, reviews, uploaded post media, drafts, and social activity.</li>
            <li>Follows, likes, saves, folders, notifications, and support requests.</li>
            <li>Restaurant claims, ownership, and management access.</li>
          </ul>
          <p>
            Messages are marked deleted and comments are cleared so other
            users’ conversations and threads remain structurally
            understandable without identifying you. Temporary backup copies
            and limited security or legal records may remain for a limited
            period as described in our <a href="/privacy">Privacy Policy</a>.
          </p>
          <p>
            If you only want a break, the app also offers account deactivation.
            Deactivation hides your account without deleting its data.
          </p>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}

export function PublicLegalPage({ kind }: { kind: LegalPageKind }) {
  if (kind === "privacy") {
    return <DocumentPage active="privacy" document={PRIVACY_POLICY} />;
  }
  if (kind === "terms") {
    return <DocumentPage active="terms" document={TERMS_OF_SERVICE} />;
  }
  return <AccountDeletionPage />;
}
