var autoMySearchKeywordDisplay = false;
var currentKeywordIndex = -1;

$(document).ready(function() {

	$('#searchProduct').attr('autocomplete', 'off');
	
	// �닿� 寃��됲븳 �ㅼ썙�� ���� - 寃��� 寃곌낵 �붾㈃�먯꽌 ����
	if($("#totalSearchOption #searchName").length > 0) {
		var searchName = $('#searchName').text();
		if(searchName != '') {
			saveMyKeywordCookie(searchName);
		}
	}
	
	// 寃��됱쁺�� �ъ빱�� out
	$('#searchProduct').focusout(function() {
		if(!autoMySearchKeywordDisplay) {
			$('.auto_layer_wrap').remove();
		}
	});
	
	// 寃��됱뼱 �먮룞 �꾩꽦
	$('#searchProduct').keyup(function(e) {
		if(e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 27 || e.keyCode == 39 || e.keyCode == 45 || e.keyCode == 46 || e.keyCode == 144 || e.keyCode == 145 ||
			(e.keyCode >= 16 && e.keyCode <= 20) ||
			(e.keyCode >= 33 && e.keyCode <= 37) ||
			(e.keyCode >= 112 && e.keyCode <= 123)) {
			return false;
		}
		else {
			var keywordListObj = $('.auto_keyword_wrap .keywords_list_type li');
			// �ㅻ낫�� �꾨줈
			if(e.keyCode == 38) {
				if(keywordListObj.length > 0) {
					currentKeywordIndex--;
	
					if(currentKeywordIndex < 0) {
						currentKeywordIndex = keywordListObj.length - 1;
					}
	
					var currentObj = keywordListObj.eq(currentKeywordIndex);
					keywordListObj.removeClass('hover');
					currentObj.addClass('hover');
					$('#searchProduct').val(currentObj.attr("data"));
				}
			}
			// �ㅻ낫�� �꾨옒濡�
			else if(e.keyCode == 40) {
				if(keywordListObj.length > 0) {
					currentKeywordIndex++;
					if(currentKeywordIndex > keywordListObj.length - 1) {
						currentKeywordIndex = 0;
					}
	
					var currentObj = keywordListObj.eq(currentKeywordIndex);
					keywordListObj.removeClass('hover');
					currentObj.addClass('hover');
					$('#searchProduct').val(currentObj.attr("data"));
				}
			}
			else {
				var searchText = $('#searchProduct').val();
	
				if($.cookie('autoCompleteSearchKeywordStatus') != null && $.cookie('autoCompleteSearchKeywordStatus') == 'off') {
					if(searchText.length > 0) {
						var html = [];
							html.push('<div class="auto_layer_wrap auto_keyword_wrap">');
							html.push('	<div class="auto_keywords_list">');
							html.push('		<p class="txt_finction_explaing">�먮룞�꾩꽦 湲곕뒫�� 爰쇱졇 �덉뒿�덈떎.</p>');
							html.push('	</div>');
							html.push('	<div class="bottom_auto_txt">');
							html.push('		<a href="#" class="btn_right_action" onclick="useAutoCompleteSearchKeyword();return false;"><span class="icons_auto icon_function_check"></span>湲곕뒫 耳쒓린</a>');
							html.push('	</div>');
							html.push('</div>');
	
							$('.auto_layer_wrap').remove();
							$('.total_srch_bar').eq(0).append(html.join(' '));
							
							// 寃��됱쁺�� �ъ빱��
							$('.auto_layer_wrap').mouseenter(function(e) {
								autoMySearchKeywordDisplay = true;
							}).mouseleave(function(e) {
								autoMySearchKeywordDisplay = false;
							});
					} else {
						$('.auto_layer_wrap').remove();
					}
				}
				else {
					if(searchText.length > 0) {
						$.ajax({
							url			: "/main/?controller=goods&methods=getKeywordAnalysis&keyword=" + encodeURIComponent(searchText),
							dataType	: "jsonp",
							jsonp		: "callback",
							success		: function(response) {
								
								$('.auto_layer_wrap').remove();
								$('.total_srch_bar').eq(0).append(response);
								currentKeywordIndex = -1;
								
								// �닿� 寃��됲븳 �ㅼ썙��
								var myKeyword = getMyKeywordCookie();
								var myKeywordText = new Array();
								var myKeywordDate = new Array();
								$(myKeyword).each(function(loop, data) {
									try {
										var tmp = data.split('||');
										if(tmp.length == 2) {
											myKeywordText[loop] = tmp[0];
											myKeywordDate[loop] = tmp[1];
										}
									} catch (e) {
									}
								});
								if(myKeywordText.length > 0) {
									$('.auto_keyword_wrap .keywords_list_type li').each(function() {
										var keywordIndex = myKeywordText.indexOf($(this).attr('data'));
										if(keywordIndex >= 0) {
											$(this).find("a").append('<span class="k_date">' + myKeywordDate[keywordIndex] + '</span>');
										}
									});
								}
								
								// �먮룞�꾩꽦 �ㅼ썙�� �대┃
								$('.auto_keyword_wrap .keywords_list_type li').click(function(e) {
									e.preventDefault();
									$('#searchProduct').val($(this).attr("data"));
									$('#searchProduct').parent().parent().find('button').click();
								});
								
								// �먮룞�꾩꽦 湲곕뒫 �꾧린
								$('.auto_layer_wrap .bottom_auto_txt a').click(function(e) {
									e.preventDefault();
									useAutoCompleteSearchKeyword();
								});
								
								// 寃��됱쁺�� �ъ빱��
								$('.auto_layer_wrap').mouseenter(function(e) {
									autoMySearchKeywordDisplay = true;
								}).mouseleave(function(e) {
									autoMySearchKeywordDisplay = false;
								});
							}
						});
					}
				}
			}
		}
	});

});

