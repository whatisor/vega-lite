import { assert } from 'chai';
import * as type from '../src/type';
describe('type', function () {
    describe('getFullName()', function () {
        it('should return correct lowercase, full type names.', function () {
            for (var _i = 0, _a = ['q', 'Q', 'quantitative', 'QUANTITATIVE']; _i < _a.length; _i++) {
                var t = _a[_i];
                assert.equal(type.getFullName(t), 'quantitative');
            }
            for (var _b = 0, _c = ['t', 'T', 'temporal', 'TEMPORAL']; _b < _c.length; _b++) {
                var t = _c[_b];
                assert.equal(type.getFullName(t), 'temporal');
            }
            for (var _d = 0, _e = ['o', 'O', 'ordinal', 'ORDINAL']; _d < _e.length; _d++) {
                var t = _e[_d];
                assert.equal(type.getFullName(t), 'ordinal');
            }
            for (var _f = 0, _g = ['n', 'N', 'nominal', 'NOMINAL']; _f < _g.length; _f++) {
                var t = _g[_f];
                assert.equal(type.getFullName(t), 'nominal');
            }
            for (var _h = 0, _j = ['latitude', 'LATITUDE']; _h < _j.length; _h++) {
                var t = _j[_h];
                assert.equal(type.getFullName(t), 'latitude');
            }
            for (var _k = 0, _l = ['longitude', 'LONGITUDE']; _k < _l.length; _k++) {
                var t = _l[_k];
                assert.equal(type.getFullName(t), 'longitude');
            }
            for (var _m = 0, _o = ['geojson', 'GEOJSON']; _m < _o.length; _m++) {
                var t = _o[_m];
                assert.equal(type.getFullName(t), 'geojson');
            }
        });
        it('should return undefined for invalid type', function () {
            assert.equal(type.getFullName('haha'), undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC90eXBlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU1QixPQUFPLEtBQUssSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUVwQyxRQUFRLENBQUMsTUFBTSxFQUFFO0lBQ2YsUUFBUSxDQUFDLGVBQWUsRUFBRTtRQUN4QixFQUFFLENBQUMsbURBQW1ELEVBQUU7WUFDdEQsS0FBZ0IsVUFBMEMsRUFBMUMsTUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsRUFBMUMsY0FBMEMsRUFBMUMsSUFBMEM7Z0JBQXJELElBQU0sQ0FBQyxTQUFBO2dCQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQzthQUNuRDtZQUNELEtBQWdCLFVBQWtDLEVBQWxDLE1BQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQWxDLGNBQWtDLEVBQWxDLElBQWtDO2dCQUE3QyxJQUFNLENBQUMsU0FBQTtnQkFDVixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDL0M7WUFDRCxLQUFnQixVQUFnQyxFQUFoQyxNQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFoQyxjQUFnQyxFQUFoQyxJQUFnQztnQkFBM0MsSUFBTSxDQUFDLFNBQUE7Z0JBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQzlDO1lBQ0QsS0FBZ0IsVUFBZ0MsRUFBaEMsTUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBaEMsY0FBZ0MsRUFBaEMsSUFBZ0M7Z0JBQTNDLElBQU0sQ0FBQyxTQUFBO2dCQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUM5QztZQUNELEtBQWdCLFVBQXdCLEVBQXhCLE1BQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUF4QixjQUF3QixFQUF4QixJQUF3QjtnQkFBbkMsSUFBTSxDQUFDLFNBQUE7Z0JBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsS0FBZ0IsVUFBMEIsRUFBMUIsTUFBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLEVBQTFCLGNBQTBCLEVBQTFCLElBQTBCO2dCQUFyQyxJQUFNLENBQUMsU0FBQTtnQkFDVixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDaEQ7WUFDRCxLQUFnQixVQUFzQixFQUF0QixNQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBdEIsY0FBc0IsRUFBdEIsSUFBc0I7Z0JBQWpDLElBQU0sQ0FBQyxTQUFBO2dCQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUM5QztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDBDQUEwQyxFQUFFO1lBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2Fzc2VydH0gZnJvbSAnY2hhaSc7XG5cbmltcG9ydCAqIGFzIHR5cGUgZnJvbSAnLi4vc3JjL3R5cGUnO1xuXG5kZXNjcmliZSgndHlwZScsIGZ1bmN0aW9uICgpIHtcbiAgZGVzY3JpYmUoJ2dldEZ1bGxOYW1lKCknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gY29ycmVjdCBsb3dlcmNhc2UsIGZ1bGwgdHlwZSBuYW1lcy4nLCAoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHQgb2YgWydxJywgJ1EnLCAncXVhbnRpdGF0aXZlJywgJ1FVQU5USVRBVElWRSddKSB7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0eXBlLmdldEZ1bGxOYW1lKHQpLCAncXVhbnRpdGF0aXZlJyk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHQgb2YgWyd0JywgJ1QnLCAndGVtcG9yYWwnLCAnVEVNUE9SQUwnXSkge1xuICAgICAgICBhc3NlcnQuZXF1YWwodHlwZS5nZXRGdWxsTmFtZSh0KSwgJ3RlbXBvcmFsJyk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHQgb2YgWydvJywgJ08nLCAnb3JkaW5hbCcsICdPUkRJTkFMJ10pIHtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHR5cGUuZ2V0RnVsbE5hbWUodCksICdvcmRpbmFsJyk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHQgb2YgWyduJywgJ04nLCAnbm9taW5hbCcsICdOT01JTkFMJ10pIHtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHR5cGUuZ2V0RnVsbE5hbWUodCksICdub21pbmFsJyk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHQgb2YgWydsYXRpdHVkZScsICdMQVRJVFVERSddKSB7XG4gICAgICAgIGFzc2VydC5lcXVhbCh0eXBlLmdldEZ1bGxOYW1lKHQpLCAnbGF0aXR1ZGUnKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgdCBvZiBbJ2xvbmdpdHVkZScsICdMT05HSVRVREUnXSkge1xuICAgICAgICBhc3NlcnQuZXF1YWwodHlwZS5nZXRGdWxsTmFtZSh0KSwgJ2xvbmdpdHVkZScpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCB0IG9mIFsnZ2VvanNvbicsICdHRU9KU09OJ10pIHtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKHR5cGUuZ2V0RnVsbE5hbWUodCksICdnZW9qc29uJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB1bmRlZmluZWQgZm9yIGludmFsaWQgdHlwZScsICgpID0+IHtcbiAgICAgIGFzc2VydC5lcXVhbCh0eXBlLmdldEZ1bGxOYW1lKCdoYWhhJyksIHVuZGVmaW5lZCk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=