// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
// PCD Loader, adapted from THREE.js (MIT license)
// Description: A loader for PCD ascii and binary files.
// Limitations: Compressed binary files are not supported.
//
// Attributions per original THREE.js source file:
// @author Filipe Caixeta / http://filipecaixeta.com.br
// @author Mugen87 / https://github.com/Mugen87

export type PCDHeaderField = {
  size: number;
  type: string;
  count: number;
  offset: number;
};

const zeroHeaderField: PCDHeaderField = {
  size: 0,
  type: "",
  count: 0,
  offset: 0,
};

export const float32bytes = 4;
export const uint32bytes = 4;

export const isLittleEndian: boolean = (() => {
  const tmpWord = new DataView(new ArrayBuffer(8));
  new Uint16Array(tmpWord.buffer)[0] = 0x0102;
  return tmpWord.getUint8(0) === 0x02;
})();

export type PCDHeaderFields = {
  x: PCDHeaderField;
  y: PCDHeaderField;
  z: PCDHeaderField;
  [name: string]: PCDHeaderField;
};

export type PCDHeader = {
  dataType: string;
  headerLen: number;
  str: string;
  version: string;
  fieldNames: Array<string>;
  fields: PCDHeaderFields;
  width: number;
  height: number;
  viewpoint: string;
  points: number;
  rowSize: number;
};

export type PCDInfo = {
  originHeader?: PCDHeader;
  header: PCDHeader;
  content: ArrayBufferLike;
};

export function parsePCD(data: ArrayBufferLike): PCDInfo {
  // parse header (always ascii format)
  const textData = new TextDecoder().decode(data);
  const header = parsePCDHeader(textData);

  let converted: PCDInfo;

  // parse data
  switch (header.dataType) {
    case "ascii":
      converted = parsePCDASCII(header, textData);
      break;

    case "binary":
      converted = parsePCDBinary(header, data);
      break;

    // TODO(ruiyuli): need to check https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PCDLoader.js
    case "binary_compressed":
      converted = parsePCDBinaryCompressed(header, data);
      break;

    default:
      throw new Error(`${header.dataType} files are not supported`);
  }

  return {
    originHeader: header,
    ...converted,
  };
}

