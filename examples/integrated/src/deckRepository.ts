import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import type { DeckSource } from "../../../src";
import { hashSource } from "../../../src/compiler/hash";

export const exampleDeckSchemaVersion = 1;

export type ExampleDeckRecord = {
  readonly schemaVersion: typeof exampleDeckSchemaVersion;
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly source: string;
  readonly ownerUid: string;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
  readonly createdByEmail: string | null;
  readonly updatedByEmail: string | null;
  readonly releaseCount: number;
  readonly latestReleaseId: string | null;
  readonly latestReleaseNumber: number;
  readonly deletedAtIso: string | null;
};

export type ExampleDeckReleaseRecord = {
  readonly schemaVersion: typeof exampleDeckSchemaVersion;
  readonly id: string;
  readonly deckId: string;
  readonly releaseNumber: number;
  readonly label: string;
  readonly notes: string;
  readonly source: string;
  readonly sourceHash: string;
  readonly createdAtIso: string;
  readonly createdByUid: string;
  readonly createdByEmail: string | null;
};

export type ExampleDeckActor = {
  readonly uid: string;
  readonly email: string | null;
};

export type ExampleDeckImportPayload = {
  readonly schemaVersion: typeof exampleDeckSchemaVersion;
  readonly exportedAtIso: string;
  readonly decks: readonly ExampleDeckRecord[];
};

const decksCollection = "deckRuntimeExampleDecks";
const releasesCollection = "releases";

export async function listDecks(db: Firestore, ownerUid: string): Promise<readonly ExampleDeckRecord[]> {
  const snapshot = await getDocs(
    query(collection(db, decksCollection), where("ownerUid", "==", ownerUid)),
  );

  return snapshot.docs
    .map((deckSnapshot) => normalizeDeck(deckSnapshot.id, deckSnapshot.data()))
    .filter((deck) => deck.deletedAtIso === null)
    .sort((left, right) => right.updatedAtIso.localeCompare(left.updatedAtIso));
}

export async function createDeck(
  db: Firestore,
  actor: ExampleDeckActor,
  source: DeckSource,
): Promise<ExampleDeckRecord> {
  const now = new Date().toISOString();
  const parsedTitle = extractDeckTitle(source.content);
  const draftRef = doc(collection(db, decksCollection));
  const deck: ExampleDeckRecord = {
    schemaVersion: exampleDeckSchemaVersion,
    id: draftRef.id,
    title: parsedTitle,
    slug: createSlug(parsedTitle),
    description: "",
    source: source.content,
    ownerUid: actor.uid,
    createdAtIso: now,
    updatedAtIso: now,
    createdByEmail: actor.email,
    updatedByEmail: actor.email,
    releaseCount: 0,
    latestReleaseId: null,
    latestReleaseNumber: 0,
    deletedAtIso: null,
  };

  await setDoc(draftRef, deck);
  return deck;
}

export async function saveDeck(
  db: Firestore,
  actor: ExampleDeckActor,
  deck: ExampleDeckRecord,
  source: DeckSource,
): Promise<ExampleDeckRecord> {
  const now = new Date().toISOString();
  const title = extractDeckTitle(source.content) || deck.title;
  const nextDeck: ExampleDeckRecord = {
    ...deck,
    title,
    slug: deck.slug || createSlug(title),
    source: source.content,
    updatedAtIso: now,
    updatedByEmail: actor.email,
  };

  await setDoc(doc(db, decksCollection, deck.id), nextDeck);
  return nextDeck;
}

export async function deleteDeck(db: Firestore, deck: ExampleDeckRecord): Promise<void> {
  await setDoc(doc(db, decksCollection, deck.id), {
    ...deck,
    deletedAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
  });
}

export async function createDeckRelease(
  db: Firestore,
  actor: ExampleDeckActor,
  deck: ExampleDeckRecord,
  source: DeckSource,
  label: string,
): Promise<{ readonly deck: ExampleDeckRecord; readonly release: ExampleDeckReleaseRecord }> {
  const nextReleaseNumber = deck.latestReleaseNumber + 1;
  const releaseRef = doc(collection(db, decksCollection, deck.id, releasesCollection));
  const now = new Date().toISOString();
  const release: ExampleDeckReleaseRecord = {
    schemaVersion: exampleDeckSchemaVersion,
    id: releaseRef.id,
    deckId: deck.id,
    releaseNumber: nextReleaseNumber,
    label: label.trim() || `Release ${nextReleaseNumber}`,
    notes: "",
    source: source.content,
    sourceHash: hashSource(source.content),
    createdAtIso: now,
    createdByUid: actor.uid,
    createdByEmail: actor.email,
  };
  const nextDeck = await saveDeck(db, actor, {
    ...deck,
    releaseCount: deck.releaseCount + 1,
    latestReleaseId: release.id,
    latestReleaseNumber: nextReleaseNumber,
  }, source);

  await setDoc(releaseRef, release);
  await setDoc(doc(db, decksCollection, deck.id), {
    ...nextDeck,
    releaseCount: deck.releaseCount + 1,
    latestReleaseId: release.id,
    latestReleaseNumber: nextReleaseNumber,
  });

  return {
    deck: {
      ...nextDeck,
      releaseCount: deck.releaseCount + 1,
      latestReleaseId: release.id,
      latestReleaseNumber: nextReleaseNumber,
    },
    release,
  };
}

