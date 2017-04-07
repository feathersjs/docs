#!/bin/bash
# parent folder for files to compare
folder=/examples/step/

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
    diff -bdur --new-file $1 $2 > $3.diff
    diff2html -i file -s line --su hidden -F $3-line.html -- $3.diff
    diff2html -i file -s side --su hidden -F $3-side.html -- $3.diff
}

# diff files
buildDiff 01/db-connector/1.js 01/rest/1.js _diff/01-rest-1
buildDiff 01/rest/1.js 01/rest/2.js _diff/01-rest-2
buildDiff 01/db-connector/1.js 01/common/public/feathers-app.js _diff/01-rest-2-client
buildDiff 01/rest/2.js 01/websocket/1.js _diff/01-websocket-1
buildDiff 01/common/public/rest.html 01/common/public/socketio.html _diff/01-websocket-socketio
buildDiff 01/websocket/1.js 01/hooks/1.js _diff/01-hooks-1
buildDiff 01/hooks/1.js 01/hooks/2.js _diff/01-hooks-2
buildDiff 01/common/public/feathers-app-del.js 02/app/public/feathers-app.js _diff/02-app-feathers-app

#buildDiff 02/app/src/app.js 02/service/src/app.js _diff/02-service-src-app
#buildDiffDir 02/app/ 02/app1/ _diff/02-app1
#buildDiffDir 02/app/ 02/service/ _diff/02-service
#buildDiff 02/app1/src/services/teams/hooks/index.js 02/service/src/services/teams/hooks/index.js _diff/02-service-teams-hooks

buildDiffDir 02/gen1/ 02/gen2/ _diff/02-gen2
buildDiff 02/gen1/config/default.json 02/gen2/config/default.json _diff/02-gen2-default
buildDiff 02/gen1/src/services/index.js 02/gen2/src/services/index.js _diff/02-gen2-service
buildDiff 02/gen1/src/app.js 02/gen2/src/app.js _diff/02-gen2-app
buildDiff 02/gen1/package.json 02/gen2/package.json _diff/02-gen2-package

buildDiffDir 02/gen2/ 02/gen3/ _diff/02-gen3

buildDiffDir 02/gen3/ 02/gen4/ _diff/02-gen4
buildDiff 02/gen3/src/services/teams/teams.hooks.js 02/gen4/src/services/teams/teams.hooks.js _diff/02-gen4-hooks

# restore original pwd
cd ${startPwd}