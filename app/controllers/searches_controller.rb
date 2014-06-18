#encoding=utf-8
# -*- coding: utf-8 -*-
require 'nokogiri'
require 'uri'
require 'openssl'
require 'base64'
require 'cgi'
require 'net/http'
class SearchesController < ApplicationController
  def initialize
      @associate_tag = 'quotto-22'
      @access_key_id = 'AKIAJXX4HHBHSNNIIYEA'
      @secret_key = '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'
      super
  end

  # GET /searches
  # GET /searches.json
  def index
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json}
    end
  end
  
  def search
    keyword = params[:keyword]
    param_list = Hash::new
    param_list["Keywords"] = keyword
    param_list["Operation"] = "ItemSearch"
    param_list["ResponseGroup"] = "Small,ItemAttributes,Images"
    param_list["SearchIndex"] = "All"
    @amazon = request_search(param_list)
    xml = Nokogiri::XML(@amazon)
    @totalPage = (xml.css('TotalResults').text.to_i / 5.0).ceil
    if @totalPage > 10 then
      @totalPage = 10
    end
    #javascriptの処理時にダブルクォーテーションで囲むためデータ中のものは一時エスケープする
    @searchword = keyword.gsub('"','\"')
    @amazon = @amazon.gsub('"','\"')
    @amazon = @amazon.gsub(/\n/,'')

    respond_to do |format|
      format.html # search.html.erb
    end
  end
  
  def search_page
    keyword = params[:keyword]
    page = params[:page]
    page = (page.to_i * 0.5).ceil
    param_list = Hash::new
    param_list["Keywords"] = keyword
    param_list["Operation"] = "ItemSearch"
    param_list["ResponseGroup"] = "Small,ItemAttributes,Images"
    param_list["SearchIndex"] = "All"
    param_list["ItemPage"] = page.to_s
    xml = request_search(param_list)
    
    render :text  => xml, :status => '200'
  end
  
  def relationSearch
    asin = params[:asin]
    param_list = Hash::new
    param_list["Operation"] = "CartCreate"
    param_list["ResponseGroup"] = "CartSimilarities"
    param_list["Item.1.ASIN"] = asin.to_s
    param_list["Item.1.Quantity"] = "1"
    xml = Nokogiri::XML(request_search(param_list))
    
    asins = ""
    xml.css('SimilarProduct').each do |similarItem|
      asins << similarItem.css('ASIN').text << ','
    end
    asins.slice!(asins.length - 1)
    
    search_param_list = Hash::new
    search_param_list["ItemId"] = asins.to_s
    search_param_list["Operation"] = "ItemLookup"
    search_param_list["ResponseGroup"] = "Small,ItemAttributes,Images"
    xml = request_search(search_param_list)
    
    render :text => xml, :status=> '200'    
  end
  
  def request_search(opt)
    timestamp = Time.now.utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    opt["Service"] = "AWSECommerceService"
    opt["AWSAccessKeyId"] = @access_key_id
    opt["AssociateTag"] = @associate_tag
    opt["Timestamp"] = timestamp
    opt["Version"] = "2011-08-01"

    param = ""
    opt.sort.each do |key, value|
      if param.length > 0 then
        param += "&"
      end
      param += "#{key}=#{CGI.escape(value)}"
    end
    request = "GET" + "\n" + "ecs.amazonaws.jp" + "\n" + "/onca/xml" + "\n" + param
    signature = OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha256'),'GQ4WOIpnOgB5pCi3yJQQYhgAIrbCbwpL9x++CMVl', request)
    puts "before pack:#{signature}"
    signature = [signature].pack('m').chomp
    puts "after pack:#{signature}"
    signature = URI.escape(signature, Regexp.new("[+=]"))
    url = "http://ecs.amazonaws.jp/onca/xml?" + param + "&Signature=" + signature
    result = Net::HTTP.get_response(URI::parse(url))
    return result.body
  end  
end