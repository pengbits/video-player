	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/sports/index.mobile.jsp
	@type			page
	@author			ncavanagh	
	@desc			sports screening room mobile
	--------------------------------------------------------------------------------
	--%>
	<c:catch var="exception"><c:set var="seasonVideo" value="${data.seasonVideo}"/></c:catch>
	<c:choose>
		<c:when test="${empty exception}">
			<!-- include: ./index_series.jsp -->
			<jsp:include page="./index_series.mobile.jsp"/>
		</c:when>
		<c:otherwise>
			<!-- include: ./index_events.jsp -->
			<jsp:include page="./index_events.mobile.jsp"/>
		</c:otherwise>
	</c:choose>