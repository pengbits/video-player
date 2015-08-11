	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		schedules
	@file			video/views/titles/_meta.jsp
	@type			partial
	@author			dpaul	
	@desc			custom metadata for video destination page
	--------------------------------------------------------------------------------
	--%>
	<tiles:importAttribute />
	<tiles:insertDefinition name="meta.base" />
	<c:choose>
	<c:when test="${!empty data.video && !empty data.video.vendorId}">
	<meta property="og:url" content="http://www.sho.com${data.video.url}" />
	<meta property="og:image" content="http://www.sho.com${data.video.image.path}" />
	<c:choose>
		<c:when test="${data.video.typeCode eq 'ful'}">
			<c:set var="video_player_id" value="1569527131001" />
			<c:set var="publisher_id" value="34310455001" />
			<meta property="og:title" content="${data.video.title}" />
			<meta property="og:description" content="Watch a sample episode from this and more great Showtime series." />
		</c:when>
		<c:otherwise>
			<c:set var="video_player_id" value="587500813001" />
			<c:set var="publisher_id" value="63128" />
			<meta property="og:title" content="${data.video.contextualTitle}" />
			<meta property="og:description" content="${data.video.longDescription}" />
		</c:otherwise>
	</c:choose>
	<c:set var="swf" value="http://c.brightcove.com/services/viewer/federated_f9/${video_player_id}?isVid=1&isUI=1&publisherID=${publisher_id}&playerID=${video_player_id}&domain=embed&videoId=${data.video.vendorId}" />
	<c:set var="secureswf" value="https://secure.brightcove.com/services/viewer/federated_f9/${video_player_id}?isVid=1&isUI=1&publisherID=${publisher_id}&playerID=${video_player_id}&domain=embed&videoId=${data.video.vendorId}&secureConnections=true" />
	<meta property="og:video" content="${swf}" />
	<meta property="og:video:secure_url" content="${secureswf}">
	<meta property="og:video:width" content="398" />
	<meta property="og:video:height" content="224" />
	<meta property="og:video:type" content="application/x-shockwave-flash" />
    <meta name="thumbnail" content="http://www.sho.com${data.video.image.path}">
    <meta name="duration" content="${data.video.time}">		
	</c:when>
	<c:otherwise>
	<meta property="og:title" content="Showtime" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="http://www.sho.com" />
	<meta property="og:site_name" content="Showtime" />
	</c:otherwise>
	</c:choose>