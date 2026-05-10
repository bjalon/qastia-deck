var re = (o) => {
  throw TypeError(o);
};
var G = (o, t, s) => t.has(o) || re("Cannot " + s);
var R = (o, t, s) => (G(o, t, "read from private field"), s ? s.call(o) : t.get(o)), $ = (o, t, s) => t.has(o) ? re("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(o) : t.set(o, s), _ = (o, t, s, c) => (G(o, t, "write to private field"), c ? c.call(o, s) : t.set(o, s), s), f = (o, t, s) => (G(o, t, "access private method"), s);
import { PersistenceError as ae, RepositoryNotFoundError as W, BranchAlreadyExistsError as he, RevisionNotFoundError as z, TagNotFoundError as le, TagRevisionMismatchError as me, TagAlreadyExistsError as ve, DirtyHeadError as ge, RepositoryAlreadyExistsError as ie, BranchNotFoundError as P, ConcurrencyConflictError as ue, createRepository as fe, defineGraph as ye, singleton as be } from "@bjalon/object-vcs-core";
import { z as i } from "zod";
function we(o = {}) {
  const s = `${o.namespace ?? "deck-runtime-object-vcs"}:v1`, c = o.now ?? (() => (/* @__PURE__ */ new Date()).toISOString());
  function m() {
    var a;
    const e = (a = te()) == null ? void 0 : a.getItem(s);
    if (!e)
      return { schemaVersion: 1, repos: {} };
    try {
      const r = JSON.parse(e);
      return r.schemaVersion === 1 && Re(r.repos) ? r : { schemaVersion: 1, repos: {} };
    } catch {
      return { schemaVersion: 1, repos: {} };
    }
  }
  function b(e) {
    const a = te();
    if (!a)
      throw new ae("localStorage is unavailable.");
    a.setItem(s, JSON.stringify(e));
  }
  function u(e) {
    const a = m(), r = e(a);
    return b(a), r;
  }
  function w(e) {
    const a = m().repos[e];
    if (!a)
      throw new W(`Repository "${e}" was not found.`);
    return a;
  }
  function A(e, a) {
    const r = e.repos[a];
    if (!r)
      throw new W(`Repository "${a}" was not found.`);
    return r;
  }
  function k(e, a) {
    const r = e.heads[a];
    if (!r)
      throw new P(`Branch "${a}" was not found.`);
    return r;
  }
  function x(e, a) {
    const r = e.branches[a];
    if (!r)
      throw new P(`Branch "${a}" was not found.`);
    return r;
  }
  function E(e, a) {
    const r = e.revisions[String(a)];
    if (!r)
      throw new z(`Revision "${a}" was not found.`);
    return r;
  }
  function J(e, a) {
    if (a !== void 0 && a !== e.stateHash)
      throw new ue(
        `Expected HEAD hash "${a}", got "${e.stateHash}".`
      );
  }
  function M(e, a, r, n, d, l) {
    const h = c(), y = {
      repoId: e.repo.repoId,
      branchName: a,
      status: "clean",
      headRevision: d,
      baseRevision: d,
      stateHash: n,
      state: v(r),
      updatedAt: h,
      ...l === void 0 ? {} : { updatedBy: l }
    }, I = x(e, a);
    return e.branches[a] = {
      ...I,
      headRevision: d,
      baseRevision: d,
      headStateHash: n,
      status: "clean",
      updatedAt: h,
      ...l === void 0 ? {} : { updatedBy: l }
    }, e.heads[a] = y, v(y);
  }
  const V = {
    async getRepo(e) {
      var a;
      return F(((a = m().repos[e.repoId]) == null ? void 0 : a.repo) ?? null);
    },
    async createRepo(e) {
      return u((a) => {
        if (a.repos[e.repoId])
          throw new ie(`Repository "${e.repoId}" already exists.`);
        const r = c(), n = {
          repoId: e.repoId,
          schemaVersion: e.schemaVersion,
          graphVersion: e.graphVersion,
          schemaFingerprint: e.schemaFingerprint,
          schemaFingerprintAlgorithm: e.schemaFingerprintAlgorithm,
          defaultBranch: e.defaultBranch,
          storageMode: e.storageMode,
          nextRevision: e.commit ? 2 : 1,
          createdAt: r,
          updatedAt: r
        }, d = {};
        let l;
        e.commit && (l = {
          repoId: e.repoId,
          revision: 1,
          parentRevision: null,
          branchName: e.defaultBranch,
          stateHash: e.stateHash,
          schemaVersion: e.schemaVersion,
          graphVersion: e.graphVersion,
          schemaFingerprint: e.schemaFingerprint,
          schemaFingerprintAlgorithm: e.schemaFingerprintAlgorithm,
          ...e.message === void 0 ? {} : { message: e.message },
          createdAt: r,
          ...e.author === void 0 ? {} : { createdBy: e.author },
          isEmptyRevision: !1,
          isCheckpoint: !0,
          snapshotRef: e.stateHash
        }, d[String(l.revision)] = {
          revision: l,
          state: v(e.initialState)
        });
        const h = (l == null ? void 0 : l.revision) ?? null, y = {
          repoId: e.repoId,
          name: e.defaultBranch,
          headRevision: h,
          baseRevision: h,
          headStateHash: e.stateHash,
          status: e.commit ? "clean" : "dirty",
          createdFromRevision: h,
          createdAt: r,
          updatedAt: r,
          ...e.author === void 0 ? {} : { createdBy: e.author },
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        }, I = {
          repoId: e.repoId,
          branchName: e.defaultBranch,
          status: e.commit ? "clean" : "dirty",
          headRevision: h,
          baseRevision: h,
          stateHash: e.stateHash,
          state: v(e.initialState),
          updatedAt: r,
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        }, B = {
          repo: n,
          branches: { [e.defaultBranch]: y },
          heads: { [e.defaultBranch]: I },
          revisions: d,
          tags: {}
        };
        return a.repos[e.repoId] = B, {
          repo: v(n),
          head: v(I),
          ...l === void 0 ? {} : { revision: v(l) }
        };
      });
    },
    async getBranch(e) {
      var a;
      return F(((a = m().repos[e.repoId]) == null ? void 0 : a.branches[e.branchName]) ?? null);
    },
    async getHead(e) {
      var a;
      return F(((a = m().repos[e.repoId]) == null ? void 0 : a.heads[e.branchName]) ?? null);
    },
    async listBranches(e) {
      return Object.values(w(e.repoId).branches).map(v);
    },
    async writeHead(e) {
      return u((a) => {
        const r = A(a, e.repoId), n = k(r, e.branchName);
        e.concurrency !== "last-write-wins" && J(n, e.expectedHeadHash);
        const d = c(), l = e.baseRevision ?? n.baseRevision, h = {
          repoId: e.repoId,
          branchName: e.branchName,
          status: "dirty",
          headRevision: null,
          baseRevision: l,
          stateHash: e.stateHash,
          state: v(e.state),
          updatedAt: d,
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        }, y = x(r, e.branchName);
        return r.branches[e.branchName] = {
          ...y,
          headRevision: null,
          baseRevision: l,
          headStateHash: e.stateHash,
          status: "dirty",
          updatedAt: d,
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        }, r.heads[e.branchName] = h, { head: v(h) };
      });
    },
    async createRevision(e) {
      return u((a) => {
        var T, O, Y, Z, q, ee;
        const r = A(a, e.repoId), n = k(r, e.branchName);
        if (J(n, e.expectedHeadHash), n.status === "clean" && n.headRevision !== null && n.stateHash === e.stateHash && e.allowEmpty !== !0) {
          const de = E(r, n.headRevision);
          return {
            revision: v(de.revision),
            head: v(n),
            created: !1
          };
        }
        const d = r.repo.nextRevision, l = c(), h = n.status === "clean" ? n.headRevision : n.baseRevision, y = h === null ? null : E(r, h).revision.stateHash, I = {
          repoId: e.repoId,
          revision: d,
          parentRevision: h,
          branchName: e.branchName,
          stateHash: e.stateHash,
          schemaVersion: e.schemaVersion ?? r.repo.schemaVersion,
          graphVersion: ((T = e.graphIdentity) == null ? void 0 : T.graphVersion) ?? e.graphVersion ?? r.repo.graphVersion,
          schemaFingerprint: ((O = e.graphIdentity) == null ? void 0 : O.schemaFingerprint) ?? r.repo.schemaFingerprint,
          schemaFingerprintAlgorithm: ((Y = e.graphIdentity) == null ? void 0 : Y.schemaFingerprintAlgorithm) ?? r.repo.schemaFingerprintAlgorithm,
          ...e.message === void 0 ? {} : { message: e.message },
          createdAt: l,
          ...e.author === void 0 ? {} : { createdBy: e.author },
          isEmptyRevision: y === e.stateHash,
          isCheckpoint: !0,
          snapshotRef: e.stateHash
        };
        r.revisions[String(d)] = {
          revision: I,
          state: v(e.state)
        }, r.repo = {
          ...r.repo,
          schemaVersion: e.schemaVersion ?? r.repo.schemaVersion,
          graphVersion: ((Z = e.graphIdentity) == null ? void 0 : Z.graphVersion) ?? e.graphVersion ?? r.repo.graphVersion,
          schemaFingerprint: ((q = e.graphIdentity) == null ? void 0 : q.schemaFingerprint) ?? r.repo.schemaFingerprint,
          schemaFingerprintAlgorithm: ((ee = e.graphIdentity) == null ? void 0 : ee.schemaFingerprintAlgorithm) ?? r.repo.schemaFingerprintAlgorithm,
          nextRevision: d + 1,
          updatedAt: l
        };
        const B = M(
          r,
          e.branchName,
          e.state,
          e.stateHash,
          d,
          e.author
        );
        return {
          revision: v(I),
          head: B,
          created: !0
        };
      });
    },
    async readRevision(e) {
      var a;
      return F(((a = m().repos[e.repoId]) == null ? void 0 : a.revisions[String(e.revision)]) ?? null);
    },
    async readRevisionState(e) {
      var a, r;
      return F(((r = (a = m().repos[e.repoId]) == null ? void 0 : a.revisions[String(e.revision)]) == null ? void 0 : r.state) ?? null);
    },
    async listRevisions(e) {
      return Object.values(w(e.repoId).revisions).map((r) => r.revision).filter((r) => e.branchName === void 0 || r.branchName === e.branchName).filter((r) => e.after === void 0 || r.revision > e.after).sort(
        (r, n) => e.order === "asc" ? r.revision - n.revision : n.revision - r.revision
      ).slice(0, e.limit).map(v);
    },
    async createTag(e) {
      return u((a) => {
        const r = A(a, e.repoId);
        if (r.tags[e.name] && e.overwrite !== !0)
          throw new ve(`Tag "${e.name}" already exists.`);
        const n = e.branchName ?? r.repo.defaultBranch;
        let d = e.revision === void 0 || e.revision === "HEAD" ? k(r, n).headRevision : e.revision;
        if (e.revision === void 0 || e.revision === "HEAD") {
          const h = k(r, n);
          if (h.status === "dirty") {
            if (e.createRevisionIfDirty === !1)
              throw new ge("Cannot tag a dirty HEAD when createRevisionIfDirty is false.");
            const y = r.repo.nextRevision, I = c(), B = h.baseRevision, T = B === null ? null : E(r, B).revision.stateHash, O = {
              repoId: e.repoId,
              revision: y,
              parentRevision: B,
              branchName: n,
              stateHash: h.stateHash,
              schemaVersion: r.repo.schemaVersion,
              graphVersion: r.repo.graphVersion,
              schemaFingerprint: r.repo.schemaFingerprint,
              schemaFingerprintAlgorithm: r.repo.schemaFingerprintAlgorithm,
              message: `Create revision for tag ${e.name}`,
              createdAt: I,
              ...e.author === void 0 ? {} : { createdBy: e.author },
              isEmptyRevision: T === h.stateHash,
              isCheckpoint: !0,
              snapshotRef: h.stateHash
            };
            r.revisions[String(y)] = {
              revision: O,
              state: v(h.state)
            }, r.repo = {
              ...r.repo,
              nextRevision: y + 1,
              updatedAt: I
            }, M(r, n, h.state, h.stateHash, y, e.author), d = y;
          }
        }
        if (d === null)
          throw new z("Cannot tag a dirty HEAD directly.");
        E(r, d);
        const l = {
          repoId: e.repoId,
          name: e.name,
          revision: d,
          ...e.annotation === void 0 ? {} : { annotation: e.annotation },
          createdAt: c(),
          ...e.author === void 0 ? {} : { createdBy: e.author }
        };
        return r.tags[e.name] = l, v(l);
      });
    },
    async listTags(e) {
      return Object.values(w(e.repoId).tags).map(v);
    },
    async deleteTag(e) {
      return u((a) => {
        const r = A(a, e.repoId), n = r.tags[e.name];
        if (!n) {
          if ((e.missing ?? "throw") === "ignore")
            return {
              deleted: !1,
              name: e.name,
              previousRevision: null
            };
          throw new le(`Tag "${e.name}" was not found.`);
        }
        if (e.expectedRevision !== void 0 && n.revision !== e.expectedRevision)
          throw new me(
            `Tag "${e.name}" points to revision "${n.revision}", not "${e.expectedRevision}".`
          );
        return delete r.tags[e.name], {
          deleted: !0,
          name: e.name,
          previousRevision: n.revision
        };
      });
    },
    async createBranch(e) {
      return u((a) => {
        const r = A(a, e.repoId);
        if (r.branches[e.name])
          throw new he(`Branch "${e.name}" already exists.`);
        const n = e.from === "HEAD" ? k(r, e.sourceBranch ?? r.repo.defaultBranch).headRevision : e.from;
        if (n === null)
          throw new z("Cannot create a branch from a dirty HEAD.");
        const d = E(r, n), l = c(), h = {
          repoId: e.repoId,
          name: e.name,
          headRevision: n,
          baseRevision: n,
          headStateHash: d.revision.stateHash,
          status: "clean",
          createdFromRevision: n,
          createdAt: l,
          updatedAt: l,
          ...e.author === void 0 ? {} : { createdBy: e.author },
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        }, y = {
          repoId: e.repoId,
          branchName: e.name,
          status: "clean",
          headRevision: n,
          baseRevision: n,
          stateHash: d.revision.stateHash,
          state: v(d.state),
          updatedAt: l,
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        };
        return r.branches[e.name] = h, r.heads[e.name] = y, v(h);
      });
    },
    async updateBranch(e) {
      return u((a) => {
        const r = A(a, e.repoId), d = {
          ...x(r, e.branchName),
          headRevision: e.headRevision,
          baseRevision: e.baseRevision,
          headStateHash: e.headStateHash,
          status: e.status,
          updatedAt: c(),
          ...e.author === void 0 ? {} : { updatedBy: e.author }
        };
        return r.branches[e.branchName] = d, v(d);
      });
    },
    async restoreRevision(e) {
      return e.commit === !0 ? { head: (await V.createRevision({
        repoId: e.repoId,
        branchName: e.branchName,
        state: e.state,
        stateHash: e.stateHash,
        ...e.message === void 0 ? {} : { message: e.message },
        ...e.author === void 0 ? {} : { author: e.author },
        ...e.expectedHeadHash === void 0 ? {} : { expectedHeadHash: e.expectedHeadHash }
      })).head } : V.writeHead({
        repoId: e.repoId,
        branchName: e.branchName,
        state: e.state,
        stateHash: e.stateHash,
        ...e.author === void 0 ? {} : { author: e.author },
        ...e.expectedHeadHash === void 0 ? {} : { expectedHeadHash: e.expectedHeadHash }
      });
    },
    async resetBranch(e) {
      if (e.mode !== "hard")
        throw new ae('resetBranch only supports mode "hard".');
      return u((a) => {
        const r = A(a, e.repoId), n = k(r, e.branchName);
        J(n, e.expectedHeadHash);
        const d = E(r, e.to);
        return M(
          r,
          e.branchName,
          d.state,
          d.revision.stateHash,
          e.to,
          e.author
        ), v(x(r, e.branchName));
      });
    },
    subscribeHead(e, a) {
      return V.getHead(e).then((r) => {
        r && a(r);
      }), () => {
      };
    },
    subscribeRevisions(e, a) {
      return V.listRevisions(e).then(a), () => {
      };
    },
    subscribeTags(e, a) {
      return V.listTags(e).then(a), () => {
      };
    },
    subscribeBranches(e, a) {
      return V.listBranches(e).then(a), () => {
      };
    }
  };
  return V;
}
function te() {
  return typeof window > "u" ? void 0 : window.localStorage;
}
function v(o) {
  return JSON.parse(JSON.stringify(o));
}
function F(o) {
  return o === null ? null : v(o);
}
function Re(o) {
  return typeof o == "object" && o !== null && !Array.isArray(o);
}
const se = "deck-runtime-object-vcs@1", H = "main", ce = "deck-version/", X = i.object({
  uri: i.string().optional(),
  content: i.string()
}).strict(), pe = i.object({
  code: i.string(),
  severity: i.enum(["error", "warning", "info"]),
  count: i.number().int().nonnegative()
}).strict(), Ie = i.object({
  deckId: i.string(),
  namespace: i.string(),
  schemaVersion: i.literal(1),
  updatedAtIso: i.string(),
  source: X,
  sourceHash: i.string(),
  selectedSlideId: i.string().optional()
}).strict(), He = i.object({
  deckId: i.string(),
  namespace: i.string(),
  schemaVersion: i.literal(1),
  updatedAtIso: i.string(),
  sessionId: i.string(),
  source: X,
  sourceHash: i.string(),
  selectedSlideId: i.string().optional(),
  compilerStatus: i.enum(["valid", "degraded", "invalid"])
}).strict(), Se = i.object({
  id: i.string(),
  deckId: i.string(),
  namespace: i.string(),
  schemaVersion: i.literal(1),
  createdAtIso: i.string(),
  label: i.string().optional(),
  reason: i.enum([
    "manual",
    "autosave",
    "before-layout-change",
    "before-slide-delete",
    "before-version-restore",
    "crash-recovery",
    "import",
    "external-save"
  ]),
  source: X,
  sourceHash: i.string(),
  selectedSlideId: i.string().optional(),
  compilerStatus: i.enum(["valid", "degraded", "invalid"]),
  diagnosticsSummary: i.array(pe)
}).strict(), Ae = i.object({
  current: Ie.nullable(),
  draft: He.nullable(),
  version: Se.nullable()
}).strict(), Ve = ye({
  deck: be(Ae)
});
var S, p, g, C, K, N, D, Q;
class xe {
  constructor(t = {}) {
    $(this, g);
    $(this, S);
    $(this, p);
    _(this, S, t.persistence ?? we({
      namespace: t.storageNamespace ?? "deck-runtime-object-vcs"
    })), _(this, p, t.author ?? "Deck Runtime");
  }
  async loadCurrent(t) {
    const s = await f(this, g, K).call(this, t);
    return (s == null ? void 0 : s.state.deck.current) ?? null;
  }
  async saveCurrent(t) {
    return f(this, g, C).call(this, t, (s) => ({
      ...s,
      current: t
    }));
  }
  async saveDraft(t) {
    return f(this, g, C).call(this, t, (s) => ({
      ...s,
      draft: t
    }));
  }
  async loadDraft(t) {
    const s = await f(this, g, K).call(this, t);
    return (s == null ? void 0 : s.state.deck.draft) ?? null;
  }
  async clearDraft(t) {
    return f(this, g, C).call(this, t, (s) => ({
      ...s,
      draft: null
    }));
  }
  async createVersion(t) {
    try {
      const s = await f(this, g, D).call(this, t, oe(t)), m = {
        ...(await s.getHead({ branch: H })).state.deck,
        current: oe(t),
        version: Be(t)
      };
      await s.update(
        () => ({ deck: m }),
        {
          branch: H,
          commit: !1,
          message: t.label ?? ne(t.reason),
          author: R(this, p),
          concurrency: "last-write-wins"
        }
      );
      const b = await s.commit({
        branch: H,
        allowEmpty: !0,
        message: t.label ?? ne(t.reason),
        author: R(this, p)
      });
      return b.revision && await s.tag(L(t.id), {
        revision: b.revision.revision,
        overwrite: !0,
        annotation: t.reason,
        author: R(this, p)
      }), { status: "success" };
    } catch (s) {
      return U(s);
    }
  }
  async listVersions(t) {
    try {
      const s = await f(this, g, N).call(this, t);
      if (!s)
        return [];
      const m = (await s.listTags()).filter((u) => u.name.startsWith(ce)).sort((u, w) => w.createdAt.localeCompare(u.createdAt));
      return (await Promise.all(
        m.map(async (u) => {
          const w = await s.readRevision(u.revision, { migrateTo: "current" });
          return Ne(w.deck.version);
        })
      )).filter((u) => u !== null).sort((u, w) => w.createdAtIso.localeCompare(u.createdAtIso));
    } catch {
      return [];
    }
  }
  async loadVersion(t) {
    var s;
    try {
      const c = await f(this, g, N).call(this, t);
      if (!c)
        return null;
      const m = (await c.listTags()).find((u) => u.name === L(t.versionId));
      if (!m)
        return null;
      const b = await c.readRevision(m.revision, { migrateTo: "current" });
      return ((s = b.deck.version) == null ? void 0 : s.id) === t.versionId ? b.deck.version : null;
    } catch {
      return null;
    }
  }
  async deleteVersion(t) {
    try {
      const s = await f(this, g, N).call(this, t);
      return s ? (await s.deleteTag(L(t.versionId), { missing: "ignore", author: R(this, p) }), { status: "success" }) : { status: "success" };
    } catch (s) {
      return U(s);
    }
  }
  async getRepository(t) {
    return f(this, g, D).call(this, t);
  }
  async getHistory(t) {
    const s = await f(this, g, N).call(this, t);
    if (!s)
      return {
        head: null,
        revisions: [],
        tags: [],
        branches: []
      };
    const [c, m, b, u] = await Promise.all([
      s.getHead({ branch: H }).catch((w) => {
        if (w instanceof P)
          return null;
        throw w;
      }),
      s.listRevisions({ limit: 100 }),
      s.listTags(),
      s.listBranches()
    ]);
    return { head: c, revisions: m, tags: b, branches: u };
  }
  async restoreRevision(t) {
    const s = await f(this, g, N).call(this, t);
    if (!s)
      return null;
    const m = (await s.readRevision(t.revision, { migrateTo: "current" })).deck.version;
    return m ? (await s.restore(t.revision, {
      branch: H,
      commit: !1,
      author: R(this, p)
    }), m) : null;
  }
}
S = new WeakMap(), p = new WeakMap(), g = new WeakSet(), C = async function(t, s) {
  try {
    const c = await f(this, g, D).call(this, t), m = await c.getHead({ branch: H });
    return await c.update(
      () => ({ deck: s(m.state.deck) }),
      {
        branch: H,
        commit: !1,
        author: R(this, p),
        concurrency: "last-write-wins"
      }
    ), { status: "success" };
  } catch (c) {
    return U(c);
  }
}, K = async function(t) {
  const s = await f(this, g, N).call(this, t);
  if (!s)
    return null;
  try {
    return await s.getHead({ branch: H });
  } catch (c) {
    if (c instanceof P)
      return null;
    throw c;
  }
}, N = async function(t) {
  const s = f(this, g, Q).call(this, t);
  try {
    await R(this, S).getRepo({ repoId: j(t) });
  } catch (m) {
    if (m instanceof W)
      return null;
    throw m;
  }
  return await R(this, S).getRepo({ repoId: j(t) }) ? s : null;
}, D = async function(t, s = null) {
  const c = f(this, g, Q).call(this, t);
  if (await R(this, S).getRepo({ repoId: j(t) }))
    return c;
  try {
    await c.init({
      branch: H,
      initialState: {
        deck: {
          current: s,
          draft: null,
          version: null
        }
      },
      commit: !0,
      message: "Initial deck repository",
      author: R(this, p)
    });
  } catch (b) {
    if (!(b instanceof ie))
      throw b;
  }
  return c;
}, Q = function(t) {
  return fe({
    repoId: j(t),
    graph: Ve,
    schemaVersion: 1,
    graphVersion: se,
    schemaFingerprint: `manual:${se}`,
    schemaFingerprintAlgorithm: "manual",
    defaultBranch: H,
    persistence: R(this, S)
  });
};
function j(o) {
  return `${o.namespace}:${o.deckId}`;
}
function Be(o) {
  const { limits: t, ...s } = o;
  return s;
}
function oe(o) {
  return {
    deckId: o.deckId,
    namespace: o.namespace,
    schemaVersion: 1,
    updatedAtIso: o.createdAtIso,
    source: o.source,
    sourceHash: o.sourceHash,
    selectedSlideId: o.selectedSlideId
  };
}
function Ne(o) {
  return o ? {
    id: o.id,
    deckId: o.deckId,
    namespace: o.namespace,
    schemaVersion: o.schemaVersion,
    createdAtIso: o.createdAtIso,
    label: o.label,
    reason: o.reason,
    sourceHash: o.sourceHash,
    selectedSlideId: o.selectedSlideId,
    compilerStatus: o.compilerStatus,
    sizeBytes: JSON.stringify(o).length
  } : null;
}
function L(o) {
  return `${ce}${o}`;
}
function ne(o) {
  return o === "autosave" ? "Autosave" : o === "manual" ? "Manual version" : o === "external-save" ? "External save" : o === "crash-recovery" ? "Crash recovery" : o.startsWith("before-") ? "Safety checkpoint" : "Import";
}
function U(o) {
  return {
    status: "failed",
    diagnostics: [
      {
        code: "STORAGE_VERSION_CORRUPTED",
        severity: "warning",
        message: o instanceof Error ? o.message : "Unable to write deck state to Object VCS."
      }
    ]
  };
}
export {
  xe as ObjectVcsDeckPersistenceAdapter
};
