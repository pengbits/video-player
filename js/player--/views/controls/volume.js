
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        controls.js
    @package            player.views.controls
    @author			    dpaul
    @modified		    12.13.11
    @desc               auto volume
	
    /* =:controls.Volume
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.Volume = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.Volume',
        
        className : 'control piped audio-volume',
        
        /*
        =:startup
        ---------------------------------------------------------------------------------------- */
        build:function()
        {
            this.el.insert([
            '<div class="audio-volume-inner">',
				'<div class="audio-volume-indicator">.',
					'<div class="audio-volume-cursor">.</div>',
				'</div>',
		    '</div>'
            ].join('')); _.extend(this, {
                'inner' : this.el.select('.audio-volume-inner')[0],
                'indicator' : this.el.select('.audio-volume-indicator')[0]
            });
            
            sho.video.player.views.controls.BaseControl.prototype.build.apply(this);
        },
        
        setHandlers:function()
        {
            this.model.bind('change:volume', this.render.bind(this));
            this.inner.observe('mousedown', this.onMouseDown.bind(this));
            (sho.video.getOuterContainer()).observe('mouseup', this.onMouseUp.bind(this));
        },
        
        /*
        =:runtime
        ---------------------------------------------------------------------------------------- */
        render:function()
        {
            var v = Math.round(this.model.get('volume') * 100);
            this.indicator.setStyle({'width':v +'%' });
        },
        
        onMouseDown:function(e)
        {
            this.scrubIfInBounds(e);
            (sho.video.getOuterContainer()).observe('mousemove', this.scrubIfInBounds.bind(this)); e.stop();
        },
        
        scrubIfInBounds:function(e)
        {
            if(e.findElement('.audio-volume-inner')){
                var x = e.offsetX || e.layerX, // webkit || firefox
                    w = this.inner.getWidth(),
                    fx = (Math.floor(x/w*100))/100,
                    fx = fx > 9.94 ? 1 : fx
                ;
                this.controller.setVolume(fx)
            };
        },
        
        onMouseUp:function(e)
        {
            (sho.video.getOuterContainer()).stopObserving('mousemove');
        }

    })


