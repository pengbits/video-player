	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/movies/index.jsp
	@type			page
	@author			ncavanagh	
	@desc			movies screening room
	--------------------------------------------------------------------------------
	--%>
	<tiles:insertDefinition name="video_section">
		<tiles:putAttribute name="path" value="/sho/video/movies" />
		<tiles:putAttribute name="videos" value="${data.pageItemList}" />
	</tiles:insertDefinition>