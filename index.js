const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); // script untuk penggunaan multer saat upload


// create data / insert data
app.post('/api/movie',upload.single('image'),(req, res) => {


    const data = { ...req.body };
     const judul= req.body.judul;
    const tahun_rilis= req.body.tahun_rilis;
    const sutradara= req.body.sutradara;
 

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO movie(judul,tahun_rilis,sutradara) values (?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ judul,tahun_rilis, sutradara], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const cover =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO movie(judul,tahun_rilis,sutradara,cover) values (?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ judul,tahun_rilis, sutradara,cover], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});


// read data / get data
app.get('/api/movie', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM movie';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/movie/:id', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM movie WHERE id= ?';
    const judul= req.body.judul;
    const sutradara= req.body.sutradara;
    const tahun_rilis= req.body.tahun_rilis;


    const queryUpdate = 'UPDATE movie SET judul=?,tahun_rilis=?,sutradara=? WHERE id= ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [judul,tahun_rilis,sutradara, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});


// delete data
app.delete('/api/movie/:id', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM movie WHERE id= ?';
    const queryDelete = 'DELETE FROM movie WHERE id= ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});


// buat server nya menggunakan port sesuai settingan konstanta = 5000
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

