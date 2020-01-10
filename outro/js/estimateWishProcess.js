/**
 * 프레임 function 정의
 *  wish iframe.
 *  jquery 에서 iframe 관련 작동이 firefox 에서 이상함.
 */
var productFrameContent;
try{
	productFrameContent = parent.document.getElementById("ifrmProduct").contentWindow;
}catch(e){}

/**
 * 상품코드 리스트를 반환
 * 상품리스트에서 버튼 선택시에 사용함.
 */
var getCodeList=function(){
	var codeList = new Array();
	$("#wish_product_list").find("[name='code[]']").each(function(loop){
		codeList[loop] = $(this).val();
	});
	return codeList;
};

var genWishManual = function(codeLength) {
	if(codeLength == 0) {
		var strHtml = [];
		strHtml.push('<div class="before_select_layer" style="height:465px;">');
		strHtml.push('	<div class="hide_txt">');
		strHtml.push('		<p class="hide_txt">선택하신 상품이 없습니다. 상품을 선택해 주세요.</p>');
		strHtml.push('		<dl>');
		strHtml.push('			<dt class="hide_txt">온라연 견적서 이용방법</dt>');
		strHtml.push('			<dd class="hide_txt">step1. 품목 선택</dd>');
		strHtml.push('			<dd class="hide_txt">step2. 왼편 목록의 상품비교 or 선택</dd>');
		strHtml.push('			<dd class="hide_txt">step3. 견적비교 or 구매신청</dd>');
		strHtml.push('		</dl>');
		strHtml.push('	</div>');
		strHtml.push('</div>');

		$('.tbl_list2_area').prepend(strHtml.join(''));
	} else {
		if($('.tbl_list2_area').find('.before_select_layer').length > 0) {
			$('.tbl_list2_area').find('.before_select_layer').remove();
		}
	}
};

/**
 * 합계금액
 */
var computeTotalPrice=function(){
	var totalPrice = 0; // 전체 합계 금액
	var eqPrice = 0; // 카테고리 상품 금액
	var totalPoint = 0;
	var strTarget='price';
	if($("[name='pseq']").val() == 1) {
		strTarget = 'cardPrice';
	}

	if($("#wish_product_list").find("[name='code[]']").length>0){
		$("#wish_product_list").find("[name='code[]']").each(function() {
			var targetObj = $(this).parent();
			eqPrice = targetObj.find("[name='"+strTarget+"[]']").val() * targetObj.find("[name='quantity[]']").val(); // 최저가*수량
			$(targetObj).parent().find(".price").html(NumberComma.number_format(eqPrice));
			totalPrice += eqPrice;
			
			// 적립금 있을 경우
			if(targetObj.find("[name='earnPoint[]']") && targetObj.find("[name='earnPoint[]']").length > 0) {
				var point = targetObj.find("[name='earnPoint[]']").val() * targetObj.find("[name='quantity[]']").val();
				$(targetObj).parent().find(".point").html(NumberComma.number_format(point));
				totalPoint += point;
			}
		});
	}
	
	// 총 적립금 표시
	if($("#totalPoint")) {
		$("#totalPoint").find("em").html(NumberComma.number_format(totalPoint));
	}
	// 총합계금액 표시
	$("#totalPrice").html('<strong>' + NumberComma.number_format(totalPrice) + '</strong>원');
};

/**
 * 상품개수
 */
var modifyProductCount = function() {
	$('.box_total').find('.point_cl_01').text(getCodeList().length);
};

/**
 * 수량 조회
 */
var getProductQuantity = function (productCode) {
	var resultValue = $('#wishList_' + productCode).find("input:text[name='quantity[]']").val();
	return resultValue;
}

/**
 * 수량 수정
 */
var modifyProductQuantity=function(productCode, quantity){
	if(isNaN($("#wishList_"+productCode).find("input:text[name='quantity[]']").val())){
		alert('숫자만 입력가능 합니다.');
		$("#wishList_"+productCode).find("input:text[name='quantity[]']").focus();
		$("#wishList_"+productCode).find("input:text[name='quantity[]']").val(0);
		return;
	}

	var  isModifyQuantity = parseInt($("#wishList_"+productCode).find("input:text[name='quantity[]']").val())+parseInt(quantity)>0;
		 isModifyQuantity = isModifyQuantity && parseInt($("#wishList_"+productCode).find("input:text[name='quantity[]']").val())+parseInt(quantity)<1000;

	if(isModifyQuantity){
	    var wishProductListObj = $("#wishList_"+productCode);
		wishProductListObj.find("input:text[name='quantity[]']").val( parseInt(wishProductListObj.find("input:text[name='quantity[]']").val()) + parseInt(quantity)); // 수량 변경
	}
	computeTotalPrice();
};

