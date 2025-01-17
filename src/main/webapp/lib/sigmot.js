;(function(undefined) {
    'use strict';

        const atlasPars = {
            startingIterations : 200,
            slowDown: 5, // éviter de trop bouger
            // edgeWeightInfluence: 1, // messy cristal
            // outboundAttractionDistribution: true, // messy cristal
            // adjustSizes: true, // messy cristal
            // iterationsPerRender : 100, // en fait non
            // gravity: 0.5, // corrélation inverse au scaling 
            // linLogMode: true,
            // barnesHutOptimize: true, // avec linlog
            // barnesHutTheta: 0.3,    // pas trop petit
            scalingRatio: 0.5, // 
            worker: true, // OUI !
        };


    sigma.utils.pkg('sigma.canvas.labels');

    /**
     * This label renderer will just display the label on the center of the node.
     *
     * @param {object}                                     node         The node object.
     * @param {CanvasRenderingContext2D} ctx    The canvas context.
     * @param {configurable}                         settings The settings function.
     */
    sigma.canvas.labels.def = function(node, ctx, settings) {
        var fontSize,
                prefix = settings('prefix') || '',
                labelWidth = 0,
                alignment,
                size = node[prefix + 'size']
                
        ;

        if (size < settings('labelThreshold'))
            return;

        if (!node.label || typeof node.label !== 'string')
            return;

        if (settings('labelAlignment') === undefined){
            alignment = settings('defaultLabelAlignment');
        } else {
            alignment = settings('labelAlignment');
        }


        /*
        fontSize = (settings('labelSize') === 'fixed') ?
            settings('defaultLabelSize') :
            settings('labelSizeRatio') * size;
        */
        let labelPlacementX = node[prefix + 'x'];
        let labelPlacementY = node[prefix + 'y'];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
       
        // Pivot
        /*
        if (node.type == 'pivot') {
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 2;
            ctx.fillStyle = "#000";
            ctx.globalAlpha = 1;
            fontSize =  settings('minNodeSize') + (settings('maxNodeSize') - settings('minNodeSize')) / 2;
            ctx.font = "700 " + fontSize + 'px ' + settings('font');
            ctx.fillText(
                node.label,
                labelPlacementX,
                labelPlacementY
            );
            ctx.shadowBlur = 0;
            return;
        }
        */

        
            
        var fontSize = (settings('labelSize') === 'fixed') ?
            settings('defaultLabelSize') :
            settings('minNodeSize') + settings('labelSizeRatio') * (size - settings('minNodeSize'));

        
        let fontStyle = (settings('fontStyle') ? settings('fontStyle') + ' ' : '');
        let alpha = 1;
        if (node.type == 'pivot') {
            // keep alpha 100% for pivot
        }
        else if (settings('labelSize') != 'fixed') {
            let ratio = (size - settings('minNodeSize')) / (settings('maxNodeSize') - settings('minNodeSize'));
            fontStyle = '' + (200 + Math.round(ratio * 700)) + ' ';
            alpha = 0.2 + (0.8 - ratio * 0.8);
            // console.log(alpha);
        }

        ctx.font = fontStyle + fontSize + 'px ' + settings('font');


        /*
        let textMetrics = ctx.measureText(node.label);
        let labelWidth = textMetrics.width;
        switch (alignment) {
            case 'inside':
                if (labelWidth <= size * 2){
                    labelPlacementX = Math.round(node[prefix + 'x'] - labelWidth / 2 );
                }
                break;
            case 'center':
                labelPlacementX = Math.round(node[prefix + 'x'] - labelWidth / 2 );
                break;
            case 'left':
                labelPlacementX = Math.round(node[prefix + 'x'] - size - labelWidth - 3 );
                break;
            case 'right':
                labelPlacementX = Math.round(node[prefix + 'x'] + size + 3);
                break;
            case 'top':
                labelPlacementX = Math.round(node[prefix + 'x'] - labelWidth / 2 );
                labelPlacementY = labelPlacementY - size - fontSize;
                break;
            case 'bottom':
                labelPlacementX = Math.round(node[prefix + 'x'] - labelWidth / 2 );
                labelPlacementY = labelPlacementY + size + fontSize;
                break;
            default:
                // Default is aligned 'right'
                labelPlacementX = Math.round(node[prefix + 'x'] + size + 3);
                break;
        }
        */
        var color = (settings('labelColor') === 'node') ? (node.color || settings('defaultNodeColor')) : settings('defaultLabelColor');
        ctx.globalAlpha = 1;
        /* too much time
        ctx.shadowColor="#fff";
        ctx.shadowBlur=1;
        */
        /* stroke, bof
        ctx.globalAlpha = 1;
        ctx.lineWidth=0.5;
        ctx.strokeStyle = (settings('labelColor') === 'node') ?
            (node.color || settings('defaultNodeColor')) :
            settings('defaultLabelColor');
        ctx.strokeText(
            node.label,
            labelPlacementX,
            labelPlacementY
        );
        ctx.globalAlpha = 0.6;
        */
        /*
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.strokeText(
            node.label,
            labelPlacementX,
            labelPlacementY
        );
        */
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillText(
            node.label,
            labelPlacementX,
            labelPlacementY
        );


    };

    /**
     * Override the node over for centered labels
     *
     * @param {object}                                     node         The node object.
     * @param {CanvasRenderingContext2D} ctx    The canvas context.
     * @param {configurable}                         settings The settings function.
     */
    sigma.canvas.hovers.def = function(node, ctx, settings) {
        var x,
            y,
            w,
            h,
            e,
            fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
            prefix = settings('prefix') || '',
            size = node[prefix + 'size'],
            fontSize = (settings('labelSize') === 'fixed') ?
                settings('defaultLabelSize') :
                settings('labelSizeRatio') * size;

        // Label background:
        ctx.font = (fontStyle ? fontStyle + ' ' : '') +
            fontSize + 'px ' + (settings('hoverFont') || settings('font'));

        ctx.beginPath();
        ctx.fillStyle = settings('labelHoverBGColor') === 'node' ?
            (node.color || settings('defaultNodeColor')) :
            settings('defaultHoverLabelBGColor');

        if (node.label && settings('labelHoverShadow')) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 8;
            ctx.shadowColor = settings('labelHoverShadowColor');
        }

        /*
        if (node.label && typeof node.label === 'string') {
            x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
            y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
            w = Math.round(
                ctx.measureText(node.label).width + fontSize / 2 + size + 7
            );
            h = Math.round(fontSize + 4);
            e = Math.round(fontSize / 2 + 2);

            ctx.moveTo(x, y + e);
            ctx.arcTo(x, y, x + e, y, e);
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x + e, y + h);
            ctx.arcTo(x, y + h, x, y + h - e, e);
            ctx.lineTo(x, y + e);

            ctx.closePath();
            ctx.fill();

            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
        }
        */

        /*
        // Node border:
        if (settings('borderSize') > 0) {
            ctx.beginPath();
            ctx.fillStyle = settings('nodeBorderColor') === 'node' ?
                (node.color || settings('defaultNodeColor')) :
                settings('defaultNodeBorderColor');
            ctx.arc(
                node[prefix + 'x'],
                node[prefix + 'y'],
                size + settings('borderSize'),
                0,
                Math.PI * 2,
                true
            );
            ctx.closePath();
            ctx.fill();
        }
        */

        // Node:
        var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
        // nodeRenderer(node, ctx, settings);

        /*
        // Display the label:
        if (node.label && typeof node.label === 'string') {
            ctx.fillStyle = (settings('labelHoverColor') === 'node') ?
                (node.color || settings('defaultNodeColor')) :
                settings('defaultLabelHoverColor');

            ctx.fillText(
                node.label,
                Math.round(node[prefix + 'x'] + size + 3),
                Math.round(node[prefix + 'y'] + fontSize / 3)
            );
        }
        */
    };



    window.sigmot = function (id, data, maxNodeSize)
    {
        var asigmot = this;

    
        var zediv = document.getElementById( id );
        this.zediv = zediv;
        //
        var height = zediv.offsetHeight;
        // adjust maxnode size to screen height
        // var scale = Math.max( height, 150) / 700;
        if ( !maxNodeSize ) maxNodeSize = height / 12;
        else maxNodeSize = maxNodeSize * scale;
        var width = zediv.offsetWidth;
        
        var s = new sigma({
            id: id,
            graph: data,
            renderer: {
                container: zediv,
                type: 'canvas'
            },
            settings: {
                // autoRescale: false, // non
                // scalingMode: "outside", // non
                autoResize: false,
                // height: height,
                // width: width,
                // scale : 0.9, // effect of global size on graph objects
                // sideMargin: 1,
                
                defaultNodeColor: "rgba(0, 255, 0, 0.5)",
                defaultEdgeColor: 'rgba(255, 255, 255, 0.4)',
                edgeColor: "default",
                drawLabels: true,
                defaultLabelSize: 15,
                defaultLabelColor: "rgba( 0, 0, 0, 0.8)",
                // labelStrokeStyle: "rgba(255, 255, 255, 0.7)",
                labelThreshold: 0,
                labelSize:"proportional",
                labelSizeRatio: 1,
                labelAlignment: 'center', // specific
                labelColor: "node",
                font: '"Fira Sans", "thesans", sans-serif', // after fontSize
                fontStyle: '100', // before fontSize

                minNodeSize: 10,
                maxNodeSize: maxNodeSize,
                minEdgeSize: 0.2,
                maxEdgeSize: maxNodeSize,

                // minArrowSize: 15,
                // maxArrowSize: 20,
                borderSize: 1,
                outerBorderSize: 3, // stroke size of active nodes
                defaultNodeBorderColor: '#000000',
                defaultNodeOuterBorderColor: 'rgb(236, 81, 72)', // stroke color of active nodes
                drawNodes: false,
                // zoomingRatio: 1.1,
                mouseWheelEnabled: false,
                edgeHoverColor: 'edge',
                defaultEdgeHoverColor: '#000000',
                doubleClickEnabled: false, // utilisé pour la suppression
                /*
                enableEdgeHovering: true, // bad for memory
                edgeHoverSizeRatio: 1,
                edgeHoverExtremities: true,
                */
            }
        });
        
        
        this.s = s;
        

        s.bind( 'doubleClickNode', function( e ) {
            if (e.data.node.type) e.data.node.type = null;
            else e.data.node.type = "hub";
            e.target.refresh();
        });
        s.bind( 'rightClickNode', function( e ) {
            e.data.renderer.graph.dropNode(e.data.node.id);
            e.target.refresh();
        });

        var workOver, workOut;
        s.bind( "overNode", function( e ) {
            if (workOver ) return;
            workOver = true;
            var center= e.data.node;
            var nodes = e.data;
            var neighbors = {};
            s.graph.edges().forEach( function(e) {
                if ( e.source != center.id && e.target != center.id ) {
                    e.hidden = true;
                    return;
                }
                neighbors[e.source] = 1;
                neighbors[e.target] = 1;
            });
            s.graph.nodes().forEach( function(n) {
                if( neighbors[n.id] ) {
                    n.hidden = 0;
                } else {
                    n.hidden = 1;
                }
            });
            s.refresh( );
            workOver = false;
        } ).bind('outNode', function() {
            if (workOut) return;
            workOut = true;
            s.graph.edges().forEach( function(e) {
                e.hidden = 0;
            } );
            s.graph.nodes().forEach( function(n) {
                n.hidden = 0;
            });
            s.refresh();
            workOut = false;
        } );

        var el = document.querySelector('.but.FR');
        if (el) {
            el.onclick = function() {
                asigmot.stopForce();
                sigma.layouts.fruchtermanReingold.start( s );
            }
        }
        var el = document.querySelector('.but.atlas2');
        if (el) {
            this.atlas2But = el;
            el.onclick = function() {
                if (this.innerHTML = '►') asigmot.startForce();
                else asigmot.stopForce();
            };
        }
        var el = document.querySelector('.but.noverlap');
        if (el) {
            el.onclick = function() {
                s.startNoverlap();
            };
        }
        var el = document.querySelector('.but.colors');
        if (el) {
            el.onclick = function() {
                var bw = s.settings( 'bw' );
                if (!bw) {
                    this.innerHTML = '🌈';
                    s.settings( 'bw', true );
                }
                else {
                    this.innerHTML = '◐';
                    s.settings( 'bw', false );
                }
                s.refresh();
            };
        }
        var el = document.querySelector('.but.fontup');
        if (el) {
            el.onclick = function() {
                let ratio = s.settings('labelSizeRatio');
                s.settings('labelSizeRatio', ratio * 1.2);
                s.settings('defaultLabelSize', s.settings('defaultLabelSize') * 1.2);
                s.refresh();
            };
        }
        var el = document.querySelector('.but.fontdown');
        if (el) {
            el.onclick = function() {
                var ratio = s.settings('labelSizeRatio');
                s.settings('labelSizeRatio', ratio * 0.9);
                s.settings('defaultLabelSize', s.settings('defaultLabelSize') * 0.9);
                s.refresh();
            };
        }
        var el = document.querySelector('.but.zoomin');
        if (el) {
            el.onclick = function() {
                var c = s.camera; c.goTo({ratio: c.ratio / c.settings('zoomingRatio')});
            };
        }
        var el = document.querySelector('.but.zoomout');
        if (el) {
            el.onclick = function() {
                var c = s.camera; c.goTo({ratio: c.ratio * c.settings('zoomingRatio')});
            };
        }

        
        
        var el = document.querySelector('.but.turnleft');
        if (el) {
            el.onclick = function() {
                asigmot.rotate(15);
            };
        }
        var el = document.querySelector('.but.turnright');
        if (el) {
            el.onclick = function() {
                asigmot.rotate(-22.5);
            };
        }
        

        sigmot.mix = function(e) {
            asigmot.stopForce();
            var nodes = s.graph.nodes();
            for (var i=0, length = nodes.length; i < length; i++) {
                nodes[i].x = Math.random()*width;
                nodes[i].y = Math.random()*height;
            }
            s.refresh();
            return false;
        };

        var el = document.querySelector('.but.mix' );
        if (el) {
            this.mixBut = el;
            this.mixBut.net = this;
            this.mixBut.onclick = sigmot.mix;
        }
        var el = document.querySelector('.but.shot' );
        if (el) {
            el.net = this;
            el.onclick = function() {
                asigmot.stopForce();
                s.refresh();
                var size = prompt( "Largeur de l’image (en px)", window.innerWidth );
                sigma.plugins.image(s, s.renderers[0], {
                    download: true,
                    margin: 0,
                    size: size,
                    clip: true,
                    zoomRatio: 1,
                    background: "#dacdbe",
                    labels: false
                });
            };
        }

        // resizer
        var el = document.querySelector('.but.resize');
        if (el) {
            el.net = this;
            el.onmousedown = function(e) {
                asigmot.stopForce();
                var html = document.documentElement;
                html.sigma = this.net.sigma; // give an handle to the sigma instance
                html.dragO = this.net.zediv;
                html.dragX = e.clientX;
                html.dragY = e.clientY;
                html.dragWidth = parseInt( document.defaultView.getComputedStyle( html.dragO ).width, 10 );
                html.dragHeight = parseInt( document.defaultView.getComputedStyle( html.dragO ).height, 10 );
                html.addEventListener( 'mousemove', function(e){asigmot.doDrag(e)}, false );
                html.addEventListener( 'mouseup', function(e){asigmot.stopDrag(e)}, false );
            };
        }
        
        var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
        s.configNoverlap({});
        // Initial position the graph
        const asig = this.s;
        asig.startForceAtlas2(atlasPars);
        setTimeout(function(){
            asig.killForceAtlas2();
            // asig.startNoverlap();
        }, 1000);
        /** fruchtermanReingold 
        sigma.layouts.fruchtermanReingold.configure( s, {
            // autoArea: true,
            // area: 0.1,
            // gravity: 3,
            // speed: 0.1,
            // iterations: 200
        });
        const timer = setInterval(function(){
                const prog = sigma.layouts.fruchtermanReingold.progress(asig);
                if (prog == 1) {
                        clearInterval(timer);
                        asig.startNoverlap();
                }
        }, 300);
        */
    };
        // global static
    sigmot.prototype.doDrag = function(e) {
        this.zediv.style.width = ( this.dragWidth + e.clientX - this.dragX ) + 'px';
        this.zediv.style.height = ( this.dragHeight + e.clientY - this.dragY ) + 'px';
    };

    sigmot.prototype.stopDrag = function(e) {
        var height = this.zediv.offsetHeight;
        var width = this.zediv.offsetWidth;

        this.removeEventListener( 'mousemove', sigmot.doDrag, false );
        this.removeEventListener( 'mouseup', sigmot.stopDrag, false );
        this.s.settings( 'height', height );
        this.s.settings( 'width', width );
        // var scale = Math.max( height, 150) / 500;
        // this.s.settings( 'scale', scale );
        this.s.refresh();
    };

    
    sigmot.prototype.startForce = function() {
        if (this.atlas2But) this.atlas2But.innerHTML = '◼';
        this.s.startForceAtlas2(atlasPars);
        var myO = this;
        setTimeout(function(){myO.stopForce()}, 3000)
    };
    sigmot.prototype.stopForce = function() {
        this.s.killForceAtlas2();
        if (this.atlas2But) this.atlas2But.innerHTML = '►';
    };
    sigmot.prototype.rotate = function(degrees) {
        this.stopForce();
        var xmin = Infinity,
            xmax = -Infinity,
            ymin = Infinity,
            ymax = -Infinity,
            radians = (Math.PI / 180) * degrees,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nodes = this.s.graph.nodes();
        
        for (var i=0, length = nodes.length; i < length; i++) {
            var n = nodes[i];
            xmin = Math.min(xmin, n.x );
            xmax = Math.max(xmax, n.x );
            ymin = Math.min(ymin, n.y );
            ymax = Math.max(ymax, n.y );
        }
        var cx = xmin + (xmax - xmin)/2,
            cy = ymin + (ymax - ymin)/2;
        for (var i=0, length = nodes.length; i < length; i++) {
            var n = nodes[i];
            var nx = (cos * (n.x - cx)) + (sin * (n.y - cy)) + cx;
            var ny = (cos * (n.y - cy)) - (sin * (n.x - cx)) + cy;
            n.x = nx;
            n.y = ny
        }
        this.s.refresh();
    }


})();
