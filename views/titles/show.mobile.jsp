	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/titles/show.mobile.jsp
	@type			page
	@author			dpaul
	@modified		Fri Aug 24 15:40:42 EDT 2012
	@desc			# Video page for mobile site. Unlike the desktop, this url doesn't need to redirect anywhere,
	@desc			# instead it draws the media to the page and provides context by exposing related clips inline ...
	@desc			# upsampling the thumbnail size from 160x90 to 444x250 with jstl for the video footprint
	--------------------------------------------------------------------------------
	--%>
	<c:set var="video" value="${data.video}" />
	<c:set var="video_footprint_img" value="${empty video.image ? '/path/to/generic/art.png' : fn:replace(video.image.path, '160x90','444x250')}" />
	
	<a class="video-footprint" href="${video.vendorUrl}${mobileVideoTracking}" 
		style="background-image:url(http://www.sho.com${video_footprint_img});"
		data-behavior="play-mobile-video" 
		data-gamify-callback="watch-mobile-video" 
		data-video-format="${video.typeCode == 'ful' ? 'episode':'promo'}"
		data-video-id="${video.id}"
		data-video-age-gate="${video.ageGate}"
		data-series-id="${video.seriesId}"
		data-season-number="${video.seasonNum}"
		data-episode-id="${video.episodeId}"
	>
		<img class="full-width" src="/assets/images/lib/clear_160x90.png" />
	</a>
	
	<span class="block">
		<h3>${empty video.contextualTitle ? video.title : video.contextualTitle}</h3>
		<p>${video.description}</p>
	</span>

	<tiles:insertDefinition
		name="modules.social_components.mobile_urls" />
	<tiles:insertDefinition
		name="modules.social_components.mobile.content" >
		<tiles:putAttribute name="url" value="${video.url}" /></tiles:insertDefinition>
	
	<tiles:insertDefinition 
		name="modules.section_header.gradient">
		<tiles:putAttribute name="title" value="Related Videos" /></tiles:insertDefinition>
	
	<tiles:insertDefinition 
		name="modules.video_gallery.mobile">
		<tiles:putAttribute name="videos" value="${data.relatedVideoList}" /></tiles:insertDefinition>