import {
  createParticipantSchema,
  type CsvInvalidRow,
} from "@repo/admin-contracts";

const emailHeaders = new Set([
  "email",
  "email address",
  "email_address",
  "email id",
  "email_id",
]);

export class CsvParseError extends Error {}

interface CsvRow {
  cells: string[];
  line: number;
}
export interface ParsedParticipants {
  entries: Array<{ email: string; line: number }>;
  invalid: CsvInvalidRow[];
}

function parseRows(input: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let line = 1;
  let rowLine = 1;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];
    if (character === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else if (quoted || cell.length === 0) quoted = !quoted;
      else throw new CsvParseError(`Unexpected quote on line ${line}`);
      continue;
    }
    if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0))
        rows.push({ cells: row, line: rowLine });
      row = [];
      cell = "";
      line += 1;
      rowLine = line;
      continue;
    }
    if (character === "\n") line += 1;
    cell += character;
  }
  if (quoted)
    throw new CsvParseError(
      `Unterminated quoted cell beginning on line ${rowLine}`,
    );
  row.push(cell.trim());
  if (row.some((value) => value.length > 0))
    rows.push({ cells: row, line: rowLine });
  return rows;
}

export function parseParticipantsCsv(input: string): ParsedParticipants {
  const rows = parseRows(input.replace(/^\uFEFF/, ""));
  if (rows.length === 0) throw new CsvParseError("CSV is empty");
  const detectedHeaderIndex =
    rows[0]?.cells.findIndex((cell) =>
      emailHeaders.has(cell.trim().toLowerCase()),
    ) ?? -1;
  const hasHeader = detectedHeaderIndex >= 0;
  const headerIndex = hasHeader ? detectedHeaderIndex : 0;

  const entries: ParsedParticipants["entries"] = [];
  const invalid: CsvInvalidRow[] = [];
  const seen = new Set<string>();
  for (const row of rows.slice(hasHeader ? 1 : 0)) {
    const value = row.cells[headerIndex] ?? "";
    const parsed = createParticipantSchema.safeParse({ email: value });
    if (!parsed.success) {
      invalid.push({
        line: row.line,
        value: value.trim(),
        reason: "Invalid email address",
      });
      continue;
    }
    const { email } = parsed.data;
    if (seen.has(email)) {
      invalid.push({
        line: row.line,
        value: email,
        reason: "Duplicate in CSV",
      });
      continue;
    }
    seen.add(email);
    entries.push({ email, line: row.line });
  }
  return { entries, invalid };
}
