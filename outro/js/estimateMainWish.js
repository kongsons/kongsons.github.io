/**
 * 상품 리스트에서 넘어온 데이터를 가공해서 위시리스트 화면을 생성한다.
 */
var addWish=function(data,checker){
	if($("#wish_product_list [id^='wishList_']").length>=50){
		alert("상품은 최대 50개까지 담을 수 있습니다.");
		return false;
	}

	var product = new Object();
	jQuery.each(data,function(i,field){
		product[field.name]=field.value;
	});

	// 기존 입력 상품의 경우 입력 제한
	var codeList=getCodeList();
	for(var i=0;i<codeList.length;i++){
		if(codeList[i]==product['code']){
			return false;
		}
	}

	// 노출하는 가격 선택
	product['displayPrice'] = product['price'];				// 현금가
	if($("[name='pseq']").length > 0 && $("[name='pseq']").val() == 1) {
		product['displayPrice'] = product['cardPrice'];		// 카드가
	}
	// 적립포인트
	try {
		product['earnPoint'] = product['earnPoint'] ? product['earnPoint'] : 0;
	} catch (e) {
		product['earnPoint'] = 0;
	}

	// PB상품 그룹 정보
	product['displayGroupSeq'] = 0;
	if($("[name='displayGroup_"+product['code']+"']").length > 0) {
		product['displayGroupSeq'] = $("[name='displayGroup_"+product['code']+"']").val();
	}

	var html = '';

	//일반상품
	if(product['type'] == 1){
		// 온라인견적 레이어팝업 내에 상품 wish폼으로 이동
		if(checker="event") {
			product['name'] = decodeURIComponent(product['name']);
		}

		// 해당 카테고리에 상품 추가
		html = makeWishProductRow(product);
		$(".category_"+product['linkCategorySeq']+" ul").append(html);
	}
	//PB상품
	else if(product['type']==2){
		// 중복구매 가능 여부 체크
		var checkDisplayGroupProduct = "";
		if(parseInt(product['displayGroupSeq']) > 0) {
			$(".pb_goods").find("[name^='displayGroupSeq']").each(function() {
				if(product['displayGroupSeq'] == $(this).val()) {
					checkDisplayGroupProduct = decodeURIComponent($(this).parent().find("[name^='productName']").val());
				}
			});
		}
		if(checkDisplayGroupProduct != "") {
			alert(checkDisplayGroupProduct + " 상품과 중복 선택이 불가능합니다.");
			return false;
		}

		// 상품 추가
		html = makePrivateBrandGoodRow(product);
		$(".service_list").append(html);

		// 견적리스트 영역 크기 조정
		resizeWishProdListArea();
	}

	if(checker != 'preloading') {
		// 상품리스트쪽 버튼 처리
		searchAll();
		// 합계 계산
		computeTotalPrice();
		// 상품 개수
		modifyProductCount();
	}
};

