/**
 * 프레임 function 정의
 *  wish iframe.
 *  jquery 에서 iframe 관련 작동이 firefox 에서 이상함.
 */
var wishFrameContent;
try{
	wishFrameContent = parent.document.getElementById("ifrmWish").contentWindow;
}catch(e){}

/**
 * 상품리스트 정렬방식
 */
var orderBy;

/**
 * 상품 코드리스트
 */
var productCodeList=null;
/**
 * 페이지 로딩시에 productCodeList를 초기화 한다.
 */
var getProductCodeList=function(){
	productCodeList=new Array();
	$("[name='code']").each(function(loop){
		productCodeList[loop]=$(this).val();
	});
};

/**
 * 대표상품 소트.
 *
 * @parma item=소트필드
 */
var productSort = function(method) {
	orderBy = method;
	$("[name='name']").val($("[name='name']").val());
	$("[name='orderbyList']").val(method);
	$("[name='tabOrderbyYn']").val('Y');
	formsubmit();
};

/**
 * 카테고리 변경
 */
var setCategoryLocation = function(categorySeq, categoryDepth) {
	var url = "/virtualestimate/?controller=estimateMain&methods=product";
	url += "&marketPlaceSeq=" + $("[name='marketPlaceSeq']").val();
	url += "&pseq=" + $("[name='pseq']").val();
	url += "&categorySeq=" + categorySeq;
	url += "&categoryDepth=" + categoryDepth;
	url += "&externalType=" + $("[name='externalType']").val();
	if($("[name='sellerSeq']").length > 0 && parseInt($("[name='sellerSeq']").val()) > 0) {
		url += "&sellerSeq=" + $("[name='sellerSeq']").val();
	}

	location.href = url;
};

/**
 * form submit
 */
var formsubmit = function(){
	if($("#searchProduct").val() != '') {
		// 내부에 검색어 필드가 있는 경우
		$("[name='name']").val($("#searchProduct").val());
	}
	$("[name='page']").val(1);
	frmSubmit();
};

/**
 * 로딩바 생성
 */
var addLoadingBar = function() {
	$(".product_list_cover", parent.document).addClass('show');
};

/**
 * 검색결과 리셋
 */
var productSearchReset=function(){
	try {
		clearAll();
	} catch (e) {}
};

/**
 * 선택된 데이터를 seializeArray 해서 wish 쪽으로 전송한다.
 */
var addWish=function(obj){
	try{
		wishFrameContent.addWish($(obj).parents("[class*='productList_']").find("input").serializeArray());
	}catch(e){}
};

var removeWish=function(obj){
	try{
		wishFrameContent.removeWish($(obj).parents("[class*='productList_']").find("[name='code']").val());
	}catch(e){}
};

/**
 * 결제수단 변경(새로고침)
 */
var changePaymentMethod = function(pseq) {
	if( !(pseq==1 || pseq==2) ) {
		// 잘못된 결제수단 입력
		return;
	}

	// 상품비교 상품번호들
	var compareListArray = $('#compareList', parent.document).val().split('|');
	$("[class*='productList_']").each(function(e, data) {
		var productSeq = $(data).attr("class").split("_")[1].replace( /[^\d\.]*/g, '');
		if(typeof productSeq !== "undefined" || productSeq !== "null"){
			// 상품번호가 존재하지 않다면 실행안함
			$(compareListArray).each(function(e, data){
				if(productSeq === data){
					parent.goodsCompareListRendering();
				}
			});
		}
	});

	$("[name='orderbyList']").val('');
	$("[name='pseq']").val(pseq);
	formsubmit();
};

/**
 * 페이지가 로딩 되거나, 선택 상품 선택. 삭제 시에 전체 스켄을 위한 처리
 */
