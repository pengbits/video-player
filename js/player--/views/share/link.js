
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        email.js
    @package            video.player.views.share
    @author			    dpaul
    @modified		    01.06.12
    @desc               email sharing functionality in dock
    @todo               make this work after tab is collapsed, zero clip is falling out

    /* 
    =:view.share.Link
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.share');
    sho.video.player.views.share.Link = sho.video.player.views.share.ShareComponent.extend({
        
        _KLASS_ :  'sho.video.player.views.share.Link',
        
        template : [  
            '<h2>',
                'Link Share',
                '<span class="feedback">&nbsp;</span>',
            '</h2>',
            '<form action="#">',
            
            '<span {{#clipboard_supported}}class="nested-button"{{/clipboard_supported}} id="share-link-wrap">',
                '<label for="linkShare">Share this link through email or IM:</label>',
                '<b><input name="linkShare" type="text" value="{{shareUrl}}" /></b>',
                '{{#clipboard_supported}}',
                '<a href="#" class="button" id="share-link-button">Copy</a>',
                '{{/clipboard_supported}}',
            '</span>',
            
            '{{#embed_supported}}',
            '<span {{#clipboard_supported}}class="nested-button"{{/clipboard_supported}} id="share-embed-wrap">',
                '<label for="embedCode">Copy and paste this embed code:</label>',
                '<b><input name="embedCode" type="text" value="{{embedCode}}" /></b>',
                '{{#clipboard_supported}}',
                '<a href="#" class="button" id="share-embed-button">Copy</a>',
                '{{/clipboard_supported}}',
            '</span>',
            '{{/embed_supported}}',
            
            '</form>'
        ].join(''),
        
        
        button_dimensions : {'width':53,'height':22},
        
        fn : {},
        
        setHandlers:function()
        {   
            if(window.clipboardData && window.clipboardData.setData)
            {
                this.clipboard_mode = 'JS';
                this.clipboard_supported = true;
            }
            else if(sho.isDesktop() && !!ZeroClipboard) // previously this was if(!!ZeroClipboard && !sho.isIpad()), which broke entire component on ipad
            {
                this.clipboard_mode = 'Flash';
                this.clipboard_supported = true;
            }
            else 
            {
                this.clipboard_supported = false;
            }
                
            if(this.clipboard_supported)
            {
                var method = 'init'+this.clipboard_mode+'Clipboard';
                this.fn.initClipboard = this[method].bind(this)
            }
        },
        
        render:function(data)
        {
            this.determineEmbedSupport();  // we don't draw the embed-code functionality for tv-ma videos
            
            sho.video.player.views.share.ShareComponent.prototype.render.call(this, _.extend(data, { 
                'clipboard_supported' : this.clipboard_supported, 
                'embed_supported': this.embed_supported,
            }));
            
            this.clipboard_supported && this.fn.initClipboard.delay(sho.dom.REDRAW_DELAY);
        },
        
        determineEmbedSupport:function()
        {
            if(this.model.isMatureContent())
            {
                this.embed_supported = false;
                this.linkables = ['link']
            }
            else
            {
                this.embed_supported = true
                this.linkables = ['embed','link']
            }
        },
        
        initJSClipboard:function()
        {
            this.fn.copyToClipboard = this.copyToClipboard.bind(this);
            $$('#share-link-button, #share-embed-button').invoke('observe', 'click', this.fn.copyToClipboard);
        },
        
        
        initFlashClipboard:function()
        {
            // this will fail in IE, it's supposedly a flash bug... but we use pure js support there
            // http://code.google.com/p/zeroclipboard/issues/detail?id=39
            // log('initFlashClipboard');
            var th=this;
            _.each(this.linkables, function(key)
            {
                var container = th.innerCntr.select('#share-'+key+'-wrap')[0],
                    button = th.innerCntr.select('#share-'+key+'-button')[0],
                    clipboard = new ZeroClipboard.Client()
                ;
                
                // configure clipboard and add element reference for manual hover styles
                clipboard.setHandCursor(true);
                clipboard.setCSSEffects(false);
                clipboard.setText(th.getClippingText(key));
                clipboard.button = button;
                
                // deploy flash
                container.insert(clipboard.getHTML(th.button_dimensions.width,th.button_dimensions.height));
                
                // set handlers
                clipboard.addEventListener('complete', function(){
                    th.updateFeedback(key+' copied successfully');
                    th.model.trigger('clipboard:copied', key); 
                    // cheeky! but we need to alert nitro to this psuedo-event
                });
                clipboard.addEventListener('mouseOver', function(c){
                    c.button.addClassName('over');
                });
                clipboard.addEventListener('mouseOut', function(c){
                    c.button.removeClassName('over');
                });
                
                // store reference to clipboard
                th[key] = {'clipboard':clipboard};
                window[key+'_clipboard'] = clipboard;
            });
 
        },
        
        copyables:function()
        {
            return this.embed_supported ? ['embed','link'] : ['link']
        },
        
        
        copyToClipboard:function(e)
        {
            var el = e.findElement('a'), key = el.id.gsub(/share-|-button/,''); 
            window.clipboardData.setData('text', this.getClippingText(key));
            this.model.trigger('clipboard:copied', key);
            this.updateFeedback(key+' copied successfully');
        },
        
        deactivate:function()
        {
            if(this.clipboard_supported) {
                this['destroy'+this.clipboard_mode+'Clipboard']();
            }
        },
        
        destroyFlashClipboard:function()
        {
            var th=this; 
            _.each(this.linkables, function(key)
            {
                if(th[key].clipboard && th[key].clipboard.movie)
                {
                    th[key].clipboard.movie.remove();
                    th[key].clipboard = null;
                }
            });
        },
        
        destroyJSClipboard:function()
        {
            $$('#share-link-button, #share-embed-button').invoke('stopObserving', 'click', this.fn.copyToClipboard);
        },
        
        updateFeedback:function(msg)
        {
            (this.innerCntr.select('.feedback')[0]).update(' / ' + msg);
        },
        
        getClippingText:function(kind)
        {
            return kind == 'link' ? this.model.getContentUrl() : this.model.getEmbedCode()
        }
        
         
        
    });