
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        tweens.js
    @author				dpaul
    @modified		    03.22.12
    @desc		        configurations settings for tweens in the player
    @note               added graded animations support by browser

    sho.video.tweens.isSupported('dock','blur')? => true || false

    /* =:tweens
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video')
    sho.video.tweens = 
    {
        deefault : {
            'duration' : 0.5,
            'transition' : 'easeOutQuad'
        },

        graded_animation_map : {
            'webkit' : {
                'dock' : ['focus','blur','open','close'],
                'controls' : ['focus','blur'],
                'tabs' : ['focus','blur'] // focus really means activate/select a tab
            },
            'firefox' : {
                'dock' : ['focus','blur'],
                'controls' : ['focus','blur'],
                'tabs' : []
            },
            'internet explorer' : {} // zilch
        },
        
        isSupported : function(klass, tween){
            var m = sho.video.tweens.graded_animation_map,
                b = sho.env.browser().name,
                supported = !!(m[b][klass] && m[b][klass].include(tween))
            ;
            
            //console.log(klass+'.'+tween+' is'+(supported ? ' ' : ' not ')+'supported in '+b);
            return supported;
            
        }
    
    };
    
    _.extend(sho.video.tweens.graded_animation_map, {
        'safari' : sho.video.tweens.graded_animation_map.webkit,
        'chrome' : sho.video.tweens.graded_animation_map.webkit
    });


    
    /* No surrender, No delete! */
