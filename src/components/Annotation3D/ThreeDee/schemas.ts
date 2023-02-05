
export enum NumericType {
  UNKNOWN = 0,

  UINT8 = 1,

  INT8 = 2,

  UINT16 = 3,

  INT16 = 4,

  UINT32 = 5,

  INT32 = 6,

  FLOAT32 = 7,

  FLOAT64 = 8,
}


export type PackedElementField = {
  /** Name of the field */
  name: string;

  /** Byte offset from start of data buffer */
  offset: number;

  /** Type of data in the field. Integers are stored using little-endian byte order. */
  type: NumericType;
};
