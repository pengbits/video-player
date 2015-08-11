
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   		sho.com <rebuild>
        @project	    video player
        @file		    Email.js
        @package        models.player
        @author			dpaul
        @modified		12.20.11
        @desc           mix-in for models.player, handles sharing content
        
        /* 
        =:models.player.Email
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.models.player');
        sho.video.player.models.player.Sharing = {
            
            shareable_base_path : 'http://www.sho.com',
            
            event_responders : {
                //'experience:media:begin' : 'fetchEmbedCode',        // this is called more than once now that we have buffering..
                //'experience:embed_code_ready' : 'setEmbedCode',
                'video:change' : 'resetShareable'
            },
            
            sendEmail:function(attrs)
            {
                // To prevent data dropout we probably need to set the shareable attrs directly, bypassing validation, before shareable:loading is fired..
                // In subsequent send requests, there is actually a brief period where the form renders the model in it's last state,
                // rather than the the current state defined by the form attributes sent over, because shareable:loading triggers a render before 
                // the model can be updated. it's quickly replaced w/ a complete model coming back from the successful save though.. so it's hard to see
                // however, sequence of 'failed send' 'succesful send' 'failed send' can reveal some strange behavior.
        
                // it's pretty darn close and can probably stay like this till QA
                
                //console.log(['attrs', attrs]);
                
                if(!this.shareable)
                {
                    var th=this;
                    this.shareable = new sho.social.models.Shareable(attrs);
                    this.shareable.bind('error', function(model, error, opts){  th.trigger('shareable:error', error);   });
                    this.shareable.bind('success', function(model){ th.trigger('shareable:success'); });
                    this.trigger('shareable:loading');
                    this.shareable.send();
                }
                else
                {
                    this.shareable.attributes = attrs;
                    this.trigger('shareable:loading');
                    this.shareable.send(attrs);
                }
                
                //console.log(['model', this.shareable.attributes, attrs]);
            },
            
            // return a url to share. if the video model hasn't loaded yet, use the current page (which should include a meaningful hash fragment)
            // note: in current implementation, it's not possible to open the share pane while video is loading, so this is a non-issue.
            getContentUrl:function()
            {
                var url = this.video.get('url');
                return url ? this.shareable_base_path + url : window.location.toString();
            },
            
            // return our hand-rolled embed code snippet
            getEmbedCode:function()
            {
                return ['',
                    '<iframe ',
                    	'frameborder="0" ',
                    	'width="480" ',
                    	'height="270" ',
                    	'scrolling="no" ',
                    	'src="http://link.brightcove.com/services/player/bcpid',this.getEmbedPlayerId(),'/?bctid=',
                    	    this.video.get('vendorId'),
                    	,'&autoStart=false">',
                    '</iframe>',
                ''].join('')
            },
            
            getEmbedPlayerId:function()
            {
                return this.isFullEpisode() ? '3671166870001' : '3671166871001'
            },
            
            getShareableAttributes:function()
            {
                return !!this.shareable ? this.shareable.attributes : {}
            },
            
            resetShareable:function()
            {
                if(this.shareable) this.shareable.clear({'silent':true})
            }
            
        };
        
        /* No surrender, No delete */
        