/**
 * wish save form 호출
 */
var openWishSaveForm=function(marketPlaceSeq){
	if(checkProductSelect()) {
		var popupSize = "";
		if($(".dmall").length > 0) {
			popupSize = "width=400,height=350,";
		}
		else {
			popupSize = "width=455,height=530,";
		}
		window.open("/virtualestimate/?controller=estimateMain&methods=wishSaveForm&marketPlaceSeq="+marketPlaceSeq,'wishSaveForm',popupSize+"resizable=false,scrollbars=yes");
	}
};

/**
 * 견적인쇄
 */
var openWishPrint=function(marketPlaceSeq,folderSeq,mode){
	// 팝업창
	window.open('','wishPrint',"width=950, height=913, scrollbars=yes, status=no, resizable=yes");
	
	// 견적 저장 후 returnUrl
	var url = "/virtualestimate/?controller=estimateMain&methods=wishPrint&marketPlaceSeq="+marketPlaceSeq+"&folderSeq="+folderSeq;
	if(mode == "email") {
		url += "&mode=email";
	}
	if($("[name='sellerSeq']")!=null) {
		url += "&sellerSeq=" + $("[name='sellerSeq']").val();
	}
	// submit
	document.wishForm.target='wishPrint';
	document.wishForm.returnUrl.value=url;
	document.wishForm.action='?controller=estimateMain&methods=wishSave';
	document.wishForm.submit();
	// submit 이후에 다시 변경
	document.wishForm.target='ifrFormSumit';
	document.wishForm.returnUrl.value='NotMove';
};

/**
 * 견적 인쇄 및 이메일 발송
 */
var locationWishPrint = function(mode) {
	var marketPlaceSeq = $("[name='marketPlaceSeq']").val();
	var folderSeq = $("[name='folderSeq']").val();

	openWishPrint(marketPlaceSeq,folderSeq,mode);
};

/**
 * 쇼핑몰별 견적비교 이동
 */
var moveEstimateShop=function(marketPlaceSeq){
	if( !($("[name='code[]']").length > 0) ) {
		alert("선택한 상품이 하나 이상 있어야 합니다.");
		return;
	}

	var returnUrl = document.wishForm.returnUrlBack.value+'&pseq='+$("[name='pseq']").val();

	if(typeof parent.document.indexForm.externalType != 'undefined') {
		returnUrl += '&externalType='+parent.document.indexForm.externalType.value;
		$('<input>').attr({type:'hidden', name:'externalYN', value:'Y'}).appendTo(document.wishForm);
	}

	document.wishForm.returnUrl.value=returnUrl;
	document.wishForm.target='ifrFormSumit';
	document.wishForm.action='?controller=estimateMain&methods=wishSave';
	document.wishForm.submit();
};

/**
 * 미니샵 이동
 */
var moveMiniShop=function(marketPlaceSeq, sellerSeq){
	// directYN, sellerSeq 설정 후 쇼핑몰별 견적비교로 이동시 미니샵으로 이동
	document.wishForm.returnUrl.value = document.wishForm.returnUrlBack.value + "&directYN=Y&sellerSeq=" + sellerSeq;
	document.wishForm.target = '_blank';
	document.wishForm.action='?controller=estimateMain&methods=wishSave';
	document.wishForm.submit();
};

/**
 * 스텔스, 딜러몰 주문전 구매제한 체크
 */
