/**
 * Client-side fallback όταν το SPA φορτώνει 404 (π.χ. client navigation).
 * Ο server κάνει τα κύρια 301 στο registerRedirects — εδώ μόνο απλά heuristics.
 */
export function getClientLegacyRedirect(pathname: string): string | null {
  const noQuery = (pathname.split("?")[0] || "/").trim() || "/";
  let path = noQuery.toLowerCase();
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  if (/\.html?$/i.test(path)) {
    return "/";
  }
  if (/\.(php|asp|aspx)$/i.test(path)) {
    return "/";
  }
  if (path.startsWith("/blogs/")) {
    return "/blog";
  }
  if (/^\/\d{4}\/\d{2}(\/|$)/.test(path)) {
    return "/blog";
  }
  const toEshop = new Set(["/shop", "/store", "/catalog", "/catalogue", "/all-products"]);
  if (toEshop.has(path)) {
    return "/eshop";
  }
  if (path === "/search" || path === "/search-results") {
    return "/services";
  }
  return null;
}
