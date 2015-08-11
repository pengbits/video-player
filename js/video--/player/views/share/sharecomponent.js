
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        email.js
    @package            video.player.views.share
    @author			    dpaul
    @modified		    12.27.11
    @desc               template and functionality mix-in for share-pane.
    @desc               handle semail pane in video player

    /* 
    =:views.player.share.partials.social
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.share');
    sho.video.player.views.share.ShareComponent = Backbone.View.extend({
        
        _KLASS_ :  'sho.video.player.views.share.ShareComponent',
        
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'innerCntr' : this.el,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'data' : {}
            });
            
            this.setHandlers();
        },
        
        setHandlers:function()
        {
            // implement in subclass
            //log('setHandlers in '+this._KLASS_);
        },
        
        render:function(data)
        {
            // populate before render
            var renderAttrs = _.extend({}, (data||{}), this.model.getShareableAttributes());
            // super()
            this.innerCntr.update(Mustache.to_html(this.template,renderAttrs));
        }
        
    });