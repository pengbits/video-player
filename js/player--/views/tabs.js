
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        tabs.js
    @package            video.player.views
    @author			    dpaul
    @modified		    12.22.11
    @desc               tabbed functionality in bottom video player
    @note               getting my mustache on...

    /* =:views.Tabs
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.Tabs = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.Tabs',
   
        // backbone classname for auto-created container element
        className : 'tabs tabs-outer',
        
        // config for dynamically creating tab view
        item_config : [{
            'klass' : 'related-videos',
            'title' : 'Related Videos'
        },{
            'klass' : 'share',
            'title' : 'Share'
        },{
            'klass' : 'about',
            'title' : 'About'
        }],
        
        // define selectors for tabs elements
        klass_names : {
            'toggle' :  'tab-toggle',
            'body' :    'tab-body',
            'tab' : 'tab',
            'activeItem' : 'aktiv'
        },
        
        // switch to order tab head from right to left
        right_to_left : true, 
        
        // mustache template, defines entire view..
        template : [
        '<div class="tabs-head {{#right_to_left}} rtl{{/right_to_left}}">',
            '<ul class="inline">',
                '{{#item_config}}',
                '<li class="tab tab-toggle" id="tab-toggle-{{klass}}"><a href="#"><b>{{title}}</b></a></li>',
                '{{/item_config}}',
            '</ul>',
        '</div>',
        '<div class="tabs-body">',
            '{{#item_config}}',
            '<div class="tab tab-body {{klass}}" id="tab-body-{{klass}}"></div>',
            '{{/item_config}}',
        '</div>'
        ].join(''),
        
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'innerCntr' : this.el,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'items' : {}
            });
            
            this.build();
            this.setHandlers();
        },
        
        build:function()
        {    
            this.container.insert(this.innerCntr);
            this.innerCntr.insert(Mustache.to_html(this.template, this));
        },
        
        setHandlers:function()
        {
            this.collectElements('toggle');
            this.collectElements('body');
            this.item_keys = _.keys(this.items);
            this.innerCntr.observe('click', this.click.bind(this));
        },
        
        collectElements:function(key)
        {
            var th=this;  
            this.innerCntr.select('.'+this.klass_names[key]).each(function(el)
            {
                // <li class="tab-toggle share" id="tab-toggle-share>..</li> or
                // <div class="tab-body share" id="tab-body-share">..</div>
                var k=el.id.gsub(th.klass_names[key]+'-','');
                th.items[k] = th.items[k] || {}; 
                th.items[k][key] = el;
                th.items[k].aktiv = false;
                if(key == 'body') { el.setStyle({'height':'0px'}) }//el.hide(); //el.setStyle({'height':'0px'});
            })
        },
        
        /*
        =:runtime 
        ---------------------------------------------------------------------------------------- */
        click:function(e)
        {
            e.stop();
            
            var el = e.findElement('.'+this.klass_names.toggle); 
            el && this.activateTab(el.id.gsub(this.klass_names.toggle+'-',''));
        },
        
        activateTab:function(tab)
        {
            // recoded to work without the enumerable, hopefully this is faster
            if(this.last_tab && this.last_tab !== tab)
            {
                this.blur(this.last_tab);
            }
            
            if(!this.items[tab].aktiv)
            {
                this.focus(tab);
                this.last_tab = tab;
            }
            else 
            {
                this.toggle(tab);
                this.last_tab = null;
            }
            
            sho.video.trackClick(tab);
        },
        
        activateComponent:function(t)
        {
            this.items[t].aktiv = true;
            (this.getComponent(t) || this.initComponent(t)).activate();
            
            this.trigger('tabs:activated', {
                'tab' : this.getComponent(t)
            });    
            //log('activated: `'+t+'`');
        },
        
        initComponent:function(t)
        {
            var k = t.capitalize().camelize(), klass = sho.video.player.views[k]
            ;
            return this.setComponent(t, new klass({
                'container' : this.getBody(t),
                'model' : this.model,
                'controller' : this.controller
            }))
        },
        
        deactivateComponent:function(t)
        {
            this.items[t].aktiv = false;
            if(this.getComponent(t))
            {
                this.getComponent(t).deactivate();
                //log('deactivated: `'+t+'`');
            }
        },
        
        /*
        =:util 
        ---------------------------------------------------------------------------------------- */
        getTab:function(id){
            return this.items[id];
        },
        
        getToggle:function(id){
            return this.items[id].toggle
        },
        
        getBody:function(id){
            return this.items[id].body
        },
        
        getComponent:function(id){
            return (this.items[id] || {'component':null}).component
        },
        
        setComponent:function(id, cmp){
            this.items[id].component = cmp; 
            return this.items[id].component;
        },
        
        reset:function()
        {
            this.last_tab = null;
            
            var th=this;
            this.item_keys.each(function(t){
                th.getBody(t).setStyle({'height':'0px'});
                th.deactivateComponent(t);
                th.getToggle(t).removeClassName(th.klass_names.activeItem);
            })
            //;log('tabs:reset');
        },
        
        
        /*
        =:animation, =:tween 
        ---------------------------------------------------------------------------------------- */
        focus:function(tab)
        {
            //log('focus: `'+tab+'`');
            this.activateComponent(tab);
            this.tween('focus', tab);
        },
        
        blur:function(tab)
        {
            //log('blur: `'+tab+'`');
            this.deactivateComponent(tab);
            this.tween('blur', tab);
        },
        
        toggle:function(tab)
        {
            //log('toggle: `'+tab+'`');
            this.blur(tab);
            this.trigger('tabs:collapsed')
        },
        
        tween:function(mode, tab)
        {
            // content is falling out in ipad, consider setting a width in pixels?
            // todo: migrate to jquery animation
            var toggle = this.getToggle(tab),
                body = this.getBody(tab),
                height = this.getComponent(tab).height,
                isTween = sho.video.tweens.isSupported('tabs', mode)
            ;
            
            if(mode == 'focus')
            {
                toggle.addClassName(this.klass_names.activeItem);
                
                if(isTween){
                    body.morph('height:'+height+'px', sho.video.tweens.deefault);
                } else {
                    body.setStyle({'height':height+'px'});
                }
            }
            
            else
            {
                toggle.removeClassName(this.klass_names.activeItem);
                
                if(isTween) {
                    body.setStyle({
                        'borderBottom':'#2A2A2A solid 1px'
                    }).morph(''+
                        'height:0;', _.extend({
                            'after':(function(t){
                                t.element.setStyle({'border':'none'})
                            })
                        }, sho.video.tweens.deefault)
                    );
                    
                } else {
                    body.setStyle({'height':0+'px'});        
                }
            }
            
        }
        
        
    })


