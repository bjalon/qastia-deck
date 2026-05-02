import {
  codeRendererPlugin,
  markdownRendererPlugin,
  mermaidRendererPlugin,
} from "../renderers/defaultRendererPlugins";
import type { ContentRendererPlugin } from "../publicTypes";

export const defaultRenderers: readonly ContentRendererPlugin[] = [
  markdownRendererPlugin,
  codeRendererPlugin,
  mermaidRendererPlugin,
];
