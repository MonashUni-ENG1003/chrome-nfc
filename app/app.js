var compatibleDevices = [
  {
    deviceName: 'ACR122U USB NFC Reader',
    productId: 0x2200,
    vendorId: 0x072f,
    thumbnailURL: chrome.runtime.getURL('images/acr122u.png')
  },
  {
    deviceName: 'SCL3711 Contactless USB Smart Card Reader',
    productId: 0x5591,
    vendorId: 0x04e6,
    thumbnailURL: chrome.runtime.getURL('images/scl3711.png')
  }
]

var readTagsData = "";

var tagNo = 0;

var device = null;

function log(message, object) {
  var logArea = document.querySelector('.logs');
  var pre = document.createElement('pre');
  pre.textContent = message;
  if (object)
    pre.textContent += ': ' + JSON.stringify(object, null, 2) + '\n';
  logArea.appendChild(pre);
  logArea.scrollTop = logArea.scrollHeight;
  document.querySelector('#logContainer').classList.remove('small');
}

function handleDeviceTimeout(func, args) {
  var timeoutInMs = 1000;
  var hasTags = false;
  setTimeout(function() {
    if (!hasTags) {
      log('Timeout! No tag detected');
    }
  }, timeoutInMs);
  var args = args || [];
  args = args.concat([function() { hasTags = true; }]);
  func.apply(this, args);
}

function onReadNdefTagButtonClicked() {
  handleDeviceTimeout(readNdefTag);
}

function readNdefTag(callback) {
  chrome.nfc.findDevices(function(devices) {
    var device = devices[0];
    chrome.nfc.read(device, {}, function(type, ndef) {
      log('Found ' + ndef.ndef.length + ' NFC Tag(s)');
      console.log(ndef);
      var uri = ndef.ndef[0]["uri"];
      log('NFC Tag', ndef.ndef[0]);
      console.log(uri);
      callback();
    });
  });
}

function onReadTagsButtonClicked() {
  handleDeviceTimeout(readTags);
}

function readTags(callback) {
  tagNo = Number(document.getElementById("read-tags-no").value);
  console.log(tagNo);
  chrome.nfc.findDevices(function(devices) {
    var device = devices[0];
    chrome.nfc.read(device, {}, function(type, ndef) {
      chrome.storage.local.get("uid",function(result){
        var uid = result.uid.toString(); 
        console.log(uid); 
        // got uid, form uri.
        var base = "http://eng1003.eng.monash.edu/d/scan.php?id=";
        var uri = base + uid.toString();
        var ndef = [
          {"uri": uri}
        ];
        chrome.nfc.write(device, {"ndef": ndef}, function(rc) {
          if (!rc) {
            console.log("WRITE() success!");
            chrome.nfc.read(device, {}, function(type, ndef) {
              var uri = ndef.ndef[0]["uri"];
              console.log(uri);
            })
            log('1 NFC Tag written');
            var tagNo = document.getElementById("read-tags-no").value;
            readTagsData += tagNo.toString() + "," + uri + "\r\n";
            document.querySelector('#read-tags-data').textContent = readTagsData.toString();
            document.getElementById("read-tags-no").value = Number(tagNo) + 1;
          } else {
            console.log("WRITE() FAILED, rc = " + rc);
          }
        });
      });
    });
  });
  callback();
}

function showDeviceInfo() {
  var deviceInfo = null;
  for (var i = 0; i < compatibleDevices.length; i++)
    if (device.productId === compatibleDevices[i].productId && 
        device.vendorId === compatibleDevices[i].vendorId)
      deviceInfo = compatibleDevices[i];
    
  if (!deviceInfo)
    return;
  
  var thumbnail = document.querySelector('#device-thumbnail');
  thumbnail.src = deviceInfo.thumbnailURL;
  thumbnail.classList.remove('hidden');
  
  var deviceName = document.querySelector('#device-name');
  deviceName.textContent = deviceInfo.deviceName;
  
  var productId = document.querySelector('#device-product-id');
  productId.textContent = deviceInfo.productId;
  
  var vendorId = document.querySelector('#device-vendor-id');
  vendorId.textContent = deviceInfo.vendorId;
  
  $('a[href="#device-info"]').tab('show');
}

function enumerateDevices() {
  chrome.nfc.findDevices(function(devices) {
    device = devices[0];
    showDeviceInfo(); 
  });
}

enumerateDevices();

function readNdef() {
  "Instructions: \r\n Scan tag.";
}

function readTagsInstruction() {
  "Instructions: \r\n Scan tag. System will write the data to the tag based on its uid.";
} 


document.querySelector('#read-ndef pre').textContent = readNdef.toString();
document.querySelector('#read-ndef button').addEventListener('click', onReadNdefTagButtonClicked);

document.querySelector('#read-tags pre').textContent = readTagsInstruction.toString();
document.querySelector('#read-tags-data').textContent = readTagsData.toString();
document.querySelector('#read-tags button').addEventListener('click', onReadTagsButtonClicked);

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  document.querySelector('#logContainer').classList.add('small');
});

document.querySelector('.drawer').addEventListener('click', function(e) {
  document.querySelector('#logContainer').classList.toggle('small');
});
