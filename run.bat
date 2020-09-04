cd .bat
start "nodemon" 0_webpack-ui.bat
TIMEOUT /T 5
start "nodemon" 1_nodemon.bat
start "livereload" 2_livereload.bat