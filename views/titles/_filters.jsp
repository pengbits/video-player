	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			titles/views/_filters.jsp
	@type			partial
	@author			dpaul	
	@desc			Loaded before meta jsp is drawn, this our chance to override xml properties with dynamic data.
	@desc			used here to populate the title and description
	--------------------------------------------------------------------------------
	--%>
	<tiles:insertDefinition name="filters.base" />
	<c:choose>
	<c:when test="${!empty data.video}">
		<c:set var="title" value="${data.video.title}" scope="request" />
		<c:set var="description" value="${data.video.description}" scope="request" />
		<c:set var="og_type" value="movie" scope="request"/>
		<c:if test="${pageTracking != 'false'}">
			<c:set var="sanitized_videoTitle" value="${fn:replace(data.video.title, ':', ' ')}" />
			<c:set var="pageTracking" value="video:titles:${sanitized_videoTitle}" scope="request" />
		</c:if>
		<c:if test="${!empty data.video.image}">
			<c:set var="og_image_path" value="${fn:replace(data.video.image.path, '640x360', '246x246')}" />
			<c:set var="og_image_path" value="${fn:replace(og_image_path, '160x90', '246x246')}" />
			<c:set var="og_image" value="http://www.sho.com${og_image_path}" scope="request" />
		</c:if>
	</c:when>
	<c:otherwise>
		<c:set var="title" value="Videos" scope="request" />
		<c:set var="description" value="Showtime, the leader in premium cable television - schedule information, original video content, episode guides, contests, and more!" scope="request" />
	</c:otherwise>
	</c:choose>