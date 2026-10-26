export const NOTICE_COOKIE = "ss-notice";

export function encodeNotice(notice: string) {
  return encodeURIComponent(notice);
}

export function decodeNotice(value: string | undefined) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

export function urlWithoutNotice(href: string) {
  const url = new URL(href, "http://localhost");
  url.searchParams.delete("notice");
  const query = url.searchParams.toString();
  return `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
}
