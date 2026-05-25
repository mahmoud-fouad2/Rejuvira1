type XlsxCellValue = Date | number | string | null | undefined;

export type XlsxColumn = {
  key: string;
  label: string;
  width?: number;
};

export type XlsxBuildOptions = {
  title: string;
  subtitle?: string;
  sheetName?: string;
  generatedAt?: Date;
  columns: readonly XlsxColumn[];
  rows: readonly Record<string, XlsxCellValue>[];
};

const MIME_XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function xlsxContentType() {
  return MIME_XLSX;
}

export function buildStyledXlsx(options: XlsxBuildOptions): Buffer {
  const generatedAt = options.generatedAt ?? new Date();
  const columns = options.columns;
  const safeRows = options.rows.length
    ? options.rows
    : [{ [columns[0]?.key ?? "empty"]: "لا توجد نتائج مطابقة للفلاتر الحالية" }];
  const sheetName = sanitizeSheetName(options.sheetName ?? "CRM Leads");
  const lastColumn = columnName(columns.length);
  const headerRowIndex = 5;
  const firstDataRowIndex = headerRowIndex + 1;
  const lastRowIndex = firstDataRowIndex + safeRows.length - 1;
  const tableRef = `A${headerRowIndex}:${lastColumn}${lastRowIndex}`;

  const files: ZipFile[] = [
    {
      name: "[Content_Types].xml",
      content: xmlBuffer(contentTypesXml()),
    },
    { name: "_rels/.rels", content: xmlBuffer(rootRelsXml()) },
    { name: "docProps/app.xml", content: xmlBuffer(appPropsXml()) },
    {
      name: "docProps/core.xml",
      content: xmlBuffer(corePropsXml(generatedAt)),
    },
    { name: "xl/workbook.xml", content: xmlBuffer(workbookXml(sheetName)) },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: xmlBuffer(workbookRelsXml()),
    },
    { name: "xl/styles.xml", content: xmlBuffer(stylesXml()) },
    {
      name: "xl/worksheets/sheet1.xml",
      content: xmlBuffer(
        worksheetXml({
          columns,
          rows: safeRows,
          title: options.title,
          subtitle: options.subtitle,
          generatedAt,
          lastColumn,
          headerRowIndex,
          firstDataRowIndex,
          tableRef,
        }),
      ),
    },
    {
      name: "xl/worksheets/_rels/sheet1.xml.rels",
      content: xmlBuffer(worksheetRelsXml()),
    },
    {
      name: "xl/tables/table1.xml",
      content: xmlBuffer(tableXml(columns, tableRef)),
    },
  ];

  return createZip(files);
}

function worksheetXml({
  columns,
  rows,
  title,
  subtitle,
  generatedAt,
  lastColumn,
  headerRowIndex,
  firstDataRowIndex,
  tableRef,
}: {
  columns: readonly XlsxColumn[];
  rows: readonly Record<string, XlsxCellValue>[];
  title: string;
  subtitle: string | undefined;
  generatedAt: Date;
  lastColumn: string;
  headerRowIndex: number;
  firstDataRowIndex: number;
  tableRef: string;
}) {
  const colXml = columns
    .map((column, index) => {
      const col = index + 1;
      const width = Math.max(10, Math.min(column.width ?? 18, 48));
      return `<col min="${col}" max="${col}" width="${width}" customWidth="1"/>`;
    })
    .join("");

  const headerCells = columns
    .map((column, index) =>
      textCell(`${columnName(index + 1)}${headerRowIndex}`, column.label, 3),
    )
    .join("");

  const dataRows = rows
    .map((row, rowIndex) => {
      const excelRow = firstDataRowIndex + rowIndex;
      const cells = columns
        .map((column, colIndex) => {
          const value = row[column.key];
          return textCell(
            `${columnName(colIndex + 1)}${excelRow}`,
            formatCellValue(value),
            colIndex === 1 ? 6 : 4,
          );
        })
        .join("");
      return `<row r="${excelRow}" ht="24" customHeight="1">${cells}</row>`;
    })
    .join("");

  const generatedLine = `تم إنشاء الملف: ${formatDateTime(generatedAt)} | المنطقة الزمنية: Asia/Riyadh`;
  const subtitleText = subtitle ? `${subtitle} | ${generatedLine}` : generatedLine;

  return xmlDeclaration(`\
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0" rightToLeft="1" showGridLines="0">
      <pane ySplit="${headerRowIndex}" topLeftCell="A${firstDataRowIndex}" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A${firstDataRowIndex}" sqref="A${firstDataRowIndex}"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="21"/>
  <cols>${colXml}</cols>
  <sheetData>
    <row r="1" ht="34" customHeight="1">${textCell("A1", title, 1)}</row>
    <row r="2" ht="25" customHeight="1">${textCell("A2", subtitleText, 2)}</row>
    <row r="3" ht="18" customHeight="1">${textCell("A3", "يمكن استخدام أسهم الفلترة داخل صف العناوين لتصفية النتائج من داخل Excel.", 5)}</row>
    <row r="${headerRowIndex}" ht="28" customHeight="1">${headerCells}</row>
    ${dataRows}
  </sheetData>
  <autoFilter ref="${tableRef}"/>
  <mergeCells count="3">
    <mergeCell ref="A1:${lastColumn}1"/>
    <mergeCell ref="A2:${lastColumn}2"/>
    <mergeCell ref="A3:${lastColumn}3"/>
  </mergeCells>
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
  <tableParts count="1"><tablePart r:id="rId1"/></tableParts>
</worksheet>`);
}

