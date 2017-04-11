#!/bin/bash
# parent folder for files to compare
folder=/examples/chat/

# create dir for diffs
rm -rf ${PWD}${folder}_diff
mkdir ${PWD}${folder}_diff

# set working pwd
startPwd=${PWD}
cd ${PWD}${folder}

# diff a file
function buildDiff {
    echo $3
    diff -bdu $1 $2 > $3.diff
    diff2html -i file -s line --su hidden -F $3-line.html -- $3.diff
    diff2html -i file -s side --su hidden -F $3-side.html -- $3.diff
}

# diff a directory
function buildDiffDir {
    echo $3

    if [ -z "$4" ] ; then
        diff -bdur --new-file $1 $2 > $3.diff
    else
        exclude=$4
   echo diff -bdur --exclude-from=../$4 --new-file $1 $2
        diff -bdur --exclude-from=../$4 --new-file $1 $2 > $3.diff
    fi

    diff2html -i file -s line --su hidden -F $3-line.html -- $3.diff
    diff2html -i file -s side --su hidden -F $3-side.html -- $3.diff
}

# diff files
buildDiffDir server/start/ server/client/ _diff/server-client
buildDiffDir server/client/ server/finish/ _diff/server-finish
buildDiffDir server/finish/ client/jquery _diff/client-jquery make-diffs-ignore-public.txt
buildDiffDir client/jquery client/webpack _diff/client-webpack make-diffs-ignore-public.txt
buildDiff client/jquery/public/client.html client/webpack/public/client.html _diff/client-webpack-html
buildDiff client/jquery/public/client-app.js client/webpack/client/app.js _diff/client-webpack-client
buildDiff client/jquery/package.json client/webpack/package.json _diff/client-webpack-package

# restore original pwd
cd ${startPwd}