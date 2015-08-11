	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/comedy/index.jsp
	@type			page
	@author			ncavanagh	
	@desc			comedy screening room
	--------------------------------------------------------------------------------
	--%>
	<c:choose>
		<c:when test="${contentGroup != null}">
			<c:if test="${contentGroup == 'movies'}"><c:set var="currentComedyGroup" value="1"/></c:if>
			<c:if test="${contentGroup == 'specials'}"><c:set var="currentComedyGroup" value="2"/></c:if>
		</c:when>
		<c:otherwise><c:set var="currentComedyGroup" value="0"/></c:otherwise>
	</c:choose>


	<tiles:insertDefinition name="video_section">
		<tiles:putAttribute name="videos" value="${data.pageItemList}" />
		<tiles:putAttribute name="path" value="/sho/video/comedy" />
	</tiles:insertDefinition>
