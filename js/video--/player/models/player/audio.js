
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    audio.js
    @package        models.player
    @author			dpaul
    @modified		12.20.11
    @desc           mix-in for models.player, provides functionality related to sound

    /* 
    =:models.player.Audio
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.models.player');
    sho.video.player.models.player.Audio = {
    
        cookie_mute_settings : true,
        cookie_mute_store : 'video_player_muted',

        event_responders : {

            'experience:media:begin' :          'setInitialMute',
            'experience:media:mute_change' :    'onMuteChange',
            'experience:media:volume_change' :  (function(){ 
                this.set({'volume':this.bc_experience.getVolume()})
            })
        },

        setInitialMute:function(eventName){
            if(this.get('muted')) this.bc_experience.mute(true);
        },

        onMuteChange:function(){
            var m = this.bc_experience.isMuted(); this.set({'muted':m});
            if(this.cookie_mute_settings) sho.util.Cookies.write(this.cookie_mute_store, m);
        },
                    
        mute:function(isMuted){
            this.bc_experience.mute(isMuted);
        },

        isMuted:function(){
            return this.get('muted');
        },

        setVolume:function(v){
            this.bc_experience.setVolume(v);
        },

        getVolume:function(){
            return this.bc_experience.getVolume()
        }
        
    };

    /* No surrender, No delete! */


