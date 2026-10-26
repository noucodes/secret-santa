export function urlWithoutNotice(href: string) {
  const url = new URL(href, "http://localhost");
  url.searchParams.delete("notice");
  const query = url.searchParams.toString();
  return `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
}
