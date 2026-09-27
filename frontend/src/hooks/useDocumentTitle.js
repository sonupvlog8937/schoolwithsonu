import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { APP_NAME } from "../branding";

/**
 * Sets document.title from a static panel name + optional path-based page label.
 */
export function useDocumentTitle(panelLabel, pathToTitle) {
  const { pathname } = useLocation();

  const pageTitle = useMemo(() => {
    if (!pathToTitle || typeof pathToTitle !== "object") return panelLabel;
    if (pathToTitle[pathname]) return pathToTitle[pathname];
    const entries = Object.entries(pathToTitle).sort((a, b) => b[0].length - a[0].length);
    for (const [prefix, title] of entries) {
      if (prefix !== "/" && pathname.startsWith(prefix)) return title;
    }
    return panelLabel;
  }, [pathname, panelLabel, pathToTitle]);

  useEffect(() => {
    document.title = `${pageTitle} · ${panelLabel} · ${APP_NAME}`;
  }, [pageTitle, panelLabel]);
}
