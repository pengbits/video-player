
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

    /* 
    =:view.share.Email
    -------------------------------------------------------------------------------------------- */  
    sho.provide('sho.video.player.views.share');
    sho.video.player.views.share.Email = sho.video.player.views.share.ShareComponent.extend({
        
        _KLASS_ :  'sho.video.player.views.share.Email',
        
        template : [
            '<h2>',
                'Email It',
                '{{#feedback}}<span class="feedback{{#hasErrors}} errors{{/hasErrors}}"> / {{feedback}}</span>{{/feedback}}',
            '</h2>',
            
            '<form action="#" method="post" {{#loading}}class="loading"{{/loading}}>',
            '<table>',
            	'<tr class="sender-recipient">',
            		'<td{{#errors.senderEmailAddress}} class="error"{{/errors.senderEmailAddress}}>',
            		    '<label for="senderEmailAddress">Your Email</label><br />',
            			'<b><input id="senderEmailAddress" name="senderEmailAddress" type="text" value="{{senderEmailAddress}}"/></b>',
            		'</td>',
            		'<td width="2%">',
            		'</td>',
            		'<td{{#errors.recipientEmailAddresses}} class="error"{{/errors.recipientEmailAddresses}}>',
            			'<label for="recipientEmailAddresses">Friend\'s Email(s)</label><br />',
            			'<b><input id="recipientEmailAddresses" name="recipientEmailAddresses" type="text" value="{{recipientEmailAddresses}}"/></b>',
            		'</td>',
            	'</tr>',
            	'<tr>',
            		'<td colspan="3">',
            			'<label for="subject">Subject</label><br />',
            			'<b><input id="subject" name="subject" type="text" value="{{subject}}"/></b>',
            		'</td>',
            	'</tr>',
            	'<tr>',
            		'<td colspan="3">',
            			'<label for="message">Message: (Optional)</label><br />',
            			'<b><textarea id="message" name="message">{{message}}</textarea></b>',
            		'</td>',
            	'</tr>',
            	'<tr>',
            		'<td colspan="3">',
            			'<a href="#" class="button submit">Send</a>',
            			'{{#loading}}<u class="spinner">Loading...</u>{{/loading}}',
            		'</td>',
            	'</tr>',	
            	'<input id="shareUrl" name="shareUrl" type="hidden" value="{{shareUrl}}"/>',
            '</table>',
            '</form>'
        ].join(''),
        
        events : {
            'click .submit' : 'sendEmail'
        },
        
        fn : {},
        
        setHandlers:function()
        {
     
            // loading
            this.fn.onLoading = this.render.bind(this, {'loading' : true, 'hasErrors' : false, 'errors' : [] });
            this.model.bind('shareable:loading', this.fn.onLoading)
            
            // success
            this.fn.onSuccess = this.render.bind(this, {'loading' : false, 'hasErrors' : false, 'errors' : [], 'feedback' : 'Your message has been sent successfully' });
            this.model.bind('shareable:success', this.fn.onSuccess);
            
            // errors
            // need to move the error collection into parent class to be able to cache the bound callback in this.fn.onError
            var th =this;
            this.model.bind('shareable:error', (function(errors){
                th.render({
                    'errors': th.collectErrors(errors || []), 
                    'hasErrors' : (errors || []).length > 0,
                    'feedback':'Please check the information below:',
                    'loading' : false
                });
                
            }));
        },
        
        // render:function(data)
        // {
        //     _.extend(this.data, this.model.getShareableAttributes());
        //     console.log(this.data);
        //     sho.video.player.views.share.ShareComponent.prototype.render.call(this, data);
        // },
      
        collectErrors:function(list)
        {
            return (list.inject({}, function(errors, e){
                errors[e.field] = e.message; return errors;
            }));
        },

        sendEmail:function(e)
        {
            var form = Event.findElement(e,'a').up('form'); Event.stop(e);
            this.controller.sendEmail(form.serialize(true)); // prototypejs' serialize method accepts an option to cast to object literal, by passing true here.
        }

    });