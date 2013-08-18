var paginationArray = {};
$(document).ready(function() {
});

var sonic = new Sonic({
	
	width: 100,
	height: 100,

	stepsPerFrame: 1,
	trailLength: 1,
	pointDistance: 0.05,

	backgroundColor: '#222',
	strokeColor: '#FF2E82',

	fps: 20,

	setup: function() {
		this._.lineWidth = 4;
	},
	step: function(point, index) {

		var cx = this.padding + 50,
			cy = this.padding + 50,
			_ = this._,
			angle = (Math.PI/180) * (point.progress * 360);

		_.beginPath();
		_.moveTo(point.x, point.y);
		_.lineTo(
			(Math.cos(angle) * 25) + cx,
			(Math.sin(angle) * 25) + cy
		);
		_.closePath();
		_.stroke();

	},
	path: [
		['arc', 50, 50, 40, 0, 360]
	]

});
    
function startSonic($c) {
    sonic.play();
    $sonic_div = $('<div id="sonic"></div>');
    $sonic_div.append(sonic.canvas);
    $c.prepend($sonic_div);
}

function stopSonic() {
    sonic.stop();
    $('#sonic').remove();
}


function initPage(xml,totalPage,keyword) {
    xml.replace(/\\"/g,'"');
    keyword.replace(/\\"/g, '"');
    $('#container').append($('<blockquote><h6>"' + keyword +'"での検索</h6></blockquote>'));
    $root = $(xml);
    $levelContainer = $('<div class="container" id="container-0"></div>');
    $levelContainer.appendTo($("#container"));
    setPagination(0,totalPage,keyword);
    result_flag = makeRow($root,0,1);
    $pageUl = $('<div class="row"><div class="pagination"><ul id="pagination-0"></ul></div></div>');
    $pageUl.appendTo($levelContainer);
    if(result_flag) {
        doPagination(0,1);
    }
}

function setPagination(pageId,totalPage,keyword) {
    var p = new Pagination(pageId,totalPage,keyword);
    paginationArray[pageId] = p;
}

function doPagination(pageId,to) {
    paginationArray[pageId].doPagination(to);
}

function doRelationSearch(level,asin) {
    $container = $("#container")
    
    //下の階層はすべて削除する
    $levelContainers = $('div[id^="container-"]').filter(' :gt('+(level - 1)+')');
    $levelContainers.remove();
    $newContainer = $('<div class="container" id="container-' + level + '"></div>');
    $newContainer.appendTo($container);
    startSonic($newContainer);
    $.ajax({
        type: 'POST',		//GETでリクエストを送信
        url:  '/searches/relationSearch?asin='+asin,
        datatype: 'xml',	//xml形式で受信する
        success: function(responseText, status) {
            makeRow($(responseText),level,1);
            stopSonic();
            $newContainer.prepend($('<div class="row"><div class="span1"></div><div class="span2"><p><span class="badge badge-info">' + level + '</span></p></div>'));
        }
    });
}

function makeRow($root,level,to) {
    console.log("level:" + level);
    var cPage = to;
    var pageItem = 0;
    var $container = $('#container-' + level);
    var $row;
    if((to % 2) == 0) {
        cPage = to - 1;
    }
    $items = $root.find('Item');
    if($items.length == 0) {
        $container.append($('<div class="row"><div class="span12 notfound">検索結果が見つかりませんでした</div></div>'));
        return false;
    }
     else {
        $items.each(function (i) {
            $item = $(this);
            if(pageItem == 0) {
                var style="";
                if(cPage != to) {
                    style = 'style="display:none" ';
                }
                $row = $('<div class="row" ' + style + 'id="row-' + level + '-' + cPage + '"></div>');
                var $span1 = $('<div class="span1"></div>');
                $span1.appendTo($row);
            }
            var $span2 = $('<div class="span2"></div>');
            var img_src = $item.find('ImageSets > ImageSet > MediumImage > URL').text();
            if(img_src.length == 0) {
				img_src = "/assets/noimage.jpg";
            }
            var $thumbnail = $('<div class="thumbnail"><a href="' + $item.find('DetailPageURL').text() + '"><img src="' + img_src + '" /></a></div>');
            var $button = $('<div class="button"><button class="btn-small btn-primary">関連検索</button></div>');
            $button.bind('click',{"level":level + 1,"asin":$item.find('ASIN').text()},
                         function(event){
                            doRelationSearch(event.data.level,event.data.asin);
                            $('#container-' + (event.data.level - 1)).find('button.btn-danger').attr('class','btn-small btn-primary').text("関連検索");
                            $(this).children('button').attr('class','btn-small btn-danger');
                            $(this).children('button').text("選択中");
                        });
            var $item_attributes = $item.find('ItemAttributes');
            var title = $item_attributes.find('Title').text()
            if(title.length > 40) {
                title = title.substr(0,40) + "…";
            }
            var $title = $('<div><a href="' + $item.find('DetailPageURL').text() + '">' + title + '</a></div>');
            var date = $item_attributes.find('PublicationDate').text();
            var $date = $('<div>(' +  date + ')</div>');
            var $price = $('<div class="price">' + $item_attributes.find('ListPrice > FormattedPrice').text() + '</div>');
            
            $thumbnail.appendTo($span2);
            $button.appendTo($span2);
            $title.appendTo($span2);
            $price.appendTo($span2);
            if(date.length > 0) {
                $date.appendTo($span2);
            }
            
            $span2.appendTo($row);
            
            pageItem++;
            if(pageItem == 5 || i == $items.length - 1) {
                pageItem = 0;
                var $span1 = $('<div class="span1"></div>');
                $span1.appendTo($row);
                if(cPage == 1) {
                    //1ページ目なら普通に追加
                    $container.append($row);
                } else {
                    $lastRow = $('div[id^="row-' + level +'-"]').filter(':last');
                    $row.insertAfter($lastRow);
                }
                cPage++;
            }
        });
     }
     return true;
}