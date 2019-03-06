const fs = require('fs')
const path = require('path')
const {realPath} = require('../common/config')

function formatPath(p) {
    p = p.replace(/[?、\/*"“”<>|:]/g, '')
    p = p.replace('\\\\', '\\')
    p = p.replace('//', '/')
    return p
}

/**
 * 递归生成文件夹
 * @param p 需要递归生成的文件夹路径
 */
function recursiveDir(p) {
    try {
        let parentDir = path.resolve(p, '..')
        if (!fs.existsSync(parentDir)) recursiveDir(parentDir)
        else {
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p)
                console.log('新建文件夹', p)
            }
        }
    } catch (e) {
        fs.appendFileSync(`${realPath}/error.txt`, e.message || e + '\r\n');
    }
}

module.exports = {
    recursiveDir,
    formatPath
}