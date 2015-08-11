
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        email.js
    @package            video.player.views.share
    @author			    dpaul
    @modified		    01.06.12
    @desc               email sharing functionality in dock

    /* 
    =:view.share.Social
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.share');
    sho.video.player.views.share.Social = sho.video.player.views.share.ShareComponent.extend({
        
        _KLASS_ :  'sho.video.player.views.share.Social',
        
        template : [
            '<h2>Share</h2>',
            '<div class="share-components group social-sharing">',
                '<div class="share-component twitter first">',
                    '<a href="https://twitter.com/share" class="twitter-share-button" data-count="none" data-url="{{shareUrl}}" data-text="{{videoTitle}}">Tweet</a>',
                 '</div>',
                '<div class="share-component">',
                    '<div class="google-plus">g</div>', // placeholder only
                '</div>',
				'<div class="share-component fb">',
					'<div id="video-fb-like" class="fb-share-button" data-href="','{{shareUrl}}','" data-send="false" data-type="button_count" data-show-faces="false" data-font="arial"></div>',
                '</div>',
            '</div>'    
        ].join(''),
        
        setHandlers:function()
        {
            this.fn={};
            this.fn.renderSocialComponents = this.renderSocialComponents.bind(this);
        },
        
        render:function(data)
        {	
            // super()
            sho.video.player.views.share.ShareComponent.prototype.render.call(this, data);
            
            // some social components need slight delay before rendering
            this.fn.renderSocialComponents.delay(sho.dom.REDRAW_DELAY, data);
        },
        
        // todo: drop this and use the static helper in social.helpers.components
        // (sho.social.renderComponents(data)
        renderSocialComponents:function(data)
        {
            // decorate twitter html:
            twttr.widgets.load();
            
            // decorate fb html:
            FB.XFBML.parse(this.$('.share-component.fb')[0]);
            
            // render g+ button with explicit api call:
            if(gapi)
            {
                gapi.plusone.render( this.$('.google-plus')[0], {
                    'annotation' : 'none',
                    'size' : 'medium',
                    'href' : data.shareUrl, // 'http://www.sho.com',
                    'count' : false,
                    'callback' : (function(data){
                        if(data && data.state == 'on') sho.dom.trigger('google:plus_one:on', data)
                    })
                });
            }
		}
    
       
    });