var makeWishProductRow = function(product) {
	var html = '';
	html +='<li class="row" id="wishList_'+product['code']+'">';
	html +='	<div class="subject">';
	html +='		<a href="#" onclick="parent.productInfoPopup('+product['code']+'); return false;"  onmousedown="_trkEventLog(\'PC견적메인_장바구니_상품명_('+product['code']+')\');">'+product['name']+'</a>';
	html +='	</div>';
	html +='	<div class="num_hit">';
	html +='		<div class="qnt_set">';
	html +='			<input type="text" class="input_qnt" name="quantity[]" value="'+product['quantity']+'" title="주문수량 선택" maxlength="3" onchange="computeTotalPrice();" />';
	html +='			<div class="edit_number">';
	html +='				<button type="button" onclick="modifyProductQuantity('+product['code']+',1);" title="수량 증가" class="btn_qnt_up" onmousedown="_trkEventLog(\'PC견적메인_장바구니_수량증가_('+product['code']+')\');">증가</button>';
	html +='				<button type="button" onclick="modifyProductQuantity('+product['code']+',-1);" title="수량 감소" class="btn_qnt_down" onmousedown="_trkEventLog(\'PC견적메인_장바구니_수량감소_('+product['code']+')\');">감소</button>';
	html +='			</div>';
	html +='		</div>';
	html +='		<input type="hidden" name="categorySeq1[]" value="'+product['categorySeq1']+'"/>';
	html +='		<input type="hidden" name="categorySeq2[]" value="'+product['categorySeq2']+'"/>';
	html +='		<input type="hidden" name="categorySeq3[]" value="'+product['categorySeq3']+'"/>';
	html +='		<input type="hidden" name="categorySeq4[]" value="'+product['categorySeq4']+'"/>';
	html +='		<input type="hidden" name="linkCategorySeq[]" value="'+product['linkCategorySeq']+'"/>';
	html +='		<input type="hidden" name="code[]" class="productCodeList" value="'+product['code']+'"/>';
	html +='		<input type="hidden" name="type[]" value="'+product['type']+'"/>';
	html +='		<input type="hidden" name="price[]" value="'+product['price']+'"/>';
	html +='		<input type="hidden" name="cardPrice[]" value="'+product['cardPrice']+'"/>';
	html +='		<input type="hidden" name="earnPoint[]" value="'+product['earnPoint']+'"/>';
	html +='		<input type="hidden" name="displayGroupSeq[]" value="'+product['displayGroupSeq']+'"/>';
	html +='		<input type="hidden" name="productName[]" value="'+encodeURIComponent(product['name'])+'"/>';
	html +='	</div>';
	html +='	<div class="lower_price">';
	html +='		<span class="num price">'+NumberComma.number_format(product['displayPrice'])+'</span>원';
	html +='		<a href="#" class="btn_delete_cell" onclick="removeWish('+product['code']+'); return false;" class="btn_delete_cell" onmousedown="_trkEventLog(\'PC견적메인_장바구니_상품해제_('+product['code']+')\');">삭제</a>';
	html +='	</div>';
	html +='</li>';

	return html;
};

var makePrivateBrandGoodRow = function(product) {
	var html = '';
	html +='<dd class="service_item" id="wishList_'+product['code']+'">';
	html +='	<div class="subject">';
	html +='		<a href="javascript:parent.productInfoPopup('+product['code']+')" onmousedown="_trkEventLog(\'PC견적메인_장바구니_조립비상품명_('+product['code']+')\');">'+product['name']+'</a>';
	html +='	</div>';
	html +='	<div class="num_hit">';

	html +='		<div class="qnt_set">';
	html +='			<input type="text" class="input_qnt" name="quantity[]" value="'+product['quantity']+'" title="주문수량 선택" maxlength="3" onchange="computeTotalPrice();" />';
	html +='			<div class="edit_number">';
	html +='				<button type="button" onclick="modifyProductQuantity('+product['code']+',1);" title="수량 증가" class="btn_qnt_up" onmousedown="_trkEventLog(\'PC견적메인_장바구니_조립비수량증가_('+product['code']+')\');">증가</button>';
	html +='				<button type="button" onclick="modifyProductQuantity('+product['code']+',-1);" title="수량 감소" class="btn_qnt_down" onmousedown="_trkEventLog(\'PC견적메인_장바구니_조립비수량감소_('+product['code']+')\');">감소</button>';
	html +='			</div>';
	html +='		</div>';
	html +='		<input type="hidden" name="categorySeq1[]" value="'+product['categorySeq1']+'">';
	html +='		<input type="hidden" name="categorySeq2[]" value="'+product['categorySeq2']+'">';
	html +='		<input type="hidden" name="categorySeq3[]" value="'+product['categorySeq3']+'">';
	html +='		<input type="hidden" name="categorySeq4[]" value="'+product['categorySeq4']+'">';
	html +='		<input type="hidden" name="linkCategorySeq[]" value="'+product['linkCategorySeq']+'">';
	html +='		<input type="hidden" name="code[]" class="productCodeList" value="'+product['code']+'">';
	html +='		<input type="hidden" name="price[]" value="'+product['price']+'">';
	html +='		<input type="hidden" name="type[]" value="'+product['type']+'">';
	html +='		<input type="hidden" name="cardPrice[]" value="'+product['cardPrice']+'">';
	html +='		<input type="hidden" name="displayGroupSeq[]" value="'+product['displayGroupSeq']+'">';
	html +='		<input type="hidden" name="productName[]" value="'+encodeURIComponent(product['name'])+'">';
	html +='	</div>';
	html +='	<div class="service_price">';
	html +='		<strong class="prod_price_sec"><span class="prod_price price">' + NumberComma.number_format(product['displayPrice']) + '</span>원</strong>';
	html +='		<a href="javascript:removeWish('+product['code']+');" class="btn_delete_cell" onmousedown="_trkEventLog(\'PC견적메인_장바구니_조립비해제_('+product['code']+')\');"></a>';
	html +='	</div>';
	html +='</dd>';

	return html;
};

