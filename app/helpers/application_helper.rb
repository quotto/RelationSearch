module ApplicationHelper
  #現在のページタイトルを取得する
  def page_title
    t("title.#{controller_name}.#{action_name}")
  end
end