function tableXml(columns: readonly XlsxColumn[], tableRef: string) {
  const tableColumns = columns
    .map(
      (column, index) =>
        `<tableColumn id="${index + 1}" name="${escapeXml(column.label)}"/>`,
    )
    .join("");

  return xmlDeclaration(`\
<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="RejuveraLeads" displayName="RejuveraLeads" ref="${tableRef}" totalsRowShown="0">
  <autoFilter ref="${tableRef}"/>
  <tableColumns count="${columns.length}">${tableColumns}</tableColumns>
  <tableStyleInfo name="TableStyleMedium4" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>
</table>`);
}

function stylesXml() {
  return xmlDeclaration(`\
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><color rgb="FF21143B"/><name val="Arial"/></font>
    <font><b/><sz val="18"/><color rgb="FF2B0F47"/><name val="Arial"/></font>
    <font><sz val="10"/><color rgb="FF6B5F75"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF4C1D75"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF7F1FF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFBF2"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE7DDF0"/></left>
      <right style="thin"><color rgb="FFE7DDF0"/></right>
      <top style="thin"><color rgb="FFE7DDF0"/></top>
      <bottom style="thin"><color rgb="FFE7DDF0"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FFD7C6E8"/></left>
      <right style="thin"><color rgb="FFD7C6E8"/></right>
      <top style="thin"><color rgb="FFD7C6E8"/></top>
      <bottom style="thin"><color rgb="FFD7C6E8"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="7">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="right" readingOrder="2"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="right" readingOrder="2"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="2" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" readingOrder="2" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top" readingOrder="2" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" readingOrder="2"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top" readingOrder="2"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`);
}

function workbookXml(sheetName: string) {
  return xmlDeclaration(`\
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr date1904="0"/>
  <sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`);
}

function workbookRelsXml() {
  return xmlDeclaration(`\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);
}

function worksheetRelsXml() {
  return xmlDeclaration(`\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/>
</Relationships>`);
}

function rootRelsXml() {
  return xmlDeclaration(`\
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`);
}

function contentTypesXml() {
  return xmlDeclaration(`\
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`);
}

function appPropsXml() {
  return xmlDeclaration(`\
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Rejuvera Admin</Application>
</Properties>`);
}

function corePropsXml(generatedAt: Date) {
  const iso = generatedAt.toISOString();
  return xmlDeclaration(`\
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Rejuvera CRM Leads Export</dc:title>
  <dc:creator>Rejuvera Admin</dc:creator>
  <cp:lastModifiedBy>Rejuvera Admin</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${iso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${iso}</dcterms:modified>
</cp:coreProperties>`);
}

function textCell(ref: string, value: string, style = 4) {
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function formatCellValue(value: XlsxCellValue) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDateTime(value);
  return String(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(value);
}

function sanitizeSheetName(value: string) {
  const sanitized = value.replace(/[\][*?:/\\]/g, " ").trim();
  return (sanitized || "Sheet1").slice(0, 31);
}

function columnName(index: number) {
  let name = "";
  let current = index;
  while (current > 0) {
    const modulo = (current - 1) % 26;
    name = String.fromCharCode(65 + modulo) + name;
    current = Math.floor((current - modulo) / 26);
  }
  return name;
}

function escapeXml(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlDeclaration(value: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${value}`;
}

function xmlBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

type ZipFile = {
  name: string;
  content: Buffer;
};

function createZip(files: readonly ZipFile[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const now = new Date();
  const { dosDate, dosTime } = toDosDateTime(now);

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const crc = crc32(file.content);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(file.content.length, 18);
    localHeader.writeUInt32LE(file.content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, file.content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(file.content.length, 20);
    centralHeader.writeUInt32LE(file.content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + file.content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function toDosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  return { dosDate, dosTime };
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
