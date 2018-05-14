import { COLOR, FILL, OPACITY, SHAPE, SIZE, STROKE } from '../../channel';
import { isFieldDef, title as fieldDefTitle } from '../../fielddef';
import { LEGEND_PROPERTIES, VG_LEGEND_PROPERTIES } from '../../legend';
import { GEOJSON } from '../../type';
import { deleteNestedProperty, keys } from '../../util';
import { getSpecifiedOrDefaultValue, numberFormat, titleMerger } from '../common';
import { isUnitModel } from '../model';
import { parseGuideResolve } from '../resolve';
import { makeImplicit } from '../split';
import { defaultTieBreaker, mergeValuesWithExplicit } from '../split';
import { LegendComponent } from './component';
import * as encode from './encode';
import * as properties from './properties';
export function parseLegend(model) {
    if (isUnitModel(model)) {
        model.component.legends = parseUnitLegend(model);
    }
    else {
        model.component.legends = parseNonUnitLegend(model);
    }
}
function parseUnitLegend(model) {
    var encoding = model.encoding;
    return [COLOR, FILL, STROKE, SIZE, SHAPE, OPACITY].reduce(function (legendComponent, channel) {
        var def = encoding[channel];
        if (model.legend(channel) && model.getScaleComponent(channel) && !(isFieldDef(def) && (channel === SHAPE && def.type === GEOJSON))) {
            legendComponent[channel] = parseLegendForChannel(model, channel);
        }
        return legendComponent;
    }, {});
}
function getLegendDefWithScale(model, channel) {
    // For binned field with continuous scale, use a special scale so we can overrride the mark props and labels
    switch (channel) {
        case COLOR:
            var scale = model.scaleName(COLOR);
            return model.markDef.filled ? { fill: scale } : { stroke: scale };
        case FILL:
        case STROKE:
        case SIZE:
        case SHAPE:
        case OPACITY:
            return _a = {}, _a[channel] = model.scaleName(channel), _a;
    }
    var _a;
}
export function parseLegendForChannel(model, channel) {
    var fieldDef = model.fieldDef(channel);
    var legend = model.legend(channel);
    var legendCmpt = new LegendComponent({}, getLegendDefWithScale(model, channel));
    LEGEND_PROPERTIES.forEach(function (property) {
        var value = getProperty(property, legend, channel, model);
        if (value !== undefined) {
            var explicit = 
            // specified legend.values is already respected, but may get transformed.
            property === 'values' ? !!legend.values :
                // title can be explicit if fieldDef.title is set
                property === 'title' && value === model.fieldDef(channel).title ? true :
                    // Otherwise, things are explicit if the returned value matches the specified property
                    value === legend[property];
            if (explicit || model.config.legend[property] === undefined) {
                legendCmpt.set(property, value, explicit);
            }
        }
    });
    // 2) Add mark property definition groups
    var legendEncoding = legend.encoding || {};
    var legendEncode = ['labels', 'legend', 'title', 'symbols', 'gradient'].reduce(function (e, part) {
        var value = encode[part] ?
            // TODO: replace legendCmpt with type is sufficient
            encode[part](fieldDef, legendEncoding[part], model, channel, legendCmpt.get('type')) : // apply rule
            legendEncoding[part]; // no rule -- just default values
        if (value !== undefined && keys(value).length > 0) {
            e[part] = { update: value };
        }
        return e;
    }, {});
    if (keys(legendEncode).length > 0) {
        legendCmpt.set('encode', legendEncode, !!legend.encoding);
    }
    return legendCmpt;
}
function getProperty(property, specifiedLegend, channel, model) {
    var fieldDef = model.fieldDef(channel);
    switch (property) {
        case 'format':
            // We don't include temporal field here as we apply format in encode block
            return numberFormat(fieldDef, specifiedLegend.format, model.config);
        case 'title':
            // For falsy value, keep undefined so we use default,
            // but use null for '', null, and false to hide the title
            var specifiedTitle = fieldDef.title !== undefined ? fieldDef.title :
                specifiedLegend.title || (specifiedLegend.title === undefined ? undefined : null);
            return getSpecifiedOrDefaultValue(specifiedTitle, fieldDefTitle(fieldDef, model.config)) || undefined; // make falsy value undefined so output Vega spec is shorter
        case 'values':
            return properties.values(specifiedLegend);
        case 'type':
            return getSpecifiedOrDefaultValue(specifiedLegend.type, properties.type(fieldDef.type, channel, model.getScaleComponent(channel).get('type')));
    }
    // Otherwise, return specified property.
    return specifiedLegend[property];
}
function parseNonUnitLegend(model) {
    var _a = model.component, legends = _a.legends, resolve = _a.resolve;
    var _loop_1 = function (child) {
        parseLegend(child);
        keys(child.component.legends).forEach(function (channel) {
            resolve.legend[channel] = parseGuideResolve(model.component.resolve, channel);
            if (resolve.legend[channel] === 'shared') {
                // If the resolve says shared (and has not been overridden)
                // We will try to merge and see if there is a conflict
                legends[channel] = mergeLegendComponent(legends[channel], child.component.legends[channel]);
                if (!legends[channel]) {
                    // If merge returns nothing, there is a conflict so we cannot make the legend shared.
                    // Thus, mark legend as independent and remove the legend component.
                    resolve.legend[channel] = 'independent';
                    delete legends[channel];
                }
            }
        });
    };
    for (var _i = 0, _b = model.children; _i < _b.length; _i++) {
        var child = _b[_i];
        _loop_1(child);
    }
    keys(legends).forEach(function (channel) {
        for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (!child.component.legends[channel]) {
                // skip if the child does not have a particular legend
                continue;
            }
            if (resolve.legend[channel] === 'shared') {
                // After merging shared legend, make sure to remove legend from child
                delete child.component.legends[channel];
            }
        }
    });
    return legends;
}
export function mergeLegendComponent(mergedLegend, childLegend) {
    if (!mergedLegend) {
        return childLegend.clone();
    }
    var mergedOrient = mergedLegend.getWithExplicit('orient');
    var childOrient = childLegend.getWithExplicit('orient');
    if (mergedOrient.explicit && childOrient.explicit && mergedOrient.value !== childOrient.value) {
        // TODO: throw warning if resolve is explicit (We don't have info about explicit/implicit resolve yet.)
        // Cannot merge due to inconsistent orient
        return undefined;
    }
    var typeMerged = false;
    var _loop_2 = function (prop) {
        var mergedValueWithExplicit = mergeValuesWithExplicit(mergedLegend.getWithExplicit(prop), childLegend.getWithExplicit(prop), prop, 'legend', 
        // Tie breaker function
        function (v1, v2) {
            switch (prop) {
                case 'title':
                    return titleMerger(v1, v2);
                case 'type':
                    // There are only two types. If we have different types, then prefer symbol over gradient.
                    typeMerged = true;
                    return makeImplicit('symbol');
            }
            return defaultTieBreaker(v1, v2, prop, 'legend');
        });
        mergedLegend.setWithExplicit(prop, mergedValueWithExplicit);
    };
    // Otherwise, let's merge
    for (var _i = 0, VG_LEGEND_PROPERTIES_1 = VG_LEGEND_PROPERTIES; _i < VG_LEGEND_PROPERTIES_1.length; _i++) {
        var prop = VG_LEGEND_PROPERTIES_1[_i];
        _loop_2(prop);
    }
    if (typeMerged) {
        if (((mergedLegend.implicit || {}).encode || {}).gradient) {
            deleteNestedProperty(mergedLegend.implicit, ['encode', 'gradient']);
        }
        if (((mergedLegend.explicit || {}).encode || {}).gradient) {
            deleteNestedProperty(mergedLegend.explicit, ['encode', 'gradient']);
        }
    }
    return mergedLegend;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcGlsZS9sZWdlbmQvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQTJCLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRyxPQUFPLEVBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxhQUFhLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQVMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDN0UsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXRELE9BQU8sRUFBQywwQkFBMEIsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxXQUFXLEVBQVEsTUFBTSxVQUFVLENBQUM7QUFDNUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQzdDLE9BQU8sRUFBVyxZQUFZLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRXBFLE9BQU8sRUFBQyxlQUFlLEVBQXVCLE1BQU0sYUFBYSxDQUFDO0FBQ2xFLE9BQU8sS0FBSyxNQUFNLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sS0FBSyxVQUFVLE1BQU0sY0FBYyxDQUFDO0FBRzNDLE1BQU0sc0JBQXNCLEtBQVk7SUFDdEMsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDdEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxD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MUYsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDbEIsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDakM7WUFDRCxPQUFPLGlCQUFpQixDQUFnQixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQ0YsQ0FBQztRQUNGLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsQ0FBQztJQXJCRCx5QkFBeUI7SUFDekIsS0FBbUIsVUFBb0IsRUFBcEIsNkNBQW9CLEVBQXBCLGtDQUFvQixFQUFwQixJQUFvQjtRQUFsQyxJQUFNLElBQUksNkJBQUE7Z0JBQUosSUFBSTtLQW9CZDtJQUNELElBQUksVUFBVSxFQUFFO1FBQ2QsSUFBRyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ3hELG9CQUFvQixDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUNyRTtRQUNELElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUN6RCxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDckU7S0FDRjtJQUdELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTE9SLCBGSUxMLCBOb25Qb3NpdGlvblNjYWxlQ2hhbm5lbCwgT1BBQ0lUWSwgU0hBUEUsIFNJWkUsIFNUUk9LRX0gZnJvbSAnLi4vLi4vY2hhbm5lbCc7XG5pbXBvcnQge2lzRmllbGREZWYsIHRpdGxlIGFzIGZpZWxkRGVmVGl0bGV9IGZyb20gJy4uLy4uL2ZpZWxkZGVmJztcbmltcG9ydCB7TGVnZW5kLCBMRUdFTkRfUFJPUEVSVElFUywgVkdfTEVHRU5EX1BST1BFUlRJRVN9IGZyb20gJy4uLy4uL2xlZ2VuZCc7XG5pbXBvcnQge0dFT0pTT059IGZyb20gJy4uLy4uL3R5cGUnO1xuaW1wb3J0IHtkZWxldGVOZXN0ZWRQcm9wZXJ0eSwga2V5c30gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQge1ZnTGVnZW5kLCBWZ0xlZ2VuZEVuY29kZX0gZnJvbSAnLi4vLi4vdmVnYS5zY2hlbWEnO1xuaW1wb3J0IHtnZXRTcGVjaWZpZWRPckRlZmF1bHRWYWx1ZSwgbnVtYmVyRm9ybWF0LCB0aXRsZU1lcmdlcn0gZnJvbSAnLi4vY29tbW9uJztcbmltcG9ydCB7aXNVbml0TW9kZWwsIE1vZGVsfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge3BhcnNlR3VpZGVSZXNvbHZlfSBmcm9tICcuLi9yZXNvbHZlJztcbmltcG9ydCB7RXhwbGljaXQsIG1ha2VJbXBsaWNpdH0gZnJvbSAnLi4vc3BsaXQnO1xuaW1wb3J0IHtkZWZhdWx0VGllQnJlYWtlciwgbWVyZ2VWYWx1ZXNXaXRoRXhwbGljaXR9IGZyb20gJy4uL3NwbGl0JztcbmltcG9ydCB7VW5pdE1vZGVsfSBmcm9tICcuLi91bml0JztcbmltcG9ydCB7TGVnZW5kQ29tcG9uZW50LCBMZWdlbmRDb21wb25lbnRJbmRleH0gZnJvbSAnLi9jb21wb25lbnQnO1xuaW1wb3J0ICogYXMgZW5jb2RlIGZyb20gJy4vZW5jb2RlJztcbmltcG9ydCAqIGFzIHByb3BlcnRpZXMgZnJvbSAnLi9wcm9wZXJ0aWVzJztcblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMZWdlbmQobW9kZWw6IE1vZGVsKSB7XG4gIGlmIChpc1VuaXRNb2RlbChtb2RlbCkpIHtcbiAgICBtb2RlbC5jb21wb25lbnQubGVnZW5kcyA9IHBhcnNlVW5pdExlZ2VuZChtb2RlbCk7XG4gIH0gZWxzZSB7XG4gICAgbW9kZWwuY29tcG9uZW50LmxlZ2VuZHMgPSBwYXJzZU5vblVuaXRMZWdlbmQobW9kZWwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVW5pdExlZ2VuZChtb2RlbDogVW5pdE1vZGVsKTogTGVnZW5kQ29tcG9uZW50SW5kZXgge1xuICBjb25zdCB7ZW5jb2Rpbmd9ID0gbW9kZWw7XG4gIHJldHVybiBbQ09MT1IsIEZJTEwsIFNUUk9LRSwgU0laRSwgU0hBUEUsIE9QQUNJVFldLnJlZHVjZShmdW5jdGlvbiAobGVnZW5kQ29tcG9uZW50LCBjaGFubmVsKSB7XG4gICAgY29uc3QgZGVmID0gZW5jb2RpbmdbY2hhbm5lbF07XG4gICAgaWYgKG1vZGVsLmxlZ2VuZChjaGFubmVsKSAmJiBtb2RlbC5nZXRTY2FsZUNvbXBvbmVudChjaGFubmVsKSAmJiAhKGlzRmllbGREZWYoZGVmKSAmJiAoY2hhbm5lbCA9PT0gU0hBUEUgJiYgZGVmLnR5cGUgPT09IEdFT0pTT04pKSkge1xuICAgICAgbGVnZW5kQ29tcG9uZW50W2NoYW5uZWxdID0gcGFyc2VMZWdlbmRGb3JDaGFubmVsKG1vZGVsLCBjaGFubmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIGxlZ2VuZENvbXBvbmVudDtcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBnZXRMZWdlbmREZWZXaXRoU2NhbGUobW9kZWw6IFVuaXRNb2RlbCwgY2hhbm5lbDogTm9uUG9zaXRpb25TY2FsZUNoYW5uZWwpOiBWZ0xlZ2VuZCB7XG4gIC8vIEZvciBiaW5uZWQgZmllbGQgd2l0aCBjb250aW51b3VzIHNjYWxlLCB1c2UgYSBzcGVjaWFsIHNjYWxlIHNvIHdlIGNhbiBvdmVycnJpZGUgdGhlIG1hcmsgcHJvcHMgYW5kIGxhYmVsc1xuICBzd2l0Y2ggKGNoYW5uZWwpIHtcbiAgICBjYXNlIENPTE9SOlxuICAgICAgY29uc3Qgc2NhbGUgPSBtb2RlbC5zY2FsZU5hbWUoQ09MT1IpO1xuICAgICAgcmV0dXJuIG1vZGVsLm1hcmtEZWYuZmlsbGVkID8ge2ZpbGw6IHNjYWxlfSA6IHtzdHJva2U6IHNjYWxlfTtcbiAgICBjYXNlIEZJTEw6XG4gICAgY2FzZSBTVFJPS0U6XG4gICAgY2FzZSBTSVpFOlxuICAgIGNhc2UgU0hBUEU6XG4gICAgY2FzZSBPUEFDSVRZOlxuICAgICAgcmV0dXJuIHtbY2hhbm5lbF06IG1vZGVsLnNjYWxlTmFtZShjaGFubmVsKX07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGVnZW5kRm9yQ2hhbm5lbChtb2RlbDogVW5pdE1vZGVsLCBjaGFubmVsOiBOb25Qb3NpdGlvblNjYWxlQ2hhbm5lbCk6IExlZ2VuZENvbXBvbmVudCB7XG4gIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoY2hhbm5lbCk7XG4gIGNvbnN0IGxlZ2VuZCA9IG1vZGVsLmxlZ2VuZChjaGFubmVsKTtcblxuICBjb25zdCBsZWdlbmRDbXB0ID0gbmV3IExlZ2VuZENvbXBvbmVudCh7fSwgZ2V0TGVnZW5kRGVmV2l0aFNjYWxlKG1vZGVsLCBjaGFubmVsKSk7XG5cbiAgTEVHRU5EX1BST1BFUlRJRVMuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgIGNvbnN0IHZhbHVlID0gZ2V0UHJvcGVydHkocHJvcGVydHksIGxlZ2VuZCwgY2hhbm5lbCwgbW9kZWwpO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBleHBsaWNpdCA9XG4gICAgICAgIC8vIHNwZWNpZmllZCBsZWdlbmQudmFsdWVzIGlzIGFscmVhZHkgcmVzcGVjdGVkLCBidXQgbWF5IGdldCB0cmFuc2Zvcm1lZC5cbiAgICAgICAgcHJvcGVydHkgPT09ICd2YWx1ZXMnID8gISFsZWdlbmQudmFsdWVzIDpcbiAgICAgICAgLy8gdGl0bGUgY2FuIGJlIGV4cGxpY2l0IGlmIGZpZWxkRGVmLnRpdGxlIGlzIHNldFxuICAgICAgICBwcm9wZXJ0eSA9PT0gJ3RpdGxlJyAmJiB2YWx1ZSA9PT0gbW9kZWwuZmllbGREZWYoY2hhbm5lbCkudGl0bGUgPyB0cnVlIDpcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGluZ3MgYXJlIGV4cGxpY2l0IGlmIHRoZSByZXR1cm5lZCB2YWx1ZSBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgcHJvcGVydHlcbiAgICAgICAgdmFsdWUgPT09IGxlZ2VuZFtwcm9wZXJ0eV07XG4gICAgICBpZiAoZXhwbGljaXQgfHwgbW9kZWwuY29uZmlnLmxlZ2VuZFtwcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsZWdlbmRDbXB0LnNldChwcm9wZXJ0eSwgdmFsdWUsIGV4cGxpY2l0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIDIpIEFkZCBtYXJrIHByb3BlcnR5IGRlZmluaXRpb24gZ3JvdXBzXG4gIGNvbnN0IGxlZ2VuZEVuY29kaW5nID0gbGVnZW5kLmVuY29kaW5nIHx8IHt9O1xuICBjb25zdCBsZWdlbmRFbmNvZGUgPSBbJ2xhYmVscycsICdsZWdlbmQnLCAndGl0bGUnLCAnc3ltYm9scycsICdncmFkaWVudCddLnJlZHVjZSgoZTogVmdMZWdlbmRFbmNvZGUsIHBhcnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGVuY29kZVtwYXJ0XSA/XG4gICAgICAvLyBUT0RPOiByZXBsYWNlIGxlZ2VuZENtcHQgd2l0aCB0eXBlIGlzIHN1ZmZpY2llbnRcbiAgICAgIGVuY29kZVtwYXJ0XShmaWVsZERlZiwgbGVnZW5kRW5jb2RpbmdbcGFydF0sIG1vZGVsLCBjaGFubmVsLCBsZWdlbmRDbXB0LmdldCgndHlwZScpKSA6IC8vIGFwcGx5IHJ1bGVcbiAgICAgIGxlZ2VuZEVuY29kaW5nW3BhcnRdOyAvLyBubyBydWxlIC0tIGp1c3QgZGVmYXVsdCB2YWx1ZXNcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBrZXlzKHZhbHVlKS5sZW5ndGggPiAwKSB7XG4gICAgICBlW3BhcnRdID0ge3VwZGF0ZTogdmFsdWV9O1xuICAgIH1cbiAgICByZXR1cm4gZTtcbiAgfSwge30gYXMgVmdMZWdlbmRFbmNvZGUpO1xuXG4gIGlmIChrZXlzKGxlZ2VuZEVuY29kZSkubGVuZ3RoID4gMCkge1xuICAgIGxlZ2VuZENtcHQuc2V0KCdlbmNvZGUnLCBsZWdlbmRFbmNvZGUsICEhbGVnZW5kLmVuY29kaW5nKTtcbiAgfVxuXG4gIHJldHVybiBsZWdlbmRDbXB0O1xufVxuXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eShwcm9wZXJ0eToga2V5b2YgKExlZ2VuZCB8IFZnTGVnZW5kKSwgc3BlY2lmaWVkTGVnZW5kOiBMZWdlbmQsIGNoYW5uZWw6IE5vblBvc2l0aW9uU2NhbGVDaGFubmVsLCBtb2RlbDogVW5pdE1vZGVsKSB7XG4gIGNvbnN0IGZpZWxkRGVmID0gbW9kZWwuZmllbGREZWYoY2hhbm5lbCk7XG5cbiAgc3dpdGNoIChwcm9wZXJ0eSkge1xuICAgIGNhc2UgJ2Zvcm1hdCc6XG4gICAgICAvLyBXZSBkb24ndCBpbmNsdWRlIHRlbXBvcmFsIGZpZWxkIGhlcmUgYXMgd2UgYXBwbHkgZm9ybWF0IGluIGVuY29kZSBibG9ja1xuICAgICAgcmV0dXJuIG51bWJlckZvcm1hdChmaWVsZERlZiwgc3BlY2lmaWVkTGVnZW5kLmZvcm1hdCwgbW9kZWwuY29uZmlnKTtcbiAgICBjYXNlICd0aXRsZSc6XG4gICAgICAvLyBGb3IgZmFsc3kgdmFsdWUsIGtlZXAgdW5kZWZpbmVkIHNvIHdlIHVzZSBkZWZhdWx0LFxuICAgICAgLy8gYnV0IHVzZSBudWxsIGZvciAnJywgbnVsbCwgYW5kIGZhbHNlIHRvIGhpZGUgdGhlIHRpdGxlXG4gICAgICBjb25zdCBzcGVjaWZpZWRUaXRsZSA9IGZpZWxkRGVmLnRpdGxlICE9PSB1bmRlZmluZWQgPyBmaWVsZERlZi50aXRsZSA6XG4gICAgICAgIHNwZWNpZmllZExlZ2VuZC50aXRsZSB8fCAoc3BlY2lmaWVkTGVnZW5kLnRpdGxlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBudWxsKTtcblxuICAgICAgcmV0dXJuIGdldFNwZWNpZmllZE9yRGVmYXVsdFZhbHVlKFxuICAgICAgICBzcGVjaWZpZWRUaXRsZSxcbiAgICAgICAgZmllbGREZWZUaXRsZShmaWVsZERlZiwgbW9kZWwuY29uZmlnKVxuICAgICAgKSB8fCB1bmRlZmluZWQ7IC8vIG1ha2UgZmFsc3kgdmFsdWUgdW5kZWZpbmVkIHNvIG91dHB1dCBWZWdhIHNwZWMgaXMgc2hvcnRlclxuICAgIGNhc2UgJ3ZhbHVlcyc6XG4gICAgICByZXR1cm4gcHJvcGVydGllcy52YWx1ZXMoc3BlY2lmaWVkTGVnZW5kKTtcbiAgICBjYXNlICd0eXBlJzpcbiAgICAgIHJldHVybiBnZXRTcGVjaWZpZWRPckRlZmF1bHRWYWx1ZShzcGVjaWZpZWRMZWdlbmQudHlwZSwgcHJvcGVydGllcy50eXBlKGZpZWxkRGVmLnR5cGUsIGNoYW5uZWwsIG1vZGVsLmdldFNjYWxlQ29tcG9uZW50KGNoYW5uZWwpLmdldCgndHlwZScpKSk7XG4gIH1cblxuICAvLyBPdGhlcndpc2UsIHJldHVybiBzcGVjaWZpZWQgcHJvcGVydHkuXG4gIHJldHVybiBzcGVjaWZpZWRMZWdlbmRbcHJvcGVydHldO1xufVxuXG5mdW5jdGlvbiBwYXJzZU5vblVuaXRMZWdlbmQobW9kZWw6IE1vZGVsKSB7XG4gIGNvbnN0IHtsZWdlbmRzLCByZXNvbHZlfSA9IG1vZGVsLmNvbXBvbmVudDtcblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIG1vZGVsLmNoaWxkcmVuKSB7XG4gICAgcGFyc2VMZWdlbmQoY2hpbGQpO1xuXG4gICAga2V5cyhjaGlsZC5jb21wb25lbnQubGVnZW5kcykuZm9yRWFjaCgoY2hhbm5lbDogTm9uUG9zaXRpb25TY2FsZUNoYW5uZWwpID0+IHtcbiAgICAgIHJlc29sdmUubGVnZW5kW2NoYW5uZWxdID0gcGFyc2VHdWlkZVJlc29sdmUobW9kZWwuY29tcG9uZW50LnJlc29sdmUsIGNoYW5uZWwpO1xuXG4gICAgICBpZiAocmVzb2x2ZS5sZWdlbmRbY2hhbm5lbF0gPT09ICdzaGFyZWQnKSB7XG4gICAgICAgIC8vIElmIHRoZSByZXNvbHZlIHNheXMgc2hhcmVkIChhbmQgaGFzIG5vdCBiZWVuIG92ZXJyaWRkZW4pXG4gICAgICAgIC8vIFdlIHdpbGwgdHJ5IHRvIG1lcmdlIGFuZCBzZWUgaWYgdGhlcmUgaXMgYSBjb25mbGljdFxuXG4gICAgICAgIGxlZ2VuZHNbY2hhbm5lbF0gPSBtZXJnZUxlZ2VuZENvbXBvbmVudChsZWdlbmRzW2NoYW5uZWxdLCBjaGlsZC5jb21wb25lbnQubGVnZW5kc1tjaGFubmVsXSk7XG5cbiAgICAgICAgaWYgKCFsZWdlbmRzW2NoYW5uZWxdKSB7XG4gICAgICAgICAgLy8gSWYgbWVyZ2UgcmV0dXJucyBub3RoaW5nLCB0aGVyZSBpcyBhIGNvbmZsaWN0IHNvIHdlIGNhbm5vdCBtYWtlIHRoZSBsZWdlbmQgc2hhcmVkLlxuICAgICAgICAgIC8vIFRodXMsIG1hcmsgbGVnZW5kIGFzIGluZGVwZW5kZW50IGFuZCByZW1vdmUgdGhlIGxlZ2VuZCBjb21wb25lbnQuXG4gICAgICAgICAgcmVzb2x2ZS5sZWdlbmRbY2hhbm5lbF0gPSAnaW5kZXBlbmRlbnQnO1xuICAgICAgICAgIGRlbGV0ZSBsZWdlbmRzW2NoYW5uZWxdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBrZXlzKGxlZ2VuZHMpLmZvckVhY2goKGNoYW5uZWw6IE5vblBvc2l0aW9uU2NhbGVDaGFubmVsKSA9PiB7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBtb2RlbC5jaGlsZHJlbikge1xuICAgICAgaWYgKCFjaGlsZC5jb21wb25lbnQubGVnZW5kc1tjaGFubmVsXSkge1xuICAgICAgICAvLyBza2lwIGlmIHRoZSBjaGlsZCBkb2VzIG5vdCBoYXZlIGEgcGFydGljdWxhciBsZWdlbmRcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXNvbHZlLmxlZ2VuZFtjaGFubmVsXSA9PT0gJ3NoYXJlZCcpIHtcbiAgICAgICAgLy8gQWZ0ZXIgbWVyZ2luZyBzaGFyZWQgbGVnZW5kLCBtYWtlIHN1cmUgdG8gcmVtb3ZlIGxlZ2VuZCBmcm9tIGNoaWxkXG4gICAgICAgIGRlbGV0ZSBjaGlsZC5jb21wb25lbnQubGVnZW5kc1tjaGFubmVsXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbGVnZW5kcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlTGVnZW5kQ29tcG9uZW50KG1lcmdlZExlZ2VuZDogTGVnZW5kQ29tcG9uZW50LCBjaGlsZExlZ2VuZDogTGVnZW5kQ29tcG9uZW50KTogTGVnZW5kQ29tcG9uZW50IHtcbiAgaWYgKCFtZXJnZWRMZWdlbmQpIHtcbiAgICByZXR1cm4gY2hpbGRMZWdlbmQuY2xvbmUoKTtcbiAgfVxuICBjb25zdCBtZXJnZWRPcmllbnQgPSBtZXJnZWRMZWdlbmQuZ2V0V2l0aEV4cGxpY2l0KCdvcmllbnQnKTtcbiAgY29uc3QgY2hpbGRPcmllbnQgPSBjaGlsZExlZ2VuZC5nZXRXaXRoRXhwbGljaXQoJ29yaWVudCcpO1xuXG5cbiAgaWYgKG1lcmdlZE9yaWVudC5leHBsaWNpdCAmJiBjaGlsZE9yaWVudC5leHBsaWNpdCAmJiBtZXJnZWRPcmllbnQudmFsdWUgIT09IGNoaWxkT3JpZW50LnZhbHVlKSB7XG4gICAgLy8gVE9ETzogdGhyb3cgd2FybmluZyBpZiByZXNvbHZlIGlzIGV4cGxpY2l0IChXZSBkb24ndCBoYXZlIGluZm8gYWJvdXQgZXhwbGljaXQvaW1wbGljaXQgcmVzb2x2ZSB5ZXQuKVxuICAgIC8vIENhbm5vdCBtZXJnZSBkdWUgdG8gaW5jb25zaXN0ZW50IG9yaWVudFxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgbGV0IHR5cGVNZXJnZWQgPSBmYWxzZTtcbiAgLy8gT3RoZXJ3aXNlLCBsZXQncyBtZXJnZVxuICBmb3IgKGNvbnN0IHByb3Agb2YgVkdfTEVHRU5EX1BST1BFUlRJRVMpIHtcbiAgICBjb25zdCBtZXJnZWRWYWx1ZVdpdGhFeHBsaWNpdCA9IG1lcmdlVmFsdWVzV2l0aEV4cGxpY2l0PFZnTGVnZW5kLCBhbnk+KFxuICAgICAgbWVyZ2VkTGVnZW5kLmdldFdpdGhFeHBsaWNpdChwcm9wKSxcbiAgICAgIGNoaWxkTGVnZW5kLmdldFdpdGhFeHBsaWNpdChwcm9wKSxcbiAgICAgIHByb3AsICdsZWdlbmQnLFxuXG4gICAgICAvLyBUaWUgYnJlYWtlciBmdW5jdGlvblxuICAgICAgKHYxOiBFeHBsaWNpdDxhbnk+LCB2MjogRXhwbGljaXQ8YW55Pik6IGFueSA9PiB7XG4gICAgICAgIHN3aXRjaCAocHJvcCkge1xuICAgICAgICAgIGNhc2UgJ3RpdGxlJzpcbiAgICAgICAgICAgIHJldHVybiB0aXRsZU1lcmdlcih2MSwgdjIpO1xuICAgICAgICAgIGNhc2UgJ3R5cGUnOlxuICAgICAgICAgICAgLy8gVGhlcmUgYXJlIG9ubHkgdHdvIHR5cGVzLiBJZiB3ZSBoYXZlIGRpZmZlcmVudCB0eXBlcywgdGhlbiBwcmVmZXIgc3ltYm9sIG92ZXIgZ3JhZGllbnQuXG4gICAgICAgICAgICB0eXBlTWVyZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSW1wbGljaXQoJ3N5bWJvbCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZhdWx0VGllQnJlYWtlcjxWZ0xlZ2VuZCwgYW55Pih2MSwgdjIsIHByb3AsICdsZWdlbmQnKTtcbiAgICAgIH1cbiAgICApO1xuICAgIG1lcmdlZExlZ2VuZC5zZXRXaXRoRXhwbGljaXQocHJvcCwgbWVyZ2VkVmFsdWVXaXRoRXhwbGljaXQpO1xuICB9XG4gIGlmICh0eXBlTWVyZ2VkKSB7XG4gICAgaWYoKChtZXJnZWRMZWdlbmQuaW1wbGljaXQgfHwge30pLmVuY29kZSB8fCB7fSkuZ3JhZGllbnQpIHtcbiAgICAgIGRlbGV0ZU5lc3RlZFByb3BlcnR5KG1lcmdlZExlZ2VuZC5pbXBsaWNpdCwgWydlbmNvZGUnLCAnZ3JhZGllbnQnXSk7XG4gICAgfVxuICAgIGlmICgoKG1lcmdlZExlZ2VuZC5leHBsaWNpdCB8fCB7fSkuZW5jb2RlIHx8IHt9KS5ncmFkaWVudCkge1xuICAgICAgZGVsZXRlTmVzdGVkUHJvcGVydHkobWVyZ2VkTGVnZW5kLmV4cGxpY2l0LCBbJ2VuY29kZScsICdncmFkaWVudCddKTtcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBtZXJnZWRMZWdlbmQ7XG59XG5cbiJdfQ==