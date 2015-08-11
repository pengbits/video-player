	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video section navigation
	@file			video/views/series/_section_navigation.jsp
	@type			partial
	@author			ncavanagh
	@desc			in-page drop-down navigation for video series and video sports sections
	--------------------------------------------------------------------------------
	--%>
	<tiles:importAttribute name="video_section" />
	<tiles:importAttribute name="video_secondary_list" ignore="true"/>
	<tiles:importAttribute name="video_secondary_selected_item" ignore="true"/>
    
	<div class="${video_section}-video-navigation clearfix">
		<c:catch var="exception"><c:set var="primaryVideoList" value="${data.seriesNav.itemList}"/></c:catch>
		<c:if test="${empty exception}">
			<c:if test="${fn:length(primaryVideoList) > 1}">
				<div id="video-series-nav" class="dropdown clearfix"></div>
				<c:set var="selectedTitle" value="${!empty data.seriesNav.selectedNavItem.shortTitle ? data.seriesNav.selectedNavItem.shortTitle : 'Featured'}"/>
				<script type="text/javascript">
					sho.provide('sho.video.series.nav');
					sho.video.series.nav = {
						'container' : 'video-series-nav',
						'title' : '${selectedTitle}',
						'section' : '${video_section}',
						'seriesList' : $H({
							<c:if test="${video_section == 'series'}">"Featured":"/sho/video/series",</c:if>
							<c:forEach items="${primaryVideoList}" var="item" varStatus="i">
							"${item.shortTitle}":"${item.url}"
							<c:if test="${!i.last}">,</c:if></c:forEach>
						})
					};
				</script>
			</c:if>
		</c:if>
		<c:if test="${video_secondary_list != null}">
			<c:if test="${fn:length(video_secondary_list) > 1}">
				<div id="video-series-season-nav" class="dropdown clearfix"></div>
				<c:set var="selectedTitle" value="Season ${video_secondary_selected_item.seasonNumber}"/>
				<c:set var="selectedTitle" value="${(video_secondary_selected_item.seasonName != null) ? video_secondary_selected_item.seasonName : selectedTitle }"/>
				<script type="text/javascript">
					sho.provide('sho.video.series.season.nav');
					sho.video.series.season.nav = {
						'container' : 'video-series-season-nav',
						'title' :  '${selectedTitle}',
						'seasonList' : $H({
							<c:forEach items="${video_secondary_list}" var="item" varStatus="i">
							<c:set var="seasonDefaultLinkText" value="Season ${item.seasonNumber}"/>
							<c:set var="seasonLinkText" value="${(item.seasonName != null) ? item.seasonName : seasonDefaultLinkText}"/>
							"${seasonLinkText}":"${item.url}"
							<c:if test="${!i.last}">,</c:if></c:forEach>
						})
					};
				</script>
			</c:if>
		</c:if>
	</div>

	