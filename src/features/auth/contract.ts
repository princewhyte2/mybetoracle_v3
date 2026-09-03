export type SessionUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
  phoneNumber: string | null;
  providers: string[];
};

export type AccessState = {
  schemaVersion: "mbo-access-v1";
  capabilities: {
    saved_state: { granted: boolean; source: string };
    ad_free: { granted: boolean; source: string };
  };
};

export type WebSession = { schemaVersion: "mbo-session-v1"; user: SessionUser; access: AccessState };
