
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        closedcaptions.js
    @package            player.views.controls
    @author			    dpaul
    @modified		    09.19.12
    @desc               toggle closed captions on and off
    
	<div class="control piped closed-captions captions-exist (captions-disabled)">.</div>
	
    /* =:controls.ClosedCaptions
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.controls');
    sho.video.player.views.controls.ClosedCaptions = sho.video.player.views.controls.BaseControl.extend({

        _KLASS_ : 'sho.video.player.views.controls.ClosedCaptions',
        
        className : 'control piped closed-captions',
        
        events : {
            "click .cc"     : "toggleClosedCaptions",
            "click .cc-ui"  : "hideShowClosedCaptionsUI"
        },
        
        setHandlers:function()
        {
            var th=this;
            
            _.each([
                'experience:media:change',
                'experience:dfxp:load:error',
                'change:cc',
                'change:cc_url',
                'change:cc_ui'
            ]
            , 
            function(e){ 
                th.model.bind(e, th.render.bind(th, e)); 
            })
            
        },
        
        render:function(eventName)
        {
            var k = '';
            if(this.model.hasClosedCaptions())                  k += ' captions-exist';
            if(this.model.getClosedCaptionsEnabled())           k += ' captions-enabled';
            //if(this.model.getClosedCaptionsUIVisible())         k += ' captions-ui-visible';
            if(eventName == 'experience:dfxp:load:error')       k += ' captions-error';
            
            // log(['',
            //     'RENDER hasCC=', this.model.hasClosedCaptions(), ' ',
            //     'enabled=', this.model.getClosedCaptionsEnabled(), ' ',
            //     //'visible=', this.model.getClosedCaptionsUIVisible(), 
            // ''].join(''));
            
            this.el.update('<span class="cc">.</span><span class="cc-ui">.</span>');
            this.el.className = this.className + k;
        },
        
        toggleClosedCaptions:function()
        {
            this.hasCaptions() && this.controller.toggleClosedCaptions();  
        },
        
        hideShowClosedCaptionsUI:function()
        {
            this.hasCaptions() && this.controller.showClosedCaptionsOptions(); // this.controller.toggleClosedCaptionsUIVisibility()
        },
        
        hasCaptions:function()
        {
            return this.el.hasClassName('captions-exist');
        }

    })