var moveOrderForm=function(marketPlaceSeq, sellerSeq){

	if(marketPlaceSeq === 19){
		buyerGradeCheck(marketPlaceSeq);
	}
	// 선택된 상품있는지 체크
	if($("[id^='wishList_']").length == 0) {
		alert("선택된 견적이 없습니다. 다시 선택해 주시기 바랍니다.");
		return false;
	}

	// 주문Form
	var winOrderForm = null;
	try {
		winOrderForm = window.open('','winOrderForm');
	} catch (e) {
	}

	// 제한 횟수 체크하기
	$("[name='methods']").val('getPurchasingLimit');
	$.ajax({
		type: "POST",
		url: "?controller=estimateMain&methods=getPurchasingLimit",
		dataType: "json",
		data: $(document.wishForm).serialize(),
		contentType: "application/x-www-form-urlencoded; charset=EUC-KR",
		timeout: 10000,
		error: function(request, status, error){
			if(error == 'timeout'){
				alert('서버 부하입니다. 잠시후 다시 시도해 주세요.');
			}else{
				alert('error =' + error + ' f5를 눌러 새로고침후 이용해주세요');
			}
			try {
				winOrderForm.close();
			} catch (e) {
			}
		},
		success: function(data, status, request){
			if(data.success == 'y') {
				var aResult = data.result;
				var msg = '1일 구매제한 수량을 초과하였습니다.\n아래의 상품을 확인해주세요.\n';
				for(var i = 0; i < aResult.length; i++) {
					msg = msg + aResult[i].productName+'\n';
				}
				try {
					winOrderForm.close();
				} catch (e) {
				}
				alert(msg);
				return false;
			} else if(data.success == 'n') {
				$("[name='methods']").val('wishSave');
				$("[name='wishForm']").attr("target", "winOrderForm");
				moveOrderFormAfter(marketPlaceSeq,sellerSeq);
			} else {
				alert('관리자에게 문의 하세요!!');
				try {
					winOrderForm.close();
				} catch (e) {
				}
			}

		},
		complete: function() {
			$("[name='methods']").val('wishSave');
		}
	});// ajax end
};

/**
 * 스텔스, 딜러몰 주문하기
 */
var moveOrderFormAfter=function(marketPlaceSeq, sellerSeq){
	// 미니샵으로 이동 후 주문폼으로 이동
	document.wishForm.returnUrl.value = document.wishForm.returnUrlBack.value;
	document.wishForm.action = '?controller=estimateMain&methods=wishSave';
	document.wishForm.submit();
};

//상품 리스트 버튼처리
var retryCount=0;
var searchAll=function(){
	// 상품 프레임이 열리는 속도가 다르기 때문에 여러번 다시 시도한다.
	try {
		productFrameContent.searchAll();
		retryCount=0;
	} catch (e) {
		// 실패하면 2초뒤 다시 시도 (총 5회 시도)
		if(retryCount<5){
			setTimeout(function(){searchAll();}, 2000);
			retryCount++;
		}
	}

	// 온라인견적서 상단 진열 상품을 위해
	try {
		parent.searchAll();
	} catch (e) {}

};

//구매신청 등록
var writeEstimateAuctionDeal = function() {
	if( !($("[name='code[]']").length > 0) ) {
		alert("선택한 상품이 하나 이상 있어야 합니다.");
		return;
	}

	// 임시로 다음 내용 변경
	var controllerName = $("[name='controller']").val();
	var methodsName = $("[name='methods']").val();
	$("[name='controller']").val("estimateDeal");
	$("[name='methods']").val("form");

	window.open("", "winWriteForm", "width=900px,height=850px,scrollbars=yes");

	document.wishForm.action = $("[name='estimateWriteFormLink']").val();
	document.wishForm.target = "winWriteForm";
	document.wishForm.submit();

	// submit 이후에 다시 변경
	$("[name='controller']").val(controllerName);
	$("[name='methods']").val(methodsName);
};

// 견적저장
// 페이지 이동없음
var saveWishList = function() {
	document.wishForm.returnUrl.value='NotMove';
	document.wishForm.target='ifrFormSumit';
	document.wishForm.action='?controller=estimateMain&methods='+$("[name='methods']").val();
	document.wishForm.submit();
};

// 결제수단 변경
var changePaymentMethod = function(pseq) {
	if( !(pseq==1 || pseq==2) ) {
		// 잘못된 결제수단 입력
		return;
	}

	// 결제수단 값 세팅
	$("[name='pseq']").val(pseq);

	$("[id^='wishList_']").each(function(e, data) {
		if($(this).find("[name='price[]']").length > 0) {
			var price = $(this).find("[name='price[]']").val();		// 현금

			if(pseq == 1) {	// 카드
				price = $(this).find("[name='cardPrice[]']").val();
			}

			$(this).find(".price").html(NumberComma.number_format(price));
		}
	});

	// 합계 계산
	computeTotalPrice();

	// 상품리스트 결제수단 변경(가격 변경)
	try {
		productFrameContent.changePaymentMethod(pseq);
	} catch (e) {
	}

	// css변경
	$(".sale_house_check").find("li").removeClass("check_on");
	$(".sale_house_check").find("li").addClass("check_off");
	$("#paymentSeq_"+pseq).removeClass("check_off");
	$("#paymentSeq_"+pseq).addClass("check_on");

};

