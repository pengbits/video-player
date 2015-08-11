	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/sports/index_series.jsp
	@type			page
	@author			ncavanagh	
	@desc			# sports series-specific video screening room
	@note			# file in use in both screening room and series sites
	@note			# since this is almost a total copy of index_series.jsp in video/series, we should consolidate!
	--------------------------------------------------------------------------------
	--%>
	<tiles:insertDefinition name="series.tune-in" />
	
	<tiles:insertDefinition name="video_navigation">
		<tiles:putAttribute name="video_section" value="sports" />
		<tiles:putAttribute name="video_secondary_list" value="${data.seriesVideoNav.videoNavItemList}" /> 
		<tiles:putAttribute name="video_secondary_selected_item" value="${data.seriesVideoNav.selectedVideoNavItem}" /> 
	</tiles:insertDefinition>
	
	<tiles:insertDefinition name="modules.pagination">
		<tiles:putAttribute name="baseUrl" value="/sho/video/sports" />
	</tiles:insertDefinition>

	<div class="wrap-with-border">
	<c:choose>
	<c:when test="${!data.seasonVideo.hasVideos}">
		<p class="no-videos-found">No videos found.</p>
	</c:when>
	<c:otherwise>
		<c:forTokens items="full,episode,webisode,behindScenes,promotion" delims="," var="key">

			<%-- 'adjust key to match the node containing the list of videos or episode wrappers' --%>
			<c:set var="section_items_key" 			value="${key}VideoList" />
			<c:set var="section_items_key" 			value="${key == 'episode' ? 'episodeVideoViewList' : section_items_key}" />
			<c:set var="is_nested"					value="${key == 'episode' }" />
			<c:set var="section_items" 				value="${data.seasonVideo[section_items_key]}" />

			<%-- 'coerce key into human-readable form' --%>
			<c:set var="section_title" value="${fn:replace(key, 'behindScenes', 'Behind the Scene')}s" />
			<c:set var="section_title" value="${fn:replace(section_title, 'promotion', 'Promo')}" />
			<c:set var="section_title" value="${fn:replace(section_title, 'full', 'Free Full Episode')}" />
		
			<%-- 'deploy video gallery for section' --%>
			<c:choose>
			<c:when test="${is_nested}">
				<c:forEach items="${section_items}" var="item">
					<c:if test="${!empty item.videoList}">

						<tiles:insertDefinition name="modules.media_galleri.video_section">
							<tiles:putAttribute name="items" 				value="${item.videoList}" />
							<tiles:putAttribute name="section_title" 		value="Episode ${item.episodeNumber}: ${item.title}" />
							<tiles:putAttribute name="section_title_url" 	value="${data.series.baseUrl}/season/${data.seasonVideo.seasonNumber}/episode/${item.episodeNumber}" />
							<tiles:putAttribute name="section_copy"			value="${item.shortDescription}" />
						</tiles:insertDefinition>

					</c:if>	
				</c:forEach>
			</c:when>
			<c:otherwise>
				<c:if test="${!empty section_items}">

					<tiles:insertDefinition name="modules.media_galleri.video_section">
						<tiles:putAttribute name="items" 					value="${section_items}" />
						<tiles:putAttribute name="section_title" 			value="${section_title}" />
					</tiles:insertDefinition>
				</c:if>

			</c:otherwise>
			</c:choose>
			
		</c:forTokens>
	</c:otherwise>
	</c:choose>
	</div>
	
	
	