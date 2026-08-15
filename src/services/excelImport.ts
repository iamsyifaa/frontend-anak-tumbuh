export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

function parseCsv(text: string): ParsedSheet {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      current.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      current.push(cell.trim());
      if (current.some((item) => item !== "")) rows.push(current);
      current = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  current.push(cell.trim());
  if (current.some((item) => item !== "")) rows.push(current);

  if (rows.length < 2) throw new Error("File tidak memiliki data siswa yang dapat diproses.");
  return { headers: rows[0].map(normalizeHeader), rows: rows.slice(1) };
}

function readU16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readU32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Browser tidak mendukung pembacaan Excel .xlsx pada mock importer ini.");
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipEntries(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const entries = new Map<string, Uint8Array>();
  let offset = 0;

  while (offset + 30 <= bytes.length) {
    const signature = readU32(view, offset);
    if (signature !== 0x04034b50) break;

    const flags = readU16(view, offset + 6);
    const method = readU16(view, offset + 8);
    const compressedSize = readU32(view, offset + 18);
    const fileNameLength = readU16(view, offset + 26);
    const extraLength = readU16(view, offset + 28);

    if (flags & 0x08) {
      throw new Error("File Excel menggunakan data descriptor yang belum didukung mock importer.");
    }

    const nameStart = offset + 30;
    const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + fileNameLength));
    const dataStart = nameStart + fileNameLength + extraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);

    let content: Uint8Array;
    if (method === 0) content = compressed;
    else if (method === 8) content = await inflateRaw(compressed);
    else throw new Error(`Metode kompresi Excel tidak didukung: ${method}.`);

    entries.set(name, content);
    offset = dataStart + compressedSize;
  }

  if (!entries.size) throw new Error("File .xlsx tidak dapat dibaca atau bukan workbook Excel yang valid.");
  return entries;
}

const xmlText = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

function childText(element: Element, tag: string) {
  return element.getElementsByTagNameNS("*", tag)[0]?.textContent?.trim() ?? "";
}

async function parseXlsx(buffer: ArrayBuffer): Promise<ParsedSheet> {
  const entries = await unzipEntries(buffer);
  const workbook = entries.get("xl/workbook.xml");
  const sheet = entries.get("xl/worksheets/sheet1.xml");
  if (!workbook || !sheet) throw new Error("Workbook Excel tidak memiliki sheet pertama yang dapat dibaca.");

  const sharedStrings = entries.get("xl/sharedStrings.xml");
  const shared: string[] = [];
  if (sharedStrings) {
    const doc = new DOMParser().parseFromString(xmlText(sharedStrings), "application/xml");
    Array.from(doc.getElementsByTagNameNS("*", "si")).forEach((item) => {
      shared.push(Array.from(item.getElementsByTagNameNS("*", "t")).map((t) => t.textContent ?? "").join(""));
    });
  }

  const sheetDoc = new DOMParser().parseFromString(xmlText(sheet), "application/xml");
  const sheetRows = Array.from(sheetDoc.getElementsByTagNameNS("*", "row"));
  const matrix: string[][] = [];

  for (const row of sheetRows) {
    const values: string[] = [];
    let cursor = 0;
    for (const cell of Array.from(row.getElementsByTagNameNS("*", "c"))) {
      const ref = cell.getAttribute("r") ?? "";
      const match = ref.match(/([A-Z]+)\d+/);
      let column = cursor;
      if (match) {
        column = 0;
        for (const char of match[1]) column = column * 26 + char.charCodeAt(0) - 64;
        column -= 1;
      }
      while (values.length < column) values.push("");

      const type = cell.getAttribute("t");
      let value = childText(cell, "v");
      if (type === "s" && value !== "") value = shared[Number(value)] ?? "";
      if (type === "inlineStr") value = childText(cell, "t");
      values[column] = value;
      cursor = column + 1;
    }
    matrix.push(values);
  }

  if (matrix.length < 2) throw new Error("Sheet Excel tidak memiliki data siswa yang dapat diproses.");
  return { headers: matrix[0].map(normalizeHeader), rows: matrix.slice(1) };
}

export async function parseStudentWorkbook(file: File): Promise<ParsedSheet> {
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "csv") return parseCsv(await file.text());
  if (extension === "xlsx") return parseXlsx(await file.arrayBuffer());
  throw new Error("Format file tidak didukung. Gunakan .xlsx atau .csv.");
}

export function getCell(row: string[], headers: string[], aliases: string[]) {
  const index = headers.findIndex((header) => aliases.includes(header));
  return index >= 0 ? row[index]?.trim() ?? "" : "";
}
