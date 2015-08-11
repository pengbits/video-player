	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video series
	@file			video/views/series/index.jsp
	@type			page
	@author			ncavanagh
	@desc			landing page for video series screening room "/video/series" action - logic determines page content
	--------------------------------------------------------------------------------
	--%>
	<c:catch var="exception"><c:set var="seasonVideo" value="${data.seasonVideo}"/></c:catch>
	<c:choose>
		<c:when test="${empty exception}">
			<!-- include: ./index_series.jsp -->
			<jsp:include page="./index_series.jsp"/>
		</c:when>
		<c:otherwise>
			<!-- include: ./index_featured.jsp -->
			<jsp:include page="./index_featured.jsp"/>
		</c:otherwise>
	</c:choose>
	
	
	
