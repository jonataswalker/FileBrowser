/*!
 * FileBrowser - v1.3.0
 * ${description}
 * ${homepage}
 * Built: Thu Oct 05 2017 16:09:01 GMT-0300 (-03)
 */

var FileBrowser = (function (Vue,ripple,dialog,textfield,Pica,Vuex,axios) {
'use strict';

Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;
Pica = Pica && Pica.hasOwnProperty('default') ? Pica['default'] : Pica;
Vuex = Vuex && Vuex.hasOwnProperty('default') ? Vuex['default'] : Vuex;
axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();










var MyButton = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('button',{staticClass:"mdc-button mdc-button--raised mdc-button--primary mdc-button--dense",class:_vm.classes,attrs:{"type":_vm.type,"disabled":_vm.disabled}},[_vm._t("default")],2)},staticRenderFns: [],
  name: 'Button',
  props: {
    text: String,
    classes: String,
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false }
  },
  mounted: function mounted() {
    new ripple.MDCRipple(this.$el);
  }
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var fileType = createCommonjsModule(function (module) {
'use strict';
const toBytes = s => Array.from(s).map(c => c.charCodeAt(0));
const xpiZipFilename = toBytes('META-INF/mozilla.rsa');
const oxmlContentTypes = toBytes('[Content_Types].xml');
const oxmlRels = toBytes('_rels/.rels');

module.exports = input => {
	const buf = new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	const check = (header, opts) => {
		opts = Object.assign({
			offset: 0
		}, opts);

		for (let i = 0; i < header.length; i++) {
			// If a bitmask is set
			if (opts.mask) {
				// If header doesn't equal `buf` with bits masked off
				if (header[i] !== (opts.mask[i] & buf[i + opts.offset])) {
					return false;
				}
			} else if (header[i] !== buf[i + opts.offset]) {
				return false;
			}
		}

		return true;
	};

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if (
		(check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) &&
		check([0x43, 0x52], {offset: 8})
	) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (
		check([0x49, 0x49, 0x2A, 0x0]) ||
		check([0x4D, 0x4D, 0x0, 0x2A])
	) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Zip-based file formats
	// Need to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4])) {
		if (
			check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {offset: 30})
		) {
			return {
				ext: 'epub',
				mime: 'application/epub+zip'
			};
		}

		// Assumes signed `.xpi` from addons.mozilla.org
		if (check(xpiZipFilename, {offset: 30})) {
			return {
				ext: 'xpi',
				mime: 'application/x-xpinstall'
			};
		}

		// https://github.com/file/file/blob/master/magic/Magdir/msooxml
		if (check(oxmlContentTypes, {offset: 30}) || check(oxmlRels, {offset: 30})) {
			const sliced = buf.subarray(4, 4 + 2000);
			const nextZipHeaderIndex = arr => arr.findIndex((el, i, arr) => arr[i] === 0x50 && arr[i + 1] === 0x4B && arr[i + 2] === 0x3 && arr[i + 3] === 0x4);
			const header2Pos = nextZipHeaderIndex(sliced);

			if (header2Pos !== -1) {
				const slicedAgain = buf.subarray(header2Pos + 8, header2Pos + 8 + 1000);
				const header3Pos = nextZipHeaderIndex(slicedAgain);

				if (header3Pos !== -1) {
					const offset = 8 + header2Pos + header3Pos + 30;

					if (check(toBytes('word/'), {offset})) {
						return {
							ext: 'docx',
							mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
						};
					}

					if (check(toBytes('ppt/'), {offset})) {
						return {
							ext: 'pptx',
							mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
						};
					}

					if (check(toBytes('xl/'), {offset})) {
						return {
							ext: 'xlsx',
							mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						};
					}
				}
			}
		}
	}

	if (
		check([0x50, 0x4B]) &&
		(buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) &&
		(buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], {offset: 257})) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buf[6] === 0x0 || buf[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x33, 0x67, 0x70, 0x35]) || // 3gp5
		(
			check([0x0, 0x0, 0x0]) && check([0x66, 0x74, 0x79, 0x70], {offset: 4}) &&
				(
					check([0x6D, 0x70, 0x34, 0x31], {offset: 8}) || // MP41
					check([0x6D, 0x70, 0x34, 0x32], {offset: 8}) || // MP42
					check([0x69, 0x73, 0x6F, 0x6D], {offset: 8}) || // ISOM
					check([0x69, 0x73, 0x6F, 0x32], {offset: 8}) || // ISO2
					check([0x6D, 0x6D, 0x70, 0x34], {offset: 8}) || // MMP4
					check([0x4D, 0x34, 0x56], {offset: 8}) || // M4V
					check([0x64, 0x61, 0x73, 0x68], {offset: 8}) // DASH
				)
		)) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		const sliced = buf.subarray(4, 4 + 4096);
		const idPos = sliced.findIndex((el, i, arr) => arr[i] === 0x42 && arr[i + 1] === 0x82);

		if (idPos !== -1) {
			const docTypePos = idPos + 3;
			const findDocType = type => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) ||
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) ||
		check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {offset: 4}) ||
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // MJPEG
		check([0x77, 0x69, 0x64, 0x65], {offset: 4})) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x41, 0x56, 0x49], {offset: 8})
	) {
		return {
			ext: 'avi',
			mime: 'video/x-msvideo'
		};
	}

	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (check([0x0, 0x0, 0x1, 0xBA])) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	// Check for MP3 header at different starting offsets
	for (let start = 0; start < 2 && start < (buf.length - 16); start++) {
		if (
			check([0x49, 0x44, 0x33], {offset: start}) || // ID3 header
			check([0xFF, 0xE2], {offset: start, mask: [0xFF, 0xE2]}) // MPEG 1 or 2 Layer 3 header
		) {
			return {
				ext: 'mp3',
				mime: 'audio/mpeg'
			};
		}
	}

	if (
		check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {offset: 4}) ||
		check([0x4D, 0x34, 0x41, 0x20])
	) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {offset: 28})) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	if (check([0x4F, 0x67, 0x67, 0x53])) {
		return {
			ext: 'ogg',
			mime: 'audio/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x57, 0x41, 0x56, 0x45], {offset: 8})
	) {
		return {
			ext: 'wav',
			mime: 'audio/x-wav'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (
		(buf[0] === 0x43 || buf[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x46]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x32]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		check([0x4D, 0x53, 0x43, 0x46]) ||
		check([0x49, 0x53, 0x63, 0x28])
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	return null;
};
});

/**
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} w width of source image
 * @param {Number} h height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
*/
function calcAspectRatio(w, h, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / w, maxHeight / h);
  return { width: Math.floor(w * ratio), height: Math.floor(h * ratio) };
}



function isImage(ext) {
  ext = ext.replace('.', '');
  return ['jpg', 'png', 'gif'].includes(ext);
}

