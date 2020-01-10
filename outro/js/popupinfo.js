// 판매점 정보 팝업
var viewSellerInfo = function(sellerSeq, display, marketPlaceSeq) {
	marketPlaceSeq = parseInt(marketPlaceSeq);

	var url = "/shopmain/?controller=goods&methods=sellerStoryView&sellerSeq=" + sellerSeq;
	if(!isNaN(marketPlaceSeq) && marketPlaceSeq > 0) {
		url += "&marketPlaceSeq=" + marketPlaceSeq;
	}

	if(display == "Y") {
		window.open(url,'winStroyView','scrollbars=1,width=928px,height=650px,top=100,left=100');
	}
	else {
		window.open(url,'winStroyView','scrollbars=1,width=928px,height=330px,top=100,left=100');
	}
};

var viewSellerShopInfo = function(sellerSeq, qna) {
	var url = "/shopmain/?controller=goods&methods=sellerShopInfo";
	url += "&sellerSeq=" + sellerSeq;
	// qna가 Y이면 '판매점 문의하기'탭을 바로 활성화
	if (qna == true) {
		url += "&qna=Y";
	// qna가 none이면 '판매점 문의하기'탭을 비활성화
	} else if (qna == 'none') {
		url += "&qna=none";
	}

	// 팝업 가로크기
	var w = 510;
	// 팝업 세로크기
	var h = 625;

	var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

	var width = window.innnerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

	// 브라우저 창 중앙 위치
	var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;

	window.open(url, 'sellerShopInfo', 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',screenX=' + left + ',screenY' + top);
}

// 무이자 할부 정보 팝업
var viewCardInstallmentInfo = function() {
	//window.open('http://img.danawa.com/new/baropc/pop_installment.html','winPopupInfo','top=300px, left=600px, height=663px, width=513px, toolbar=false, menubar=false, statusbar=false, scrollbar=true, resizable=true');
	window.open('/shopmain/?controller=popup&methods=cardEventInfo','winPopupInfo','top=0px, left=0px, height=633px, width=513px, toolbar=false, menubar=false, statusbar=false, scrollbars=yes, resizable=false');
};

/**
 * 무이자 할부 정보 팝업
 * 정보 제공 여부 확인 후 안내 페이지 팝업
 */
var checkCardInstallmentInfo = function() {
	$.ajax({
		url : "/shopmain/?controller=popup&methods=checkCardEvent",
		success : function(data) {
			if($(data).length > 0) {
				viewCardInstallmentInfo();
			}
			else {
				alert("무이자 할부정보 업데이트 예정입니다.\n자세한 할부정보는 카드 결제창을 통해 확인 가능합니다.");
			}
		}
	});
};

/**
 * 배너 팝업 요청 시 키워드에 따라 로그를 기록한다.
 * 무이자 할부 정보 팝업
 * 정보 제공 여부 확인 후 안내 페이지 팝업
 */
var checkCardInstallmentInfoForBanner = function(keyword) {
	$.ajax({
		url : "/shopmain/?controller=popup&methods=checkCardEvent",
		success : function(data) {
			if($(data).length > 0) {
				window.open('/shopmain/?controller=popup&methods=cardEventInfo&logger_kw='+keyword+'','winPopupInfo','top=0px, left=0px, height=633px, width=513px, toolbar=false, menubar=false, statusbar=false, scrollbars=yes, resizable=false');
			}
			else {
				alert("무이자 할부정보 업데이트 예정입니다.\n자세한 할부정보는 카드 결제창을 통해 확인 가능합니다.");
			}
		}
	});
};

/**
 * 윈도우 구매시 주의사항
 */
var osInfo = function() {
	window.open('http://img.danawa.com/img/market/virtualestimate/popup_win_license.html', "license", "width=590, height=465");
};

/**
 * 조립신청 AS안내
 */
var asInfo = function () {
	var popupUrl = "http://img.danawa.com/img/market/virtualestimate/popup_assemble_as.html";
	
	// 팝업 가로크기
	var w = 575;
	// 팝업 세로크기
	var h = 700;

	var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

	var width = window.innnerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

	// 브라우저 창 중앙 위치
	var left = ((width / 2) - (w / 2)) + dualScreenLeft;
	var top = ((height / 2) - (h / 2)) + dualScreenTop;

	window.open(popupUrl, "notice", "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top + ",screenX=" + left + ",screenY" + top);
};

/**
 * 적립몰 안내
 */
var mallInfo = function () {
	window.open("http://img.danawa.com/new/estimate_new/pop_dmall_info.html", "mallInfo", "scrollbars=no,resizable=no,width=510,height=730");
};

/**
 * 온라인견적 메인 탑 배너 팝업
 */
$(document).ready(function() {
	 // 온라인견적 메인 탑 배너 팝업
	$("[id^='estimateMainTopBanner_']").click(function(e) {
		e.preventDefault();
		var popupSize = $("[id^='estimateMainTopBanner_']").attr('id').split('_');
		var url = $("[id^='estimateMainTopBanner_']").children().attr('href');
		window.open(url, "popup", 'width=' + popupSize[1] + ',height=' + popupSize[2] + 'fullscreen=yes scrollbars=yes');
	});
});