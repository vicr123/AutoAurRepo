#!/bin/bash
mkdir -p $DESTDIR/opt/autoaurrepo
mkdir -p $DESTDIR/usr/bin
mkdir -p $DESTDIR/etc
mkdir -p $DESTDIR/usr/lib/systemd/system

cp -r ../* $DESTDIR/opt/autoaurrepo
rm -rf $DESTDIR/opt/autoaurrepo/{config.json,.vscode,dist,pkgbuild}

cp autoaurrepo $DESTDIR/usr/bin

cp ../config.json $DESTDIR/etc/autoaurrepo.json
cp autoaurrepo.service autoaurrepo.timer $DESTDIR/usr/lib/systemd/system

cd $DESTDIR/opt/autoaurrepo
npm install