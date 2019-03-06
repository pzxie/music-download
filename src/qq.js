const axios = require('axios')
const querystring = require('querystring');
const fs = require('fs')
const path = require('path')
const {recursiveDir, formatPath} = require('../common/util')
const {downloadQuantity, quantity, realPath} = require('../common/config')

const formatMap = {
    "sizeape": {
        prefix: "A0",
        suffix: "ape",
        mine: 'audio/ape'
    },
    "sizeflac": {
        prefix: "F0",
        suffix: "flac",
        mine: 'audio/x-flac'
    },
    "size320": {
        prefix: "M8",
        suffix: "mp3",
        mine: 'audio/mpeg'
    },
    "size128": {
        prefix: "M5",
        suffix: "mp3",
        mine: 'audio/mpeg'
    },
}

/**
 * 通过关键词获取歌曲列表
 * @param key 关键字
 * @param page default = 1, 当前页
 * @param size default = 100, 每页数量
 */
async function getSongsListByWords(key, page = 1, size = 100) {
    let result = null
    let param = {
        g_tk: "938407465",
        uin: 0,
        format: "json",
        inCharset: "utf-8",
        outCharset: "utf-8",
        notice: 0,
        platform: "h5",
        needNewCode: 1,
        w: key,
        zhidaqu: 1,
        catZhida: 1,
        t: 0, //type 类型 {歌曲：0，专辑：8，歌词：7}
        flag: 1,
        ie: "utf-8",
        sem: 1,
        aggr: 0,
        perpage: 20,
        n: size,
        p: page,
        remoteplace: "txt.mqq.all",
    }
    param = querystring.encode(param)
    let data = await axios.get('http://c.y.qq.com/soso/fcgi-bin/client_search_cp?' + param)
    if (data && data.data && data.data.data) {
        data = data.data.data.song
        if (data) result = {
            list: data.list,
            total: data.totalnum,
            page,
            size
        }
    }
    if (!result) {
        throw new Error('没有找到相关歌曲信息')
        return
    }
    return result
}

/**
 * 通过关键词获取专辑列表
 * @param key 关键字
 * @param page default = 1, 当前页
 * @param size default = 100, 每页数量
 */
async function getAlbumsListByWords(key, page = 1, size = 100) {
    let result = null
    let param = {
        g_tk: "938407465",
        uin: 0,
        format: "json",
        inCharset: "utf-8",
        outCharset: "utf-8",
        notice: 0,
        platform: "h5",
        needNewCode: 1,
        w: key,
        zhidaqu: 1,
        catZhida: 1,
        t: 8, //type 类型 {歌曲：0，专辑：8，歌词：7}
        flag: 1,
        ie: "utf-8",
        sem: 1,
        aggr: 0,
        perpage: 20,
        n: size,
        p: page,
        remoteplace: "txt.mqq.all",
        //                    _:1459991037831
    }
    param = querystring.encode(param)
    let data = await axios.get('http://c.y.qq.com/soso/fcgi-bin/client_search_cp?' + param)
    if (data && data.data && data.data.data && data.data.data.album) {
        data = data.data.data.album
        if (data) result = {
            list: data.list,
            total: data.totalnum,
            page,
            size
        }
    }
    if (!result) {
        throw new Error('没有找到相关专辑信息')
        return
    }
    return result
}

/**
 * 根据歌手id获取专辑列表
 * @param singermid 歌手mid
 * @param page default = 1, 当前页
 * @param size default = 100, 每页数量
 */
async function getAlbumListBySingerMid(singermid, page = 1, size = 100) {
    let result = null
    let param = {
        g_tk: 5381,
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0,
        data: encodeURIComponent(JSON.stringify({
            "singerAlbum": {
                "method": "get_singer_album",
                "param": {
                    "singermid": singermid,
                    "order": "time",
                    "begin": (page - 1) * size,
                    "num": page * size,
                    "exstatus": 1
                },
                "module": "music.web_singer_info_svr"
            }
        }))
    }
    param = querystring.encode(param)
    let data = await axios.get('https://u.y.qq.com/cgi-bin/musicu.fcg?' + param)
    if (data && data.data && data.data.singerAlbum) {
        data = data.data.singerAlbum.data
        if (data) result = {list: data.list, total: data.total, page, size}
    }
    if (!result) {
        throw new Error('没有找到相关专辑信息')
        return
    }
    return result
}

/**
 * 通过专辑mid获取专辑歌曲列表
 * @param albummid 专辑mid
 */
