/**
 * The record that ties the site's raster icons and share image to their SVG sources: a JSON file the project keeps wherever it keeps the sources and passes with `--rasters`, its paths relative to its own folder. The PNGs are rendered by hand, so the check cannot rebuild them; it makes a source edit that left its PNGs behind, or a PNG replaced without its source, fail instead of shipping stale art.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

interface RasterEntry {
  readonly file: string;
  readonly size: string;
  readonly source: string;
  readonly sourceSha256: string;
  readonly sha256: string;
}

interface CopyEntry {
  readonly file: string;
  readonly source: string;
}

export interface RastersRecord {
  readonly rasters: readonly RasterEntry[];
  readonly copies: readonly CopyEntry[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

// @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-require-field
function field(value: Record<string, unknown>, key: string, at: string, where: string): string {
  const text = value[key];
  if (typeof text !== 'string' || text === '') throw new Error(`${where} ${at}.${key}: expected a non-empty string`);
  return text;
}
// @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-require-field

// @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-require-entry
function entryAt(value: unknown, at: string, where: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${where} ${at}: expected an object`);
  return value;
}
// @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-require-entry

/**
 * Parses the record, so a malformed entry fails loudly instead of checking nothing.
 * @param value - the parsed JSON
 * @param where - the record's path, for messages
 */
export function parseRastersRecord(value: unknown, where: string): RastersRecord {
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-if-no-lists
  if (!isRecord(value) || !Array.isArray(value.rasters) || !Array.isArray(value.copies)) throw new Error(`${where}: expected rasters and copies lists`);
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-if-no-lists
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-parse-entries
  return {
    rasters: value.rasters.map((raw: unknown, index) => {
      const at = `rasters[${index}]`;
      const entry = entryAt(raw, at, where);
      const text = (key: string) => field(entry, key, at, where);
      return { file: text('file'), size: text('size'), source: text('source'), sourceSha256: text('sourceSha256'), sha256: text('sha256') };
    }),
    copies: value.copies.map((raw: unknown, index) => {
      const at = `copies[${index}]`;
      const entry = entryAt(raw, at, where);
      return { file: field(entry, 'file', at, where), source: field(entry, 'source', at, where) };
    }),
  };
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-parse-entries
}

const sha256 = (file: string): string => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/**
 * The differences between the record and the files, as messages; empty when every PNG is recorded against the source it was drawn from, and when the project keeps no record.
 * @param record - the record file, or nothing
 */
// @cpt-algo:cpt-template-site-meta-algo-generate-and-check-rasters:p2
// @cpt-dod:cpt-template-site-meta-dod-generate-and-check-rasters:p2
export function checkRasters(record: string | undefined): string[] {
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-if-no-record
  if (record === undefined) return [];
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-if-no-record
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-parse-record
  const parsed = parseRastersRecord(JSON.parse(fs.readFileSync(record, 'utf8')), record);
  const base = path.dirname(record);
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-parse-record
  const errors: string[] = [];
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-report-missing
  const exists = (file: string) => {
    if (fs.existsSync(path.join(base, file))) return true;
    errors.push(`${file} does not exist (${record})`);
    return false;
  };
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-report-missing
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-foreach-raster
  for (const entry of parsed.rasters) {
    if (!exists(entry.file) || !exists(entry.source)) continue;
    if (sha256(path.join(base, entry.source)) !== entry.sourceSha256) errors.push(`${entry.source} changed since ${entry.file} was drawn from it; render ${entry.file} again at ${entry.size} and record both hashes in ${record}`);
    if (sha256(path.join(base, entry.file)) !== entry.sha256) errors.push(`${entry.file} is not the PNG ${record} records; if it was rendered again from ${entry.source}, record its hash`);
  }
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-foreach-raster
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-foreach-copy
  for (const entry of parsed.copies) {
    if (!exists(entry.file) || !exists(entry.source)) continue;
    if (!fs.readFileSync(path.join(base, entry.file)).equals(fs.readFileSync(path.join(base, entry.source)))) errors.push(`${entry.file} differs from its source ${entry.source}; copy it again`);
  }
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-foreach-copy
  // @cpt-begin:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-return-raster-messages
  return errors;
  // @cpt-end:cpt-template-site-meta-algo-generate-and-check-rasters:p2:inst-return-raster-messages
}
