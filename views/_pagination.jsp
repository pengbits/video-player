	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/_pagination.jsp
	@type			partial
	@author			ncavanagh	
	@desc			pagination for video screening room pages
	@note			deprecated! refactored media galleri video pages used global pagination module
	--------------------------------------------------------------------------------
	--%>
	<div class="pagination">
		<c:if test="${pagination.pagesAvailable > 1}">
			<c:if test="${pagination.pageNumber != 1}">
				<a class="prev" href='<%= request.getParameter("path") %>/page/<c:out value="${pagination.pageNumber-1}" />'>Previous</span>
			</c:if>
			<c:forEach var="i" begin="${pagination.startRange}" end="${pagination.endRange}">
				<c:choose>
					<c:when test="${pagination.pageNumber != i}">
						<a class="page" href='<%= request.getParameter("path") %>/page/<c:out value="${i}" />'><c:out value="${i}" /></a>
					</c:when>
			        <c:otherwise><span class="page aktiv"><c:out value="${i}" /></span></c:otherwise>      
			    </c:choose>
			</c:forEach>
			<c:if test="${pagination.pageNumber != pagination.endRange}">
				<a class="next" href='<%= request.getParameter("path") %>/page/<c:out value="${pagination.pageNumber+1}" />'>Next</a>
			</c:if>
		</c:if>
	</div>	
	