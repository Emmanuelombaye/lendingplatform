@echo off
echo Starting user deletion process...
cd /d "c:\Users\Antidote\Desktop\vertex\vertexloans\backend"
echo Current directory: %CD%
echo.
echo Running deletion script...
node deleteAllUsersFinal.js
echo.
echo Script execution completed.
pause
