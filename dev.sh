#!/usr/bin/env bash
PROJECT=$npm_config_project
APP=$npm_config_app
echo $APP
echo $npm_config_app
[ -z "$npm_config_app" ] && echo "Empty"
if [ -z "$APP" ]
then
  concurrently "PROJECT=${PROJECT} APP=fxh nuxt -p=3000" "PROJECT=${PROJECT} APP=asset-management nuxt -p=3001"
else
  PROJECT=${PROJECT} APP=${APP} nuxt
fi
