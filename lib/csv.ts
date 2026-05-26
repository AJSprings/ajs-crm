// Tiny CSV helpers — RFC 4180-ish: quote fields containing commas, quotes, or newlines;
// escape internal quotes by doubling. No dependency.

export function toCsv(headers: string[], rows: (string | number | null | undefined | Date)[][]): string {
  const lines: string[] = [];
  lines.push(headers.map(csvField).join(","));
  for (const row of rows) {
    lines.push(row.map((v) => csvField(stringify(v))).join(","));
  }
  return lines.join("\n") + "\n";
}

function stringify(v: string | number | null | undefined | Date): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function csvField(value: string): string {
  if (value === "") return "";
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export type CsvRow = Record<string, string>;

/** Parse a CSV string into rows of objects keyed by header. Handles quotes, escaped quotes, and CRLF. */
export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cur.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        // end of row (skip \n after \r)
        if (ch === "\r" && text[i + 1] === "\n") i++;
        cur.push(field);
        field = "";
        // skip blank lines
        if (cur.length > 1 || cur[0] !== "") rows.push(cur);
        cur = [];
      } else {
        field += ch;
      }
    }
  }
  // last field
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    if (cur.length > 1 || cur[0] !== "") rows.push(cur);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: CsvRow = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = (r[i] ?? "").trim();
    }
    return obj;
  });
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
