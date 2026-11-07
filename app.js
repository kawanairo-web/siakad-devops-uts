// SIAKAD mini: data KRS dan pengambilan kuota kelas
const tick = () => new Promise((resolve) => setImmediate(resolve));

function buatDb() {
  return {
    mahasiswa: [
      { npm: '248160027', nama: 'Jonathan Immanuel Sihombing', uktLunas: true },
      { npm: '248160029', nama: 'Budi Santoso', uktLunas: false },
    ],
    kelas: [
      { id: 'IF101', matkul: 'Algoritma', kuota: 40, terisi: 0 },
      { id: 'IF103', matkul: 'Jaringan Komputer', kuota: 1, terisi: 0 },
    ],
  };
}

// Ambil satu kursi (membaca lalu menulis terpisah, tidak atomik)
async function ambilKursi(db, id) {
  const k = db.kelas.find((x) => x.id === id);
  if (!k) return { berhasil: false, alasan: 'KELAS_TIDAK_ADA' };
  const terisiSaatIni = k.terisi;
  await tick(); // simulasi query database
  if (terisiSaatIni >= k.kuota) return { berhasil: false, alasan: 'KUOTA_PENUH' };
  await tick();
  k.terisi = terisiSaatIni + 1;
  return { berhasil: true };
}

// Isi KRS: UKT harus lunas, lalu ambil kursi
async function isiKrs(db, npm, idKelas) {
  const mhs = db.mahasiswa.find((m) => m.npm === npm);
  if (!mhs) return { ok: false, alasan: 'MAHASISWA_TIDAK_ADA' };
  if (!mhs.uktLunas) return { ok: false, alasan: 'UKT_BELUM_LUNAS' };
  const hasil = await ambilKursi(db, idKelas);
  return hasil.berhasil ? { ok: true } : { ok: false, alasan: hasil.alasan };
}

module.exports = { buatDb, ambilKursi, isiKrs };

// Demo: node app.js
if (require.main === module) {
  (async () => {
    const db = buatDb();
    console.log('Jonathan:', await isiKrs(db, '248160027', 'IF101'));
    console.log('Budi    :', await isiKrs(db, '248160029', 'IF101'));
    const serentak = await Promise.all(
      Array.from({ length: 5 }, () => ambilKursi(db, 'IF103'))
    );
    console.log('Kelas IF103 kuota 1, 5 mahasiswa serentak -> berhasil:',
      serentak.filter((h) => h.berhasil).length);
  })();
}
