var express = require('express');
var router = express.Router();
var {
    getSingerByKeyword,
    getSongsListByWords,
    getSongsListByAlbumId,
    getAlbumListBySingerMid,
    getAlbumsListByWords,
    getLyricBySongid,
    getVKey,
    download,
    downloadSingerSongs
} = require('../src/qq')

/* GET singer info */
router.get("/getSingerByKeyword", async function (req, res, next) {
    try {
        let data = await getSingerByKeyword(req.body.keyword || req.query.keyword, req.body.page, req.body.size || req.query.size)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});

/* GET albums list. */
router.get("/getAlbumsByKeyword", async function (req, res, next) {
    try {
        let data = await getAlbumsListByWords(req.body.keyword || req.query.keyword, req.body.page, req.body.size || req.query.size)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});
router.get("/getAlbumsBySinger", async function (req, res, next) {
    try {
        let data = await getAlbumListBySingerMid(req.body.singermid || req.query.singermid, req.body.page, req.body.size || req.query.size)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});


/* GET songs list. */
router.get("/getSongsListByKeyword", async function (req, res, next) {
    try {
        let data = await getSongsListByWords(req.body.keyword || req.query.keyword, req.body.page, req.body.size)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});
router.get("/getSongsListByAlbum", async function (req, res, next) {
    try {
        let data = await getSongsListByAlbumId(req.body.albummid || req.query.albummid, req.body.page, req.body.size)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});
router.get("/getSongsListBySinger", async function (req, res, next) {
    try {
        // todo 通过歌手mid获取歌曲列表
        // let data = await getSongsListByWords(req.body.singermid || req.query.singermid, req.body.page, req.body.size)
        res.send({})
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});

/* GET lyric. */
router.get("/getLyricBySong", async function (req, res, next) {
    try {
        let data = await getLyricBySongid(req.body.songid || req.query.songid, req.body.page, req.body.size)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});

/* GET vip key. */
router.get("/getVKey", async function (req, res, next) {
    try {
        let data = await getVKey()
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});

/* 下载文件 */
router.get("/download", async function (req, res, next) {
    try {
        let data = await download(req.query.quantity, req.query.strMediaMid, req.query.songName, req.query.album, req.query.singer)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});

/*  */
router.get("/downloadBySinger", async function (req, res, next) {
    try {
        let data = await downloadSingerSongs(req.body.singer || req.query.singer)
        res.send(data)
    } catch (e) {
        res.send({code: 200, err: e.message})
    }
});

module.exports = router;
