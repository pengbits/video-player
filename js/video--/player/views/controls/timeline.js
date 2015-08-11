
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        timeline.js
    @package            player.views.controls
    @author			    dpaul
    @modified		    09.18.12
    @desc               timeline
 
    <div class="control timeline">
		<div class="timeline-position">.</div>
		<div class="timeline-cursor">.</div>
	</div>
 
    /* =:controls.Timeline
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.Timeline = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.Timeline',
        
        className : 'control timeline',
        render_on_startup : false,
        margins : { 
            'left':36, 
            'right':248 //214  
        }, 
        height:26,
        
        fn : {},
        
        /* 
        =:startup
        ---------------------------------------------------------------------------------------- */
        build:function()
        {
            this.el.insert(['',
           		'<div class="timeline-position"><span class="timeline-title">&nbsp;</span></div>',
           		'<div class="timeline-cursor" style="display:none"><span>.</span></div>',
            ''].join(''));
             
            _.extend(this, {
                'position' : this.el.select('.timeline-position')[0],
                'title' : this.el.select('.timeline-title')[0],
                'cursor' : this.el.select('.timeline-cursor')[0]
            });
            
            // we call super last as it has a chained call to render()
            sho.video.player.views.controls.BaseControl.prototype.build.apply(this);
        },
        
        setHandlers:function()
        {
            // adjust margins for ipad player
            if(sho.video.brightcove.isSmartAPI()) this.margins.right = 123; /* was 63*/
            
            // set listeners for update of timeline
            this.fn.render = this.render.bind(this);
            this.model.bind('experience:media:progress', this.fn.render);
            this.model.bind('experience:media:seek_notify', this.fn.render);
            
            // set listener for changing video title
            this.fn.updateTitle = this.updateTitle.bind(this);
            this.model.bind('experience:media:change', this.fn.updateTitle);
            
            // set listeners for dragging
            this.fn.onMouseDown = this.onMouseDown.bind(this);
            this.fn.onMouseUp = this.onMouseUp.bind(this);
            this.fn.seekIfInBounds = this.seekIfInBounds.bind(this);
            this.el.observe('mousedown', this.fn.onMouseDown);
            (sho.video.getOuterContainer()).observe('mouseup', this.fn.onMouseUp);
        },
        
        /* 
        =:runtime
        ---------------------------------------------------------------------------------------- */
        render:function(e)
        {
            var progress = (e ? (e.progress) : 0);
            this.updatePositionBar(progress);
        },
        
        updateTitle:function()
        {
            this.title.update(this.model.getTitle())
        },
        
        onMouseDown:function(e)
        {
            e.stop();
            this.cursor.show();
            this.seekIfInBounds(e); //seek is always fired here
            (sho.video.getOuterContainer()).observe('mousemove', this.fn.seekIfInBounds); 
        },
        
        onMouseUp:function(e)
        {
            (sho.video.getOuterContainer()).stopObserving('mousemove', this.fn.seekIfInBounds);
            this.cursor.hide();
        },
        
        
        seekIfInBounds:function(e)
        {
            var win = document.viewport.getDimensions(),
            bounds = {
                'left' : this.margins.left-1, 
                'top' : win.height - this.height,
                'right' : win.width - (this.margins.right+1),
                'bottom' : win.height
            };
            if(!e.clientY) return;
            // log(e.clientY);
            
            // We can't use pageY, because pageY will report larger values than the video footprint if the page has been scrolled.
            if((e.clientX > bounds.left && e.clientX < bounds.right) && (e.clientY > bounds.top && e.clientY < bounds.bottom))
            {
                var s = (e.clientX - bounds.left) / (bounds.right - bounds.left);
                this.controller.seek(s)
            }
        },
        
        updatePositionBar:function(factor) /* 0 - 1 */
        {
            this.position.setStyle({ 'width' : (factor * 100).toFixed(2) +'%' });
        }

    })


