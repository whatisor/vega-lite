import {AggregateOp} from 'vega';
import {isArray, isString} from 'vega-util';

import {VgComparatorOrder} from './vega.schema';


export type SortOrder = VgComparatorOrder | null;


/**
 * A sort definition for transform
 */
export interface SortField {
  /**
   * The name of the field to sort.
   */
  field: string;

  /**
   * Whether to sort the field in ascending or descending order.
   */
  order?: VgComparatorOrder;
}


/**
 * A sort definition for sorting a discrete scale in an encoding field definition.
 */

export interface EncodingSortField<F> {
  /**
   * The data [field](field.html) to sort by.
   *
   * __Default value:__ If unspecified, defaults to the field specified in the outer data reference.
   */
  field?: F;
  /**
   * An [aggregate operation](aggregate.html#ops) to perform on the field prior to sorting (e.g., `"count"`, `"mean"` and `"median"`).
   * This property is required in cases where the sort field and the data reference field do not match.
   * The input data objects will be aggregated, grouped by the encoded data field.
   *
   * For a full list of operations, please see the documentation for [aggregate](aggregate.html#ops).
   */
  op: AggregateOp;

  /**
   * The sort order. One of `"ascending"` (default), `"descending"`, or `null` (no not sort).
   */
  order?: SortOrder;
}

export function isSortField<F>(sort: string[] | SortOrder | EncodingSortField<F>): sort is EncodingSortField<F> {
  return !!sort && (sort['op'] === 'count' || !!sort['field']) && !!sort['op'];
}

export function isSortArray<F>(sort: string[] | SortOrder | EncodingSortField<F>): sort is string[] {
  return !!sort && isArray(sort) && sort.every(s => isString(s));
}
