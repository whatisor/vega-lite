/* tslint:disable quotemark */
import { assert } from 'chai';
import * as selection from '../../../src/compile/selection/selection';
import nearest from '../../../src/compile/selection/transforms/nearest';
import * as log from '../../../src/log';
import { duplicate } from '../../../src/util';
import { parseUnitModel } from '../../util';
function getModel(markType) {
    var model = parseUnitModel({
        "mark": markType,
        "encoding": {
            "x": { "field": "Horsepower", "type": "quantitative" },
            "y": { "field": "Miles_per_Gallon", "type": "quantitative" },
            "color": { "field": "Origin", "type": "nominal" }
        }
    });
    model.parseScale();
    model.parseMarkGroup();
    model.component.selection = selection.parseUnitSelection(model, {
        "one": { "type": "single", "nearest": true },
        "two": { "type": "multi", "nearest": true },
        "three": { "type": "interval" },
        "four": { "type": "single", "nearest": false },
        "five": { "type": "multi" },
        "six": { "type": "multi", "nearest": null },
        "seven": { "type": "single", "nearest": true, "encodings": ["x"] },
        "eight": { "type": "single", "nearest": true, "encodings": ["y"] },
        "nine": { "type": "single", "nearest": true, "encodings": ["color"] }
    });
    return model;
}
function voronoiMark(x, y) {
    return [
        { hello: "world" },
        {
            "name": "voronoi",
            "type": "path",
            "from": { "data": "marks" },
            "encode": {
                "enter": {
                    "fill": { "value": "transparent" },
                    "strokeWidth": { "value": 0.35 },
                    "stroke": { "value": "transparent" },
                    "isVoronoi": { "value": true }
                }
            },
            "transform": [
                {
                    "type": "voronoi",
                    "x": x || { "expr": "datum.datum.x || 0" },
                    "y": y || { "expr": "datum.datum.y || 0" },
                    "size": [{ "signal": "width" }, { "signal": "height" }]
                }
            ]
        }
    ];
}
describe('Nearest Selection Transform', function () {
    it('identifies transform invocation', function () {
        var selCmpts = getModel('circle').component.selection;
        assert.isNotFalse(nearest.has(selCmpts['one']));
        assert.isNotFalse(nearest.has(selCmpts['two']));
        assert.isNotTrue(nearest.has(selCmpts['three']));
        assert.isNotTrue(nearest.has(selCmpts['four']));
        assert.isNotTrue(nearest.has(selCmpts['five']));
        assert.isNotTrue(nearest.has(selCmpts['six']));
    });
    it('adds voronoi for non-path marks', function () {
        var model = getModel('circle');
        var selCmpts = model.component.selection;
        var marks = [{ hello: "world" }];
        assert.sameDeepMembers(nearest.marks(model, selCmpts['one'], marks), voronoiMark());
    });
    it('should warn for path marks', log.wrap(function (localLogger) {
        var model = getModel('line');
        var selCmpts = model.component.selection;
        var marks = [];
        assert.equal(nearest.marks(model, selCmpts['one'], marks), marks);
        assert.equal(localLogger.warns[1], log.message.nearestNotSupportForContinuous('line'));
    }));
    it('limits to a single voronoi per unit', function () {
        var model = getModel('circle');
        var selCmpts = model.component.selection;
        var marks = [{ hello: "world" }];
        var marks2 = nearest.marks(model, selCmpts['one'], marks);
        assert.sameDeepMembers(nearest.marks(model, selCmpts['two'], marks2), voronoiMark());
    });
    it('supports 1D voronoi', function () {
        var model = getModel('circle');
        var selCmpts = model.component.selection;
        var marks = [{ hello: "world" }];
        assert.sameDeepMembers(nearest.marks(model, selCmpts['seven'], duplicate(marks)), voronoiMark(null, { "expr": "0" }));
        assert.sameDeepMembers(nearest.marks(model, selCmpts['eight'], duplicate(marks)), voronoiMark({ "expr": "0" }));
        assert.sameDeepMembers(nearest.marks(model, selCmpts['nine'], duplicate(marks)), voronoiMark());
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhcmVzdC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9jb21waWxlL3NlbGVjdGlvbi9uZWFyZXN0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOEJBQThCO0FBRTlCLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxLQUFLLFNBQVMsTUFBTSwwQ0FBMEMsQ0FBQztBQUN0RSxPQUFPLE9BQU8sTUFBTSxtREFBbUQsQ0FBQztBQUN4RSxPQUFPLEtBQUssR0FBRyxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRTFDLGtCQUFrQixRQUFhO0lBQzdCLElBQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQztRQUMzQixNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUM7WUFDbkQsR0FBRyxFQUFFLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUM7WUFDekQsT0FBTyxFQUFFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFDO1NBQ2hEO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN2QixLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFO1FBQzlELEtBQUssRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQztRQUMxQyxLQUFLLEVBQUUsRUFBQyxNQUFNLEVBQUUs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QUMsS0FBSyxDQUFDLENBQUMsRUFDeEQsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGUgcXVvdGVtYXJrICovXG5cbmltcG9ydCB7YXNzZXJ0fSBmcm9tICdjaGFpJztcbmltcG9ydCAqIGFzIHNlbGVjdGlvbiBmcm9tICcuLi8uLi8uLi9zcmMvY29tcGlsZS9zZWxlY3Rpb24vc2VsZWN0aW9uJztcbmltcG9ydCBuZWFyZXN0IGZyb20gJy4uLy4uLy4uL3NyYy9jb21waWxlL3NlbGVjdGlvbi90cmFuc2Zvcm1zL25lYXJlc3QnO1xuaW1wb3J0ICogYXMgbG9nIGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkdXBsaWNhdGV9IGZyb20gJy4uLy4uLy4uL3NyYy91dGlsJztcbmltcG9ydCB7cGFyc2VVbml0TW9kZWx9IGZyb20gJy4uLy4uL3V0aWwnO1xuXG5mdW5jdGlvbiBnZXRNb2RlbChtYXJrVHlwZTogYW55KSB7XG4gIGNvbnN0IG1vZGVsID0gcGFyc2VVbml0TW9kZWwoe1xuICAgIFwibWFya1wiOiBtYXJrVHlwZSxcbiAgICBcImVuY29kaW5nXCI6IHtcbiAgICAgIFwieFwiOiB7XCJmaWVsZFwiOiBcIkhvcnNlcG93ZXJcIixcInR5cGVcIjogXCJxdWFudGl0YXRpdmVcIn0sXG4gICAgICBcInlcIjoge1wiZmllbGRcIjogXCJNaWxlc19wZXJfR2FsbG9uXCIsXCJ0eXBlXCI6IFwicXVhbnRpdGF0aXZlXCJ9LFxuICAgICAgXCJjb2xvclwiOiB7XCJmaWVsZFwiOiBcIk9yaWdpblwiLCBcInR5cGVcIjogXCJub21pbmFsXCJ9XG4gICAgfVxuICB9KTtcbiAgbW9kZWwucGFyc2VTY2FsZSgpO1xuICBtb2RlbC5wYXJzZU1hcmtHcm91cCgpO1xuICBtb2RlbC5jb21wb25lbnQuc2VsZWN0aW9uID0gc2VsZWN0aW9uLnBhcnNlVW5pdFNlbGVjdGlvbihtb2RlbCwge1xuICAgIFwib25lXCI6IHtcInR5cGVcIjogXCJzaW5nbGVcIiwgXCJuZWFyZXN0XCI6IHRydWV9LFxuICAgIFwidHdvXCI6IHtcInR5cGVcIjogXCJtdWx0aVwiLCBcIm5lYXJlc3RcIjogdHJ1ZX0sXG4gICAgXCJ0aHJlZVwiOiB7XCJ0eXBlXCI6IFwiaW50ZXJ2YWxcIn0sXG4gICAgXCJmb3VyXCI6IHtcInR5cGVcIjogXCJzaW5nbGVcIiwgXCJuZWFyZXN0XCI6IGZhbHNlfSxcbiAgICBcImZpdmVcIjoge1widHlwZVwiOiBcIm11bHRpXCJ9LFxuICAgIFwic2l4XCI6IHtcInR5cGVcIjogXCJtdWx0aVwiLCBcIm5lYXJlc3RcIjogbnVsbH0sXG4gICAgXCJzZXZlblwiOiB7XCJ0eXBlXCI6IFwic2luZ2xlXCIsIFwibmVhcmVzdFwiOiB0cnVlLCBcImVuY29kaW5nc1wiOiBbXCJ4XCJdfSxcbiAgICBcImVpZ2h0XCI6IHtcInR5cGVcIjogXCJzaW5nbGVcIiwgXCJuZWFyZXN0XCI6IHRydWUsIFwiZW5jb2RpbmdzXCI6IFtcInlcIl19LFxuICAgIFwibmluZVwiOiB7XCJ0eXBlXCI6IFwic2luZ2xlXCIsIFwibmVhcmVzdFwiOiB0cnVlLCBcImVuY29kaW5nc1wiOiBbXCJjb2xvclwiXX1cbiAgfSk7XG5cbiAgcmV0dXJuIG1vZGVsO1xufVxuXG5mdW5jdGlvbiB2b3Jvbm9pTWFyayh4Pzogc3RyaW5nIHwge2V4cHI6IHN0cmluZ30sIHk/OiBzdHJpbmcgfCB7ZXhwcjogc3RyaW5nfSkge1xuICByZXR1cm4gW1xuICAgIHtoZWxsbzogXCJ3b3JsZFwifSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJ2b3Jvbm9pXCIsXG4gICAgICBcInR5cGVcIjogXCJwYXRoXCIsXG4gICAgICBcImZyb21cIjoge1wiZGF0YVwiOiBcIm1hcmtzXCJ9LFxuICAgICAgXCJlbmNvZGVcIjoge1xuICAgICAgICBcImVudGVyXCI6IHtcbiAgICAgICAgICBcImZpbGxcIjoge1widmFsdWVcIjogXCJ0cmFuc3BhcmVudFwifSxcbiAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IHtcInZhbHVlXCI6IDAuMzV9LFxuICAgICAgICAgIFwic3Ryb2tlXCI6IHtcInZhbHVlXCI6IFwidHJhbnNwYXJlbnRcIn0sXG4gICAgICAgICAgXCJpc1Zvcm9ub2lcIjoge1widmFsdWVcIjogdHJ1ZX1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwidHJhbnNmb3JtXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwidHlwZVwiOiBcInZvcm9ub2lcIixcbiAgICAgICAgICBcInhcIjogeCB8fCB7XCJleHByXCI6IFwiZGF0dW0uZGF0dW0ueCB8fCAwXCJ9LFxuICAgICAgICAgIFwieVwiOiB5IHx8IHtcImV4cHJcIjogXCJkYXR1bS5kYXR1bS55IHx8IDBcIn0sXG4gICAgICAgICAgXCJzaXplXCI6IFt7XCJzaWduYWxcIjogXCJ3aWR0aFwifSx7XCJzaWduYWxcIjogXCJoZWlnaHRcIn1dXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF07XG59XG5cbmRlc2NyaWJlKCdOZWFyZXN0IFNlbGVjdGlvbiBUcmFuc2Zvcm0nLCBmdW5jdGlvbigpIHtcbiAgaXQoJ2lkZW50aWZpZXMgdHJhbnNmb3JtIGludm9jYXRpb24nLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzZWxDbXB0cyA9IGdldE1vZGVsKCdjaXJjbGUnKS5jb21wb25lbnQuc2VsZWN0aW9uO1xuICAgIGFzc2VydC5pc05vdEZhbHNlKG5lYXJlc3QuaGFzKHNlbENtcHRzWydvbmUnXSkpO1xuICAgIGFzc2VydC5pc05vdEZhbHNlKG5lYXJlc3QuaGFzKHNlbENtcHRzWyd0d28nXSkpO1xuICAgIGFzc2VydC5pc05vdFRydWUobmVhcmVzdC5oYXMoc2VsQ21wdHNbJ3RocmVlJ10pKTtcbiAgICBhc3NlcnQuaXNOb3RUcnVlKG5lYXJlc3QuaGFzKHNlbENtcHRzWydmb3VyJ10pKTtcbiAgICBhc3NlcnQuaXNOb3RUcnVlKG5lYXJlc3QuaGFzKHNlbENtcHRzWydmaXZlJ10pKTtcbiAgICBhc3NlcnQuaXNOb3RUcnVlKG5lYXJlc3QuaGFzKHNlbENtcHRzWydzaXgnXSkpO1xuICB9KTtcblxuICBpdCgnYWRkcyB2b3Jvbm9pIGZvciBub24tcGF0aCBtYXJrcycsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IG1vZGVsID0gZ2V0TW9kZWwoJ2NpcmNsZScpO1xuICAgIGNvbnN0IHNlbENtcHRzID0gbW9kZWwuY29tcG9uZW50LnNlbGVjdGlvbjtcbiAgICBjb25zdCBtYXJrczogYW55W10gPSBbe2hlbGxvOiBcIndvcmxkXCJ9XTtcblxuICAgIGFzc2VydC5zYW1lRGVlcE1lbWJlcnMoXG4gICAgICBuZWFyZXN0Lm1hcmtzKG1vZGVsLCBzZWxDbXB0c1snb25lJ10sIG1hcmtzKSwgdm9yb25vaU1hcmsoKSk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgd2FybiBmb3IgcGF0aCBtYXJrcycsIGxvZy53cmFwKChsb2NhbExvZ2dlcikgPT4ge1xuICAgIGNvbnN0IG1vZGVsID0gZ2V0TW9kZWwoJ2xpbmUnKTtcbiAgICBjb25zdCBzZWxDbXB0cyA9IG1vZGVsLmNvbXBvbmVudC5zZWxlY3Rpb247XG4gICAgY29uc3QgbWFya3M6IGFueVtdID0gW107XG4gICAgYXNzZXJ0LmVxdWFsKG5lYXJlc3QubWFya3MobW9kZWwsIHNlbENtcHRzWydvbmUnXSwgbWFya3MpLCBtYXJrcyk7XG4gICAgYXNzZXJ0LmVxdWFsKGxvY2FsTG9nZ2VyLndhcm5zWzFdLCBsb2cubWVzc2FnZS5uZWFyZXN0Tm90U3VwcG9ydEZvckNvbnRpbnVvdXMoJ2xpbmUnKSk7XG4gIH0pKTtcblxuICBpdCgnbGltaXRzIHRvIGEgc2luZ2xlIHZvcm9ub2kgcGVyIHVuaXQnLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBtb2RlbCA9IGdldE1vZGVsKCdjaXJjbGUnKTtcbiAgICBjb25zdCBzZWxDbXB0cyA9IG1vZGVsLmNvbXBvbmVudC5zZWxlY3Rpb247XG4gICAgY29uc3QgbWFya3M6IGFueVtdID0gW3toZWxsbzogXCJ3b3JsZFwifV07XG5cbiAgICBjb25zdCBtYXJrczIgPSBuZWFyZXN0Lm1hcmtzKG1vZGVsLCBzZWxDbXB0c1snb25lJ10sIG1hcmtzKTtcbiAgICBhc3NlcnQuc2FtZURlZXBNZW1iZXJzKFxuICAgICAgbmVhcmVzdC5tYXJrcyhtb2RlbCwgc2VsQ21wdHNbJ3R3byddLCBtYXJrczIpLCB2b3Jvbm9pTWFyaygpKTtcbiAgfSk7XG5cbiAgaXQoJ3N1cHBvcnRzIDFEIHZvcm9ub2knLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBtb2RlbCA9IGdldE1vZGVsKCdjaXJjbGUnKTtcbiAgICBjb25zdCBzZWxDbXB0cyA9IG1vZGVsLmNvbXBvbmVudC5zZWxlY3Rpb247XG4gICAgY29uc3QgbWFya3M6IGFueVtdID0gW3toZWxsbzogXCJ3b3JsZFwifV07XG5cbiAgICBhc3NlcnQuc2FtZURlZXBNZW1iZXJzKFxuICAgICAgbmVhcmVzdC5tYXJrcyhtb2RlbCwgc2VsQ21wdHNbJ3NldmVuJ10sIGR1cGxpY2F0ZShtYXJrcykpLFxuICAgICAgdm9yb25vaU1hcmsobnVsbCwge1wiZXhwclwiOiBcIjBcIn0pKTtcblxuICAgIGFzc2VydC5zYW1lRGVlcE1lbWJlcnMoXG4gICAgICBuZWFyZXN0Lm1hcmtzKG1vZGVsLCBzZWxDbXB0c1snZWlnaHQnXSwgZHVwbGljYXRlKG1hcmtzKSksXG4gICAgICB2b3Jvbm9pTWFyayh7XCJleHByXCI6IFwiMFwifSkpO1xuXG4gICAgYXNzZXJ0LnNhbWVEZWVwTWVtYmVycyhcbiAgICAgIG5lYXJlc3QubWFya3MobW9kZWwsIHNlbENtcHRzWyduaW5lJ10sIGR1cGxpY2F0ZShtYXJrcykpLFxuICAgICAgdm9yb25vaU1hcmsoKSk7XG4gIH0pO1xufSk7XG4iXX0=