export async function listDeckReleases(
  db: Firestore,
  deckId: string,
): Promise<readonly ExampleDeckReleaseRecord[]> {
  const snapshot = await getDocs(
    query(
      collection(db, decksCollection, deckId, releasesCollection),
      orderBy("releaseNumber", "desc"),
    ),
  );

  return snapshot.docs.map((releaseSnapshot) =>
    normalizeRelease(releaseSnapshot.id, deckId, releaseSnapshot.data()),
  );
}

export async function exportDecks(
  db: Firestore,
  ownerUid: string,
): Promise<ExampleDeckImportPayload> {
  return {
    schemaVersion: exampleDeckSchemaVersion,
    exportedAtIso: new Date().toISOString(),
    decks: await listDecks(db, ownerUid),
  };
}

export async function importDecks(
  db: Firestore,
  actor: ExampleDeckActor,
  payload: ExampleDeckImportPayload,
): Promise<void> {
  if (payload.schemaVersion !== exampleDeckSchemaVersion || !Array.isArray(payload.decks)) {
    throw new Error("Format d'import incompatible.");
  }

  await Promise.all(
    payload.decks.map(async (deck) => {
      const deckRef = deck.id ? doc(db, decksCollection, deck.id) : doc(collection(db, decksCollection));
      const now = new Date().toISOString();
      await setDoc(deckRef, {
        ...deck,
        schemaVersion: exampleDeckSchemaVersion,
        id: deckRef.id,
        ownerUid: actor.uid,
        updatedAtIso: now,
        updatedByEmail: actor.email,
        deletedAtIso: null,
      } satisfies ExampleDeckRecord);
    }),
  );
}

export async function hardDeleteDeck(db: Firestore, deckId: string): Promise<void> {
  await deleteDoc(doc(db, decksCollection, deckId));
}

function normalizeDeck(id: string, value: Record<string, unknown>): ExampleDeckRecord {
  return {
    schemaVersion: exampleDeckSchemaVersion,
    id,
    title: readString(value.title, "Deck sans titre"),
    slug: readString(value.slug, id),
    description: readString(value.description, ""),
    source: readString(value.source, ""),
    ownerUid: readString(value.ownerUid, ""),
    createdAtIso: readString(value.createdAtIso, new Date().toISOString()),
    updatedAtIso: readString(value.updatedAtIso, new Date().toISOString()),
    createdByEmail: readNullableString(value.createdByEmail),
    updatedByEmail: readNullableString(value.updatedByEmail),
    releaseCount: readNumber(value.releaseCount, 0),
    latestReleaseId: readNullableString(value.latestReleaseId),
    latestReleaseNumber: readNumber(value.latestReleaseNumber, 0),
    deletedAtIso: readNullableString(value.deletedAtIso),
  };
}

function normalizeRelease(
  id: string,
  deckId: string,
  value: Record<string, unknown>,
): ExampleDeckReleaseRecord {
  return {
    schemaVersion: exampleDeckSchemaVersion,
    id,
    deckId,
    releaseNumber: readNumber(value.releaseNumber, 0),
    label: readString(value.label, `Release ${readNumber(value.releaseNumber, 0)}`),
    notes: readString(value.notes, ""),
    source: readString(value.source, ""),
    sourceHash: readString(value.sourceHash, ""),
    createdAtIso: readString(value.createdAtIso, new Date().toISOString()),
    createdByUid: readString(value.createdByUid, ""),
    createdByEmail: readNullableString(value.createdByEmail),
  };
}

export function deckSourceFromRecord(deck: ExampleDeckRecord): DeckSource {
  return {
    uri: `firebase://deckRuntimeExampleDecks/${deck.id}.yml`,
    content: deck.source,
  };
}

export function extractDeckTitle(source: string): string {
  const match = /^\s*title\s*:\s*["']?(.+?)["']?\s*$/mu.exec(source);
  return match?.[1]?.trim() || "Nouveau deck";
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72) || "deck";
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
