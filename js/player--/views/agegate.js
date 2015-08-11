
    /*
    JS
    --------------------------------------------------------------------------------------------  
    @site   			sho.com <rebuild>
    @project	    	video player
    @file		        agegate.js
    @package            video.player.views
    @author			    dpaul
    @modified		    01.28.12
    @desc               Age-gate widget. for sensitive content, unauthenticated users must 
    @desc               enter their date-of-birth before video will play.

    <div class="docked video-player-age-gate">
		<form action="#" class="">
			<fieldset>
			<p class="feedback">
				<!--That is not a valid date of birth -->
				Please enter your date of birth to watch this video 
			</p>
			<p>
				<input name="dob-month" type="text" size="2" value="MM" />
				<input name="dob-day" type="text" size="2" value="DD" />
				<input name="dob-year" type="text" size="4" value="YYYY" />
			</p>
			<p>
				<a href="#" class="button submit">Submit</a>
			</p>
			</fieldset>
		</form>
	</div>
	
    /* =:views.AgeGate
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views');
    sho.video.player.views.AgeGate = Backbone.View.extend({

        _KLASS_ : 'sho.video.player.views.AgeGate',
        
        className : 'docked video-player-age-gate',
        
        template : ['',
        
        	'<form action="#" id="video-player-age-gate-form" class="{{#has_errors}}errors{{/has_errors}}">',
        	//    'style="margin-top:{{marginTop}}px;"',
        	//'>',
        	    '{{^lockout}}',
        		'<fieldset>',
        		'<p class="feedback">',
        			'{{feedback}}',
        		'</p>',
        		'<p>',                                                  // clear() only works in desktop???
        			'<input name="month" type="text" size="2" value="MM" onfocus="this.clear();" />',"\n",
        			'<input name="day" type="text" size="2" value="DD" onfocus="this.clear();" />',"\n",
        			'<input name="year" type="text" size="4" value="YYYY" onfocus="this.clear();" />',"\n",
        		'</p>',
        		'<p>',
        			'<a href="#" class="button submit">Submit</a>',
        		'</p>',
        		'</fieldset>',
        		'{{/lockout}}',
        		
        		'{{#lockout}}',
        		'<p class="lockout-message">',
        			'We\'re sorry. You are ineligible to watch this video.<br />',
        			'<a href="#" class="button cancel">Okay</a>',
        		'</p>',
        		'{{/lockout}}',
        	'</form>',
            '<div class="video-player-closer">&nbsp;</div>'
        
        ].join(''),
        
        events : {
            'click .submit' :               'submitDateOfBirth',
            'click .cancel' :               'goodbye',
            'click .video-player-closer' :  'goodbye'                   // extra closer to abort age-gate
        },
        
        fn : {},
        
        /*
        =:startup 
        ---------------------------------------------------------------------------------------- */
        initialize:function(cfg)
        {
            _.extend(this, {
                'container' : cfg.container,
                'model' : cfg.model,
                'controller' : cfg.controller,
                'innerCntr' : this.el,
                'dimensions' : (sho.isIpad() ? sho.string.toDimensions('425x175') : sho.string.toDimensions('350x150')),
                'data' : {
                    'marginTop' : 50,
                    'feedback' : 'Please enter your date of birth to watch this video:',
                    'lockout' : cfg.lockout
                }
            });
            
            
            this.build();
        },
        
        build:function()
        {
            this.container.insert(this.el);
            this.setHandlers();
            this.render();
        },
        
        setHandlers:function()
        {
            this.fn.centerVertically = this.centerVertically.bind(this);
            this.fn.renderWithError = this.render.bind(this, {
                'has_errors' : true, 'feedback' : 'That is not a valid date of birth' 
            });
            this.fn.renderLockout = this.render.bind(this, {
                'lockout' : true
            });
        
            this.model.bind('stage:resize', this.fn.centerVertically);
            this.model.bind('video:validation:invalid_dob', this.fn.renderWithError );
            this.model.bind('video:validation:lockout', this.fn.renderLockout );
        },
        
        /*
        =:runtime 
        --------------------------------------------------------------------------------------- */
        render:function(data)
        {
            this.innerCntr.update(Mustache.to_html(this.template, _.extend({}, this.data, (data || {})) ));
            this.centerVertically();
        },
        
        centerVertically:function()
        {
            var form = (this.innerCntr.select('form')[0]);
            form.setStyle({'marginTop' : this.getMarginTop()+'px' });
        },
        
        getMarginTop:function()
        {
            var h = this.model.getAdjustedStageSize().height, 
            t = Math.floor((h - this.dimensions.height) / 2);
            return t;
        },
        
        submitDateOfBirth:function(e)
        {
            e.preventDefault();
            var dob=$('video-player-age-gate-form').serialize(true);
            this.controller.submitDateOfBirth(dob);
        },
        
        goodbye:function(e)
        {
            Event.stop(e);
            this.innerCntr.hide(); // give user a little immediate feedback since getPlayer().destroy seems to take a few seconds
            sho.video.getPlayer().destroy();
        },
        
        destroy:function()
        {
            this.model.unbind('stage:resize', this.fn.centerVertically);
            this.model.unbind('video:validation:invalid_dob', this.fn.renderWithError);
            this.model.unbind('video:validation:lockout', this.fn.renderLockout);
            if(this.container) this.innerCntr.remove();
        }
        
    })

    /* No surrender, No delete! */
