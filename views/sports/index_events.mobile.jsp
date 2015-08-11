	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/sports/index_events.mobile.jsp
	@type			page
	@author			ncavanagh	
	@desc			sports events video screening room
	--------------------------------------------------------------------------------
	--%>
	<c:if test="${fn:length(data.seriesNav.itemList) > 1}">		
		<div data-component="sho.ui.mobile.SuperSelect" class="super-select clearfix">
			<div class="super-select-label">
				<b>${data.seriesNav.selectedNavItem.displayTitle}</b>
			</div>
			<div class="super-select-menu">
				<select>
					<c:forEach items="${data.seriesNav.itemList}" var="item">
						<option value="${item.url}"&nbsp;
							<c:if test="${item.displayTitle == data.seriesNav.selectedNavItem.displayTitle}"> selected="selected"</c:if>
								>${item.displayTitle}</option>
					</c:forEach>
				</select>
			</div>
		</div>
	</c:if>
	<c:if test="${fn:length(data.seriesVideoNav.videoNavItemList) > 1}">		
		<div data-component="sho.ui.mobile.SuperSelect" class="super-select clearfix">
			<c:set var="seasonDefaultText" value="Season ${data.seriesVideoNav.selectedVideoNavItem.seasonNumber}"/>
			<c:set var="seasonText" value="${(data.seriesVideoNav.selectedVideoNavItem.seasonName != null) ? data.seriesVideoNav.selectedVideoNavItem.seasonName : seasonDefaultText}"/>
			<div class="super-select-label">
				<b>${seasonText}</b>
			</div>
			<div class="super-select-menu">
				<select>
					<c:forEach items="${data.seriesVideoNav.videoNavItemList}" var="item">
						<c:set var="seasonDefaultLinkText" value="Season ${item.seasonNumber}"/>
						<c:set var="seasonLinkText" value="${(item.seasonName != null) ? item.seasonName : seasonDefaultLinkText}"/>
						<option value="${item.url}"&nbsp;
							<c:if test="${item.seasonName == data.seriesVideoNav.selectedVideoNavItem.seasonName}"> selected="selected"</c:if>
								>${seasonLinkText}</option>
					</c:forEach>
				</select>
			</div>
		</div>
	</c:if>

	<tiles:insertDefinition 
		name="modules.video_gallery.mobile">
		<tiles:putAttribute name="videos" value="${data.videoList}" /></tiles:insertDefinition>