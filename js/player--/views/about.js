
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        about.js
    @package            video.player.views
    @author			    dpaul
    @modified		    12.27.11
    @desc               displays extra info about the video.

    /* =:views.About
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.About = sho.video.player.views.TabbedComponent.extend({

        _KLASS_ : 'sho.video.player.views.About',
        
        className : 'video-player-about',
        
        template : '<p>{{{description}}}</p>', // 3x curlies prevents html markup from being escaped
        
        height : 160,
		
		orderBannerToken : '[order_banner]',
		
		orderBannerLink : '/sho/order/home',
		
		orderBanner : '<p class="order-banner">'+
					  '<a href="#">ORDER SHOWTIME</a> '+
					  'and you can get <strong>$25 CASH BACK!</strong><sup>*</sup>'+
					  '<a class="learn-more" href="#"><img class="arrow" src="/assets/images/order/doubleRed.png" />LEARN MORE</a>'+
					  '</p>', 
		
		description : null,
		
		 events : {
	            'click p.order-banner a' : 'onOrderBannerClick'
	        },
        
        render:function()
        {
            this.description = this.model.getDescription();

			if (this.description.include(this.orderBannerToken)) {  
				this.description = this.description.replace(this.orderBannerToken, this.orderBanner)
			}
			
			sho.video.player.views.TabbedComponent.prototype.render.call(this, { 
                'description' : this.description
            });
        },

		onOrderBannerClick:function()
        {
            //sho.video.trackClick('about:order');  
			// temp bypassed video analytics method due to delay, concerned about analytics not firing before page redirect
			var t = sho.analytics.getTracker(); t.debug = true;
			t.trackClick({ 'click' : 'player:about:link_order' });
			
			window.location.href = this.orderBannerLink;
        }
       
    })


