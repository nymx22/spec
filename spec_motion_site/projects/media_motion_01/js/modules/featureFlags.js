/**
 * URL / shell globals (`window.__SPEC_*__`) — pure reads, no p5. Loaded before sketch.js.
 */
const FeatureFlags = {};

FeatureFlags.liveMotionsDesign = function () {
  return typeof window !== 'undefined' && window.__SPEC_LIVE_MOTIONS_DESIGN__ === true;
};

FeatureFlags.liveMotions27 = function () {
  return typeof window !== 'undefined' && window.__SPEC_LIVE_MOTIONS_27__ === true;
};

FeatureFlags.liveMotionsDesignOrHub27 = function () {
  return FeatureFlags.liveMotionsDesign() || FeatureFlags.liveMotions27();
};

FeatureFlags.gallery2Shell = function () {
  return typeof window !== 'undefined' && window.__SPEC_GALLERY2_SHELL__ === true;
};

FeatureFlags.inspectAnimLabel = function () {
  return typeof window !== 'undefined' && window.__SPEC_INSPECT_ANIM_LABEL__ === true;
};

FeatureFlags.inspectExclusiveDebugFillAlpha = function () {
  if (typeof window === 'undefined') return null;
  const a = window.__SPEC_INSPECT_EXCLUSIVE_DEBUG_ALPHA__;
  return typeof a === 'number' && !Number.isNaN(a) ? a : null;
};

FeatureFlags.gallery1Or15InkTypography = function () {
  if (FeatureFlags.liveMotions27()) return true;
  return !FeatureFlags.gallery2Shell() && !FeatureFlags.liveMotionsDesign();
};

/** @param { { default: object, live27: object } } tuningTable */
FeatureFlags.spectrumReaderTuning = function (tuningTable) {
  return FeatureFlags.liveMotions27() ? tuningTable.live27 : tuningTable.default;
};
