	<%@ page session="false"%><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/player/show.jsp
	@type			page
	@author			dpaul	
	@desc			static dummy player, for tweaking markup + css1
	--------------------------------------------------------------------------------
	--%>


	<div class="video-player video-player-outer">
		<div class="video-player-inner">
			<div class="video-player-stage" id="fpo-stage">
				<div class="video-player-experience" id="video-player-experience">
					<object type="application/x-shockwave-flash" data="http://c.brightcove.com/services/viewer/federated_f9?&amp;width=100%25&amp;height=100%25&amp;flashID=sho_video_player_experience_swf&amp;wmode=transparent&amp;bgcolor=%23000000&amp;isVid=true&amp;dynamicStreaming=true&amp;videoSmoothing=true&amp;includeAPI=true&amp;templateLoadHandler=sho.video.brightcove.onTemplateLoaded&amp;playerID=1325689458001&amp;playerKey=AQ~~%2CAAAAAAAA9pg~%2CGnOHJwU2r3sNlKltTiYDvpSZHFNypxse&amp;autoStart=&amp;debuggerID=&amp;startTime=1327442374210" id="sho_video_player_experience_swf" width="100%" height="100%" class="" seamlesstabbing="false">
						<param name="allowScriptAccess" value="always">
						<param name="allowFullScreen" value="true">
						<param name="seamlessTabbing" value="false">
						<param name="swliveconnect" value="true">
						<param name="wmode" value="transparent">
						<param name="quality" value="high">
						<param name="bgcolor" value="#000000">
					</object>
				</div>
			</div>
			<div class="video-player-dock video-player-dock-outer" style="height: 212px;">
				<div class="tabs tabs-outer">
					<div class="tabs-head rtl">
						<ul class="inline">
							<li class="tab tab-toggle" id="tab-toggle-related-videos">
								<a href="#"><b>Related Videos</b></a>
							</li>
							<li class="tab tab-toggle aktiv" id="tab-toggle-share">
								<a href="#"><b>Share</b></a>
							</li>
							<li class="tab tab-toggle" id="tab-toggle-about">
								<a href="#"><b>About</b></a>
							</li>
						</ul>
					</div>
					<div class="tabs-body">
						<div class="tab tab-body related-videos" id="tab-body-related-videos" style="display:none;">
						<div class="tab tab-body share" id="tab-body-share" style="display:block;height: 254px; "><div class="video-player-share"><div class="share-pane social"><span><h2>Share</h2><div class="share-components group"><div class="share-component fb"><iframe scrolling="no" frameborder="0" style="width:51px; height:25px;" allowtransparency="true" src="//www.facebook.com/plugins/like.php?app_id=144949235546135&amp;href=http://www.sho.com/sho/video/titles/13708/grown-up-talk&amp;send=false&amp;layout=standard&amp;width=51&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=25"></iframe></div><div class="share-component twitter"><iframe scrolling="no" frameborder="0" style="width:58px; height:20px;" allowtransparency="true" src="//platform.twitter.com/widgets/tweet_button.html?count=none&amp;url=http://www.sho.com/sho/video/titles/13708/grown-up-talk"></iframe></div><div class="share-component google-plus last" id="___plusone_0" style="height: 24px; width: 38px; display: inline-block; text-indent: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; float: none; line-height: normal; font-size: 1px; vertical-align: baseline; background-position: initial initial; background-repeat: initial initial; "><iframe allowtransparency="true" frameborder="0" hspace="0" id="I1_1334695022774" marginheight="0" marginwidth="0" name="I1_1334695022774" scrolling="no" src="https://plusone.google.com/_/+1/fastbutton?url=http%3A%2F%2Fwww.sho.com%2Fsho%2Fvideo%2Ftitles%2F13708%2Fgrown-up-talk&amp;size=standard&amp;count=false&amp;annotation=none&amp;hl=en-US&amp;jsh=m%3B%2F_%2Fapps-static%2F_%2Fjs%2Fgapi%2F__features__%2Frt%3Dj%2Fver%3DSZqLsnv9-IY.en_US.%2Fsv%3D1%2Fam%3D!-SXmuOx1_3GIepEFVA%2Fd%3D1%2Frs%3DAItRSTPZkkAbEpo-Et2rqJdy5OfjXL7SFA#id=I1_1334695022774&amp;parent=http%3A%2F%2F129.228.130.162%3A8080&amp;rpctoken=174266960&amp;_methods=onPlusOne%2C_ready%2C_close%2C_open%2C_resizeMe%2C_renderstart" style="width: 50px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; height: 24px; position: static; left: 0px; top: 0px; visibility: visible; " tabindex="0" vspace="0" width="100%" title="+1"></iframe></div></div></span></div><div class="share-pane link"><span><h2>Link Share<span class="feedback">&nbsp;</span></h2><form action="#"><span class="nested-button" id="share-link-wrap"><label for="linkShare">Share this link through email or IM:</label><b><input name="linkShare" type="text" value="http://www.sho.com/sho/video/titles/13708/grown-up-talk"></b><a href="#" class="button" id="share-link-button">Copy</a><embed id="ZeroClipboardMovie_2" src="/assets/flash/vendor/zeroclipboard/ZeroClipboard.swf" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="53" height="22" name="ZeroClipboardMovie_2" align="middle" allowscriptaccess="always" allowfullscreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="id=2&amp;width=53&amp;height=22" wmode="transparent"></span><span class="nested-button" id="share-embed-wrap"><label for="embedCode">Copy and paste this embed code:</label><b><input name="embedCode" type="text" value="&lt;object id=&quot;flashObj&quot; width=&quot;486&quot; height=&quot;412&quot; classid=&quot;clsid:D27CDB6E-AE6D-11cf-96B8-444553540000&quot; codebase=&quot;http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,47,0&quot;&gt;&lt;param name=&quot;movie&quot; value=&quot;http://c.brightcove.com/services/viewer/federated_f9?isVid=1&quot; /&gt;&lt;param name=&quot;bgcolor&quot; value=&quot;#FFFFFF&quot; /&gt;&lt;param name=&quot;flashVars&quot; value=&quot;videoId=822832835001&amp;playerID=29474209001&amp;playerKey=AQ~~,AAAAAAAA9pg~,GnOHJwU2r3sFsJRSf1bvZ_iPYmWg8io0&amp;domain=embed&amp;dynamicStreaming=true&quot; /&gt;&lt;param name=&quot;base&quot; value=&quot;http://admin.brightcove.com&quot; /&gt;&lt;param name=&quot;seamlesstabbing&quot; value=&quot;false&quot; /&gt;&lt;param name=&quot;allowFullScreen&quot; value=&quot;true&quot; /&gt;&lt;param name=&quot;swLiveConnect&quot; value=&quot;true&quot; /&gt;&lt;param name=&quot;allowScriptAccess&quot; value=&quot;always&quot; /&gt;&lt;embed src=&quot;http://c.brightcove.com/services/viewer/federated_f9?isVid=1&quot; bgcolor=&quot;#FFFFFF&quot; flashVars=&quot;videoId=822832835001&amp;playerID=29474209001&amp;playerKey=AQ~~,AAAAAAAA9pg~,GnOHJwU2r3sFsJRSf1bvZ_iPYmWg8io0&amp;domain=embed&amp;dynamicStreaming=true&quot; base=&quot;http://admin.brightcove.com&quot; name=&quot;flashObj&quot; width=&quot;486&quot; height=&quot;412&quot; seamlesstabbing=&quot;false&quot; type=&quot;application/x-shockwave-flash&quot; allowFullScreen=&quot;true&quot; swLiveConnect=&quot;true&quot; allowScriptAccess=&quot;always&quot; pluginspage=&quot;http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash&quot;&gt;&lt;/embed&gt;&lt;/object&gt;"></b><a href="#" class="button" id="share-embed-button">Copy</a><embed id="ZeroClipboardMovie_1" src="/assets/flash/vendor/zeroclipboard/ZeroClipboard.swf" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="53" height="22" name="ZeroClipboardMovie_1" align="middle" allowscriptaccess="always" allowfullscreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="id=1&amp;width=53&amp;height=22" wmode="transparent"></span></form></span></div><div class="share-pane email"><span><h2>Email It</h2><form action="#" method="post"><table><tbody><tr class="sender-recipient"><td><label for="senderEmailAddress">Your Email</label><br><b><input id="senderEmailAddress" name="senderEmailAddress" type="text" value=""></b></td><td width="2%"></td><td><label for="recipientEmailAddresses">Friend's Email(s)</label><br><b><input id="recipientEmailAddresses" name="recipientEmailAddresses" type="text" value=""></b></td></tr><tr><td colspan="3"><label for="subject">Subject</label><br><b><input id="subject" name="subject" type="text" value=""></b></td></tr><tr><td colspan="3"><label for="message">Message: (Optional)</label><br><b><textarea id="message" name="message"></textarea></b></td></tr><tr><td colspan="3"><a href="#" class="button submit">Send</a></td></tr><input id="shareUrl" name="shareUrl" type="hidden" value="http://www.sho.com/sho/video/titles/13708/grown-up-talk"></tbody></table></form></span></div></div></div>
						<div class="tab tab-body about" id="tab-body-about" style="display:none;"></div>
					</div>
				</div>
			</div>
			<div class="video-player-title">
				&nbsp;
			</div>
			<div class="video-player-closer">
				&nbsp;
			</div>
			<div class="video-player-controls video-player-controls-outer">
				<div class="video-player-controls-inner">
					<div class="control play-pause paused"></div>
					<div class="control timeline">
						<div class="timeline-position">
							<span class="timeline-title">&nbsp;</span>
						</div>
						<div class="timeline-cursor" style="display:none">
							<span>.</span>
						</div>
					</div>
					<div class="control piped time-display">
						<span class="time-display-current">00:00</span> / <span class="time-display-duration">00:00</span>
					</div>
					<div class="control piped screen-size"></div>
					<div class="control piped audio-mute-unmute muted"></div>
					<div class="control piped audio-volume">
						<div class="audio-volume-inner">
							<div class="audio-volume-indicator" style="width: 100%;">.<div class="audio-volume-cursor">.</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div><!-- END video-player-inner -->
	</div><!-- END video-player-outer -->
