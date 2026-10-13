import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  scope: string;
  bodyClass: string;
  html: string;
  script: string;
  fns: string[];
  extraExports?: string[];
  onReady?: (root: HTMLElement, api: Record<string, any>) => void | (() => void);
};

/** Renders a ported design screen and runs its original interaction script. */
export function LegacyPage({
  scope,
  bodyClass,
  html,
  script,
  fns,
  extraExports = [],
  onReady,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const code = script.replace(
      /document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,/g,
      "(function(_e,f){f()})(0,",
    );
    const names = [...fns, ...extraExports];
    let api: Record<string, any> = {};
    try {
      // eslint-disable-next-line no-new-func
      api = new Function(`${code}\n;return {${names.join(",")}};`)() || {};
    } catch (e) {
      console.error("legacy script error", e);
    }
    Object.assign(window as any, api);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[data-nav]") as HTMLAnchorElement | null;
      if (a) {
        e.preventDefault();
        navigate({ to: a.getAttribute("href") as any });
      }
    };
    root.addEventListener("click", onClick);
    const cleanup = onReady?.(root, api);
    return () => {
      root.removeEventListener("click", onClick);
      for (const n of names) delete (window as any)[n];
      if (typeof cleanup === "function") cleanup();
    };
  }, [html, script]);

  return (
    <div
      ref={ref}
      className={`gc-page gc-${scope} ${bodyClass} min-h-screen`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
