#!/bin/bash

export cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

export GOPATH=`pwd`
export WORKDIR=$GOPATH/src/github.com/Tang-RoseChild/redis-admin
export FRONT_DIR=$GOPATH/src/github.com/Tang-RoseChild/redis-admin/front

go get github.com/Tang-RoseChild/redis-admin/backend
if [[ $? != 0 ]]; then
  echo "go get github.com/Tang-RoseChild/redis-admin/backend failed"
  exit 1
fi

cd $FRONT_DIR 
$cnpm install 
if [[ $? != 0 ]]; then
  echo "cnpm install failed..."
  echo "will use npm for installing,this will cost a lot of time...."
  npm install
fi

if [[ $? != 0 ]]; then
  echo "install failed, please fixed it, than re-run"
  exit 1
fi

npm run build 

mv static ../static
cd  $WORKDIR

$GOPATH/bin/backend 


