/*!
 * FileBrowser - v1.3.0
 * ${description}
 * ${homepage}
 * Built: Fri Aug 18 2017 10:17:35 GMT-0300 (-03)
 */

var FileBrowser = (function (Vue,_material_ripple,_material_dialog,_material_textfield,Vuex) {
'use strict';

Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;
Vuex = Vuex && Vuex.hasOwnProperty('default') ? Vuex['default'] : Vuex;

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
    new _material_ripple.MDCRipple(this.$el);
  }
};

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
  const map = {
    'Á':'A',
    'Ă':'A',
    'Ắ':'A',
    'Ặ':'A',
    'Ằ':'A',
    'Ẳ':'A',
    'Ẵ':'A',
    'Ǎ':'A',
    'Â':'A',
    'Ấ':'A',
    'Ậ':'A',
    'Ầ':'A',
    'Ẩ':'A',
    'Ẫ':'A',
    'Ä':'A',
    'Ǟ':'A',
    'Ȧ':'A',
    'Ǡ':'A',
    'Ạ':'A',
    'Ȁ':'A',
    'À':'A',
    'Ả':'A',
    'Ȃ':'A',
    'Ā':'A',
    'Ą':'A',
    'Å':'A',
    'Ǻ':'A',
    'Ḁ':'A',
    'Ⱥ':'A',
    'Ã':'A',
    'Ꜳ':'AA',
    'Æ':'AE',
    'Ǽ':'AE',
    'Ǣ':'AE',
    'Ꜵ':'AO',
    'Ꜷ':'AU',
    'Ꜹ':'AV',
    'Ꜻ':'AV',
    'Ꜽ':'AY',
    'Ḃ':'B',
    'Ḅ':'B',
    'Ɓ':'B',
    'Ḇ':'B',
    'Ƀ':'B',
    'Ƃ':'B',
    'Ć':'C',
    'Č':'C',
    'Ç':'C',
    'Ḉ':'C',
    'Ĉ':'C',
    'Ċ':'C',
    'Ƈ':'C',
    'Ȼ':'C',
    'Ď':'D',
    'Ḑ':'D',
    'Ḓ':'D',
    'Ḋ':'D',
    'Ḍ':'D',
    'Ɗ':'D',
    'Ḏ':'D',
    'ǲ':'D',
    'ǅ':'D',
    'Đ':'D',
    'Ƌ':'D',
    'Ǳ':'DZ',
    'Ǆ':'DZ',
    'É':'E',
    'Ĕ':'E',
    'Ě':'E',
    'Ȩ':'E',
    'Ḝ':'E',
    'Ê':'E',
    'Ế':'E',
    'Ệ':'E',
    'Ề':'E',
    'Ể':'E',
    'Ễ':'E',
    'Ḙ':'E',
    'Ë':'E',
    'Ė':'E',
    'Ẹ':'E',
    'Ȅ':'E',
    'È':'E',
    'Ẻ':'E',
    'Ȇ':'E',
    'Ē':'E',
    'Ḗ':'E',
    'Ḕ':'E',
    'Ę':'E',
    'Ɇ':'E',
    'Ẽ':'E',
    'Ḛ':'E',
    'Ꝫ':'ET',
    'Ḟ':'F',
    'Ƒ':'F',
    'Ǵ':'G',
    'Ğ':'G',
    'Ǧ':'G',
    'Ģ':'G',
    'Ĝ':'G',
    'Ġ':'G',
    'Ɠ':'G',
    'Ḡ':'G',
    'Ǥ':'G',
    'Ḫ':'H',
    'Ȟ':'H',
    'Ḩ':'H',
    'Ĥ':'H',
    'Ⱨ':'H',
    'Ḧ':'H',
    'Ḣ':'H',
    'Ḥ':'H',
    'Ħ':'H',
    'Í':'I',
    'Ĭ':'I',
    'Ǐ':'I',
    'Î':'I',
    'Ï':'I',
    'Ḯ':'I',
    'İ':'I',
    'Ị':'I',
    'Ȉ':'I',
    'Ì':'I',
    'Ỉ':'I',
    'Ȋ':'I',
    'Ī':'I',
    'Į':'I',
    'Ɨ':'I',
    'Ĩ':'I',
    'Ḭ':'I',
    'Ꝺ':'D',
    'Ꝼ':'F',
    'Ᵹ':'G',
    'Ꞃ':'R',
    'Ꞅ':'S',
    'Ꞇ':'T',
    'Ꝭ':'IS',
    'Ĵ':'J',
    'Ɉ':'J',
    'Ḱ':'K',
    'Ǩ':'K',
    'Ķ':'K',
    'Ⱪ':'K',
    'Ꝃ':'K',
    'Ḳ':'K',
    'Ƙ':'K',
    'Ḵ':'K',
    'Ꝁ':'K',
    'Ꝅ':'K',
    'Ĺ':'L',
    'Ƚ':'L',
    'Ľ':'L',
    'Ļ':'L',
    'Ḽ':'L',
    'Ḷ':'L',
    'Ḹ':'L',
    'Ⱡ':'L',
    'Ꝉ':'L',
    'Ḻ':'L',
    'Ŀ':'L',
    'Ɫ':'L',
    'ǈ':'L',
    'Ł':'L',
    'Ǉ':'LJ',
    'Ḿ':'M',
    'Ṁ':'M',
    'Ṃ':'M',
    'Ɱ':'M',
    'Ń':'N',
    'Ň':'N',
    'Ņ':'N',
    'Ṋ':'N',
    'Ṅ':'N',
    'Ṇ':'N',
    'Ǹ':'N',
    'Ɲ':'N',
    'Ṉ':'N',
    'Ƞ':'N',
    'ǋ':'N',
    'Ñ':'N',
    'Ǌ':'NJ',
    'Ó':'O',
    'Ŏ':'O',
    'Ǒ':'O',
    'Ô':'O',
    'Ố':'O',
    'Ộ':'O',
    'Ồ':'O',
    'Ổ':'O',
    'Ỗ':'O',
    'Ö':'O',
    'Ȫ':'O',
    'Ȯ':'O',
    'Ȱ':'O',
    'Ọ':'O',
    'Ő':'O',
    'Ȍ':'O',
    'Ò':'O',
    'Ỏ':'O',
    'Ơ':'O',
    'Ớ':'O',
    'Ợ':'O',
    'Ờ':'O',
    'Ở':'O',
    'Ỡ':'O',
    'Ȏ':'O',
    'Ꝋ':'O',
    'Ꝍ':'O',
    'Ō':'O',
    'Ṓ':'O',
    'Ṑ':'O',
    'Ɵ':'O',
    'Ǫ':'O',
    'Ǭ':'O',
    'Ø':'O',
    'Ǿ':'O',
    'Õ':'O',
    'Ṍ':'O',
    'Ṏ':'O',
    'Ȭ':'O',
    'Ƣ':'OI',
    'Ꝏ':'OO',
    'Ɛ':'E',
    'Ɔ':'O',
    'Ȣ':'OU',
    'Ṕ':'P',
    'Ṗ':'P',
    'Ꝓ':'P',
    'Ƥ':'P',
    'Ꝕ':'P',
    'Ᵽ':'P',
    'Ꝑ':'P',
    'Ꝙ':'Q',
    'Ꝗ':'Q',
    'Ŕ':'R',
    'Ř':'R',
    'Ŗ':'R',
    'Ṙ':'R',
    'Ṛ':'R',
    'Ṝ':'R',
    'Ȑ':'R',
    'Ȓ':'R',
    'Ṟ':'R',
    'Ɍ':'R',
    'Ɽ':'R',
    'Ꜿ':'C',
    'Ǝ':'E',
    'Ś':'S',
    'Ṥ':'S',
    'Š':'S',
    'Ṧ':'S',
    'Ş':'S',
    'Ŝ':'S',
    'Ș':'S',
    'Ṡ':'S',
    'Ṣ':'S',
    'Ṩ':'S',
    'ẞ':'SS',
    'Ť':'T',
    'Ţ':'T',
    'Ṱ':'T',
    'Ț':'T',
    'Ⱦ':'T',
    'Ṫ':'T',
    'Ṭ':'T',
    'Ƭ':'T',
    'Ṯ':'T',
    'Ʈ':'T',
    'Ŧ':'T',
    'Ɐ':'A',
    'Ꞁ':'L',
    'Ɯ':'M',
    'Ʌ':'V',
    'Ꜩ':'TZ',
    'Ú':'U',
    'Ŭ':'U',
    'Ǔ':'U',
    'Û':'U',
    'Ṷ':'U',
    'Ü':'U',
    'Ǘ':'U',
    'Ǚ':'U',
    'Ǜ':'U',
    'Ǖ':'U',
    'Ṳ':'U',
    'Ụ':'U',
    'Ű':'U',
    'Ȕ':'U',
    'Ù':'U',
    'Ủ':'U',
    'Ư':'U',
    'Ứ':'U',
    'Ự':'U',
    'Ừ':'U',
    'Ử':'U',
    'Ữ':'U',
    'Ȗ':'U',
    'Ū':'U',
    'Ṻ':'U',
    'Ų':'U',
    'Ů':'U',
    'Ũ':'U',
    'Ṹ':'U',
    'Ṵ':'U',
    'Ꝟ':'V',
    'Ṿ':'V',
    'Ʋ':'V',
    'Ṽ':'V',
    'Ꝡ':'VY',
    'Ẃ':'W',
    'Ŵ':'W',
    'Ẅ':'W',
    'Ẇ':'W',
    'Ẉ':'W',
    'Ẁ':'W',
    'Ⱳ':'W',
    'Ẍ':'X',
    'Ẋ':'X',
    'Ý':'Y',
    'Ŷ':'Y',
    'Ÿ':'Y',
    'Ẏ':'Y',
    'Ỵ':'Y',
    'Ỳ':'Y',
    'Ƴ':'Y',
    'Ỷ':'Y',
    'Ỿ':'Y',
    'Ȳ':'Y',
    'Ɏ':'Y',
    'Ỹ':'Y',
    'Ź':'Z',
    'Ž':'Z',
    'Ẑ':'Z',
    'Ⱬ':'Z',
    'Ż':'Z',
    'Ẓ':'Z',
    'Ȥ':'Z',
    'Ẕ':'Z',
    'Ƶ':'Z',
    'Ĳ':'IJ',
    'Œ':'OE',
    'ᴀ':'A',
    'ᴁ':'AE',
    'ʙ':'B',
    'ᴃ':'B',
    'ᴄ':'C',
    'ᴅ':'D',
    'ᴇ':'E',
    'ꜰ':'F',
    'ɢ':'G',
    'ʛ':'G',
    'ʜ':'H',
    'ɪ':'I',
    'ʁ':'R',
    'ᴊ':'J',
    'ᴋ':'K',
    'ʟ':'L',
    'ᴌ':'L',
    'ᴍ':'M',
    'ɴ':'N',
    'ᴏ':'O',
    'ɶ':'OE',
    'ᴐ':'O',
    'ᴕ':'OU',
    'ᴘ':'P',
    'ʀ':'R',
    'ᴎ':'N',
    'ᴙ':'R',
    'ꜱ':'S',
    'ᴛ':'T',
    'ⱻ':'E',
    'ᴚ':'R',
    'ᴜ':'U',
    'ᴠ':'V',
    'ᴡ':'W',
    'ʏ':'Y',
    'ᴢ':'Z',
    'á':'a',
    'ă':'a',
    'ắ':'a',
    'ặ':'a',
    'ằ':'a',
    'ẳ':'a',
    'ẵ':'a',
    'ǎ':'a',
    'â':'a',
    'ấ':'a',
    'ậ':'a',
    'ầ':'a',
    'ẩ':'a',
    'ẫ':'a',
    'ä':'a',
    'ǟ':'a',
    'ȧ':'a',
    'ǡ':'a',
    'ạ':'a',
    'ȁ':'a',
    'à':'a',
    'ả':'a',
    'ȃ':'a',
    'ā':'a',
    'ą':'a',
    'ᶏ':'a',
    'ẚ':'a',
    'å':'a',
    'ǻ':'a',
    'ḁ':'a',
    'ⱥ':'a',
    'ã':'a',
    'ꜳ':'aa',
    'æ':'ae',
    'ǽ':'ae',
    'ǣ':'ae',
    'ꜵ':'ao',
    'ꜷ':'au',
    'ꜹ':'av',
    'ꜻ':'av',
    'ꜽ':'ay',
    'ḃ':'b',
    'ḅ':'b',
    'ɓ':'b',
    'ḇ':'b',
    'ᵬ':'b',
    'ᶀ':'b',
    'ƀ':'b',
    'ƃ':'b',
    'ɵ':'o',
    'ć':'c',
    'č':'c',
    'ç':'c',
    'ḉ':'c',
    'ĉ':'c',
    'ɕ':'c',
    'ċ':'c',
    'ƈ':'c',
    'ȼ':'c',
    'ď':'d',
    'ḑ':'d',
    'ḓ':'d',
    'ȡ':'d',
    'ḋ':'d',
    'ḍ':'d',
    'ɗ':'d',
    'ᶑ':'d',
    'ḏ':'d',
    'ᵭ':'d',
    'ᶁ':'d',
    'đ':'d',
    'ɖ':'d',
    'ƌ':'d',
    'ı':'i',
    'ȷ':'j',
    'ɟ':'j',
    'ʄ':'j',
    'ǳ':'dz',
    'ǆ':'dz',
    'é':'e',
    'ĕ':'e',
    'ě':'e',
    'ȩ':'e',
    'ḝ':'e',
    'ê':'e',
    'ế':'e',
    'ệ':'e',
    'ề':'e',
    'ể':'e',
    'ễ':'e',
    'ḙ':'e',
    'ë':'e',
    'ė':'e',
    'ẹ':'e',
    'ȅ':'e',
    'è':'e',
    'ẻ':'e',
    'ȇ':'e',
    'ē':'e',
    'ḗ':'e',
    'ḕ':'e',
    'ⱸ':'e',
    'ę':'e',
    'ᶒ':'e',
    'ɇ':'e',
    'ẽ':'e',
    'ḛ':'e',
    'ꝫ':'et',
    'ḟ':'f',
    'ƒ':'f',
    'ᵮ':'f',
    'ᶂ':'f',
    'ǵ':'g',
    'ğ':'g',
    'ǧ':'g',
    'ģ':'g',
    'ĝ':'g',
    'ġ':'g',
    'ɠ':'g',
    'ḡ':'g',
    'ᶃ':'g',
    'ǥ':'g',
    'ḫ':'h',
    'ȟ':'h',
    'ḩ':'h',
    'ĥ':'h',
    'ⱨ':'h',
    'ḧ':'h',
    'ḣ':'h',
    'ḥ':'h',
    'ɦ':'h',
    'ẖ':'h',
    'ħ':'h',
    'ƕ':'hv',
    'í':'i',
    'ĭ':'i',
    'ǐ':'i',
    'î':'i',
    'ï':'i',
    'ḯ':'i',
    'ị':'i',
    'ȉ':'i',
    'ì':'i',
    'ỉ':'i',
    'ȋ':'i',
    'ī':'i',
    'į':'i',
    'ᶖ':'i',
    'ɨ':'i',
    'ĩ':'i',
    'ḭ':'i',
    'ꝺ':'d',
    'ꝼ':'f',
    'ᵹ':'g',
    'ꞃ':'r',
    'ꞅ':'s',
    'ꞇ':'t',
    'ꝭ':'is',
    'ǰ':'j',
    'ĵ':'j',
    'ʝ':'j',
    'ɉ':'j',
    'ḱ':'k',
    'ǩ':'k',
    'ķ':'k',
    'ⱪ':'k',
    'ꝃ':'k',
    'ḳ':'k',
    'ƙ':'k',
    'ḵ':'k',
    'ᶄ':'k',
    'ꝁ':'k',
    'ꝅ':'k',
    'ĺ':'l',
    'ƚ':'l',
    'ɬ':'l',
    'ľ':'l',
    'ļ':'l',
    'ḽ':'l',
    'ȴ':'l',
    'ḷ':'l',
    'ḹ':'l',
    'ⱡ':'l',
    'ꝉ':'l',
    'ḻ':'l',
    'ŀ':'l',
    'ɫ':'l',
    'ᶅ':'l',
    'ɭ':'l',
    'ł':'l',
    'ǉ':'lj',
    'ſ':'s',
    'ẜ':'s',
    'ẛ':'s',
    'ẝ':'s',
    'ḿ':'m',
    'ṁ':'m',
    'ṃ':'m',
    'ɱ':'m',
    'ᵯ':'m',
    'ᶆ':'m',
    'ń':'n',
    'ň':'n',
    'ņ':'n',
    'ṋ':'n',
    'ȵ':'n',
    'ṅ':'n',
    'ṇ':'n',
    'ǹ':'n',
    'ɲ':'n',
    'ṉ':'n',
    'ƞ':'n',
    'ᵰ':'n',
    'ᶇ':'n',
    'ɳ':'n',
    'ñ':'n',
    'ǌ':'nj',
    'ó':'o',
    'ŏ':'o',
    'ǒ':'o',
    'ô':'o',
    'ố':'o',
    'ộ':'o',
    'ồ':'o',
    'ổ':'o',
    'ỗ':'o',
    'ö':'o',
    'ȫ':'o',
    'ȯ':'o',
    'ȱ':'o',
    'ọ':'o',
    'ő':'o',
    'ȍ':'o',
    'ò':'o',
    'ỏ':'o',
    'ơ':'o',
    'ớ':'o',
    'ợ':'o',
    'ờ':'o',
    'ở':'o',
    'ỡ':'o',
    'ȏ':'o',
    'ꝋ':'o',
    'ꝍ':'o',
    'ⱺ':'o',
    'ō':'o',
    'ṓ':'o',
    'ṑ':'o',
    'ǫ':'o',
    'ǭ':'o',
    'ø':'o',
    'ǿ':'o',
    'õ':'o',
    'ṍ':'o',
    'ṏ':'o',
    'ȭ':'o',
    'ƣ':'oi',
    'ꝏ':'oo',
    'ɛ':'e',
    'ᶓ':'e',
    'ɔ':'o',
    'ᶗ':'o',
    'ȣ':'ou',
    'ṕ':'p',
    'ṗ':'p',
    'ꝓ':'p',
    'ƥ':'p',
    'ᵱ':'p',
    'ᶈ':'p',
    'ꝕ':'p',
    'ᵽ':'p',
    'ꝑ':'p',
    'ꝙ':'q',
    'ʠ':'q',
    'ɋ':'q',
    'ꝗ':'q',
    'ŕ':'r',
    'ř':'r',
    'ŗ':'r',
    'ṙ':'r',
    'ṛ':'r',
    'ṝ':'r',
    'ȑ':'r',
    'ɾ':'r',
    'ᵳ':'r',
    'ȓ':'r',
    'ṟ':'r',
    'ɼ':'r',
    'ᵲ':'r',
    'ᶉ':'r',
    'ɍ':'r',
    'ɽ':'r',
    'ↄ':'c',
    'ꜿ':'c',
    'ɘ':'e',
    'ɿ':'r',
    'ś':'s',
    'ṥ':'s',
    'š':'s',
    'ṧ':'s',
    'ş':'s',
    'ŝ':'s',
    'ș':'s',
    'ṡ':'s',
    'ṣ':'s',
    'ṩ':'s',
    'ʂ':'s',
    'ᵴ':'s',
    'ᶊ':'s',
    'ȿ':'s',
    'ɡ':'g',
    'ß':'ss',
    'ᴑ':'o',
    'ᴓ':'o',
    'ᴝ':'u',
    'ť':'t',
    'ţ':'t',
    'ṱ':'t',
    'ț':'t',
    'ȶ':'t',
    'ẗ':'t',
    'ⱦ':'t',
    'ṫ':'t',
    'ṭ':'t',
    'ƭ':'t',
    'ṯ':'t',
    'ᵵ':'t',
    'ƫ':'t',
    'ʈ':'t',
    'ŧ':'t',
    'ᵺ':'th',
    'ɐ':'a',
    'ᴂ':'ae',
    'ǝ':'e',
    'ᵷ':'g',
    'ɥ':'h',
    'ʮ':'h',
    'ʯ':'h',
    'ᴉ':'i',
    'ʞ':'k',
    'ꞁ':'l',
    'ɯ':'m',
    'ɰ':'m',
    'ᴔ':'oe',
    'ɹ':'r',
    'ɻ':'r',
    'ɺ':'r',
    'ⱹ':'r',
    'ʇ':'t',
    'ʌ':'v',
    'ʍ':'w',
    'ʎ':'y',
    'ꜩ':'tz',
    'ú':'u',
    'ŭ':'u',
    'ǔ':'u',
    'û':'u',
    'ṷ':'u',
    'ü':'u',
    'ǘ':'u',
    'ǚ':'u',
    'ǜ':'u',
    'ǖ':'u',
    'ṳ':'u',
    'ụ':'u',
    'ű':'u',
    'ȕ':'u',
    'ù':'u',
    'ủ':'u',
    'ư':'u',
    'ứ':'u',
    'ự':'u',
    'ừ':'u',
    'ử':'u',
    'ữ':'u',
    'ȗ':'u',
    'ū':'u',
    'ṻ':'u',
    'ų':'u',
    'ᶙ':'u',
    'ů':'u',
    'ũ':'u',
    'ṹ':'u',
    'ṵ':'u',
    'ᵫ':'ue',
    'ꝸ':'um',
    'ⱴ':'v',
    'ꝟ':'v',
    'ṿ':'v',
    'ʋ':'v',
    'ᶌ':'v',
    'ⱱ':'v',
    'ṽ':'v',
    'ꝡ':'vy',
    'ẃ':'w',
    'ŵ':'w',
    'ẅ':'w',
    'ẇ':'w',
    'ẉ':'w',
    'ẁ':'w',
    'ⱳ':'w',
    'ẘ':'w',
    'ẍ':'x',
    'ẋ':'x',
    'ᶍ':'x',
    'ý':'y',
    'ŷ':'y',
    'ÿ':'y',
    'ẏ':'y',
    'ỵ':'y',
    'ỳ':'y',
    'ƴ':'y',
    'ỷ':'y',
    'ỿ':'y',
    'ȳ':'y',
    'ẙ':'y',
    'ɏ':'y',
    'ỹ':'y',
    'ź':'z',
    'ž':'z',
    'ẑ':'z',
    'ʑ':'z',
    'ⱬ':'z',
    'ż':'z',
    'ẓ':'z',
    'ȥ':'z',
    'ẕ':'z',
    'ᵶ':'z',
    'ᶎ':'z',
    'ʐ':'z',
    'ƶ':'z',
    'ɀ':'z',
    'ﬀ':'ff',
    'ﬃ':'ffi',
    'ﬄ':'ffl',
    'ﬁ':'fi',
    'ﬂ':'fl',
    'ĳ':'ij',
    'œ':'oe',
    'ﬆ':'st',
    'ₐ':'a',
    'ₑ':'e',
    'ᵢ':'i',
    'ⱼ':'j',
    'ₒ':'o',
    'ᵣ':'r',
    'ᵤ':'u',
    'ᵥ':'v',
    'ₓ':'x'
  };

  return dasherize(str).replace(/[^A-Za-z0-9\s]/g, function (x) { return map[x] || x; });
}

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".fb-3elcw { position: relative; overflow: hidden; } .fb-3elcw [type=file] { position: absolute; top: 0; right: 0; font-size: 15rem; opacity: 0; cursor: pointer; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

































