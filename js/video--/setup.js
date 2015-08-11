
	/*
	JS
	--------------------------------------------------------------------------------------------  
	@site   			sho.com <rebuild>
	@project	    	video
	@file		        setup.js
	@author				ncavanagh
	@author             dpaul
	@modified			01.09.12

	/* =:video setup
	-------------------------------------------------------------------------------------------- */
	sho.video.setup = function()
	{

        function initialize()
        { 	
            setClickHandlers();
        }
        
        // attach video playback behavior to all a links in document w/ data attribute
        function setClickHandlers()
        {
			$$('body a[data-video-id]').invoke('observe', 'click', function(e)
			{
			    e.stop(); var el = e.findElement('a'), id = el.readAttribute('data-video-id');
			    if(Number(id)) sho.video.load({ 'id' : id }); 
			});
        }
    
        return {
            init:initialize
        }
	
	}()

	document.observe('dom:loaded', sho.video.setup.init );