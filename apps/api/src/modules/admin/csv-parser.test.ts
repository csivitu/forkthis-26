import { describe, expect, test } from "bun:test";
import { CsvParseError, parseParticipantsCsv } from "./csv-parser";

describe("parseParticipantsCsv", () => {
  test("supports BOM, headers, quoted cells, duplicates, and invalid rows", () => {
    const result = parseParticipantsCsv(
      '\uFEFFname,registration number\n"Sharma, Tanuj","22BCE1234"\nOther,22BCE1234\nBad,nope',
    );
    expect(result.entries).toEqual([{ regno: "22BCE1234", line: 2 }]);
    expect(result.invalid).toEqual([
      { line: 3, value: "22BCE1234", reason: "Duplicate in CSV" },
      { line: 4, value: "NOPE", reason: "Invalid registration number" },
    ]);
  });
  test("rejects malformed quoted CSV", () => {
    expect(() => parseParticipantsCsv('regno\n"22BCE1234')).toThrow(
      CsvParseError,
    );
  });
  test("reports an invalid first row when no header is present", () => {
    expect(parseParticipantsCsv("invalid\n22BCE1234").invalid).toEqual([
      { line: 1, value: "INVALID", reason: "Invalid registration number" },
    ]);
  });
});
