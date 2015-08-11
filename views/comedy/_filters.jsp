	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			/views/comedy/_filters.jsp
	@type			partial
	@author			ncavanagh	
	@desc			Loaded before meta jsp is drawn, this our chance to override xml properties with dynamic data.
	@desc			used here to populate the title and description
	--------------------------------------------------------------------------------
	--%>
	<c:if test="${contentGroup != null}">
		<c:set var="contentTitleCase" value="${fn:toUpperCase(fn:substring(contentGroup, 0, 1))}${fn:toLowerCase(fn:substring(contentGroup, 1, -1))}"/>
		<c:set var="title" value="${title} : ${contentTitleCase}" scope="request" />
		<c:set var="pageTracking" value="${pageTracking}:${contentGroup}" scope="request" />
	</c:if>
	