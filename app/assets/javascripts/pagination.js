function Pagination(_pageId,_totalPage,_keyword) {
    this.pageId = _pageId
    this.totalPage = _totalPage
    this.currentPage = 1;
    this.keyword = _keyword
}

Pagination.prototype.doPagination = function(to) {
    if(to == 0) {
        to = this.currentPage - 1;
    } else if(to == -1) {
        to = this.currentPage + 1;
    }
    
    var startDiff = to - 1;
    var endDiff = this.totalPage - to;
    $ul = $('#pagination-' + this.pageId);
    $ul.children().remove();
    if(startDiff == 0) {
        this.makeLi(0,"disabled").appendTo($ul);
    } else {
        this.makeLi(0,"visible").appendTo($ul);
    }
    var index = 1;
   if(this.totalPage <= 7) {
        for(index = 1; index <= this.totalPage; index++) {
            var activeType = "visible";
            if(index == to) {
                activeType = "disabled";
            }
            this.makeLi(index,activeType).appendTo($ul);
        }
    } else {
        if (startDiff < 4 ) {
            //1ページ目から4ページ以内
            while(index <= 5 && index <= this.totalPage) {
                var activeType = "visible";
                if(index == to) {
                    activeType = "disabled";
                }
                this.makeLi(index,activeType).appendTo($ul);
                index++;
            }
            this.makeThreeLi().appendTo($ul);
            this.makeLi(this.totalPage,"visible").appendTo($ul);
        } else if (endDiff < 4) {
            //最終ページから４ページ以内
            index = this.totalPage - 4;
            this.makeLi(1,"visible").appendTo($ul);
            this.makeThreeLi().appendTo($ul);
            while(index <= this.totalPage) {
                var activeType = "visible";
                if(index == to) {
                    activeType = "disabled";
                }
                this.makeLi(index,activeType).appendTo($ul);
                index++;
            }
        } else {
            this.makeLi(1,"visible").appendTo($ul);
            this.makeThreeLi().appendTo($ul);
            this.makeLi(to - 1, "visible").appendTo($ul);
            this.makeLi(to,"disabled").appendTo($ul);
            this.makeLi(to + 1, "visible").appendTo($ul);
            this.makeThreeLi().appendTo($ul);
            this.makeLi(this.totalPage,"visible").appendTo($ul);
        }
    }
    if(endDiff == 0) {
        this.makeLi(-1,"disabled").appendTo($ul);
    } else {
        this.makeLi(-1,"visible").appendTo($ul);
    }
    var level = this.pageId;
    var keyword = this.keyword;
    $('#row-' + this.pageId + '-' + this.currentPage).animate({opacity:'toggle'},'fast',function () {
        var $toRow = $('#row-' + level + '-' + to);
        console.log($toRow);
        if($toRow.size() > 0) {
            $toRow.fadeIn('slowly')
        } else {
            startSonic($('#container-' + level));

            $.ajax({
                type: 'GET',		//GETでリクエストを送信
                url:  '/searches/search_page?page='+to+'&keyword=' + keyword,
                datatype: 'xml',	//xml形式で受信する
                success: function(responseText, status) {
                    makeRow($(responseText), level, to);
                    stopSonic();
                }

            });
            $('#' + level + '-' + to).fadeIn('slowly');
        }
    });
    this.currentPage = to;
 };
Pagination.prototype.makeLi = function(pageNumber,activeType) {
        var pageText = pageNumber;
        if(pageText == 0) {
            pageText = "Prev";
        } else if(pageText == -1) {
            pageText = "Next";
        }
        
        if(activeType == "visible") {
            $li =  $('<li class="'+activeType+'"><a name="p'+this.pageId+'-'+pageNumber+'" href="javascript:doPagination('+this.pageId+','+pageNumber+');">'+pageText+'</a></li>');
        } else {
            $li =  $('<li class="'+activeType+'"><a>'+pageText+'</a></li>');           
        }
        return $li;
    };
    
Pagination.prototype.makeThreeLi = function() {
        return $('<li class="disabled"><a>…</a></li>');
    };
