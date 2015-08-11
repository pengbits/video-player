	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %><%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %><%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %><%-- 

	JSP
	--------------------------------------------------------------------------------
	@site			sho.com <rebuild>
	@project		video
	@file			/views/movies/_filters.jsp
	@type			partial
	@author			dpaul	
	@desc			Loaded before meta jsp is drawn, this our chance to override xml properties with dynamic data.
	@desc			used here to set the nitro category
	--------------------------------------------------------------------------------
	--%>
	<c:set var="nitro_category" value="movies" scope="request" />