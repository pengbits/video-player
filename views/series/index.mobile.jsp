	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video series
	@file			video/views/series/index.mobile.jsp
	@type			page
	@author			ncavanagh
	@desc			landing page for video series screening room "/video/series" action - logic determines page content
	--------------------------------------------------------------------------------
	--%>
	<c:catch var="exception"><c:set var="seasonVideo" value="${data.seasonVideo}"/></c:catch>
	<c:choose>
		<c:when test="${empty exception}">
			<jsp:include page="./index_series.mobile.jsp"/>
		</c:when>
		<c:otherwise>
			<jsp:include page="./index_featured.mobile.jsp"/>
		</c:otherwise>
	</c:choose>
	
	
	
