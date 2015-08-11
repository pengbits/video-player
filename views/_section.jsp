	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		global
	@file			video/views/_video_section.jsp
	@type			tile
	@author			ncavanagh
	@author			dpaul
	@modified		04.25.14
	@desc			# _video_section partial: used in movies, comedy reality/docs sections
	@note			# one of few (only?) cases where we defensively check for empty collections before drawing the gallery.
	@note			# the pagination object that's used here is in global scope for these pages, so it doesn't need to be passed via attribute, as would be typical..
	@note			# use of multiview to supply pagination to media gallery is starting to feel extremely kludgy, but it does make for consistent treatment
	--------------------------------------------------------------------------------
	--%>
	<tiles:useAttribute name="path" 			ignore="true"/>
	<tiles:useAttribute name="videos" 			ignore="true"/>
	<tiles:useAttribute name="sectionTitle" 	ignore="true"/>
	<c:set var="sectionTitle"					value="${!empty sectionTitle && sectionTitle != 'null' ? sectionTitle : '' }" />
	<tiles:useAttribute name="include_head"		ignore="true" />
	<tiles:useAttribute name="include_footer"	ignore="true" />
	
	<c:choose>
	<c:when test="${!empty videos}">

	<tiles:insertDefinition 
		name="modules.multiview">
		<tiles:putAttribute name="include_head"				value="${include_head}" />
		<tiles:putAttribute name="include_footer"			value="${include_footer}" />
		<tiles:putAttribute name="pagination"				value="${pagination}" />
		<tiles:putAttribute name="pagination_base_url"		value="${path}" />
		<tiles:putAttribute name="states" 					value="images" />
		
		<tiles:putAttribute name="images">
			<tiles:insertDefinition name="modules.media_galleri.video_section">
				<tiles:putAttribute name="items" 			value="${videos}" />
				<tiles:putAttribute name="section_title" 	value="${sectionTitle}" />
			</tiles:insertDefinition>
		</tiles:putAttribute>
	</tiles:insertDefinition>

	</c:when>
	<c:otherwise>

	<div class="group-header"><h2>No videos found.</h2></div>
	
	</c:otherwise>
	</c:choose>
