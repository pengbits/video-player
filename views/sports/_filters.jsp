	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			/views/sports/_filters.jsp
	@type			partial
	@author			ncavanagh	
	@desc			Loaded before meta jsp is drawn, this our chance to override xml properties with dynamic data.
	@desc			used here to populate the title and description
	--------------------------------------------------------------------------------
	--%>
	<c:choose>
		<c:when test="${data.series != null}">
			<c:set var="seriesNameLowercase" value="${fn:toLowerCase(data.series.displayTitle)}"/>
			<c:choose>
				<c:when test="${data.seasonVideo.seasonNumber != null}">
					<c:set var="seasonTracking" value="Season ${data.seasonVideo.seasonNumber}"/>
					<c:set var="seasonTracking" value="${(data.seasonVideo.seasonName != null) ? data.seasonVideo.seasonName : seasonTracking }"/>
					<c:set var="title" value="${title} : ${data.series.displayTitle} : ${seasonTracking}" scope="request" />
					<c:set var="pageTracking" value="${pageTracking}:${seriesNameLowercase}:season ${data.seasonVideo.seasonNumber}" scope="request" />
				</c:when>
				<c:otherwise>
					<c:set var="title" value="${title} : ${data.series.displayTitle}" scope="request" />
					<c:set var="pageTracking" value="${pageTracking}:${seriesNameLowercase}" scope="request" />
				</c:otherwise>
			</c:choose>
		</c:when>
		<c:otherwise>
			<c:set var="title" value="${title} : ${data.seriesNav.selectedNavItem.displayTitle} : ${data.seriesVideoNav.selectedVideoNavItem.seasonName}" scope="request" />
			<c:set var="eventCategoryNameLowercase" value="${fn:toLowerCase(data.seriesNav.selectedNavItem.displayTitle)}"/>
			<c:set var="eventNameLowercase" value="${fn:toLowerCase(data.seriesVideoNav.selectedVideoNavItem.seasonName)}"/>


			<c:set var="eventNameLowercase" value="${fn:replace(eventNameLowercase, ':', '')}" />
			<c:set var="pageTracking" value="${pageTracking}:${eventCategoryNameLowercase}:${eventNameLowercase}" scope="request" />
		</c:otherwise>
	</c:choose>
	