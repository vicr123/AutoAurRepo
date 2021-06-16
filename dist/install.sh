#!/bin/bash
mkdir -p $DESTDIR/opt/autoaurrepo
mkdir -p $DESTDIR/usr/bin
mkdir -p $DESTDIR/etc
mkdir -p $DESTDIR/usr/lib/systemd/system

cp -r ../*[^dist][^pkgbuild][^.vscode] $DESTDIR/opt/autoaurrepo
ln -s /opt/autoaurrepo/index.js $DESTDIR/usr/bin/autoaurrepo

cp ../config.json $DESTDIR/etc/autoaurrepo.json
cp autoaurrepo.service autoaurrepo.timer $DESTDIR/usr/lib/systemd/system

cd $DESTDIR/opt/autoaurrepo
npm install