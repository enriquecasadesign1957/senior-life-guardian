import { useEffect } from "react";

const SORO_SCRIPT_SRC =
  "https://app.trysoro.com/api/embed/11fa918b-98ba-41a6-a145-08550f87ffaf";
const SORO_SCRIPT_ATTR = "data-soro-blog-embed";

/**
 * Embed oficial Soro (`<div id="soro-blog"></div>` + script defer).
 * Se monta solo en cliente para sobrevivir a la navegación SPA.
 */
export function SoroBlogEmbed() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.querySelectorAll(`script[${SORO_SCRIPT_ATTR}]`).forEach((node) => node.remove());

    const script = document.createElement("script");
    script.src = SORO_SCRIPT_SRC;
    script.defer = true;
    script.setAttribute(SORO_SCRIPT_ATTR, "true");
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <div id="soro-blog" />;
}