// �닿� 寃��됲븳 �ㅼ썙�� 荑좏궎 議고쉶
var getMyKeywordCookie = function() {
	var mySearchKeyword = $.cookie('mySearchHistory');
	var cookieItems =  mySearchKeyword ? mySearchKeyword.split('@@') : new Array();
	return cookieItems;
};

// �닿� 寃��됲븳 �ㅼ썙�� 荑좏궎 ����
var saveMyKeywordCookie = function(keyword) {
	var mySearchKeyword = getMyKeywordCookie();
	
	var today = new Date();
	var mm = today.getMonth() + 1;
	var dd = today.getDate();
	
	// �ㅼ썙�쒖뿉 寃��� �좎쭨 �뺣낫 異붽�
	var saveKeyword = keyword + '||' + ((mm<10) ? '0'+mm : mm) + '.' + ((dd<10) ? '0'+dd : dd);
	
	if(mySearchKeyword.length > 0) {
		var duplicateIndex = -1;
		$(mySearchKeyword).each(function(loop, data) {
			var tmp = data.split('||');
			if(keyword == tmp[0]) {
				// 以묐났 �ㅼ썙�쒓� �덉쓣 寃쎌슦 �몃뜳�� 李얘린
				duplicateIndex = loop;
			}
		});
		
		// 湲곗〈 �ㅼ썙�� �쒓굅
		if(duplicateIndex >= 0) {
			mySearchKeyword.splice(duplicateIndex, 1);
		}
		
		mySearchKeyword.unshift(saveKeyword);
		mySearchKeyword.splice(10);	// 理쒓렐 寃��됲븳 �ㅼ썙�� 10媛쒓퉴吏�留� ���ν빀�덈떎.
		$.cookie('mySearchHistory', mySearchKeyword.join('@@'), {expires:30});
	} else {
		$.cookie('mySearchHistory', saveKeyword);
	}
};

// �닿� 寃��됲븳 �ㅼ썙�� 荑좏궎 ��젣
var removeMyKeywordCookie = function(keyword) {
	var mySearchKeyword = getMyKeywordCookie();

	if(mySearchKeyword.length > 0) {
		if(keyword == '') {
			// �꾩껜 ��젣
			$.cookie('mySearchHistory', null);
		}
		else {
			var index = -1;
			$(mySearchKeyword).each(function(loop, data) {
				var tmp = data.split('||');
				if(keyword == tmp[0]) {
					index = loop;
				}
			});
			if(index >= 0) {
				mySearchKeyword.splice(index, 1);
				$.cookie('mySearchHistory', mySearchKeyword.join('@@'), {expires:30});
			}
		}
	}
};

// �먮룞�꾩꽦 湲곕뒫 耳쒓린/�꾧린
var useAutoCompleteSearchKeyword = function() {
	var status = 'off';

	if($.cookie('autoCompleteSearchKeywordStatus') != null) {
		status = $.cookie('autoCompleteSearchKeywordStatus') == 'off' ? 'on' : 'off';
	}

	$.cookie('autoCompleteSearchKeywordStatus', status);
	$('.auto_layer_wrap').remove();