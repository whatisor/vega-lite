/* tslint:disable:quotemark */
import { assert } from 'chai';
import { parseFacetModel, parseUnitModelWithScaleAndLayoutSize } from '../../util';
import { X } from '../../../src/channel';
import { sizeSignals } from '../../../src/compile/layoutsize/assemble';
import * as log from '../../../src/log';
describe('compile/layout', function () {
    describe('sizeExpr', function () {
        it('should return correct formula for ordinal-point scale', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'ordinal' }
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{
                    name: 'x_step',
                    value: 21
                }, {
                    name: 'width',
                    update: 'bandspace(domain(\'x\').length, 1, 0.5) * x_step'
                }]);
        });
        it('should return correct formula for ordinal-band scale with custom padding', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'rect',
                encoding: {
                    x: { field: 'a', type: 'ordinal', scale: { padding: 0.3 } },
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{
                    name: 'x_step',
                    value: 21
                }, {
                    name: 'width',
                    update: 'bandspace(domain(\'x\').length, 0.3, 0.3) * x_step'
                }]);
        });
        it('should return correct formula for ordinal-band scale with custom paddingInner', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'rect',
                encoding: {
                    x: { field: 'a', type: 'ordinal', scale: { paddingInner: 0.3 } },
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{
                    name: 'x_step',
                    value: 21
                }, {
                    name: 'width',
                    update: 'bandspace(domain(\'x\').length, 0.3, 0.15) * x_step'
                }]);
        });
        it('should return only step if parent is facet', function () {
            var model = parseFacetModel({
                facet: {
                    row: { field: 'a', type: 'ordinal' }
                },
                spec: {
                    mark: 'point',
                    encoding: {
                        x: { field: 'b', type: 'nominal' }
                    }
                },
                resolve: {
                    scale: { x: 'independent' }
                }
            });
            model.parseScale();
            model.parseLayoutSize();
            var size = sizeSignals(model.child, 'width');
            assert.deepEqual(size, [{
                    name: 'child_x_step',
                    value: 21
                }]);
        });
        it('should return static view size for ordinal x-scale with null', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'ordinal', scale: { rangeStep: null } }
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{ name: 'width', value: 200 }]);
        });
        it('should return static view size for ordinal y-scale with null', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'point',
                encoding: {
                    y: { field: 'a', type: 'ordinal', scale: { rangeStep: null } }
                }
            });
            var size = sizeSignals(model, 'height');
            assert.deepEqual(size, [{ name: 'height', value: 200 }]);
        });
        it('should return static view size for ordinal scale with top-level width', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                width: 205,
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'ordinal' }
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{ name: 'width', value: 205 }]);
        });
        it('should return static view size for ordinal scale with top-level width even if there is numeric rangeStep', log.wrap(function (localLogger) {
            var model = parseUnitModelWithScaleAndLayoutSize({
                width: 205,
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'ordinal', scale: { rangeStep: 21 } }
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{ name: 'width', value: 205 }]);
            assert.equal(localLogger.warns[0], log.message.rangeStepDropped(X));
        }));
        it('should return static view width for non-ordinal x-scale', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'quantitative' }
                }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{ name: 'width', value: 200 }]);
        });
        it('should return static view size for non-ordinal y-scale', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'point',
                encoding: {
                    y: { field: 'a', type: 'quantitative' }
                }
            });
            var size = sizeSignals(model, 'height');
            assert.deepEqual(size, [{ name: 'height', value: 200 }]);
        });
        it('should return default rangeStep if axis is not mapped', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'point',
                encoding: {},
                config: { scale: { rangeStep: 17 } }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{ name: 'width', value: 17 }]);
        });
        it('should return textXRangeStep if axis is not mapped for X of text mark', function () {
            var model = parseUnitModelWithScaleAndLayoutSize({
                mark: 'text',
                encoding: {},
                config: { scale: { textXRangeStep: 91 } }
            });
            var size = sizeSignals(model, 'width');
            assert.deepEqual(size, [{ name: 'width', value: 91 }]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZW1ibGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvY29tcGlsZS9sYXlvdXRzaXplL2Fzc2VtYmxlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOEJBQThCO0FBRTlCLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxFQUFDLGVBQWUsRUFBRSxvQ0FBb0MsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVqRixPQUFPLEVBQUMsQ0FBQyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdkMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ3JFLE9BQU8sS0FBSyxHQUFHLE1BQU0sa0JBQWtCLENBQUM7QUFFeEMsUUFBUSxDQUFDLGdCQUFnQixFQUFFO0lBQ3pCLFFBQVEsQ0FBQyxVQUFVLEVBQUU7UUFDbkIsRUFBRSxDQUFDLHVEQUF1RCxFQUFFO1lBQzFELElBQU0sS0FBSyxHQUFHLG9DQUFvQyxDQUFDO2dCQUNqRCxJQUFJLEVBQUUsT0FBTztnQkFDYixRQUFRLEVBQUU7b0JBQ1IsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2lCQUNqQzthQUNGLENBQUMsQ0FBQztZQUVILElBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLEVBQUU7aUJBQ1YsRUFBQztvQkFDQSxJQUFJLEVBQUUsT0FBTztvQkFDYixNQUFNLEVBQUUsa0RBQWtEO2lCQUMzRCxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDBFQUEwRSxFQUFFO1lBQzdFLElBQU0sS0FBSyxHQUFHLG9DQUFvQyxDQUFDO2dCQUNqRCxJQUFJLEVBQUUsTUFBTTtnQkFDWixRQUFRLEVBQUU7b0JBQ1IsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUMsRUFBQztpQkFDeEQ7YUFDRixDQUFDLENBQUM7WUFFSCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3RCLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxFQUFFO2lCQUNWLEVBQUM7b0JBQ0EsSUFBSSxFQUFFLE9BQU87b0JBQ2IsTUFBTSxFQUFFLG9EQUFvRDtpQkFDN0QsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrRUFBK0UsRUFBRTtZQUNsRixJQUFNLEtBQUssR0FBRyxvQ0FBb0MsQ0FBQztnQkFDakQsSUFBSSxFQUFFLE1BQU07Z0JBQ1osUUFBUSxFQUFFO29CQUNSLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBQyxZQUFZLEVBQUUsR0FBRyxFQUFDLEVBQUM7aUJBQzdEO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN0QixJQUFJLEVBQUUsUUFBUTtvQkFDZCxLQUFLLEVBQUUsRUFBRTtpQkFDVixFQUFDO29CQUNBLElBQUksRUFBRSxPQUFPO29CQUNiLE1BQU0sRUFBRSxxREFBcUQ7aUJBQzlELENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFHSCxFQUFFLENBQUMsNENBQTRDLEVBQUU7WUFDL0MsSUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDO2dCQUM1QixLQUFLLEVBQUU7b0JBQ0wsR0FBRyxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2lCQUNuQztnQkFDRCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLE9BQU87b0JBQ2IsUUFBUSxFQUFFO3dCQUNSLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztxQkFDakM7aUJBQ0Y7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLEtBQUssRUFBRSxFQUFDLENBQUMsRUFBRSxhQUFhLEVBQUM7aUJBQzFCO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25CLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUV4QixJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN0QixJQUFJLEVBQUUsY0FBYztvQkFDcEIsS0FBSyxFQUFFLEVBQUU7aUJBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw4REFBOEQsRUFBRTtZQUNqRSxJQUFNLEtBQUssR0FBRyxvQ0FBb0MsQ0FBQztnQkFDakQsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsUUFBUSxFQUFFO29CQUNSLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLEVBQUM7aUJBQzNEO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBR0gsRUFBRSxDQUFDLDhEQUE4RCxFQUFFO1lBQ2pFLElBQU0sS0FBSyxHQUFHLG9DQUFvQyxDQUFDO2dCQUNqRCxJQUFJLEVBQUUsT0FBTztnQkFDYixRQUFRLEVBQUU7b0JBQ1IsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUMsRUFBQztpQkFDM0Q7YUFDRixDQUFDLENBQUM7WUFFSCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUVBQXVFLEVBQUU7WUFDMUUsSUFBTSxLQUFLLEdBQUcsb0NBQW9DLENBQUM7Z0JBQ2pELEtBQUssRUFBRSxHQUFHO2dCQUNWLElBQUksRUFBRSxPQUFPO2dCQUNiLFFBQVEsRUFBRTtvQkFDUixDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7aUJBQ2pDO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDBHQUEwRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBQyxXQUFXO1lBQ2xJLElBQU0sS0FBSyxHQUFHLG9DQUFvQyxDQUFDO2dCQUNqRCxLQUFLLEVBQUUsR0FBRztnQkFDVixJQUFJLEVBQUUsT0FBTztnQkFDYixRQUFRLEVBQUU7b0JBQ1IsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUMsRUFBQztpQkFDekQ7YUFDRixDQUFDLENBQUM7WUFFSCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosRUFBRSxDQUFDLHlEQUF5RCxFQUFFO1lBQzVELElBQU0sS0FBSyxHQUFHLG9DQUFvQyxDQUFDO2dCQUNqRCxJQUFJLEVBQUUsT0FBTztnQkFDYixRQUFRLEVBQUU7b0JBQ1IsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2lCQUN0QzthQUNGLENBQUMsQ0FBQztZQUVILElBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUdILEVBQUUsQ0FBQyx3REFBd0QsRUFBRTtZQUMzRCxJQUFNLEtBQUssR0FBRyxvQ0FBb0MsQ0FBQztnQkFDakQsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsUUFBUSxFQUFFO29CQUNSLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztpQkFDdEM7YUFDRixDQUFDLENBQUM7WUFFSCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdURBQXVELEVBQUU7WUFDMUQsSUFBTSxLQUFLLEdBQUcsb0NBQW9DLENBQUM7Z0JBQ2pELElBQUksRUFBRSxPQUFPO2dCQUNiLFFBQVEsRUFBRSxFQUFFO2dCQUNaLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUMsRUFBQzthQUNqQyxDQUFDLENBQUM7WUFDSCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUVBQXVFLEVBQUU7WUFDMUUsSUFBTSxLQUFLLEdBQUcsb0NBQW9DLENBQUM7Z0JBQ2pELElBQUksRUFBRSxNQUFNO2dCQUNaLFFBQVEsRUFBRSxFQUFFO2dCQUNaLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUMsRUFBQzthQUN0QyxDQUFDLENBQUM7WUFDSCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6cXVvdGVtYXJrICovXG5cbmltcG9ydCB7YXNzZXJ0fSBmcm9tICdjaGFpJztcbmltcG9ydCB7cGFyc2VGYWNldE1vZGVsLCBwYXJzZVVuaXRNb2RlbFdpdGhTY2FsZUFuZExheW91dFNpemV9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5pbXBvcnQge1h9IGZyb20gJy4uLy4uLy4uL3NyYy9jaGFubmVsJztcbmltcG9ydCB7c2l6ZVNpZ25hbHN9IGZyb20gJy4uLy4uLy4uL3NyYy9jb21waWxlL2xheW91dHNpemUvYXNzZW1ibGUnO1xuaW1wb3J0ICogYXMgbG9nIGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG5kZXNjcmliZSgnY29tcGlsZS9sYXlvdXQnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdzaXplRXhwcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBjb3JyZWN0IGZvcm11bGEgZm9yIG9yZGluYWwtcG9pbnQgc2NhbGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbCA9IHBhcnNlVW5pdE1vZGVsV2l0aFNjYWxlQW5kTGF5b3V0U2l6ZSh7XG4gICAgICAgIG1hcms6ICdwb2ludCcsIC8vIHBvaW50IG1hcmsgcHJvZHVjZSBvcmRpbmFsLXBvaW50IHNjYWxlIGJ5IGRlZmF1bHRcbiAgICAgICAgZW5jb2Rpbmc6IHtcbiAgICAgICAgICB4OiB7ZmllbGQ6ICdhJywgdHlwZTogJ29yZGluYWwnfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgc2l6ZSA9IHNpemVTaWduYWxzKG1vZGVsLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoc2l6ZSwgW3tcbiAgICAgICAgbmFtZTogJ3hfc3RlcCcsXG4gICAgICAgIHZhbHVlOiAyMVxuICAgICAgfSx7XG4gICAgICAgIG5hbWU6ICd3aWR0aCcsXG4gICAgICAgIHVwZGF0ZTogJ2JhbmRzcGFjZShkb21haW4oXFwneFxcJykubGVuZ3RoLCAxLCAwLjUpICogeF9zdGVwJ1xuICAgICAgfV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gY29ycmVjdCBmb3JtdWxhIGZvciBvcmRpbmFsLWJhbmQgc2NhbGUgd2l0aCBjdXN0b20gcGFkZGluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGVsID0gcGFyc2VVbml0TW9kZWxXaXRoU2NhbGVBbmRMYXlvdXRTaXplKHtcbiAgICAgICAgbWFyazogJ3JlY3QnLCAvLyByZWN0IHByb2R1Y2VzIG9yZGluYWwtYmFuZCBieSBkZWZhdWx0XG4gICAgICAgIGVuY29kaW5nOiB7XG4gICAgICAgICAgeDoge2ZpZWxkOiAnYScsIHR5cGU6ICdvcmRpbmFsJywgc2NhbGU6IHtwYWRkaW5nOiAwLjN9fSxcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNpemUgPSBzaXplU2lnbmFscyhtb2RlbCwgJ3dpZHRoJyk7XG4gICAgICBhc3NlcnQuZGVlcEVxdWFsKHNpemUsIFt7XG4gICAgICAgIG5hbWU6ICd4X3N0ZXAnLFxuICAgICAgICB2YWx1ZTogMjFcbiAgICAgIH0se1xuICAgICAgICBuYW1lOiAnd2lkdGgnLFxuICAgICAgICB1cGRhdGU6ICdiYW5kc3BhY2UoZG9tYWluKFxcJ3hcXCcpLmxlbmd0aCwgMC4zLCAwLjMpICogeF9zdGVwJ1xuICAgICAgfV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gY29ycmVjdCBmb3JtdWxhIGZvciBvcmRpbmFsLWJhbmQgc2NhbGUgd2l0aCBjdXN0b20gcGFkZGluZ0lubmVyJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kZWwgPSBwYXJzZVVuaXRNb2RlbFdpdGhTY2FsZUFuZExheW91dFNpemUoe1xuICAgICAgICBtYXJrOiAncmVjdCcsIC8vIHJlY3QgcHJvZHVjZXMgb3JkaW5hbC1iYW5kIGJ5IGRlZmF1bHRcbiAgICAgICAgZW5jb2Rpbmc6IHtcbiAgICAgICAgICB4OiB7ZmllbGQ6ICdhJywgdHlwZTogJ29yZGluYWwnLCBzY2FsZToge3BhZGRpbmdJbm5lcjogMC4zfX0sXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBzaXplID0gc2l6ZVNpZ25hbHMobW9kZWwsICd3aWR0aCcpO1xuICAgICAgYXNzZXJ0LmRlZXBFcXVhbChzaXplLCBbe1xuICAgICAgICBuYW1lOiAneF9zdGVwJyxcbiAgICAgICAgdmFsdWU6IDIxXG4gICAgICB9LHtcbiAgICAgICAgbmFtZTogJ3dpZHRoJyxcbiAgICAgICAgdXBkYXRlOiAnYmFuZHNwYWNlKGRvbWFpbihcXCd4XFwnKS5sZW5ndGgsIDAuMywgMC4xNSkgKiB4X3N0ZXAnXG4gICAgICB9XSk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIG9ubHkgc3RlcCBpZiBwYXJlbnQgaXMgZmFjZXQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbCA9IHBhcnNlRmFjZXRNb2RlbCh7XG4gICAgICAgIGZhY2V0OiB7XG4gICAgICAgICAgcm93OiB7ZmllbGQ6ICdhJywgdHlwZTogJ29yZGluYWwnfVxuICAgICAgICB9LFxuICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgbWFyazogJ3BvaW50JyxcbiAgICAgICAgICBlbmNvZGluZzoge1xuICAgICAgICAgICAgeDoge2ZpZWxkOiAnYicsIHR5cGU6ICdub21pbmFsJ31cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBzY2FsZToge3g6ICdpbmRlcGVuZGVudCd9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbW9kZWwucGFyc2VTY2FsZSgpO1xuICAgICAgbW9kZWwucGFyc2VMYXlvdXRTaXplKCk7XG5cbiAgICAgIGNvbnN0IHNpemUgPSBzaXplU2lnbmFscyhtb2RlbC5jaGlsZCwgJ3dpZHRoJyk7XG4gICAgICBhc3NlcnQuZGVlcEVxdWFsKHNpemUsIFt7XG4gICAgICAgIG5hbWU6ICdjaGlsZF94X3N0ZXAnLFxuICAgICAgICB2YWx1ZTogMjFcbiAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHN0YXRpYyB2aWV3IHNpemUgZm9yIG9yZGluYWwgeC1zY2FsZSB3aXRoIG51bGwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbCA9IHBhcnNlVW5pdE1vZGVsV2l0aFNjYWxlQW5kTGF5b3V0U2l6ZSh7XG4gICAgICAgIG1hcms6ICdwb2ludCcsXG4gICAgICAgIGVuY29kaW5nOiB7XG4gICAgICAgICAgeDoge2ZpZWxkOiAnYScsIHR5cGU6ICdvcmRpbmFsJywgc2NhbGU6IHtyYW5nZVN0ZXA6IG51bGx9fVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgc2l6ZSA9IHNpemVTaWduYWxzKG1vZGVsLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoc2l6ZSwgW3tuYW1lOiAnd2lkdGgnLCB2YWx1ZTogMjAwfV0pO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzdGF0aWMgdmlldyBzaXplIGZvciBvcmRpbmFsIHktc2NhbGUgd2l0aCBudWxsJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kZWwgPSBwYXJzZVVuaXRNb2RlbFdpdGhTY2FsZUFuZExheW91dFNpemUoe1xuICAgICAgICBtYXJrOiAncG9pbnQnLFxuICAgICAgICBlbmNvZGluZzoge1xuICAgICAgICAgIHk6IHtmaWVsZDogJ2EnLCB0eXBlOiAnb3JkaW5hbCcsIHNjYWxlOiB7cmFuZ2VTdGVwOiBudWxsfX1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNpemUgPSBzaXplU2lnbmFscyhtb2RlbCwgJ2hlaWdodCcpO1xuICAgICAgYXNzZXJ0LmRlZXBFcXVhbChzaXplLCBbe25hbWU6ICdoZWlnaHQnLCB2YWx1ZTogMjAwfV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc3RhdGljIHZpZXcgc2l6ZSBmb3Igb3JkaW5hbCBzY2FsZSB3aXRoIHRvcC1sZXZlbCB3aWR0aCcsICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGVsID0gcGFyc2VVbml0TW9kZWxXaXRoU2NhbGVBbmRMYXlvdXRTaXplKHtcbiAgICAgICAgd2lkdGg6IDIwNSxcbiAgICAgICAgbWFyazogJ3BvaW50JyxcbiAgICAgICAgZW5jb2Rpbmc6IHtcbiAgICAgICAgICB4OiB7ZmllbGQ6ICdhJywgdHlwZTogJ29yZGluYWwnfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgc2l6ZSA9IHNpemVTaWduYWxzKG1vZGVsLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoc2l6ZSwgW3tuYW1lOiAnd2lkdGgnLCB2YWx1ZTogMjA1fV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc3RhdGljIHZpZXcgc2l6ZSBmb3Igb3JkaW5hbCBzY2FsZSB3aXRoIHRvcC1sZXZlbCB3aWR0aCBldmVuIGlmIHRoZXJlIGlzIG51bWVyaWMgcmFuZ2VTdGVwJywgbG9nLndyYXAoKGxvY2FsTG9nZ2VyKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbCA9IHBhcnNlVW5pdE1vZGVsV2l0aFNjYWxlQW5kTGF5b3V0U2l6ZSh7XG4gICAgICAgIHdpZHRoOiAyMDUsXG4gICAgICAgIG1hcms6ICdwb2ludCcsXG4gICAgICAgIGVuY29kaW5nOiB7XG4gICAgICAgICAgeDoge2ZpZWxkOiAnYScsIHR5cGU6ICdvcmRpbmFsJywgc2NhbGU6IHtyYW5nZVN0ZXA6IDIxfX1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNpemUgPSBzaXplU2lnbmFscyhtb2RlbCwgJ3dpZHRoJyk7XG4gICAgICBhc3NlcnQuZGVlcEVxdWFsKHNpemUsIFt7bmFtZTogJ3dpZHRoJywgdmFsdWU6IDIwNX1dKTtcbiAgICAgIGFzc2VydC5lcXVhbChsb2NhbExvZ2dlci53YXJuc1swXSwgbG9nLm1lc3NhZ2UucmFuZ2VTdGVwRHJvcHBlZChYKSk7XG4gICAgfSkpO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc3RhdGljIHZpZXcgd2lkdGggZm9yIG5vbi1vcmRpbmFsIHgtc2NhbGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbCA9IHBhcnNlVW5pdE1vZGVsV2l0aFNjYWxlQW5kTGF5b3V0U2l6ZSh7XG4gICAgICAgIG1hcms6ICdwb2ludCcsXG4gICAgICAgIGVuY29kaW5nOiB7XG4gICAgICAgICAgeDoge2ZpZWxkOiAnYScsIHR5cGU6ICdxdWFudGl0YXRpdmUnfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgc2l6ZSA9IHNpemVTaWduYWxzKG1vZGVsLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoc2l6ZSwgW3tuYW1lOiAnd2lkdGgnLCB2YWx1ZTogMjAwfV0pO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzdGF0aWMgdmlldyBzaXplIGZvciBub24tb3JkaW5hbCB5LXNjYWxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kZWwgPSBwYXJzZVVuaXRNb2RlbFdpdGhTY2FsZUFuZExheW91dFNpemUoe1xuICAgICAgICBtYXJrOiAncG9pbnQnLFxuICAgICAgICBlbmNvZGluZzoge1xuICAgICAgICAgIHk6IHtmaWVsZDogJ2EnLCB0eXBlOiAncXVhbnRpdGF0aXZlJ31cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNpemUgPSBzaXplU2lnbmFscyhtb2RlbCwgJ2hlaWdodCcpO1xuICAgICAgYXNzZXJ0LmRlZXBFcXVhbChzaXplLCBbe25hbWU6ICdoZWlnaHQnLCB2YWx1ZTogMjAwfV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZGVmYXVsdCByYW5nZVN0ZXAgaWYgYXhpcyBpcyBub3QgbWFwcGVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgbW9kZWwgPSBwYXJzZVVuaXRNb2RlbFdpdGhTY2FsZUFuZExheW91dFNpemUoe1xuICAgICAgICBtYXJrOiAncG9pbnQnLFxuICAgICAgICBlbmNvZGluZzoge30sXG4gICAgICAgIGNvbmZpZzoge3NjYWxlOiB7cmFuZ2VTdGVwOiAxN319XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHNpemUgPSBzaXplU2lnbmFscyhtb2RlbCwgJ3dpZHRoJyk7XG4gICAgICBhc3NlcnQuZGVlcEVxdWFsKHNpemUsIFt7bmFtZTogJ3dpZHRoJywgdmFsdWU6IDE3fV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdGV4dFhSYW5nZVN0ZXAgaWYgYXhpcyBpcyBub3QgbWFwcGVkIGZvciBYIG9mIHRleHQgbWFyaycsICgpID0+IHtcbiAgICAgIGNvbnN0IG1vZGVsID0gcGFyc2VVbml0TW9kZWxXaXRoU2NhbGVBbmRMYXlvdXRTaXplKHtcbiAgICAgICAgbWFyazogJ3RleHQnLFxuICAgICAgICBlbmNvZGluZzoge30sXG4gICAgICAgIGNvbmZpZzoge3NjYWxlOiB7dGV4dFhSYW5nZVN0ZXA6IDkxfX1cbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2l6ZSA9IHNpemVTaWduYWxzKG1vZGVsLCAnd2lkdGgnKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoc2l6ZSwgW3tuYW1lOiAnd2lkdGgnLCB2YWx1ZTogOTF9XSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=