const test = require('node:test');
const assert = require('node:assert');
const { buatDb, ambilKursi, isiKrs } = require('./app');

test('KRS berhasil jika UKT lunas', async () => {
  const hasil = await isiKrs(buatDb(), '248160027', 'IF101');
  assert.strictEqual(hasil.ok, true);
});

test('KRS ditolak jika UKT belum lunas', async () => {
  const hasil = await isiKrs(buatDb(), '248160029', 'IF101');
  assert.strictEqual(hasil.alasan, 'UKT_BELUM_LUNAS');
});

test('ambil kursi ditolak saat kuota penuh', async () => {
  const db = buatDb();
  await ambilKursi(db, 'IF103');
  const hasil = await ambilKursi(db, 'IF103');
  assert.strictEqual(hasil.alasan, 'KUOTA_PENUH');
});
