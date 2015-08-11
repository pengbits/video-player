	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/series/index_featured.mobile.jsp
	@type			page
	@author			ncavanagh	
	@desc			featured series video screening room
	--------------------------------------------------------------------------------
	--%>

	<div data-component="sho.ui.mobile.SuperSelect" class="super-select">
		<div class="super-select-label">
			<b>Featured</b>
		</div>
		<div class="super-select-menu">
			<select>
				<option value="/sho/video/series" selected="selected">Featured</option>
				<c:forEach items="${data.seriesNav.itemList}" var="item">
					<option value="${item.url}">${item.shortTitle}</option>
				</c:forEach>
			</select>
		</div>
	</div>	

	<tiles:insertDefinition 
		name="modules.video_gallery.mobile">
		<tiles:putAttribute name="videos" value="${data.videoList}" /></tiles:insertDefinition>