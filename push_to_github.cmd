@echo off
cd /d "%~dp0"
echo ============================================
echo  Pushing 3D Monster Studio to GitHub (Rocky)
echo ============================================

git init

rem Configure local git identity if not set
git config user.name "Danielwu9226"
git config user.email "danielwu9226@users.noreply.github.com"

git remote remove origin 2>nul
git remote add origin https://github.com/Danielwu9226/OMA-Animation.git

git checkout -b Rocky 2>nul || git checkout Rocky
git add .
git commit -m "Add 3D Monster Studio & Asset Vault web application"
git push -u origin Rocky

echo.
echo ============================================
echo  Finished! Check branch 'Rocky' on GitHub!
echo ============================================
pause
