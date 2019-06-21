"use strict";
/**
 * Created by user on 2019/3/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const clone = require("lodash/clone");
const iconv_jschardet_1 = require("iconv-jschardet");
const Bluebird = require("bluebird");
const stream = require("stream");
const util_1 = require("./util");
exports.SymFSLib = Symbol('fsLib');
function WrapFSIconv(fsLib) {
    let fs = clone(fsLib);
    Object.keys(fs)
        .forEach(k => {
        if (typeof fsLib[k] === 'function') {
            fs[k] = fsLib[k].bind(fsLib);
        }
    });
    fs[exports.SymFSLib] = fsLib;
    fs.iconv = iconv_jschardet_1.default;
    fs.ensureWriteStream = ensureWriteStream.bind(fs);
    fs.saveFile = saveFile.bind(fs);
    fs.saveFileSync = saveFileSync.bind(fs);
    fs.loadFileSync = loadFileSync.bind(fs);
    fs.loadFile = loadFile.bind(fs);
    fs._createStreamPassThrough = _createStreamPassThrough.bind(fs);
    fs._outputStream = _outputStream.bind(fs);
    fs._autoDecode = _autoDecode.bind(fs);
    fs.trimFilename = util_1.trimFilename;
    Object.defineProperty(exports, "__esModule", { value: true });
    // @ts-ignore
    fs.default = fs;
    return fs;
}
exports.WrapFSIconv = WrapFSIconv;
function ensureWriteStream(file) {
    // @ts-ignore
    let fs = this[exports.SymFSLib];
    fs.ensureFileSync(file);
    return fs.createWriteStream(file);
}
exports.ensureWriteStream = ensureWriteStream;
function saveFileSync(file, data, options = {}) {
    // @ts-ignore
    let fs = this[exports.SymFSLib];
    fs.ensureFileSync(file);
    if (options.encoding) {
        data = iconv_jschardet_1.default.encode(data, options.encoding);
    }
    fs.outputFileSync(file, data);
    return true;
}
exports.saveFileSync = saveFileSync;
function saveFile(file, data, options = {}) {
    // @ts-ignore
    let self = this;
    let fs = self[exports.SymFSLib];
    return Bluebird
        .resolve(fs.ensureFile(file))
        .tap(function () {
        return new Bluebird(function (resolve, reject) {
            if (options.encoding) {
                data = iconv_jschardet_1.default.encode(data, options.encoding);
            }
            let readStream = self._createStreamPassThrough(data);
            let writeStream = self._outputStream(file, readStream);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
        });
    })
        .thenReturn(true);
}
exports.saveFile = saveFile;
function _createStreamPassThrough(data) {
    let readStream = new stream.PassThrough();
    readStream.end(data);
    return readStream;
}
exports._createStreamPassThrough = _createStreamPassThrough;
function _outputStream(file, readStream) {
    // @ts-ignore
    let fs = this[exports.SymFSLib];
    let writeStream = fs.createWriteStream(file);
    readStream.pipe(writeStream);
    return writeStream;
}
exports._outputStream = _outputStream;
function _autoDecode(buf, options) {
    if (Array.isArray(options.autoDecode)) {
        let _do;
        let c = iconv_jschardet_1.default._enc(iconv_jschardet_1.default.detect(buf, true).name);
        for (let from of options.autoDecode) {
            let cd = iconv_jschardet_1.default.codec_data(from);
            let key;
            if (cd && cd.name) {
                key = iconv_jschardet_1.default._enc(cd.name);
                if (c === key) {
                    _do = key;
                    break;
                }
            }
        }
        if (_do) {
            return iconv_jschardet_1.default.encode(buf, null, options.encoding);
        }
        else {
            return buf;
        }
    }
    return iconv_jschardet_1.default.encode(buf);
}
exports._autoDecode = _autoDecode;
function loadFile(file, options = {}) {
    // @ts-ignore
    let self = this;
    let fs = self[exports.SymFSLib];
    let ps;
    if (options.encoding) {
        let enc = iconv_jschardet_1.default.isNodeEncoding(options.encoding);
        if (enc) {
            ps = fs.readFile(file, options);
        }
        else {
            let ops = Object.assign({}, options);
            delete ops.encoding;
            ps = fs.readFile(file, ops)
                .then(function (buf) {
                return iconv_jschardet_1.default.decode(buf, options.encoding);
            });
        }
    }
    else if (options.autoDecode) {
        ps = fs.readFile(file, options)
            .then(function (buf) {
            return self._autoDecode(buf, options);
        });
    }
    else {
        ps = fs.readFile(file, options);
    }
    return Bluebird.resolve(ps);
}
exports.loadFile = loadFile;
function loadFileSync(file, options = {}) {
    // @ts-ignore
    let self = this;
    let fs = self[exports.SymFSLib];
    let ps;
    if (options.encoding) {
        let enc = iconv_jschardet_1.default.isNodeEncoding(options.encoding);
        if (enc) {
            ps = fs.readFileSync(file, options);
        }
        else {
            let ops = Object.assign({}, options);
            delete ops.encoding;
            ps = iconv_jschardet_1.default.decode(fs.readFileSync(file, ops), options.encoding);
        }
    }
    else if (options.autoDecode) {
        ps = self._autoDecode(fs.readFileSync(file, options), options);
    }
    else {
        ps = fs.readFileSync(file, options);
    }
    return ps;
}
exports.loadFileSync = loadFileSync;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUlILHNDQUF1QztBQUN2QyxxREFBb0M7QUFDcEMscUNBQXNDO0FBQ3RDLGlDQUFrQztBQUNsQyxpQ0FBc0M7QUFHekIsUUFBQSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXhDLFNBQWdCLFdBQVcsQ0FBNEMsS0FBUTtJQUU5RSxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFrQyxDQUFDO0lBRXZELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQ2IsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ1osSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQ2xDO1lBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7SUFDRixDQUFDLENBQUMsQ0FDRjtJQUVELEVBQUUsQ0FBQyxnQkFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBRXJCLEVBQUUsQ0FBQyxLQUFLLEdBQUcseUJBQUssQ0FBQztJQUVqQixFQUFFLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELEVBQUUsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFeEMsRUFBRSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLEVBQUUsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJ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LE9BQU8sRUFBRSxDQUFDO0FBQ1gsQ0FBQztBQWxDRCxvQ0FrQ0M7QUFFRCxrQkFBZSxPQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8zLzE3LlxuICovXG5cbmltcG9ydCB7IHZFbmNvZGluZyB9IGZyb20gJ2ljb252LWpzY2hhcmRldCc7XG5pbXBvcnQgZnNFeHRyYSA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgY2xvbmUgPSByZXF1aXJlKFwibG9kYXNoL2Nsb25lXCIpO1xuaW1wb3J0IGljb252IGZyb20gJ2ljb252LWpzY2hhcmRldCc7XG5pbXBvcnQgQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IElUU1JlcXVpcmVkV2l0aCwgSVRTUmVxdWlyZUF0TGVhc3RPbmUgfSBmcm9tICd0cy10eXBlJztcblxuZXhwb3J0IGNvbnN0IFN5bUZTTGliID0gU3ltYm9sKCdmc0xpYicpO1xuXG5leHBvcnQgZnVuY3Rpb24gV3JhcEZTSWNvbnY8RiBleHRlbmRzIHR5cGVvZiBmc0V4dHJhID0gdHlwZW9mIGZzRXh0cmE+KGZzTGliOiBGKTogV3JhcEZTSWNvbnYuSVdyYXBGUzxGPlxue1xuXHRsZXQgZnMgPSBjbG9uZShmc0xpYikgYXMgYW55IGFzIFdyYXBGU0ljb252LklXcmFwRlM8Rj47XG5cblx0T2JqZWN0LmtleXMoZnMpXG5cdFx0LmZvckVhY2goayA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIGZzTGliW2tdID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0e1xuXHRcdFx0XHRmc1trXSA9IGZzTGliW2tdLmJpbmQoZnNMaWIpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdDtcblxuXHRmc1tTeW1GU0xpYl0gPSBmc0xpYjtcblxuXHRmcy5pY29udiA9IGljb252O1xuXG5cdGZzLmVuc3VyZVdyaXRlU3RyZWFtID0gZW5zdXJlV3JpdGVTdHJlYW0uYmluZChmcyk7XG5cdGZzLnNhdmVGaWxlID0gc2F2ZUZpbGUuYmluZChmcyk7XG5cdGZzLnNhdmVGaWxlU3luYyA9IHNhdmVGaWxlU3luYy5iaW5kKGZzKTtcblxuXHRmcy5sb2FkRmlsZVN5bmMgPSBsb2FkRmlsZVN5bmMuYmluZChmcyk7XG5cdGZzLmxvYWRGaWxlID0gbG9hZEZpbGUuYmluZChmcyk7XG5cblx0ZnMuX2NyZWF0ZVN0cmVhbVBhc3NUaHJvdWdoID0gX2NyZWF0ZVN0cmVhbVBhc3NUaHJvdWdoLmJpbmQoZnMpO1xuXHRmcy5fb3V0cHV0U3RyZWFtID0gX291dHB1dFN0cmVhbS5iaW5kKGZzKTtcblx0ZnMuX2F1dG9EZWNvZGUgPSBfYXV0b0RlY29kZS5iaW5kKGZzKTtcblxuXHRmcy50cmltRmlsZW5hbWUgPSB0cmltRmlsZW5hbWU7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0ZnMuZGVmYXVsdCA9IGZzO1xuXG5cdHJldHVybiBmcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVdyaXRlU3RyZWFtKGZpbGU6IHN0cmluZylcbntcblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgZnMgPSAodGhpcyBhcyBhbnkgYXMgV3JhcEZTSWNvbnYuSVdyYXBGUylbU3ltRlNMaWJdIGFzIHR5cGVvZiBmc0V4dHJhO1xuXG5cdGZzLmVuc3VyZUZpbGVTeW5jKGZpbGUpO1xuXHRyZXR1cm4gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZmlsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlRmlsZVN5bmMoZmlsZTogc3RyaW5nLCBkYXRhLCBvcHRpb25zOiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zID0ge30pXG57XG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IGZzID0gKHRoaXMgYXMgYW55IGFzIFdyYXBGU0ljb252LklXcmFwRlMpW1N5bUZTTGliXSBhcyB0eXBlb2YgZnNFeHRyYTtcblxuXHRmcy5lbnN1cmVGaWxlU3luYyhmaWxlKTtcblxuXHRpZiAob3B0aW9ucy5lbmNvZGluZylcblx0e1xuXHRcdGRhdGEgPSBpY29udi5lbmNvZGUoZGF0YSwgb3B0aW9ucy5lbmNvZGluZyk7XG5cdH1cblxuXHRmcy5vdXRwdXRGaWxlU3luYyhmaWxlLCBkYXRhKTtcblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVGaWxlKGZpbGU6IHN0cmluZywgZGF0YSwgb3B0aW9uczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9ucyA9IHt9KVxue1xuXHQvLyBAdHMtaWdub3JlXG5cdGxldCBzZWxmOiBXcmFwRlNJY29udi5JV3JhcEZTPHR5cGVvZiBmc0V4dHJhPiA9IHRoaXM7XG5cdGxldCBmcyA9IHNlbGZbU3ltRlNMaWJdIGFzIHR5cGVvZiBmc0V4dHJhO1xuXG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlKGZzLmVuc3VyZUZpbGUoZmlsZSkpXG5cdFx0LnRhcChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJldHVybiBuZXcgQmx1ZWJpcmQoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdClcblx0XHRcdHtcblx0XHRcdFx0aWYgKG9wdGlvbnMuZW5jb2RpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkYXRhID0gaWNvbnYuZW5jb2RlKGRhdGEsIG9wdGlvbnMuZW5jb2RpbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHJlYWRTdHJlYW0gPSBzZWxmLl9jcmVhdGVTdHJlYW1QYXNzVGhyb3VnaChkYXRhKTtcblx0XHRcdFx0bGV0IHdyaXRlU3RyZWFtID0gc2VsZi5fb3V0cHV0U3RyZWFtKGZpbGUsIHJlYWRTdHJlYW0pO1xuXG5cdFx0XHRcdHdyaXRlU3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdCk7XG5cdFx0XHRcdHdyaXRlU3RyZWFtLm9uKCdmaW5pc2gnLCByZXNvbHZlKTtcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQudGhlblJldHVybih0cnVlKVxuXHRcdDtcbn1cblxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIFdyYXBGU0ljb252XG57XG5cdGV4cG9ydCB0eXBlIElXcmFwRlM8RiBleHRlbmRzIHR5cGVvZiBmc0V4dHJhID0gdHlwZW9mIGZzRXh0cmE+ID0gRiAmXG5cdHtcblx0XHRbU3ltRlNMaWJdOiBGIHwgdHlwZW9mIGZzRXh0cmE7XG5cblx0XHRpY29udjogdHlwZW9mIGljb252O1xuXHRcdGVuc3VyZVdyaXRlU3RyZWFtKGZpbGU6IHN0cmluZyk6IGZzRXh0cmEuV3JpdGVTdHJlYW07XG5cblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0c2F2ZUZpbGUoZmlsZTogc3RyaW5nLCBkYXRhLCBvcHRpb25zPzogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9ucyk6IEJsdWViaXJkPGJvb2xlYW4+O1xuXG5cdFx0c2F2ZUZpbGVTeW5jKGZpbGU6IHN0cmluZywgZGF0YSwgb3B0aW9ucz86IFdyYXBGU0ljb252LklXcmFwRlNJY29udk9wdGlvbnMpOiBib29sZWFuXG5cblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0bG9hZEZpbGU8VCA9IHN0cmluZz4oZmlsZTogc3RyaW5nLCBvcHRpb25zOiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUyKTogQmx1ZWJpcmQ8VD47XG5cdFx0bG9hZEZpbGU8VCA9IEJ1ZmZlcj4oZmlsZTogc3RyaW5nLCBvcHRpb25zPzogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlKTogQmx1ZWJpcmQ8VD47XG5cblx0XHRsb2FkRmlsZVN5bmM8VCA9IHN0cmluZz4oZmlsZTogc3RyaW5nLCBvcHRpb25zOiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUyKTogVDtcblx0XHRsb2FkRmlsZVN5bmM8VCA9IEJ1ZmZlcj4oZmlsZTogc3RyaW5nLCBvcHRpb25zPzogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlKTogVDtcblxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRfY3JlYXRlU3RyZWFtUGFzc1Rocm91Z2goZGF0YTogdW5rbm93bik6IHN0cmVhbS5SZWFkYWJsZTtcblx0XHRfb3V0cHV0U3RyZWFtKGZpbGU6IHN0cmluZywgcmVhZFN0cmVhbTogc3RyZWFtLlJlYWRhYmxlKTogZnNFeHRyYS5Xcml0ZVN0cmVhbTtcblxuXHRcdF9hdXRvRGVjb2RlPFQ+KGJ1ZjogVCwgb3B0aW9uczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlICYge1xuXHRcdFx0YXV0b0RlY29kZTogdHJ1ZSB8IHN0cmluZ1tdO1xuXHRcdH0pOiBUIHwgc3RyaW5nIHwgQnVmZmVyO1xuXHRcdF9hdXRvRGVjb2RlKGJ1ZjogdW5rbm93biwgb3B0aW9uczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlKTogQnVmZmVyO1xuXG5cdFx0Ly8gLS0tLS0tLS0tLVxuXG5cdFx0dHJpbUZpbGVuYW1lKG5hbWU6IHVua25vd24pOiBzdHJpbmdcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVdyYXBGU0ljb252T3B0aW9uc1xuXHR7XG5cdFx0ZW5jb2Rpbmc/OiB2RW5jb2Rpbmc7XG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElXcmFwRlNJY29udk9wdGlvbnNMb2FkRmlsZVxuXHR7XG5cdFx0ZW5jb2Rpbmc/OiBzdHJpbmc7XG5cdFx0ZmxhZz86IHN0cmluZztcblxuXHRcdGF1dG9EZWNvZGU/OiBib29sZWFuIHwgc3RyaW5nW10sXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUyID0gSVRTUmVxdWlyZUF0TGVhc3RPbmU8SVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlLCAnZW5jb2RpbmcnIHwgJ2F1dG9EZWNvZGUnPlxuXG5cdGV4cG9ydCB0eXBlIElFbmNvZGluZyA9IHZFbmNvZGluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2NyZWF0ZVN0cmVhbVBhc3NUaHJvdWdoKGRhdGEpOiBzdHJlYW0uUmVhZGFibGVcbntcblx0bGV0IHJlYWRTdHJlYW0gPSBuZXcgc3RyZWFtLlBhc3NUaHJvdWdoKCk7XG5cdHJlYWRTdHJlYW0uZW5kKGRhdGEpO1xuXHRyZXR1cm4gcmVhZFN0cmVhbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9vdXRwdXRTdHJlYW0oZmlsZTogc3RyaW5nLCByZWFkU3RyZWFtOiBzdHJlYW0uUmVhZGFibGUpOiBmc0V4dHJhLldyaXRlU3RyZWFtXG57XG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IGZzID0gKHRoaXMgYXMgYW55IGFzIFdyYXBGU0ljb252LklXcmFwRlMpW1N5bUZTTGliXSBhcyB0eXBlb2YgZnNFeHRyYTtcblxuXHRsZXQgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShmaWxlKTtcblx0cmVhZFN0cmVhbS5waXBlKHdyaXRlU3RyZWFtKTtcblx0cmV0dXJuIHdyaXRlU3RyZWFtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2F1dG9EZWNvZGU8VD4oYnVmOiBULCBvcHRpb25zOiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUgJiB7XG5cdGF1dG9EZWNvZGU6IHRydWUgfCBzdHJpbmdbXSxcbn0pOiBUIHwgc3RyaW5nIHwgQnVmZmVyXG5leHBvcnQgZnVuY3Rpb24gX2F1dG9EZWNvZGUoYnVmLCBvcHRpb25zOiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUpOiBCdWZmZXJcbmV4cG9ydCBmdW5jdGlvbiBfYXV0b0RlY29kZShidWYsIG9wdGlvbnM6IFdyYXBGU0ljb252LklXcmFwRlNJY29udk9wdGlvbnNMb2FkRmlsZSk6IHN0cmluZyB8IEJ1ZmZlclxue1xuXHRpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zLmF1dG9EZWNvZGUpKVxuXHR7XG5cdFx0bGV0IF9kbzogc3RyaW5nO1xuXHRcdGxldCBjID0gaWNvbnYuX2VuYyhpY29udi5kZXRlY3QoYnVmLCB0cnVlKS5uYW1lKTtcblxuXHRcdGZvciAobGV0IGZyb20gb2YgKG9wdGlvbnMuYXV0b0RlY29kZSBhcyBzdHJpbmdbXSkpXG5cdFx0e1xuXHRcdFx0bGV0IGNkID0gaWNvbnYuY29kZWNfZGF0YShmcm9tKTtcblx0XHRcdGxldCBrZXk6IHN0cmluZztcblxuXHRcdFx0aWYgKGNkICYmIGNkLm5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdGtleSA9IGljb252Ll9lbmMoY2QubmFtZSk7XG5cblx0XHRcdFx0aWYgKGMgPT09IGtleSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9kbyA9IGtleTtcblxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKF9kbylcblx0XHR7XG5cdFx0XHRyZXR1cm4gaWNvbnYuZW5jb2RlKGJ1ZiwgbnVsbCwgb3B0aW9ucy5lbmNvZGluZyk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXR1cm4gYnVmO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBpY29udi5lbmNvZGUoYnVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlPFQgPSBzdHJpbmc+KGZpbGU6IHN0cmluZywgb3B0aW9uczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlMik6IEJsdWViaXJkPFQ+XG5leHBvcnQgZnVuY3Rpb24gbG9hZEZpbGU8VCA9IEJ1ZmZlcj4oZmlsZTogc3RyaW5nLCBvcHRpb25zPzogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlKTogQmx1ZWJpcmQ8VD5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRmlsZShmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IFdyYXBGU0ljb252LklXcmFwRlNJY29udk9wdGlvbnNMb2FkRmlsZSA9IHt9KTogQmx1ZWJpcmQ8QnVmZmVyIHwgc3RyaW5nPlxue1xuXHQvLyBAdHMtaWdub3JlXG5cdGxldCBzZWxmOiBXcmFwRlNJY29udi5JV3JhcEZTPHR5cGVvZiBmc0V4dHJhPiA9IHRoaXM7XG5cdGxldCBmcyA9IHNlbGZbU3ltRlNMaWJdIGFzIHR5cGVvZiBmc0V4dHJhO1xuXG5cdGxldCBwczogUHJvbWlzZTxhbnk+O1xuXG5cdGlmIChvcHRpb25zLmVuY29kaW5nKVxuXHR7XG5cdFx0bGV0IGVuYyA9IGljb252LmlzTm9kZUVuY29kaW5nKG9wdGlvbnMuZW5jb2RpbmcpO1xuXG5cdFx0aWYgKGVuYylcblx0XHR7XG5cdFx0XHRwcyA9IGZzLnJlYWRGaWxlKGZpbGUsIG9wdGlvbnMpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IG9wczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7XG5cdFx0XHRkZWxldGUgb3BzLmVuY29kaW5nO1xuXG5cdFx0XHRwcyA9IGZzLnJlYWRGaWxlKGZpbGUsIG9wcylcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGJ1Zilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBpY29udi5kZWNvZGUoYnVmLCBvcHRpb25zLmVuY29kaW5nKTtcblx0XHRcdFx0fSlcblx0XHRcdDtcblx0XHR9XG5cdH1cblx0ZWxzZSBpZiAob3B0aW9ucy5hdXRvRGVjb2RlKVxuXHR7XG5cdFx0cHMgPSBmcy5yZWFkRmlsZShmaWxlLCBvcHRpb25zKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGJ1Zilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHNlbGYuX2F1dG9EZWNvZGUoYnVmLCBvcHRpb25zKTtcblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHBzID0gZnMucmVhZEZpbGUoZmlsZSwgb3B0aW9ucyk7XG5cdH1cblxuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRmlsZVN5bmM8VCA9IHN0cmluZz4oZmlsZTogc3RyaW5nLCBvcHRpb25zOiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUyKTogVFxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlU3luYzxUID0gQnVmZmVyPihmaWxlOiBzdHJpbmcsIG9wdGlvbnM/OiBXcmFwRlNJY29udi5JV3JhcEZTSWNvbnZPcHRpb25zTG9hZEZpbGUpOiBUXG5leHBvcnQgZnVuY3Rpb24gbG9hZEZpbGVTeW5jKGZpbGU6IHN0cmluZywgb3B0aW9uczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlID0ge30pOiBCdWZmZXIgfCBzdHJpbmdcbntcblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgc2VsZjogV3JhcEZTSWNvbnYuSVdyYXBGUzx0eXBlb2YgZnNFeHRyYT4gPSB0aGlzO1xuXHRsZXQgZnMgPSBzZWxmW1N5bUZTTGliXSBhcyB0eXBlb2YgZnNFeHRyYTtcblxuXHRsZXQgcHM7XG5cblx0aWYgKG9wdGlvbnMuZW5jb2RpbmcpXG5cdHtcblx0XHRsZXQgZW5jID0gaWNvbnYuaXNOb2RlRW5jb2Rpbmcob3B0aW9ucy5lbmNvZGluZyk7XG5cblx0XHRpZiAoZW5jKVxuXHRcdHtcblx0XHRcdHBzID0gZnMucmVhZEZpbGVTeW5jKGZpbGUsIG9wdGlvbnMpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IG9wczogV3JhcEZTSWNvbnYuSVdyYXBGU0ljb252T3B0aW9uc0xvYWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7XG5cdFx0XHRkZWxldGUgb3BzLmVuY29kaW5nO1xuXG5cdFx0XHRwcyA9IGljb252LmRlY29kZShmcy5yZWFkRmlsZVN5bmMoZmlsZSwgb3BzKSwgb3B0aW9ucy5lbmNvZGluZyk7XG5cdFx0fVxuXHR9XG5cdGVsc2UgaWYgKG9wdGlvbnMuYXV0b0RlY29kZSlcblx0e1xuXHRcdHBzID0gc2VsZi5fYXV0b0RlY29kZShmcy5yZWFkRmlsZVN5bmMoZmlsZSwgb3B0aW9ucyksIG9wdGlvbnMpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHBzID0gZnMucmVhZEZpbGVTeW5jKGZpbGUsIG9wdGlvbnMpO1xuXHR9XG5cblx0cmV0dXJuIHBzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vY29yZScpO1xuIl19