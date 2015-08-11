	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/sports/index.jsp
	@type			page
	@author			ncavanagh	
	@desc			sports screening room
	--------------------------------------------------------------------------------
	--%>
	<c:choose>
		<c:when test="${data.series != null}">
			<!-- include: ./index_series.jsp -->
			<jsp:include page="./index_series.jsp" />
		</c:when>
		<c:otherwise>
			<!-- include: ./index_events.jsp -->
			<jsp:include page="./index_events.jsp" />
		</c:otherwise>
	</c:choose>