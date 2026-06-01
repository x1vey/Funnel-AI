import type { FunnelProject } from '@/store/funnel-store';
import { buildPageHTML, buildExportCSS, buildExportJS } from './serializer';

export async function exportFunnelAsZip(project: FunnelProject): Promise<void> {
  // Build file contents
  const files: Array<{ name: string; content: string }> = [];

  const css = buildExportCSS(project);
  const js = buildExportJS(project);

  files.push({ name: 'styles.css', content: css });
  files.push({ name: 'script.js', content: js });

  for (const page of project.pages) {
    const filename = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
    const html = buildPageHTML(page, project);
    files.push({ name: filename, content: html });
  }

  // Create ZIP using raw binary (no external library needed for simple case)
  const zip = createSimpleZip(files);
  downloadBlob(zip, `${slugify(project.name)}-funnel.zip`, 'application/zip');
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'funnel';
}

function downloadBlob(blob: Blob, filename: string, type: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Simple ZIP file creator (store method, no compression)
function createSimpleZip(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const crc = crc32(contentBytes);
    const size = contentBytes.length;

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);  // signature
    lv.setUint16(4, 20, true);           // version needed
    lv.setUint16(6, 0, true);            // flags
    lv.setUint16(8, 0, true);            // compression (store)
    lv.setUint16(10, 0, true);           // mod time
    lv.setUint16(12, 0, true);           // mod date
    lv.setUint32(14, crc, true);         // crc32
    lv.setUint32(18, size, true);        // compressed size
    lv.setUint32(22, size, true);        // uncompressed size
    lv.setUint16(26, nameBytes.length, true); // name length
    lv.setUint16(28, 0, true);           // extra length
    localHeader.set(nameBytes, 30);

    localHeaders.push(localHeader);
    localHeaders.push(contentBytes);

    // Central directory entry
    const cdEntry = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdEntry.buffer);
    cv.setUint32(0, 0x02014b50, true);  // signature
    cv.setUint16(4, 20, true);           // version made by
    cv.setUint16(6, 20, true);           // version needed
    cv.setUint16(8, 0, true);            // flags
    cv.setUint16(10, 0, true);           // compression
    cv.setUint16(12, 0, true);           // mod time
    cv.setUint16(14, 0, true);           // mod date
    cv.setUint32(16, crc, true);         // crc32
    cv.setUint32(20, size, true);        // compressed size
    cv.setUint32(24, size, true);        // uncompressed size
    cv.setUint16(28, nameBytes.length, true); // name length
    cv.setUint16(30, 0, true);           // extra length
    cv.setUint16(32, 0, true);           // comment length
    cv.setUint16(34, 0, true);           // disk start
    cv.setUint16(36, 0, true);           // internal attr
    cv.setUint32(38, 0, true);           // external attr
    cv.setUint32(42, offset, true);      // local header offset
    cdEntry.set(nameBytes, 46);
    centralDirectory.push(cdEntry);

    offset += localHeader.length + contentBytes.length;
  }

  const cdStart = offset;
  const cdSize = centralDirectory.reduce((a, b) => a + b.length, 0);

  // End of central directory
  const eocdr = new Uint8Array(22);
  const ev = new DataView(eocdr.buffer);
  ev.setUint32(0, 0x06054b50, true);    // signature
  ev.setUint16(4, 0, true);             // disk number
  ev.setUint16(6, 0, true);             // cd disk
  ev.setUint16(8, files.length, true);  // entries on disk
  ev.setUint16(10, files.length, true); // total entries
  ev.setUint32(12, cdSize, true);       // cd size
  ev.setUint32(16, cdStart, true);      // cd offset
  ev.setUint16(20, 0, true);            // comment length

  const allParts = [...localHeaders, ...centralDirectory, eocdr];
  const totalSize = allParts.reduce((a, b) => a + b.length, 0);
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const part of allParts) {
    result.set(part, pos);
    pos += part.length;
  }

  return new Blob([result], { type: 'application/zip' });
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (~crc) >>> 0;
}
