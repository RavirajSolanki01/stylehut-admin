
export function shouldEnableButton({
  isEditMode,
  isVariantMode,
  isSizeAdded,
}: {
  isEditMode: boolean;
  isVariantMode: boolean;
  isSizeAdded: boolean;
}) {
  if (isEditMode && isVariantMode) {
    return !isSizeAdded;
  }

  if (isEditMode && !isVariantMode) {
    return false; 
  }

  if (!isEditMode && !isVariantMode) {
    return !isSizeAdded; 
  }

  return false; // Fallback (optional)
}