var searchAll=function(){
	try{
		// 초기화
		var codeList = wishFrameContent.getCodeList();
		$("a.wishAction").each(function(){
			$(this).attr("class",$(this).attr("class").replace("clear","choice"));
			// 버튼명 : PC견적과 딜러몰/적립몰 구분
			if($(".estimate_renew_list") && $(".estimate_renew_list").length > 0) {
				$(this).html('담기<span class="icon"></span>');
			}
			else {
				$(this).html("선택");
			}
		});

		wishFrameContent.genWishManual(codeList.length);

		// 상품비교 버튼 활성화
		if($("#compareList", parent.document).length > 0) {
			if(parent.goodsCompareListData.length > 0){ // 상품비교 선택된 리스트가 있으면
				var compareListArray = $("#compareList", parent.document).val().split('|');
				$(compareListArray).each(function(e, data) {
					$('.productList_' + data + ' .btn_compare').removeClass("btn_compare").addClass('btn_compare_on');
				});
			}else{
				$("#compareList", parent.document).val("");
			}
		}

		// 속도 향상을 위해 스캔 범위를 축소한다.
		var mergeCodeList=new Array();
		var mergeLoop=0;
		for(var i=0;i<codeList.length;i++){
			for(var j=0;j<productCodeList.length;j++){
				if(codeList[i]==productCodeList[j]){
					mergeCodeList[mergeLoop]=codeList[i];
					mergeLoop++;
				}
			}
		}

		if(mergeCodeList.length>0){
			for(var i=0;i<mergeCodeList.length;i++){
				// 해당 상품이 여러개일 수 있으며, 각 상품의 class명이 다를 수 있다.
				$(".productList_"+mergeCodeList[i]).find(".wishAction").each(function() {
					$(this).attr("class",$(this).attr("class").replace("choice","clear"));
				});
				// 버튼명 : PC견적과 딜러몰/적립몰 구분
				if($(".estimate_renew_list") && $(".estimate_renew_list").length > 0) {
					$(".productList_"+mergeCodeList[i]).find(".wishAction").html('해제<span class="icon"></span>');
				}
				else {
					$(".productList_"+mergeCodeList[i]).find(".wishAction").html("해제");
				}
			}
		}
	}catch(e){}
};

/**
 * 애드리더 광고상품 클릭통계 호출
 * @param int productSeq
 */
var bizAdverClick = function(productSeq) {
	var statiticsParam = '';

	if(location.host == 'shop-local.danawa.com' || location.host == 'shop-t.danawa.com') {
		statiticsParam = 'http://adcenter-t.danawa.com';
	} else {
		statiticsParam = 'http://adcenter.danawa.com';
	}

	statiticsParam+='/statistics/advertiseStatisticsActionApi.php?';
	statiticsParam+='&adverServiceSeq=11';
	statiticsParam+='&advertiseSeq=' + productSeq;
	statiticsParam+='&actionType=2';

	try {
		$.get(statiticsParam, {}, function(response){});
	} catch(error) {}
}

/**
 * 상품블로그 주소
 */
var productInfoPopup=function(productSeq, target) {
	var url = location.protocol + '//' + location.host + '/pc/?controller=estimateDeal&methods=productInformation&productSeq='+productSeq;
	if(typeof target != 'undefined') {
		url += '&community=1';
	}
	window.open(url,'productInfoPopup','scrollbars=1,resizable=1,width=965,height=735,top=100,left=100');
};

/**
 * 온라인견적 상품리스트 스크롤바 높이 지정
 */
var setScrollBoxHeight = function() {
	// 기준 높이
	var scrollHeight = 1015;
	// 애드리더
	if($('.adreader_box').length > 0) {
		scrollHeight = scrollHeight - $('.adreader_box').height() - 10;
	}
	// PB상품
	if($('.btm_box').length > 0) {
		scrollHeight = scrollHeight - $('.btm_box').height();
	}

	$(".scroll_box").height(scrollHeight);
};

// PB상품 설명 노출
var showPBTooltip = function(code) {
	$(".desc_" + code).css("display", "");
};

// PB상품 설명 숨기기
var hidePBTooltip = function(code) {
	$(".desc_" + code).css("display", "none");
};

