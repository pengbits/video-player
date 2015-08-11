
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   		sho.com <rebuild>
    @project	    video player
    @file		    Playback.js
    @package        models.player
    @author			dpaul
    @modified		01.11.12
    @desc           mix-in for models.player, provides functionality related to controlling the video playback

    /* 
    =:models.player.Playback
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.models.player');
    sho.video.player.models.player.Playback = {

        cookie_mute_settings : true,
        cookie_mute_store : 'video_player_muted',
        tiny_seek_on_media_start : true,                    // this is a workaround for the apparent flakiness of the onProgress event; 
                                                            // a tiny bit of seek at the beginning seems to ensure it always fires.         
        event_responders : {
            'experience:media:begin' :  (function(){
                if(this.tiny_seek_on_media_start) this.seek(0.05); 
                sho.video.trackPlay();
            }),
            'experience:media:play' :   (function(){ 
                this.set({'playing':true});
            }),
            'experience:media:stop' :   (function(){ 
                this.set({'playing':false})
            }),
            'experience:media:change' : (function(){
                this.stage.update();    // trigger resize for benefit of the smart player
            }),
            'experience:media:complete' : (function(){
                this.wake();
                this.set({
                    'finish_line_crossed' : false, 'videoComplete': true 
                });  
            }),
            'experience:media:progress' : (function(eventName,e)
            {
                if(e.progress > 0.95 && !this.get('finish_line_crossed'))
                {
                    this.bc_experience.trigger('media:finish_line');            // trigger artificial experience event for crossing the 95% mark
                    this.set({'finish_line_crossed':true},{'silent':true});
                }
            })
        },

        isPlaying:function(){
            return this.get('playing');
        },

        play:function(){
            this.bc_experience.play()
        },

        pause:function(){
            this.bc_experience.pause(true);
        },
        
        stop:function(){
            this.bc_experience.stop();
        },

        togglePlaying:function(){
            this.bc_experience.pause(this.isPlaying())
        },

        getVideoDuration:function(){
            return this.bc_experience.getDuration();
        },

        seek:function(timeInSeconds)
        {
            if(this.get('videoComplete')) 
            {
                console.log('|player.model.playback| video finished');
                this.play(); this.set({'videoComplete':false},{'silent':true})
            }
            
            this.bc_experience.seek(timeInSeconds)
        }
    }

    /* No surrender, No delete! */