export function parsePCDHeader(data: string | ArrayBufferLike): PCDHeader {
  let textData: string;

  if (typeof data !== "string") {
    textData = new TextDecoder().decode(data);
  } else {
    textData = data;
  }

  const pcdHeader: PCDHeader = {
    dataType: "",
    headerLen: 0,
    str: "",
    version: "",
    fieldNames: [],
    fields: {
      x: zeroHeaderField,
      y: zeroHeaderField,
      z: zeroHeaderField,
    },
    width: 0,
    height: 0,
    viewpoint: "",
    points: 0,
    rowSize: 0,
  };

  const result1 = textData.search(/[\r\n]DATA\s(\S*)\s/i);
  const result2 = /[\r\n]DATA\s(\S*)\s/i.exec(textData.slice(result1 - 1));

  if (result2 == undefined) {
    throw new Error("Bad PCD Header, Unknown Data Type");
  }

  pcdHeader.dataType = result2[1];
  pcdHeader.headerLen = result2[0].length + result1;
  pcdHeader.str = textData.slice(0, pcdHeader.headerLen);

  // remove comments

  pcdHeader.str = pcdHeader.str.replace(/#.*/gi, "");

  // parse
  const version = /VERSION (.*)/i.exec(pcdHeader.str);
  if (version != undefined) {
    pcdHeader.version = version[1];
  }
  const fields = /FIELDS (.*)/i.exec(pcdHeader.str);
  if (fields == undefined) {
    throw new Error("Bad PCD Header, No FIELDS");
  }
  pcdHeader.fieldNames = fields[1].trimRight().split(" ");

  for (const name of pcdHeader.fieldNames) {
    pcdHeader.fields[name] = {
      size: 0,
      type: "",
      count: 0,
      offset: 0,
    };
  }

  const size = /SIZE (.*)/i.exec(pcdHeader.str);
  if (size == undefined) {
    throw new Error("Bad PCD Header, No SIZE");
  }

  size[1]
    .trimRight()
    .split(" ")
    .map((x, i) => {
      const field = pcdHeader.fields[pcdHeader.fieldNames[i]];
      if (field != undefined) {
        field.size = parseInt(x, 10);
      }
    });

  const type = /TYPE (.*)/i.exec(pcdHeader.str);
  if (type == undefined) {
    throw new Error("Bad PCD Header, No TYPE");
  }
  type[1]
    .trimRight()
    .split(" ")
    .map((x, i) => {
      const field = pcdHeader.fields[pcdHeader.fieldNames[i]];
      if (field != undefined) {
        field.type = x;
      }
    });

  const count = /COUNT (.*)/i.exec(pcdHeader.str);
  if (count != undefined) {
    count[1]
      .trimRight()
      .split(" ")
      .map((x, i) => {
        const field = pcdHeader.fields[pcdHeader.fieldNames[i]];
        if (field != undefined) {
          field.count = parseInt(x, 10);
        }
      });
  } else {
    pcdHeader.fieldNames.map((name) => {
      const field = pcdHeader.fields[name];
      if (field != undefined) {
        field.count = 1;
      }
    });
  }
  const width = /WIDTH (.*)/i.exec(pcdHeader.str);
  if (width != undefined) {
    pcdHeader.width = parseInt(width[1], 10);
  }
  const height = /HEIGHT (.*)/i.exec(pcdHeader.str);
  if (height != undefined) {
    pcdHeader.height = parseInt(height[1], 10);
  }
  const viewpoint = /VIEWPOINT (.*)/i.exec(pcdHeader.str);
  if (viewpoint != undefined) {
    pcdHeader.viewpoint = viewpoint[1];
  }
  const points = /POINTS (.*)/i.exec(pcdHeader.str);
  if (points != undefined) {
    pcdHeader.points = parseInt(points[1], 10);
  }

  if (
    pcdHeader.points === 0 &&
    typeof pcdHeader.width === "number" &&
    typeof pcdHeader.height === "number"
  ) {
    pcdHeader.points = pcdHeader.width * pcdHeader.height;
  }

  let sizeSum: number = 0;

  for (let i = 0; i < pcdHeader.fieldNames.length; i++) {
    const fieldObj = pcdHeader.fields[pcdHeader.fieldNames[i]];
    if (fieldObj == undefined) {
      continue;
    }
    if (pcdHeader.dataType === "ascii") {
      fieldObj.offset = i;
    } else {
      fieldObj.offset = sizeSum;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    sizeSum += fieldObj.size;
  }

  pcdHeader.rowSize = sizeSum;

  return pcdHeader;
}

function parsePCDASCII(origHeader: PCDHeader, textData: string): PCDInfo {
  const itemPerPoint = 4; // x, y, z, intensity or rgb
  const pointStep = itemPerPoint * float32bytes;

  const buffer = new Uint8Array(origHeader.points * pointStep);
  const dataview = new DataView(buffer.buffer);

  const fields = origHeader.fields;

  const pcdData = textData.slice(origHeader.headerLen);
  const lines = pcdData.split("\n");

  let offset = 0;
  for (const line of lines) {
    if (line !== "") {
      const numbers = line.trim().split(" ");
      const x = parseFloat(numbers[fields.x.offset]);
      const y = parseFloat(numbers[fields.y.offset]);
      const z = parseFloat(numbers[fields.z.offset]);
      dataview.setFloat32((offset + 0) * float32bytes, x, isLittleEndian);
      dataview.setFloat32((offset + 1) * float32bytes, y, isLittleEndian);
      dataview.setFloat32((offset + 2) * float32bytes, z, isLittleEndian);

      if (fields.rgb != undefined) {
        dataview.setUint32(
          (offset + 3) * uint32bytes,
          parseFloat(numbers[fields.rgb.offset]),
          isLittleEndian,
        );
      } else {
        // use distance for intensity
        dataview.setUint32(
          (offset + 3) * uint32bytes,
          Math.sqrt(x * x + y * y + z * z),
          isLittleEndian,
        );
      }
      offset += itemPerPoint;
    }
  }

  const newFields: PCDHeaderFields = {
    x: { count: 1, size: float32bytes, type: "F", offset: 0 * float32bytes },
    y: { count: 1, size: float32bytes, type: "F", offset: 1 * float32bytes },
    z: { count: 1, size: float32bytes, type: "F", offset: 2 * float32bytes },
  };

  const fieldNames = [...origHeader.fieldNames];
  if (origHeader.fields.rgb) {
    fieldNames.push("rgb");
    newFields.rgb = { count: 1, size: uint32bytes, type: "U", offset: 3 * float32bytes };
  } else {
    fieldNames.push("intensity");
    newFields.intensity = { count: 1, size: uint32bytes, type: "U", offset: 3 * float32bytes };
  }

  const newHeader: PCDHeader = {
    ...origHeader,
    fieldNames,
    fields: newFields,
    rowSize: pointStep,
  };

  return {
    header: newHeader,
    content: buffer,
  };
}

function parsePCDBinary(pcdHeader: PCDHeader, data: ArrayBufferLike): PCDInfo {
  const buffer = new Uint8Array(data, pcdHeader.headerLen);
  return {
    header: pcdHeader,
    content: buffer,
  };
}

/** Parse compressed PCD data in in binary_compressed form ( https://pointclouds.org/documentation/tutorials/pcd_file_format.html)
 * from https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PCDLoader.js
 */
function parsePCDBinaryCompressed(origHeader: PCDHeader, data: ArrayBufferLike): PCDInfo {
  const sizes = new Uint32Array(data.slice(origHeader.headerLen, origHeader.headerLen + 8));
  const compressedSize = sizes[0];
  const decompressedSize = sizes[1];
  const decompressed = decompressLZF(
    new Uint8Array(data, origHeader.headerLen + 8, compressedSize),
    decompressedSize,
  );

  const srcView = new DataView(decompressed.buffer);

  const pointStep = 3 * float32bytes + 1 * uint32bytes; // x, y, z, intensity or rgb

  const { points, fields } = origHeader;
  const buffer = new Uint8Array(points * pointStep);
  const destView = new DataView(buffer.buffer);

  for (let i = 0; i < points; i++) {
    const offset = i * pointStep;

    const x = srcView.getFloat32(points * fields.x.offset + fields.x.size * i, isLittleEndian);
    destView.setFloat32(offset, x, isLittleEndian);

    const y = srcView.getFloat32(points * fields.y.offset + fields.y.size * i, isLittleEndian);
    destView.setFloat32(offset + 1 * float32bytes, y, isLittleEndian);

    const z = srcView.getFloat32(points * fields.z.offset + fields.z.size * i, isLittleEndian);
    destView.setFloat32(offset + 2 * float32bytes, z, isLittleEndian);

    if (fields.rgb != undefined) {
      const colorOffset = offset + 3 * float32bytes;
      const r = srcView.getUint8(points * fields.rgb.offset + fields.rgb.size * i + 2);
      const g = srcView.getUint8(points * fields.rgb.offset + fields.rgb.size * i + 1);
      const b = srcView.getUint8(points * fields.rgb.offset + fields.rgb.size * i + 0);
      destView.setUint8(colorOffset, r);
      destView.setUint8(colorOffset + 1, g);
      destView.setUint8(colorOffset + 2, b);
    }
  }

  const newFields: PCDHeaderFields = {
    x: { count: 1, size: float32bytes, type: "F", offset: 0 * float32bytes },
    y: { count: 1, size: float32bytes, type: "F", offset: 1 * float32bytes },
    z: { count: 1, size: float32bytes, type: "F", offset: 2 * float32bytes },
  };

  const fieldNames = [...origHeader.fieldNames];
  if (origHeader.fields.rgb) {
    fieldNames.push("rgb");
    newFields.rgb = { count: 1, size: uint32bytes, type: "U", offset: 3 * float32bytes };
  } else {
    fieldNames.push("intensity");
    newFields.intensity = { count: 1, size: uint32bytes, type: "U", offset: 3 * float32bytes };
  }

  const newHeader: PCDHeader = {
    ...origHeader,
    fieldNames,
    fields: newFields,
    rowSize: pointStep,
  };

  return {
    header: newHeader,
    content: buffer,
  };
}

/**
 * from https://gitlab.com/taketwo/three-pcd-loader/blob/master/decompress-lzf.js
 * @param inData
 * @param outLength
 * @returns
 */
function decompressLZF(inData: Uint8Array, outLength: number): Uint8Array {
  const inLength = inData.length;
  const outData = new Uint8Array(outLength);
  let inPtr = 0;
  let outPtr = 0;
  let ctrl: number;
  let len;
  let ref;

  do {
    ctrl = inData[inPtr++];

    if (ctrl < 1 << 5) {
      ctrl++;
      if (outPtr + ctrl > outLength) {
        throw new Error("Output buffer is not large enough");
      }
      if (inPtr + ctrl > inLength) {
        throw new Error("Invalid compressed data");
      }

      do {
        outData[outPtr++] = inData[inPtr++];
      } while (--ctrl > 0);
    } else {
      len = ctrl >> 5;
      ref = outPtr - ((ctrl & 0x1f) << 8) - 1;
      if (inPtr >= inLength) {
        throw new Error("Invalid compressed data");
      }

      if (len === 7) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        len += inData[inPtr++];
        if (inPtr >= inLength) {
          throw new Error("Invalid compressed data");
        }
      }

      ref -= inData[inPtr++];
      if (outPtr + len + 2 > outLength) {
        throw new Error("Output buffer is not large enough");
      }
      if (ref < 0) {
        throw new Error("Invalid compressed data");
      }
      if (ref >= outPtr) {
        throw new Error("Invalid compressed data");
      }

      do {
        outData[outPtr++] = outData[ref++];
      } while (--len + 2 > 0);
    }
  } while (inPtr < inLength);

  return outData;
}
