var openEstimateInfo = function(actionName) {
	var codeList = new Array();
	var quantityList = new Array();
	var ifrmWish = $('#ifrmWish').contents().find("#wish_product_list");

	$(ifrmWish).find("[name='code[]']").each(function(loop) {
		codeList[loop] = $(this).val();
		quantityList[loop] = $(this).parent().find("[name='quantity[]']").val();
	});

	if(codeList.length == 0) {
		alert('선택한 상품이 하나 이상 있어야 합니다.');
	} else {
		var url = "/virtualestimate/?controller=estimateMain&methods=estimateByExternalGoodsInfo&productSeqList=" + codeList.join(',') + "&quantityList=" + quantityList.join(',');

		if($("[name='marketPlaceSeq']")) {
			url += "&marketPlaceSeq=" + $("[name='marketPlaceSeq']").val();
		}

		if(typeof actionName != 'undefined') {
			url += '&type=' + actionName;
		}

		// 견적 상담/문의 클릭 시
		if(actionName =='counsel') {
			window.top.location.href = iframeLink + location.protocol + '//' + location.host + encodeURIComponent(url);
		} else {
			var option = 'top=100px, left=100px, height=800px, width=1100px, scrollbars=yes';

			// 견적캡쳐 클릭 시
			if(actionName == 'capture') {
				option = 'top=100px, left=100px, height=630px, width=820px, scrollbars=yes';
			}
			else if(actionName == 'print') {
				option = 'width=990px,height=610px,scrollbars=yes';
			}
			window.open(url, 'external', option);
		}
	}
	return;
};

var iframeSlrTool = {
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

        if($(obj).attr('id') == 'ifrmProduct') {
            var productHeight = $('#ifrmWish').height() - $('#ifrmSearchOption').height() - 25;

            // iframe size
            $(obj).css({
                'width' : width,
                'height' : productHeight + 15 +'px'
            });

            productHeight = productHeight - ($(obj).contents().find('div.content_estimate2 div.text_img_view div.btm_box').height() + 160);

            $(obj).contents().find('div.content_estimate2 div.text_img_view div.scroll_box').css({
                'width' : width,
                'height' : productHeight + 'px'
            });
        } else {
            jQuery(obj).css({
                'width' : width,
                'height' : height
            });
        }
    }
};

var iframeResize = function(obj) {
	$(obj).height("0px");
//	iframeSlrTool.resize(obj);
	iframeTool.resize(obj);
};