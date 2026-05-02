export function shouldIgnoreDeckKeyboardEvent(event: KeyboardEvent): boolean {
  if (event.isComposing) {
    return true;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, button, [role='combobox'], [role='menu'], [contenteditable='true'], [contenteditable='']",
    ),
  );
}
