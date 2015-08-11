	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/series/index_featured.jsp
	@type			page
	@author			ncavanagh	
	@desc			featured series video screening room
	--------------------------------------------------------------------------------
	--%>
	<tiles:insertDefinition name="video_navigation">
		<tiles:putAttribute name="video_section" value="series" />
	</tiles:insertDefinition>

	<tiles:insertDefinition name="video_section">
		<tiles:putAttribute name="videos" value="${data.videoList}" />
		<tiles:putAttribute name="path" value="/sho/video/series" />
	</tiles:insertDefinition>
