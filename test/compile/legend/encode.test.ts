import {assert} from 'chai';
import {COLOR} from '../../../src/channel';
import * as encode from '../../../src/compile/legend/encode';
import {TimeUnit} from '../../../src/timeunit';
import {TEMPORAL} from '../../../src/type';
import {parseUnitModelWithScale} from '../../util';

describe('compile/legend', () => {
  describe('encode.symbols', () => {
    it('should not have fill, strokeDash, or strokeDashOffset', () => {
      const symbol = encode.symbols(
        {field: 'a', type: 'nominal'},
        {},
        parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'nominal'},
            color: {field: 'a', type: 'nominal'}
          }
        }),
        COLOR,
        'symbol'
      );
      assert.deepEqual(symbol.fill, {value: 'transparent'});
      assert.isUndefined((symbol || {}).strokeDash);
      assert.isUndefined((symbol || {}).strokeDashOffset);
    });

    it('should return specific symbols.shape.value if user has specified', () => {
      const symbol = encode.symbols(
        {field: 'a', type: 'nominal'},
        {},
        parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'nominal'},
            shape: {value: 'square'}
          }
        }),
        COLOR,
        'symbol'
      );
      assert.deepEqual(symbol.shape['value'], 'square');
    });

    it('should have default opacity', () => {
      const symbol = encode.symbols(
        {field: 'a', type: 'nominal'},
        {},
        parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'nominal'}
          }
        }),
        COLOR,
        'symbol'
      );
      assert.deepEqual(symbol.opacity['value'], 0.7); // default opacity is 0.7.
    });

    it('should return the maximum value when there is a condition', () => {
      const symbol = encode.symbols(
        {field: 'a', type: 'nominal'},
        {},
        parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'nominal'},
            opacity: {
              condition: {selection: 'brush', value: 1},
              value: 0
            }
          }
        }),
        COLOR,
        'symbol'
      );
      assert.deepEqual(symbol.opacity['value'], 1);
    });
  });

  describe('encode.gradient', () => {
    it('should have default opacity', () => {
      const gradient = encode.gradient(
        {field: 'a', type: 'quantitative'},
        {},
        parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        }),
        COLOR,
        'gradient'
      );

      assert.deepEqual(gradient.opacity['value'], 0.7); // default opacity is 0.7.
    });
  });

  describe('encode.labels', () => {
    it('should return correct expression for the timeUnit: TimeUnit.MONTH', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'temporal'},
          color: {field: 'a', type: 'temporal', timeUnit: 'month'}
        }
      });

      const fieldDef = {field: 'a', type: TEMPORAL, timeUnit: TimeUnit.MONTH};
      const label = encode.labels(fieldDef, {}, model, COLOR, 'gradient');
      const expected = `timeFormat(datum.value, '%b')`;
      assert.deepEqual(label.text.signal, expected);
    });

    it('should return correct expression for the timeUnit: TimeUnit.QUARTER', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'temporal'},
          color: {field: 'a', type: 'temporal', timeUnit: 'quarter'}
        }
      });

      const fieldDef = {field: 'a', type: TEMPORAL, timeUnit: TimeUnit.QUARTER};
      const label = encode.labels(fieldDef, {}, model, COLOR, 'gradient');
      const expected = `'Q' + quarter(datum.value)`;
      assert.deepEqual(label.text.signal, expected);
    });
  });
});