$(document).ready(function(){
	// 카테고리명, 상품 개수 표시
	settingProductListTitle($("[name='categoryName']").val(), $("[name='goodsCount']").val());

	// 상품검색시
	if($("#searchProduct") && $("#searchProduct").val() != '') {
		$("#searchProduct").siblings('label').fadeOut('fast');
	}

	$('.moveProductList').click(function(e) {
		e.preventDefault();
		addLoadingBar();
		location.href = $(this).attr('href');
	});

	// placeholder 효과
	$('#searchProduct').focus(function() {
		$(this).siblings('label').fadeOut('fast');
	});

	// placeholder 효과
	$('#searchProduct').focusout(function() {
		if($(this).val() == '') {
			$(this).siblings('label').fadeIn('fast');
		}
	});

	//
	$('[name="totCategoryAttr"]').click(function() {
		var totCategoryAttrArray = $('[name="totCategoryAttr"]').val().split('|');
		$("[name='orderbyList']").val('');
		$("[name='page']").val('1');
		frmSubmit();
	});

	// 제안어 검색 무시
	$('#ignoreKeyword').click(function(e) {
		e.preventDefault();
		$('[name="ignoreKeywordYN"]').val('Y');
		$("[name='orderbyList']").val('');
		$("[name='page']").val('1');
		frmSubmit();
	});

	$("a.wishAction").click(function(e){
		e.preventDefault();
		if($(this).attr("class").indexOf('choice')>0){
			addWish($(this));
			//클릭량 체크
			if($('[name="marketPlaceSeq"]').val() == 16 && $(this).parent().hasClass("rig_line")){
				_trkEventLog('PC견적메인_상품리스트_담기_('+$(this).siblings('[name="code"]').val()+')');
			}
		}
		else{
			removeWish($(this));
			//클릭량 체크
			if($('[name="marketPlaceSeq"]').val() == 16 && $(this).parent().hasClass("rig_line")){
				_trkEventLog('PC견적메인_상품리스트_해제_('+$(this).siblings('[name="code"]').val()+')');
			}
		}
	});

	// 상품비교 버튼 클릭 시 우측 wishList에 담는다.
	$("#goodsCompareWishProductBtn", parent.document).click(function(e){
		e.preventDefault();
		var compareList = [];

		$('.check_prod:checked', parent.document).each(function(e, data) {
			compareList.push(data.value);
		});

		var length = compareList.length;
		if( length > 0) {
			$(compareList).each(function(e, data){
				try{
					addWish($(".productList_"+data).children().eq(2));
				}catch(e){
				}
			});
		}
	});

	// 코드리스트를 가져온다.
	getProductCodeList();
	// 페이지 로딩이나 변경시에 한번 읽어온다.
	searchAll();

	// 상품 테이블의 높이가 600을 넘을 경우에 600으로 고정시킨다.
	/*
	if($(".result_wrap")!=null && $(".result_wrap").height()>600){
		$(".result_wrap").css('height','600px');
		$(".result_wrap").css('overflow','scroll');
		$(".result_wrap").css('overflow-x','hidden');
	}
	*/

	// 온라인견적 상품리스트 높이가 유동적이므로 크기에 맞게 세팅한다.
	if($(".scroll_box").length > 0) {
		setScrollBoxHeight();
		// 로딩 지연시를 대비해 한번 더 수행
		setTimeout(setScrollBoxHeight, 1000);
	}

	// 온라인견적 페이징 스타일
	if($("span .paging_first").length > 0) {
		$("span .paging_first").parent().addClass("paging_first");
	}
	if($("span .paging_prev").length > 0) {
		$("span .paging_prev").parent().addClass("paging_prev");
	}
	if($("span .paging_next").length > 0) {
		$("span .paging_next").parent().addClass("paging_next");
	}
	if($("span .paging_last").length > 0) {
		$("span .paging_last").parent().addClass("paging_last");
	}

	// 상품리스트 상품비교 링크 클릭 시 레이어에 상품 추가
	$('.btn_compare').live("click", function(e) {
		e.preventDefault();
		var productSeq = ($(this).parent().parent().attr('class').replace( /[^\d\.]*/g, ''));
		if(parseInt(productSeq) > 0) {
			// 부모 함수 실행
			parent.saveGoodsCompare(productSeq); // 상품고유번호
			parent.goodsCompareListRendering();
		}
	});

	// 이미 선택된 상품비교 버튼 및 상품 비활성
	$(".btn_compare_on").live("click", function(e){
		e.preventDefault();
		var productSeq = ($(this).parent().parent().attr('class').replace( /[^\d\.]*/g, ''));
		if(parseInt(productSeq) > 0) {
			// 부모 함수 실행
			parent.deleteGoodsCompare(productSeq);
			parent.goodsCompareListRendering();
		}
	});

	// 고정상품 높이값 조정
	if($('.product').length > 0) {
		var bottom = ($('.btm_box_wrap').length == 0) ?
					// 끝에 2는 보더값
					parseInt($('.btm_box').css('padding-top').replace('px','')) + parseInt($('.btm_box').css('padding-bottom').replace('px','')) + parseInt($('.paging_estimate').height()) + 2 :
					parseInt($('.btm_box').height()) + parseInt($('.paging_estimate').height()) + parseInt($('.btm_box').css('padding-top').replace('px','')) + parseInt($('.btm_box').css('padding-bottom').replace('px','')) + 2;
		$('.product').css('bottom', bottom + 'px');
	}

	// select box로 구성된 제조사, 브랜드, 검색옵션 컨트롤
	$("[name='srchMaker']").change(function() {
		changeSearchOption();
		if($('[name="marketPlaceSeq"]').val() == 16 && $(this).val() != ""){
			_trkEventLog('PC견적메인_옵션검색_' + $(".title_area > h3").text() + '_(' + $(this).children("option:first-child").text() + '-' + $(this).children("option:selected").text()+')');
		}
	});
	$("[name='srchBrand']").change(function() {
		changeSearchOption();
		if($('[name="marketPlaceSeq"]').val() == 16 && $(this).val() != ""){
			_trkEventLog('PC견적메인_옵션검색_' + $(".title_area > h3").text() + '_(' + $(this).children("option:first-child").text() + '-' + $(this).children("option:selected").text()+')');
		}
	});
	$("[name='srchAttribute[]']").change(function() {
		changeSearchOption();
		if($('[name="marketPlaceSeq"]').val() == 16 && $(this).val() != ""){
			_trkEventLog('PC견적메인_옵션검색_' + $(".title_area > h3").text() + '_(' + $(this).children("option:first-child").text() + '-' + $(this).children("option:selected").text()+')');
		}
	});

	// 통합검색 검색옵션
	$('[name="totCategoryAttr"]').change(function() {
		// serviceSectionSeq | productRegisterAreaGroupSeq
		var totCategoryAttrArray = $(this).val().split('|');
		$("[name='serviceSectionSeq']").val(totCategoryAttrArray[0]);
		$("[name='productRegisterAreaGroupSeq']").val(totCategoryAttrArray[1]);

		frmSubmit();
	});

	// checkbox 컨트롤
	$(".attribute").click(function(){
		frmSubmit();
	});

	$(".displayControll").css("cursor","pointer").click(function(){
		if($(this).attr("src").indexOf('ico_view')>=0){
			$(this).parent().parent().find(".attributeWapper").show();
			$(this).attr("src",$(this).attr("src").replace("ico_view","ico_hide"));
		}
		else{
			$(this).parent().parent().find(".attributeWapper").each(function(loop){
				if(loop>parseInt($("[name='displayOptionCount']").val()))
					$(this).hide();
			});
			$(this).attr("src",$(this).attr("src").replace("ico_hide","ico_view"));
		}
	});

	// 유튜브채널 레이어 닫기
	$(".btn_close").click(function(e){
		e.preventDefault();
		$(this).parent().css("display","none");
	});

	// 상품정보 레이어 노출
	$(".spec").click(function(e) {
		e.preventDefault();
		if($(this).parent().find(".spec_info").css("display") == "block") {
			// 이미 노출중
			$(".spec_info").css("display", "none");
		}
		else {
			$(".spec_info").css("display", "none");
			$(this).parent().find(".spec_info").css("display", "block");
		}
	});
});


