export type ProductUpdate = {
  id: string;
  title: string;
  body: string;
  versionLabel?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  isSeen?: boolean;
  viewedAt?: string | null;
  _count?: { views: number };
};

export type ProductUpdateAudienceMember = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  seen: boolean;
  viewedAt?: string | null;
};
