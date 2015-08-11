	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/movies/index.mobile.jsp
	@type			page
	@author			ncavanagh	
	@desc			movies screening room mobile
	--------------------------------------------------------------------------------
	--%>
	<tiles:insertDefinition name="modules.pagination">
		<tiles:putAttribute name="p" value="${pagination}" />
		<tiles:putAttribute name="baseUrl" value="/sho/video/movies" />
	</tiles:insertDefinition>
	
	<tiles:insertDefinition 
		name="modules.video_gallery.mobile">
		<tiles:putAttribute name="videos" value="${data.pageItemList}" /></tiles:insertDefinition>

	<tiles:insertDefinition name="modules.pagination">
		<tiles:putAttribute name="p" value="${pagination}" />
		<tiles:putAttribute name="baseUrl" value="/sho/video/movies" />
	</tiles:insertDefinition>
	