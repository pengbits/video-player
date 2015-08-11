
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    closedcaptions.js
    @package        models.ClosedCaptions
    @author			dpaul
    @modified		11.26.12
    @desc           mix-in for models.player, handles closed-captions functionality
    @note           reworked to address changes to bc closed-captions support in api.
    @note           captions now work 'natively' in desktop experience (calls to setClosedCaptionsEnabled(true) trigger an internal loadDFXP),
    @note           but we need to preserve the legacy implementation for the ipad
    
    /* 
    =:models.player.ClosedCaptions
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.models.player');
    sho.video.player.models.player.ClosedCaptions = {
        
        event_responders : {
            // this only fires in smart API context, in desktop, getCurrentVideo is syncronous
            'experience:current_video:ready' : 'onCurrentVideoReady', 
            'change:cc' : 'onCaptionsEnabledDisabled',
            'change:cc_ui' : 'onCaptionsUIVisibilityChanged',
            'experience:dfxp:load:error' : 'onDFXPLoadError',
            'experience:dfxp:load:success' : 'onDFXPLoadSuccess',
            'video:change' : 'resetClosedCaptions'
        },
        
        relativize_dfxp_urls : false,
        
        // hasClosedCaptions returns true if the URL in the captions module of the current video is not null or undefined
        hasClosedCaptions:function()
        {
            return !!this.getClosedCaptionsURL()
        },
        
        // getClosedCaptionsURL returns the url of the captions file, if set. this method calls bc_experience.getCurrentVideo internally,
        // which can be a delicate operation, as it is async in smart api, and syncronous in desktop. we have a cached form of this method,
        // where the experience method is only called if the model property is null, which prevents some infinite loops in the smart api version,
        // but this has given us a bug where the cc state persists across multiple title requests.. still working through this.
        getClosedCaptionsURL:function()
        {
            var k = 'cc_url';                                                               // log(k+' is set? '+this.has(k));
            
            // prevent subsequent calls to getClosedCaptions() by storing the first non-null response
            return this.has(k) ? this.get(k) : (function(captions)
            {
                this.attributes[k] = captions.URL; 
                return captions.URL; 
            
            }).call(this, this.bc_experience.getClosedCaptions());
        },
        
        onCurrentVideoReady:function(e, captions) // only used by smart API
        {
            this.set({'cc_url':captions.URL || false })
            this.hasClosedCaptions() && this.bc_experience.loadDFXP(captions.URL);
        },
        
        onDFXPLoadError:function(e, evnt)
        {
            //log('|captions| error loading `'+this.getClosedCaptionsPath()+'`');
        },
        
        onDFXPLoadSuccess:function()
        {
            // this.dfxp_loaded = true;
            // log('|captions| loaded `'+this.getClosedCaptionsPath()+'`');
        },
        
        getClosedCaptionsEnabled:function()
        {
            return this.get('cc') == 'ENABLED';
        },
        
        setClosedCaptionsEnabled:function(cc)
        {
            this.set({'cc': (cc ? 'ENABLED':'DISABLED')});
        },
        
        // at time of this writing, the bc experience captions module does not trigger an events 
        // when setting captionsEnabled to true.. if it did, it'd be more in-keeping with
        // the flow of other components to observe the change coming from the experience and update the ui,
        // rather the reverse (model changes trigger a chance on the bc experience)
        onCaptionsEnabledDisabled:function(e, evnt)
        {
            // log('|cc| onCaptionsEnabledDisabled:'+(evnt.attributes.cc == 'ENABLED'));
            this.bc_experience.setClosedCaptionsEnabled(evnt.attributes.cc == 'ENABLED')
        },
        
        resetClosedCaptions:function()
        {
            // log('|cc| reset!');
            this.attributes.cc = false;
            this.attributes.cc_url = undefined;
        },
        
        // additionally, there doesn't seem to be any insight into the state of the captions options module,
        // so we can't really manage an on/off state for that piece of the ui.
        // at time of this writing there doesn't appear to be either
        // a) a method for returning visibility of the captions options ui
        // b) a method for closing the captions options ui
        // c) an event fired for when it's invoked
        //
        // so until those are available, we're better off just making a blind showOptions call every time the element is clicked
        // getClosedCaptionsUIVisible:function()
        // {
        //     return this.get('cc_ui') == 'VISIBLE';
        // },
        // 
        // setClosedCaptionsUIVisible:function(cc_ui)
        // {
        //     this.set({'cc_ui': (cc_ui ? 'VISIBLE':'HIDDEN')});
        // },
        // 
        // // see hand-wringing over lack of captions on/off event above..
        // onCaptionsUIVisibilityChanged:function(e, evnt)
        // {
        //     log('onCaptionsUIVisibilityChanged');
        //     if(evnt.attributes.cc_ui == 'VISIBLE')
        //     { 
        //         this.bc_experience.showClosedCaptionsOptions();
        //     }
        //     else
        //     {
        //     }
        // }
        
        showClosedCaptionsOptions:function()
        {
            log('|cc| showClosedCaptionsOptions');
            this.bc_experience.showClosedCaptionsOptions()
        }
        
    };
    
    /* No surrender, No delete! */