async function getSongsListByAlbumId(albummid) {
    let result = null
    let param = {
        platform: "h5page",
        albummid: albummid || '003bSL0v4bpKAx',
        g_tk: "938407465",
        uin: 0,
        format: "json",
        inCharset: "utf-8",
        outCharset: "utf-8",
        notice: 0,
        platform: "h5",
        needNewCode: 1,
    }
    param = querystring.encode(param)
    let data = await axios.get('http://i.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg?' + param)
    if (data && data.data && data.data.data) {
        result = data.data.data
    }
    if (!result) {
        throw new Error('没有找到相关歌曲信息')
        return
    }
    return result
}

/**
 * 通过关键字获取歌手信息
 * @param keyword 歌手名
 * @param isBlur 是否模糊搜索， 如果模糊搜索，则不精确匹配
 */
async function getSingerByKeyword(keyword, isBlur) {
    let result = null
    let param = {
        is_xml: 0,
        format: 'json',
        key: keyword,
        g_tk: '5381',
        loginUin: 0,
        hostUin: 0,
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0
    }
    param = querystring.encode(param)
    let data = await axios.get('https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?' + param)
    if (data && data.data && data.data.data && data.data.data.singer) {
        result = data.data.data.singer.itemlist
        // 如果不是模糊搜索，则精确匹配
        if (!isBlur && result && result.length) {
            result = result.filter(singer => singer.name.toLowerCase() === keyword.toLowerCase())
        }
    }
    if (!result || !result.length) {
        throw new Error('没有找到相关歌手信息')
        return
    }
    return result
}

/**
 * 通过歌曲id获取歌词
 * @param songid 歌曲id
 */
// fixme 获取歌词失败
async function getLyricBySongid(songid) {
    let result = null
    let param = {
        nobase64: 1,
        musicid: songid,
        g_tk: 5381,
        loginUin: 0,
        hostUin: 0.,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0
    }
    param = querystring.encode(param)
    let data = await axios.get('https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg?' + param)
    if (data && data.data && data.data.lyric) {
        result = data.data.lyric
    }
    if (!result) {
        throw new Error('没有找到相关歌词信息')
        return
    }
    return result
}


async function getVKey() {
    let uin = '1008611'
    let guid = '1234567890'
    let getVkeyUrl = `http://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=0&loginUin=${uin}&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&cid=205361747&uin=${uin}&songmid=003a1tne1nSz1Y&filename=C400003a1tne1nSz1Y.m4a&guid=${guid}`
    let data = await axios({
        url: getVkeyUrl,
        methods: 'get',
        timeout: 3500
    })
    if (data && data.data && data.data.data && data.data.data.items) {
        result = data.data.data.items[0].vkey
    }
    if (!result) {
        throw new Error('获取失败')
        return
    }
    return result
}

async function generateFile(data, directory, file) {
    return new Promise((resolve, reject) => {
        let stream = data.pipe(fs.createWriteStream(path.join(directory, file)))
        stream.on('finish', function () {
            resolve();
        });
        stream.on('error', (e) => {
            reject(e)
        })
    })
}

async function download(format, strMediaMid, songName, album, singer, type) {
    let relatePath = `${realPath}/${type === 'album' ? '专辑' : '单曲'}`
    album = formatPath(album)
    singer = formatPath(singer)
    songName = formatPath(songName)
    let directory = path.resolve(relatePath, singer, album)
    recursiveDir(directory)
    let url = `http://streamoc.music.tc.qq.com/${formatMap[format].prefix}00${strMediaMid}.${formatMap[format].suffix}?vkey=${global.vkey}&guid=1234567890&uin=1008611&fromtag=8`
    let file = `${songName}-${singer}.${formatMap[format].suffix}`
    try {
        if (fs.existsSync(path.resolve(directory, file))) return {success: true, file, exist: true}
        let data = await axios.get(url, {
            responseType: 'stream'
        })
        if (data && data.data) await generateFile(data.data, directory, file)
        else {
            throw {message: `${file}无可下载资源`, success: false}
            return
        }
        console.info('文件下载完成,', file)
        return {success: true, file}
    } catch (e) {
        throw {message: e.message || '文件下载失败:' + file}
        console.info('文件下载失败,', file)
    }
}

/**
 * 下载歌手的所有专辑的所有歌曲
 * @param singerName 歌手名
 */
