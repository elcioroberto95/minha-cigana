import { readdir, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const source = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../src/', import.meta.url));
const boundaries = /^(?:(?:chat|profile)\/(?:application|domain)\/.+|chat\/chat\.controller)\.ts$/;

// Dependency-cruiser can follow literal imports. Keep computed targets out of these layers.
for (const path of await readdir(source, { recursive: true })) {
  const relativePath = path.split(sep).join('/');
  if (!boundaries.test(relativePath)) continue;

  const absolute = resolve(source, path);
  const file = ts.createSourceFile(absolute, await readFile(absolute, 'utf8'), ts.ScriptTarget.Latest, true);

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const loader = node.expression;
      const isImport = loader.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(loader) && loader.text === 'require';
      const target = node.arguments[0];
      if ((isImport || isRequire) && (!target || !ts.isStringLiteralLike(target))) {
        const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
        console.error(`${relativePath}:${line + 1}: especifique o caminho do import com uma string literal.`);
        process.exitCode = 1;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
}