function bytesToSize(bytes) {
  if (bytes === 0) { return '0 Byte'; }
  const k = 1000;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

// from https://github.com/jprichardson/string.js/blob/master/lib/string.js
function dasherize(str) {
  return str.trim()
    .replace(/[_\s]+/g, '-')
    // .replace(/([A-Z])/g, '-$1')
    .replace(/-+/g, '-');
}

function safeFilename(str) {
  // eslint-disable-next-line
  const map = {'Á':'A','Ă':'A','Ắ':'A','Ặ':'A','Ằ':'A','Ẳ':'A','Ẵ':'A','Ǎ':'A','Â':'A','Ấ':'A','Ậ':'A','Ầ':'A','Ẩ':'A','Ẫ':'A','Ä':'A','Ǟ':'A','Ȧ':'A','Ǡ':'A','Ạ':'A','Ȁ':'A','À':'A','Ả':'A','Ȃ':'A','Ā':'A','Ą':'A','Å':'A','Ǻ':'A','Ḁ':'A','Ⱥ':'A','Ã':'A','Ꜳ':'AA','Æ':'AE','Ǽ':'AE','Ǣ':'AE','Ꜵ':'AO','Ꜷ':'AU','Ꜹ':'AV','Ꜻ':'AV','Ꜽ':'AY','Ḃ':'B','Ḅ':'B','Ɓ':'B','Ḇ':'B','Ƀ':'B','Ƃ':'B','Ć':'C','Č':'C','Ç':'C','Ḉ':'C','Ĉ':'C','Ċ':'C','Ƈ':'C','Ȼ':'C','Ď':'D','Ḑ':'D','Ḓ':'D','Ḋ':'D','Ḍ':'D','Ɗ':'D','Ḏ':'D','ǲ':'D','ǅ':'D','Đ':'D','Ƌ':'D','Ǳ':'DZ','Ǆ':'DZ','É':'E','Ĕ':'E','Ě':'E','Ȩ':'E','Ḝ':'E','Ê':'E','Ế':'E','Ệ':'E','Ề':'E','Ể':'E','Ễ':'E','Ḙ':'E','Ë':'E','Ė':'E','Ẹ':'E','Ȅ':'E','È':'E','Ẻ':'E','Ȇ':'E','Ē':'E','Ḗ':'E','Ḕ':'E','Ę':'E','Ɇ':'E','Ẽ':'E','Ḛ':'E','Ꝫ':'ET','Ḟ':'F','Ƒ':'F','Ǵ':'G','Ğ':'G','Ǧ':'G','Ģ':'G','Ĝ':'G','Ġ':'G','Ɠ':'G','Ḡ':'G','Ǥ':'G','Ḫ':'H','Ȟ':'H','Ḩ':'H','Ĥ':'H','Ⱨ':'H','Ḧ':'H','Ḣ':'H','Ḥ':'H','Ħ':'H','Í':'I','Ĭ':'I','Ǐ':'I','Î':'I','Ï':'I','Ḯ':'I','İ':'I','Ị':'I','Ȉ':'I','Ì':'I','Ỉ':'I','Ȋ':'I','Ī':'I','Į':'I','Ɨ':'I','Ĩ':'I','Ḭ':'I','Ꝺ':'D','Ꝼ':'F','Ᵹ':'G','Ꞃ':'R','Ꞅ':'S','Ꞇ':'T','Ꝭ':'IS','Ĵ':'J','Ɉ':'J','Ḱ':'K','Ǩ':'K','Ķ':'K','Ⱪ':'K','Ꝃ':'K','Ḳ':'K','Ƙ':'K','Ḵ':'K','Ꝁ':'K','Ꝅ':'K','Ĺ':'L','Ƚ':'L','Ľ':'L','Ļ':'L','Ḽ':'L','Ḷ':'L','Ḹ':'L','Ⱡ':'L','Ꝉ':'L','Ḻ':'L','Ŀ':'L','Ɫ':'L','ǈ':'L','Ł':'L','Ǉ':'LJ','Ḿ':'M','Ṁ':'M','Ṃ':'M','Ɱ':'M','Ń':'N','Ň':'N','Ņ':'N','Ṋ':'N','Ṅ':'N','Ṇ':'N','Ǹ':'N','Ɲ':'N','Ṉ':'N','Ƞ':'N','ǋ':'N','Ñ':'N','Ǌ':'NJ','Ó':'O','Ŏ':'O','Ǒ':'O','Ô':'O','Ố':'O','Ộ':'O','Ồ':'O','Ổ':'O','Ỗ':'O','Ö':'O','Ȫ':'O','Ȯ':'O','Ȱ':'O','Ọ':'O','Ő':'O','Ȍ':'O','Ò':'O','Ỏ':'O','Ơ':'O','Ớ':'O','Ợ':'O','Ờ':'O','Ở':'O','Ỡ':'O','Ȏ':'O','Ꝋ':'O','Ꝍ':'O','Ō':'O','Ṓ':'O','Ṑ':'O','Ɵ':'O','Ǫ':'O','Ǭ':'O','Ø':'O','Ǿ':'O','Õ':'O','Ṍ':'O','Ṏ':'O','Ȭ':'O','Ƣ':'OI','Ꝏ':'OO','Ɛ':'E','Ɔ':'O','Ȣ':'OU','Ṕ':'P','Ṗ':'P','Ꝓ':'P','Ƥ':'P','Ꝕ':'P','Ᵽ':'P','Ꝑ':'P','Ꝙ':'Q','Ꝗ':'Q','Ŕ':'R','Ř':'R','Ŗ':'R','Ṙ':'R','Ṛ':'R','Ṝ':'R','Ȑ':'R','Ȓ':'R','Ṟ':'R','Ɍ':'R','Ɽ':'R','Ꜿ':'C','Ǝ':'E','Ś':'S','Ṥ':'S','Š':'S','Ṧ':'S','Ş':'S','Ŝ':'S','Ș':'S','Ṡ':'S','Ṣ':'S','Ṩ':'S','ẞ':'SS','Ť':'T','Ţ':'T','Ṱ':'T','Ț':'T','Ⱦ':'T','Ṫ':'T','Ṭ':'T','Ƭ':'T','Ṯ':'T','Ʈ':'T','Ŧ':'T','Ɐ':'A','Ꞁ':'L','Ɯ':'M','Ʌ':'V','Ꜩ':'TZ','Ú':'U','Ŭ':'U','Ǔ':'U','Û':'U','Ṷ':'U','Ü':'U','Ǘ':'U','Ǚ':'U','Ǜ':'U','Ǖ':'U','Ṳ':'U','Ụ':'U','Ű':'U','Ȕ':'U','Ù':'U','Ủ':'U','Ư':'U','Ứ':'U','Ự':'U','Ừ':'U','Ử':'U','Ữ':'U','Ȗ':'U','Ū':'U','Ṻ':'U','Ų':'U','Ů':'U','Ũ':'U','Ṹ':'U','Ṵ':'U','Ꝟ':'V','Ṿ':'V','Ʋ':'V','Ṽ':'V','Ꝡ':'VY','Ẃ':'W','Ŵ':'W','Ẅ':'W','Ẇ':'W','Ẉ':'W','Ẁ':'W','Ⱳ':'W','Ẍ':'X','Ẋ':'X','Ý':'Y','Ŷ':'Y','Ÿ':'Y','Ẏ':'Y','Ỵ':'Y','Ỳ':'Y','Ƴ':'Y','Ỷ':'Y','Ỿ':'Y','Ȳ':'Y','Ɏ':'Y','Ỹ':'Y','Ź':'Z','Ž':'Z','Ẑ':'Z','Ⱬ':'Z','Ż':'Z','Ẓ':'Z','Ȥ':'Z','Ẕ':'Z','Ƶ':'Z','Ĳ':'IJ','Œ':'OE','ᴀ':'A','ᴁ':'AE','ʙ':'B','ᴃ':'B','ᴄ':'C','ᴅ':'D','ᴇ':'E','ꜰ':'F','ɢ':'G','ʛ':'G','ʜ':'H','ɪ':'I','ʁ':'R','ᴊ':'J','ᴋ':'K','ʟ':'L','ᴌ':'L','ᴍ':'M','ɴ':'N','ᴏ':'O','ɶ':'OE','ᴐ':'O','ᴕ':'OU','ᴘ':'P','ʀ':'R','ᴎ':'N','ᴙ':'R','ꜱ':'S','ᴛ':'T','ⱻ':'E','ᴚ':'R','ᴜ':'U','ᴠ':'V','ᴡ':'W','ʏ':'Y','ᴢ':'Z','á':'a','ă':'a','ắ':'a','ặ':'a','ằ':'a','ẳ':'a','ẵ':'a','ǎ':'a','â':'a','ấ':'a','ậ':'a','ầ':'a','ẩ':'a','ẫ':'a','ä':'a','ǟ':'a','ȧ':'a','ǡ':'a','ạ':'a','ȁ':'a','à':'a','ả':'a','ȃ':'a','ā':'a','ą':'a','ᶏ':'a','ẚ':'a','å':'a','ǻ':'a','ḁ':'a','ⱥ':'a','ã':'a','ꜳ':'aa','æ':'ae','ǽ':'ae','ǣ':'ae','ꜵ':'ao','ꜷ':'au','ꜹ':'av','ꜻ':'av','ꜽ':'ay','ḃ':'b','ḅ':'b','ɓ':'b','ḇ':'b','ᵬ':'b','ᶀ':'b','ƀ':'b','ƃ':'b','ɵ':'o','ć':'c','č':'c','ç':'c','ḉ':'c','ĉ':'c','ɕ':'c','ċ':'c','ƈ':'c','ȼ':'c','ď':'d','ḑ':'d','ḓ':'d','ȡ':'d','ḋ':'d','ḍ':'d','ɗ':'d','ᶑ':'d','ḏ':'d','ᵭ':'d','ᶁ':'d','đ':'d','ɖ':'d','ƌ':'d','ı':'i','ȷ':'j','ɟ':'j','ʄ':'j','ǳ':'dz','ǆ':'dz','é':'e','ĕ':'e','ě':'e','ȩ':'e','ḝ':'e','ê':'e','ế':'e','ệ':'e','ề':'e','ể':'e','ễ':'e','ḙ':'e','ë':'e','ė':'e','ẹ':'e','ȅ':'e','è':'e','ẻ':'e','ȇ':'e','ē':'e','ḗ':'e','ḕ':'e','ⱸ':'e','ę':'e','ᶒ':'e','ɇ':'e','ẽ':'e','ḛ':'e','ꝫ':'et','ḟ':'f','ƒ':'f','ᵮ':'f','ᶂ':'f','ǵ':'g','ğ':'g','ǧ':'g','ģ':'g','ĝ':'g','ġ':'g','ɠ':'g','ḡ':'g','ᶃ':'g','ǥ':'g','ḫ':'h','ȟ':'h','ḩ':'h','ĥ':'h','ⱨ':'h','ḧ':'h','ḣ':'h','ḥ':'h','ɦ':'h','ẖ':'h','ħ':'h','ƕ':'hv','í':'i','ĭ':'i','ǐ':'i','î':'i','ï':'i','ḯ':'i','ị':'i','ȉ':'i','ì':'i','ỉ':'i','ȋ':'i','ī':'i','į':'i','ᶖ':'i','ɨ':'i','ĩ':'i','ḭ':'i','ꝺ':'d','ꝼ':'f','ᵹ':'g','ꞃ':'r','ꞅ':'s','ꞇ':'t','ꝭ':'is','ǰ':'j','ĵ':'j','ʝ':'j','ɉ':'j','ḱ':'k','ǩ':'k','ķ':'k','ⱪ':'k','ꝃ':'k','ḳ':'k','ƙ':'k','ḵ':'k','ᶄ':'k','ꝁ':'k','ꝅ':'k','ĺ':'l','ƚ':'l','ɬ':'l','ľ':'l','ļ':'l','ḽ':'l','ȴ':'l','ḷ':'l','ḹ':'l','ⱡ':'l','ꝉ':'l','ḻ':'l','ŀ':'l','ɫ':'l','ᶅ':'l','ɭ':'l','ł':'l','ǉ':'lj','ſ':'s','ẜ':'s','ẛ':'s','ẝ':'s','ḿ':'m','ṁ':'m','ṃ':'m','ɱ':'m','ᵯ':'m','ᶆ':'m','ń':'n','ň':'n','ņ':'n','ṋ':'n','ȵ':'n','ṅ':'n','ṇ':'n','ǹ':'n','ɲ':'n','ṉ':'n','ƞ':'n','ᵰ':'n','ᶇ':'n','ɳ':'n','ñ':'n','ǌ':'nj','ó':'o','ŏ':'o','ǒ':'o','ô':'o','ố':'o','ộ':'o','ồ':'o','ổ':'o','ỗ':'o','ö':'o','ȫ':'o','ȯ':'o','ȱ':'o','ọ':'o','ő':'o','ȍ':'o','ò':'o','ỏ':'o','ơ':'o','ớ':'o','ợ':'o','ờ':'o','ở':'o','ỡ':'o','ȏ':'o','ꝋ':'o','ꝍ':'o','ⱺ':'o','ō':'o','ṓ':'o','ṑ':'o','ǫ':'o','ǭ':'o','ø':'o','ǿ':'o','õ':'o','ṍ':'o','ṏ':'o','ȭ':'o','ƣ':'oi','ꝏ':'oo','ɛ':'e','ᶓ':'e','ɔ':'o','ᶗ':'o','ȣ':'ou','ṕ':'p','ṗ':'p','ꝓ':'p','ƥ':'p','ᵱ':'p','ᶈ':'p','ꝕ':'p','ᵽ':'p','ꝑ':'p','ꝙ':'q','ʠ':'q','ɋ':'q','ꝗ':'q','ŕ':'r','ř':'r','ŗ':'r','ṙ':'r','ṛ':'r','ṝ':'r','ȑ':'r','ɾ':'r','ᵳ':'r','ȓ':'r','ṟ':'r','ɼ':'r','ᵲ':'r','ᶉ':'r','ɍ':'r','ɽ':'r','ↄ':'c','ꜿ':'c','ɘ':'e','ɿ':'r','ś':'s','ṥ':'s','š':'s','ṧ':'s','ş':'s','ŝ':'s','ș':'s','ṡ':'s','ṣ':'s','ṩ':'s','ʂ':'s','ᵴ':'s','ᶊ':'s','ȿ':'s','ɡ':'g','ß':'ss','ᴑ':'o','ᴓ':'o','ᴝ':'u','ť':'t','ţ':'t','ṱ':'t','ț':'t','ȶ':'t','ẗ':'t','ⱦ':'t','ṫ':'t','ṭ':'t','ƭ':'t','ṯ':'t','ᵵ':'t','ƫ':'t','ʈ':'t','ŧ':'t','ᵺ':'th','ɐ':'a','ᴂ':'ae','ǝ':'e','ᵷ':'g','ɥ':'h','ʮ':'h','ʯ':'h','ᴉ':'i','ʞ':'k','ꞁ':'l','ɯ':'m','ɰ':'m','ᴔ':'oe','ɹ':'r','ɻ':'r','ɺ':'r','ⱹ':'r','ʇ':'t','ʌ':'v','ʍ':'w','ʎ':'y','ꜩ':'tz','ú':'u','ŭ':'u','ǔ':'u','û':'u','ṷ':'u','ü':'u','ǘ':'u','ǚ':'u','ǜ':'u','ǖ':'u','ṳ':'u','ụ':'u','ű':'u','ȕ':'u','ù':'u','ủ':'u','ư':'u','ứ':'u','ự':'u','ừ':'u','ử':'u','ữ':'u','ȗ':'u','ū':'u','ṻ':'u','ų':'u','ᶙ':'u','ů':'u','ũ':'u','ṹ':'u','ṵ':'u','ᵫ':'ue','ꝸ':'um','ⱴ':'v','ꝟ':'v','ṿ':'v','ʋ':'v','ᶌ':'v','ⱱ':'v','ṽ':'v','ꝡ':'vy','ẃ':'w','ŵ':'w','ẅ':'w','ẇ':'w','ẉ':'w','ẁ':'w','ⱳ':'w','ẘ':'w','ẍ':'x','ẋ':'x','ᶍ':'x','ý':'y','ŷ':'y','ÿ':'y','ẏ':'y','ỵ':'y','ỳ':'y','ƴ':'y','ỷ':'y','ỿ':'y','ȳ':'y','ẙ':'y','ɏ':'y','ỹ':'y','ź':'z','ž':'z','ẑ':'z','ʑ':'z','ⱬ':'z','ż':'z','ẓ':'z','ȥ':'z','ẕ':'z','ᵶ':'z','ᶎ':'z','ʐ':'z','ƶ':'z','ɀ':'z','ﬀ':'ff','ﬃ':'ffi','ﬄ':'ffl','ﬁ':'fi','ﬂ':'fl','ĳ':'ij','œ':'oe','ﬆ':'st','ₐ':'a','ₑ':'e','ᵢ':'i','ⱼ':'j','ₒ':'o','ᵣ':'r','ᵤ':'u','ᵥ':'v','ₓ':'x'};
  return dasherize(str).replace(/[^A-Za-z0-9\s]/g, function (x) { return map[x] || x; });
}

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
  const _p8 = function (s) {
    const p = (Math.random().toString(16) + '000000000').substr(2, 8);
    return s ? ("-" + (p.substr(0, 4)) + "-" + (p.substr(4, 4))) : p;
  };
  return _p8() + _p8(true) + _p8(true) + _p8();
}