async function downloadSingerSongs(singerName) {
    let failedList = []
    let total = 0
    let success = 0
    let fail = 0
    let result = null
    try {
        let data = await getSingerByKeyword(singerName)
        /*[{
         "docid": "4558",
         "id": "4558",
         "mid": "0025NhlN2yWrP4",
         "name": "周杰伦",
         "pic": "http://imgcache.qq.com/music/photo/mid_singer_58/P/4/0025NhlN2yWrP4.jpg",
         "singer": "周杰伦"
         }]*/
        if (data && !data.hasOwnProperty('err') && data[0] && data[0].mid) data = await getAlbumListBySingerMid(data[0].mid)
        /*{
         "list": [],
         "total": 31,
         "page": 1,
         "size": 100
         }*/
        if (data && !data.hasOwnProperty('err') && data.list && data.list.length) {
            for (let album of data.list) {
                let songs = await getSongsListByAlbumId(album.album_mid)
                if (songs && songs.list && songs.list.length) {
                    for (let song of songs.list) {
                        let format = ''
                        let strMediaMid = song.strMediaMid
                        if (song[downloadQuantity]) format = downloadQuantity
                        else {
                            for (let item of quantity) {
                                if (song[item]) {
                                    format = item
                                    break
                                }
                            }
                        }

                        if (!format) {
                            console.error(('文件下载失败——' + song.songname))
                            failedList.push({
                                album: song.albumname,
                                songname: song.songname,
                                singer: song.singer && song.singer[0] && song.singer[0].name
                            })
                            fail++
                            break
                        }
                        try {
                            total++
                            await download(format, strMediaMid, song.songname, song.albumname, song.singer && song.singer[0] && song.singer[0].name, 'album')
                            success++
                        } catch (e) {
                            console.error('文件下载失败: ' + song.songname + " ------ " + e.message)
                            fail++
                            failedList.push({
                                album: song.albumname,
                                songname: song.songname,
                                singer: song.singer && song.singer[0] && song.singer[0].name
                            })
                        }
                    }
                }
            }
        }
        result = {
            singer: singerName,
            success: true,
            // failedList,
            total,
            successNum: success,
            fail
        }
        fs.appendFileSync(`${realPath}/专辑.txt`, JSON.stringify(result) + '\r\n');
    } catch (e) {
        result = {
            singer: singerName,
            success: false,
            total,
            successNum: success,
            fail
        }
        fs.appendFileSync(`${realPath}/专辑_error.txt`, JSON.stringify(result) + '\r\n');
    }
    console.log(`-------- ${singerName} 下载完成 --------`)
    return result
}

/**
 * 下载歌曲
 * @param song 歌曲名
 * @param singer 歌手名
 */
async function downloadSong(song, singer) {
    let failedList = []
    let result = null
    try {
        let data = await getSongsListByWords(song)

        /*{
         "list": [],
         "total": 31,
         "page": 1,
         "size": 100
         }*/
        if (data && !data.hasOwnProperty('err') && data.list && data.list.length) {
            let songs = data.list
            for (let song of songs) {
                if (singer && song.singer && singer !== song.singer) {
                    continue
                }

                let format = ''
                let strMediaMid = song.strMediaMid
                if (song[downloadQuantity]) format = downloadQuantity
                else {
                    for (let item of quantity) {
                        if (song[item]) {
                            format = item
                            break
                        }
                    }
                }

                if (!format) {
                    failedList.push({
                        album: song.albumname,
                        songname: song.songname,
                        singer: song.singer && song.singer[0] && song.singer[0].name
                    })
                    return
                }
                try {
                    await download(format, strMediaMid, song.songname, song.albumname, song.singer && song.singer[0] && song.singer[0].name)
                } catch (e) {
                    console.error(e.message || ('文件下载失败——' + song.songname))
                    failedList.push({
                        album: song.albumname,
                        songname: song.songname,
                        singer: song.singer && song.singer[0] && song.singer[0].name
                    })
                }
                break
            }
        }
        result = {
            success: true,
            failedList,
            song: song
        }
        fs.appendFileSync(`${realPath}/单曲.txt`, JSON.stringify(result) + '\t\n');
    } catch (e) {
        result = {
            success: false,
            failedList,
            song: song
        }
        fs.appendFileSync(`${realPath}/单曲_error.txt`, JSON.stringify(result) + '\t\n');
    }
    console.log(`-------- ${song}${singer ? '-' + singer : ''} 下载完成 --------`)
    return result
}

/**
 * 批量下载所有歌手的相关歌曲
 * @param singers {array} 歌手列表
 * @returns {Promise<void>}
 */
async function downloadMultipleSingerSongs(singers) {
    for (let singer of singers) {
        await downloadSingerSongs(singer).catch((e) => {
            console.error(e)
        })
    }
}

/**
 * 批量下载所有歌曲
 * @param songs {array} 歌曲列表
 * @returns {Promise<void>}
 */
async function downloadMultipleSongs(songs) {
    for (let song of songs) {
        if (typeof song === 'string') await downloadSong(song).catch((e) => {
        })
        else if (typeof song === 'object') await downloadSong(song.name, song.singer).catch((e) => {
        })
    }
}

module.exports = {
    getSongsListByWords,
    getAlbumsListByWords,
    getAlbumListBySingerMid,
    getSongsListByAlbumId,
    getSingerByKeyword,
    getLyricBySongid,
    getVKey,
    download,
    downloadSingerSongs,
    downloadSong,
    downloadMultipleSingerSongs,
    downloadMultipleSongs
}