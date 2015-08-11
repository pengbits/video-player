
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   		sho.com <rebuild>
        @project	    video player
        @file		    player.js
        @package        video.player
        @author			dpaul
        @modified		10.03.12
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.models.player');
        
        /**
         * class sho.video.player.models.Player
         * This class defines the model in the model-view-controller setup. There is quite a lot of complex functionality so it
         * is broken up into individual modules to keep things manageable, but all methods and properties are ultimately copied onto the model class itself.
         *
         * Each module also has the oppurtunity to set event listeners, which are related to the specific area of focus, but are set
         * on the resulting model class. For example, in the AgeGating mix-in:
         *
         *      event_responders : {
         *          'video:loaded' : 'clearDOB',
         *          'video:validation:underage' : 'setLockoutCookie'
         *      },
         *
         * For each pair in the hash, the key is the event name, and the value is the method name to be invoked in the model scope. In some instances,
         * an inline function definition is supplied, instead of a method name.
        **/
        
        sho.video.player.models.Player = Backbone.Model.extend((function(model_scope){
            
            var klass_template = {};
            var event_responders = {};
            _.each('Base Net Audio Playback Display Sharing AgeGating Sleep ClosedCaptions'.split(' '), function(module){
    
                // mix methods and properties into class
                _.extend( klass_template, model_scope[module]);
    
                // non-destructively collect event responders .(assumes only 1 responder per event name per module)
                _.keys(model_scope[module].event_responders || {}).each(function(e){
                    event_responders[e] = event_responders[e] || [];
                    event_responders[e].push(model_scope[module]['event_responders'][e]);
                    // if(e.match(/media:change/)) console.log(e +' found in '+module);
                    // console.log(event_responders[e].length);
                })
            });
            
            // mix event_responders into class 
            _.extend( klass_template, {'event_responders':event_responders});
            
            return klass_template
        
        }(sho.video.player.models.player)));
          
