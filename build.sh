#!/usr/bin/env bash

set -e
set -v

# clean previous builds
./clean.sh

# compile TypeScript
tsc

# Bundle JS assets
find dist/public ! -path dist/public -type d | while read d; do
	browserify --debug -g uglifyify $d/*.js > "$d/bundle.js"
	if [ ! -s "$d/bundle.js" ]; then
		rm "$d/bundle.js"
	fi
done

# Copy assets
cp -r src/assets dist/.
