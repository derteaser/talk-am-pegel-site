#!/usr/bin/env bash
git pull
/usr/local/bin/php73 ~/composer.phar install --no-dev -d ${PWD}