var UploadButton = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.container},[_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("attach_file")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.CHOOSE))])]),_c('input',{ref:"input",attrs:{"type":"file","accept":"image/*","multiple":"","name":"testsss","disabled":_vm.isSaving},on:{"change":_vm.filesChange}})],1)},staticRenderFns: [],cssModules: {"container":"fb-3elcw"},
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

      console.log('filesChange', evt.target.files);
      const files = evt.target.files;

      this.$store.commit('upload/selected');

      Object.keys(files).forEach(function (key) {
        const reader = new FileReader();
        reader.onload = function (e) {
          this$1.$store.commit('upload/preview', {
            name: safeFilename(files[key].name),
            image: e.target.result
          });
        };
        reader.readAsDataURL(files[key]);
      });
    },
    attach: function attach() {
      console.log(this.$refs.input);
      // this.$refs.input.focus();
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

























var Modal = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('aside',{staticClass:"mdc-dialog",attrs:{"role":"alertdialog","aria-labelledby":"mdc-dialog-with-list-label","aria-describedby":"mdc-dialog-with-list-description"}},[_c('div',{staticClass:"mdc-dialog__surface"},[_c('header',{staticClass:"mdc-dialog__header"},[_c('h2',{staticClass:"mdc-dialog__header__title",attrs:{"id":"mdc-dialog-with-list-label"}},[_vm._v(_vm._s(_vm.title))])]),_c('section',{staticClass:"mdc-dialog__body mdc-dialog__body--scrollable",attrs:{"id":"mdc-dialog-with-list-description"}},[_vm._t("body")],2),_c('footer',{staticClass:"fb-dialog-footer mdc-dialog__footer"},[_vm._t("footer")],2)]),_c('div',{staticClass:"mdc-dialog__backdrop"})])},staticRenderFns: [],
  name: 'Modal',
  props: {
    title: String,
    active: { type: Boolean, default: false }
  },
  watch: {
    active: function (val) {
      if (val) {
        this.$emit('open');
        this.dialog.show();
      } else {
        this.$emit('close');
        this.dialog.close();
      }
    }
  },
  data: function data() { return { dialog: null }},
  mounted: function mounted() {
    var this$1 = this;

    this.dialog = new _material_dialog.MDCDialog(this.$el);
    this.dialog.listen('MDCDialog:cancel', function () { return this$1.$emit('close'); });
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();





















var InputText = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fl-input-container"},[_c('div',{ref:"textfield",staticClass:"mdc-textfield"},[_c('input',{staticClass:"mdc-textfield__input",class:_vm.inputClasses,attrs:{"type":_vm.type,"id":_vm.id,"disabled":_vm.disabled,"required":_vm.required,"minlength":_vm.minlength,"maxlength":_vm.maxlength},domProps:{"value":_vm.inputValue},on:{"blur":function($event){_vm.$emit('blur');},"input":_vm.onInput}}),_c('label',{staticClass:"mdc-textfield__label",attrs:{"for":_vm.id}},[_vm._v(_vm._s(_vm.label))])]),_c('p',{class:_vm.errMsgClasses,domProps:{"innerHTML":_vm._s(_vm.errorMsg)}})])},staticRenderFns: [],
  name: 'InputText',
  props: {
    type: { type: String, default: 'text' },
    id: { type: String, default: ("i-" + (guid())) },
    value: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    minlength: Number,
    maxlength: Number,
    label: String,
    errorMsg: String,
    hasError: { type: Boolean, default: false }
  },
  data: function data() {
    return { hasValue: false, inputValue: this.value };
  },
  computed: {
    inputClasses: function () {
      return {
        'fb-input': true,
        'fb-valid': this.hasValue && !this.hasError,
        'fb-invalid': this.hasError
      };
    },
    errMsgClasses: function () {
      // console.log('errMsgClasses', this.hasError);
      return {
        'fb-error-msg': true,
        'mdc-textfield-helptext': true,
        'mdc-textfield-helptext--validation-msg': true,
        'mdc-textfield-helptext--persistent': this.hasError
      };
    }
  },
  mounted: function mounted() {
    new _material_textfield.MDCTextfield(this.$refs.textfield);
  },
  methods: {
    onInput: function onInput(evt) {
      this.hasValue = Boolean(evt.target.value);
      this.inputValue = evt.target.value;
      this.$emit('input', evt.target.value);
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();




























var Folder = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{attrs:{"active":_vm.modalActive,"title":_vm.text.FOLDER.NEW},on:{"open":_vm.onOpenModal,"close":_vm.closeModal}},[_c('div',{slot:"body"},[_c('h5',[_vm._v(_vm._s(_vm.text.FOLDER.CREATION))]),_c('p',{staticClass:"fb-folder-path",domProps:{"innerHTML":_vm._s(_vm.hierarchy)}}),_c('input-text',{attrs:{"label":_vm.text.FOLDER.NEW,"required":true,"minlength":1,"maxlength":20,"hasError":_vm.creatingHasError,"errorMsg":_vm.creatingError},on:{"input":_vm.onInputNew}})],1),_c('div',{slot:"footer"},[_c('my-button',{attrs:{"classes":"is-dark","type":"submit"},nativeOn:{"click":function($event){_vm.onSubmit($event);}}},[_vm._v("Submit")]),_c('my-button',{nativeOn:{"click":function($event){_vm.closeModal($event);}}},[_vm._v("Cancel")])],1)])},staticRenderFns: [],
  name: 'Folder',
  props: ['openFolder'],
  components: { MyButton: MyButton, Modal: Modal, InputText: InputText },
  computed: {
    hierarchy: function () {
      return this.$store.state.tree.hierarchy.map(function (each) {
        return ("<span>" + each + "</span>");
      }).join('→');
    }
  },
  data: function data() {
    return {
      text: this.$store.state.text,
      modalActive: false,
      creatingHasError: false,
      creatingError: '',
      creatingName: ''
    };
  },
  watch: {
    openFolder: function (val, oldVal) {
      if (val) { this.modalActive = true; }
    }
  },
  methods: {
    onInputNew: function onInputNew(value) {
      this.creatingName = value;

      if (!value) {
        this.creatingHasError = true;
        this.creatingError = this.text.REQUIRED;
      } else {
        this.creatingHasError = !/^[a-zA-Z0-9\-_]{1,20}$/.test(value);
        this.creatingError = this.text.FOLDER.VALIDATION;
      }
      console.log('onInputNew', value, this.creatingHasError);
    },
    onOpenModal: function onOpenModal() {
      this.creatingName = '';
    },
    closeModal: function closeModal() {
      this.modalActive = false;
      this.$emit('closeModal');
    },
    onSubmit: function onSubmit() {
      var this$1 = this;

      console.log('onSubmit', this.creatingName);
      this.$store.dispatch('folder/create', this.creatingName).then(function (res) {
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

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();



























var File = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{attrs:{"active":_vm.modalActive,"title":_vm.text.FILE.DEL},on:{"open":_vm.onOpenModal,"close":_vm.closeModal}},[_c('div',{slot:"body"},[_c('h5',[_vm._v(_vm._s(_vm.text.FILE.DEL))]),_c('p',{staticClass:"fb-folder-path",domProps:{"innerHTML":_vm._s(_vm.hierarchy)}}),_c('ul',_vm._l((_vm.$store.state.file.selected),function(idx){return _c('li',{key:idx},[_vm._v(_vm._s(_vm.$store.state.tree.selected.files[idx].name))])}))]),_c('div',{slot:"footer"},[_c('my-button',{attrs:{"classes":"is-dark","type":"submit"},nativeOn:{"click":function($event){_vm.onSubmit($event);}}},[_vm._v(_vm._s(_vm.text.BUTTON.CONFIRM))]),_c('my-button',{nativeOn:{"click":function($event){_vm.closeModal($event);}}},[_vm._v(_vm._s(_vm.text.BUTTON.CANCEL))])],1)])},staticRenderFns: [],
  name: 'Folder',
  props: ['openFile'],
  components: { MyButton: MyButton, Modal: Modal },
  computed: {
    hierarchy: function () {
      return this.$store.state.tree.hierarchy.map(function (each) {
        return ("<span>" + each + "</span>");
      }).join('→');
    }
  },
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
    onOpenModal: function onOpenModal() {
    },
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

const ROOT_ID = 'root';

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
      '<p class="folder-path">This folder <span>%1</span>',
      ' will be removed with all its contents: </p>',
      '<p>Total Files: <span class="destaque">%2</span>',
      ' &mdash; Total Subfolders: <span class="destaque">%3</span></p>'
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
    CREATE: '/files',
    REMOVE: '/files'
  },
  FOLDER: {
    CREATE: '/folder',
    EDIT: '/folder/:id',
    REMOVE: '/folder/:id'
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=" /*# sourceMappingURL=index.vue.map */"; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();




















































var AppHeader = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('header',{staticClass:"fb-header"},[_c('div',{staticClass:"fb-header-title"},[_c('span',[_vm._v(_vm._s(_vm.text.TITLE))]),_vm._v(" "),_c('span',{staticClass:"close"})]),_c('div',{class:_vm.messageClasses},[_vm._v(_vm._s(_vm.$store.state.message.message))]),_c('div',{staticClass:"fb-toolbar"},[_c('div',{staticClass:"fb-toolbar-items"},[_c('upload-button'),_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("send")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.SEND))])]),_c('my-button',{nativeOn:{"click":function($event){_vm.openFolder = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("create_new_folder")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.NEW_FOLDER))])]),(_vm.$store.state.tree.selected.id !== _vm.rootFolder)?_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.DELETE_FOLDER))])]):_vm._e(),(_vm.$store.state.file.selected.length)?_c('my-button',{nativeOn:{"click":function($event){_vm.openFile = true;}}},[_c('i',{staticClass:"material-icons"},[_vm._v("delete_forever")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.DELETE_FILE)+" ("+_vm._s(_vm.$store.state.file.selected.length)+")")])]):_vm._e(),(_vm.$store.state.file.selected.length)?_c('my-button',[_c('i',{staticClass:"material-icons"},[_vm._v("publish")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.text.BUTTON.SEND_EDITOR))])]):_vm._e()],1)]),_c('folder',{attrs:{"open-folder":_vm.openFolder},on:{"closeModal":function($event){_vm.openFolder = false;}}}),_c('file',{attrs:{"open-file":_vm.openFile},on:{"closeModal":function($event){_vm.openFile = false;}}})],1)},staticRenderFns: [],
  name: 'Header',
  components: { MyButton: MyButton, UploadButton: UploadButton, Folder: Folder, File: File },
  computed: {
    $style: function () {
      return this.$options.cssModules;
    },
    messageClasses: function () {
      return {
        'fb-message': true,
        'fb-show': this.$store.state.message.show,
        'fb-alert': this.$store.state.message.class === 'alert',
        'fb-success': this.$store.state.message.class === 'success'
      };
    }
  },
  data: function data() {
    return {
      openFolder: false,
      openFile: false,
      rootFolder: ROOT_ID,
      text: this.$store.state.text
    };
  },
  methods: {
    removeFile: function removeFile() {
      this.$store.dispatch('file/remove');
    }
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();


















var Folder$1 = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{class:_vm.classObj,style:(_vm.folderStyle)},[_c('a',{staticClass:"fb-tree-folder-link",on:{"click":_vm.select}},[_c('i',{staticClass:"material-icons"},[_vm._v("folder")]),_vm._v(" "),_c('span',[_vm._v(_vm._s(_vm.tree.name))])]),(Object.keys(_vm.tree.folders))?_c('ol',_vm._l((_vm.tree.folders),function(folder,key){return _c('folder',{key:key,attrs:{"id":key,"tree":folder}})})):_vm._e()])},staticRenderFns: [],
  name: 'Folder',
  props: {
    tree: Object,
    id: String,
    collapsed: { type: Boolean, default: true }
  },
  computed: {
    classObj: function () {
      return {
        'fb-tree-folder': true,
        'fb-tree-root-folder': this.isRoot,
        'fb-tree-folder-collapsed': this.open,
        'fb-tree-folder-active': this.id === this.$store.state.tree.selected.id
      };
    }
  },
  data: function data() {
    return {
      isRoot: this.id === ROOT_ID,
      open: this.collapsed,
      folderStyle: {
        height: (Object.keys(this.tree.folders).length + 1) * 28 + 'px'
      }
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










var Tree = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ol',[(_vm.$store.state.tree.ready)?_c('folder',{attrs:{"id":_vm.root,"collapsed":false,"tree":_vm.$store.state.tree.tree}}):_vm._e()],1)},staticRenderFns: [],
  name: 'Tree',
  components: { Folder: Folder$1 },
  data: function data() {
    return {
      text: this.$store.state.text,
      root: ROOT_ID
    };
  }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();



















var Thumb = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-thumb"},_vm._l((_vm.$store.state.tree.selected.files),function(file,key){return _c('figure',{staticClass:"fb-thumb-figure",class:{ 'fb-selected': _vm.isSelected(key) },on:{"click":function($event){_vm.toggleSelect(key);}}},[_c('i',{directives:[{name:"show",rawName:"v-show",value:(_vm.isSelected(key)),expression:"isSelected(key)"}],staticClass:"material-icons fb-thumb-checked"},[_vm._v("check_box")]),_vm._v(" "),_c('img',{attrs:{"src":file.path + '/' + file.name}}),_c('figcaption',{staticClass:"fb-thumb-info"},[_c('h5',[_vm._v(_vm._s(file.name))]),_c('h5',[_vm._v(_vm._s(_vm.fileSize(file.size)))])])])}))},staticRenderFns: [],
  name: 'Thumb',
  computed: {},
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
















var Upload = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-upload-preview"},_vm._l((_vm.$store.state.upload.previews),function(file,key){return _c('figure',{staticClass:"fb-upload-preview-figure"},[_c('img',{attrs:{"src":file.image}}),_c('figcaption',{staticClass:"fb-upload-preview-info"},[_c('h5',[_vm._v(_vm._s(file.name))])]),_vm._m(0,true)])}))},staticRenderFns: [function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-upload-preview-progress"},[_c('div',{staticClass:"fb-upload-preview-progress-bar"})])}],
  name: 'Upload'
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();












