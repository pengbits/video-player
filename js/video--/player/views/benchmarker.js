
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        benchmarker.js
    @package            video.player.views
    @author			    dpaul
    @modified		    12.22.11
    @desc               utility for logging time-to-load and time-to-brightcove
	
    /* =:views.BenchMarker
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.BenchMarker = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.BenchMarker',
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        initialize:function(cfg)
        {
            _.extend(this, {
                'fn' : {},
                'stealthmode' : true, //!(sho.env.isDev() || sho.env.isLocal()),
                'container' : cfg.container, 
                'model' : cfg.model
            });
            
            if(!this.stealthmode) this.build();
            this.setHandlers();
        },
        
        build:function()
        {
            this.container.update(['',
            '<table width="100%" border="1">',
                '<tbody>',
                    '<tr>',
                    '<th width="48%">event</th>',
                    '<th width="40%">duration</th>',
                    '<th width="8%"><a class="closer" href="#">X</a></th>',
                    '</tr>',
                '</tbody>',
            '</table>',
            ''].join(''));
            
            this.table = this.container.select('table tbody')[0];
        },
        
        setHandlers:function()
        {
            this.fn.update = this.update.bind(this);
            this.fn.click = this.click.bind(this);
    
            this.model.bind('experience:template:ready', this.fn.update);
            this.model.bind('video:loaded', this.fn.update);
            this.stealthmode || this.container.observe('click', this.fn.click);
        },
        
        /*
        =:runtime 
        ---------------------------------------------------------------------------------------- */
        update:function()
        {
            var b = this.model.getBenchMark(),
                t = new Date(),
                d = t - b.timestamp,
                duration = d / 1000;
            ;
            this.print(b.label,duration);
        },
        
        print:function(e,duration)
        {
            if(!this.stealthmode && this.table)
            {
                this.table.insert({
                    'bottom':['<tr><td>', e,'</td><td colspan="2">', duration,'</td></tr>'].join('')
                })
            }
            else
            {
                console.log('|player| '+e+' : '+duration);
            }
        },
        
        click:function(e)
        {
            e.stop(); if(e.findElement('a.closer')) this.destroy();
        },
        
        destroy:function()
        {
            // may not need these model.unbind calls..
            this.model.unbind('experience:template:ready', this.fn.update);
            this.model.unbind('video:loaded', this.fn.update);
            this.container.stopObserving('click');
            this.container.remove();
            this.container = null;
        }
        
    })

    /* No surrender, No delete! */
