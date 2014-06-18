#encoding: utf-8
require 'rubygems'
require 'test_helper'
require 'selenium-webdriver'

class SearchTest < Test::Unit::TestCase

  def setup
    @driver =  Selenium::WebDriver.for :firefox
    @driver.navigate.to "http://localhost/searches"    
    @timestamp =  Time.now.strftime("%Y%m%dT%H%M%S")
  end
  
  def teardown
    @driver.quit    
  end

  def test001
    keyword = @driver.find_element(:name,"keyword")
    keyword.send_keys "オライリー"
    keyword.submit
    
    sleep(2)
    @driver.save_screenshot("./test/unit/#{@timestamp}-001.png")
    assert true
  end
  
  def test002
    keyword = @driver.find_element(:name,"keyword")
    keyword.send_keys "オライリー"
    keyword.submit
    sleep(2)
    button = @driver.find_element(:name,"button0-2")
    @driver.execute_script("arguments[0].click()",button)
    sleep(2)
    @driver.save_screenshot("./test/unit/#{@timestamp}-002-01.png")
    button = @driver.find_element(:name,"button1-3")
    @driver.execute_script("arguments[0].click()",button)
    sleep(2)
    @driver.save_screenshot("./test/unit/#{@timestamp}-002-02.png")
    assert true    
  end
  
  def test003
    keyword = @driver.find_element(:name,"keyword")
    keyword.send_keys "オライリー"
    keyword.submit
    sleep(2)
    page = @driver.find_element(:name, "p0-5")
    @driver.execute_script("arguments[0].click()", page)
    sleep(2)
    @driver.save_screenshot("./test/unit/#{@timestamp}-003-01.png")
    page = @driver.find_element(:name, "p0-10")
    @driver.execute_script("arguments[0].click()", page)
    sleep(2)
    @driver.save_screenshot("./test/unit/#{@timestamp}-003-02.png")
    assert true
  end
end
