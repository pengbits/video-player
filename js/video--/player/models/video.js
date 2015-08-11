
        /*
        JS
        --------------------------------------------------------------------------------------------  
        @site   		sho.com <rebuild>
        @project	    video player
        @file		    video.js
        @package        video.player.models
        @author			dpaul
        @modified		10.03.12
        @desc           model class for REST-backed video object, trying a pure Backbone ting!
        -------------------------------------------------------------------------------------------- */  
        sho.provide('sho.video.player.models');
        
        /**
         * class sho.video.player.models.Video < Backbone.Model
         * Model class for a REST-backed video object.
        **/
            
        sho.video.player.models.Video = Backbone.Model.extend({

            _KLASS_ : 'sho.video.player.models.Video',

            // net
            base_url : '/rest/video/titles',
            stub_url : '/!/video/title.js',
            full_episode_stub_url : '/!/video/full-episode.js',
            closed_captions_stub_url : '/!/video/cc-test-',
            
            // prefs
            always_use_stub_url : false,

            /*
            =:runtime
            ---------------------------------------------------------------------------------------- */
            
            /**
             * sho.video.player.models.Video#url() -> String
             * Returns the url for the JSON representation of the video object, which takes the form `base_url +'/' + id + '/' + title-slug`.
             *
             * if `sho.video.always_use_stub_url` (psuedo-global) or `this.always_use_stub_url` (set in class definition) are found to be true,
             * this function will instead return a static string, (the path to a flattened file/fixture), which can be used to help speed up local development.
            **/
            url:function()
            {
                var url;
                
                if((this.always_use_stub_url || sho.video.always_use_stub_url))
                {
                    url = this.stub_url;
                    
                    if(this.attributes.id == window.test_full_episode.id) 
                    {
                        url = this.full_episode_stub_url;    
                    }
                    
                    if((window.test_closed_captions || []).collect(function(v){return v.id;}).join(' ').indexOf(this.attributes.id) !== -1)
                    { 
                        url = this.closed_captions_stub_url + this.attributes.id + '.js';
                    }
                }
                else
                {
                    url = ([this.base_url,this.get('id'),(this.slug || 'slug-not-provided')].join('/'));
                }
                return url;
            },

            /**
             * sho.video.player.models.Video#trigger(eventName, arguments) -> Event
             * A custom implementation of Backbone.Model.trigger, allowing us to pay special attention to changes to the 'data' property..
             * This could potentially go into a new backbone-centric 'base model' class.
            **/
            trigger:function(e, args)
            {
                // when the data property changes, copy child members onto the root level
                if(e.match(/change:data/)) 
                {
                    //  copy the video data directly onto this.attributes, without triggering a bunch of events
                    var payload = this.get('data') || {}; 
                    _.extend(this.attributes, payload.video || {});
                    
                    // store related videos as a simple array of objects:
                    this.relatedVideoList = payload.relatedVideoList;
                }
                
                Backbone.Model.prototype.trigger.call(this, e, args)
            },

            /**
             * sho.video.player.models.Video#fetch(options) -> Event
             * Extend Backbone.Model.fetch, in order to add a pre and post event
            **/
            fetch:function(opts)
            {
                this.trigger('loading');
                log('|model| url=`'+this.url()+'`');
    
                var th=this, 
                    opts = (opts || {'success':false}),
                    fn = opts.success
                ;
                opts.success = function(model, response)
                {
                    th.trigger('loaded');
                    if(fn) fn.call(this, model, response);
                }
    
                Backbone.Model.prototype.fetch.call(this, opts)
            },
            
            /**
             * sho.video.player.models.Video#isFullEpisode() -> Boolean
             * Returns true if the video has a typeCode that matches the flag for Full Episodes, defined in [[sho.video.types]]
            **/
            isFullEpisode:function()
            {
                return this.get('typeCode') == sho.video.types.FULL_EPISODE
            },
            
            /**
             * sho.video.player.models.Video#getVideoType() -> String
             * Returns either 'full' or 'short', depending on the videos' typeCode.
            **/
            
            getVideoType:function()
            {
                return this.isFullEpisode() ? 'full' : 'short'
            }
        });
        
        /**
         * sho.video.types = {}
         * A hash of static constants that map to video type-codes in VAMS. These could be expanded to include more video types, but the 
         * primary purpose is to distinguish full episodes from short form, a crucial distinction since a different Brightcove account is used for each type.
         *
         * `sho.video.types.FULL_EPISODE = 'ful'`
         *
        **/
        sho.video.types = {
            'FULL_EPISODE' : 'ful'
        };
        
        /* No surrender, No delete! */


