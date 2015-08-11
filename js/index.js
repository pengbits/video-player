
	/*
	JS
	--------------------------------------------------------------------------------------------  
	@site   			sho.com <rebuild>
	@project	    	video
	@file		        index.js
	@author				ncavanagh
	@modified			02.08.12
	@desc		        index for video screening room
	@note               

	/* =:video
	-------------------------------------------------------------------------------------------- */
	sho.provide('sho.video.portal');
	sho.video.portal.index = function()
	{
        function initialize()
        { 	
            sho.video.noisy_logging = false;
            
            if($$('.dropdown')[0]) { initDropDowns(); } 
			checkForAutoPlay();
        }

		function initDropDowns()
		{   
		  	if ($('video-series-nav')) {		
				$('video-series-nav').update('');
				
				if (sho.video.series.nav.section == 'series') {
				    // series section primary drop-down needs multi-column treatment
    				sho.video.seriesNav = new sho.ui.menu.MultiColumn({
    		        		id:'video-series-nav-obj',
    			       		container:sho.video.series.nav.container, 
    			       		title:sho.video.series.nav.title,
    			       		labels:sho.video.series.nav.seriesList.keys(),
    			       		values:sho.video.series.nav.seriesList.values(),
    			       		keepSelectionVisible:true,
    			       		onSelect:(function(s){
    							window.location = s;
    						})	
    		        });
    		    }
    		    else {
    		        sho.video.seriesNav = new sho.ui.menu.DropDown({
    		        		id:'video-series-nav-obj',
    			       		container:sho.video.series.nav.container,  
    			       		title:sho.video.series.nav.title,
    			       		labels:sho.video.series.nav.seriesList.keys(),
    			       		values:sho.video.series.nav.seriesList.values(),
    			       		keepSelectionVisible:true,
    			       		selectedTitle : sho.video.series.nav.currentTitle,
    			       		onSelect:(function(s){
    							window.location = s;
    						})
    		        });
    		    }
			}
			
			if ($('video-series-season-nav')) {		
				$('video-series-season-nav').update('');
				sho.video.seriesSeasonNav = new sho.ui.menu.DropDown({
		        		id:'video-series-season-nav-obj',
			       		container:sho.video.series.season.nav.container, 
			       		title:sho.video.series.season.nav.title,
			       		labels:sho.video.series.season.nav.seasonList.keys(),
			       		values:sho.video.series.season.nav.seasonList.values(),
			       		keepSelectionVisible:true,
			       		selectedIndex : sho.video.series.season.nav.current,
			       		selectedTitle : sho.video.series.season.nav.currentTitle,
			       		onSelect:(function(s){
							window.location = s;
						})	
		        });
			} 
			if ($('video-comedy-nav')) {
				$('video-comedy-nav').update('');
				sho.video.comedyNav = new sho.ui.menu.DropDown({
		        		id:'video-comedy-nav-obj',
			       		container:sho.video.comedy.nav.container, 
			       		title:'All',
			       		labels:sho.video.comedy.nav.comedyList.keys(),
			       		values:sho.video.comedy.nav.comedyList.values(),
			       		keepSelectionVisible:true,
			       		selectedIndex : sho.video.comedy.nav.current,
			       		onSelect:(function(s){
							window.location = s;
						})	
		        });
			}
		}
		        
        // look for the presence of a video fragment in hash, which triggers auto-play of title
        function checkForAutoPlay()
        {
            var h = window.location.hash, fragment = h.match(/#\/video\/titles\/(\d{2,15})\/(.+)/); 
            if(h.length && fragment && Number(fragment[1]))
            {
                if(sho.video.noisy_logging) log('|index| checkForAutoPlay:`'+fragment[1]+'`');
                sho.video.load({ 'id' : fragment[1] });
                clearHash();
            }
        }
        
        function clearHash()
        {
            if(sho.video.noisy_logging) log('|index| clearHash');
            window.location.hash = '';
        }
		    
        return {
            init:initialize
        }
	
	}()

	document.observe('dom:loaded', sho.video.portal.index.init );