	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/sports/index_events.jsp
	@type			page
	@author			ncavanagh	
	@desc			sports event-specific video screening room
	--------------------------------------------------------------------------------
	--%>
	<tiles:insertDefinition name="video_navigation">
		<tiles:putAttribute name="video_section" value="sports" />
		<tiles:putAttribute name="video_secondary_list" value="${data.seriesVideoNav.videoNavItemList}" /> 
		<tiles:putAttribute name="video_secondary_selected_item" value="${data.seriesVideoNav.selectedVideoNavItem}" /> 
	</tiles:insertDefinition>
	
	<tiles:insertDefinition name="video_section">
		<tiles:putAttribute name="path" value="/sho/video/sports" />
		<tiles:putAttribute name="videos" value="${data.videoList}" />
	</tiles:insertDefinition>