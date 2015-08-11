	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/series/_section.mobile.jsp
	@type			page
	@author			dpaul
	@modified		09.07.12
	@desc			# a building block of the video section pages - combines a section header and optional
	@desc			# description block with a video-gallery
	--------------------------------------------------------------------------------
	--%>
	<tiles:importAttribute name="section_items" />
	<tiles:importAttribute name="is_nested" ignore="true" />
	<tiles:importAttribute name="section_title" ignore="true" />
	
	<c:if test="${is_nested}">
	<c:forEach items="${section_items}" var="item">
		<c:if test="${fn:length(item.videoList) > 0}">
			<tiles:insertDefinition 
				name="modules.section_header.small">
				<tiles:putAttribute name="title" value="Episode ${item.episodeNumber}: ${item.displayTitle}" /></tiles:insertDefinition>

			<p class="episode-description">${item.shortDescription}</p>

			<tiles:insertDefinition 
				name="modules.video_gallery.mobile">
				<tiles:putAttribute name="videos" value="${item.videoList}" /></tiles:insertDefinition>
		</c:if>
	</c:forEach>
	</c:if>
	<c:if test="${!is_nested}"><%-- '<<-- curses the creators of JSTL for the thousandth time' --%>
		<c:if test="${!empty section_items}">
		
		<c:if test="${section_title != 'null'}">
			<tiles:insertDefinition 
				name="modules.section_header.small">
				<tiles:putAttribute name="title" value="${section_title}" /></tiles:insertDefinition>
		</c:if>
		
		<tiles:insertDefinition 
			name="modules.video_gallery.mobile">
			<tiles:putAttribute name="videos" value="${section_items}" /></tiles:insertDefinition>
	
		</c:if>
	</c:if>