
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        player.js
    @package            video.player.views
    @author			    dpaul
    @modified		    10.11.12
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    
    /**
     * class sho.video.player.views.Player
     * Master view class for the overlay video player
    **/
    
    sho.video.player.views.Player = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Player',
  
        view : ['',
        '<div class="video-player video-player-outer loading">',
            '<div class="video-player-inner">',
                '<div class="video-player-stage" id="video-player-stage">',
                    '<div class="video-player-experience" id="video-player-experience">',
                    '</div>', 
                '</div>',
                '<div class="video-player-dock video-player-dock-outer">',
        		'</div>',
                '<div class="video-player-title">&nbsp;</div>',
                '<div class="docked video-player-load-mask">&nbsp;</div>',
                '<div class="video-player-closer">&nbsp;</div>',
                '<div class="video-player-bench-marker">&nbsp;</div>',
            '</div><!-- END video-player-inner -->',
        '</div><!-- END video-player-outer -->',
        ''].join(''),
        
        fn : {},
        
        loading_message_for_title : 'Loading Video...',
        
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        /**
         * new sho.video.player.views.Player(cfg)
         * Creates an instance of the player view
        **/
        initialize:function(cfg)
        {
            _.extend(this, {
                'ui' : {},
                'model' : cfg.model,
                'onContainerReady': cfg.onContainerReady || Prototype.emptyFunction
            });
            
            this.build.bind(this).delay(sho.dom.REDRAW_DELAY);
        },
        
        /**
         * sho.video.player.views.Player#build() -> Null
         * Calls the subroutines that insert the player into the DOM. 
        **/
        build:function()
        {
            this.drawContainer();
            this.applyIpadStyles();
            this.initControls();
            this.initDock();
            //this.initBenchMarker();
            this.setHandlers();
        },
        
        /**
         * sho.video.player.views.Player#drawContainer() -> Null
         * Inserts the skeleton template view into the body. Iterates over the lists of regions
         * that make up the ui and saves references to each. Calls onContainerReady on completion.
        **/
        drawContainer:function()
        {
            var th=this, key='';
            $$('body')[0].insert(this.view); $w('outer inner stage closer experience title dock load-mask bench-marker').each(function(region){
                th.ui[region.camelize()] = $$('.video-player-'+region)[0];
            });
            
            this.onContainerReady(this.ui.experience);
        },
        
        /**
         * sho.video.player.views.Player#initControls() -> Null
         * Creates the controls view instance
        **/
        initControls:function()
        {
            this.controls = new sho.video.player.views.Controls({
                'model' : this.model,
                'controller' : this.controller,
                'container' : this.ui.inner,
                'title' : this.ui.title
            });
        },

        /**
         * sho.video.player.views.Player#initDock() -> Null
         * Creates the dock view instance
        **/
        initDock:function()
        {
            if(window.dummy_player) this.ui.stage.id = 'fpo-stage'; // for debug purposes only, while we work on tabs
            this.dock = new sho.video.player.views.Dock({
                'model' : this.model,
                'controller' : this.controller,
                'container' : this.ui.dock
            })
        },
        
        /**
         * sho.video.player.views.Player#initBenchMarker() -> Null
         * Creates the optional benchmarker, which logs load-times to the browser.
        **/
        initBenchMarker:function()
        {
            this.benchMarker = new sho.video.player.views.BenchMarker({
                'model' : this.model,
                'container' : this.ui.benchMarker
            })
        },
        
        /**
         * sho.video.player.views.Player#setHandlers() -> Null
         * Subsribes the view to all model events, and sets the dom listeners related to closing the player
        **/
        setHandlers:function()
        {    
            // subscribe to player model and stage events 
            this.model.bind('all', this.update.bind(this))
            
            // set listener on closer element
            this.ui.closer.observe('click', (function(e){ e.stop();
                sho.video.getPlayer().close();
            }));
            
            // set catchall click handler
            this.ui.outer.observe('click', (function(e){
                e.stop();
            }));
        },
        
        /**
         * sho.video.player.views.Player#applyIpadStyles() -> Null
         * iPad 4.x workaround: temporarily enforce fullbleed styles if the page is long enough to need them
        **/
        applyIpadStyles:function()          
        {
            if(sho.supportsPositionFixed()) return;
            this.removeFullBleed = !sho.dom.isFullBleed();
            this.lastScroll = sho.dom.getPageScroll();
            window.scrollTo(0,0);
            sho.dom.setFullBleed(true);
        },
        
        /**
         * sho.video.player.views.Player#removeIpadStyles() -> Null
         * if there were iPad 4.x workaround fixes deployed, restore the page to its original state
        **/
        removeIpadStyles:function()
        {
            this.lastScroll && window.scrollTo(0,this.lastScroll);
            this.removeFullBleed && sho.dom.setFullBleed(false);
        },
        
        
        /*
        =:runtime
        ---------------------------------------------------------------------------------------- */
        
        /**
         * sho.video.player.views.Player#update(eventName,e) -> Null
         * All-purpose callback for events coming from the model. Most of the player interface is broken up 
         * into individual components, so the actions take here are primarily related to the outer wrapper, displaying the loader, age gate etc.
        **/
        update:function(eventName, e)
        {
            // =:net
            if(['template:loaded','video:loading'].include(eventName)) {
                this.loadMask(true, {'className':'loaded' });
            }

            // turn play button red. this was video:loaded, but that doesn't handle cases where json comes back before bc experience is ready (ie on prod)
			if(eventName == 'video:validation:success'){
				this.loadMask(false);
			}

            // =:playback
            if(['video:loading','experience:media:play'].include(eventName)){
                this.updateTitle();
            }
            
            if(eventName == 'stage:resize'){
                this.ui.stage.setStyle(sho.object.toPixels(e))
            }
            
            // =:validation, =:age_gate
            if(['video:validation:unknown_age','video:validation:lockout'].include(eventName)){
                this.loadMask(false);
                this.drawAgeGate(eventName.match(/lockout/));
            }
            
            if(eventName =='video:validation:success'){
                this.removeAgeGate();
            }
            
            // =:inactivity, =:sleeping
            if(eventName == 'player:sleep')
            {
                this.tween('closer:blur')
            }
            
            if(eventName == 'player:wake')
            {
                this.tween('closer:focus');
            }
            
            // =:buffering
            if(eventName == 'experience:media:bufferbegin')
            {
                this.loadMask(true, {'className':'buffering' })
            }
            
            if(eventName == 'experience:media:buffercomplete')
            {
                this.loadMask(false, {'className':'buffering' })
            }
            
            // debug logs
            if(sho.video.noisy_logging && !eventName.match(/^change|media:|resize/)) log('|player| '+eventName );  
            
            // debug logs, filtered  
            if(eventName.match(/dfxp|cc/)) log('|player| '+eventName);
        },
        
        
        /**
         * sho.video.player.views.Player#drawAgeGate(lockout) -> Null
         * Draw the utility modal used in age-gated content
        **/
        drawAgeGate:function(lockout)
        {
            if(this.ageGate) return;
            this.ageGate = new sho.video.player.views.AgeGate({
                'container' : this.ui.inner,
                'model' : this.model,
                'controller' : this.controller,
                'lockout' : lockout
            })
        },
        
        /**
         * sho.video.player.views.Player#removeAgeGate() -> Null
         * Remove the utility modal used in age-gated content
        **/
        removeAgeGate:function()
        {
            if(this.ageGate) this.ageGate.destroy();
            this.ageGate = null;
        },
        
        
        /*
        =:shutdown 
        ------------------------------------------------------------------------------------ */
        /**
         * sho.video.player.views.Player#destroy() -> Null
         * Unset lisnters and remove the player view from the DOM
        **/
        destroy:function()
        {
            this.removeIpadStyles();
            //this.benchMarker.destroy();     // what about other views? 
            this.ui.outer.stopObserving('click');
            this.ui.outer.remove();
        },
        
        /**
         * sho.video.player.views.Player#updateTitle() -> Null
         * Updates the title element in the player
        **/
        updateTitle:function()
        {
            if(this.ui.title) this.ui.title.update(this.model.getTitle());
        },
        
        
        /*
        =:tweens (only applies to closer button) 
        ------------------------------------------------------------------------------------ */
        tween:function(m)
        {
            var mode = m.gsub(/closer:/,''), 
                t = {'opacity': (mode =='focus' ? 1 : 0)} 
            ;
            
            if(sho.video.tweens.isSupported('controls', mode)){
                $j(this.ui.closer).animate(t, sho.video.tweens.deefault.duration * 1000);
            }
            else {
                this.ui.closer.setStyle(t);
            }
        },
        
        /*
        =:util 
        ------------------------------------------------------------------------------------ */
        activateTab:function(t)
        {
            this.dock.activateTab(t);
        },
        
        getOuterContainer:function()
        {
            return this.ui.outer;
        },
        
        loadMask:function(isMasked, opts)
        {
            var opts = (opts || {'className':'loading'});
            
            if(isMasked)
            {
                this.ui.loadMask.show();
                this.ui.outer.addClassName(opts.className);
            }
            else
            {
                this.ui.loadMask.hide();
                this.ui.outer.removeClassName(opts.className);
            }
            
        }

    })