var AppBody = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fb-body"},[_c('div',{staticClass:"fb-tree-container"},[_c('tree')],1),_c('div',{staticClass:"fb-thumb-container"},[(_vm.$store.state.upload.pending)?_c('upload'):_c('thumb')],1)])},staticRenderFns: [],
  name: 'Body',
  components: { MyButton: MyButton, Tree: Tree, Thumb: Thumb, Upload: Upload }
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();






var AppFooter = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('footer',{staticClass:"fb-footer"})},staticRenderFns: [],
  name: 'Footer'
};

(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();










var App = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"filebrowser-container"}},[_c('div',{staticClass:"filebrowser-wrapper"},[_c('app-header'),_c('app-body'),_c('app-footer')],1)])},staticRenderFns: [],
  name: 'App',
  components: { AppHeader: AppHeader, AppBody: AppBody, AppFooter: AppFooter }
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

var request = function (url, options) {
  if ( options === void 0 ) options = {};

  const config = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  options = Object.assign(config, options);

  if (options.body) { options.body = JSON.stringify(options.body); }

  console.log('fetch', options);
  return fetch(url, options)
    .then(handleResponse, handleNetworkError);
};

function handleResponse(response) {
  return response.ok
    ? response.json()
    : response.json().then(function (err) { throw err });
}

