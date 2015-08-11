
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    Net.js
    @package        models.player
    @author			dpaul
    @modified		12.20.11
    @desc           mix-in for models.player, handles anything related to loading data and videos in and out of the player
    @desc           for example, fetching of model JSON, starting video playback on successful load
    
    /* 
    =:models.player.Net
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.models.player');
    sho.video.player.models.player.Net = {
        
        event_responders : {
            'experience:template:ready' : 'onTemplateReady',
            'video:loading' : (function(){ 
                //this.setBenchMark('video:loading');
                this.set({'loading':true},{'silent':true});
            }),
            'video:loaded' : (function(){
                this.set({'loading':false},{'silent':true});
                this.validateVideo();
            }),
            'video:validation:success' : 'loadVideoIntoExperience'
        },
        
        recovering_from_teardown : false, // should this flag be moved to the bc_experience itself?
        
        // Alias the bc experience's 'template:ready' event as simply 'player:ready', 
        // this is the main blocking event we are waiting on before fetching models etc.
        // It is also the event that our public api wrapper hooks into for chained playback:
        // sho.video.load({id:6087}) => sho.getPlayer().onReady = (function(player){ player.loadVideoById(6087); })
        // for this reason, we want to ensure this only fires for the inital player setup, not after a teardown
        onTemplateReady:function()
        {
            if(!this.recovering_from_teardown)
            {    
                this.stage.update();
                this.trigger('ready');
            }
            else
            {
                this.validateVideo();
            }
        },
        
        // get vendor id from model and pass to bc experience
        loadVideoIntoExperience:function()
        {
            // compare video type agains experience's player and change the experience (teardown) if neccessary
            if(this.video.getVideoType() !== this.bc_experience.getPlayerType())
            {
                //log('|net| player mismatch, time for teardown');
                this.recovering_from_teardown = true; 
                this.setBenchMark('teardown');
                this.bc_experience.setPlayerType(this.video.getVideoType());
            }   
            else
            {       
                this.recovering_from_teardown = false;
                this.video.get('vendorId') || this.trigger('video:error', 'Title does not have a valid vendorId')
                this.video.get('vendorId') && this.bc_experience.loadVideoById(this.video.get('vendorId'));
            }
            
        },

        // id=`14875`
        loadVideoById:function(id)
        {
            this.bc_experience.stop();
            this.video.attributes = {'id':id}; // clear current video
            this.video.fetch({});
        }
      
    };
    
    /* No surrender, No delete! */


