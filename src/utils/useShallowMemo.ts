import { useRef } from "react";
import shallowequal from "shallowequal";

/** Continues to return the same instance as long as shallow equality is maintained. */
export default function useShallowMemo<T>(value: T): T {
  const ref = useRef(value);
  if (shallowequal(value, ref.current)) {
    return ref.current;
  }
  ref.current = value;
  return value;
}
