<%@ page session="false"%><%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/titles/show.jsp
	@type			page
	@author			dpaul	
	@desc			destination page for video
	--------------------------------------------------------------------------------
	--%>

	<script type="text/javascript">
        // delayRedirect may be set in pixels module above, if relevant px param is found
		if (!delayRedirect) { 
            var delayRedirect = false; 
        }
        
		sho.dom.ready(function() {
			sho.$("#insert-connect-text" ).prepend( "Connecting to video...");
			});
	</script>

	<c:set var="floodlightTag" value="" />
	
	<%-- Current DoubleClick floodlight tags implemented (Title, VAMS ID, Tag):
		Ray Donovan Series Premiere, 20889, type=showt766;cat=showt031;
		Masters of Sex Trailer, 21971, type=showt381;cat=showt570;
		Homeland Season 3 Trailer, 21993, type=showt959;cat=showt096;
		Master of Sex Full Episode, 22543, type=acqui412;cat=mosfu692;
		Jay-Z Trailer, 22391, type=iamck802;cat=showt168;
		Years of Living Dangerously Trailer, 29012, type=Showt00;cat=Showt0;
		Penny Dreadful Trailer, 27693, type=Showt003;cat=Showt0;
		Penny Dreadful Full Episode, 29713, type=Showt002;cat=Showt0;
        Masters of Sex No Accidents Spot, 31300, type=S2_2014;cat=Showt00;
		House Of Lies Season 4 premiere, 34048, type=showt008;cat=showt0;
		Episodes Season 4 premiere, 34049, type=showt00-;cat=showt0;
		Shameless Season 5 premiere, 34031, type=showt00b;cat=showt0;
	--%>
	
	<c:set var="floodlightTagStrings" value="type=showt766;cat=showt031;,type=showt381;cat=showt570;,type=showt959;cat=showt096;,type=acqui412;cat=mosfu692;,type=iamck802;cat=showt168;,type=Showt00;cat=Showt0;,type=Showt003;cat=Showt0;,type=Showt002;cat=Showt0;,type=S2_2014;cat=Showt00;,type=showt008;cat=showt0;,type=showt00-;cat=showt0;,type=showt00b;cat=showt0;" />
	<c:set var="floodlightTags"	value="${fn:split(floodlightTagStrings, ',')}" />
	
	<c:forTokens items="20889,21971,21993,22543,22391,29012,27693,29713,31300,34048,34049,34031" delims="," var="videoId" varStatus="i">
		<c:if test="${data.video.id == videoId}">
			<c:set var="floodlightTag" value="${floodlightTags[i.index]}" />
		</c:if>
	</c:forTokens>
	
	<c:if test="${floodlightTag != ''}">
		<script type="text/javascript">
			var axel = Math.random() + "";
			var a = axel * 10000000000000;
			document.write('<iframe src="http://2201481.fls.doubleclick.net/activityi;src=2201481;${floodlightTag}ord=' + a + '?" width="1" height="1" frameborder="0" style="display:none"></iframe>');
			// also delay the redirect for 1000ms to give more time for impression
			delayRedirect = true;
		</script>
		<noscript>
			<iframe src="http://2201481.fls.doubleclick.net/activityi;src=2201481;${floodlightTag}ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>
		</noscript>
		<!-- End of DoubleClick Floodlight Tag: Please do not remove -->
	</c:if>

	<h1 id ="insert-connect-text"></h1>
	<p style="visibility:hidden;">
	    ${data.video.description}
	</p>
	
	<script type="text/javascript">

		var redirectDelayTime = (delayRedirect) ? 1000 : 0;
		
		var video_base_url = '<c:out value="${data.video.homeBaseUrl}" />',
		
		title_url = '<c:out value="${data.video.url}" />',
		redirect_to = video_base_url+'#'+(title_url.gsub(/sho\//,'')),
		valid_url = redirect_to !== '#'
		;
		
		if(!valid_url) 
		{ 
			sho.ui.Error({'message' : '<p>An error has occurred while attempting to play your video</p>'}); 
		}
		else
		{
			if(!sho.env.isFacebookApp()) // this method only exists in 6.0.27+ */
			{	
				setTimeout(function(){
				  window.location = redirect_to;
				},redirectDelayTime);
			}
			else
			{
				// using in-page player, so remove loading messaging + style
				($$('.content h1')[0]).remove(); 
				($$('.content')[0]).className = 'video-in-page-embed';
			}
		}
		
	</script>

	<%-- 'deploy in-page player as last resort for facebook app on ipad platform:' 
	It seemed that the page in IE was trying to render some code containing object and param tags thus showing a missing img icon.
	These object and param tag are usually used when trying to load a swf file. I suspect since there was no swf file IE showed a broken image. These object and param tags seem to be there as it appears the bright-cove api may be expecting these tags (not used in flash context)  as this is old code and previously it was needed to render the video on IPAD.
	So targeting specifically IE to hide this block of code seemed to be a workaround for this issue. SITE-9806
	
	--%>
	<c:if test="${!empty data.video.vendorId}">
		<object id="myExperience" class="BrightcoveExperience hide-in-ie">
			<param name="bgcolor" value="#000000" />
			<param name="width" value="100%" />
			<param name="height" value="100%" />
			<c:if test="${data.video.typeCode ne 'ful'}">
			<param name="playerID" value="1706359199001" />
			<param name="playerKey" value="AQ~~,AAAAAAAA9pg~,GnOHJwU2r3tG_Sa97ZpoTTr2wYscnO_y" />
			</c:if>
			<c:if test="${data.video.typeCode eq 'ful'}">
			<param name="playerID" value="1706359204001" />
			<param name="playerKey" value="AQ~~,AAAAB_0P_tk~,Ddi_5nC928zm3dzO5U5IH-kNe5wtGrDU" />
			</c:if>
			<param name="isVid" value="true" />
			<param name="isUI" value="true" />
			<param name="@videoPlayer" value="${data.video.vendorId}" />
			<param name="dynamicStreaming" value="true" />
		</object>
	</c:if>