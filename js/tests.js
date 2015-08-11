
	/*
	JS
	--------------------------------------------------------------------------------------------  
	@site   			sho.com <rebuild>
	@project	    	video
	@file		        index.js
	@author				dpaul
	@modified			09.20.11
	@desc		        index script for video tests
    @note               moved video js stack to lib, so it can be refactored into movies gallery
    
	/* =:video
	-------------------------------------------------------------------------------------------- */  
	 window.test_videos = [{
        "id": 19116,"title": "Behind the Scenes: Oliver Stone's Untold History of the United States ","vendorId": 1913246604001,
    },{
        "id": 19551,"title": "Homeland Season 2 Recap Part II","vendorId": 1978244038001,
    },{
        "id": 19211,"title": "With the Creators: Q&A","vendorId": 1924831869001,
    },{
        "id": 19051,"title": "Homeland Debrief: New Car Smell","vendorId": 1907768444001,
    },{
        "id": 18872,"title": "Homeland Debrief: State of Independence","vendorId": 1892446313001,
    },{
        "id": 18691,"title": "Dissecting a Scene: Beirut is Back","vendorId": 1875551144001,
    },{
        "id": 18692,"title": "Homeland: Bipolarity","vendorId": 1875533835001,
    },{
        "id": 18391,"title": "With the Creators: The Smile","vendorId": 1862907372001,
    },{
        "id": 17717,"title": "Behind the Scenes: Homeland Season 2","vendorId": 1814937289001,
    },{
        "id": 19212,"title": "Shameless Season 3 Tease","vendorId": 1927043273001,
    },{
        "id": 18814,"title": "Rock Opera (Californication Spot)","vendorId": 1889467561001,
    },{
        "id": 19093,"title": "They'll Never Tell (House of Lies Spot)","vendorId": 1913238122001,
    },{
        "id": 19035,"title": "With the Creators: Run","vendorId": 1910681447001,
    },{
        "id": 19531,"title": "Dexter Season 7 Recap Part II","vendorId": 1978274272001,
    },{
        "id": 18852,"title": "Dissecting a Scene: Buck The System","vendorId": 1892420799001,
    },{
        "id": 17734,"title": "Behind the Scenes: Dexter Season 7","vendorId": 1812985573001,
    },{
        "id": 18411,"title": "Behind the Episode: Are You...?","vendorId": 1862907370001,
    }];
    
    window.test_full_episode = {
        'id':'16652',
        'vendorId' : '1524267498001'
    };
    
    window.test_closed_captions = [{
        'id':'22794',
        'vendorId':'1858728889001'
    },{
        'id':'31993',
        'vendorId':'3669998506001'
    }]; 
    
	sho.provide('sho.video.tests');
	(function(outer_scope)
	{
	    
	    function initialize()
	    {
	        if($$('.video-player-outer').length) return;
	        
	        
	        // settings
    	    sho.video.noisy_logging = true;
            sho.video.disable_sleeping = false;
            sho.video.always_use_stub_url = sho.env.isLocal();
             
            setHandlers();
            testPlayer();
            //testNitroMeta();
            //testGeoError();
            //testClosedCaptions(0);
            //testFullEpisode();
            //testExperience();
            //createAndDestroyExperience();
            //testFewerThanTenRelatedVideos();
            //testOpenAndClose()
	    }
	    
	    function setHandlers()
	    {
	        $$('#play-video-button').invoke('observe','click', function(e)
	        {
	            e.stop(); var el = e.findElement('a');
	            sho.video.load({ 
	                'id' : el.readAttribute('data-video-id'),
	                'vendorId' : el.readAttribute('data-video-vendor-id')
	            });
	        })
	    }
		
	    function testPlayer()
	    {
	        log('testing player');
	        var r = Math.floor(Math.random() * test_videos.length), v = test_videos[r]; 
	        sho.video.load(v);
		}
		
		
		function testNitroMeta()
		{
		    log('testing nitro meta');
		    log('nitro-series-id in page: ' + sho.$('meta[name=nitro-series-id]').attr('content'));
		    
		    sho.video.load({
		        'id' : '20524'
		    })
		}
		
		function testContentShare()
		{
		    log('testContentShare');
		    sho.dom.trigger('video_player:shareable:success')
		}
		
		function testTweet()
		{
		    log('testTweet');
		    sho.dom.trigger('twitter:tweet', {
		        data: {},
                region: undefined,
                // iframe element stub, we only care about src property
                target: {
                    'src':'http://platform.twitter.com/widgets/tweet_button.1368146021.html#_=1368827241654&count=none&id=twitter-widget-0&lang=en&original_referer=http%3A%2F%2F129.228.130.82%3A8080%2F!%2Fvideo%2Ftest.html&size=m&text=Video%20Tests&url=http%3A%2F%2Fwww.sho.com%2Fsho%2Fvideo%2Ftitles%2F20524%2Fnext-on-episode-10'
                }, 
                type: "tweet"
            });
		}
		
		function testGooglePlus()
		{
		    log('test google plus');
		    sho.dom.trigger('google:plus_one:on',{
		        'state' : 'on', 
		        'href' : 'http://www.sho.com/sho/video/titles/20524/next-on-episode-10'
		    });
		}
		
		function testFullEpisode()
		{	
		    // cc titles are in full episode account and have local stubs.. 
		    log('testing full episode');
		    sho.video.load(test_closed_captions.last());
		}
        
		function testGeoError()
		{
		    // test geo lockout by using DEV full ep player, which is set to exclude US territories at moment.
		    log('testing geo_restricted error');
		    sho.video.load(test_closed_captions.last()); 
		}
		
		function testClosedCaptions(idx)
		{
		    var idx = idx || 0, id = test_closed_captions[idx].id;
		    log('testing closed captions #'+(idx+1)+': '+id);
		    sho.video.load({id:id});
		}
		
		function testOpenAndClose()
	    {
	        var r = Math.floor(Math.random() * test_videos.length), video1 = test_videos[r];
	        
	        sho.video.load({
	            'id': video1.id,
	            'ready' : (function(player){
	                (function(){ 
	                    player.destroy(); 
	                }).delay(3);
	            })
	            //,
	            // 'error' : (function(e){
	            //     log('|tests| error:'+e);
	            // })
	        });
		}
		
		function testFewerThanTenRelatedVideos()
		{
		    sho.video.load({'id':16534});
		}
		
		function testDock()
		{
		    //window.dummy_player = true;
            (function(p){ 
	            p.view.dock.show();
	            p.view.activateTab('share'); 
	        }).delay(sho.dom.REDRAW_DELAY, sho.video.getPlayer());
	    }
	    
	    function testExperience()
	    {
	        log('test experience');
    	      
    	    // draw container  
	        ($$('.content')[0]).insert({'top':'<div id="dummy-player"></div>'});
            
            // get stub video to work with
            var testVideo = window.test_closed_captions[1];
            
            // set up experience
            var exp = new sho.video.brightcove.Experience({
                'playerName' : 'sho_global_video_player',
                'player_type' : 'full', // FORCE FULL EP MODE IN ORDER TO TEST CC OR GEORESTRICTIONS!!!!
                'container' : ($('dummy-player'))
            });
            
            // override experience dimensions to squeeze into dummy container
            exp.ipad_dimensions.actual_size.landscape = sho.string.toDimensions('720x480');
            
            // replace the static methods that video player normally creates with stubs:
	        sho.video.getExperience = function(){
	            return exp; // sho.video.experience
	        };
	        
            // set handlers
            exp.bind('all', function(eventName, e){
                eventName = 'experience:'+eventName;
                if(eventName !== 'experience:media:progress') {
                     log(eventName);
                }
                
                if(eventName == 'experience:error')
                {
                    log(['ERROR!',e]);
                }
                
                if(eventName == 'experience:template:ready') {
                    
                    exp.loadVideoById(testVideo.vendorId);
                }

                if(eventName == 'experience:media:begin'){ 
                    // we use media:play in desktop implementation
                    
                    exp.player.getCurrentVideo(function(video){
                        //log(video);
                        sho.core.Logger.clear();
                        exp.seek(120);
                        //exp.setClosedCaptionsEnabled(true)
                        exp.loadDFXP(video.captions[0].URL.split('http://www.sho.com')[1]);
                        log('loading ' +video.captions[0].URL);
                    });
                    //exp.setClosedCaptionsEnabled(true);
                }

                if(eventName == 'experience:dfxp:load:success'){
                    log('getting languages..')
                    // exp.seek(120);
                    // exp.captions.setCaptionsEnabled(true);
                    exp.captions.getLanguages(window.log);
                }

            })
	        
	        // init
	        exp.createExperience();
	    }
	    
	    function createAndDestroyExperience()
	    {
	        testExperience();
	        (function(e){
	            log('destroying experience');
	            e.destroy();
	        }).delay(4, sho.video.getExperience())
	    }
	    
	    function destroyExperience()
	    {
	        log('destroying experience');
	        var e = sho.video.getExperience(); e.destroyExperience();
	    }
	    
        _.extend(outer_scope.tests, {
            'testClosedCaptions':testClosedCaptions,
            'initialize':initialize,
            'testPlayer':testPlayer,
            'testFullEpisode':testFullEpisode,
            'testExperience':testExperience,
            'destroyExperience':destroyExperience,
            'testGeoError':testGeoError
        })
	  
        
	}(sho.video))

	document.observe('dom:loaded', sho.video.tests.initialize );
	
	/* No surrender, No delete! */
	