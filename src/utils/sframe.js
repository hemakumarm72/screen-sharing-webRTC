import { SFrame } from 'sframe/Client';

//Create crypto client
const senderClient = await SFrame.createClient('kjh', {
  skipVp8PayloadHeader: true,
});
/*
 Get some key material to use as input to the deriveKey method.
 The key material is a secret key supplied by the user.
 */
async function getRoomKey(roomId, secret) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(roomId),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CTR', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}
//Shared key for encryption
const shared = await getRoomKey(roomid, secret);

// Key pair for signing and verifying
const keyPair = await window.crypto.subtle.generateKey(
  {
    name: 'ECDSA',
    namedCurve: 'P-521',
  },
  true,
  ['sign', 'verify']
);
await senderClient.setSenderEncryptionKey(shared);
await senderClient.setSenderSigningKey(keyPair.privateKey);

//Encrypt it
for (const transceiver of senderClient.getTransceivers())
  pc.encrypt(transceiver.mid, transceiver.sender);

// OR you can do insted
for (const track of stream.getTracks()) {
  //Add to pc
  const sender = pc.addTrack(track);
  //Encrypt it
  senderClient.encrypt(track.id, sender);
}