/*
 * 단축url을 위해서 만듬
 */
var ifrFormSumitParam=function(){
	var controller = $("[name='controller']").val();
	var methods = $("[name='methods']").val();
	
	$("[name='controller']").val("estimateMain");
	$("[name='methods']").val("makeSharedEstimateParam");
	var returnData = $("form[name=wishForm]").serialize();

	// methods 값을 기본으로 다시 세팅함
	$("[name='controller']").val(controller);
	$("[name='methods']").val(methods);

	return returnData;
};
var ifrSaveParam=function(pFolderSeq){
	$("[name='returnType']").val("json");
	if(pFolderSeq != 'undefined' && pFolderSeq != '') {
		$("[name='groupSeq']").val(pFolderSeq);
		// PC견적에서 저장시 folderSeq를 지정하지 않는다.
		//$("[name='folderSeq']").val(pFolderSeq);
	}
	var returnData = $("form[name=wishForm]").serialize();
	
	// 원래값 세팅
	$("[name='returnType']").val("");

	return returnData;
};

var checkProductSelect=function(){
	if( !($("[name='code[]']").length > 0) ) {
		alert("선택한 상품이 하나 이상 있어야 합니다.");
		return false;
	}else{
		return true;
	}
};

var reloadPage=function(pFolderSeq){
	document.wishForm.target = '_blank';
	document.wishForm.action='?controller=estimateMain&methods=index&marketPlaceSeq=' + $("[name='marketPlaceSeq']").val()  + '&folderSeq='+pFolderSeq;
	document.wishForm.submit();
};

/**
 * 현재 견적에 담긴 상품코드를 배열로 반환
 */
var getProductCodeList = function() {
	var productCodeList = new Array();
	if($("[name='code[]']").length > 0) {
		$("[name='code[]']").each(function(index) {
			productCodeList[index] = $(this).val();
		});
	}
	return productCodeList;
};

/**
 * BTOB-332 딜러몰/적립몰
 * 마켓플레이스 변경(새로고침)
 */
var changeMarketPlaceSeq = function(marketPlaceSeq) {
	if(marketPlaceSeq > 0) {
		// 견적 저장 후 새로고침(현재 카테고리 유지)
		var returnUrl = "/virtualestimate/?controller=estimateMain&methods=estimate&marketPlaceSeq=" + marketPlaceSeq;
		if($("[name='groupSeq']").val() > 0) {
			returnUrl += "&groupSeq=" + $("[name='groupSeq']").val();
		}
		if($("[name='categorySeq']").val() > 0) {
			returnUrl += "&categorySeq=" + $("[name='categorySeq']").val();
		}
		if($("[name='categoryDepth']").val() > 0) {
			returnUrl += "&categoryDepth=" + $("[name='categoryDepth']").val();
		}
		$("[name='returnUrl']").val(returnUrl);
		$("[name='target']").val("parent");
		$("[name='controller']").val("estimateMain");
		$("[name='methods']").val("estimateSave");
		
		document.wishForm.target='ifrFormSumit';
		document.wishForm.action='?controller=estimateMain&methods=estimateSave';
		document.wishForm.submit();
		
		// 상품리스트 새로고침
		try {
			productFrameContent.changeMarketPlaceSeq(marketPlaceSeq);
			parent.document.indexForm.marketPlaceSeq.value = marketPlaceSeq;
		} catch (e) {
		}
	}
};

/**
 * BTOB-332 딜러몰/적립몰 가격비교 이동
 */
var moveDealerShop = function(marketPlaceSeq){
	// 견적 저장후 페이지 이동
	if(marketPlaceSeq > 0 && checkProductSelect()) {
		var returnUrl = '/virtualestimate/?controller=dealerShop&methods=index&marketPlaceSeq=' + marketPlaceSeq;
		if($("[name='groupSeq']").val() > 0) {
			returnUrl += '&estimateGroupSeq=' + $("[name='groupSeq']").val();
		}
		document.wishForm.returnUrl.value = returnUrl;
		document.wishForm.controller.value = 'estimateMain'
		document.wishForm.methods.value = 'estimateSave';
		document.wishForm.target = 'ifrFormSumit';
		document.wishForm.action = '/virtualestimate/?controller=estimateMain&methods=estimateSave';
		document.wishForm.submit();
	}
};

