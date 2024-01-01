import { Decoder, tools, Reader } from 'ts-ebml';
import AES256 from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
const readAsArrayBuffer = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = (ev) => {
      reject(ev.error);
    };
  });
};

export const injectMetadata = (blob) => {
  const decoder = new Decoder();
  const reader = new Reader();
  reader.logging = false;
  reader.drop_default_duration = false;

  return readAsArrayBuffer(blob).then((buffer) => {
    const elms = decoder.decode(buffer);
    elms.forEach((elm) => {
      reader.read(elm);
    });
    reader.stop();

    const refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas,
      reader.duration,
      reader.cues
    );
    const body = buffer.slice(reader.metadataSize);

    return new Blob([refinedMetadataBuf, body], { type: blob.type });
  });
};

export const encryptSenderKey = (senderKey, fileKey) => {
  return AES256.encrypt(senderKey, fileKey).toString();
};

export const decryptSenderKey = (encryptSenderKey, fileKey) => {
  return AES256.decrypt(encryptSenderKey, fileKey).toString(Utf8);
};

// export const test = () => {
//   var seed = superCop.createSeed();
//   var keys = superCop.createKeyPair(seed);
//   var msg = new TextEncoder('utf-8').encode('hello there');
//   var sig = superCop.sign(msg, keys.publicKey, keys.secretKey);
//   console.log(superCop.verify(sig, msg, keys.publicKey)); // true
// };
