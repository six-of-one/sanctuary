:: command line, sendto, file clicker script
:: silly lock to chrome location
:: if you dont run chrome / chromium - click on the index.html and open it / drag it to web-browser of choice

"C:\Program Files (x86)\chrome-win\chrome.exe" --allow-file-access-from-files file:///%cd%\index.html
::@echo off
:: set /p input="hit <ENTER>"