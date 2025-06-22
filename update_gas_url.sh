#!/bin/bash

# GAS Web App URL更新スクリプト
# 使用方法: ./update_gas_url.sh "新しいURL"

if [ -z "$1" ]; then
    echo "使用方法: $0 \"新しいGAS Web App URL\""
    echo "例: $0 \"https://script.google.com/macros/s/NEW_URL/exec\""
    exit 1
fi

NEW_URL="$1"
echo "GAS Web App URLを更新します: $NEW_URL"

# index.htmlの更新
if [ -f "index.html" ]; then
    echo "index.htmlを更新中..."
    sed -i.bak "s|const GAS_WEB_APP_URL = '.*';|const GAS_WEB_APP_URL = '$NEW_URL';|g" index.html
    echo "✅ index.html更新完了"
else
    echo "❌ index.htmlが見つかりません"
fi

# html_files/main_app/index.htmlの更新
if [ -f "html_files/main_app/index.html" ]; then
    echo "html_files/main_app/index.htmlを更新中..."
    sed -i.bak "s|const GAS_WEB_APP_URL = '.*';|const GAS_WEB_APP_URL = '$NEW_URL';|g" html_files/main_app/index.html
    echo "✅ html_files/main_app/index.html更新完了"
else
    echo "❌ html_files/main_app/index.htmlが見つかりません"
fi

echo ""
echo "🎉 URL更新完了！"
echo "次のステップ:"
echo "1. gas_connection_test.htmlで接続テストを実行"
echo "2. ログイン機能をテスト"
echo "3. デバッグ出力を確認"