function handleNetworkError(error) {
  throw { message: error.message };
}

var folder = {
  namespaced: true,
  state: { selected: '/' },
  actions: {
    create: function create(ref, name) {
      var commit = ref.commit;
      var state = ref.state;
      var dispatch = ref.dispatch;

      const path = state.selected + name;
      const config = { method: 'POST', body: { path: path }};
      console.log('store folder/create', path);

      return new Promise(function (resolve, reject) {
        request(ROUTES.FOLDER.CREATE, config).then(function (res) {
          console.log('store folder/create res', res);
          commit('tree/update', res.tree, { root: true });
          resolve(res.message);
        }).catch(function (res) { return reject(res.message); });
      });
    }
  },
  mutations: {}
};

var tree = {
  namespaced: true,
  state: {
    ready: false,
    hierarchy: [],
    selected: { id: '', parents: [], files: [] },
    tree: { name: '', files: [], folders: [] }
  },
  actions: {
    get: function get(ref) {
      var dispatch = ref.dispatch;
      var rootState = ref.rootState;

      request(rootState.options.server + ROUTES.FILES.ALL)
        .then(function (tree) { return dispatch('load', tree); })
        .catch(console.error);
    },
    load: function load(ref, tree) {
      var commit = ref.commit;
      var dispatch = ref.dispatch;
      var state = ref.state;
      var rootState = ref.rootState;

      tree.name = rootState.text.ROOT_FOLDER;
      console.log('load', tree);
      commit('update', tree);

      if (!state.selected.id) {
        dispatch('select', { id: ROOT_ID });
      }
    },
    select: function select(ref, ref$1) {
      var commit = ref.commit;
      var state = ref.state;
      var id = ref$1.id;
      var parents = ref$1.parents; if ( parents === void 0 ) parents = [];

      let files;
      let hierarchy = [];

      if (id === ROOT_ID) {
        files = state.tree.files;
        hierarchy = [state.tree.name];
      } else if (parents.length === 0) {
        files = state.tree.folders[id].files;
        hierarchy = [state.tree.name, state.tree.folders[id].name];
      } else {
        hierarchy = [state.tree.name];

        files = parents.reduce(function (acc, curr, idx) {
          hierarchy.push(acc[curr].name);

          if (idx === parents.length - 1) {
            hierarchy.push(acc[curr].folders[id].name);
            acc = acc[curr].folders[id].files;
          } else {
            acc = acc[curr].folders;
          }

          return acc;
        }, state.tree.folders);
      }

      commit('select', { id: id, parents: parents, files: files, hierarchy: hierarchy });
      commit('file/removeSelected', null, { root: true });
    }
  },
  mutations: {
    update: function update(state, tree) {
      console.log('tree/update mutations', tree);
      state.tree = tree;
      state.ready = true;
    },
    select: function select(state, ref) {
      var id = ref.id;
      var parents = ref.parents;
      var files = ref.files;
      var hierarchy = ref.hierarchy;

      state.hierarchy = hierarchy;
      state.selected = { id: id, parents: parents, files: files };
      // console.log('select', hierarchy);
      // console.log('mutations tree select', state.selected);
    },
    removeSelectedFiles: function removeSelectedFiles(state, files) {
      state.selected.files =
        state.selected.files.filter(function (f, i) { return !files.includes(i); });
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
      var commit = ref.commit;
      var dispatch = ref.dispatch;

      console.log('remove', rootState.tree, rootState.tree.selected);

      const files = state.selected.map(function (k) {
        return rootState.tree.selected.files[k].name;
      });

      const hierarchy =
        rootState.tree.hierarchy.slice(1, rootState.tree.hierarchy.length);
      const folder = hierarchy.join('/');

      const config = { method: 'PATCH', body: { files: files, folder: folder }};
      console.log('store file/remove', files);

      return new Promise(function (resolve, reject) {
        request(ROUTES.FILES.REMOVE, config).then(function (res) {
          console.log('store folder/create res', res);

          dispatch('reset', null, { root: true });
          dispatch('tree/load', res.tree, { root: true });

          resolve(res.message);
        }).catch(function (res) { return reject(res.message); });
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
    previews: []
  },
  mutations: {
    selected: function selected(state) {
      state.pending = true;
    },
    preview: function preview(state, obj) {
      console.log('mutations preview', obj);
      if (state.pending) {
        state.previews.push(obj);
      }
    }
  }
};

var message = {
  namespaced: true,
  state: { show: false, class: '', message: '' },
  actions: {
    show: function show(ref, ref$1) {
      var commit = ref.commit;
      var state = ref.state;
      var rootState = ref.rootState;
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

var store = new Vuex.Store({
  modules: { folder: folder, tree: tree, file: file, message: message, upload: upload },
  state: {
    text: {},
    options: OPTIONS
  },
  actions: {
    reset: function reset(ref) {
      var state = ref.state;
      var commit = ref.commit;

      // console.log('reset', state.tree.selected.files[state.file.selected]);
      commit('tree/removeSelectedFiles', state.file.selected);
      commit('file/removeSelected');
    }
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

const app = new Vue({
  store: store,
  render: function (h) { return h(App); }
});

var FileBrowser = function FileBrowser(el, options) {
  if ( options === void 0 ) options = {};

  store.commit('mergeOptions', options);
  store.dispatch('tree/get');
  app.$mount(el);
};

return FileBrowser;

}(Vue,mdc.ripple,mdc.dialog,mdc.textfield,Vuex));