/**
 * 상품 삭제
 */
var removeWish=function(productCode){

	if(productCode>0){
		var type = $("#wishList_"+productCode).find("[name='type[]']").val();

		// 해당 행 삭제
		$("#wishList_"+productCode).remove();

		if(type == 2) {
			// PB상품
			// 견적리스트 영역 크기 조정
			resizeWishProdListArea();
		}
	}

	searchAll();
	computeTotalPrice();
	modifyProductCount();
};

/**
 * 전체 품목 삭제
 */
var removeWishAll=function(){
	if(confirm("선택한 모든 상품을 삭제 하시겠습니까? 삭제 후에는 처음부터 다시 선택해야 합니다.") == false) {
		return false;
	}

	// 모든행 삭제
	$("[id^='wishList_']").remove();

	// 견적리스트 영역 크기 조정
	resizeWishProdListArea();

	searchAll();
	computeTotalPrice();
	modifyProductCount();
};

/**
 * PB상품 영역 및 견적리스트 영역 크기 조정
 */
var resizeWishProdListArea = function() {
	var height = 1183;

	// PB상품 영역 노출
	if($(".pb_goods dl dd").length > 0) {
		$(".pb_goods").css("display", "");
		height -= ($(".pb_goods").height() + 1);
	}
	else {
		$(".pb_goods").css("display", "none");
	}

	$(".pd_list_area").height(height+"px");
};

/**
 * 그룹 열기 / 닫기
 */
var viewGroup = function(seq) {
	var obj = $(".group_"+seq);
	if(obj.hasClass("closed")) {
		// 열기
		obj.removeClass("closed");

		// 버튼 변경
		obj.find("dt a").removeClass("btn_open_cell");
		obj.find("dt a").addClass("btn_close_cell");
		obj.find("dt a").text('닫기');
	}
	else {
		// 닫기
		obj.addClass("closed");

		// 버튼 변경
		obj.find("dt a").removeClass("btn_close_cell");
		obj.find("dt a").addClass("btn_open_cell");
		obj.find("dt a").text('열기');
	}
};

$(document).ready(function(){
	// 미리 저장되어진 견적 상품이 있으면 출력한다.
	$(".readWishList").each(function(){
		addWish($(this).find("input").serializeArray(),'preloading');
	});

	// 상품리스트쪽 버튼 처리
	searchAll();

	// 합계 계산
	computeTotalPrice();

	// 상품 개수
	modifyProductCount();

	// 견적리스트 영역 크기 조정
	resizeWishProdListArea();

	// 노출하지 않는 PB상품 정보 체크
	if($("[name='rejectList']").length > 0) {
		var productName = new Array();
		$("[name='rejectList']").each(function(loop) {
			productName[loop] = "'" + $(this).val() + "'";
		});
		alert(productName.join(",") + "은 판매중인 상품이 아닙니다. 다른 '조립 + AS' 상품을 선택하여 주십시오.");
	}

	// 카테고리 이벤트
	if($("[name='categorySeq']")) {
		categoryEventDisplay($("[name='categorySeq']").val());
	}
});