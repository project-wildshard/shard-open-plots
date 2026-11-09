# One Sharp binding for the author tools

The NM5 fixed-input cook comparison found a separate NM7 follow-up.
Open Plots directly installed Sharp 0.34.5.
Its pinned sharddev already installed Sharp 0.35.5.
Loading both public APIs reproduced a real macOS warning.
Two libvips libraries registered GNotificationCenterDelegate twice.
The versions were libvips 8.17.3 and 8.18.7.

Align the direct Sharp dependency to sharddev's existing 0.35.5.
No asset source, capture implementation or graphical code changes.
Keep engine at the same full 80d5cc0 source revision.
Expand format and sharddev's short Git pins to their existing full hashes.
The lock's resolved Git tarballs remain identical.
Use that same format revision as an override for the short transitive pin.
This lets a current frozen lock regenerate without changing source versions.

Reproduce and validate in a disposable, private virtual-store install.
The clone disables the global virtual store and uses package-import-method copy.
Do not install or flip local aliases in the shared checkout.
The first fresh virtual store measured 661488 KiB.
The aligned fresh frozen install measured 623812 KiB.
The reduction is 37676 KiB, about 36.8 MiB on this Mac.

The public root and SDK Sharp imports now return the same module object.
Both report Sharp 0.35.5 and libvips 8.18.7.
The actual duplicate Objective-C warning no longer appears.
Exercise PNG encoding, nearest resizing, compositing and raw pixel decoding.
The 8 by 8 RGBA result is identical before and after the dependency change.
Its SHA256 is 6768a5cec1e533fa84add0474ba104dfc225bdc1c4831e8e01b386f6e405e39f.
The regenerated lock removes the older Sharp and libvips dependency closure.

This is a local source commit, not a claim of hosted CI completion.
The global J201 timing lease is active until approximately 20:41 UTC.
Normal full checks and the unmodified push hook follow that boundary.
Do not disturb another lane's timing proof with an unadmitted full check.
The earlier NM5 full/trimmed package pair predates this change.
All 3877 Open Plots files matched in that independent same-input comparison.
