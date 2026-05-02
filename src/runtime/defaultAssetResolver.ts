import type { AssetResolver, ResolveImageAssetRequest, ResolvedImageAsset } from "../publicTypes";

const blockedProtocolPattern = /^(javascript|data|vbscript):/i;

export const defaultAssetResolver: AssetResolver = {
  async resolveImage(request: ResolveImageAssetRequest): Promise<ResolvedImageAsset> {
    const asset = request.assetId ? request.assets.get(request.assetId) : undefined;
    const src = asset?.src ?? request.src;
    const alt = asset?.alt ?? "";

    if (!src || blockedProtocolPattern.test(src.trim())) {
      throw new Error("Image source is missing or unsafe.");
    }

    return {
      src,
      alt,
    };
  },
};
