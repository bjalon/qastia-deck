type VersionCompareDialogProps = {
  readonly title: string;
  readonly leftLabel: string;
  readonly leftSource: string;
  readonly rightLabel: string;
  readonly rightSource: string;
  readonly onClose: () => void;
};

export function VersionCompareDialog({
  title,
  leftLabel,
  leftSource,
  rightLabel,
  rightSource,
  onClose,
}: VersionCompareDialogProps): React.ReactElement {
  const diff = createLineDiff(leftSource, rightSource);
  const addedCount = diff.filter((line) => line.kind === "added").length;
  const removedCount = diff.filter((line) => line.kind === "removed").length;

  return (
    <div className="deck-modal-backdrop" role="presentation">
      <section
        aria-labelledby="deck-version-compare-title"
        aria-modal="true"
        className="deck-modal-dialog deck-version-compare-dialog"
        role="dialog"
      >
        <header>
          <div>
            <p>Comparaison</p>
            <h3 id="deck-version-compare-title">{title}</h3>
            <span className="deck-version-compare-subtitle">
              {leftLabel} vers {rightLabel}
            </span>
          </div>
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </header>
        <div className="deck-diff-summary" role="status">
          <span data-kind="added">{addedCount} ajout(s)</span>
          <span data-kind="removed">{removedCount} suppression(s)</span>
          {addedCount === 0 && removedCount === 0 ? <span>Aucune différence détectée.</span> : null}
        </div>
        <div className="deck-diff-legend" aria-hidden="true">
          <span data-kind="removed">- supprimé</span>
          <span data-kind="added">+ ajouté</span>
          <span data-kind="unchanged">inchangé</span>
        </div>
        <pre className="deck-diff-view" aria-label="Diff des versions">
          {diff.map((line, index) => (
            <div key={`${index}-${line.kind}`} className="deck-diff-line" data-kind={line.kind}>
              <span className="deck-diff-marker">{lineMarker(line.kind)}</span>
              <span className="deck-diff-number">{line.leftNumber ?? ""}</span>
              <span className="deck-diff-number">{line.rightNumber ?? ""}</span>
              <code>{line.content || " "}</code>
            </div>
          ))}
        </pre>
      </section>
    </div>
  );
}

type DiffLine = {
  readonly kind: "unchanged" | "added" | "removed";
  readonly content: string;
  readonly leftNumber?: number;
  readonly rightNumber?: number;
};

function createLineDiff(leftSource: string, rightSource: string): readonly DiffLine[] {
  const leftLines = splitLines(leftSource);
  const rightLines = splitLines(rightSource);
  const table = buildLcsTable(leftLines, rightLines);
  const diff: DiffLine[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    if (leftIndex < leftLines.length && rightIndex < rightLines.length && leftLines[leftIndex] === rightLines[rightIndex]) {
      diff.push({
        kind: "unchanged",
        content: leftLines[leftIndex] ?? "",
        leftNumber: leftIndex + 1,
        rightNumber: rightIndex + 1,
      });
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    if (
      rightIndex < rightLines.length &&
      (leftIndex >= leftLines.length || table[leftIndex][rightIndex + 1] >= table[leftIndex + 1][rightIndex])
    ) {
      diff.push({
        kind: "added",
        content: rightLines[rightIndex] ?? "",
        rightNumber: rightIndex + 1,
      });
      rightIndex += 1;
      continue;
    }

    if (leftIndex < leftLines.length) {
      diff.push({
        kind: "removed",
        content: leftLines[leftIndex] ?? "",
        leftNumber: leftIndex + 1,
      });
      leftIndex += 1;
    }
  }

  return diff;
}

function splitLines(source: string): readonly string[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  return lines.at(-1) === "" ? lines.slice(0, -1) : lines;
}

function buildLcsTable(
  leftLines: readonly string[],
  rightLines: readonly string[],
): readonly (readonly number[])[] {
  const table = Array.from({ length: leftLines.length + 1 }, () =>
    Array.from({ length: rightLines.length + 1 }, () => 0),
  );

  for (let leftIndex = leftLines.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightLines.length - 1; rightIndex >= 0; rightIndex -= 1) {
      table[leftIndex][rightIndex] =
        leftLines[leftIndex] === rightLines[rightIndex]
          ? table[leftIndex + 1][rightIndex + 1] + 1
          : Math.max(table[leftIndex + 1][rightIndex], table[leftIndex][rightIndex + 1]);
    }
  }

  return table;
}

function lineMarker(kind: DiffLine["kind"]): string {
  if (kind === "added") {
    return "+";
  }
  if (kind === "removed") {
    return "-";
  }
  return " ";
}
