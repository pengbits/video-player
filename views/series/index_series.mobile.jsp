	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/series/index_series.mobile.jsp
	@type			page
	@author			dpaul
	@modified		09.07.12
	@desc			# series-specific video screening room
	@note			# file in use in both screening room and series sites
	--------------------------------------------------------------------------------
	--%>
	<c:catch var="exception"><c:set var="seriesVideoNav" value="${data.seriesVideoNav}"/></c:catch>
	<c:choose>
		<c:when test="${empty exception}">	
			<div data-component="sho.ui.mobile.SuperSelect" class="super-select clearfix">
				<div class="super-select-label">
					<b>${data.seriesNav.selectedNavItem.shortTitle}</b>
				</div>
				<div class="super-select-menu">
					<select>
						<option value="/sho/video/series" selected="selected">Featured</option>
						<c:forEach items="${data.seriesNav.itemList}" var="item">
							<option value="${item.url}"&nbsp;
								<c:if test="${item.shortTitle == data.seriesNav.selectedNavItem.shortTitle}"> selected="selected"</c:if>
									>${item.shortTitle}</option>
						</c:forEach>
					</select>
				</div>
			</div>
			<c:if test="${fn:length(data.seriesVideoNav.videoNavItemList) > 1}">		
				<div data-component="sho.ui.mobile.SuperSelect" class="super-select clearfix">
					<div class="super-select-label">
						<b>Season ${data.seasonVideo.seasonNumber}</b>
					</div>
					<div class="super-select-menu">
						<select>
							<c:forEach items="${data.seriesVideoNav.videoNavItemList}" var="season">
								<option value="${season.url}"&nbsp;
									<c:if test="${season.seasonNumber == data.seasonVideo.seasonNumber}"> selected="selected"</c:if>
										>Season ${season.seasonNumber}</option>
							</c:forEach>
						</select>
					</div>
				</div>
			</c:if>
			<c:if test="${fn:length(data.seriesVideoNav.videoNavItemList) < 2 && data.seasonVideo.seasonNumber > 0}">
					<tiles:insertDefinition	name="modules.section_header.black">
						<tiles:putAttribute name="title" value="Season ${data.seasonVideo.seasonNumber}" />
					</tiles:insertDefinition>
			</c:if>
		</c:when>
		<c:otherwise>
			<tiles:insertDefinition name="modules.tune_in_block">
				<tiles:putAttribute name="tunein_text" value="${data.tuneIn}" />
			</tiles:insertDefinition>
			<c:set var="seasonDefaultLinkText" value="Season ${data.seasonVideo.seasonNumber}"/>
			<c:set var="seasonLinkText" value="${(data.seasonVideo.seasonName != null) ? data.seasonVideo.seasonName : seasonDefaultLinkText}"/>
			<tiles:insertDefinition 
				name="modules.section_header.black">
				<tiles:putAttribute name="title" value="${seasonLinkText}" /></tiles:insertDefinition>
		</c:otherwise>
	</c:choose>

	
	<tiles:insertDefinition name="modules.horizontal_rule"></tiles:insertDefinition>
	
	<c:choose>
		<c:when test="${!data.seasonVideo.hasVideos }">
			<p>No videos found.</p>
		</c:when>
		<c:otherwise>
			<c:forTokens items="full,episode,webisode,behindScenes,promotion" delims="," var="key">

				<%-- 'adjust key to match the node containing the list of videos or episode wrappers' --%>
				<c:set var="section_items_key" 			value="${key}VideoList" />
				<c:set var="is_nested"					value="false" />

				<c:if test="${key == 'episode'}">
					<c:set var="section_items_key" 		value="episodeVideoViewList" />
					<c:set var="is_nested" 				value="true" />
				</c:if>

				<%-- 'coerce key into human-readable form' --%>
				<c:set var="section_title" value="${fn:replace(key, 'behindScenes', 'Behind the Scene')}s" />
				<c:set var="section_title" value="${fn:replace(section_title, 'promotion', 'Promo')}" />
				<c:set var="section_title" value="${fn:replace(section_title, 'webisode', 'Webisode')}" />
				<c:set var="section_title" value="${fn:replace(section_title, 'full', 'Free Full Episode')}" />

				<%-- 'deploy video gallery for section' --%>
				<tiles:insertTemplate template="./_section.mobile.jsp">
					<tiles:putAttribute name="is_nested" value="${is_nested}" />
					<tiles:putAttribute name="section_items" value="${data.seasonVideo[section_items_key]}" />
					<tiles:putAttribute name="section_title" value="${section_title}" />
				</tiles:insertTemplate>

			</c:forTokens>
		</c:otherwise>
	</c:choose>
	

	