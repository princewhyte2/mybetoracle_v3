import fs from "node:fs";
import ts from "typescript";

const sourcePath = new URL("../src/i18n/messages.ts", import.meta.url);
const sourceText = fs.readFileSync(sourcePath, "utf8");
let sourceFile = ts.createSourceFile("messages.ts", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const localeNames = ["en", "es", "fr", "de", "it", "pt"];
const localeObjects = new Map();

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  throw new Error(`Unsupported translation key at ${sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1}`);
}

function readObject(node) {
  const value = ts.isAsExpression(node) || ts.isSatisfiesExpression(node) ? node.expression : node;
  if (!ts.isObjectLiteralExpression(value)) throw new Error("Each locale must be a plain object literal.");
  const result = {};
  for (const property of value.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = propertyName(property.name);
    const initializer = property.initializer;
    if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) result[key] = initializer.text;
    else result[key] = readObject(initializer);
  }
  return result;
}

for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !localeNames.includes(declaration.name.text) || !declaration.initializer) continue;
    localeObjects.set(declaration.name.text, readObject(declaration.initializer));
  }
}

function flatten(value, prefix = "", result = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") result.set(path, child);
    else flatten(child, path, result);
  }
  return result;
}

const errors = [];
const english = flatten(localeObjects.get("en") ?? {});
for (const locale of localeNames) {
  const values = flatten(localeObjects.get(locale) ?? {});
  for (const key of english.keys()) if (!values.has(key)) errors.push(`${locale}: missing ${key}`);
  for (const key of values.keys()) if (!english.has(key)) errors.push(`${locale}: unexpected ${key}`);
  for (const [key, value] of values) {
    if (!value.trim()) errors.push(`${locale}: empty ${key}`);
    if (/(?:Â[^\s]|Ã[\u0080-\u00bf]|\uFFFD)/u.test(value)) errors.push(`${locale}: encoding corruption in ${key}`);
  }
}

let featureCatalogs = 0;
const featuresPath = new URL("../src/features/", import.meta.url);
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(new URL(`${entry.name}/`, directory)) : [new URL(entry.name, directory)]);
}
for (const file of walk(featuresPath).filter((item) => item.pathname.endsWith("labels.ts"))) {
  sourceFile = ts.createSourceFile(file.pathname, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.name.text.endsWith("Labels") || !declaration.initializer) continue;
      const catalog = readObject(declaration.initializer);
      if (!localeNames.every((locale) => locale in catalog)) continue;
      featureCatalogs += 1;
      const base = flatten(catalog.en);
      for (const locale of localeNames) {
        const values = flatten(catalog[locale]);
        for (const key of base.keys()) if (!values.has(key)) errors.push(`${file.pathname}:${locale}: missing ${key}`);
        for (const key of values.keys()) if (!base.has(key)) errors.push(`${file.pathname}:${locale}: unexpected ${key}`);
        for (const [key, value] of values) {
          if (!value.trim()) errors.push(`${file.pathname}:${locale}: empty ${key}`);
          if (/(?:Â[^\s]|Ã[\u0080-\u00bf]|\uFFFD)/u.test(value)) errors.push(`${file.pathname}:${locale}: encoding corruption in ${key}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${english.size} shared keys and ${featureCatalogs} feature catalogs across ${localeNames.length} locales: complete, non-empty, UTF-8 clean.`);
}
