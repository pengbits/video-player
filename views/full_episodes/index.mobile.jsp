	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <mobile>
	@project		video
	@file			video/views/full-episodes/index.mobile.jsp
	@type			page
	@author			ncavanagh
	@author			nwebb
	@modified		10.24.14
	@desc			# full-episodes video screening room
	--------------------------------------------------------------------------------
	--%>
		<tiles:insertDefinition name="modules.order_banner.home">
       <tiles:putAttribute name="banner_url" value="/sho/order/home" />
       <tiles:putAttribute name="banner_language" value="LEARN MORE" />
	   <tiles:putAttribute name="location" value="default" />
	   <tiles:putAttribute name="subheader" value="fullepisodes" />
    </tiles:insertDefinition>
	
	<c:forTokens items="fullEpisode,spotlight" delims="," var="key">

		<%-- 'adjust key to match the node containing the list of videos or episode wrappers' --%>
		<c:set var="section_items_key" 			value="${key}VideoList" />
		<c:set var="is_nested"					value="false" />
		
		<%-- 'coerce key into human-readable form' --%>
		<c:set var="section_title" value="${fn:replace(key, 'fullEpisode', 'Free Full Episodes')}" />
		<c:set var="section_title" value="${fn:replace(section_title, 'spotlight', 'Spotlight')}" />

		<%-- 'deploy video gallery for section' --%>
		<tiles:insertDefinition 
			name="modules.section_header.gradient">
			<tiles:putAttribute name="title" value="${section_title}" /></tiles:insertDefinition>
		
		<tiles:insertDefinition 
			name="modules.video_gallery.mobile">
			<tiles:putAttribute name="videos" value="${data[section_items_key]}" /></tiles:insertDefinition>
	
	</c:forTokens>
	
	<%--<div class="sampler-legal">
		<p>&#42;All qualified &#36;25 claims will be paid in the form of a &#36;25 Visa&reg; PrePaid Card. Offer expires 12/31/15. Offer available to new paid Showtime subscribers only. Limit of one Showtime offer per household in any 12 month period. Cannot be combined with any other Showtime offer.</p><br/>
		 <p> * All qualified $50 claims will be paid in the form of a $50 Visa<sup>&reg;</sup> PrePaid Card. Offer expires 11/3/14. Offer available to new paid Showtime subscribers only. Limit of one Showtime offer per household in any 12 month period. Cannot be combined with any other Showtime offer. Offer may vary by service provider.</p>
	</div>--%>
	

	