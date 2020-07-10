export const isPointAtRoot = (point) => point.path.length === 2;

/*
 * Returns true if cursor is at block level (not in inner node child)
 *
 * TODO: confirm this description
 */
export const isRangeAtRoot = (range) => {
  console.log('isRangeAtRoot', range);
  return isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);
};