/**
 * 딜러몰/적립몰 구매수량 제한 체크
 */
var checkLimit = function(marketPlaceSeq){
	if(marketPlaceSeq > 0 && checkProductSelect()) {
		// 구매수량제한 체크
		var method = $("[name='methods']").val(); 
		$("[name='methods']").val('getPurchasingLimit');
		$.ajax({
			type: "POST",
			url: "/virtualestimate/?controller=estimateMain&methods=getPurchasingLimit",
			dataType: "json",
			data: $(document.wishForm).serialize(),
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			success: function(data, status, request){
				if(data.status == 200) {
					// 정상 결과
					if(data.success == 'y') {
						// 구매수량 초과 안내
						var msg = '1일 구매제한 수량을 초과하였습니다.';
						if(data.result != null) {
							msg += '\n아래의 상품을 확인해주세요.\n';
							for(var i = 0; i < data.result.length; i++) {
								msg = msg + data.result[i].productName+'\n';
							}
						}
						alert(msg);
					}
					else if(data.success == 'n') {
						// 딜러몰/적립몰 가격비교 페이지로 이동
						moveDealerShop($("[name='marketPlaceSeq']").val());
					}
				}
				else if(data.desc != "") {
					// 안내 메시지
					alert(data.desc);
				}
			},
			complete: function() {
				$("[name='methods']").val(method);
			}
		});
	}
};

/**
 * 카테고리 선택
 * 파일위치 변경 : virtualEstimateMainWish.js -> estimateWishProcess.js
 */
var viewCategoryProductList = function(categorySeq, categoryDepth) {
	if($('#ifrmProduct', parent.document).contents().find('[name="name"]').val() != '' && !confirm('검색 결과를 초기화 하시겠습니까?')) {
		return false;
	}

	// css변경
	$("[class^='category_']").removeClass("selected");
	$("[class^='category_']").removeClass("select");
	$(".category_"+categorySeq).addClass("selected");
	$(".category_"+categorySeq).addClass("select");
	
	if($("[name='categorySeq']")) {
		$("[name='categorySeq']").val(categorySeq);
	}
	if($("[name='categoryDepth']")) {
		$("[name='categoryDepth']").val(categoryDepth);
	}

	// S/W 카테고리 안내 메시지
	if(categorySeq == 901) {
		alert("운영체제/소프트웨어는 개봉하거나 설치 시\n반품이 불가능합니다.");
	}

	// productList를 해당 카테고리 상품으로 페이지 리로드
	parent.document.getElementById("ifrmProduct").contentWindow.setCategoryLocation(categorySeq, categoryDepth);

	// 로딩바 생성
	$(".product_list_cover", parent.document).addClass('show');
	// 상품비교 상품목록 초기화
	$("#compareList", parent.document).val("");
	try {
		parent.goodsCompareListRendering();
	} catch (e) {
	}
	
	// 온라인견적 이벤트 레이어 팝업 노출
	categoryEventDisplay(categorySeq);
};

/**
 * 온라인견적 이벤트 레이어 팝업 노출
 * 파일위치 변경 : virtualEstimateMainWish.js -> estimateWishProcess.js
 */
var categoryEventDisplay = function(categorySeq) {
	try {
		parent.getEventLayerPopup(categorySeq);
	} catch (e) {
	}
};

/**
 * 파일위치 변경 : virtualEstimateMainWish.js -> estimateWishProcess.js
 */
var getCookieTmp = function(name)
{
	var nameOfCookie = name + "=";
	var x = 0;
	while ( x <= document.cookie.length )
	{
		var y = (x+nameOfCookie.length);
		if ( document.cookie.substring( x, y ) == nameOfCookie ) {
			if ( (endOfCookie=document.cookie.indexOf( ";", y )) == -1 )
				endOfCookie = document.cookie.length;
			return unescape( document.cookie.substring( y, endOfCookie ) );
		}
		x = document.cookie.indexOf( " ", x ) + 1;
		if ( x == 0 )
			break;
	}
	return "";
};

/**
 * 파일위치 변경 : virtualEstimateMainWish.js -> estimateWishProcess.js
 */
var setCookieTmp = function(name, value, expiredays)
{
	var todayDate = new Date();
	todayDate.setDate( todayDate.getDate() + expiredays );
	document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";";
};