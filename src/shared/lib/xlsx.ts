/** Minimal .xlsx writer: one sheet, bold frozen header, inline strings and numbers, stored ZIP (no library). */
export type XlsxCell = string | number;

export function buildXlsx(sheetName: string, headers: string[], rows: XlsxCell[][]): Blob {
  const esc = (v: XlsxCell): string => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = (n: number): string => {
    let s = '';
    n++;
    while (n) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  };
  const cell = (v: XlsxCell, r: number, c: number, st: number): string =>
    typeof v === 'number'
      ? '<c r="' + col(c) + r + '"' + (st ? ' s="' + st + '"' : '') + '><v>' + v + '</v></c>'
      : '<c r="' +
        col(c) +
        r +
        '" t="inlineStr"' +
        (st ? ' s="' + st + '"' : '') +
        '><is><t xml:space="preserve">' +
        esc(v) +
        '</t></is></c>';
  const widths = headers.map((h, c) => Math.min(48, Math.max(String(h).length, ...rows.slice(0, 200).map((r) => String(r[c]).length)) + 2));
  const sheet =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
    widths.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') +
    '</cols><sheetData>' +
    '<row r="1">' +
    headers.map((h, c) => cell(h, 1, c, 1)).join('') +
    '</row>' +
    rows
      .map((r, i) => '<row r="' + (i + 2) + '">' + r.map((v, c) => cell(v, i + 2, c, typeof v === 'number' ? 2 : 0)).join('') + '</row>')
      .join('') +
    '</sheetData><autoFilter ref="A1:' +
    col(headers.length - 1) +
    (rows.length + 1) +
    '"/></worksheet>';
  const files: Record<string, string> = {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' +
      esc(sheetName.slice(0, 31)) +
      '" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF6"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml': sheet,
  };
  const enc = new TextEncoder();
  const crcT = (() => {
    const t: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc = (b: Uint8Array): number => {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let off = 0;
  const u16 = (v: number): number[] => [v & 255, (v >>> 8) & 255];
  const u32 = (v: number): number[] => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  Object.keys(files).forEach((name) => {
    const nm = enc.encode(name),
      data = enc.encode(files[name]),
      c = crc(data);
    const head = ([] as number[]).concat(
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0x21),
      u32(c),
      u32(data.length),
      u32(data.length),
      u16(nm.length),
      u16(0),
    );
    parts.push(new Uint8Array(head), nm, data);
    central.push(
      new Uint8Array(
        ([] as number[]).concat(
          u32(0x02014b50),
          u16(20),
          u16(20),
          u16(0),
          u16(0),
          u16(0),
          u16(0x21),
          u32(c),
          u32(data.length),
          u32(data.length),
          u16(nm.length),
          u16(0),
          u16(0),
          u16(0),
          u16(0),
          u32(0),
          u32(off),
        ),
      ),
      nm,
    );
    off += head.length + nm.length + data.length;
  });
  const cSize = central.reduce((a, b) => a + b.length, 0),
    n = Object.keys(files).length;
  const end = new Uint8Array(([] as number[]).concat(u32(0x06054b50), u16(0), u16(0), u16(n), u16(n), u32(cSize), u32(off), u16(0)));
  return new Blob([...parts, ...central, end] as BlobPart[], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