function ID() {
  return Math.random().toString(36).substr(2, 9);
}

const ROOT_ID = 'root';

const FILE_TYPES = ['jpg', 'png', 'gif'];

const LANG = {
  EN: 'en',
  BR: 'pt-br'
};

const OPTIONS = {
  lang: 'en'
};

const TEXT = {
  TITLE: 'Image Browser',
  ROOT_FOLDER: 'Root Folder',
  PREVIEW: 'Sending Preview',
  SEND_TO_EDITOR: 'Send to Editor',
  REQUIRED: 'Field is required',
  BUTTON: {
    CHOOSE: 'Choose',
    SEND: 'Send',
    DELETE_FILE: 'Delete File',
    DELETE_FOLDER: 'Delete Folder',
    NEW_FOLDER: 'New Folder',
    SEND_EDITOR: 'Send to Editor',
    SUBMIT: 'Submit',
    CONFIRM: 'Confirm',
    CANCEL: 'Cancel'
  },
  FILE: {
    TOTAL: 'Total Files:',
    DEL: 'Delete File',
    DELS: 'Delete Files'
  },
  FOLDER: {
    NEW: 'New Folder',
    DEL: 'Delete Folder',
    CREATION: 'This folder will be created inside:',
    VALIDATION: [
      'Only <strong>letters, numbers</strong>',
      ' and the following characters: <span class="highlight">- _</span>'
    ].join(''),
    DELETION: [
      '<p>This folder <span>%1</span>',
      ' will be removed with all its contents: </p>',
      '<p>Total Files: <span>%2</span>',
      ' &mdash; Total Subfolders: <span>%3</span></p>'
    ].join('')
  },
  ALERT: {
    IMAGE: {
      NOT_MIN_SIZE: 'Only images with minimum %1 x %2!'
    },
    UPLOAD: {
      SENDING: 'An upload is already in progress!',
      NONE: 'No file!',
      SENT: 'All done!'
    }
  },
  API: {
    MESSAGES: {
      FOLDER: {
        CREATED: 'Folder created!',
        RENAMED: 'Folder renamed!',
        REMOVED: 'Folder removed!',
        EXISTS: 'This folder already exists!'
      },
      FILE: {
        REMOVED: 'File(s) removed!'
      }
    }
  }
};