/**
 * 검색결과 모두 삭제
 */
var clearAll=function(){
	$(".attribute").attr("checked",false);
	frmSubmit();
};

/**
 * 폼 처리
 */
var frmSubmit=function(){
	// 로딩바 생성
	addLoadingBar();
	$("#ifrmProduct",parent.document).attr("src",'/virtualestimate/?'+$("[name='searchForm']").find("input").serialize());
};

/**
 * 검색옵션 선택
 */
var changeSearchOption = function() {
	// 제조사
	$("[name='makerCode']").val($("[name='srchMaker']").val());

	// 브랜드
	if($("[name='brandCode']").length > 0) {
		$("[name='brandCode']").val($("[name='srchBrand']").val());
	}

	// 검색옵션
	var attribute = new Array();
	var loop = 0;
	$("[name='srchAttribute[]']").each(function() {
		if($(this).val() != "") {
			attribute[loop] = $(this).val();
			loop++;
		}
	});
	$("[name='attribute']").val(attribute.join(","));

	// 상품명 검색
	if($("#searchProduct").length > 0) {
		initSearchResult();
		if($('[name="marketPlaceSeq"]').val() == 16){
			_trkEventLog('PC견적메인_키워드검색_검색_('+$("#searchProduct").val()+')');
		}
	}
	frmSubmit();
};

/**
 * 온라인견적 검색 초기화
 */
function initSearchResult() {
    var searchForm = document.forms["searchForm"];
	searchForm.elements["page"].value = 1;
	searchForm.elements["ignoreKeywordYN"].value = 'N';
	searchForm.elements["orderbyList"].value = "";
	searchForm.elements["serviceSectionSeq"].value = "";
	searchForm.elements["productRegisterAreaGroupSeq"].value= "";
	searchForm.elements["name"].value = $.trim($("#searchProduct").val());
}

/**
 * 상품리스트 상단에 카테고리명 표시
 */
var settingProductListTitle = function(categoryName, productCount) {
	if($(".title_area").length > 0) {
		if($("[name='name']").val() != '' && $('[name="totCategoryAttr"]').length > 0) {
			var title = $('[name="totCategoryAttr"]:checked').parent().find('label').text();
			$(".title_area > h3").text(title.slice(0, title.indexOf('(')));
		} else {
			$(".title_area > h3").text(categoryName);
		}
		$(".title_area > span").html('상품개수 :<strong> ' + productCount +'</strong>개');
	}
};

