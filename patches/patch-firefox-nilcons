#!/bin/bash

set -e

tempdir=$(mktemp -d)
mkdir "$tempdir/extract"
cd "$tempdir/extract"
set +e
unzip /usr/lib/firefox/browser/omni.ja
if [ "$?" -ne 0 ]; then
  echo >&2 "Unexpected exit code from unzip"
  exit 1
fi
set -e
patch -p1 <<EOF
--- ./chrome/browser/content/browser/browser.xhtml	2010-01-01 00:00:00.000000000 +0100
+++ ./chrome/browser/content/browser/browser.xhtml.new	2020-03-22 19:32:36.283963602 +0100
@@ -272,8 +272,10 @@
          data-l10n-id="window-new-shortcut"
          command="cmd_newNavigator"
          modifiers="accel" reserved="true"/>
-    <key id="key_newNavigatorTab" data-l10n-id="tab-new-shortcut" modifiers="accel"
-         command="cmd_newNavigatorTabNoEvent" reserved="true"/>
+    <key id="key_newNavigatorTab" data-l10n-id="tab-new-shortcut" modifiers="accel" oncommand="BrowserHome({ button: 1 });" reserved="true"/>
+    <key id="gregzilla_prevTab" key="p" modifiers="accel,alt" oncommand="gBrowser.tabContainer.advanceSelectedTab(-1, true);" reserved="true"/>
+    <key id="gregzilla_prevTab" key="n" modifiers="accel,alt" oncommand="gBrowser.tabContainer.advanceSelectedTab(1, true);" reserved="true"/>
+
     <key id="focusURLBar" data-l10n-id="location-open-shortcut" command="Browser:OpenLocation"
          modifiers="accel"/>
     <key id="focusURLBar2" data-l10n-id="location-open-shortcut-alt" command="Browser:OpenLocation"
EOF
zip -qr9XD ../omni.ja *
sudo bash -c "cp /usr/lib/firefox/browser/omni.ja /usr/lib/firefox/browser/omni.ja.orig ; cat $tempdir/omni.ja >/usr/lib/firefox/browser/omni.ja"
find ~/.cache/mozilla/firefox -type d -name startupCache | xargs rm -rf
cd /
rm -r "$tempdir"
