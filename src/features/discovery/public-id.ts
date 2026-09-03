const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function encodePublicUuid(uuid: string): string {
  if (!UUID_PATTERN.test(uuid)) throw new Error("Invalid UUID");
  const hex = uuid.replaceAll("-", "");
  let binary = "";
  for (let index = 0; index < hex.length; index += 2) {
    binary += String.fromCharCode(Number.parseInt(hex.slice(index, index + 2), 16));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function decodePublicUuid(value: string): string | null {
  if (!/^[A-Za-z0-9_-]{22}$/.test(value)) return null;
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + "==");
    const hex = Array.from(binary, (character) =>
      character.charCodeAt(0).toString(16).padStart(2, "0"),
    ).join("");
    const uuid = [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
    return UUID_PATTERN.test(uuid) ? uuid : null;
  } catch {
    return null;
  }
}

export function readableSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "entity";
}

export function entitySlug(name: string, id: string): string {
  return `${readableSlug(name)}--${encodePublicUuid(id)}`;
}

export function encodedEntityId(slug: string): string | null {
  return decodePublicUuid(slug.split("--").at(-1) || "");
}