/**
 * 온라인견적 검색 초기화
 */
function searchReset() {
	if(confirm('검색 결과를 초기화 하시겠습니까?')) {
		$("[name='name']").val('');
		$("[name='ignoreKeywordYN']").val('N');
		$("[name='orderbyList']").val('PRODUCT_POPULAR_DESC');
		changeSearchOption();
	}
}

/**
 * 마켓플레이스 변경(새로고침)
 */
var changeMarketPlaceSeq = function(marketPlaceSeq) {
	if(marketPlaceSeq > 0) {
		$("[name='marketPlaceSeq']").val(marketPlaceSeq);
		frmSubmit();
	}
};

//유튜브채널 데이터 가져오기
var showVideoChannel = function(productSeq) {
	event.preventDefault();
	var html = "";
	var recommend_html = "";

	$("#video_list").html(html);
	$("#video_recommend_list").html(recommend_html);
	$(".rec_channel").css("display","block");

	$(".layer_comm").css("display","none");
	try {
		jQuery.ajax({
			type: "get",
			url: "/virtualestimate/?controller=estimateMain&methods=getVideoChannel&productCode=" + productSeq,
			dataType: "json",
			async: false,
			error: function(request, status, error){
			},
			success: function(response, status, request){

				$.each(response.video, function( index, value ) {
					if(value.title != undefined && value.etcImageUrl != undefined){
						var url ="/main/?controller=board&methods=getBoardList&listSeq="+ value.listSeq+"&boardSeq="+value.boardSeq;

						html +="<li class='lv_item'>";
						html +="<a href='"+url+"' class='lv_link' target='_blank' onmousedown='_trkEventLog(\"온라인견적서_온라인견적서_유튜브채널("+value.title+")\");'>";
						html +="<div class='lv_thumb'>";
						html +="<span class='lv_img'><img src='"+value.etcImageUrl+"?shrink=168:94' alt='' style='width:168px;height:94px'></span>";
						html +="</div>";
						html +="<div class='lv_details'>";
						html +="<div class='lv_vam'>";
						html +="<div class='lv_meta'>";
						html +="<strong>"+value.title+"</strong>";
						html +="</div>";
						html +="<div class='lv_date'>";
						html +="<span>"+value.createDate+"</span>";
						html +="</div></div></div></a></li>";
					}
				});
				$("#video_list").html(html);
				if(response.videoRecommend != undefined){
					$.each(response.videoRecommend, function( index, value ) {
						if(value.title != undefined && value.etcImageUrl != undefined ){
							var url ="/main/?controller=board&methods=getBoardList&listSeq="+ value.listSeq+"&boardSeq="+value.boardSeq;
							recommend_html += "<li class='rc_item'>";
							recommend_html += "<a href='"+url+"' class='rc_link' target='_blank' onmousedown='_trkEventLog(\"온라인견적서_온라인견적서_유튜브채널 추천영상("+value.title+")\");'>";
							recommend_html += "<div class='rc_thumb'>";
							recommend_html += "<span class='rc_img'><img src='"+value.etcImageUrl+"?shrink=168:94' alt='' style='width:168px;height:94px'></span>";
							recommend_html += "</div>";
							recommend_html += "<div class='rc_details'>";
							recommend_html += "<span class='rc_desc'>"+value.title+"</span>";
							recommend_html += "</div>";
							recommend_html += "</a>";
							recommend_html += "</li>";
						}
					});
					$("#video_recommend_list").html(recommend_html);
				}else{
					$(".rec_channel").css("display","none");
				}


				$(".lcm_video").css("display","block");
			},
			complete: function() {}
		});// ajax end

	} catch(error) {}
};

//조립갤러리 레이어 팝업
var showAssemblyGallery = function(productSeq) {
	event.preventDefault();

	$(".layer_comm").css("display","none");
	if(productSeq > 0) {
		$.ajax({
			type: "get",
			url: "/main/?controller=boardCompleteDeal&methods=assemblyGalleryListByProductSeq&referrer=virtualestimate&productSeq=" + productSeq,
			dataType: "text",
			async: false,
			success: function(response, status, request){
				if(response != '') {
					$(".lcm_assemble").html(response).css("display","");
					// 닫기 버튼
					$(".lcm_assemble .btn_close").on("click", function(e) {
						e.preventDefault();
						$(".lcm_assemble").css("display","none");
					});
				}
			}
		});
	}