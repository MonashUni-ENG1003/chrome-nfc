# ENG1003 Chrome Extension App for NFC

# Instructions

## Windows (Windows 7+)
Install zadig from http://zadig.akeo.ie/ and select the NFC device and replace the drivers with the libusbK driver. You may need administrator rights to replace the driver.

## Mac OSX (10.10.1+)
Run the following code
`sudo launchctl unload /System/Library/LaunchDaemons/com.apple.ifdreader.plist`
Reboot your mac with the device unplugged. You will need sudo rights to do this.

# Copyright
Copyright is asserted under the Apache License for this app excluding the Google NFC API, which is copyrighted by Google Inc, 2014.

