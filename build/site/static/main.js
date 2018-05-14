"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_request_1 = require("d3-request");
var d3_selection_1 = require("d3-selection");
var hljs = require("highlight.js");
var vega = require("vega");
var post_1 = require("vega-embed/build/post");
var vega_tooltip_1 = require("vega-tooltip");
var src_1 = require("../../src");
var streaming_1 = require("./streaming");
window['runStreamingExample'] = streaming_1.runStreamingExample;
window['embedExample'] = embedExample;
var loader = vega.loader({
    baseURL: BASEURL
});
var editorURL = 'https://vega.github.io/editor/';
function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}
/* Anchors */
d3_selection_1.selectAll('h2, h3, h4, h5, h6').each(function () {
    var sel = d3_selection_1.select(this);
    var name = sel.attr('id');
    var title = sel.text();
    sel.html('<a href="#' + name + '" class="anchor"><span class="octicon octicon-link"></span></a>' + trim(title));
});
/* Documentation */
function renderExample($target, specText) {
    $target.classed('example', true);
    $target.text('');
    var vis = $target.append('div').attr('class', 'example-vis');
    // Decrease visual noise by removing $schema and description from code examples.
    var textClean = specText.replace(/(\s)+\"(\$schema|description)\": \".*?\",/g, '');
    var code = $target.append('pre').attr('class', 'example-code')
        .append('code').attr('class', 'json').text(textClean);
    hljs.highlightBlock(code.node());
    var spec = JSON.parse(specText);
    embedExample(vis.node(), spec, true, $target.classed('tooltip'));
}
function embedExample($target, spec, actions, tooltip) {
    if (actions === void 0) { actions = true; }
    if (tooltip === void 0) { tooltip = false; }
    var vgSpec = src_1.compile(spec).spec;
    var view = new vega.View(vega.parse(vgSpec), { loader: loader })
        .renderer('svg')
        .initialize($target)
        .run();
    var div = d3_selection_1.select($target)
        .append('div')
        .attr('class', 'vega-actions')
        .append('a')
        .text('Open in Vega Editor')
        .attr('href', '#')
        .on('click', function () {
        post_1.post(window, editorURL, {
            mode: 'vega-lite',
            spec: JSON.stringify(spec, null, 2),
        });
        d3_selection_1.event.preventDefault();
    });
    if (tooltip) {
        vega_tooltip_1.vegaLite(view, spec);
    }
}
function getSpec(el) {
    var sel = d3_selection_1.select(el);
    var name = sel.attr('data-name');
    if (name) {
        var dir = sel.attr('data-dir');
        var fullUrl = BASEURL + '/examples/specs/' + (dir ? (dir + '/') : '') + name + '.vl.json';
        d3_request_1.text(fullUrl, function (error, spec) {
            if (error) {
                console.error(error);
            }
            else {
                renderExample(sel, spec);
            }
        });
    }
    else {
        console.error('No "data-name" specified to import examples from');
    }
}
window['changeSpec'] = function (elId, newSpec) {
    var el = document.getElementById(elId);
    d3_selection_1.select(el).attr('data-name', newSpec);
    getSpec(el);
};
window['buildSpecOpts'] = function (id, baseName) {
    var oldName = d3_selection_1.select('#' + id).attr('data-name');
    var prefixSel = d3_selection_1.select('select[name=' + id + ']');
    var inputsSel = d3_selection_1.selectAll('input[name=' + id + ']:checked');
    var prefix = prefixSel.empty() ? id : prefixSel.property('value');
    var values = inputsSel.nodes().map(function (n) { return n.value; }).sort().join('_');
    var newName = baseName + prefix + (values ? '_' + values : '');
    if (oldName !== newName) {
        window['changeSpec'](id, newName);
    }
};
d3_selection_1.selectAll('.vl-example').each(function () {
    getSpec(this);
});
// caroussel for the front page
// adapted from https://codepen.io/LANparty/pen/wePYXb
var carousel = document.getElementById('carousel');
function carouselHide(slides, indicators, links, active) {
    indicators[active].setAttribute('data-state', '');
    links[active].setAttribute('data-state', '');
    slides[active].setAttribute('data-state', '');
    slides[active].style.display = 'none';
    var video = slides[active].querySelector('video');
    if (video) {
        video.pause();
    }
}
function carouselShow(slides, indicators, links, active) {
    indicators[active].checked = true;
    indicators[active].setAttribute('data-state', 'active');
    links[active].setAttribute('data-state', 'active');
    slides[active].setAttribute('data-state', 'active');
    var video = slides[active].querySelector('video');
    if (video) {
        video.currentTime = 0;
        slides[active].style.display = 'block';
        video.play();
    }
    else {
        slides[active].style.display = 'block';
    }
}
function setSlide(slides, indicators, links, active) {
    return function () {
        // Reset all slides
        for (var i = 0; i < indicators.length; i++) {
            indicators[i].setAttribute('data-state', '');
            slides[i].setAttribute('data-state', '');
            carouselHide(slides, indicators, links, i);
        }
        // Set defined slide as active
        indicators[active].setAttribute('data-state', 'active');
        slides[active].setAttribute('data-state', 'active');
        carouselShow(slides, indicators, links, active);
        // Switch button text
        var numSlides = carousel.querySelectorAll('.indicator').length;
        if (numSlides === active + 1) {
            carousel.querySelector('.next-slide').textContent = 'Start over';
        }
        else {
            carousel.querySelector('.next-slide').textContent = 'Next step';
        }
    };
}
if (carousel) {
    var slides_1 = carousel.querySelectorAll('.slide');
    var indicators_1 = carousel.querySelectorAll('.indicator');
    var links_1 = carousel.querySelectorAll('.slide-nav');
    // tslint:disable-next-line:prefer-for-of
    for (var i = 0; i < indicators_1.length; i++) {
        indicators_1[i].addEventListener('click', setSlide(slides_1, indicators_1, links_1, +indicators_1[i].getAttribute('data-slide')));
    }
    // tslint:disable-next-line:prefer-for-of
    for (var i = 0; i < links_1.length; i++) {
        links_1[i].addEventListener('click', setSlide(slides_1, indicators_1, links_1, +links_1[i].getAttribute('data-slide')));
    }
    carousel.querySelector('.next-slide').addEventListener('click', function () {
        var slide = +carousel.querySelector('.indicator[data-state=active]').getAttribute('data-slide');
        var numSlides = carousel.querySelectorAll('.indicator').length;
        setSlide(slides_1, indicators_1, links_1, (slide + 1) % numSlides)();
    });
    [].forEach.call(slides_1, function (slide) {
        var video = slide.querySelector('video');
        if (video) {
            video.addEventListener('mouseover', function () {
                slide.querySelector('.example-vis').style.visibility = 'visible';
                video.style.display = 'none';
                video.pause();
            });
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NpdGUvc3RhdGljL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBZ0M7QUFDaEMsNkNBQWlFO0FBQ2pFLG1DQUFxQztBQUNyQywyQkFBNkI7QUFDN0IsOENBQTJDO0FBQzNDLDZDQUFzQztBQUV0QyxpQ0FBZ0Q7QUFDaEQseUNBQWdEO0FBRWhELE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLCtCQUFtQixDQUFDO0FBQ3BELE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxZQUFZLENBQUM7QUFJdEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN6QixPQUFPLEVBQUUsT0FBTztDQUNqQixDQUFDLENBQUM7QUFFSCxJQUFNLFNBQVMsR0FBRyxnQ0FBZ0MsQ0FBQztBQUVuRCxjQUFjLEdBQVc7SUFDdkIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsYUFBYTtBQUNiLHdCQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDbkMsSUFBTSxHQUFHLEdBQUcscUJBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsaUVBQWlFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEgsQ0FBQyxDQUFDLENBQUM7QUFFSCxtQkFBbUI7QUFDbkIsdUJBQXVCLE9BQXNDLEVBQUUsUUFBZ0I7SUFDN0UsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7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YyxDQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Z0JBQzFFLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztnQkFDN0IsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDLENBQUMsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt0ZXh0fSBmcm9tICdkMy1yZXF1ZXN0JztcbmltcG9ydCB7ZXZlbnQsIHNlbGVjdCwgc2VsZWN0QWxsLCBTZWxlY3Rpb259IGZyb20gJ2QzLXNlbGVjdGlvbic7XG5pbXBvcnQgKiBhcyBobGpzIGZyb20gJ2hpZ2hsaWdodC5qcyc7XG5pbXBvcnQgKiBhcyB2ZWdhIGZyb20gJ3ZlZ2EnO1xuaW1wb3J0IHtwb3N0fSBmcm9tICd2ZWdhLWVtYmVkL2J1aWxkL3Bvc3QnO1xuaW1wb3J0IHt2ZWdhTGl0ZX0gZnJvbSAndmVnYS10b29sdGlwJztcblxuaW1wb3J0IHtjb21waWxlLCBUb3BMZXZlbFNwZWN9IGZyb20gJy4uLy4uL3NyYyc7XG5pbXBvcnQge3J1blN0cmVhbWluZ0V4YW1wbGV9IGZyb20gJy4vc3RyZWFtaW5nJztcblxud2luZG93WydydW5TdHJlYW1pbmdFeGFtcGxlJ10gPSBydW5TdHJlYW1pbmdFeGFtcGxlO1xud2luZG93WydlbWJlZEV4YW1wbGUnXSA9IGVtYmVkRXhhbXBsZTtcblxuZGVjbGFyZSBjb25zdCBCQVNFVVJMOiBzdHJpbmc7XG5cbmNvbnN0IGxvYWRlciA9IHZlZ2EubG9hZGVyKHtcbiAgYmFzZVVSTDogQkFTRVVSTFxufSk7XG5cbmNvbnN0IGVkaXRvclVSTCA9ICdodHRwczovL3ZlZ2EuZ2l0aHViLmlvL2VkaXRvci8nO1xuXG5mdW5jdGlvbiB0cmltKHN0cjogc3RyaW5nKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKiBBbmNob3JzICovXG5zZWxlY3RBbGwoJ2gyLCBoMywgaDQsIGg1LCBoNicpLmVhY2goZnVuY3Rpb24odGhpczogZDMuQmFzZVR5cGUpIHtcbiAgY29uc3Qgc2VsID0gc2VsZWN0KHRoaXMpO1xuICBjb25zdCBuYW1lID0gc2VsLmF0dHIoJ2lkJyk7XG4gIGNvbnN0IHRpdGxlID0gc2VsLnRleHQoKTtcbiAgc2VsLmh0bWwoJzxhIGhyZWY9XCIjJyArIG5hbWUgKyAnXCIgY2xhc3M9XCJhbmNob3JcIj48c3BhbiBjbGFzcz1cIm9jdGljb24gb2N0aWNvbi1saW5rXCI+PC9zcGFuPjwvYT4nICsgdHJpbSh0aXRsZSkpO1xufSk7XG5cbi8qIERvY3VtZW50YXRpb24gKi9cbmZ1bmN0aW9uIHJlbmRlckV4YW1wbGUoJHRhcmdldDogU2VsZWN0aW9uPGFueSwgYW55LCBhbnksIGFueT4sIHNwZWNUZXh0OiBzdHJpbmcpIHtcbiAgJHRhcmdldC5jbGFzc2VkKCdleGFtcGxlJywgdHJ1ZSk7XG4gICR0YXJnZXQudGV4dCgnJyk7XG5cbiAgY29uc3QgdmlzID0gJHRhcmdldC5hcHBlbmQoJ2RpdicpLmF0dHIoJ2NsYXNzJywgJ2V4YW1wbGUtdmlzJyk7XG5cbiAgLy8gRGVjcmVhc2UgdmlzdWFsIG5vaXNlIGJ5IHJlbW92aW5nICRzY2hlbWEgYW5kIGRlc2NyaXB0aW9uIGZyb20gY29kZSBleGFtcGxlcy5cbiAgY29uc3QgdGV4dENsZWFuID0gc3BlY1RleHQucmVwbGFjZSgvKFxccykrXFxcIihcXCRzY2hlbWF8ZGVzY3JpcHRpb24pXFxcIjogXFxcIi4qP1xcXCIsL2csICcnKTtcbiAgY29uc3QgY29kZSA9ICR0YXJnZXQuYXBwZW5kKCdwcmUnKS5hdHRyKCdjbGFzcycsICdleGFtcGxlLWNvZGUnKVxuICAuYXBwZW5kKCdjb2RlJykuYXR0cignY2xhc3MnLCAnanNvbicpLnRleHQodGV4dENsZWFuKTtcbiAgaGxqcy5oaWdobGlnaHRCbG9jayhjb2RlLm5vZGUoKSBhcyBhbnkpO1xuXG4gIGNvbnN0IHNwZWMgPSBKU09OLnBhcnNlKHNwZWNUZXh0KTtcblxuICBlbWJlZEV4YW1wbGUodmlzLm5vZGUoKSwgc3BlYywgdHJ1ZSwgJHRhcmdldC5jbGFzc2VkKCd0b29sdGlwJykpO1xufVxuXG5mdW5jdGlvbiBlbWJlZEV4YW1wbGUoJHRhcmdldDogYW55LCBzcGVjOiBUb3BMZXZlbFNwZWMsIGFjdGlvbnM9dHJ1ZSwgdG9vbHRpcD1mYWxzZSkge1xuICBjb25zdCB2Z1NwZWMgPSBjb21waWxlKHNwZWMpLnNwZWM7XG4gIGNvbnN0IHZpZXcgPSBuZXcgdmVnYS5WaWV3KHZlZ2EucGFyc2UodmdTcGVjKSwge2xvYWRlcjogbG9hZGVyfSlcbiAgICAucmVuZGVyZXIoJ3N2ZycpXG4gICAgLmluaXRpYWxpemUoJHRhcmdldClcbiAgICAucnVuKCk7XG5cbiAgY29uc3QgZGl2ID0gc2VsZWN0KCR0YXJnZXQpXG4gICAgLmFwcGVuZCgnZGl2JylcbiAgICAuYXR0cignY2xhc3MnLCAndmVnYS1hY3Rpb25zJylcbiAgICAuYXBwZW5kKCdhJylcbiAgICAudGV4dCgnT3BlbiBpbiBWZWdhIEVkaXRvcicpXG4gICAgLmF0dHIoJ2hyZWYnLCAnIycpXG4gICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHBvc3Qod2luZG93LCBlZGl0b3JVUkwsIHtcbiAgICAgICAgbW9kZTogJ3ZlZ2EtbGl0ZScsXG4gICAgICAgIHNwZWM6IEpTT04uc3RyaW5naWZ5KHNwZWMsIG51bGwsIDIpLFxuICAgIH0pO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIGlmICh0b29sdGlwKSB7XG4gICAgdmVnYUxpdGUodmlldywgc3BlYyBhcyBhbnkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNwZWMoZWw6IGQzLkJhc2VUeXBlKSB7XG4gIGNvbnN0IHNlbCA9IHNlbGVjdChlbCk7XG4gIGNvbnN0IG5hbWUgPSBzZWwuYXR0cignZGF0YS1uYW1lJyk7XG4gIGlmIChuYW1lKSB7XG4gICAgY29uc3QgZGlyID0gc2VsLmF0dHIoJ2RhdGEtZGlyJyk7XG4gICAgY29uc3QgZnVsbFVybCA9IEJBU0VVUkwgKyAnL2V4YW1wbGVzL3NwZWNzLycgKyAoZGlyID8gKGRpciArICcvJykgOiAnJykgKyBuYW1lICsgJy52bC5qc29uJztcblxuICAgIHRleHQoZnVsbFVybCwgZnVuY3Rpb24oZXJyb3IsIHNwZWMpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlckV4YW1wbGUoc2VsLCBzcGVjKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdObyBcImRhdGEtbmFtZVwiIHNwZWNpZmllZCB0byBpbXBvcnQgZXhhbXBsZXMgZnJvbScpO1xuICB9XG59XG5cbndpbmRvd1snY2hhbmdlU3BlYyddID0gZnVuY3Rpb24oZWxJZDogc3RyaW5nLCBuZXdTcGVjOiBzdHJpbmcpIHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbElkKTtcbiAgc2VsZWN0KGVsKS5hdHRyKCdkYXRhLW5hbWUnLCBuZXdTcGVjKTtcbiAgZ2V0U3BlYyhlbCk7XG59O1xuXG53aW5kb3dbJ2J1aWxkU3BlY09wdHMnXSA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcsIGJhc2VOYW1lOiBzdHJpbmcpIHtcbiAgY29uc3Qgb2xkTmFtZSA9IHNlbGVjdCgnIycgKyBpZCkuYXR0cignZGF0YS1uYW1lJyk7XG4gIGNvbnN0IHByZWZpeFNlbCA9IHNlbGVjdCgnc2VsZWN0W25hbWU9JyArIGlkICsgJ10nKTtcbiAgY29uc3QgaW5wdXRzU2VsID0gc2VsZWN0QWxsKCdpbnB1dFtuYW1lPScgKyBpZCArICddOmNoZWNrZWQnKTtcbiAgY29uc3QgcHJlZml4ID0gcHJlZml4U2VsLmVtcHR5KCkgPyBpZCA6IHByZWZpeFNlbC5wcm9wZXJ0eSgndmFsdWUnKTtcbiAgY29uc3QgdmFsdWVzID0gaW5wdXRzU2VsLm5vZGVzKCkubWFwKChuOiBhbnkpID0+IG4udmFsdWUpLnNvcnQoKS5qb2luKCdfJyk7XG4gIGNvbnN0IG5ld05hbWUgPSBiYXNlTmFtZSArIHByZWZpeCArICh2YWx1ZXMgPyAnXycgKyB2YWx1ZXMgOiAnJyk7XG4gIGlmIChvbGROYW1lICE9PSBuZXdOYW1lKSB7XG4gICAgd2luZG93WydjaGFuZ2VTcGVjJ10oaWQsIG5ld05hbWUpO1xuICB9XG59O1xuXG5zZWxlY3RBbGwoJy52bC1leGFtcGxlJykuZWFjaChmdW5jdGlvbih0aGlzOiBkMy5CYXNlVHlwZSkge1xuICBnZXRTcGVjKHRoaXMpO1xufSk7XG5cbi8vIGNhcm91c3NlbCBmb3IgdGhlIGZyb250IHBhZ2Vcbi8vIGFkYXB0ZWQgZnJvbSBodHRwczovL2NvZGVwZW4uaW8vTEFOcGFydHkvcGVuL3dlUFlYYlxuXG5jb25zdCBjYXJvdXNlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJvdXNlbCcpO1xuXG5mdW5jdGlvbiBjYXJvdXNlbEhpZGUoc2xpZGVzOiBOb2RlTGlzdE9mPGFueT4sIGluZGljYXRvcnM6IE5vZGVMaXN0T2Y8YW55PiwgbGlua3M6IE5vZGVMaXN0T2Y8YW55PiwgYWN0aXZlOiBudW1iZXIpIHtcbiAgaW5kaWNhdG9yc1thY3RpdmVdLnNldEF0dHJpYnV0ZSgnZGF0YS1zdGF0ZScsICcnKTtcbiAgbGlua3NbYWN0aXZlXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhdGUnLCAnJyk7XG4gIHNsaWRlc1thY3RpdmVdLnNldEF0dHJpYnV0ZSgnZGF0YS1zdGF0ZScsICcnKTtcbiAgc2xpZGVzW2FjdGl2ZV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICBjb25zdCB2aWRlbyA9IHNsaWRlc1thY3RpdmVdLnF1ZXJ5U2VsZWN0b3IoJ3ZpZGVvJyk7XG4gIGlmICh2aWRlbykge1xuICAgIHZpZGVvLnBhdXNlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2Fyb3VzZWxTaG93KHNsaWRlczogTm9kZUxpc3RPZjxhbnk+LCBpbmRpY2F0b3JzOiBOb2RlTGlzdE9mPGFueT4sIGxpbmtzOiBOb2RlTGlzdE9mPGFueT4sIGFjdGl2ZTogbnVtYmVyKSB7XG4gIGluZGljYXRvcnNbYWN0aXZlXS5jaGVja2VkID0gdHJ1ZTtcbiAgaW5kaWNhdG9yc1thY3RpdmVdLnNldEF0dHJpYnV0ZSgnZGF0YS1zdGF0ZScsICdhY3RpdmUnKTtcbiAgbGlua3NbYWN0aXZlXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhdGUnLCAnYWN0aXZlJyk7XG4gIHNsaWRlc1thY3RpdmVdLnNldEF0dHJpYnV0ZSgnZGF0YS1zdGF0ZScsICdhY3RpdmUnKTtcblxuICBjb25zdCB2aWRlbyA9IHNsaWRlc1thY3RpdmVdLnF1ZXJ5U2VsZWN0b3IoJ3ZpZGVvJyk7XG4gIGlmICh2aWRlbykge1xuICAgIHZpZGVvLmN1cnJlbnRUaW1lID0gMDtcbiAgICBzbGlkZXNbYWN0aXZlXS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB2aWRlby5wbGF5KCk7XG4gIH0gZWxzZSB7XG4gICAgc2xpZGVzW2FjdGl2ZV0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0U2xpZGUoc2xpZGVzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+LCBpbmRpY2F0b3JzOiBOb2RlTGlzdE9mPEVsZW1lbnQ+LCBsaW5rczogTm9kZUxpc3RPZjxhbnk+LCBhY3RpdmU6IG51bWJlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgLy8gUmVzZXQgYWxsIHNsaWRlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5kaWNhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgaW5kaWNhdG9yc1tpXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhdGUnLCAnJyk7XG4gICAgICBzbGlkZXNbaV0uc2V0QXR0cmlidXRlKCdkYXRhLXN0YXRlJywgJycpO1xuICAgICAgY2Fyb3VzZWxIaWRlKHNsaWRlcywgaW5kaWNhdG9ycywgbGlua3MsIGkpO1xuICAgIH1cblxuICAgIC8vIFNldCBkZWZpbmVkIHNsaWRlIGFzIGFjdGl2ZVxuICAgIGluZGljYXRvcnNbYWN0aXZlXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhdGUnLCAnYWN0aXZlJyk7XG4gICAgc2xpZGVzW2FjdGl2ZV0uc2V0QXR0cmlidXRlKCdkYXRhLXN0YXRlJywgJ2FjdGl2ZScpO1xuICAgIGNhcm91c2VsU2hvdyhzbGlkZXMsIGluZGljYXRvcnMsIGxpbmtzLCBhY3RpdmUpO1xuXG4gICAgLy8gU3dpdGNoIGJ1dHRvbiB0ZXh0XG4gICAgY29uc3QgbnVtU2xpZGVzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmluZGljYXRvcicpLmxlbmd0aDtcbiAgICBpZiAobnVtU2xpZGVzID09PSBhY3RpdmUgKyAxKSB7XG4gICAgICBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yKCcubmV4dC1zbGlkZScpLnRleHRDb250ZW50ID0gJ1N0YXJ0IG92ZXInO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yKCcubmV4dC1zbGlkZScpLnRleHRDb250ZW50ID0gJ05leHQgc3RlcCc7XG4gICAgfVxuICB9O1xufVxuXG5pZiAoY2Fyb3VzZWwpIHtcbiAgY29uc3Qgc2xpZGVzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLnNsaWRlJyk7XG4gIGNvbnN0IGluZGljYXRvcnMgPSBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yQWxsKCcuaW5kaWNhdG9yJyk7XG4gIGNvbnN0IGxpbmtzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLnNsaWRlLW5hdicpO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpwcmVmZXItZm9yLW9mXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW5kaWNhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgIGluZGljYXRvcnNbaV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRTbGlkZShzbGlkZXMsIGluZGljYXRvcnMsIGxpbmtzLCAraW5kaWNhdG9yc1tpXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2xpZGUnKSkpO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnByZWZlci1mb3Itb2ZcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykge1xuICAgIGxpbmtzW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2V0U2xpZGUoc2xpZGVzLCBpbmRpY2F0b3JzLCBsaW5rcywgK2xpbmtzW2ldLmdldEF0dHJpYnV0ZSgnZGF0YS1zbGlkZScpKSk7XG4gIH1cblxuICBjYXJvdXNlbC5xdWVyeVNlbGVjdG9yKCcubmV4dC1zbGlkZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGNvbnN0IHNsaWRlID0gK2Nhcm91c2VsLnF1ZXJ5U2VsZWN0b3IoJy5pbmRpY2F0b3JbZGF0YS1zdGF0ZT1hY3RpdmVdJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNsaWRlJyk7XG4gICAgY29uc3QgbnVtU2xpZGVzID0gY2Fyb3VzZWwucXVlcnlTZWxlY3RvckFsbCgnLmluZGljYXRvcicpLmxlbmd0aDtcbiAgICBzZXRTbGlkZShzbGlkZXMsIGluZGljYXRvcnMsIGxpbmtzLCAoc2xpZGUgKyAxKSAlIG51bVNsaWRlcykoKTtcbiAgfSk7XG5cbiAgW10uZm9yRWFjaC5jYWxsKHNsaWRlcywgKHNsaWRlOiBFbGVtZW50KSA9PiB7XG4gICAgY29uc3QgdmlkZW8gPSBzbGlkZS5xdWVyeVNlbGVjdG9yKCd2aWRlbycpO1xuICAgIGlmICh2aWRlbykge1xuICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICAoc2xpZGUucXVlcnlTZWxlY3RvcignLmV4YW1wbGUtdmlzJykgYXMgYW55KS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgICB2aWRlby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==