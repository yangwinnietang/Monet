@echo off
chcp 65001 >nul
title 讯飞数字人项目启动器

echo ========================================
echo 讯飞数字人项目一键启动
echo ========================================
echo.

echo [1/4] 检查项目结构...
if not exist "avatar-sdk-web_demo\avatar-sdk-web_demo" (
    echo 错误: 找不到React项目目录
    echo 请确保在正确的项目根目录下运行此脚本
    pause
    exit /b 1
)

echo [2/4] 切换到React项目目录...
cd /d "avatar-sdk-web_demo\avatar-sdk-web_demo"

echo [3/4] 检查依赖安装状态...
if not exist "node_modules" (
    echo 未发现node_modules目录，开始安装依赖...
    echo 正在执行: npm install
    npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        echo 请检查网络连接或尝试使用cnpm
        pause
        exit /b 1
    )
    echo 依赖安装完成!
) else (
    echo 依赖已安装，跳过安装步骤
)

echo [4/4] 启动开发服务器...
echo 正在执行: npm run dev
echo 请等待服务器启动完成...
echo.
npm run dev

if errorlevel 1 (
    echo 错误: 开发服务器启动失败
    pause
    exit /b 1
)

pause