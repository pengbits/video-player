	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/full_episodes/index.jsp
	@type			page
	@author			ncavanagh	
	@desc			full episodes video screening room, PCE driven
	--------------------------------------------------------------------------------
	--%>
	<jsp:include page="/lib/views/pixels/_pixel_google.jsp">
		<jsp:param name='googleConversionLabel' value='edF8CMSI2gIQtrK25wM' />			
	</jsp:include>
	<jsp:include page="/lib/views/pixels/_pixel_doubleclick.jsp">
		<jsp:param name='doubleclickTagUrl' value='http://fls.doubleclick.net/activityi;src=2201481;type=acqui412;cat=sampl074;ord=' />			
	</jsp:include>
	<jsp:include page="/lib/views/pixels/_pixel_33across.jsp">
		<jsp:param name='pixel33acrossUrl' value='http://pixel.33across.com/ps/?pid=237&amp;cgn=15427&amp;seg=22920' />			
	</jsp:include>
	
	<div class="order-banner">
		<div class="copy">Sample the best of Showtime before you subscribe!</div>
		ORDER NOW &nbsp; <a class="learn-more" href="/sho/order/home" data-behavior="track-click" data-click-id="link_order"><img class="arrow" src="/assets/images/order/doubleRed.png" />LEARN MORE</a><img class="or" src="/assets/images/order/or-graphic_78x59.png" />Call 1-866-465-SHOW
	</div>
	<div class="order-divider"></div>
	<%-- <div class="order-banner">
		<div class="copy">Sample the best of Showtime before you subscribe!</div>
		<span class = "fifty-fullepisodes">ORDER NOW <span class ="and-you">and you can get </span> <strong>$50 CASH BACK!<sup>*</sup></strong></span>&nbsp;&nbsp;<a class="learn-more" href="/sho/order/home" data-behavior="track-click" data-click-id="link_order"><img class="arrow" src="/assets/images/order/doubleRed.png" />LEARN MORE</a><img class="or" src="/assets/images/order/50-rebate/or-graphic-fifty-desktop.png" />Call 1-866-465-SHOW
	</div> --%>
	<tiles:insertDefinition name="modules.media_galleri.video_section">
		<tiles:putAttribute name="items" 			value="${data.fullEpisodeVideoList}" />
		<tiles:putAttribute name="section_title" 	value="Free Full Episodes" />
	</tiles:insertDefinition>
	
	<tiles:insertDefinition name="modules.media_galleri.video_section">
		<tiles:putAttribute name="items" 			value="${data.spotlightVideoList}" />
		<tiles:putAttribute name="section_title" 	value="Spotlight" />
	</tiles:insertDefinition>
	
	<%--
	<div class="sampler-legal">
		<p>&#42;All qualified &#36;25 claims will be paid in the form of a &#36;25 Visa&reg; PrePaid Card. Offer expires 12/31/15. Offer available to new paid Showtime subscribers only. Limit of one Showtime offer per household in any 12 month period. Cannot be combined with any other Showtime offer.</p>
	</div>
	 <div class="sampler-legal">
		<p>&#42; All qualified $50 claims will be paid in the form of a $50 Visa<sup>&reg;</sup> PrePaid Card. Offer expires 11/3/14. Offer available to new paid Showtime subscribers only. Limit of one Showtime offer per household in any 12 month period. Cannot be combined with any other Showtime offer. Offer may vary by service provider.</p>
	</div>--%>