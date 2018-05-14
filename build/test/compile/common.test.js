/* tslint:disable:quotemark */
import { assert } from 'chai';
import { numberFormat, timeFormatExpression } from '../../src/compile/common';
import { defaultConfig } from '../../src/config';
import { vgField } from '../../src/fielddef';
import { TimeUnit } from '../../src/timeunit';
import { NOMINAL, ORDINAL, QUANTITATIVE, TEMPORAL } from '../../src/type';
describe('Common', function () {
    describe('timeFormat()', function () {
        it('should get the right time expression for month with shortTimeLabels=true', function () {
            var fieldDef = { timeUnit: TimeUnit.MONTH, field: 'a', type: TEMPORAL };
            var expression = timeFormatExpression(vgField(fieldDef, { expr: 'datum' }), TimeUnit.MONTH, undefined, true, defaultConfig.timeFormat, false);
            assert.equal(expression, "timeFormat(datum[\"month_a\"], '%b')");
        });
        it('should get the right time expression for month with shortTimeLabels=false', function () {
            var fieldDef = { timeUnit: TimeUnit.MONTH, field: 'a', type: TEMPORAL };
            var expression = timeFormatExpression(vgField(fieldDef, { expr: 'datum' }), TimeUnit.MONTH, undefined, false, defaultConfig.timeFormat, false);
            assert.equal(expression, "timeFormat(datum[\"month_a\"], '%B')");
        });
        it('should get the right time expression for yearmonth with custom format', function () {
            var fieldDef = { timeUnit: TimeUnit.YEARMONTH, field: 'a', type: TEMPORAL };
            var expression = timeFormatExpression(vgField(fieldDef, { expr: 'datum' }), TimeUnit.MONTH, '%Y', true, defaultConfig.timeFormat, false);
            assert.equal(expression, "timeFormat(datum[\"yearmonth_a\"], '%Y')");
        });
        it('should get the right time expression for quarter', function () {
            var fieldDef = { timeUnit: TimeUnit.QUARTER, field: 'a', type: TEMPORAL };
            var expression = timeFormatExpression(vgField(fieldDef, { expr: 'datum' }), TimeUnit.QUARTER, undefined, true, defaultConfig.timeFormat, false);
            assert.equal(expression, "'Q' + quarter(datum[\"quarter_a\"])");
        });
        it('should get the right time expression for yearquarter', function () {
            var expression = timeFormatExpression('datum["data"]', TimeUnit.YEARQUARTER, undefined, true, defaultConfig.timeFormat, false);
            assert.equal(expression, "'Q' + quarter(datum[\"data\"]) + ' ' + timeFormat(datum[\"data\"], '%y')");
        });
        it('should get the right time expression for yearmonth with custom format and utc scale type', function () {
            var fieldDef = { timeUnit: TimeUnit.YEARMONTH, field: 'a', type: TEMPORAL };
            var expression = timeFormatExpression(vgField(fieldDef, { expr: 'datum' }), TimeUnit.MONTH, '%Y', true, defaultConfig.timeFormat, true);
            assert.equal(expression, "utcFormat(datum[\"yearmonth_a\"], '%Y')");
        });
    });
    describe('numberFormat()', function () {
        it('should use number format for quantitative scale', function () {
            assert.equal(numberFormat({ field: 'a', type: QUANTITATIVE }, undefined, { numberFormat: 'd' }), 'd');
        });
        it('should support empty number format', function () {
            assert.equal(numberFormat({ field: 'a', type: QUANTITATIVE }, undefined, { numberFormat: '' }), '');
        });
        it('should use format if provided', function () {
            assert.equal(numberFormat({ field: 'a', type: QUANTITATIVE }, 'a', {}), 'a');
        });
        it('should not use number format for binned quantitative scale', function () {
            assert.equal(numberFormat({ bin: true, field: 'a', type: QUANTITATIVE }, undefined, {}), undefined);
        });
        it('should not use number format for non-quantitative scale', function () {
            for (var _i = 0, _a = [TEMPORAL, NOMINAL, ORDINAL]; _i < _a.length; _i++) {
                var type = _a[_i];
                assert.equal(numberFormat({ bin: true, field: 'a', type: type }, undefined, {}), undefined);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbXBpbGUvY29tbW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOEJBQThCO0FBRTlCLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxFQUFDLFlBQVksRUFBRSxvQkFBb0IsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQzVFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDM0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RSxRQUFRLENBQUMsUUFBUSxFQUFFO0lBQ2pCLFFBQVEsQ0FBQyxjQUFjLEVBQUU7UUFDdkIsRUFBRSxDQUFDLDBFQUEwRSxFQUFFO1lBQzdFLElBQU0sUUFBUSxHQUFHLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7WUFDeEUsSUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLHNDQUFvQyxDQUFDLENBQUM7UUFDakUsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsMkVBQTJFLEVBQUU7WUFDOUUsSUFBTSxRQUFRLEdB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LFNBQVMsQ0FBQyxDQUFDO2FBQzNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6cXVvdGVtYXJrICovXG5cbmltcG9ydCB7YXNzZXJ0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7bnVtYmVyRm9ybWF0LCB0aW1lRm9ybWF0RXhwcmVzc2lvbn0gZnJvbSAnLi4vLi4vc3JjL2NvbXBpbGUvY29tbW9uJztcbmltcG9ydCB7ZGVmYXVsdENvbmZpZ30gZnJvbSAnLi4vLi4vc3JjL2NvbmZpZyc7XG5pbXBvcnQge3ZnRmllbGR9IGZyb20gJy4uLy4uL3NyYy9maWVsZGRlZic7XG5pbXBvcnQge1RpbWVVbml0fSBmcm9tICcuLi8uLi9zcmMvdGltZXVuaXQnO1xuaW1wb3J0IHtOT01JTkFMLCBPUkRJTkFMLCBRVUFOVElUQVRJVkUsIFRFTVBPUkFMfSBmcm9tICcuLi8uLi9zcmMvdHlwZSc7XG5cbmRlc2NyaWJlKCdDb21tb24nLCBmdW5jdGlvbigpIHtcbiAgZGVzY3JpYmUoJ3RpbWVGb3JtYXQoKScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdzaG91bGQgZ2V0IHRoZSByaWdodCB0aW1lIGV4cHJlc3Npb24gZm9yIG1vbnRoIHdpdGggc2hvcnRUaW1lTGFiZWxzPXRydWUnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGZpZWxkRGVmID0ge3RpbWVVbml0OiBUaW1lVW5pdC5NT05USCwgZmllbGQ6ICdhJywgdHlwZTogVEVNUE9SQUx9O1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHRpbWVGb3JtYXRFeHByZXNzaW9uKHZnRmllbGQoZmllbGREZWYsIHtleHByOiAnZGF0dW0nfSksIFRpbWVVbml0Lk1PTlRILCB1bmRlZmluZWQsIHRydWUsIGRlZmF1bHRDb25maWcudGltZUZvcm1hdCwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGV4cHJlc3Npb24sIGB0aW1lRm9ybWF0KGRhdHVtW1wibW9udGhfYVwiXSwgJyViJylgKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZ2V0IHRoZSByaWdodCB0aW1lIGV4cHJlc3Npb24gZm9yIG1vbnRoIHdpdGggc2hvcnRUaW1lTGFiZWxzPWZhbHNlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBmaWVsZERlZiA9IHt0aW1lVW5pdDogVGltZVVuaXQuTU9OVEgsIGZpZWxkOiAnYScsIHR5cGU6IFRFTVBPUkFMfTtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aW1lRm9ybWF0RXhwcmVzc2lvbih2Z0ZpZWxkKGZpZWxkRGVmLCB7ZXhwcjogJ2RhdHVtJ30pLCBUaW1lVW5pdC5NT05USCwgdW5kZWZpbmVkLCBmYWxzZSwgZGVmYXVsdENvbmZpZy50aW1lRm9ybWF0LCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoZXhwcmVzc2lvbiwgYHRpbWVGb3JtYXQoZGF0dW1bXCJtb250aF9hXCJdLCAnJUInKWApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBnZXQgdGhlIHJpZ2h0IHRpbWUgZXhwcmVzc2lvbiBmb3IgeWVhcm1vbnRoIHdpdGggY3VzdG9tIGZvcm1hdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZmllbGREZWYgPSB7dGltZVVuaXQ6IFRpbWVVbml0LllFQVJNT05USCwgZmllbGQ6ICdhJywgdHlwZTogVEVNUE9SQUx9O1xuICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHRpbWVGb3JtYXRFeHByZXNzaW9uKHZnRmllbGQoZmllbGREZWYsIHtleHByOiAnZGF0dW0nfSksIFRpbWVVbml0Lk1PTlRILCAnJVknLCB0cnVlLCBkZWZhdWx0Q29uZmlnLnRpbWVGb3JtYXQsIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChleHByZXNzaW9uLCBgdGltZUZvcm1hdChkYXR1bVtcInllYXJtb250aF9hXCJdLCAnJVknKWApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBnZXQgdGhlIHJpZ2h0IHRpbWUgZXhwcmVzc2lvbiBmb3IgcXVhcnRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZmllbGREZWYgPSB7dGltZVVuaXQ6IFRpbWVVbml0LlFVQVJURVIsIGZpZWxkOiAnYScsIHR5cGU6IFRFTVBPUkFMfTtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aW1lRm9ybWF0RXhwcmVzc2lvbih2Z0ZpZWxkKGZpZWxkRGVmLCB7ZXhwcjogJ2RhdHVtJ30pLCBUaW1lVW5pdC5RVUFSVEVSLCB1bmRlZmluZWQsIHRydWUsIGRlZmF1bHRDb25maWcudGltZUZvcm1hdCwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGV4cHJlc3Npb24sIGAnUScgKyBxdWFydGVyKGRhdHVtW1wicXVhcnRlcl9hXCJdKWApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBnZXQgdGhlIHJpZ2h0IHRpbWUgZXhwcmVzc2lvbiBmb3IgeWVhcnF1YXJ0ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aW1lRm9ybWF0RXhwcmVzc2lvbignZGF0dW1bXCJkYXRhXCJdJywgVGltZVVuaXQuWUVBUlFVQVJURVIsIHVuZGVmaW5lZCwgdHJ1ZSwgZGVmYXVsdENvbmZpZy50aW1lRm9ybWF0LCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoZXhwcmVzc2lvbiwgYCdRJyArIHF1YXJ0ZXIoZGF0dW1bXCJkYXRhXCJdKSArICcgJyArIHRpbWVGb3JtYXQoZGF0dW1bXCJkYXRhXCJdLCAnJXknKWApO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBnZXQgdGhlIHJpZ2h0IHRpbWUgZXhwcmVzc2lvbiBmb3IgeWVhcm1vbnRoIHdpdGggY3VzdG9tIGZvcm1hdCBhbmQgdXRjIHNjYWxlIHR5cGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGZpZWxkRGVmID0ge3RpbWVVbml0OiBUaW1lVW5pdC5ZRUFSTU9OVEgsIGZpZWxkOiAnYScsIHR5cGU6IFRFTVBPUkFMfTtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aW1lRm9ybWF0RXhwcmVzc2lvbih2Z0ZpZWxkKGZpZWxkRGVmLCB7ZXhwcjogJ2RhdHVtJ30pLCBUaW1lVW5pdC5NT05USCwgJyVZJywgdHJ1ZSwgZGVmYXVsdENvbmZpZy50aW1lRm9ybWF0LCB0cnVlKTtcbiAgICAgIGFzc2VydC5lcXVhbChleHByZXNzaW9uLCBgdXRjRm9ybWF0KGRhdHVtW1wieWVhcm1vbnRoX2FcIl0sICclWScpYCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudW1iZXJGb3JtYXQoKScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdzaG91bGQgdXNlIG51bWJlciBmb3JtYXQgZm9yIHF1YW50aXRhdGl2ZSBzY2FsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgYXNzZXJ0LmVxdWFsKG51bWJlckZvcm1hdCh7ZmllbGQ6ICdhJywgdHlwZTogUVVBTlRJVEFUSVZFfSwgdW5kZWZpbmVkLCB7bnVtYmVyRm9ybWF0OiAnZCd9KSwgJ2QnKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc3VwcG9ydCBlbXB0eSBudW1iZXIgZm9ybWF0JywgZnVuY3Rpb24oKSB7XG4gICAgICBhc3NlcnQuZXF1YWwobnVtYmVyRm9ybWF0KHtmaWVsZDogJ2EnLCB0eXBlOiBRVUFOVElUQVRJVkV9LCB1bmRlZmluZWQsIHtudW1iZXJGb3JtYXQ6ICcnfSksICcnKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgdXNlIGZvcm1hdCBpZiBwcm92aWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgYXNzZXJ0LmVxdWFsKG51bWJlckZvcm1hdCh7ZmllbGQ6ICdhJywgdHlwZTogUVVBTlRJVEFUSVZFfSwgJ2EnLCB7fSksICdhJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCB1c2UgbnVtYmVyIGZvcm1hdCBmb3IgYmlubmVkIHF1YW50aXRhdGl2ZSBzY2FsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgYXNzZXJ0LmVxdWFsKG51bWJlckZvcm1hdCh7YmluOiB0cnVlLCBmaWVsZDogJ2EnLCB0eXBlOiBRVUFOVElUQVRJVkV9LCB1bmRlZmluZWQsIHt9KSwgdW5kZWZpbmVkKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IHVzZSBudW1iZXIgZm9ybWF0IGZvciBub24tcXVhbnRpdGF0aXZlIHNjYWxlJywgZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgW1RFTVBPUkFMLCBOT01JTkFMLCBPUkRJTkFMXSkge1xuICAgICAgICBhc3NlcnQuZXF1YWwobnVtYmVyRm9ybWF0KHtiaW46IHRydWUsIGZpZWxkOiAnYScsIHR5cGU6IHR5cGV9LCB1bmRlZmluZWQsIHt9KSwgdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==