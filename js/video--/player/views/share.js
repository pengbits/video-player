
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        share.js
    @package            video.player.views.share
    @author			    dpaul
    @modified		    01.09.12
    @desc               the view for the sharing tab in video player. Each of the 3 methods of sharing is broken out
    @desc               into a child view, as view.share.Social, view.share.Link and view.share.Email

    /* =:views.Share
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.Share = sho.video.player.views.TabbedComponent.extend({

        _KLASS_ : 'sho.video.player.views.Share',
        
        className : 'video-player-share',
        height : 254,
        url : '/rest/share', // path to sharing action
        share_panes : ['social','link','email'],
        
        build:function()
        {
            // build skeleton
            this.container.insert(this.innerCntr.update(this.share_panes.collect(function(kind){
                return ['',
                '<div class="share-pane '+kind+'">',
                    '<span></span>',
                '</div>'];
            }).flatten().join('')));
            
            // init components
            var th=this,k='',klass={};
            
            this.innerCntr.select('.share-pane').each(function(el){
                k = el.className.gsub(/share-pane\s/,''); 
                klass = sho.video.player.views.share[k.capitalize()]; (th[k] = new klass({
                    'container' : th.innerContainer,
                    'el' : el.down(), // => <span>
                    'model' : th.model,
                    'controller' : th.controller
                }))
            })
        },
        
        render:function()
        {
            var initialRenderAttrs = {
                'shareUrl' : this.model.getContentUrl(),
				'videoTitle' : this.model.getTitle(),
                'embedCode' :  this.model.getEmbedCode(),
                'hasErrors' : false,
                'feedback' : null
            };
            
            this.social.render(initialRenderAttrs);
            this.link.render(initialRenderAttrs);
            this.email.render(initialRenderAttrs);
        },
        
        deactivate:function()
        {
            this.link.deactivate();
        }
        
    });


