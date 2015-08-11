	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			/views/series/_filters.jsp
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
					<c:set var="title" value="${title} : ${data.series.displayTitle} : Season ${data.seasonVideo.seasonNumber}" scope="request" />
					<c:set var="pageTracking" value="${pageTracking}:${seriesNameLowercase}:season:${data.seasonVideo.seasonNumber}" scope="request" />
				</c:when>
				<c:otherwise>
					<c:set var="title" value="${title} : ${data.series.displayTitle}" scope="request" />
					<c:set var="pageTracking" value="${pageTracking}:${seriesNameLowercase}" scope="request" />
				</c:otherwise>
			</c:choose>
		</c:when>
		<c:otherwise>
			<c:set var="title" value="${title} : Featured" scope="request" />
			<c:set var="pageTracking" value="${pageTracking}:featured" scope="request" />
		</c:otherwise>
	</c:choose>
	