#!/usr/bin/env bun
/**
 * @added   SESSION_0732 (2026-08-01)
 * @why     Mechanically reject new direct RankAward read roots after the RankEntry read collapse
 * @wired   scripts/githooks/pre-commit, .github/workflows/ci.yml, rank-award-read-guard.test.ts
 *
 * RankAward remains a temporary write and promotion-fact anchor until #380. The scanner compares
 * semantic TypeScript AST occurrences between Git trees: existing fact joins and pure renames stay
 * green, writes are excluded structurally, and a changed/new direct read must be reviewed.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

type Mode =
  | { kind: "base"; ref: string }
  | { kind: "staged" }
  | { candidate: string; kind: "fixture" };

export type ReadRoot = {
  fingerprint: string;
  kind: string;
  line: number;
};

type LocatedReadRoot = ReadRoot & { path: string };
type Binding = {
  delegateAlias: boolean;
  initializer?: ts.Expression;
  name: string;
  scope: ts.Node;
};

const SOURCE_PATH = /^apps\/web\/.*\.(?:[cm]?[jt]sx?)$/;
const EXCLUDED_PATH = /(?:^|\/)(?:generated|migrations|node_modules|\.next)(?:\/|$)/;
const ALLOW_COMMENT = /^\s*\/\/\s*rank-read-guard: allow -- \S.*$/;
const READ_METHODS = new Set([
  "findUniqueOrThrow",
  "findUnique",
  "findFirstOrThrow",
  "findFirst",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);
const RANK_AWARD_RELATIONS = new Set([
  "rankAwardsEarned",
  "rankAwardsPromoted",
  "rankAwards",
  "rankAward",
]);
const RELATION_QUERY_KEYS = new Set([
  "select",
  "include",
  "where",
  "orderBy",
  "some",
  "none",
  "every",
  "is",
  "isNot",
]);

function staticPropertyName(node: ts.Node): string | null {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node)) {
    const argument = node.argumentExpression;
    return argument &&
      (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
      ? argument.text
      : null;
  }
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    return node.text;
  return null;
}

function accessReceiver(node: ts.Node): ts.Expression | null {
  return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)
    ? node.expression
    : null;
}

function immediatelyPrecedingAllowComment(sourceFile: ts.SourceFile, node: ts.Node): boolean {
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line;
  if (line === 0) return false;
  return ALLOW_COMMENT.test(sourceFile.text.split(/\r?\n/)[line - 1] ?? "");
}

function semanticText(node: ts.Node, sourceFile: ts.SourceFile): string {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    true,
    sourceFile.languageVariant,
    node.getText(sourceFile),
  );
  const tokens: string[] = [];
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    tokens.push(scanner.getTokenText());
  }
  return tokens.join(" ");
}

function isPrismaQueryType(node: ts.TypeNode): boolean {
  const text = node.getText();
  return /(?:^|\.)Prisma\..*(?:Select|Include|WhereInput|OrderBy.*Input)(?:<.*>)?$/.test(text);
}

function unwrapExpression(node: ts.Expression): ts.Expression {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  ) {
    return unwrapExpression(node.expression);
  }
  return node;
}

function isExportedVariable(node: ts.VariableDeclaration): boolean {
  const statement = node.parent.parent;
  return (
    ts.isVariableStatement(statement) &&
    statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) === true
  );
}

function hasExportedRelationQueryShape(expression: ts.Expression): boolean {
  let found = false;
  const inspect = (node: ts.Node) => {
    if (found) return;
    if (ts.isPropertyAssignment(node)) {
      const name = staticPropertyName(node.name);
      if (name && RANK_AWARD_RELATIONS.has(name)) {
        const value = unwrapExpression(node.initializer);
        if (value.kind === ts.SyntaxKind.TrueKeyword) {
          found = true;
          return;
        }
        if (
          ts.isObjectLiteralExpression(value) &&
          value.properties.some((property) => {
            if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
              return false;
            }
            const key = staticPropertyName(property.name);
            return key !== null && RELATION_QUERY_KEYS.has(key);
          })
        ) {
          found = true;
          return;
        }
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(expression);
  return found;
}

function isLexicalScope(node: ts.Node): boolean {
  return (
    ts.isSourceFile(node) || ts.isBlock(node) || ts.isModuleBlock(node) || ts.isCaseBlock(node)
  );
}

class BindingIndex {
  readonly #bindings = new Map<string, Binding[]>();

  constructor(private readonly sourceFile: ts.SourceFile) {
    this.#indexTree(sourceFile);
  }

  resolve(identifier: ts.Identifier): Binding | null {
    const candidates = this.#bindings.get(identifier.text);
    if (!candidates) return null;
    for (let current: ts.Node | undefined = identifier; current; current = current.parent) {
      if (!isLexicalScope(current)) continue;
      const binding = candidates.find((candidate) => candidate.scope === current);
      if (binding) return binding;
    }
    return null;
  }

  delegateModel(expression: ts.Expression, resolving = new Set<Binding>()): string | null {
    const receiver = unwrapExpression(expression);
    const direct = staticPropertyName(receiver);
    if (direct === "rankAward" || !ts.isIdentifier(receiver)) return direct;
    return this.#delegateModelFromBinding(receiver, resolving) ?? direct;
  }

  #delegateModelFromBinding(identifier: ts.Identifier, resolving: Set<Binding>): string | null {
    const binding = this.resolve(identifier);
    if (!binding || resolving.has(binding)) return null;
    if (binding.delegateAlias) return "rankAward";
    if (!binding.initializer) return null;
    resolving.add(binding);
    return this.delegateModel(binding.initializer, resolving);
  }

  #indexTree(node: ts.Node): void {
    if (ts.isVariableDeclaration(node)) this.#indexVariable(node);
    ts.forEachChild(node, (child) => this.#indexTree(child));
  }

  #indexVariable(node: ts.VariableDeclaration): void {
    if (ts.isIdentifier(node.name) && node.initializer) {
      this.#add({
        delegateAlias: staticPropertyName(unwrapExpression(node.initializer)) === "rankAward",
        initializer: node.initializer,
        name: node.name.text,
        scope: this.#enclosingScope(node),
      });
      return;
    }
    if (ts.isObjectBindingPattern(node.name)) this.#indexBindingPattern(node);
  }

  #indexBindingPattern(node: ts.VariableDeclaration): void {
    if (!ts.isObjectBindingPattern(node.name)) return;
    for (const element of node.name.elements) {
      const sourceName = staticPropertyName(element.propertyName ?? element.name);
      if (sourceName !== "rankAward" || !ts.isIdentifier(element.name)) continue;
      this.#add({
        delegateAlias: true,
        name: element.name.text,
        scope: this.#enclosingScope(node),
      });
    }
  }

  #enclosingScope(node: ts.Node): ts.Node {
    let current: ts.Node | undefined = node.parent;
    while (current && !isLexicalScope(current)) current = current.parent;
    return current ?? this.sourceFile;
  }

  #add(binding: Binding): void {
    const existing = this.#bindings.get(binding.name) ?? [];
    existing.push(binding);
    this.#bindings.set(binding.name, existing);
  }
}

class RankAwardRootCollector {
  readonly #roots: ReadRoot[] = [];
  readonly #resolvedBindings = new Set<Binding>();
  readonly #addedRoots = new Set<string>();
  readonly #bindings: BindingIndex;

  constructor(private readonly sourceFile: ts.SourceFile) {
    this.#bindings = new BindingIndex(sourceFile);
  }

  collect(): ReadRoot[] {
    this.#visit(this.sourceFile, false);
    return this.#roots.sort((a, b) => a.line - b.line || a.kind.localeCompare(b.kind));
  }

  #visit(node: ts.Node, inReadQuery: boolean): void {
    if (this.#visitCallNode(node)) return;
    this.#visitSharedIdentifier(node, inReadQuery);
    if (this.#visitVariableNode(node)) return;
    this.#visitRelationNode(node, inReadQuery);
    if (this.#visitPrismaAssertion(node)) return;
    ts.forEachChild(node, (child) => this.#visit(child, inReadQuery));
  }

  #visitCallNode(node: ts.Node): boolean {
    return ts.isCallExpression(node) && this.#visitQueryCall(node);
  }

  #visitSharedIdentifier(node: ts.Node, inReadQuery: boolean): void {
    if (inReadQuery && ts.isIdentifier(node)) this.#visitSharedQuery(node);
  }

  #visitVariableNode(node: ts.Node): boolean {
    return ts.isVariableDeclaration(node) && this.#visitQueryDeclaration(node);
  }

  #visitRelationNode(node: ts.Node, inReadQuery: boolean): void {
    if (inReadQuery && ts.isPropertyAssignment(node)) this.#recordRelation(node);
  }

  #visitQueryCall(node: ts.CallExpression): boolean {
    if (this.#isPrismaValidatorQuery(node)) {
      for (const argument of node.arguments) this.#visit(argument, true);
      return true;
    }
    const delegate = this.#readDelegate(node);
    if (!delegate) return false;
    if (delegate.model === "rankAward") this.#addRoot(node, `delegate:${delegate.method}`);
    this.#visit(node.expression, false);
    for (const argument of node.arguments) this.#visit(argument, true);
    return true;
  }

  #visitSharedQuery(node: ts.Identifier): void {
    const binding = this.#bindings.resolve(node);
    if (!binding?.initializer || this.#resolvedBindings.has(binding)) return;
    this.#resolvedBindings.add(binding);
    this.#visit(binding.initializer, true);
    this.#resolvedBindings.delete(binding);
  }

  #visitQueryDeclaration(node: ts.VariableDeclaration): boolean {
    if (this.#recordExportedDestructuredAlias(node)) return true;
    if (!node.initializer) return false;
    if (this.#isTypedPrismaQuery(node) || this.#isExportedQueryConstant(node)) {
      this.#visit(node.initializer, true);
      return true;
    }
    if (isExportedVariable(node) && this.#isRankAwardDelegate(node.initializer)) {
      this.#addRoot(node, "delegate-alias:rankAward");
      return true;
    }
    return false;
  }

  #recordExportedDestructuredAlias(node: ts.VariableDeclaration): boolean {
    if (!isExportedVariable(node) || !ts.isObjectBindingPattern(node.name)) return false;
    const aliases = node.name.elements.filter((element) => {
      const sourceName = staticPropertyName(element.propertyName ?? element.name);
      return sourceName === "rankAward";
    });
    for (const alias of aliases) this.#addRoot(alias, "delegate-alias:rankAward");
    return aliases.length > 0;
  }

  #isTypedPrismaQuery(node: ts.VariableDeclaration): boolean {
    return node.type !== undefined && isPrismaQueryType(node.type);
  }

  #isExportedQueryConstant(node: ts.VariableDeclaration): boolean {
    return isExportedVariable(node) && hasExportedRelationQueryShape(node.initializer!);
  }

  #isRankAwardDelegate(expression: ts.Expression): boolean {
    return staticPropertyName(unwrapExpression(expression)) === "rankAward";
  }

  #recordRelation(node: ts.PropertyAssignment): void {
    const relation = staticPropertyName(node.name);
    if (relation && RANK_AWARD_RELATIONS.has(relation)) {
      this.#addRoot(node, `relation:${relation}`);
    }
  }

  #visitPrismaAssertion(node: ts.Node): boolean {
    if (ts.isSatisfiesExpression(node) && isPrismaQueryType(node.type)) {
      this.#visit(node.expression, true);
      return true;
    }
    if (ts.isAsExpression(node) && isPrismaQueryType(node.type)) {
      this.#visit(node.expression, true);
      return true;
    }
    return false;
  }

  #readDelegate(node: ts.CallExpression): { method: string; model: string } | null {
    const method = staticPropertyName(node.expression);
    const receiver = accessReceiver(node.expression);
    const model = receiver ? this.#bindings.delegateModel(receiver) : null;
    return method && model && READ_METHODS.has(method) ? { method, model } : null;
  }

  #isPrismaValidatorQuery(node: ts.CallExpression): boolean {
    if (!ts.isCallExpression(node.expression)) return false;
    const validatorFactory = node.expression;
    return (
      staticPropertyName(validatorFactory.expression) === "validator" &&
      validatorFactory.typeArguments?.some(isPrismaQueryType) === true
    );
  }

  #addRoot(node: ts.Node, kind: string): void {
    if (immediatelyPrecedingAllowComment(this.sourceFile, node)) return;
    const rootKey = `${node.getStart(this.sourceFile)}:${kind}`;
    if (this.#addedRoots.has(rootKey)) return;
    this.#addedRoots.add(rootKey);
    this.#roots.push({
      fingerprint: `${kind}\0${semanticText(node, this.sourceFile)}`,
      kind,
      line: this.sourceFile.getLineAndCharacterOfPosition(node.getStart(this.sourceFile)).line + 1,
    });
  }
}

export function collectRankAwardReadRoots(source: string, path = "candidate.ts"): ReadRoot[] {
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  return new RankAwardRootCollector(sourceFile).collect();
}

function excessCandidateRoots(base: ReadRoot[], candidate: ReadRoot[]): ReadRoot[] {
  const available = new Map<string, number>();
  for (const root of base)
    available.set(root.fingerprint, (available.get(root.fingerprint) ?? 0) + 1);

  const excess: ReadRoot[] = [];
  for (const root of candidate) {
    const count = available.get(root.fingerprint) ?? 0;
    if (count === 0) excess.push(root);
    else available.set(root.fingerprint, count - 1);
  }
  return excess;
}

export function findNewRankAwardReadRoots(base: string, candidate: string): ReadRoot[] {
  return excessCandidateRoots(
    collectRankAwardReadRoots(base, "base.ts"),
    collectRankAwardReadRoots(candidate, "candidate.ts"),
  );
}

function runGit(args: string[], allowFailure = false): string {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0 && !allowFailure) {
    throw new Error([`git ${args.join(" ")} failed`, result.stderr].filter(Boolean).join("\n"));
  }
  return result.status === 0 ? result.stdout : "";
}

function parseMode(args: string[]): Mode {
  if (args.length === 1 && args[0] === "--staged") return { kind: "staged" };
  if (args.length === 2 && args[0] === "--base") return { kind: "base", ref: args[1]! };
  if (args.length === 2 && args[0] === "--fixture") return { kind: "fixture", candidate: args[1]! };
  throw new Error(
    "usage: bun scripts/rank-award-read-guard.ts --staged | --base <git-ref> | --fixture <path>",
  );
}

type ChangedPaths = { basePaths: string[]; candidatePaths: string[] };

function isScannedSource(path: string): boolean {
  return SOURCE_PATH.test(path) && !EXCLUDED_PATH.test(path);
}

function appendSource(paths: string[], path: string): void {
  if (isScannedSource(path)) paths.push(path);
}

function appendRenamedPaths(paths: ChangedPaths, oldPath: string, newPath: string): void {
  appendSource(paths.basePaths, oldPath);
  appendSource(paths.candidatePaths, newPath);
}

function appendOrdinaryPath(paths: ChangedPaths, status: string, path: string): void {
  if (!isScannedSource(path)) return;
  if (!status.startsWith("A")) paths.basePaths.push(path);
  if (!status.startsWith("D")) paths.candidatePaths.push(path);
}

function consumeChangedRecord(fields: string[], index: number, paths: ChangedPaths): number {
  const status = fields[index]!;
  if (status.startsWith("R") || status.startsWith("C")) {
    appendRenamedPaths(paths, fields[index + 1]!, fields[index + 2]!);
    return index + 3;
  }
  appendOrdinaryPath(paths, status, fields[index + 1]!);
  return index + 2;
}

function parseChangedPaths(output: string): ChangedPaths {
  const fields = output.split("\0").filter(Boolean);
  const paths: ChangedPaths = { basePaths: [], candidatePaths: [] };
  for (let index = 0; index < fields.length; ) index = consumeChangedRecord(fields, index, paths);
  return paths;
}

function changedTrees(mode: Exclude<Mode, { kind: "fixture" }>): {
  base: string;
  basePaths: string[];
  candidatePaths: string[];
} {
  const base = mode.kind === "staged" ? "HEAD" : runGit(["merge-base", mode.ref, "HEAD"]).trim();
  const diffArgs = mode.kind === "staged" ? ["diff", "--cached"] : ["diff", `${base}..HEAD`];
  const paths = parseChangedPaths(
    runGit([...diffArgs, "--name-status", "-z", "--find-renames", "--", "apps/web"]),
  );
  return { base, ...paths };
}

function collectTreeRoots(paths: string[], read: (path: string) => string): LocatedReadRoot[] {
  return paths.flatMap((path) =>
    collectRankAwardReadRoots(read(path), path).map((root) => ({ ...root, path })),
  );
}

function newTreeRoots(mode: Exclude<Mode, { kind: "fixture" }>): LocatedReadRoot[] {
  const { base, basePaths, candidatePaths } = changedTrees(mode);
  // Added paths are absent from `basePaths`; deleted paths are absent from `candidatePaths`.
  // Every remaining blob is guaranteed by the parsed diff and therefore read strictly: an
  // unexpected git-show failure is a hard scanner error, never an empty-source green.
  const baseRoots = collectTreeRoots(basePaths, (path) => runGit(["show", `${base}:${path}`]));
  const candidateRoots = collectTreeRoots(candidatePaths, (path) =>
    runGit(["show", mode.kind === "staged" ? `:${path}` : `HEAD:${path}`]),
  );
  const excess = excessCandidateRoots(baseRoots, candidateRoots);
  return excess as LocatedReadRoot[];
}

export function main(args = process.argv.slice(2)): number {
  let mode: Mode;
  try {
    mode = parseMode(args);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 2;
  }

  const failures: LocatedReadRoot[] =
    mode.kind === "fixture"
      ? findNewRankAwardReadRoots("", readFileSync(mode.candidate, "utf8")).map((root) => ({
          ...root,
          path: mode.candidate,
        }))
      : newTreeRoots(mode);

  if (failures.length === 0) {
    console.log("rank-award-read-guard: PASS — no new direct RankAward read roots");
    return 0;
  }

  console.error(
    "rank-award-read-guard: FAIL — new direct RankAward read root(s) violate ADR 0058 / FS-0049:",
  );
  for (const failure of failures) {
    console.error(`  - ${failure.path}:${failure.line} (${failure.kind})`);
  }
  console.error(
    "Read member rank through RankEntry/memberRanks. For a required transitional promotion-fact",
  );
  console.error(
    "join, add '// rank-read-guard: allow -- <nonempty reason>' immediately above the root.",
  );
  return 1;
}

if (import.meta.main) process.exit(main());
