import { encodePublicUuid, readableSlug } from "@/features/discovery/public-id";

export function buildPublicMatchSlug(input: { fixtureId: string; homeName: string; awayName: string }) {
  return `${readableSlug(input.homeName)}-v-${readableSlug(input.awayName)}--${encodePublicUuid(input.fixtureId)}`;
}

export function buildPublicMatchPath(input: { locale: string; fixtureId: string; homeName: string; awayName: string }) {
  return `/${input.locale}/match/${buildPublicMatchSlug(input)}`;
}
