var iframeTool = {
	resize : function(obj) {
		var width = 0;
		var height = 0;
		if(document.all) {
			var iobj = obj.contentWindow.document.body;
			width = iobj.scrollWidth + (iobj.offsetWidth - iobj.clientWidth);
			height = iobj.scrollHeight + (iobj.offsetHeight - iobj.clientHeight);
		} else {
			width = jQuery(obj.contentDocument).width();
			height = jQuery(obj.contentDocument).height();
		}

		if(arguments.length == 3) {
			if (arguments[1] == 'w') {
				width	= (width + arguments[2]) + 'px';
			} else if (arguments[1] == 'h') {
				height	= (height + arguments[2]) + 'px';
			}//end if
		}

		jQuery(obj).css({
			'width' : width,
			'height' : height
		});
	}
};