const ROUTES = {
  FILES: {
    ALL: '/files',
    UPLOAD: '/files',
    REMOVE: '/files'
  },
  FOLDER: {
    CREATE: '/folder',
    EDIT: '/folder',
    REMOVE: '/folder'
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-3elcw { position: relative; overflow: hidden; } .fb-3elcw [type=file] { position: absolute; top: 0; right: 0; font-size: 15rem; opacity: 0; cursor: pointer; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

































var UploadButton = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.container},[_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("attach_file")]),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.CHOOSE))])]),_c('input',{ref:"input",attrs:{"type":"file","accept":"image/*","multiple":"","name":"testsss","disabled":_vm.isSaving},on:{"change":_vm.filesChange}})],1)},staticRenderFns: [],cssModules: {"container":"fb-3elcw"},
  name: 'UploadButton',
  components: { MyButton: MyButton },
  data: function data() {
    return {
      isSaving: false,
      text: this.$store.state.text
    };
  },
  computed: {
    $style: function () {
      return this.$options.cssModules;
    }
  },
  methods: {
    filesChange: function filesChange(evt) {
      var this$1 = this;

      const targets = evt.target.files;

      this.$store.commit('upload/selected');

      Object.keys(targets).forEach(function (key) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(targets[key]);

        reader.onload = function (e) {
          const buffer = e.target.result;
          const type = fileType(new Uint8Array(buffer, 0, 4100));

          if (FILE_TYPES.includes(type.ext)) {
            this$1.$store.commit('upload/preview', {
              id: ID(),
              type: type.ext,
              mime: type.mime,
              blob: new Blob([buffer], { type: type.mime }),
              name: safeFilename(targets[key].name)
            });
          }
        };
      });
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-3Fh8g span { position: relative; color: #333; margin: 0 5px; padding: 3px 6px; border-radius: 4px; box-shadow: 2px 2px 2px #999; background-color: #ddd; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();






















var MyPath = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('p',{staticClass:"fb-3Fh8g"},_vm._l((_vm.$store.state.tree.hierarchy),function(folder,index){return _c('span',{key:index},[_vm._v(" "+_vm._s(folder)+" ")])}))},staticRenderFns: [],cssModules: {"path":"fb-3Fh8g"},
  name: 'Path'
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-1pNRE button:not(:last-of-type) { margin-right: 2px; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();



































var Modal = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('aside',{staticClass:"mdc-dialog",attrs:{"role":"alertdialog","aria-labelledby":"mdc-dialog-with-list-label","aria-describedby":"mdc-dialog-with-list-description"}},[_c('div',{staticClass:"mdc-dialog__surface"},[_c('header',{staticClass:"mdc-dialog__header"},[_c('h2',{staticClass:"mdc-dialog__header__title",attrs:{"id":"mdc-dialog-with-list-label"}},[_vm._v(" "+_vm._s(_vm.title)+" ")])]),_c('section',{staticClass:"mdc-dialog__body mdc-dialog__body--scrollable",attrs:{"id":"mdc-dialog-with-list-description"}},[_vm._t("body")],2),_c('footer',{staticClass:"fb-1pNRE mdc-dialog__footer"},[_vm._t("footer")],2)]),_c('div',{staticClass:"mdc-dialog__backdrop"})])},staticRenderFns: [],cssModules: {"footer":"fb-1pNRE"},
  name: 'Modal',
  props: {
    title: String,
    active: { type: Boolean, default: false }
  },
  watch: {
    active: function (val) {
      if (val) {
        this.$emit('open');
        this.$store.commit('modal/opened');
        this.dialog.show();
      } else {
        this.$emit('close');
        this.$store.commit('modal/closed');
        this.dialog.close();
      }
    }
  },
  data: function data() { return { dialog: null }},
  mounted: function mounted() {
    var this$1 = this;

    this.dialog = new dialog.MDCDialog(this.$el);
    this.dialog.listen('MDCDialog:cancel', function () { return this$1.$emit('close'); });
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-1_8Op + label, .fb-3vUj9 { color: #e74c3c; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();





























var InputText = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fl-input-container"},[_c('div',{ref:"textfield",staticClass:"mdc-textfield"},[_c('input',{staticClass:"mdc-textfield__input",class:_vm.inputClasses,attrs:{"type":_vm.type,"id":_vm.id,"disabled":_vm.disabled,"required":_vm.required,"minlength":_vm.minlength,"maxlength":_vm.maxlength},domProps:{"value":_vm.value},on:{"keyup":function($event){if(!('button' in $event)&&_vm._k($event.keyCode,"enter",13)){ return null; }_vm.$emit('enter');},"blur":function($event){_vm.$emit('blur');},"input":function($event){_vm.onInput($event.target.value);}}}),_c('label',{staticClass:"mdc-textfield__label",attrs:{"for":_vm.id}},[_vm._v(_vm._s(_vm.label))])]),_c('p',{class:_vm.errMsgClasses,domProps:{"innerHTML":_vm._s(_vm.errorMsg)}})])},staticRenderFns: [],cssModules: {"invalid":"fb-1_8Op","error":"fb-3vUj9"},
  name: 'InputText',
  props: {
    type: { type: String, default: 'text' },
    id: { type: String, default: ("i-" + (guid())) },
    value: [String, Number],
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minlength: Number,
    maxlength: Number,
    label: String,
    errorMsg: String,
    hasError: { type: Boolean, default: false }
  },
  data: function data() {
    return { hasValue: false };
  },
  computed: {
    $style: function $style() { return this.$options.cssModules },
    inputClasses: function () {
      return ( obj = {}, obj[this.$style.valid] = this.hasValue && !this.hasError, obj[this.$style.invalid] = this.hasError, obj );
      var obj;
    },
    errMsgClasses: function () {
      return ( obj = {
        'mdc-textfield-helptext': true,
        'mdc-textfield-helptext--validation-msg': true,
        'mdc-textfield-helptext--persistent': this.hasError
      }, obj[this.$style.error] = true, obj );
      var obj;
    }
  },
  mounted: function mounted() {
    new textfield.MDCTextfield(this.$refs.textfield);
  },
  methods: {
    onInput: function onInput(value) {
      this.$emit('input', value);
      this.hasValue = Boolean(value);
    }
  }
};

function folderStatistics(folder) {
  const keys = Object.keys(folder.folders);
  let files = folder.files.length;
  let folders = keys.length;

  keys.forEach(function (id) {
    const subfolder = folder.folders[id];
    const subkeys = Object.keys(subfolder.folders);

    if (subkeys.length) {
      const result = folderStatistics(subfolder);
      files += result.files;
      folders += result.folders;
    } else {
      files += subfolder.files.length;
    }
  });

  return { files: files, folders: folders };
}

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-1MlMF span { color: #333; margin: 0 5px; padding: 3px 6px; border-radius: 4px; box-shadow: 2px 2px 2px #999; background-color: #ddd; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();


















































var Folder = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{attrs:{"active":_vm.modalActive,"title":_vm.creating ? _vm.text.FOLDER.NEW : _vm.text.FOLDER.DEL},on:{"open":_vm.onOpenModal,"close":_vm.closeModal}},[_c('div',{attrs:{"slot":"body"},slot:"body"},[(_vm.creating)?_c('div',[_c('h5',[_vm._v(_vm._s(_vm.text.FOLDER.CREATION))]),_c('my-path'),_c('InputText',{attrs:{"label":_vm.text.FOLDER.NEW,"required":true,"minlength":1,"maxlength":20,"hasError":_vm.creatingHasError,"errorMsg":_vm.creatingError},on:{"enter":_vm.submit},model:{value:(_vm.creatingName),callback:function ($$v) {_vm.creatingName=$$v;},expression:"creatingName"}})],1):_c('div',{staticClass:"fb-1MlMF",domProps:{"innerHTML":_vm._s(_vm.deleteMessage)}})]),_c('div',{attrs:{"slot":"footer"},slot:"footer"},[_c('my-button',{attrs:{"classes":"is-dark","type":"submit","disabled":_vm.creating && _vm.creatingHasError},nativeOn:{"click":function($event){_vm.submit($event);}}},[_vm._v(" "+_vm._s(_vm.creating ? _vm.text.BUTTON.SUBMIT : _vm.text.BUTTON.CONFIRM)+" ")]),_c('my-button',{nativeOn:{"click":function($event){_vm.closeModal($event);}}},[_vm._v(" "+_vm._s(_vm.text.BUTTON.CANCEL)+" ")])],1)])},staticRenderFns: [],cssModules: {"folder":"fb-1MlMF"},
  name: 'Folder',
  props: {
    creating: Boolean,
    removing: Boolean
  },
  components: { MyButton: MyButton, Modal: Modal, InputText: InputText, MyPath: MyPath },
  data: function data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingError: '',
      creatingName: ''
    };
  },
  computed: {
    deleteMessage: function deleteMessage() {
      if (!this.$store.state.tree.ready) { return ''; }

      var ref = this.$store.getters['tree/selectedFolder'];
      var folder = ref.folder;
      const statistics = folderStatistics(folder);
      const message = this.text.FOLDER.DELETION
        .replace('%1', folder.name)
        .replace('%2', statistics.files)
        .replace('%3', statistics.folders);

      return message;
    }
  },
  watch: {
    creating: function (val) {
      if (val) { this.modalActive = true; }
    },
    removing: function (val) {
      if (val) { this.modalActive = true; }
    },
    creatingName: function (val) {
      if (!val) {
        this.creatingHasError = true;
        this.creatingError = this.text.REQUIRED;
      } else {
        this.creatingHasError = !/^[a-zA-Z0-9\-_]{1,20}$/.test(val);
        this.creatingError = this.text.FOLDER.VALIDATION;
      }
    }
  },
  methods: {
    onOpenModal: function onOpenModal() {
      this.creatingName = '';
    },
    closeModal: function closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    submit: function submit() {
      var ref = this.$store;
      var dispatch = ref.dispatch;
      if (this.creating) {
        dispatch('folder/create', this.creatingName).then(this.closeModal);
      } else {
        dispatch('folder/remove').then(this.closeModal);
      }
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();



























var File = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{attrs:{"active":_vm.modalActive,"title":_vm.text.FILE.DEL},on:{"open":_vm.onOpenModal,"close":_vm.closeModal}},[_c('div',{attrs:{"slot":"body"},slot:"body"},[_c('h5',[_vm._v(_vm._s(_vm.text.FILE.DEL))]),_c('my-path'),_c('ul',_vm._l((_vm.$store.state.file.selected),function(idx){return _c('li',{key:idx},[_vm._v(" "+_vm._s(_vm.$store.state.tree.selected.files[idx].name)+" ")])}))],1),_c('div',{attrs:{"slot":"footer"},slot:"footer"},[_c('my-button',{attrs:{"classes":"is-dark","type":"submit"},nativeOn:{"click":function($event){_vm.onSubmit($event);}}},[_vm._v(_vm._s(_vm.text.BUTTON.CONFIRM))]),_c('my-button',{nativeOn:{"click":function($event){_vm.closeModal($event);}}},[_vm._v(" "+_vm._s(_vm.text.BUTTON.CANCEL)+" ")])],1)])},staticRenderFns: [],
  name: 'Folder',
  props: ['openFile'],
  components: { MyButton: MyButton, Modal: Modal, MyPath: MyPath },
  data: function data() {
    return {
      text: this.$store.state.text,
      modalActive: false
    };
  },
  watch: {
    openFile: function (val, oldVal) {
      if (val) { this.modalActive = true; }
    }
  },
  methods: {
    onOpenModal: function onOpenModal() {},
    closeModal: function closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit: function onSubmit() {
      var this$1 = this;

      this.$store.dispatch('file/remove').then(function (res) {
        this$1.closeModal();
        this$1.$store.dispatch('message/show', {
          message: res,
          type: 'success'
        });
      }).catch(function (res) {
        this$1.closeModal();
        this$1.$store.dispatch('message/show', {
          message: res,
          type: 'alert'
        });
      });
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-LXfzh { display: flex; flex-flow: column; } .fb-193Yk { width: 100%; height: 35px; line-height: 35px; padding: 0 10px; vertical-align: middle; cursor: grab; border-top-left-radius: 5px; border-top-right-radius: 5px; border-bottom: 1px solid #c9c9c9; background: linear-gradient(#f0f0f0, #b0b0b0); } .fb-193Yk span:first-child { font-weight: 700; } .fb-2Amtu { display: flex; width: 100%; padding: 5px; margin-top: -1px; background-color: #e9e9e9; border: 1px solid #9e9e9e; border-right: 0; border-left: 0; } .fb-GlSRm { display: flex; } .fb-GlSRm > *:not(:last-child) { margin-right: 2px; } .fb-1ts0M { height: 0; overflow: hidden; color: #444; transition: all 200ms cubic-bezier(0, 0, 1, 1); } .fb-2MYaL { background-color: rgba(237, 212, 0, 0.95); } .fb-1NYdd { background-color: #8ae234; } .fb-Z439J { border: 1px solid transparent; padding: 5px; height: 35px; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();




































































































var AppHeader = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('header',{staticClass:"fb-LXfzh"},[_c('div',{directives:[{name:"draggable",rawName:"v-draggable"}],staticClass:"fb-193Yk"},[_c('span',[_vm._v(_vm._s(_vm.text.TITLE))]),_c('span',{staticClass:"close"})]),_c('div',{staticClass:"fb-1ts0M",class:_vm.messageClasses},[_vm._v(" "+_vm._s(_vm.$store.state.message.message)+" ")]),_c('div',{staticClass:"fb-2Amtu"},[_c('div',{staticClass:"fb-GlSRm"},[_c('upload-button'),_c('my-button',{nativeOn:{"click":function($event){_vm.createFolder = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("create_new_folder")]),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.NEW_FOLDER))])]),(_vm.$store.state.tree.selected.id !== _vm.rootFolder)?_c('my-button',{nativeOn:{"click":function($event){_vm.removeFolder = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.DELETE_FOLDER))])]):_vm._e(),(_vm.$store.state.file.selected.length)?_c('my-button',{nativeOn:{"click":function($event){_vm.openFile = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_c('span',[_vm._v(" "+_vm._s(_vm.text.BUTTON.DELETE_FILE)+" ("+_vm._s(_vm.$store.state.file.selected.length)+") ")])]):_vm._e(),(_vm.$store.state.file.selected.length)?_c('my-button',{nativeOn:{"click":function($event){_vm.sendEditor($event);}}},[_c('i',{staticClass:"material-icons"},[_vm._v("publish")]),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.SEND_EDITOR))])]):_vm._e()],1)]),_c('folder',{attrs:{"creating":_vm.createFolder,"removing":_vm.removeFolder},on:{"closeModal":function($event){_vm.createFolder = _vm.removeFolder = false;}}}),_c('file',{attrs:{"open-file":_vm.openFile},on:{"closeModal":function($event){_vm.openFile = false;}}})],1)},staticRenderFns: [],cssModules: {"header":"fb-LXfzh","title":"fb-193Yk","toolbar":"fb-2Amtu","toolbarItems":"fb-GlSRm","toolbar-items":"fb-GlSRm","message":"fb-1ts0M","alert":"fb-2MYaL","success":"fb-1NYdd","show":"fb-Z439J"},
  name: 'Header',
  components: { MyButton: MyButton, UploadButton: UploadButton, Folder: Folder, File: File },
  computed: {
    $style: function $style() { return this.$options.cssModules },
    messageClasses: function messageClasses() {
      return ( obj = {}, obj[this.$style.show] = this.$store.state.message.show, obj[this.$style.alert] = this.$store.state.message.class === 'alert', obj[this.$style.success] = this.$store.state.message.class === 'success', obj );
      var obj;
    }
  },
  data: function data() {
    return {
      createFolder: false,
      removeFolder: false,
      openFile: false,
      rootFolder: ROOT_ID,
      text: this.$store.state.text
    };
  },
  methods: {
    sendEditor: function sendEditor() {
      var this$1 = this;

      var ref = this.$store.state.options;
      var editor = ref.editor;

      this.$store.state.file.selected.forEach(function (idx) {
        const file = this$1.$store.state.tree.selected.files[idx];
        console.log('sendEditor', idx, file);

        if (isImage(file.extension)) {
          const img = "<img src=\"" + (file.path) + "/" + (file.name) + "\">";
          editor.insertHtml(img);
        }
      });
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-2R6L- { padding-left: 1rem; } .fb-2R6L- span { margin-left: 3px; } .fb-sIkME { padding-left: 0; } .fb-1cT0H { overflow: hidden; max-height: 28px !important; } .fb-1Of6F > a { color: white; cursor: pointer; background-color: black; text-shadow: 0 0 6px rgba(255, 255, 255, 0.8); } .fb-1M7w8 { display: flex; align-content: center; align-items: center; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; margin-bottom: 1px; padding: 2px 5px; color: #acacac; text-shadow: 0 1px 0 black; font-size: .875rem; width: fit-content; } .fb-1M7w8:hover { color: white; cursor: pointer; background-color: black; text-shadow: 0 0 6px rgba(255, 255, 255, 0.8); } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();




















































var Folder$1 = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{class:_vm.classObj},[_c('a',{staticClass:"fb-1M7w8",on:{"click":_vm.select}},[_c('i',{staticClass:"material-icons"},[_vm._v(" "+_vm._s(_vm.open && _vm.hasChildren ? 'folder_open' : 'folder')+" ")]),_c('span',[_vm._v(_vm._s(_vm.tree.name))])]),(_vm.hasChildren)?_c('ol',_vm._l((_vm.folders),function(folder){return _c('folder',{key:folder[0],attrs:{"id":folder[0],"tree":_vm.tree.folders[folder[0]]}})})):_vm._e()])},staticRenderFns: [],cssModules: {"folder":"fb-2R6L-","root":"fb-sIkME","collapsed":"fb-1cT0H","active":"fb-1Of6F","link":"fb-1M7w8"},
  name: 'Folder',
  props: {
    tree: Object,
    id: [Number, String],
    collapsed: { type: Boolean, default: true }
  },
  computed: {
    $style: function $style() { return this.$options.cssModules },
    hasChildren: function hasChildren() { return Object.keys(this.tree.folders).length },
    folders: function folders() {
      var this$1 = this;

      return Object.keys(this.tree.folders)
        .map(function (id) { return [id, this$1.tree.folders[id].name]; })
        .sort(function (a, b) {
          const v1 = a[1].toUpperCase();
          const v2 = b[1].toUpperCase();
          return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
        });
    },
    classObj: function classObj() {
      return ( obj = {}, obj[this.$style.folder] = true, obj[this.$style.root] = this.isRoot, obj[this.$style.collapsed] = !this.open, obj[this.$style.active] = this.id === this.$store.state.tree.selected.id, obj );
      var obj;
    }
  },
  data: function data() {
    return {
      isRoot: this.id === ROOT_ID,
      open: !this.collapsed
    };
  },
  methods: {
    select: function select() {
      if (!this.isRoot) { this.open = !this.open; }

      this.$store.dispatch('tree/select', {
        id: this.id,
        parents: this.tree.parents
      });
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();










var Tree = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ol',[(_vm.$store.state.tree.ready)?_c('folder',{attrs:{"id":_vm.root,"collapsed":false,"tree":_vm.$store.state.tree.tree[_vm.root]}}):_vm._e()],1)},staticRenderFns: [],
  name: 'Tree',
  components: { Folder: Folder$1 },
  data: function data() {
    return { root: ROOT_ID };
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-2zFmP { display: flex; flex-direction: row; flex-wrap: wrap; } .fb-2UbwZ { position: relative; width: 160px; height: 160px; margin: 8px; overflow: hidden; border: 5px solid #c6c6c6; transition: border-color 300ms; } .fb-2UbwZ:hover { cursor: pointer; border-color: #949494; } .fb-2UbwZ:hover .fb-3DL-8 { opacity: .9; color: #111; } .fb-2UbwZ.fb-1zp9q { border-color: #1d1f20; } .fb-2UbwZ.fb-1zp9q .fb-3DL-8 { opacity: .9; color: #111; } .fb-2UbwZ img { width: 100%; height: 100%; object-fit: cover; } .fb-3DL-8 { position: absolute; bottom: 0; left: 0; right: 0; padding: 3px; opacity: .6; background-color: #e9e9e9; transition: opacity 300ms; } .fb-3DL-8 :first-child { text-overflow: ellipsis; white-space: nowrap; overflow: hidden; font-size: .75rem; font-weight: 700; } .fb-3DL-8 :last-child { font-weight: 400; } .fb-sepM3 { position: absolute; top: 0; left: 0; color: #ddd; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();



























































































var Thumb = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-2zFmP"},_vm._l((_vm.$store.state.tree.selected.files),function(file,key){return _c('figure',{key:key,staticClass:"fb-2UbwZ",class:( obj = {}, obj[_vm.$style.selected] = _vm.isSelected(key), obj ),on:{"click":function($event){_vm.toggleSelect(key);}}},[_c('i',{directives:[{name:"show",rawName:"v-show",value:(_vm.isSelected(key)),expression:"isSelected(key)"}],staticClass:"material-icons fb-sepM3"},[_vm._v("check_box")]),_c('img',{attrs:{"src":file.path + '/' + file.name}}),_c('figcaption',{staticClass:"fb-3DL-8"},[_c('h5',[_vm._v(_vm._s(file.name))]),_c('h5',[_vm._v(_vm._s(_vm.fileSize(file.size)))])])])
var obj;}))},staticRenderFns: [],cssModules: {"thumb":"fb-2zFmP","figure":"fb-2UbwZ","info":"fb-3DL-8","selected":"fb-1zp9q","checked":"fb-sepM3"},
  name: 'Thumb',
  computed: {
    $style: function $style() { return this.$options.cssModules }
  },
  methods: {
    toggleSelect: function toggleSelect(idx) {
      this.$store.commit('file/toggleSelect', idx);
    },
    isSelected: function isSelected(key) {
      return this.$store.state.file.selected.includes(key);
    },
    fileSize: function fileSize(bytes) {
      return bytesToSize(bytes);
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();




var UploadThumb = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('canvas')},staticRenderFns: [],
  name: 'Thumb',
  props: { file: Object, id: String },
  data: function data() {
    return { pica: Pica() };
  },
  mounted: function mounted() {
    var this$1 = this;

    var ref = this.file;
    var type = ref.type;
    var blob = ref.blob;

    if (isImage(type)) {
      const thumb = document.createElement('canvas');
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = function () {
        const dimensions = calcAspectRatio(img.width, img.height, 120, 80);

        this$1.$el.width = thumb.width = dimensions.width;
        this$1.$el.height = thumb.height = dimensions.height;
        thumb.getContext('2d').drawImage(img, 0, 0);

        this$1.pica.resize(img, thumb)
          .then(function (result) { return this$1.pica.toBlob(result, 'image/jpeg', 90); })
          .then(function (_blob_) {
            this$1.$store.commit('upload/addThumb', {
              id: this$1.id,
              thumb: _blob_
            });

            this$1.$el.getContext('2d').drawImage(thumb, 0, 0);
            this$1.$emit('load');
          });
      };
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-3sr2L { width: 100%; height: 20px; max-height: 20px; padding: 4px; align-self: flex-end; background: rgba(0, 0, 0, 0.45); border-radius: 4px; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.45), 0 1px rgba(255, 255, 255, 0.08); } .fb-12wks { position: relative; height: 100%; width: 0; border-radius: 4px; transition: width .5s ease-out; box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.45), inset 0 1px rgba(255, 255, 255, 0.1); background: linear-gradient(#2d9dd7, #1c81c7); } .fb-12wks::before, .fb-12wks::after { content: \"\"; position: absolute; top: 0; left: 0; right: 0; } .fb-12wks::before { bottom: 0; border-radius: 4px 4px 0 0; } .fb-12wks::after { z-index: 2; bottom: 45%; border-radius: 4px; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();














































var ProgressBar = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-3sr2L"},[_c('div',{staticClass:"fb-12wks",style:({ width: _vm.width + '%'})})])},staticRenderFns: [],cssModules: {"progress":"fb-3sr2L","bar":"fb-12wks"},
  name: 'ProgressBar',
  props: { width: { type: Number, default: 0 }}
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-HVHas { display: flex; flex-wrap: wrap; flex-direction: row; } .fb-HVHas canvas { margin: auto; max-height: max-content; } .fb-20-ou { display: flex; flex-wrap: wrap; flex-direction: column; width: 200px; height: 150px; margin: 8px; padding: 5px; overflow: hidden; border-radius: 3px; box-shadow: 0 3px 7px rgba(0, 0, 0, 0.6); background: linear-gradient(#f6f7fb, #ccdbd1); } .fb-1Fw9Q { width: 50%; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();
















































var Upload = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-HVHas"},_vm._l((_vm.$store.state.upload.files),function(file,key){return _c('figure',{key:key,staticClass:"fb-20-ou"},[_c('upload-thumb',{attrs:{"file":file,"id":key},on:{"load":function($event){_vm.prepareUpload(file, key);}}}),_c('figcaption',{staticClass:"fb-1Fw9Q"},[_c('h5',[_vm._v(_vm._s(file.name))])]),_c('progress-bar',{attrs:{"width":_vm.$store.getters['upload/progress'](key)}})],1)}))},staticRenderFns: [],cssModules: {"container":"fb-HVHas","figure":"fb-20-ou","info":"fb-1Fw9Q"},
  name: 'Upload',
  components: { UploadThumb: UploadThumb, ProgressBar: ProgressBar },
  data: function data() {
    return { pica: Pica() };
  },
  methods: {
    prepareUpload: function prepareUpload(file, key) {
      var this$1 = this;

      file.id = key;
      if (isImage(file.type)) {
        const img = new Image();
        img.src = URL.createObjectURL(file.blob);
        img.onload = function () {
          const dimensions = calcAspectRatio(img.width, img.height, 1200, 800);
          const canvas = document.createElement('canvas');
          canvas.width  = dimensions.width;
          canvas.height = dimensions.height;
          canvas.getContext('2d').drawImage(img, 0, 0);

          this$1.pica.resize(img, canvas)
            .then(function (res) { return this$1.pica.toBlob(res, file.mime, 90); })
            .then(function (_blob_) {
              file.blob = _blob_;
              this$1.$store.dispatch('upload/send', file);
            });
        };
      } else {
        this.$store.dispatch('upload/send', file);
      }
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-FvEU2 { display: flex; flex: 1; overflow: hidden; color: #333; background-color: #f5f5f5; } .fb-3gtxf { flex: 0 0 230px; order: -1; border: 1px solid #333; overflow: auto; background-color: #1d1f20; } .fb-3gtxf ol { list-style: none; margin: 0; padding: 0; } .fb-2K-Xo { flex: 1; overflow-y: auto; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();







































var AppBody = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-FvEU2"},[_c('div',{staticClass:"fb-3gtxf"},[_c('tree')],1),_c('div',{staticClass:"fb-2K-Xo"},[(_vm.$store.state.upload.pending)?_c('upload'):_c('thumb')],1)])},staticRenderFns: [],cssModules: {"body":"fb-FvEU2","treeContainer":"fb-3gtxf","tree-container":"fb-3gtxf","thumbContainer":"fb-2K-Xo","thumb-container":"fb-2K-Xo"},
  name: 'Body',
  components: { MyButton: MyButton, Tree: Tree, Thumb: Thumb, Upload: Upload }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();






var AppFooter = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('footer',{staticClass:"fb-footer"})},staticRenderFns: [],
  name: 'Footer'
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=":root { --mdc-theme-primary: #444; --mdc-theme-primary-light: #8b8b8b; --mdc-theme-primary-dark: #686868; --mdc-theme-secondary: #ffab40; --mdc-theme-secondary-light: #ffca87; --mdc-theme-secondary-dark: #f88b00; --mdc-theme-background: #fff; --mdc-theme-text-primary-on-primary: white; --mdc-theme-text-secondary-on-primary: rgba(255, 255, 255, 0.7); --mdc-theme-text-hint-on-primary: rgba(255, 255, 255, 0.5); --mdc-theme-text-disabled-on-primary: rgba(255, 255, 255, 0.5); --mdc-theme-text-icon-on-primary: rgba(255, 255, 255, 0.5); --mdc-theme-text-primary-on-primary-light: white; --mdc-theme-text-secondary-on-primary-light: rgba(255, 255, 255, 0.7); --mdc-theme-text-hint-on-primary-light: rgba(255, 255, 255, 0.5); --mdc-theme-text-disabled-on-primary-light: rgba(255, 255, 255, 0.5); --mdc-theme-text-icon-on-primary-light: rgba(255, 255, 255, 0.5); --mdc-theme-text-primary-on-primary-dark: white; --mdc-theme-text-secondary-on-primary-dark: rgba(255, 255, 255, 0.7); --mdc-theme-text-hint-on-primary-dark: rgba(255, 255, 255, 0.5); --mdc-theme-text-disabled-on-primary-dark: rgba(255, 255, 255, 0.5); --mdc-theme-text-icon-on-primary-dark: rgba(255, 255, 255, 0.5); --mdc-theme-text-primary-on-secondary: rgba(0, 0, 0, 0.87); --mdc-theme-text-secondary-on-secondary: rgba(0, 0, 0, 0.54); --mdc-theme-text-hint-on-secondary: rgba(0, 0, 0, 0.38); --mdc-theme-text-disabled-on-secondary: rgba(0, 0, 0, 0.38); --mdc-theme-text-icon-on-secondary: rgba(0, 0, 0, 0.38); --mdc-theme-text-primary-on-secondary-light: rgba(0, 0, 0, 0.87); --mdc-theme-text-secondary-on-secondary-light: rgba(0, 0, 0, 0.54); --mdc-theme-text-hint-on-secondary-light: rgba(0, 0, 0, 0.38); --mdc-theme-text-disabled-on-secondary-light: rgba(0, 0, 0, 0.38); --mdc-theme-text-icon-on-secondary-light: rgba(0, 0, 0, 0.38); --mdc-theme-text-primary-on-secondary-dark: rgba(0, 0, 0, 0.87); --mdc-theme-text-secondary-on-secondary-dark: rgba(0, 0, 0, 0.54); --mdc-theme-text-hint-on-secondary-dark: rgba(0, 0, 0, 0.38); --mdc-theme-text-disabled-on-secondary-dark: rgba(0, 0, 0, 0.38); --mdc-theme-text-icon-on-secondary-dark: rgba(0, 0, 0, 0.38); --mdc-theme-text-primary-on-background: rgba(0, 0, 0, 0.87); --mdc-theme-text-secondary-on-background: rgba(0, 0, 0, 0.54); --mdc-theme-text-hint-on-background: rgba(0, 0, 0, 0.38); --mdc-theme-text-disabled-on-background: rgba(0, 0, 0, 0.38); --mdc-theme-text-icon-on-background: rgba(0, 0, 0, 0.38); --mdc-theme-text-primary-on-light: rgba(0, 0, 0, 0.87); --mdc-theme-text-secondary-on-light: rgba(0, 0, 0, 0.54); --mdc-theme-text-hint-on-light: rgba(0, 0, 0, 0.38); --mdc-theme-text-disabled-on-light: rgba(0, 0, 0, 0.38); --mdc-theme-text-icon-on-light: rgba(0, 0, 0, 0.38); --mdc-theme-text-primary-on-dark: white; --mdc-theme-text-secondary-on-dark: rgba(255, 255, 255, 0.7); --mdc-theme-text-hint-on-dark: rgba(255, 255, 255, 0.5); --mdc-theme-text-disabled-on-dark: rgba(255, 255, 255, 0.5); --mdc-theme-text-icon-on-dark: rgba(255, 255, 255, 0.5); } .fb-2l65Q { /* @alternate */ background-color: #fff; background-color: var(--mdc-theme-background, #fff); } .fb-3H_iA { /* @alternate */ color: #444 !important; color: var(--mdc-theme-primary, #444) !important; } .fb-2q0NX { /* @alternate */ color: #8b8b8b !important; color: var(--mdc-theme-primary-light, #8b8b8b) !important; } .fb-2DK6j { /* @alternate */ color: #686868 !important; color: var(--mdc-theme-primary-dark, #686868) !important; } .fb-2u5MI { /* @alternate */ color: #ffab40 !important; color: var(--mdc-theme-secondary, #ffab40) !important; } .fb-2jzh3 { /* @alternate */ color: #ffca87 !important; color: var(--mdc-theme-secondary-light, #ffca87) !important; } .fb-1MuW- { /* @alternate */ color: #f88b00 !important; color: var(--mdc-theme-secondary-dark, #f88b00) !important; } .fb-oSOPi { /* @alternate */ color: white !important; color: var(--mdc-theme-text-primary-on-primary, white) !important; } .fb-2oZsk { /* @alternate */ color: rgba(255, 255, 255, 0.7) !important; color: var(--mdc-theme-text-secondary-on-primary, rgba(255, 255, 255, 0.7)) !important; } .fb-3Xjtc { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-hint-on-primary, rgba(255, 255, 255, 0.5)) !important; } .fb-gMvEa { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-disabled-on-primary, rgba(255, 255, 255, 0.5)) !important; } .fb-2l6kC { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-icon-on-primary, rgba(255, 255, 255, 0.5)) !important; } .fb-1HL_k { /* @alternate */ color: white !important; color: var(--mdc-theme-text-primary-on-primary-light, white) !important; } .fb-MuiNb { /* @alternate */ color: rgba(255, 255, 255, 0.7) !important; color: var(--mdc-theme-text-secondary-on-primary-light, rgba(255, 255, 255, 0.7)) !important; } .fb-xH63v { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-hint-on-primary-light, rgba(255, 255, 255, 0.5)) !important; } .fb-2O3Hh { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-disabled-on-primary-light, rgba(255, 255, 255, 0.5)) !important; } .fb-yPq_y { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-icon-on-primary-light, rgba(255, 255, 255, 0.5)) !important; } .fb-4ZRFU { /* @alternate */ color: white !important; color: var(--mdc-theme-text-primary-on-primary-dark, white) !important; } .fb-2NGTU { /* @alternate */ color: rgba(255, 255, 255, 0.7) !important; color: var(--mdc-theme-text-secondary-on-primary-dark, rgba(255, 255, 255, 0.7)) !important; } .fb-qDKtR { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-hint-on-primary-dark, rgba(255, 255, 255, 0.5)) !important; } .fb-3vAWW { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-disabled-on-primary-dark, rgba(255, 255, 255, 0.5)) !important; } .fb-_YHMP { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-icon-on-primary-dark, rgba(255, 255, 255, 0.5)) !important; } .fb-2zDI0 { /* @alternate */ color: rgba(0, 0, 0, 0.87) !important; color: var(--mdc-theme-text-primary-on-secondary, rgba(0, 0, 0, 0.87)) !important; } .fb-1NGz2 { /* @alternate */ color: rgba(0, 0, 0, 0.54) !important; color: var(--mdc-theme-text-secondary-on-secondary, rgba(0, 0, 0, 0.54)) !important; } .fb-B7sCF { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-hint-on-secondary, rgba(0, 0, 0, 0.38)) !important; } .fb-3Nb5K { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-disabled-on-secondary, rgba(0, 0, 0, 0.38)) !important; } .fb-2auAo { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-icon-on-secondary, rgba(0, 0, 0, 0.38)) !important; } .fb-3eodE { /* @alternate */ color: rgba(0, 0, 0, 0.87) !important; color: var(--mdc-theme-text-primary-on-secondary-light, rgba(0, 0, 0, 0.87)) !important; } .fb-3DFag { /* @alternate */ color: rgba(0, 0, 0, 0.54) !important; color: var(--mdc-theme-text-secondary-on-secondary-light, rgba(0, 0, 0, 0.54)) !important; } .fb-iErYm { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-hint-on-secondary-light, rgba(0, 0, 0, 0.38)) !important; } .fb-1NdBa { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-disabled-on-secondary-light, rgba(0, 0, 0, 0.38)) !important; } .fb-sqadP { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-icon-on-secondary-light, rgba(0, 0, 0, 0.38)) !important; } .fb-1MML_ { /* @alternate */ color: rgba(0, 0, 0, 0.87) !important; color: var(--mdc-theme-text-primary-on-secondary-dark, rgba(0, 0, 0, 0.87)) !important; } .fb-30vKs { /* @alternate */ color: rgba(0, 0, 0, 0.54) !important; color: var(--mdc-theme-text-secondary-on-secondary-dark, rgba(0, 0, 0, 0.54)) !important; } .fb-3YlXN { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-hint-on-secondary-dark, rgba(0, 0, 0, 0.38)) !important; } .fb-2qKSf { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-disabled-on-secondary-dark, rgba(0, 0, 0, 0.38)) !important; } .fb-3Xiy6 { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-icon-on-secondary-dark, rgba(0, 0, 0, 0.38)) !important; } .fb-vquGu { /* @alternate */ color: rgba(0, 0, 0, 0.87) !important; color: var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87)) !important; } .fb-14428 { /* @alternate */ color: rgba(0, 0, 0, 0.54) !important; color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54)) !important; } .fb-3pLBx { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38)) !important; } .fb-3fhfj { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-disabled-on-background, rgba(0, 0, 0, 0.38)) !important; } .fb-3fME0 { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-icon-on-background, rgba(0, 0, 0, 0.38)) !important; } .fb-3bOr8 { /* @alternate */ color: rgba(0, 0, 0, 0.87) !important; color: var(--mdc-theme-text-primary-on-light, rgba(0, 0, 0, 0.87)) !important; } .fb-3jvWV { /* @alternate */ color: rgba(0, 0, 0, 0.54) !important; color: var(--mdc-theme-text-secondary-on-light, rgba(0, 0, 0, 0.54)) !important; } .fb-24VMm { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-hint-on-light, rgba(0, 0, 0, 0.38)) !important; } .fb-cIcvD { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-disabled-on-light, rgba(0, 0, 0, 0.38)) !important; } .fb-1NA-f { /* @alternate */ color: rgba(0, 0, 0, 0.38) !important; color: var(--mdc-theme-text-icon-on-light, rgba(0, 0, 0, 0.38)) !important; } .fb-Hp9Sx { /* @alternate */ color: white !important; color: var(--mdc-theme-text-primary-on-dark, white) !important; } .fb-3K7HT { /* @alternate */ color: rgba(255, 255, 255, 0.7) !important; color: var(--mdc-theme-text-secondary-on-dark, rgba(255, 255, 255, 0.7)) !important; } .fb-Xar6F { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-hint-on-dark, rgba(255, 255, 255, 0.5)) !important; } .fb-1-9td { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-disabled-on-dark, rgba(255, 255, 255, 0.5)) !important; } .fb-1Seo4 { /* @alternate */ color: rgba(255, 255, 255, 0.5) !important; color: var(--mdc-theme-text-icon-on-dark, rgba(255, 255, 255, 0.5)) !important; } .fb-2qNQ5 { /* @alternate */ background-color: #444 !important; background-color: var(--mdc-theme-primary, #444) !important; } .fb-1G91K { /* @alternate */ background-color: #8b8b8b !important; background-color: var(--mdc-theme-primary-light, #8b8b8b) !important; } .fb-1Yvic { /* @alternate */ background-color: #686868 !important; background-color: var(--mdc-theme-primary-dark, #686868) !important; } .fb-1_3y_ { /* @alternate */ background-color: #ffab40 !important; background-color: var(--mdc-theme-secondary, #ffab40) !important; } .fb-PZ3Nq { /* @alternate */ background-color: #ffca87 !important; background-color: var(--mdc-theme-secondary-light, #ffca87) !important; } .fb-Jl_Pn { /* @alternate */ background-color: #f88b00 !important; background-color: var(--mdc-theme-secondary-dark, #f88b00) !important; } .fb-_GXWp { position: absolute; z-index: 111; display: flex; justify-content: space-around; flex-direction: column; flex-flow: column; min-width: 450px; width: 800px; height: 100%; min-height: 250px; max-height: calc(100vh - 10px); margin: auto; overflow: hidden; background-color: #fff; border: 1px solid #aaaaaa; box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 3px; border-top-right-radius: 5px; border-top-left-radius: 5px; box-sizing: border-box; } .fb-_GXWp *, .fb-_GXWp *:before, .fb-_GXWp *:after { box-sizing: inherit; } .fb-_GXWp h1, .fb-_GXWp h2, .fb-_GXWp h3, .fb-_GXWp h4, .fb-_GXWp h5, .fb-_GXWp h6 { margin: 0; } .fb-_GXWp button { font-family: inherit; } .fb-_GXWp button i, .fb-_GXWp button span { vertical-align: middle; } .fb-_GXWp.fb-2aTTm { overflow: visible; } .fb-zPpTt { position: relative; display: flex; flex-direction: column; height: 100%; overflow: hidden; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();
































































var App = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.visible),expression:"visible"}],ref:"container",staticClass:"fb-_GXWp",class:( obj = {}, obj[_vm.$style.modal] = _vm.$store.state.modal.active, obj )},[_c('div',{staticClass:"fb-zPpTt"},[_c('app-header'),_c('app-body'),_c('app-footer')],1)])
var obj;},staticRenderFns: [],cssModules: {"mdcThemeBackground":"fb-2l65Q","mdc-theme--background":"fb-2l65Q","mdcThemePrimary":"fb-3H_iA","mdc-theme--primary":"fb-3H_iA","mdcThemePrimaryLight":"fb-2q0NX","mdc-theme--primary-light":"fb-2q0NX","mdcThemePrimaryDark":"fb-2DK6j","mdc-theme--primary-dark":"fb-2DK6j","mdcThemeSecondary":"fb-2u5MI","mdc-theme--secondary":"fb-2u5MI","mdcThemeSecondaryLight":"fb-2jzh3","mdc-theme--secondary-light":"fb-2jzh3","mdcThemeSecondaryDark":"fb-1MuW-","mdc-theme--secondary-dark":"fb-1MuW-","mdcThemeTextPrimaryOnPrimary":"fb-oSOPi","mdc-theme--text-primary-on-primary":"fb-oSOPi","mdcThemeTextSecondaryOnPrimary":"fb-2oZsk","mdc-theme--text-secondary-on-primary":"fb-2oZsk","mdcThemeTextHintOnPrimary":"fb-3Xjtc","mdc-theme--text-hint-on-primary":"fb-3Xjtc","mdcThemeTextDisabledOnPrimary":"fb-gMvEa","mdc-theme--text-disabled-on-primary":"fb-gMvEa","mdcThemeTextIconOnPrimary":"fb-2l6kC","mdc-theme--text-icon-on-primary":"fb-2l6kC","mdcThemeTextPrimaryOnPrimaryLight":"fb-1HL_k","mdc-theme--text-primary-on-primary-light":"fb-1HL_k","mdcThemeTextSecondaryOnPrimaryLight":"fb-MuiNb","mdc-theme--text-secondary-on-primary-light":"fb-MuiNb","mdcThemeTextHintOnPrimaryLight":"fb-xH63v","mdc-theme--text-hint-on-primary-light":"fb-xH63v","mdcThemeTextDisabledOnPrimaryLight":"fb-2O3Hh","mdc-theme--text-disabled-on-primary-light":"fb-2O3Hh","mdcThemeTextIconOnPrimaryLight":"fb-yPq_y","mdc-theme--text-icon-on-primary-light":"fb-yPq_y","mdcThemeTextPrimaryOnPrimaryDark":"fb-4ZRFU","mdc-theme--text-primary-on-primary-dark":"fb-4ZRFU","mdcThemeTextSecondaryOnPrimaryDark":"fb-2NGTU","mdc-theme--text-secondary-on-primary-dark":"fb-2NGTU","mdcThemeTextHintOnPrimaryDark":"fb-qDKtR","mdc-theme--text-hint-on-primary-dark":"fb-qDKtR","mdcThemeTextDisabledOnPrimaryDark":"fb-3vAWW","mdc-theme--text-disabled-on-primary-dark":"fb-3vAWW","mdcThemeTextIconOnPrimaryDark":"fb-_YHMP","mdc-theme--text-icon-on-primary-dark":"fb-_YHMP","mdcThemeTextPrimaryOnSecondary":"fb-2zDI0","mdc-theme--text-primary-on-secondary":"fb-2zDI0","mdcThemeTextSecondaryOnSecondary":"fb-1NGz2","mdc-theme--text-secondary-on-secondary":"fb-1NGz2","mdcThemeTextHintOnSecondary":"fb-B7sCF","mdc-theme--text-hint-on-secondary":"fb-B7sCF","mdcThemeTextDisabledOnSecondary":"fb-3Nb5K","mdc-theme--text-disabled-on-secondary":"fb-3Nb5K","mdcThemeTextIconOnSecondary":"fb-2auAo","mdc-theme--text-icon-on-secondary":"fb-2auAo","mdcThemeTextPrimaryOnSecondaryLight":"fb-3eodE","mdc-theme--text-primary-on-secondary-light":"fb-3eodE","mdcThemeTextSecondaryOnSecondaryLight":"fb-3DFag","mdc-theme--text-secondary-on-secondary-light":"fb-3DFag","mdcThemeTextHintOnSecondaryLight":"fb-iErYm","mdc-theme--text-hint-on-secondary-light":"fb-iErYm","mdcThemeTextDisabledOnSecondaryLight":"fb-1NdBa","mdc-theme--text-disabled-on-secondary-light":"fb-1NdBa","mdcThemeTextIconOnSecondaryLight":"fb-sqadP","mdc-theme--text-icon-on-secondary-light":"fb-sqadP","mdcThemeTextPrimaryOnSecondaryDark":"fb-1MML_","mdc-theme--text-primary-on-secondary-dark":"fb-1MML_","mdcThemeTextSecondaryOnSecondaryDark":"fb-30vKs","mdc-theme--text-secondary-on-secondary-dark":"fb-30vKs","mdcThemeTextHintOnSecondaryDark":"fb-3YlXN","mdc-theme--text-hint-on-secondary-dark":"fb-3YlXN","mdcThemeTextDisabledOnSecondaryDark":"fb-2qKSf","mdc-theme--text-disabled-on-secondary-dark":"fb-2qKSf","mdcThemeTextIconOnSecondaryDark":"fb-3Xiy6","mdc-theme--text-icon-on-secondary-dark":"fb-3Xiy6","mdcThemeTextPrimaryOnBackground":"fb-vquGu","mdc-theme--text-primary-on-background":"fb-vquGu","mdcThemeTextSecondaryOnBackground":"fb-14428","mdc-theme--text-secondary-on-background":"fb-14428","mdcThemeTextHintOnBackground":"fb-3pLBx","mdc-theme--text-hint-on-background":"fb-3pLBx","mdcThemeTextDisabledOnBackground":"fb-3fhfj","mdc-theme--text-disabled-on-background":"fb-3fhfj","mdcThemeTextIconOnBackground":"fb-3fME0","mdc-theme--text-icon-on-background":"fb-3fME0","mdcThemeTextPrimaryOnLight":"fb-3bOr8","mdc-theme--text-primary-on-light":"fb-3bOr8","mdcThemeTextSecondaryOnLight":"fb-3jvWV","mdc-theme--text-secondary-on-light":"fb-3jvWV","mdcThemeTextHintOnLight":"fb-24VMm","mdc-theme--text-hint-on-light":"fb-24VMm","mdcThemeTextDisabledOnLight":"fb-cIcvD","mdc-theme--text-disabled-on-light":"fb-cIcvD","mdcThemeTextIconOnLight":"fb-1NA-f","mdc-theme--text-icon-on-light":"fb-1NA-f","mdcThemeTextPrimaryOnDark":"fb-Hp9Sx","mdc-theme--text-primary-on-dark":"fb-Hp9Sx","mdcThemeTextSecondaryOnDark":"fb-3K7HT","mdc-theme--text-secondary-on-dark":"fb-3K7HT","mdcThemeTextHintOnDark":"fb-Xar6F","mdc-theme--text-hint-on-dark":"fb-Xar6F","mdcThemeTextDisabledOnDark":"fb-1-9td","mdc-theme--text-disabled-on-dark":"fb-1-9td","mdcThemeTextIconOnDark":"fb-1Seo4","mdc-theme--text-icon-on-dark":"fb-1Seo4","mdcThemePrimaryBg":"fb-2qNQ5","mdc-theme--primary-bg":"fb-2qNQ5","mdcThemePrimaryLightBg":"fb-1G91K","mdc-theme--primary-light-bg":"fb-1G91K","mdcThemePrimaryDarkBg":"fb-1Yvic","mdc-theme--primary-dark-bg":"fb-1Yvic","mdcThemeSecondaryBg":"fb-1_3y_","mdc-theme--secondary-bg":"fb-1_3y_","mdcThemeSecondaryLightBg":"fb-PZ3Nq","mdc-theme--secondary-light-bg":"fb-PZ3Nq","mdcThemeSecondaryDarkBg":"fb-Jl_Pn","mdc-theme--secondary-dark-bg":"fb-Jl_Pn","container":"fb-_GXWp","modal":"fb-2aTTm","wrapper":"fb-zPpTt"},
  name: 'App',
  components: { AppHeader: AppHeader, AppBody: AppBody, AppFooter: AppFooter },
  computed: {
    $style: function $style() { return this.$options.cssModules },
    visible: function visible() {
      return this.$store.state.isModal
        ? this.$store.state.modal.active
        : true;
    }
  }

};

const text = Object.assign({}, TEXT);

text.TITLE = 'Image Browser';
text.ROOT_FOLDER = 'Root Folder';
text.PREVIEW = 'Sending Preview';
text.BUTTON.SEND_EDITOR = 'Send to Editor';
text.BUTTON.CHOOSE = 'Escolha';
text.BUTTON.SEND = 'Envie';



/*
 * Language specific
 */
// FB.lang['pt-br'] = {
//   title: 'Image Browser',
//   root_folder: 'Root Folder',
//   preview: 'Sending Preview',
//   send_to_editor: 'Send to Editor',
//   toolbar: {
//     bt_choose: 'Escolha',
//     bt_send: 'Envie',
//     bt_del_file: 'Remover Arquivo',
//     bt_new_folder: 'Nova Pasta',
//     bt_del_folder: 'Remover Pasta',
//     bt_send_editor: 'Enviar para o Editor'
//   },
//   file: {
//     total: 'Total de Arquivos:',
//     del: 'Remover Arquivo',
//     dels: 'Remover Arquivos'
//   },
//   folder: {
//     new_: 'Nova Pasta',
//     del: 'Remover Pasta',
//     creation: 'Esta pasta será criada em:',
//     minimum: [
//       '<p>Preenchimento mínimo: 1 - máximo: 10',
//       '<br>Apenas <span class="strong">letras</span>, ',
//       '<span class="strong">números</span>',
//       ' e os seguintes caracteres: <span class="highlight">. - _</span></p>'
//     ].join(''),
//     deletion: [
//       '<p class="folder-path">Esta pasta <span>%1</span>',
//       ' será removida juntamente com todo seu conteúdo: </p>',
//       '<p>Total de Arquivos: <span class="destaque">%2</span>',
//       ' &mdash; Total de Sub-Pastas: <span class="destaque">%3</span></p>'
//     ].join('')
//   },
//   alert: {
//     bt_ok: 'OK',
//     bt_cancel: 'Cancelar',
//     image: {
//       not_min_size: 'Apenas imagens com no mínimo %1 x %2!'
//     },
//     upload: {
//       sending: 'Um envio já está em andamento!',
//       none: 'Nenhum arquivo foi selecionado!',
//       sent: 'Todos os arquivos já foram enviados!'
//     }
//   }
// };

var folder = {
  namespaced: true,
  actions: {
    create: function create(ref, name) {
      var rootGetters = ref.rootGetters;
      var dispatch = ref.dispatch;

      return new Promise(function (resolve, reject) {
        const path = (rootGetters['tree/path']) + "/" + name;
        axios.post(ROUTES.FOLDER.CREATE, { path: path }).then(function (res) {
          var ref = res.data;
          var message = ref.message;
          const opts = { root: true };
          dispatch('tree/addFolder', name, opts);
          dispatch('message/show', { message: message, type: 'success' }, opts);
          resolve(res.data.message);
        }).catch(function (res) {
          var ref = res.data;
          var message = ref.message;
          const opts = { root: true };
          dispatch('message/show', { message: message, type: 'alert' }, opts);
          reject();
        });
      });
    },
    remove: function remove(ref) {
      var rootGetters = ref.rootGetters;
      var dispatch = ref.dispatch;

      return new Promise(function (resolve, reject) {
        const path = rootGetters['tree/path'];
        axios.patch(ROUTES.FOLDER.REMOVE, { path: path }).then(function (res) {
          var ref = res.data;
          var message = ref.message;
          const opts = { root: true };
          dispatch('tree/removeFolder', null, opts);
          dispatch('message/show', { message: message, type: 'success' }, opts);
          resolve();
        }).catch(function (res) {
          var ref = res.data;
          var message = ref.message;
          const opts = { root: true };
          dispatch('message/show', { message: message, type: 'alert' }, opts);
          reject();
        });
      });
    }
  }
};

var tree = {
  namespaced: true,
  state: {
    ready: false,
    hierarchy: [],
    selected: { id: ROOT_ID, name:'', parents: [], files: [] },
    tree: {}
  },
  getters: {
    path: function (state) {
      return state.hierarchy.slice(1).join('/');
    },
    folder: function (state) { return function (id, parents) {
      const parents_ = parents.slice(1);
      let hierarchy = [state.tree[ROOT_ID].name];
      let folder;

      if (id === ROOT_ID) {
        return { folder: state.tree[ROOT_ID], hierarchy: hierarchy };
      } else if (parents_.length) {
        parents_.reduce(function (acc, curr, idx) {
          if (idx === parents_.length - 1) {
            folder = acc[curr].folders[id];
          }
          hierarchy.push(acc[curr].name);
          return acc[curr].folders;
        }, state.tree[ROOT_ID].folders);
      } else {
        folder = state.tree[ROOT_ID].folders[id];
      }

      hierarchy.push(folder.name);
      return { folder: folder, hierarchy: hierarchy };
    }; },
    selectedFolder: function (state, getters) {
      var ref = state.selected;
      var id = ref.id;
      var parents = ref.parents;
      return getters.folder(id, parents);
    },
    parentSelectedFolder: function (state) {
      var ref = state.selected;
      var id = ref.id;
      var parents = ref.parents;
      const parents_ = parents.slice(1);
      let folder;

      if (id === ROOT_ID) {
        return state.tree[ROOT_ID];
      } else if (parents_.length) {
        parents_.reduce(function (acc, curr, idx) {
          if (idx === parents_.length - 1) {
            folder = acc[curr];
          }
          return acc[curr].folders;
        }, state.tree[ROOT_ID].folders);
      } else {
        folder = state.tree[ROOT_ID];
      }

      return folder;
    }
  },
  actions: {
    get: function get(ref) {
      var dispatch = ref.dispatch;
      var rootState = ref.rootState;

      axios(rootState.options.server + ROUTES.FILES.ALL)
        .then(function (res) { return dispatch('load', res.data); })
        .catch(console.error);
    },
    load: function load(ref, tree) {
      var commit = ref.commit;
      var dispatch = ref.dispatch;
      var state = ref.state;
      var rootState = ref.rootState;

      var ref$1 = state.selected;
      var id = ref$1.id;
      var parents = ref$1.parents;
      tree.name = rootState.text.ROOT_FOLDER;
      commit('load', tree);
      dispatch('select', { id: id, parents: parents });
    },
    select: function select(ref, ref$1) {
      var commit = ref.commit;
      var getters = ref.getters;
      var id = ref$1.id;
      var parents = ref$1.parents; if ( parents === void 0 ) parents = [];

      var ref$2 = getters.folder(id, parents);
      var folder = ref$2.folder;
      var hierarchy = ref$2.hierarchy;
      commit('select', {
        id: id,
        parents: parents,
        name: folder.name,
        files: folder.files,
        hierarchy: hierarchy
      });
      commit('file/removeSelected', null, { root: true });
    },
    addFolder: function addFolder(ref, name) {
      var commit = ref.commit;
      var getters = ref.getters;
      var state = ref.state;

      const id = ID();
      const parentId = state.selected.id;
      var ref$1 = state.selected;
      var parents = ref$1.parents;
      var ref$2 = getters.folder(parentId, parents);
      var folder = ref$2.folder;
      commit('addFolder', { id: id, name: name, parentFolder: folder });
    },
    addFile: function addFile(ref, file) {
      var commit = ref.commit;
      var getters = ref.getters;
      var state = ref.state;

      var ref$1 = state.selected;
      var id = ref$1.id;
      var parents = ref$1.parents;
      var ref$2 = getters.folder(id, parents);
      var folder = ref$2.folder;
      commit('addFile', { folder: folder, file: file });
    },
    removeFolder: function removeFolder(ref) {
      var dispatch = ref.dispatch;
      var commit = ref.commit;
      var getters = ref.getters;
      var state = ref.state;

      const parentFolder = getters.parentSelectedFolder;
      var parents = parentFolder.parents;
      const selectedParents = state.selected.parents;
      const parentId = selectedParents[selectedParents.length - 1];
      commit('removeFolder', parentFolder);
      dispatch('select', { id: parentId, parents: parents });
    },
    removeFiles: function removeFiles(ref, files) {
      var commit = ref.commit;
      var getters = ref.getters;
      var state = ref.state;

      var ref$1 = state.selected;
      var id = ref$1.id;
      var parents = ref$1.parents;
      var ref$2 = getters.folder(id, parents);
      var folder = ref$2.folder;
      commit('removeFiles', { folder: folder, files: files });
    }
  },
  mutations: {
    load: function load(state, tree) {
      Vue.set(state.tree, ROOT_ID, tree);
      state.ready = true;
      console.log('tree/mutations load', state.tree);
    },
    addFolder: function addFolder(state, ref) {
      var id = ref.id;
      var name = ref.name;
      var parentFolder = ref.parentFolder;

      const parentId = state.selected.id;
      const folder = {
        name: name,
        files: [],
        folders: {},
        parents: state.selected.parents.concat(parentId)
      };
      Vue.set(parentFolder.folders, id, folder);
    },
    addFile: function addFile(state, ref) {
      var folder = ref.folder;
      var file = ref.file;

      folder.files.push(file);
    },
    removeFiles: function removeFiles(state, ref) {
      var folder = ref.folder;
      var files = ref.files;

      state.selected.files = folder.files = folder.files.filter(function (e, i) {
        return !files.includes(i);
      });
    },
    removeFolder: function removeFolder(state, parent) {
      Vue.delete(parent.folders, state.selected.id);
    },
    select: function select(state, ref) {
      var id = ref.id;
      var name = ref.name;
      var parents = ref.parents;
      var files = ref.files;
      var hierarchy = ref.hierarchy;

      state.hierarchy = hierarchy;
      state.selected = { id: id, name: name, parents: parents, files: files };
    }
  }
};

var file = {
  namespaced: true,
  state: {
    selected: []
  },
  actions: {
    remove: function remove(ref) {
      var state = ref.state;
      var rootState = ref.rootState;
      var rootGetters = ref.rootGetters;
      var dispatch = ref.dispatch;
      var commit = ref.commit;

      const folder = rootGetters['tree/path'];
      const files =
        state.selected.map(function (k) { return rootState.tree.selected.files[k].name; });

      return new Promise(function (resolve, reject) {
        axios.patch(ROUTES.FILES.REMOVE, { files: files, folder: folder }).then(function (res) {
          const selected = state.selected.slice();
          resolve(res.data.message);
          commit('removeSelected');
          dispatch('tree/removeFiles', selected, { root: true });
        }).catch(function (res) { return reject(res.data.message); });
      });
    }
  },
  mutations: {
    removeSelected: function removeSelected(state) {
      state.selected = [];
    },
    toggleSelect: function toggleSelect(state, idx) {
      state.selected.includes(idx)
        ? state.selected.splice(state.selected.indexOf(idx), 1)
        : state.selected.push(idx);
    }
  }
};

var upload = {
  namespaced: true,
  state: {
    pending: false,
    files: {}
  },
  getters: {
    progress: function (state) { return function (id) {
      return state.files[id].progress;
    }; }
  },
  actions: {
    send: function send(ref, file) {
      var commit = ref.commit;
      var dispatch = ref.dispatch;
      var rootState = ref.rootState;

      const data = new FormData();
      data.append('id', file.id);
      data.append('name', file.name);
      data.append('file', file.blob);
      data.append('directory', rootState.tree.hierarchy.slice(1).join('/'));

      const config = {
        onUploadProgress: function (e) {
          const progress = Math.round((e.loaded * 100) / e.total);
          commit('progress', { id: file.id, progress: progress });
        }
      };

      return new Promise(function (resolve, reject) {
        axios.post(ROUTES.FILES.UPLOAD, data, config)
          .then(function (res) {
            dispatch('tree/addFile', res.data, { root: true });
            commit('done', file.id);
            console.log('upload/actions/send', res.data, rootState.tree.tree);
          }).catch(reject);
      });
    }
  },
  mutations: {
    selected: function selected(state) {
      state.pending = true;
    },
    preview: function preview(state, obj) {
      if (state.pending) {
        Vue.set(state.files, obj.id, {
          name: obj.name,
          blob: obj.blob,
          type: obj.type,
          mime: obj.mime,
          progress: 0,
          uploaded: false
        });
      }
    },
    progress: function progress(state, ref) {
      var id = ref.id;
      var progress = ref.progress;

      Vue.set(state.files[id], 'progress', progress);
    },
    addThumb: function addThumb(state, obj) {
      Vue.set(state.files[obj.id], 'thumb', obj.thumb);
    },
    done: function done(state, id) {
      setTimeout(function () {
        Vue.delete(state.files, id);
        if (!Object.keys(state.files).length) {
          state.pending = false;
        }
      }, 1200);
    }
  }
};

var message = {
  namespaced: true,
  state: { show: false, class: '', message: '' },
  actions: {
    show: function show(ref, ref$1) {
      var commit = ref.commit;
      var message = ref$1.message;
      var type = ref$1.type;

      commit('show', { message: message, type: type });
      setTimeout(function () { commit('hide'); }, 5000);
    }
  },
  mutations: {
    show: function show(state, ref) {
      var message = ref.message;
      var type = ref.type;

      state.show = true;
      state.message = message;
      state.class = type;
    },
    hide: function hide(state, type) {
      state.show = false;
    }
  }
};

var modal = {
  namespaced: true,
  state: { active: false },
  mutations: {
    open: function open(state) {
      state.active = true;
    },
    close: function close(state) {
      state.active = false;
    }
  }
};

var store = new Vuex.Store({
  modules: { folder: folder, tree: tree, file: file, message: message, upload: upload, modal: modal },
  state: {
    text: {},
    isModal: true,
    options: OPTIONS
  },
  mutations: {
    mergeOptions: function mergeOptions(state, opts) {
      state.options = Object.assign(state.options, opts);
      switch (state.options.lang) {
        case LANG.BR:
          state.text = text;
          break;
        default:
          state.text = TEXT;
      }
    }
  }
});

const draggable = {
  bind: function bind(el, binding, vnode) {
    let startX, startY, initialMouseX, initialMouseY;

    el.addEventListener('mousedown', function (e) {
      const container = app.$children[0].$refs.container;
      startX = container.offsetLeft;
      startY = container.offsetTop;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      return false;
    });

    function mousemove(e) {
      const container = app.$children[0].$refs.container;
      const dx = e.clientX - initialMouseX;
      const dy = e.clientY - initialMouseY;
      container.style.top = startY + dy + 'px';
      container.style.left = startX + dx + 'px';
      return false;
    }

    function mouseup() {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    }
  }
};

Vue.directive('draggable', draggable);

const app = new Vue({
  store: store,
  mounted: function mounted() {
    console.log('app mounted', this.$el);
  },
  render: function (h) { return h(App); }
});

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}



/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */

var FileBrowser = function FileBrowser(el, options) {
  if ( options === void 0 ) options = {};


  if (!(this instanceof FileBrowser)) {
    return new FileBrowser(el, options);
  }

  if (isObject(el)) {
    options = el;
    el = document.createElement('div');
    document.body.appendChild(el);
  }

  this.options = options;

  store.commit('mergeOptions', options);
  store.dispatch('tree/get');
  app.$mount(el);
};

FileBrowser.prototype.show = function show () {
  store.commit('modal/open');
};

FileBrowser.prototype.hide = function hide () {
  store.commit('modal/close');
};

return FileBrowser;

}(Vue,mdc.ripple,mdc.dialog,mdc.textfield,pica,Vuex,axios));
