	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%--

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			video/views/_cross_platform_test.jsp
	@type			partial
	@author			ncavanagh	
	@desc			
	--------------------------------------------------------------------------------
	--%>
    <style>
    /* styles borrowed from mobile for the sake of presentation */
    .video-gallery .vg-wrapper {
      background-color: #222222;
      width: 99%; 
      max-width: 400px; /* added for desktop's sake */
      margin-bottom: 2%;
    }

    .video-gallery .vg-thumb-link {
      position: relative;
      display: block;
    }

    .video-gallery .vg-thumb-link img {
      width: 100%;
    }

    .video-gallery .vg-thumb-link .vg-play-button {
      position: absolute;
      width: 100%;
      top: 0;
      left: 0;
    }

    .video-gallery .vg-wrapper .vg-text-link {
      display: block;
      color: #b7b7b7;
      line-height: 15px;
      height: 40px;
      background: transparent url(/assets/images/lib/mobile/video-gallery/disclosure-arrow.png) no-repeat 95% 11px;
    }

    .video-gallery .vg-wrapper .vg-text-link em {
      display: block;
      padding: 5px 30px 0px 9px;
      height: 30px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    </style>
    
	
    <tiles:insertDefinition name="modules.pixels_via_url_params" />
    
    <p style="padding:20px 10px"><a href="http://qa2.showtime.com/#/login?i_cid=kevin-global-6-23">http://qa2.showtime.com/#/login?i_cid=kevin-global-6-23</a></p>
    
	<div class="video-gallery">
		<ul class="group">
			<li>
				<div class="vg-wrapper">
                    <a class="vg-thumb-link" href="/sho/video/titles/15025/intent" data-behavior="${videoBehavior}" data-mobile-url="http://once.unicornmedia.com/now/od/auto/c51aadc1-5f80-4ad9-9d3d-164a8f7190fa/23012646-484c-4786-995f-049fcc26074d/09c507ab-f790-438e-bc5b-1ad0d1cd36a3/content.once?UMBEPARAMproduct=mobileweb&amp;UMBEPARAMplatform=shocom" data-video-id="15025" data-video-age-gate="0" data-click-id="intent">
					    <img class="vg-image" src="http://www.sho.com/site/image-bin/images/748_2_139106/748_2_139106_eps01_320x180.jpg" alt="video still">
						<img class="vg-play-button" src="/assets/images/lib/mobile/video-gallery/play-button_198x110.png">
					</a>
				</div>
			</li>
		</ul>
	</div>
	<div class="video-gallery">
		<ul class="group">
			<li>
				<div class="vg-wrapper">
					<a class="vg-thumb-link" href="/sho/video/titles/14695/drug-bust" data-behavior="${videoBehavior}" data-mobile-url="http://once.unicornmedia.com/now/od/auto/c51aadc1-5f80-4ad9-9d3d-164a8f7190fa/23012646-484c-4786-995f-049fcc26074d/2e32bc20-a228-4b9d-90ab-cb2a032e3847/content.once?UMBEPARAMproduct=mobileweb&amp;UMBEPARAMplatform=shocom" data-video-id="14695" data-video-age-gate="18" data-click-id="drug bust">
						<img class="vg-image" src="http://www.sho.com/site/image-bin/images/748_2_137293/748_2_137293_eps01_320x180.jpg" alt="video still">
						<img class="vg-play-button" src="/assets/images/lib/mobile/video-gallery/play-button_198x110.png">
					</a>
				</div>
			</li>
		</ul>
	</div><div class="video-gallery">
		<ul class="group">
			<li>
				<div class="vg-wrapper">
                    <a class="vg-thumb-link" href="/sho/video/titles/34031/shameless-season-5-premiere" data-behavior="${videoBehavior}" data-mobile-url="http://once.unicornmedia.com/now/od/auto/c51aadc1-5f80-4ad9-9d3d-164a8f7190fa/23012646-484c-4786-995f-049fcc26074d/2d765d72-0992-49cb-a820-fe1b561dda89/content.once?UMBEPARAMproduct=mobileweb&UMBEPARAMplatform=shocom&UMAID-0-0=housead1" data-video-id="34031" data-video-age-gate="0" data-click-id="shameless full episode">
					    <img class="vg-image" src="http://www.sho.com/site/image-bin/images/408_5_3410405/408_5_3410405_ful02_320x180.jpg" alt="video still">
						<img class="vg-play-button" src="/assets/images/lib/mobile/video-gallery/play-button_198x110.png">
					</a>
				</div>
			</li>
		</ul>
	</div>
    
    
    
    
	