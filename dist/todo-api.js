// @bun
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __toCommonJS = (from) => {
  const moduleCache = __toCommonJS.moduleCache ??= new WeakMap;
  var cached = moduleCache.get(from);
  if (cached)
    return cached;
  var to = __defProp({}, "__esModule", { value: true });
  var desc = { enumerable: false };
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  moduleCache.set(from, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = (id) => {
  return import.meta.require(id);
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/pg/node_modules/pg-types/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS((exports) => {
  var identity = function(value) {
    return value;
  };
  exports.parse = function(source, transform) {
    return new ArrayParser(source, transform).parse();
  };

  class ArrayParser {
    constructor(source, transform) {
      this.source = source;
      this.transform = transform || identity;
      this.position = 0;
      this.entries = [];
      this.recorded = [];
      this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var character = this.source[this.position++];
      if (character === "\\") {
        return {
          value: this.source[this.position++],
          escaped: true
        };
      }
      return {
        value: character,
        escaped: false
      };
    }
    record(character) {
      this.recorded.push(character);
    }
    newEntry(includeEmpty) {
      var entry;
      if (this.recorded.length > 0 || includeEmpty) {
        entry = this.recorded.join("");
        if (entry === "NULL" && !includeEmpty) {
          entry = null;
        }
        if (entry !== null)
          entry = this.transform(entry);
        this.entries.push(entry);
        this.recorded = [];
      }
    }
    consumeDimensions() {
      if (this.source[0] === "[") {
        while (!this.isEof()) {
          var char = this.nextCharacter();
          if (char.value === "=")
            break;
        }
      }
    }
    parse(nested) {
      var character, parser, quote;
      this.consumeDimensions();
      while (!this.isEof()) {
        character = this.nextCharacter();
        if (character.value === "{" && !quote) {
          this.dimension++;
          if (this.dimension > 1) {
            parser = new ArrayParser(this.source.substr(this.position - 1), this.transform);
            this.entries.push(parser.parse(true));
            this.position += parser.position - 2;
          }
        } else if (character.value === "}" && !quote) {
          this.dimension--;
          if (!this.dimension) {
            this.newEntry();
            if (nested)
              return this.entries;
          }
        } else if (character.value === '"' && !character.escaped) {
          if (quote)
            this.newEntry(true);
          quote = !quote;
        } else if (character.value === "," && !quote) {
          this.newEntry();
        } else {
          this.record(character.value);
        }
      }
      if (this.dimension !== 0) {
        throw new Error("array dimension not balanced");
      }
      return this.entries;
    }
  }
});

// node_modules/pg/node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS((exports, module) => {
  var array = require_postgres_array();
  module.exports = {
    create: function(source, transform) {
      return {
        parse: function() {
          return array.parse(source, transform);
        }
      };
    }
  };
});

// node_modules/pg/node_modules/pg-types/node_modules/postgres-date/index.js
var require_postgres_date = __commonJS((exports, module) => {
  var getDate = function(isoDate) {
    var matches = DATE.exec(isoDate);
    if (!matches) {
      return;
    }
    var year = parseInt(matches[1], 10);
    var isBC = !!matches[4];
    if (isBC) {
      year = bcYearToNegativeYear(year);
    }
    var month = parseInt(matches[2], 10) - 1;
    var day = matches[3];
    var date = new Date(year, month, day);
    if (is0To99(year)) {
      date.setFullYear(year);
    }
    return date;
  };
  var timeZoneOffset = function(isoDate) {
    if (isoDate.endsWith("+00")) {
      return 0;
    }
    var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
    if (!zone)
      return;
    var type = zone[1];
    if (type === "Z") {
      return 0;
    }
    var sign = type === "-" ? -1 : 1;
    var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
    return offset * sign * 1000;
  };
  var bcYearToNegativeYear = function(year) {
    return -(year - 1);
  };
  var is0To99 = function(num) {
    return num >= 0 && num < 100;
  };
  var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
  var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
  var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
  var INFINITY = /^-?infinity$/;
  module.exports = function parseDate(isoDate) {
    if (INFINITY.test(isoDate)) {
      return Number(isoDate.replace("i", "I"));
    }
    var matches = DATE_TIME.exec(isoDate);
    if (!matches) {
      return getDate(isoDate) || null;
    }
    var isBC = !!matches[8];
    var year = parseInt(matches[1], 10);
    if (isBC) {
      year = bcYearToNegativeYear(year);
    }
    var month = parseInt(matches[2], 10) - 1;
    var day = matches[3];
    var hour = parseInt(matches[4], 10);
    var minute = parseInt(matches[5], 10);
    var second = parseInt(matches[6], 10);
    var ms = matches[7];
    ms = ms ? 1000 * parseFloat(ms) : 0;
    var date;
    var offset = timeZoneOffset(isoDate);
    if (offset != null) {
      date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
      if (is0To99(year)) {
        date.setUTCFullYear(year);
      }
      if (offset !== 0) {
        date.setTime(date.getTime() - offset);
      }
    } else {
      date = new Date(year, month, day, hour, minute, second, ms);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
    }
    return date;
  };
});

// node_modules/xtend/mutable.js
var require_mutable = __commonJS((exports, module) => {
  var extend = function(target) {
    for (var i = 1;i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  module.exports = extend;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
});

// node_modules/pg/node_modules/pg-types/node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS((exports, module) => {
  var PostgresInterval = function(raw) {
    if (!(this instanceof PostgresInterval)) {
      return new PostgresInterval(raw);
    }
    extend(this, parse(raw));
  };
  var parseMilliseconds = function(fraction) {
    var microseconds = fraction + "000000".slice(fraction.length);
    return parseInt(microseconds, 10) / 1000;
  };
  var parse = function(interval) {
    if (!interval)
      return {};
    var matches = INTERVAL.exec(interval);
    var isNegative = matches[8] === "-";
    return Object.keys(positions).reduce(function(parsed, property) {
      var position = positions[property];
      var value = matches[position];
      if (!value)
        return parsed;
      value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
      if (!value)
        return parsed;
      if (isNegative && ~negatives.indexOf(property)) {
        value *= -1;
      }
      parsed[property] = value;
      return parsed;
    }, {});
  };
  var extend = require_mutable();
  module.exports = PostgresInterval;
  var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
  PostgresInterval.prototype.toPostgres = function() {
    var filtered = properties.filter(this.hasOwnProperty, this);
    if (this.milliseconds && filtered.indexOf("seconds") < 0) {
      filtered.push("seconds");
    }
    if (filtered.length === 0)
      return "0";
    return filtered.map(function(property) {
      var value = this[property] || 0;
      if (property === "seconds" && this.milliseconds) {
        value = (value + this.milliseconds / 1000).toFixed(6).replace(/\.?0+$/, "");
      }
      return value + " " + property;
    }, this).join(" ");
  };
  var propertiesISOEquivalent = {
    years: "Y",
    months: "M",
    days: "D",
    hours: "H",
    minutes: "M",
    seconds: "S"
  };
  var dateProperties = ["years", "months", "days"];
  var timeProperties = ["hours", "minutes", "seconds"];
  PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
    var datePart = dateProperties.map(buildProperty, this).join("");
    var timePart = timeProperties.map(buildProperty, this).join("");
    return "P" + datePart + "T" + timePart;
    function buildProperty(property) {
      var value = this[property] || 0;
      if (property === "seconds" && this.milliseconds) {
        value = (value + this.milliseconds / 1000).toFixed(6).replace(/0+$/, "");
      }
      return value + propertiesISOEquivalent[property];
    }
  };
  var NUMBER = "([+-]?\\d+)";
  var YEAR = NUMBER + "\\s+years?";
  var MONTH = NUMBER + "\\s+mons?";
  var DAY = NUMBER + "\\s+days?";
  var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
  var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
    return "(" + regexString + ")?";
  }).join("\\s*"));
  var positions = {
    years: 2,
    months: 4,
    days: 6,
    hours: 9,
    minutes: 10,
    seconds: 11,
    milliseconds: 12
  };
  var negatives = ["hours", "minutes", "seconds", "milliseconds"];
});

// node_modules/pg/node_modules/pg-types/node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS((exports, module) => {
  module.exports = function parseBytea(input) {
    if (/^\\x/.test(input)) {
      return new Buffer(input.substr(2), "hex");
    }
    var output = "";
    var i = 0;
    while (i < input.length) {
      if (input[i] !== "\\") {
        output += input[i];
        ++i;
      } else {
        if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
          output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
          i += 4;
        } else {
          var backslashes = 1;
          while (i + backslashes < input.length && input[i + backslashes] === "\\") {
            backslashes++;
          }
          for (var k = 0;k < Math.floor(backslashes / 2); ++k) {
            output += "\\";
          }
          i += Math.floor(backslashes / 2) * 2;
        }
      }
    }
    return new Buffer(output, "binary");
  };
});

// node_modules/pg/node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS((exports, module) => {
  var allowNull = function(fn) {
    return function nullAllowed(value) {
      if (value === null)
        return value;
      return fn(value);
    };
  };
  var parseBool = function(value) {
    if (value === null)
      return value;
    return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
  };
  var parseBoolArray = function(value) {
    if (!value)
      return null;
    return array.parse(value, parseBool);
  };
  var parseBaseTenInt = function(string) {
    return parseInt(string, 10);
  };
  var parseIntegerArray = function(value) {
    if (!value)
      return null;
    return array.parse(value, allowNull(parseBaseTenInt));
  };
  var parseBigIntegerArray = function(value) {
    if (!value)
      return null;
    return array.parse(value, allowNull(function(entry) {
      return parseBigInteger(entry).trim();
    }));
  };
  var array = require_postgres_array();
  var arrayParser = require_arrayParser();
  var parseDate = require_postgres_date();
  var parseInterval = require_postgres_interval();
  var parseByteA = require_postgres_bytea();
  var parsePointArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parsePoint(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseFloatArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parseFloat(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseStringArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value);
    return p.parse();
  };
  var parseDateArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parseDate(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseIntervalArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parseInterval(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseByteAArray = function(value) {
    if (!value) {
      return null;
    }
    return array.parse(value, allowNull(parseByteA));
  };
  var parseInteger = function(value) {
    return parseInt(value, 10);
  };
  var parseBigInteger = function(value) {
    var valStr = String(value);
    if (/^\d+$/.test(valStr)) {
      return valStr;
    }
    return value;
  };
  var parseJsonArray = function(value) {
    if (!value) {
      return null;
    }
    return array.parse(value, allowNull(JSON.parse));
  };
  var parsePoint = function(value) {
    if (value[0] !== "(") {
      return null;
    }
    value = value.substring(1, value.length - 1).split(",");
    return {
      x: parseFloat(value[0]),
      y: parseFloat(value[1])
    };
  };
  var parseCircle = function(value) {
    if (value[0] !== "<" && value[1] !== "(") {
      return null;
    }
    var point = "(";
    var radius = "";
    var pointParsed = false;
    for (var i = 2;i < value.length - 1; i++) {
      if (!pointParsed) {
        point += value[i];
      }
      if (value[i] === ")") {
        pointParsed = true;
        continue;
      } else if (!pointParsed) {
        continue;
      }
      if (value[i] === ",") {
        continue;
      }
      radius += value[i];
    }
    var result = parsePoint(point);
    result.radius = parseFloat(radius);
    return result;
  };
  var init = function(register) {
    register(20, parseBigInteger);
    register(21, parseInteger);
    register(23, parseInteger);
    register(26, parseInteger);
    register(700, parseFloat);
    register(701, parseFloat);
    register(16, parseBool);
    register(1082, parseDate);
    register(1114, parseDate);
    register(1184, parseDate);
    register(600, parsePoint);
    register(651, parseStringArray);
    register(718, parseCircle);
    register(1000, parseBoolArray);
    register(1001, parseByteAArray);
    register(1005, parseIntegerArray);
    register(1007, parseIntegerArray);
    register(1028, parseIntegerArray);
    register(1016, parseBigIntegerArray);
    register(1017, parsePointArray);
    register(1021, parseFloatArray);
    register(1022, parseFloatArray);
    register(1231, parseFloatArray);
    register(1014, parseStringArray);
    register(1015, parseStringArray);
    register(1008, parseStringArray);
    register(1009, parseStringArray);
    register(1040, parseStringArray);
    register(1041, parseStringArray);
    register(1115, parseDateArray);
    register(1182, parseDateArray);
    register(1185, parseDateArray);
    register(1186, parseInterval);
    register(1187, parseIntervalArray);
    register(17, parseByteA);
    register(114, JSON.parse.bind(JSON));
    register(3802, JSON.parse.bind(JSON));
    register(199, parseJsonArray);
    register(3807, parseJsonArray);
    register(3907, parseStringArray);
    register(2951, parseStringArray);
    register(791, parseStringArray);
    register(1183, parseStringArray);
    register(1270, parseStringArray);
  };
  module.exports = {
    init
  };
});

// node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS((exports, module) => {
  var readInt8 = function(buffer) {
    var high = buffer.readInt32BE(0);
    var low = buffer.readUInt32BE(4);
    var sign = "";
    if (high < 0) {
      high = ~high + (low === 0);
      low = ~low + 1 >>> 0;
      sign = "-";
    }
    var result = "";
    var carry;
    var t;
    var digits;
    var pad;
    var l;
    var i;
    {
      carry = high % BASE;
      high = high / BASE >>> 0;
      t = 4294967296 * carry + low;
      low = t / BASE >>> 0;
      digits = "" + (t - BASE * low);
      if (low === 0 && high === 0) {
        return sign + digits + result;
      }
      pad = "";
      l = 6 - digits.length;
      for (i = 0;i < l; i++) {
        pad += "0";
      }
      result = pad + digits + result;
    }
    {
      carry = high % BASE;
      high = high / BASE >>> 0;
      t = 4294967296 * carry + low;
      low = t / BASE >>> 0;
      digits = "" + (t - BASE * low);
      if (low === 0 && high === 0) {
        return sign + digits + result;
      }
      pad = "";
      l = 6 - digits.length;
      for (i = 0;i < l; i++) {
        pad += "0";
      }
      result = pad + digits + result;
    }
    {
      carry = high % BASE;
      high = high / BASE >>> 0;
      t = 4294967296 * carry + low;
      low = t / BASE >>> 0;
      digits = "" + (t - BASE * low);
      if (low === 0 && high === 0) {
        return sign + digits + result;
      }
      pad = "";
      l = 6 - digits.length;
      for (i = 0;i < l; i++) {
        pad += "0";
      }
      result = pad + digits + result;
    }
    {
      carry = high % BASE;
      t = 4294967296 * carry + low;
      digits = "" + t % BASE;
      return sign + digits + result;
    }
  };
  var BASE = 1e6;
  module.exports = readInt8;
});

// node_modules/pg/node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS((exports, module) => {
  var parseInt64 = require_pg_int8();
  var parseBits = function(data, bits, offset, invert, callback) {
    offset = offset || 0;
    invert = invert || false;
    callback = callback || function(lastValue, newValue, bits2) {
      return lastValue * Math.pow(2, bits2) + newValue;
    };
    var offsetBytes = offset >> 3;
    var inv = function(value) {
      if (invert) {
        return ~value & 255;
      }
      return value;
    };
    var mask = 255;
    var firstBits = 8 - offset % 8;
    if (bits < firstBits) {
      mask = 255 << 8 - bits & 255;
      firstBits = bits;
    }
    if (offset) {
      mask = mask >> offset % 8;
    }
    var result = 0;
    if (offset % 8 + bits >= 8) {
      result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
    }
    var bytes = bits + offset >> 3;
    for (var i = offsetBytes + 1;i < bytes; i++) {
      result = callback(result, inv(data[i]), 8);
    }
    var lastBits = (bits + offset) % 8;
    if (lastBits > 0) {
      result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
    }
    return result;
  };
  var parseFloatFromBits = function(data, precisionBits, exponentBits) {
    var bias = Math.pow(2, exponentBits - 1) - 1;
    var sign = parseBits(data, 1);
    var exponent = parseBits(data, exponentBits, 1);
    if (exponent === 0) {
      return 0;
    }
    var precisionBitsCounter = 1;
    var parsePrecisionBits = function(lastValue, newValue, bits) {
      if (lastValue === 0) {
        lastValue = 1;
      }
      for (var i = 1;i <= bits; i++) {
        precisionBitsCounter /= 2;
        if ((newValue & 1 << bits - i) > 0) {
          lastValue += precisionBitsCounter;
        }
      }
      return lastValue;
    };
    var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
    if (exponent == Math.pow(2, exponentBits + 1) - 1) {
      if (mantissa === 0) {
        return sign === 0 ? Infinity : (-Infinity);
      }
      return NaN;
    }
    return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
  };
  var parseInt16 = function(value) {
    if (parseBits(value, 1) == 1) {
      return -1 * (parseBits(value, 15, 1, true) + 1);
    }
    return parseBits(value, 15, 1);
  };
  var parseInt32 = function(value) {
    if (parseBits(value, 1) == 1) {
      return -1 * (parseBits(value, 31, 1, true) + 1);
    }
    return parseBits(value, 31, 1);
  };
  var parseFloat32 = function(value) {
    return parseFloatFromBits(value, 23, 8);
  };
  var parseFloat64 = function(value) {
    return parseFloatFromBits(value, 52, 11);
  };
  var parseNumeric = function(value) {
    var sign = parseBits(value, 16, 32);
    if (sign == 49152) {
      return NaN;
    }
    var weight = Math.pow(1e4, parseBits(value, 16, 16));
    var result = 0;
    var digits = [];
    var ndigits = parseBits(value, 16);
    for (var i = 0;i < ndigits; i++) {
      result += parseBits(value, 16, 64 + 16 * i) * weight;
      weight /= 1e4;
    }
    var scale = Math.pow(10, parseBits(value, 16, 48));
    return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
  };
  var parseDate = function(isUTC, value) {
    var sign = parseBits(value, 1);
    var rawValue = parseBits(value, 63, 1);
    var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1000 + 946684800000);
    if (!isUTC) {
      result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
    }
    result.usec = rawValue % 1000;
    result.getMicroSeconds = function() {
      return this.usec;
    };
    result.setMicroSeconds = function(value2) {
      this.usec = value2;
    };
    result.getUTCMicroSeconds = function() {
      return this.usec;
    };
    return result;
  };
  var parseArray = function(value) {
    var dim = parseBits(value, 32);
    var flags = parseBits(value, 32, 32);
    var elementType = parseBits(value, 32, 64);
    var offset = 96;
    var dims = [];
    for (var i = 0;i < dim; i++) {
      dims[i] = parseBits(value, 32, offset);
      offset += 32;
      offset += 32;
    }
    var parseElement = function(elementType2) {
      var length = parseBits(value, 32, offset);
      offset += 32;
      if (length == 4294967295) {
        return null;
      }
      var result;
      if (elementType2 == 23 || elementType2 == 20) {
        result = parseBits(value, length * 8, offset);
        offset += length * 8;
        return result;
      } else if (elementType2 == 25) {
        result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
        return result;
      } else {
        console.log("ERROR: ElementType not implemented: " + elementType2);
      }
    };
    var parse = function(dimension, elementType2) {
      var array = [];
      var i2;
      if (dimension.length > 1) {
        var count = dimension.shift();
        for (i2 = 0;i2 < count; i2++) {
          array[i2] = parse(dimension, elementType2);
        }
        dimension.unshift(count);
      } else {
        for (i2 = 0;i2 < dimension[0]; i2++) {
          array[i2] = parseElement(elementType2);
        }
      }
      return array;
    };
    return parse(dims, elementType);
  };
  var parseText = function(value) {
    return value.toString("utf8");
  };
  var parseBool = function(value) {
    if (value === null)
      return null;
    return parseBits(value, 8) > 0;
  };
  var init = function(register) {
    register(20, parseInt64);
    register(21, parseInt16);
    register(23, parseInt32);
    register(26, parseInt32);
    register(1700, parseNumeric);
    register(700, parseFloat32);
    register(701, parseFloat64);
    register(16, parseBool);
    register(1114, parseDate.bind(null, false));
    register(1184, parseDate.bind(null, true));
    register(1000, parseArray);
    register(1007, parseArray);
    register(1016, parseArray);
    register(1008, parseArray);
    register(1009, parseArray);
    register(25, parseText);
  };
  module.exports = {
    init
  };
});

// node_modules/pg/node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS((exports, module) => {
  module.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});

// node_modules/pg/node_modules/pg-types/index.js
var require_pg_types = __commonJS((exports) => {
  var noParse = function(val) {
    return String(val);
  };
  var getTypeParser = function(oid, format) {
    format = format || "text";
    if (!typeParsers[format]) {
      return noParse;
    }
    return typeParsers[format][oid] || noParse;
  };
  var setTypeParser = function(oid, format, parseFn) {
    if (typeof format == "function") {
      parseFn = format;
      format = "text";
    }
    typeParsers[format][oid] = parseFn;
  };
  var textParsers = require_textParsers();
  var binaryParsers = require_binaryParsers();
  var arrayParser = require_arrayParser();
  var builtinTypes = require_builtins();
  exports.getTypeParser = getTypeParser;
  exports.setTypeParser = setTypeParser;
  exports.arrayParser = arrayParser;
  exports.builtins = builtinTypes;
  var typeParsers = {
    text: {},
    binary: {}
  };
  textParsers.init(function(oid, converter) {
    typeParsers.text[oid] = converter;
  });
  binaryParsers.init(function(oid, converter) {
    typeParsers.binary[oid] = converter;
  });
});

// node_modules/pg/lib/defaults.js
var require_defaults = __commonJS((exports, module) => {
  module.exports = {
    host: "localhost",
    user: process.platform === "win32" ? process.env.USERNAME : "dusan",
    database: undefined,
    password: null,
    connectionString: undefined,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 30000,
    client_encoding: "",
    ssl: false,
    application_name: undefined,
    fallback_application_name: undefined,
    options: undefined,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var pgTypes = require_pg_types();
  var parseBigInteger = pgTypes.getTypeParser(20, "text");
  var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
  module.exports.__defineSetter__("parseInt8", function(val) {
    pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
    pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
  });
});

// node_modules/pg/lib/utils.js
var require_utils = __commonJS((exports, module) => {
  var escapeElement = function(elementRepresentation) {
    var escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return '"' + escaped + '"';
  };
  var arrayString = function(val) {
    var result = "{";
    for (var i = 0;i < val.length; i++) {
      if (i > 0) {
        result = result + ",";
      }
      if (val[i] === null || typeof val[i] === "undefined") {
        result = result + "NULL";
      } else if (Array.isArray(val[i])) {
        result = result + arrayString(val[i]);
      } else if (val[i] instanceof Buffer) {
        result += "\\\\x" + val[i].toString("hex");
      } else {
        result += escapeElement(prepareValue(val[i]));
      }
    }
    result = result + "}";
    return result;
  };
  var prepareObject = function(val, seen) {
    if (val && typeof val.toPostgres === "function") {
      seen = seen || [];
      if (seen.indexOf(val) !== -1) {
        throw new Error('circular reference detected while preparing "' + val + '" for query');
      }
      seen.push(val);
      return prepareValue(val.toPostgres(prepareValue), seen);
    }
    return JSON.stringify(val);
  };
  var pad = function(number, digits) {
    number = "" + number;
    while (number.length < digits) {
      number = "0" + number;
    }
    return number;
  };
  var dateToString = function(date) {
    var offset = -date.getTimezoneOffset();
    var year = date.getFullYear();
    var isBCYear = year < 1;
    if (isBCYear)
      year = Math.abs(year) + 1;
    var ret = pad(year, 4) + "-" + pad(date.getMonth() + 1, 2) + "-" + pad(date.getDate(), 2) + "T" + pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2) + "." + pad(date.getMilliseconds(), 3);
    if (offset < 0) {
      ret += "-";
      offset *= -1;
    } else {
      ret += "+";
    }
    ret += pad(Math.floor(offset / 60), 2) + ":" + pad(offset % 60, 2);
    if (isBCYear)
      ret += " BC";
    return ret;
  };
  var dateToStringUTC = function(date) {
    var year = date.getUTCFullYear();
    var isBCYear = year < 1;
    if (isBCYear)
      year = Math.abs(year) + 1;
    var ret = pad(year, 4) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2) + "T" + pad(date.getUTCHours(), 2) + ":" + pad(date.getUTCMinutes(), 2) + ":" + pad(date.getUTCSeconds(), 2) + "." + pad(date.getUTCMilliseconds(), 3);
    ret += "+00:00";
    if (isBCYear)
      ret += " BC";
    return ret;
  };
  var normalizeQueryConfig = function(config, values, callback) {
    config = typeof config === "string" ? { text: config } : config;
    if (values) {
      if (typeof values === "function") {
        config.callback = values;
      } else {
        config.values = values;
      }
    }
    if (callback) {
      config.callback = callback;
    }
    return config;
  };
  var defaults = require_defaults();
  var prepareValue = function(val, seen) {
    if (val == null) {
      return null;
    }
    if (val instanceof Buffer) {
      return val;
    }
    if (ArrayBuffer.isView(val)) {
      var buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
      if (buf.length === val.byteLength) {
        return buf;
      }
      return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
    }
    if (val instanceof Date) {
      if (defaults.parseInputDatesAsUTC) {
        return dateToStringUTC(val);
      } else {
        return dateToString(val);
      }
    }
    if (Array.isArray(val)) {
      return arrayString(val);
    }
    if (typeof val === "object") {
      return prepareObject(val, seen);
    }
    return val.toString();
  };
  var escapeIdentifier = function(str) {
    return '"' + str.replace(/"/g, '""') + '"';
  };
  var escapeLiteral = function(str) {
    var hasBackslash = false;
    var escaped = "'";
    for (var i = 0;i < str.length; i++) {
      var c = str[i];
      if (c === "'") {
        escaped += c + c;
      } else if (c === "\\") {
        escaped += c + c;
        hasBackslash = true;
      } else {
        escaped += c;
      }
    }
    escaped += "'";
    if (hasBackslash === true) {
      escaped = " E" + escaped;
    }
    return escaped;
  };
  module.exports = {
    prepareValue: function prepareValueWrapper(value) {
      return prepareValue(value);
    },
    normalizeQueryConfig,
    escapeIdentifier,
    escapeLiteral
  };
});

// node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS((exports, module) => {
  var md5 = function(string) {
    return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
  };
  var postgresMd5PasswordHash = function(user, password, salt) {
    var inner = md5(password + user);
    var outer = md5(Buffer.concat([Buffer.from(inner), salt]));
    return "md5" + outer;
  };
  var sha256 = function(text) {
    return nodeCrypto.createHash("sha256").update(text).digest();
  };
  var hmacSha256 = function(key, msg) {
    return nodeCrypto.createHmac("sha256", key).update(msg).digest();
  };
  async function deriveKey(password, salt, iterations) {
    return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  }
  var nodeCrypto = import.meta.require("crypto");
  module.exports = {
    postgresMd5PasswordHash,
    randomBytes: nodeCrypto.randomBytes,
    deriveKey,
    sha256,
    hmacSha256,
    md5
  };
});

// node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS((exports, module) => {
  var randomBytes = function(length) {
    return webCrypto.getRandomValues(Buffer.alloc(length));
  };
  async function md5(string) {
    try {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    } catch (e2) {
      const data = typeof string === "string" ? textEncoder.encode(string) : string;
      const hash = await subtleCrypto.digest("MD5", data);
      return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  }
  async function postgresMd5PasswordHash(user, password, salt) {
    var inner = await md5(password + user);
    var outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
    return "md5" + outer;
  }
  async function sha256(text) {
    return await subtleCrypto.digest("SHA-256", text);
  }
  async function hmacSha256(keyBuffer, msg) {
    const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
  }
  async function deriveKey(password, salt, iterations) {
    const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
    return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
  }
  var nodeCrypto = import.meta.require("crypto");
  module.exports = {
    postgresMd5PasswordHash,
    randomBytes,
    deriveKey,
    sha256,
    hmacSha256,
    md5
  };
  var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
  var subtleCrypto = webCrypto.subtle;
  var textEncoder = new TextEncoder;
});

// node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS((exports, module) => {
  var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
  if (useLegacyCrypto) {
    module.exports = require_utils_legacy();
  } else {
    module.exports = require_utils_webcrypto();
  }
});

// node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS((exports, module) => {
  var startSession = function(mechanisms) {
    if (mechanisms.indexOf("SCRAM-SHA-256") === -1) {
      throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    }
    const clientNonce = crypto.randomBytes(18).toString("base64");
    return {
      mechanism: "SCRAM-SHA-256",
      clientNonce,
      response: "n,,n=*,r=" + clientNonce,
      message: "SASLInitialResponse"
    };
  };
  async function continueSession(session, password, serverData) {
    if (session.message !== "SASLInitialResponse") {
      throw new Error("SASL: Last message was not SASLInitialResponse");
    }
    if (typeof password !== "string") {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    }
    if (password === "") {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
    }
    if (typeof serverData !== "string") {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    }
    const sv = parseServerFirstMessage(serverData);
    if (!sv.nonce.startsWith(session.clientNonce)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    } else if (sv.nonce.length === session.clientNonce.length) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    }
    var clientFirstMessageBare = "n=*,r=" + session.clientNonce;
    var serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
    var clientFinalMessageWithoutProof = "c=biws,r=" + sv.nonce;
    var authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
    var saltBytes = Buffer.from(sv.salt, "base64");
    var saltedPassword = await crypto.deriveKey(password, saltBytes, sv.iteration);
    var clientKey = await crypto.hmacSha256(saltedPassword, "Client Key");
    var storedKey = await crypto.sha256(clientKey);
    var clientSignature = await crypto.hmacSha256(storedKey, authMessage);
    var clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
    var serverKey = await crypto.hmacSha256(saltedPassword, "Server Key");
    var serverSignatureBytes = await crypto.hmacSha256(serverKey, authMessage);
    session.message = "SASLResponse";
    session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
    session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
  }
  var finalizeSession = function(session, serverData) {
    if (session.message !== "SASLResponse") {
      throw new Error("SASL: Last message was not SASLResponse");
    }
    if (typeof serverData !== "string") {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    }
    const { serverSignature } = parseServerFinalMessage(serverData);
    if (serverSignature !== session.serverSignature) {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
    }
  };
  var isPrintableChars = function(text) {
    if (typeof text !== "string") {
      throw new TypeError("SASL: text must be a string");
    }
    return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
  };
  var isBase64 = function(text) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
  };
  var parseAttributePairs = function(text) {
    if (typeof text !== "string") {
      throw new TypeError("SASL: attribute pairs text must be a string");
    }
    return new Map(text.split(",").map((attrValue) => {
      if (!/^.=/.test(attrValue)) {
        throw new Error("SASL: Invalid attribute pair entry");
      }
      const name = attrValue[0];
      const value = attrValue.substring(2);
      return [name, value];
    }));
  };
  var parseServerFirstMessage = function(data) {
    const attrPairs = parseAttributePairs(data);
    const nonce = attrPairs.get("r");
    if (!nonce) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    } else if (!isPrintableChars(nonce)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    }
    const salt = attrPairs.get("s");
    if (!salt) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    } else if (!isBase64(salt)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    }
    const iterationText = attrPairs.get("i");
    if (!iterationText) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    }
    const iteration = parseInt(iterationText, 10);
    return {
      nonce,
      salt,
      iteration
    };
  };
  var parseServerFinalMessage = function(serverData) {
    const attrPairs = parseAttributePairs(serverData);
    const serverSignature = attrPairs.get("v");
    if (!serverSignature) {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    } else if (!isBase64(serverSignature)) {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    }
    return {
      serverSignature
    };
  };
  var xorBuffers = function(a, b) {
    if (!Buffer.isBuffer(a)) {
      throw new TypeError("first argument must be a Buffer");
    }
    if (!Buffer.isBuffer(b)) {
      throw new TypeError("second argument must be a Buffer");
    }
    if (a.length !== b.length) {
      throw new Error("Buffer lengths must match");
    }
    if (a.length === 0) {
      throw new Error("Buffers cannot be empty");
    }
    return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
  };
  var crypto = require_utils2();
  module.exports = {
    startSession,
    continueSession,
    finalizeSession
  };
});

// node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS((exports, module) => {
  var TypeOverrides = function(userTypes) {
    this._types = userTypes || types;
    this.text = {};
    this.binary = {};
  };
  var types = require_pg_types();
  TypeOverrides.prototype.getOverrides = function(format) {
    switch (format) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  TypeOverrides.prototype.setTypeParser = function(oid, format, parseFn) {
    if (typeof format === "function") {
      parseFn = format;
      format = "text";
    }
    this.getOverrides(format)[oid] = parseFn;
  };
  TypeOverrides.prototype.getTypeParser = function(oid, format) {
    format = format || "text";
    return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
  };
  module.exports = TypeOverrides;
});

// node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS((exports, module) => {
  var parse = function(str) {
    if (str.charAt(0) === "/") {
      const config2 = str.split(" ");
      return { host: config2[0], database: config2[1] };
    }
    const config = {};
    let result;
    let dummyHost = false;
    if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
      str = encodeURI(str).replace(/\%25(\d\d)/g, "%$1");
    }
    try {
      result = new URL(str, "postgres://base");
    } catch (e2) {
      result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
      dummyHost = true;
    }
    for (const entry of result.searchParams.entries()) {
      config[entry[0]] = entry[1];
    }
    config.user = config.user || decodeURIComponent(result.username);
    config.password = config.password || decodeURIComponent(result.password);
    if (result.protocol == "socket:") {
      config.host = decodeURI(result.pathname);
      config.database = result.searchParams.get("db");
      config.client_encoding = result.searchParams.get("encoding");
      return config;
    }
    const hostname = dummyHost ? "" : result.hostname;
    if (!config.host) {
      config.host = decodeURIComponent(hostname);
    } else if (hostname && /^%2f/i.test(hostname)) {
      result.pathname = hostname + result.pathname;
    }
    if (!config.port) {
      config.port = result.port;
    }
    const pathname = result.pathname.slice(1) || null;
    config.database = pathname ? decodeURI(pathname) : null;
    if (config.ssl === "true" || config.ssl === "1") {
      config.ssl = true;
    }
    if (config.ssl === "0") {
      config.ssl = false;
    }
    if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
      config.ssl = {};
    }
    const fs = config.sslcert || config.sslkey || config.sslrootcert ? import.meta.require("fs") : null;
    if (config.sslcert) {
      config.ssl.cert = fs.readFileSync(config.sslcert).toString();
    }
    if (config.sslkey) {
      config.ssl.key = fs.readFileSync(config.sslkey).toString();
    }
    if (config.sslrootcert) {
      config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
    }
    switch (config.sslmode) {
      case "disable": {
        config.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full": {
        break;
      }
      case "no-verify": {
        config.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return config;
  };
  module.exports = parse;
  parse.parse = parse;
});

// node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS((exports, module) => {
  var dns = import.meta.require("dns");
  var defaults = require_defaults();
  var parse = require_pg_connection_string().parse;
  var val = function(key, config, envVar) {
    if (envVar === undefined) {
      envVar = process.env["PG" + key.toUpperCase()];
    } else if (envVar === false) {
    } else {
      envVar = process.env[envVar];
    }
    return config[key] || envVar || defaults[key];
  };
  var readSSLConfigFromEnvironment = function() {
    switch (process.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return defaults.ssl;
  };
  var quoteParamValue = function(value) {
    return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  };
  var add = function(params, config, paramName) {
    var value = config[paramName];
    if (value !== undefined && value !== null) {
      params.push(paramName + "=" + quoteParamValue(value));
    }
  };

  class ConnectionParameters {
    constructor(config) {
      config = typeof config === "string" ? parse(config) : config || {};
      if (config.connectionString) {
        config = Object.assign({}, config, parse(config.connectionString));
      }
      this.user = val("user", config);
      this.database = val("database", config);
      if (this.database === undefined) {
        this.database = this.user;
      }
      this.port = parseInt(val("port", config), 10);
      this.host = val("host", config);
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: val("password", config)
      });
      this.binary = val("binary", config);
      this.options = val("options", config);
      this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
      if (typeof this.ssl === "string") {
        if (this.ssl === "true") {
          this.ssl = true;
        }
      }
      if (this.ssl === "no-verify") {
        this.ssl = { rejectUnauthorized: false };
      }
      if (this.ssl && this.ssl.key) {
        Object.defineProperty(this.ssl, "key", {
          enumerable: false
        });
      }
      this.client_encoding = val("client_encoding", config);
      this.replication = val("replication", config);
      this.isDomainSocket = !(this.host || "").indexOf("/");
      this.application_name = val("application_name", config, "PGAPPNAME");
      this.fallback_application_name = val("fallback_application_name", config, false);
      this.statement_timeout = val("statement_timeout", config, false);
      this.lock_timeout = val("lock_timeout", config, false);
      this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
      this.query_timeout = val("query_timeout", config, false);
      if (config.connectionTimeoutMillis === undefined) {
        this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
      } else {
        this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1000);
      }
      if (config.keepAlive === false) {
        this.keepalives = 0;
      } else if (config.keepAlive === true) {
        this.keepalives = 1;
      }
      if (typeof config.keepAliveInitialDelayMillis === "number") {
        this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1000);
      }
    }
    getLibpqConnectionString(cb) {
      var params = [];
      add(params, this, "user");
      add(params, this, "password");
      add(params, this, "port");
      add(params, this, "application_name");
      add(params, this, "fallback_application_name");
      add(params, this, "connect_timeout");
      add(params, this, "options");
      var ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      add(params, ssl, "sslmode");
      add(params, ssl, "sslca");
      add(params, ssl, "sslkey");
      add(params, ssl, "sslcert");
      add(params, ssl, "sslrootcert");
      if (this.database) {
        params.push("dbname=" + quoteParamValue(this.database));
      }
      if (this.replication) {
        params.push("replication=" + quoteParamValue(this.replication));
      }
      if (this.host) {
        params.push("host=" + quoteParamValue(this.host));
      }
      if (this.isDomainSocket) {
        return cb(null, params.join(" "));
      }
      if (this.client_encoding) {
        params.push("client_encoding=" + quoteParamValue(this.client_encoding));
      }
      dns.lookup(this.host, function(err, address) {
        if (err)
          return cb(err, null);
        params.push("hostaddr=" + quoteParamValue(address));
        return cb(null, params.join(" "));
      });
    }
  }
  module.exports = ConnectionParameters;
});

// node_modules/pg/lib/result.js
var require_result = __commonJS((exports, module) => {
  var types = require_pg_types();
  var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;

  class Result {
    constructor(rowMode, types2) {
      this.command = null;
      this.rowCount = null;
      this.oid = null;
      this.rows = [];
      this.fields = [];
      this._parsers = undefined;
      this._types = types2;
      this.RowCtor = null;
      this.rowAsArray = rowMode === "array";
      if (this.rowAsArray) {
        this.parseRow = this._parseRowAsArray;
      }
      this._prebuiltEmptyResultObject = null;
    }
    addCommandComplete(msg) {
      var match;
      if (msg.text) {
        match = matchRegexp.exec(msg.text);
      } else {
        match = matchRegexp.exec(msg.command);
      }
      if (match) {
        this.command = match[1];
        if (match[3]) {
          this.oid = parseInt(match[2], 10);
          this.rowCount = parseInt(match[3], 10);
        } else if (match[2]) {
          this.rowCount = parseInt(match[2], 10);
        }
      }
    }
    _parseRowAsArray(rowData) {
      var row = new Array(rowData.length);
      for (var i = 0, len = rowData.length;i < len; i++) {
        var rawValue = rowData[i];
        if (rawValue !== null) {
          row[i] = this._parsers[i](rawValue);
        } else {
          row[i] = null;
        }
      }
      return row;
    }
    parseRow(rowData) {
      var row = { ...this._prebuiltEmptyResultObject };
      for (var i = 0, len = rowData.length;i < len; i++) {
        var rawValue = rowData[i];
        var field = this.fields[i].name;
        if (rawValue !== null) {
          row[field] = this._parsers[i](rawValue);
        }
      }
      return row;
    }
    addRow(row) {
      this.rows.push(row);
    }
    addFields(fieldDescriptions) {
      this.fields = fieldDescriptions;
      if (this.fields.length) {
        this._parsers = new Array(fieldDescriptions.length);
      }
      for (var i = 0;i < fieldDescriptions.length; i++) {
        var desc = fieldDescriptions[i];
        if (this._types) {
          this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
        } else {
          this._parsers[i] = types.getTypeParser(desc.dataTypeID, desc.format || "text");
        }
      }
      this._createPrebuiltEmptyResultObject();
    }
    _createPrebuiltEmptyResultObject() {
      var row = {};
      for (var i = 0;i < this.fields.length; i++) {
        row[this.fields[i].name] = null;
      }
      this._prebuiltEmptyResultObject = { ...row };
    }
  }
  module.exports = Result;
});

// node_modules/pg/lib/query.js
var require_query = __commonJS((exports, module) => {
  var { EventEmitter } = import.meta.require("events");
  var Result = require_result();
  var utils = require_utils();

  class Query extends EventEmitter {
    constructor(config, values, callback) {
      super();
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.rows = config.rows;
      this.types = config.types;
      this.name = config.name;
      this.binary = config.binary;
      this.portal = config.portal || "";
      this.callback = config.callback;
      this._rowMode = config.rowMode;
      if (process.domain && config.callback) {
        this.callback = process.domain.bind(config.callback);
      }
      this._result = new Result(this._rowMode, this.types);
      this._results = this._result;
      this.isPreparedStatement = false;
      this._canceledDueToError = false;
      this._promise = null;
    }
    requiresPreparation() {
      if (this.name) {
        return true;
      }
      if (this.rows) {
        return true;
      }
      if (!this.text) {
        return false;
      }
      if (!this.values) {
        return false;
      }
      return this.values.length > 0;
    }
    _checkForMultirow() {
      if (this._result.command) {
        if (!Array.isArray(this._results)) {
          this._results = [this._result];
        }
        this._result = new Result(this._rowMode, this.types);
        this._results.push(this._result);
      }
    }
    handleRowDescription(msg) {
      this._checkForMultirow();
      this._result.addFields(msg.fields);
      this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(msg) {
      let row;
      if (this._canceledDueToError) {
        return;
      }
      try {
        row = this._result.parseRow(msg.fields);
      } catch (err) {
        this._canceledDueToError = err;
        return;
      }
      this.emit("row", row, this._result);
      if (this._accumulateRows) {
        this._result.addRow(row);
      }
    }
    handleCommandComplete(msg, connection) {
      this._checkForMultirow();
      this._result.addCommandComplete(msg);
      if (this.rows) {
        connection.sync();
      }
    }
    handleEmptyQuery(connection) {
      if (this.rows) {
        connection.sync();
      }
    }
    handleError(err, connection) {
      if (this._canceledDueToError) {
        err = this._canceledDueToError;
        this._canceledDueToError = false;
      }
      if (this.callback) {
        return this.callback(err);
      }
      this.emit("error", err);
    }
    handleReadyForQuery(con) {
      if (this._canceledDueToError) {
        return this.handleError(this._canceledDueToError, con);
      }
      if (this.callback) {
        try {
          this.callback(null, this._results);
        } catch (err) {
          process.nextTick(() => {
            throw err;
          });
        }
      }
      this.emit("end", this._results);
    }
    submit(connection) {
      if (typeof this.text !== "string" && typeof this.name !== "string") {
        return new Error("A query must have either text or a name. Supplying neither is unsupported.");
      }
      const previous = connection.parsedStatements[this.name];
      if (this.text && previous && this.text !== previous) {
        return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
      }
      if (this.values && !Array.isArray(this.values)) {
        return new Error("Query values must be an array");
      }
      if (this.requiresPreparation()) {
        this.prepare(connection);
      } else {
        connection.query(this.text);
      }
      return null;
    }
    hasBeenParsed(connection) {
      return this.name && connection.parsedStatements[this.name];
    }
    handlePortalSuspended(connection) {
      this._getRows(connection, this.rows);
    }
    _getRows(connection, rows) {
      connection.execute({
        portal: this.portal,
        rows
      });
      if (!rows) {
        connection.sync();
      } else {
        connection.flush();
      }
    }
    prepare(connection) {
      this.isPreparedStatement = true;
      if (!this.hasBeenParsed(connection)) {
        connection.parse({
          text: this.text,
          name: this.name,
          types: this.types
        });
      }
      try {
        connection.bind({
          portal: this.portal,
          statement: this.name,
          values: this.values,
          binary: this.binary,
          valueMapper: utils.prepareValue
        });
      } catch (err) {
        this.handleError(err, connection);
        return;
      }
      connection.describe({
        type: "P",
        name: this.portal || ""
      });
      this._getRows(connection, this.rows);
    }
    handleCopyInResponse(connection) {
      connection.sendCopyFail("No source stream defined");
    }
    handleCopyData(msg, connection) {
    }
  }
  module.exports = Query;
});

// node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.NoticeMessage = exports.DataRowMessage = exports.CommandCompleteMessage = exports.ReadyForQueryMessage = exports.NotificationResponseMessage = exports.BackendKeyDataMessage = exports.AuthenticationMD5Password = exports.ParameterStatusMessage = exports.ParameterDescriptionMessage = exports.RowDescriptionMessage = exports.Field = exports.CopyResponse = exports.CopyDataMessage = exports.DatabaseError = exports.copyDone = exports.emptyQuery = exports.replicationStart = exports.portalSuspended = exports.noData = exports.closeComplete = exports.bindComplete = exports.parseComplete = undefined;
  exports.parseComplete = {
    name: "parseComplete",
    length: 5
  };
  exports.bindComplete = {
    name: "bindComplete",
    length: 5
  };
  exports.closeComplete = {
    name: "closeComplete",
    length: 5
  };
  exports.noData = {
    name: "noData",
    length: 5
  };
  exports.portalSuspended = {
    name: "portalSuspended",
    length: 5
  };
  exports.replicationStart = {
    name: "replicationStart",
    length: 4
  };
  exports.emptyQuery = {
    name: "emptyQuery",
    length: 4
  };
  exports.copyDone = {
    name: "copyDone",
    length: 4
  };

  class DatabaseError extends Error {
    constructor(message, length, name) {
      super(message);
      this.length = length;
      this.name = name;
    }
  }
  exports.DatabaseError = DatabaseError;

  class CopyDataMessage {
    constructor(length, chunk) {
      this.length = length;
      this.chunk = chunk;
      this.name = "copyData";
    }
  }
  exports.CopyDataMessage = CopyDataMessage;

  class CopyResponse {
    constructor(length, name, binary, columnCount) {
      this.length = length;
      this.name = name;
      this.binary = binary;
      this.columnTypes = new Array(columnCount);
    }
  }
  exports.CopyResponse = CopyResponse;

  class Field {
    constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
      this.name = name;
      this.tableID = tableID;
      this.columnID = columnID;
      this.dataTypeID = dataTypeID;
      this.dataTypeSize = dataTypeSize;
      this.dataTypeModifier = dataTypeModifier;
      this.format = format;
    }
  }
  exports.Field = Field;

  class RowDescriptionMessage {
    constructor(length, fieldCount) {
      this.length = length;
      this.fieldCount = fieldCount;
      this.name = "rowDescription";
      this.fields = new Array(this.fieldCount);
    }
  }
  exports.RowDescriptionMessage = RowDescriptionMessage;

  class ParameterDescriptionMessage {
    constructor(length, parameterCount) {
      this.length = length;
      this.parameterCount = parameterCount;
      this.name = "parameterDescription";
      this.dataTypeIDs = new Array(this.parameterCount);
    }
  }
  exports.ParameterDescriptionMessage = ParameterDescriptionMessage;

  class ParameterStatusMessage {
    constructor(length, parameterName, parameterValue) {
      this.length = length;
      this.parameterName = parameterName;
      this.parameterValue = parameterValue;
      this.name = "parameterStatus";
    }
  }
  exports.ParameterStatusMessage = ParameterStatusMessage;

  class AuthenticationMD5Password {
    constructor(length, salt) {
      this.length = length;
      this.salt = salt;
      this.name = "authenticationMD5Password";
    }
  }
  exports.AuthenticationMD5Password = AuthenticationMD5Password;

  class BackendKeyDataMessage {
    constructor(length, processID, secretKey) {
      this.length = length;
      this.processID = processID;
      this.secretKey = secretKey;
      this.name = "backendKeyData";
    }
  }
  exports.BackendKeyDataMessage = BackendKeyDataMessage;

  class NotificationResponseMessage {
    constructor(length, processId, channel, payload) {
      this.length = length;
      this.processId = processId;
      this.channel = channel;
      this.payload = payload;
      this.name = "notification";
    }
  }
  exports.NotificationResponseMessage = NotificationResponseMessage;

  class ReadyForQueryMessage {
    constructor(length, status) {
      this.length = length;
      this.status = status;
      this.name = "readyForQuery";
    }
  }
  exports.ReadyForQueryMessage = ReadyForQueryMessage;

  class CommandCompleteMessage {
    constructor(length, text) {
      this.length = length;
      this.text = text;
      this.name = "commandComplete";
    }
  }
  exports.CommandCompleteMessage = CommandCompleteMessage;

  class DataRowMessage {
    constructor(length, fields) {
      this.length = length;
      this.fields = fields;
      this.name = "dataRow";
      this.fieldCount = fields.length;
    }
  }
  exports.DataRowMessage = DataRowMessage;

  class NoticeMessage {
    constructor(length, message) {
      this.length = length;
      this.message = message;
      this.name = "notice";
    }
  }
  exports.NoticeMessage = NoticeMessage;
});

// node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Writer = undefined;

  class Writer {
    constructor(size = 256) {
      this.size = size;
      this.offset = 5;
      this.headerPosition = 0;
      this.buffer = Buffer.allocUnsafe(size);
    }
    ensure(size) {
      var remaining = this.buffer.length - this.offset;
      if (remaining < size) {
        var oldBuffer = this.buffer;
        var newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
        this.buffer = Buffer.allocUnsafe(newSize);
        oldBuffer.copy(this.buffer);
      }
    }
    addInt32(num) {
      this.ensure(4);
      this.buffer[this.offset++] = num >>> 24 & 255;
      this.buffer[this.offset++] = num >>> 16 & 255;
      this.buffer[this.offset++] = num >>> 8 & 255;
      this.buffer[this.offset++] = num >>> 0 & 255;
      return this;
    }
    addInt16(num) {
      this.ensure(2);
      this.buffer[this.offset++] = num >>> 8 & 255;
      this.buffer[this.offset++] = num >>> 0 & 255;
      return this;
    }
    addCString(string) {
      if (!string) {
        this.ensure(1);
      } else {
        var len = Buffer.byteLength(string);
        this.ensure(len + 1);
        this.buffer.write(string, this.offset, "utf-8");
        this.offset += len;
      }
      this.buffer[this.offset++] = 0;
      return this;
    }
    addString(string = "") {
      var len = Buffer.byteLength(string);
      this.ensure(len);
      this.buffer.write(string, this.offset);
      this.offset += len;
      return this;
    }
    add(otherBuffer) {
      this.ensure(otherBuffer.length);
      otherBuffer.copy(this.buffer, this.offset);
      this.offset += otherBuffer.length;
      return this;
    }
    join(code) {
      if (code) {
        this.buffer[this.headerPosition] = code;
        const length = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(length, this.headerPosition + 1);
      }
      return this.buffer.slice(code ? 0 : 5, this.offset);
    }
    flush(code) {
      var result = this.join(code);
      this.offset = 5;
      this.headerPosition = 0;
      this.buffer = Buffer.allocUnsafe(this.size);
      return result;
    }
  }
  exports.Writer = Writer;
});

// node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.serialize = undefined;
  var buffer_writer_1 = require_buffer_writer();
  var writer = new buffer_writer_1.Writer;
  var startup = (opts) => {
    writer.addInt16(3).addInt16(0);
    for (const key of Object.keys(opts)) {
      writer.addCString(key).addCString(opts[key]);
    }
    writer.addCString("client_encoding").addCString("UTF8");
    var bodyBuffer = writer.addCString("").flush();
    var length = bodyBuffer.length + 4;
    return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
  };
  var requestSsl = () => {
    const response = Buffer.allocUnsafe(8);
    response.writeInt32BE(8, 0);
    response.writeInt32BE(80877103, 4);
    return response;
  };
  var password = (password2) => {
    return writer.addCString(password2).flush(112);
  };
  var sendSASLInitialResponseMessage = function(mechanism, initialResponse) {
    writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
    return writer.flush(112);
  };
  var sendSCRAMClientFinalMessage = function(additionalData) {
    return writer.addString(additionalData).flush(112);
  };
  var query = (text) => {
    return writer.addCString(text).flush(81);
  };
  var emptyArray = [];
  var parse = (query2) => {
    const name = query2.name || "";
    if (name.length > 63) {
      console.error("Warning! Postgres only supports 63 characters for query names.");
      console.error("You supplied %s (%s)", name, name.length);
      console.error("This can cause conflicts and silent errors executing queries");
    }
    const types = query2.types || emptyArray;
    var len = types.length;
    var buffer = writer.addCString(name).addCString(query2.text).addInt16(len);
    for (var i = 0;i < len; i++) {
      buffer.addInt32(types[i]);
    }
    return writer.flush(80);
  };
  var paramWriter = new buffer_writer_1.Writer;
  var writeValues = function(values, valueMapper) {
    for (let i = 0;i < values.length; i++) {
      const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
      if (mappedVal == null) {
        writer.addInt16(0);
        paramWriter.addInt32(-1);
      } else if (mappedVal instanceof Buffer) {
        writer.addInt16(1);
        paramWriter.addInt32(mappedVal.length);
        paramWriter.add(mappedVal);
      } else {
        writer.addInt16(0);
        paramWriter.addInt32(Buffer.byteLength(mappedVal));
        paramWriter.addString(mappedVal);
      }
    }
  };
  var bind = (config = {}) => {
    const portal = config.portal || "";
    const statement = config.statement || "";
    const binary = config.binary || false;
    const values = config.values || emptyArray;
    const len = values.length;
    writer.addCString(portal).addCString(statement);
    writer.addInt16(len);
    writeValues(values, config.valueMapper);
    writer.addInt16(len);
    writer.add(paramWriter.flush());
    writer.addInt16(binary ? 1 : 0);
    return writer.flush(66);
  };
  var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
  var execute = (config) => {
    if (!config || !config.portal && !config.rows) {
      return emptyExecute;
    }
    const portal = config.portal || "";
    const rows = config.rows || 0;
    const portalLength = Buffer.byteLength(portal);
    const len = 4 + portalLength + 1 + 4;
    const buff = Buffer.allocUnsafe(1 + len);
    buff[0] = 69;
    buff.writeInt32BE(len, 1);
    buff.write(portal, 5, "utf-8");
    buff[portalLength + 5] = 0;
    buff.writeUInt32BE(rows, buff.length - 4);
    return buff;
  };
  var cancel = (processID, secretKey) => {
    const buffer = Buffer.allocUnsafe(16);
    buffer.writeInt32BE(16, 0);
    buffer.writeInt16BE(1234, 4);
    buffer.writeInt16BE(5678, 6);
    buffer.writeInt32BE(processID, 8);
    buffer.writeInt32BE(secretKey, 12);
    return buffer;
  };
  var cstringMessage = (code, string) => {
    const stringLen = Buffer.byteLength(string);
    const len = 4 + stringLen + 1;
    const buffer = Buffer.allocUnsafe(1 + len);
    buffer[0] = code;
    buffer.writeInt32BE(len, 1);
    buffer.write(string, 5, "utf-8");
    buffer[len] = 0;
    return buffer;
  };
  var emptyDescribePortal = writer.addCString("P").flush(68);
  var emptyDescribeStatement = writer.addCString("S").flush(68);
  var describe = (msg) => {
    return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
  };
  var close = (msg) => {
    const text = `${msg.type}${msg.name || ""}`;
    return cstringMessage(67, text);
  };
  var copyData = (chunk) => {
    return writer.add(chunk).flush(100);
  };
  var copyFail = (message) => {
    return cstringMessage(102, message);
  };
  var codeOnlyBuffer = (code) => Buffer.from([code, 0, 0, 0, 4]);
  var flushBuffer = codeOnlyBuffer(72);
  var syncBuffer = codeOnlyBuffer(83);
  var endBuffer = codeOnlyBuffer(88);
  var copyDoneBuffer = codeOnlyBuffer(99);
  var serialize = {
    startup,
    password,
    requestSsl,
    sendSASLInitialResponseMessage,
    sendSCRAMClientFinalMessage,
    query,
    parse,
    bind,
    execute,
    describe,
    close,
    flush: () => flushBuffer,
    sync: () => syncBuffer,
    end: () => endBuffer,
    copyData,
    copyDone: () => copyDoneBuffer,
    copyFail,
    cancel
  };
  exports.serialize = serialize;
});

// node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.BufferReader = undefined;
  var emptyBuffer = Buffer.allocUnsafe(0);

  class BufferReader {
    constructor(offset = 0) {
      this.offset = offset;
      this.buffer = emptyBuffer;
      this.encoding = "utf-8";
    }
    setBuffer(offset, buffer) {
      this.offset = offset;
      this.buffer = buffer;
    }
    int16() {
      const result = this.buffer.readInt16BE(this.offset);
      this.offset += 2;
      return result;
    }
    byte() {
      const result = this.buffer[this.offset];
      this.offset++;
      return result;
    }
    int32() {
      const result = this.buffer.readInt32BE(this.offset);
      this.offset += 4;
      return result;
    }
    string(length) {
      const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
    cstring() {
      const start = this.offset;
      let end = start;
      while (this.buffer[end++] !== 0) {
      }
      this.offset = end;
      return this.buffer.toString(this.encoding, start, end - 1);
    }
    bytes(length) {
      const result = this.buffer.slice(this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
  }
  exports.BufferReader = BufferReader;
});

// node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Parser = undefined;
  var messages_1 = require_messages();
  var buffer_reader_1 = require_buffer_reader();
  var assert_1 = __importDefault(import.meta.require("assert"));
  var CODE_LENGTH = 1;
  var LEN_LENGTH = 4;
  var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
  var emptyBuffer = Buffer.allocUnsafe(0);

  class Parser {
    constructor(opts) {
      this.buffer = emptyBuffer;
      this.bufferLength = 0;
      this.bufferOffset = 0;
      this.reader = new buffer_reader_1.BufferReader;
      if ((opts === null || opts === undefined ? undefined : opts.mode) === "binary") {
        throw new Error("Binary mode not supported yet");
      }
      this.mode = (opts === null || opts === undefined ? undefined : opts.mode) || "text";
    }
    parse(buffer, callback) {
      this.mergeBuffer(buffer);
      const bufferFullLength = this.bufferOffset + this.bufferLength;
      let offset = this.bufferOffset;
      while (offset + HEADER_LENGTH <= bufferFullLength) {
        const code = this.buffer[offset];
        const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
        const fullMessageLength = CODE_LENGTH + length;
        if (fullMessageLength + offset <= bufferFullLength) {
          const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
          callback(message);
          offset += fullMessageLength;
        } else {
          break;
        }
      }
      if (offset === bufferFullLength) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
      } else {
        this.bufferLength = bufferFullLength - offset;
        this.bufferOffset = offset;
      }
    }
    mergeBuffer(buffer) {
      if (this.bufferLength > 0) {
        const newLength = this.bufferLength + buffer.byteLength;
        const newFullLength = newLength + this.bufferOffset;
        if (newFullLength > this.buffer.byteLength) {
          let newBuffer;
          if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
            newBuffer = this.buffer;
          } else {
            let newBufferLength = this.buffer.byteLength * 2;
            while (newLength >= newBufferLength) {
              newBufferLength *= 2;
            }
            newBuffer = Buffer.allocUnsafe(newBufferLength);
          }
          this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
          this.buffer = newBuffer;
          this.bufferOffset = 0;
        }
        buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
        this.bufferLength = newLength;
      } else {
        this.buffer = buffer;
        this.bufferOffset = 0;
        this.bufferLength = buffer.byteLength;
      }
    }
    handlePacket(offset, code, length, bytes) {
      switch (code) {
        case 50:
          return messages_1.bindComplete;
        case 49:
          return messages_1.parseComplete;
        case 51:
          return messages_1.closeComplete;
        case 110:
          return messages_1.noData;
        case 115:
          return messages_1.portalSuspended;
        case 99:
          return messages_1.copyDone;
        case 87:
          return messages_1.replicationStart;
        case 73:
          return messages_1.emptyQuery;
        case 68:
          return this.parseDataRowMessage(offset, length, bytes);
        case 67:
          return this.parseCommandCompleteMessage(offset, length, bytes);
        case 90:
          return this.parseReadyForQueryMessage(offset, length, bytes);
        case 65:
          return this.parseNotificationMessage(offset, length, bytes);
        case 82:
          return this.parseAuthenticationResponse(offset, length, bytes);
        case 83:
          return this.parseParameterStatusMessage(offset, length, bytes);
        case 75:
          return this.parseBackendKeyData(offset, length, bytes);
        case 69:
          return this.parseErrorMessage(offset, length, bytes, "error");
        case 78:
          return this.parseErrorMessage(offset, length, bytes, "notice");
        case 84:
          return this.parseRowDescriptionMessage(offset, length, bytes);
        case 116:
          return this.parseParameterDescriptionMessage(offset, length, bytes);
        case 71:
          return this.parseCopyInMessage(offset, length, bytes);
        case 72:
          return this.parseCopyOutMessage(offset, length, bytes);
        case 100:
          return this.parseCopyData(offset, length, bytes);
        default:
          assert_1.default.fail(`unknown message code: ${code.toString(16)}`);
      }
    }
    parseReadyForQueryMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const status = this.reader.string(1);
      return new messages_1.ReadyForQueryMessage(length, status);
    }
    parseCommandCompleteMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const text = this.reader.cstring();
      return new messages_1.CommandCompleteMessage(length, text);
    }
    parseCopyData(offset, length, bytes) {
      const chunk = bytes.slice(offset, offset + (length - 4));
      return new messages_1.CopyDataMessage(length, chunk);
    }
    parseCopyInMessage(offset, length, bytes) {
      return this.parseCopyMessage(offset, length, bytes, "copyInResponse");
    }
    parseCopyOutMessage(offset, length, bytes) {
      return this.parseCopyMessage(offset, length, bytes, "copyOutResponse");
    }
    parseCopyMessage(offset, length, bytes, messageName) {
      this.reader.setBuffer(offset, bytes);
      const isBinary = this.reader.byte() !== 0;
      const columnCount = this.reader.int16();
      const message = new messages_1.CopyResponse(length, messageName, isBinary, columnCount);
      for (let i = 0;i < columnCount; i++) {
        message.columnTypes[i] = this.reader.int16();
      }
      return message;
    }
    parseNotificationMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const processId = this.reader.int32();
      const channel = this.reader.cstring();
      const payload = this.reader.cstring();
      return new messages_1.NotificationResponseMessage(length, processId, channel, payload);
    }
    parseRowDescriptionMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const fieldCount = this.reader.int16();
      const message = new messages_1.RowDescriptionMessage(length, fieldCount);
      for (let i = 0;i < fieldCount; i++) {
        message.fields[i] = this.parseField();
      }
      return message;
    }
    parseField() {
      const name = this.reader.cstring();
      const tableID = this.reader.int32();
      const columnID = this.reader.int16();
      const dataTypeID = this.reader.int32();
      const dataTypeSize = this.reader.int16();
      const dataTypeModifier = this.reader.int32();
      const mode = this.reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }
    parseParameterDescriptionMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const parameterCount = this.reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(length, parameterCount);
      for (let i = 0;i < parameterCount; i++) {
        message.dataTypeIDs[i] = this.reader.int32();
      }
      return message;
    }
    parseDataRowMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const fieldCount = this.reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0;i < fieldCount; i++) {
        const len = this.reader.int32();
        fields[i] = len === -1 ? null : this.reader.string(len);
      }
      return new messages_1.DataRowMessage(length, fields);
    }
    parseParameterStatusMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const name = this.reader.cstring();
      const value = this.reader.cstring();
      return new messages_1.ParameterStatusMessage(length, name, value);
    }
    parseBackendKeyData(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const processID = this.reader.int32();
      const secretKey = this.reader.int32();
      return new messages_1.BackendKeyDataMessage(length, processID, secretKey);
    }
    parseAuthenticationResponse(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const code = this.reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = this.reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(length, salt);
          }
          break;
        case 10:
          message.name = "authenticationSASL";
          message.mechanisms = [];
          let mechanism;
          do {
            mechanism = this.reader.cstring();
            if (mechanism) {
              message.mechanisms.push(mechanism);
            }
          } while (mechanism);
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = this.reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = this.reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }
    parseErrorMessage(offset, length, bytes, name) {
      this.reader.setBuffer(offset, bytes);
      const fields = {};
      let fieldType = this.reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = this.reader.cstring();
        fieldType = this.reader.string(1);
      }
      const messageValue = fields.M;
      const message = name === "notice" ? new messages_1.NoticeMessage(length, messageValue) : new messages_1.DatabaseError(messageValue, length, name);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }
  }
  exports.Parser = Parser;
});

// node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS((exports) => {
  var parse = function(stream, callback) {
    const parser = new parser_1.Parser;
    stream.on("data", (buffer) => parser.parse(buffer, callback));
    return new Promise((resolve) => stream.on("end", () => resolve()));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DatabaseError = exports.serialize = exports.parse = undefined;
  var messages_1 = require_messages();
  Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: function() {
    return messages_1.DatabaseError;
  } });
  var serializer_1 = require_serializer();
  Object.defineProperty(exports, "serialize", { enumerable: true, get: function() {
    return serializer_1.serialize;
  } });
  var parser_1 = require_parser();
  exports.parse = parse;
});

// node_modules/pg-cloudflare/dist/empty.js
var exports_empty = {};
__export(exports_empty, {
  default: () => {
    {
      return empty_default;
    }
  }
});
var empty_default;
var init_empty = __esm(() => {
  empty_default = {};
});

// node_modules/pg/lib/stream.js
var require_stream = __commonJS((exports, module) => {
  exports.getStream = function getStream(ssl) {
    const net = import.meta.require("net");
    if (typeof net.Socket === "function") {
      return new net.Socket;
    } else {
      const { CloudflareSocket } = (init_empty(), __toCommonJS(exports_empty));
      return new CloudflareSocket(ssl);
    }
  };
  exports.getSecureStream = function getSecureStream(options) {
    var tls = import.meta.require("tls");
    if (tls.connect) {
      return tls.connect(options);
    } else {
      options.socket.startTls(options);
      return options.socket;
    }
  };
});

// node_modules/pg/lib/connection.js
var require_connection = __commonJS((exports, module) => {
  var net = import.meta.require("net");
  var EventEmitter = import.meta.require("events").EventEmitter;
  var { parse, serialize } = require_dist();
  var { getStream, getSecureStream } = require_stream();
  var flushBuffer = serialize.flush();
  var syncBuffer = serialize.sync();
  var endBuffer = serialize.end();

  class Connection extends EventEmitter {
    constructor(config) {
      super();
      config = config || {};
      this.stream = config.stream || getStream(config.ssl);
      if (typeof this.stream === "function") {
        this.stream = this.stream(config);
      }
      this._keepAlive = config.keepAlive;
      this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
      this.lastBuffer = false;
      this.parsedStatements = {};
      this.ssl = config.ssl || false;
      this._ending = false;
      this._emitMessage = false;
      var self = this;
      this.on("newListener", function(eventName) {
        if (eventName === "message") {
          self._emitMessage = true;
        }
      });
    }
    connect(port, host) {
      var self = this;
      this._connecting = true;
      this.stream.setNoDelay(true);
      this.stream.connect(port, host);
      this.stream.once("connect", function() {
        if (self._keepAlive) {
          self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
        }
        self.emit("connect");
      });
      const reportStreamError = function(error) {
        if (self._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
          return;
        }
        self.emit("error", error);
      };
      this.stream.on("error", reportStreamError);
      this.stream.on("close", function() {
        self.emit("end");
      });
      if (!this.ssl) {
        return this.attachListeners(this.stream);
      }
      this.stream.once("data", function(buffer) {
        var responseCode = buffer.toString("utf8");
        switch (responseCode) {
          case "S":
            break;
          case "N":
            self.stream.end();
            return self.emit("error", new Error("The server does not support SSL connections"));
          default:
            self.stream.end();
            return self.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        const options = {
          socket: self.stream
        };
        if (self.ssl !== true) {
          Object.assign(options, self.ssl);
          if ("key" in self.ssl) {
            options.key = self.ssl.key;
          }
        }
        var net2 = import.meta.require("net");
        if (net2.isIP && net2.isIP(host) === 0) {
          options.servername = host;
        }
        try {
          self.stream = getSecureStream(options);
        } catch (err) {
          return self.emit("error", err);
        }
        self.attachListeners(self.stream);
        self.stream.on("error", reportStreamError);
        self.emit("sslconnect");
      });
    }
    attachListeners(stream) {
      parse(stream, (msg) => {
        var eventName = msg.name === "error" ? "errorMessage" : msg.name;
        if (this._emitMessage) {
          this.emit("message", msg);
        }
        this.emit(eventName, msg);
      });
    }
    requestSsl() {
      this.stream.write(serialize.requestSsl());
    }
    startup(config) {
      this.stream.write(serialize.startup(config));
    }
    cancel(processID, secretKey) {
      this._send(serialize.cancel(processID, secretKey));
    }
    password(password) {
      this._send(serialize.password(password));
    }
    sendSASLInitialResponseMessage(mechanism, initialResponse) {
      this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
    }
    sendSCRAMClientFinalMessage(additionalData) {
      this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
    }
    _send(buffer) {
      if (!this.stream.writable) {
        return false;
      }
      return this.stream.write(buffer);
    }
    query(text) {
      this._send(serialize.query(text));
    }
    parse(query) {
      this._send(serialize.parse(query));
    }
    bind(config) {
      this._send(serialize.bind(config));
    }
    execute(config) {
      this._send(serialize.execute(config));
    }
    flush() {
      if (this.stream.writable) {
        this.stream.write(flushBuffer);
      }
    }
    sync() {
      this._ending = true;
      this._send(syncBuffer);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      this._ending = true;
      if (!this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(endBuffer, () => {
        this.stream.end();
      });
    }
    close(msg) {
      this._send(serialize.close(msg));
    }
    describe(msg) {
      this._send(serialize.describe(msg));
    }
    sendCopyFromChunk(chunk) {
      this._send(serialize.copyData(chunk));
    }
    endCopyFrom() {
      this._send(serialize.copyDone());
    }
    sendCopyFail(msg) {
      this._send(serialize.copyFail(msg));
    }
  }
  module.exports = Connection;
});

// node_modules/split2/index.js
var require_split2 = __commonJS((exports, module) => {
  var transform = function(chunk, enc, cb) {
    let list;
    if (this.overflow) {
      const buf = this[kDecoder].write(chunk);
      list = buf.split(this.matcher);
      if (list.length === 1)
        return cb();
      list.shift();
      this.overflow = false;
    } else {
      this[kLast] += this[kDecoder].write(chunk);
      list = this[kLast].split(this.matcher);
    }
    this[kLast] = list.pop();
    for (let i = 0;i < list.length; i++) {
      try {
        push(this, this.mapper(list[i]));
      } catch (error) {
        return cb(error);
      }
    }
    this.overflow = this[kLast].length > this.maxLength;
    if (this.overflow && !this.skipOverflow) {
      cb(new Error("maximum buffer reached"));
      return;
    }
    cb();
  };
  var flush = function(cb) {
    this[kLast] += this[kDecoder].end();
    if (this[kLast]) {
      try {
        push(this, this.mapper(this[kLast]));
      } catch (error) {
        return cb(error);
      }
    }
    cb();
  };
  var push = function(self, val) {
    if (val !== undefined) {
      self.push(val);
    }
  };
  var noop = function(incoming) {
    return incoming;
  };
  var split = function(matcher, mapper, options) {
    matcher = matcher || /\r?\n/;
    mapper = mapper || noop;
    options = options || {};
    switch (arguments.length) {
      case 1:
        if (typeof matcher === "function") {
          mapper = matcher;
          matcher = /\r?\n/;
        } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
          options = matcher;
          matcher = /\r?\n/;
        }
        break;
      case 2:
        if (typeof matcher === "function") {
          options = mapper;
          mapper = matcher;
          matcher = /\r?\n/;
        } else if (typeof mapper === "object") {
          options = mapper;
          mapper = noop;
        }
    }
    options = Object.assign({}, options);
    options.autoDestroy = true;
    options.transform = transform;
    options.flush = flush;
    options.readableObjectMode = true;
    const stream = new Transform(options);
    stream[kLast] = "";
    stream[kDecoder] = new StringDecoder("utf8");
    stream.matcher = matcher;
    stream.mapper = mapper;
    stream.maxLength = options.maxLength;
    stream.skipOverflow = options.skipOverflow || false;
    stream.overflow = false;
    stream._destroy = function(err, cb) {
      this._writableState.errorEmitted = false;
      cb(err);
    };
    return stream;
  };
  var { Transform } = import.meta.require("stream");
  var { StringDecoder } = import.meta.require("string_decoder");
  var kLast = Symbol("last");
  var kDecoder = Symbol("decoder");
  module.exports = split;
});

// node_modules/pgpass/lib/helper.js
var require_helper = __commonJS((exports, module) => {
  var isRegFile = function(mode) {
    return (mode & S_IFMT) == S_IFREG;
  };
  var warn = function() {
    var isWritable = warnStream instanceof Stream && warnStream.writable === true;
    if (isWritable) {
      var args = Array.prototype.slice.call(arguments).concat("\n");
      warnStream.write(util.format.apply(util, args));
    }
  };
  var path = import.meta.require("path");
  var Stream = import.meta.require("stream").Stream;
  var split = require_split2();
  var util = import.meta.require("util");
  var defaultPort = 5432;
  var isWin = process.platform === "win32";
  var warnStream = process.stderr;
  var S_IRWXG = 56;
  var S_IRWXO = 7;
  var S_IFMT = 61440;
  var S_IFREG = 32768;
  var fieldNames = ["host", "port", "database", "user", "password"];
  var nrOfFields = fieldNames.length;
  var passKey = fieldNames[nrOfFields - 1];
  Object.defineProperty(exports, "isWin", {
    get: function() {
      return isWin;
    },
    set: function(val) {
      isWin = val;
    }
  });
  exports.warnTo = function(stream) {
    var old = warnStream;
    warnStream = stream;
    return old;
  };
  exports.getFileName = function(rawEnv) {
    var env = rawEnv || process.env;
    var file = env.PGPASSFILE || (isWin ? path.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env.HOME || "./", ".pgpass"));
    return file;
  };
  exports.usePgPass = function(stats, fname) {
    if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
      return false;
    }
    if (isWin) {
      return true;
    }
    fname = fname || "<unkn>";
    if (!isRegFile(stats.mode)) {
      warn('WARNING: password file "%s" is not a plain file', fname);
      return false;
    }
    if (stats.mode & (S_IRWXG | S_IRWXO)) {
      warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
      return false;
    }
    return true;
  };
  var matcher = exports.match = function(connInfo, entry) {
    return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
      if (idx == 1) {
        if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
          return prev && true;
        }
      }
      return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
    }, true);
  };
  exports.getPassword = function(connInfo, stream, cb) {
    var pass;
    var lineStream = stream.pipe(split());
    function onLine(line) {
      var entry = parseLine(line);
      if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
        pass = entry[passKey];
        lineStream.end();
      }
    }
    var onEnd = function() {
      stream.destroy();
      cb(pass);
    };
    var onErr = function(err) {
      stream.destroy();
      warn("WARNING: error on reading file: %s", err);
      cb(undefined);
    };
    stream.on("error", onErr);
    lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
  };
  var parseLine = exports.parseLine = function(line) {
    if (line.length < 11 || line.match(/^\s+#/)) {
      return null;
    }
    var curChar = "";
    var prevChar = "";
    var fieldIdx = 0;
    var startIdx = 0;
    var endIdx = 0;
    var obj = {};
    var isLastField = false;
    var addToObj = function(idx, i02, i1) {
      var field = line.substring(i02, i1);
      if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
        field = field.replace(/\\([:\\])/g, "$1");
      }
      obj[fieldNames[idx]] = field;
    };
    for (var i = 0;i < line.length - 1; i += 1) {
      curChar = line.charAt(i + 1);
      prevChar = line.charAt(i);
      isLastField = fieldIdx == nrOfFields - 1;
      if (isLastField) {
        addToObj(fieldIdx, startIdx);
        break;
      }
      if (i >= 0 && curChar == ":" && prevChar !== "\\") {
        addToObj(fieldIdx, startIdx, i + 1);
        startIdx = i + 2;
        fieldIdx += 1;
      }
    }
    obj = Object.keys(obj).length === nrOfFields ? obj : null;
    return obj;
  };
  var isValidEntry = exports.isValidEntry = function(entry) {
    var rules = {
      0: function(x) {
        return x.length > 0;
      },
      1: function(x) {
        if (x === "*") {
          return true;
        }
        x = Number(x);
        return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
      },
      2: function(x) {
        return x.length > 0;
      },
      3: function(x) {
        return x.length > 0;
      },
      4: function(x) {
        return x.length > 0;
      }
    };
    for (var idx = 0;idx < fieldNames.length; idx += 1) {
      var rule = rules[idx];
      var value = entry[fieldNames[idx]] || "";
      var res = rule(value);
      if (!res) {
        return false;
      }
    }
    return true;
  };
});

// node_modules/pgpass/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var path = import.meta.require("path");
  var fs = import.meta.require("fs");
  var helper = require_helper();
  module.exports = function(connInfo, cb) {
    var file = helper.getFileName();
    fs.stat(file, function(err, stat) {
      if (err || !helper.usePgPass(stat, file)) {
        return cb(undefined);
      }
      var st = fs.createReadStream(file);
      helper.getPassword(connInfo, st, cb);
    });
  };
  module.exports.warnTo = helper.warnTo;
});

// node_modules/pg/lib/client.js
var require_client = __commonJS((exports, module) => {
  var EventEmitter = import.meta.require("events").EventEmitter;
  var utils = require_utils();
  var sasl = require_sasl();
  var TypeOverrides = require_type_overrides();
  var ConnectionParameters = require_connection_parameters();
  var Query = require_query();
  var defaults = require_defaults();
  var Connection = require_connection();
  var crypto = require_utils2();

  class Client extends EventEmitter {
    constructor(config) {
      super();
      this.connectionParameters = new ConnectionParameters(config);
      this.user = this.connectionParameters.user;
      this.database = this.connectionParameters.database;
      this.port = this.connectionParameters.port;
      this.host = this.connectionParameters.host;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: this.connectionParameters.password
      });
      this.replication = this.connectionParameters.replication;
      var c = config || {};
      this._Promise = c.Promise || global.Promise;
      this._types = new TypeOverrides(c.types);
      this._ending = false;
      this._ended = false;
      this._connecting = false;
      this._connected = false;
      this._connectionError = false;
      this._queryable = true;
      this.connection = c.connection || new Connection({
        stream: c.stream,
        ssl: this.connectionParameters.ssl,
        keepAlive: c.keepAlive || false,
        keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
        encoding: this.connectionParameters.client_encoding || "utf8"
      });
      this.queryQueue = [];
      this.binary = c.binary || defaults.binary;
      this.processID = null;
      this.secretKey = null;
      this.ssl = this.connectionParameters.ssl || false;
      if (this.ssl && this.ssl.key) {
        Object.defineProperty(this.ssl, "key", {
          enumerable: false
        });
      }
      this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(err) {
      const enqueueError = (query) => {
        process.nextTick(() => {
          query.handleError(err, this.connection);
        });
      };
      if (this.activeQuery) {
        enqueueError(this.activeQuery);
        this.activeQuery = null;
      }
      this.queryQueue.forEach(enqueueError);
      this.queryQueue.length = 0;
    }
    _connect(callback) {
      var self = this;
      var con = this.connection;
      this._connectionCallback = callback;
      if (this._connecting || this._connected) {
        const err = new Error("Client has already been connected. You cannot reuse a client.");
        process.nextTick(() => {
          callback(err);
        });
        return;
      }
      this._connecting = true;
      this.connectionTimeoutHandle;
      if (this._connectionTimeoutMillis > 0) {
        this.connectionTimeoutHandle = setTimeout(() => {
          con._ending = true;
          con.stream.destroy(new Error("timeout expired"));
        }, this._connectionTimeoutMillis);
      }
      if (this.host && this.host.indexOf("/") === 0) {
        con.connect(this.host + "/.s.PGSQL." + this.port);
      } else {
        con.connect(this.port, this.host);
      }
      con.on("connect", function() {
        if (self.ssl) {
          con.requestSsl();
        } else {
          con.startup(self.getStartupConf());
        }
      });
      con.on("sslconnect", function() {
        con.startup(self.getStartupConf());
      });
      this._attachListeners(con);
      con.once("end", () => {
        const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle);
        this._errorAllQueries(error);
        this._ended = true;
        if (!this._ending) {
          if (this._connecting && !this._connectionError) {
            if (this._connectionCallback) {
              this._connectionCallback(error);
            } else {
              this._handleErrorEvent(error);
            }
          } else if (!this._connectionError) {
            this._handleErrorEvent(error);
          }
        }
        process.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
    _attachListeners(con) {
      con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
      con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
      con.on("authenticationSASL", this._handleAuthSASL.bind(this));
      con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
      con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
      con.on("backendKeyData", this._handleBackendKeyData.bind(this));
      con.on("error", this._handleErrorEvent.bind(this));
      con.on("errorMessage", this._handleErrorMessage.bind(this));
      con.on("readyForQuery", this._handleReadyForQuery.bind(this));
      con.on("notice", this._handleNotice.bind(this));
      con.on("rowDescription", this._handleRowDescription.bind(this));
      con.on("dataRow", this._handleDataRow.bind(this));
      con.on("portalSuspended", this._handlePortalSuspended.bind(this));
      con.on("emptyQuery", this._handleEmptyQuery.bind(this));
      con.on("commandComplete", this._handleCommandComplete.bind(this));
      con.on("parseComplete", this._handleParseComplete.bind(this));
      con.on("copyInResponse", this._handleCopyInResponse.bind(this));
      con.on("copyData", this._handleCopyData.bind(this));
      con.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(cb) {
      const con = this.connection;
      if (typeof this.password === "function") {
        this._Promise.resolve().then(() => this.password()).then((pass) => {
          if (pass !== undefined) {
            if (typeof pass !== "string") {
              con.emit("error", new TypeError("Password must be a string"));
              return;
            }
            this.connectionParameters.password = this.password = pass;
          } else {
            this.connectionParameters.password = this.password = null;
          }
          cb();
        }).catch((err) => {
          con.emit("error", err);
        });
      } else if (this.password !== null) {
        cb();
      } else {
        try {
          const pgPass = require_lib();
          pgPass(this.connectionParameters, (pass) => {
            if (pass !== undefined) {
              this.connectionParameters.password = this.password = pass;
            }
            cb();
          });
        } catch (e2) {
          this.emit("error", e2);
        }
      }
    }
    _handleAuthCleartextPassword(msg) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(msg) {
      this._checkPgPass(async () => {
        try {
          const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
          this.connection.password(hashedPassword);
        } catch (e2) {
          this.emit("error", e2);
        }
      });
    }
    _handleAuthSASL(msg) {
      this._checkPgPass(() => {
        try {
          this.saslSession = sasl.startSession(msg.mechanisms);
          this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      });
    }
    async _handleAuthSASLContinue(msg) {
      try {
        await sasl.continueSession(this.saslSession, this.password, msg.data);
        this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
      } catch (err) {
        this.connection.emit("error", err);
      }
    }
    _handleAuthSASLFinal(msg) {
      try {
        sasl.finalizeSession(this.saslSession, msg.data);
        this.saslSession = null;
      } catch (err) {
        this.connection.emit("error", err);
      }
    }
    _handleBackendKeyData(msg) {
      this.processID = msg.processID;
      this.secretKey = msg.secretKey;
    }
    _handleReadyForQuery(msg) {
      if (this._connecting) {
        this._connecting = false;
        this._connected = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          this._connectionCallback(null, this);
          this._connectionCallback = null;
        }
        this.emit("connect");
      }
      const { activeQuery } = this;
      this.activeQuery = null;
      this.readyForQuery = true;
      if (activeQuery) {
        activeQuery.handleReadyForQuery(this.connection);
      }
      this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(err) {
      if (this._connectionError) {
        return;
      }
      this._connectionError = true;
      clearTimeout(this.connectionTimeoutHandle);
      if (this._connectionCallback) {
        return this._connectionCallback(err);
      }
      this.emit("error", err);
    }
    _handleErrorEvent(err) {
      if (this._connecting) {
        return this._handleErrorWhileConnecting(err);
      }
      this._queryable = false;
      this._errorAllQueries(err);
      this.emit("error", err);
    }
    _handleErrorMessage(msg) {
      if (this._connecting) {
        return this._handleErrorWhileConnecting(msg);
      }
      const activeQuery = this.activeQuery;
      if (!activeQuery) {
        this._handleErrorEvent(msg);
        return;
      }
      this.activeQuery = null;
      activeQuery.handleError(msg, this.connection);
    }
    _handleRowDescription(msg) {
      this.activeQuery.handleRowDescription(msg);
    }
    _handleDataRow(msg) {
      this.activeQuery.handleDataRow(msg);
    }
    _handlePortalSuspended(msg) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(msg) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(msg) {
      this.activeQuery.handleCommandComplete(msg, this.connection);
    }
    _handleParseComplete(msg) {
      if (this.activeQuery.name) {
        this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text;
      }
    }
    _handleCopyInResponse(msg) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(msg) {
      this.activeQuery.handleCopyData(msg, this.connection);
    }
    _handleNotification(msg) {
      this.emit("notification", msg);
    }
    _handleNotice(msg) {
      this.emit("notice", msg);
    }
    getStartupConf() {
      var params = this.connectionParameters;
      var data = {
        user: params.user,
        database: params.database
      };
      var appName = params.application_name || params.fallback_application_name;
      if (appName) {
        data.application_name = appName;
      }
      if (params.replication) {
        data.replication = "" + params.replication;
      }
      if (params.statement_timeout) {
        data.statement_timeout = String(parseInt(params.statement_timeout, 10));
      }
      if (params.lock_timeout) {
        data.lock_timeout = String(parseInt(params.lock_timeout, 10));
      }
      if (params.idle_in_transaction_session_timeout) {
        data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
      }
      if (params.options) {
        data.options = params.options;
      }
      return data;
    }
    cancel(client, query) {
      if (client.activeQuery === query) {
        var con = this.connection;
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          con.cancel(client.processID, client.secretKey);
        });
      } else if (client.queryQueue.indexOf(query) !== -1) {
        client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
      }
    }
    setTypeParser(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    }
    getTypeParser(oid, format) {
      return this._types.getTypeParser(oid, format);
    }
    escapeIdentifier(str) {
      return utils.escapeIdentifier(str);
    }
    escapeLiteral(str) {
      return utils.escapeLiteral(str);
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) {
        this.activeQuery = this.queryQueue.shift();
        if (this.activeQuery) {
          this.readyForQuery = false;
          this.hasExecuted = true;
          const queryError = this.activeQuery.submit(this.connection);
          if (queryError) {
            process.nextTick(() => {
              this.activeQuery.handleError(queryError, this.connection);
              this.readyForQuery = true;
              this._pulseQueryQueue();
            });
          }
        } else if (this.hasExecuted) {
          this.activeQuery = null;
          this.emit("drain");
        }
      }
    }
    query(config, values, callback) {
      var query;
      var result;
      var readTimeout;
      var readTimeoutTimer;
      var queryCallback;
      if (config === null || config === undefined) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query = config;
        if (typeof values === "function") {
          query.callback = query.callback || values;
        }
      } else {
        readTimeout = this.connectionParameters.query_timeout;
        query = new Query(config, values, callback);
        if (!query.callback) {
          result = new this._Promise((resolve, reject) => {
            query.callback = (err, res) => err ? reject(err) : resolve(res);
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
        }
      }
      if (readTimeout) {
        queryCallback = query.callback;
        readTimeoutTimer = setTimeout(() => {
          var error = new Error("Query read timeout");
          process.nextTick(() => {
            query.handleError(error, this.connection);
          });
          queryCallback(error);
          query.callback = () => {
          };
          var index = this.queryQueue.indexOf(query);
          if (index > -1) {
            this.queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (this.binary && !query.binary) {
        query.binary = true;
      }
      if (query._result && !query._result._types) {
        query._result._types = this._types;
      }
      if (!this._queryable) {
        process.nextTick(() => {
          query.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
        });
        return result;
      }
      if (this._ending) {
        process.nextTick(() => {
          query.handleError(new Error("Client was closed and is not queryable"), this.connection);
        });
        return result;
      }
      this.queryQueue.push(query);
      this._pulseQueryQueue();
      return result;
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(cb) {
      this._ending = true;
      if (!this.connection._connecting || this._ended) {
        if (cb) {
          cb();
        } else {
          return this._Promise.resolve();
        }
      }
      if (this.activeQuery || !this._queryable) {
        this.connection.stream.destroy();
      } else {
        this.connection.end();
      }
      if (cb) {
        this.connection.once("end", cb);
      } else {
        return new this._Promise((resolve) => {
          this.connection.once("end", resolve);
        });
      }
    }
  }
  Client.Query = Query;
  module.exports = Client;
});

// node_modules/pg-pool/index.js
var require_pg_pool = __commonJS((exports, module) => {
  var throwOnDoubleRelease = function() {
    throw new Error("Release called on client which has already been released to the pool.");
  };
  var promisify = function(Promise2, callback) {
    if (callback) {
      return { callback, result: undefined };
    }
    let rej;
    let res;
    const cb = function(err, client) {
      err ? rej(err) : res(client);
    };
    const result = new Promise2(function(resolve, reject) {
      res = resolve;
      rej = reject;
    }).catch((err) => {
      Error.captureStackTrace(err);
      throw err;
    });
    return { callback: cb, result };
  };
  var makeIdleListener = function(pool, client) {
    return function idleListener(err) {
      err.client = client;
      client.removeListener("error", idleListener);
      client.on("error", () => {
        pool.log("additional client error after disconnection due to error", err);
      });
      pool._remove(client);
      pool.emit("error", err, client);
    };
  };
  var EventEmitter = import.meta.require("events").EventEmitter;
  var NOOP = function() {
  };
  var removeWhere = (list, predicate) => {
    const i = list.findIndex(predicate);
    return i === -1 ? undefined : list.splice(i, 1)[0];
  };

  class IdleItem {
    constructor(client, idleListener, timeoutId) {
      this.client = client;
      this.idleListener = idleListener;
      this.timeoutId = timeoutId;
    }
  }

  class PendingItem {
    constructor(callback) {
      this.callback = callback;
    }
  }

  class Pool extends EventEmitter {
    constructor(options, Client) {
      super();
      this.options = Object.assign({}, options);
      if (options != null && ("password" in options)) {
        Object.defineProperty(this.options, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: options.password
        });
      }
      if (options != null && options.ssl && options.ssl.key) {
        Object.defineProperty(this.options.ssl, "key", {
          enumerable: false
        });
      }
      this.options.max = this.options.max || this.options.poolSize || 10;
      this.options.maxUses = this.options.maxUses || Infinity;
      this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
      this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
      this.log = this.options.log || function() {
      };
      this.Client = this.options.Client || Client || require_lib2().Client;
      this.Promise = this.options.Promise || global.Promise;
      if (typeof this.options.idleTimeoutMillis === "undefined") {
        this.options.idleTimeoutMillis = 1e4;
      }
      this._clients = [];
      this._idle = [];
      this._expired = new WeakSet;
      this._pendingQueue = [];
      this._endCallback = undefined;
      this.ending = false;
      this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _pulseQueue() {
      this.log("pulse queue");
      if (this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending");
        if (this._idle.length) {
          this._idle.slice().map((item) => {
            this._remove(item.client);
          });
        }
        if (!this._clients.length) {
          this.ended = true;
          this._endCallback();
        }
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) {
        return;
      }
      const pendingItem = this._pendingQueue.shift();
      if (this._idle.length) {
        const idleItem = this._idle.pop();
        clearTimeout(idleItem.timeoutId);
        const client = idleItem.client;
        client.ref && client.ref();
        const idleListener = idleItem.idleListener;
        return this._acquireClient(client, pendingItem, idleListener, false);
      }
      if (!this._isFull()) {
        return this.newClient(pendingItem);
      }
      throw new Error("unexpected condition");
    }
    _remove(client) {
      const removed = removeWhere(this._idle, (item) => item.client === client);
      if (removed !== undefined) {
        clearTimeout(removed.timeoutId);
      }
      this._clients = this._clients.filter((c) => c !== client);
      client.end();
      this.emit("remove", client);
    }
    connect(cb) {
      if (this.ending) {
        const err = new Error("Cannot use a pool after calling end on the pool");
        return cb ? cb(err) : this.Promise.reject(err);
      }
      const response = promisify(this.Promise, cb);
      const result = response.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length) {
          process.nextTick(() => this._pulseQueue());
        }
        if (!this.options.connectionTimeoutMillis) {
          this._pendingQueue.push(new PendingItem(response.callback));
          return result;
        }
        const queueCallback = (err, res, done) => {
          clearTimeout(tid);
          response.callback(err, res, done);
        };
        const pendingItem = new PendingItem(queueCallback);
        const tid = setTimeout(() => {
          removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
          pendingItem.timedOut = true;
          response.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        this._pendingQueue.push(pendingItem);
        return result;
      }
      this.newClient(new PendingItem(response.callback));
      return result;
    }
    newClient(pendingItem) {
      const client = new this.Client(this.options);
      this._clients.push(client);
      const idleListener = makeIdleListener(this, client);
      this.log("checking client timeout");
      let tid;
      let timeoutHit = false;
      if (this.options.connectionTimeoutMillis) {
        tid = setTimeout(() => {
          this.log("ending client due to timeout");
          timeoutHit = true;
          client.connection ? client.connection.stream.destroy() : client.end();
        }, this.options.connectionTimeoutMillis);
      }
      this.log("connecting new client");
      client.connect((err) => {
        if (tid) {
          clearTimeout(tid);
        }
        client.on("error", idleListener);
        if (err) {
          this.log("client failed to connect", err);
          this._clients = this._clients.filter((c) => c !== client);
          if (timeoutHit) {
            err.message = "Connection terminated due to connection timeout";
          }
          this._pulseQueue();
          if (!pendingItem.timedOut) {
            pendingItem.callback(err, undefined, NOOP);
          }
        } else {
          this.log("new client connected");
          if (this.options.maxLifetimeSeconds !== 0) {
            const maxLifetimeTimeout = setTimeout(() => {
              this.log("ending client due to expired lifetime");
              this._expired.add(client);
              const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
              if (idleIndex !== -1) {
                this._acquireClient(client, new PendingItem((err2, client2, clientRelease) => clientRelease()), idleListener, false);
              }
            }, this.options.maxLifetimeSeconds * 1000);
            maxLifetimeTimeout.unref();
            client.once("end", () => clearTimeout(maxLifetimeTimeout));
          }
          return this._acquireClient(client, pendingItem, idleListener, true);
        }
      });
    }
    _acquireClient(client, pendingItem, idleListener, isNew) {
      if (isNew) {
        this.emit("connect", client);
      }
      this.emit("acquire", client);
      client.release = this._releaseOnce(client, idleListener);
      client.removeListener("error", idleListener);
      if (!pendingItem.timedOut) {
        if (isNew && this.options.verify) {
          this.options.verify(client, (err) => {
            if (err) {
              client.release(err);
              return pendingItem.callback(err, undefined, NOOP);
            }
            pendingItem.callback(undefined, client, client.release);
          });
        } else {
          pendingItem.callback(undefined, client, client.release);
        }
      } else {
        if (isNew && this.options.verify) {
          this.options.verify(client, client.release);
        } else {
          client.release();
        }
      }
    }
    _releaseOnce(client, idleListener) {
      let released = false;
      return (err) => {
        if (released) {
          throwOnDoubleRelease();
        }
        released = true;
        this._release(client, idleListener, err);
      };
    }
    _release(client, idleListener, err) {
      client.on("error", idleListener);
      client._poolUseCount = (client._poolUseCount || 0) + 1;
      this.emit("release", err, client);
      if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
        if (client._poolUseCount >= this.options.maxUses) {
          this.log("remove expended client");
        }
        this._remove(client);
        this._pulseQueue();
        return;
      }
      const isExpired = this._expired.has(client);
      if (isExpired) {
        this.log("remove expired client");
        this._expired.delete(client);
        this._remove(client);
        this._pulseQueue();
        return;
      }
      let tid;
      if (this.options.idleTimeoutMillis) {
        tid = setTimeout(() => {
          this.log("remove idle client");
          this._remove(client);
        }, this.options.idleTimeoutMillis);
        if (this.options.allowExitOnIdle) {
          tid.unref();
        }
      }
      if (this.options.allowExitOnIdle) {
        client.unref();
      }
      this._idle.push(new IdleItem(client, idleListener, tid));
      this._pulseQueue();
    }
    query(text, values, cb) {
      if (typeof text === "function") {
        const response2 = promisify(this.Promise, text);
        setImmediate(function() {
          return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        });
        return response2.result;
      }
      if (typeof values === "function") {
        cb = values;
        values = undefined;
      }
      const response = promisify(this.Promise, cb);
      cb = response.callback;
      this.connect((err, client) => {
        if (err) {
          return cb(err);
        }
        let clientReleased = false;
        const onError = (err2) => {
          if (clientReleased) {
            return;
          }
          clientReleased = true;
          client.release(err2);
          cb(err2);
        };
        client.once("error", onError);
        this.log("dispatching query");
        try {
          client.query(text, values, (err2, res) => {
            this.log("query dispatched");
            client.removeListener("error", onError);
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            if (err2) {
              return cb(err2);
            }
            return cb(undefined, res);
          });
        } catch (err2) {
          client.release(err2);
          return cb(err2);
        }
      });
      return response.result;
    }
    end(cb) {
      this.log("ending");
      if (this.ending) {
        const err = new Error("Called end on pool more than once");
        return cb ? cb(err) : this.Promise.reject(err);
      }
      this.ending = true;
      const promised = promisify(this.Promise, cb);
      this._endCallback = promised.callback;
      this._pulseQueue();
      return promised.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  }
  module.exports = Pool;
});

// node_modules/pg/lib/native/query.js
var require_query2 = __commonJS((exports, module) => {
  var EventEmitter = import.meta.require("events").EventEmitter;
  var util = import.meta.require("util");
  var utils = require_utils();
  var NativeQuery = module.exports = function(config, values, callback) {
    EventEmitter.call(this);
    config = utils.normalizeQueryConfig(config, values, callback);
    this.text = config.text;
    this.values = config.values;
    this.name = config.name;
    this.callback = config.callback;
    this.state = "new";
    this._arrayMode = config.rowMode === "array";
    this._emitRowEvents = false;
    this.on("newListener", function(event) {
      if (event === "row")
        this._emitRowEvents = true;
    }.bind(this));
  };
  util.inherits(NativeQuery, EventEmitter);
  var errorFieldMap = {
    sqlState: "code",
    statementPosition: "position",
    messagePrimary: "message",
    context: "where",
    schemaName: "schema",
    tableName: "table",
    columnName: "column",
    dataTypeName: "dataType",
    constraintName: "constraint",
    sourceFile: "file",
    sourceLine: "line",
    sourceFunction: "routine"
  };
  NativeQuery.prototype.handleError = function(err) {
    var fields = this.native.pq.resultErrorFields();
    if (fields) {
      for (var key in fields) {
        var normalizedFieldName = errorFieldMap[key] || key;
        err[normalizedFieldName] = fields[key];
      }
    }
    if (this.callback) {
      this.callback(err);
    } else {
      this.emit("error", err);
    }
    this.state = "error";
  };
  NativeQuery.prototype.then = function(onSuccess, onFailure) {
    return this._getPromise().then(onSuccess, onFailure);
  };
  NativeQuery.prototype.catch = function(callback) {
    return this._getPromise().catch(callback);
  };
  NativeQuery.prototype._getPromise = function() {
    if (this._promise)
      return this._promise;
    this._promise = new Promise(function(resolve, reject) {
      this._once("end", resolve);
      this._once("error", reject);
    }.bind(this));
    return this._promise;
  };
  NativeQuery.prototype.submit = function(client) {
    this.state = "running";
    var self = this;
    this.native = client.native;
    client.native.arrayMode = this._arrayMode;
    var after = function(err, rows, results) {
      client.native.arrayMode = false;
      setImmediate(function() {
        self.emit("_done");
      });
      if (err) {
        return self.handleError(err);
      }
      if (self._emitRowEvents) {
        if (results.length > 1) {
          rows.forEach((rowOfRows, i) => {
            rowOfRows.forEach((row) => {
              self.emit("row", row, results[i]);
            });
          });
        } else {
          rows.forEach(function(row) {
            self.emit("row", row, results);
          });
        }
      }
      self.state = "end";
      self.emit("end", results);
      if (self.callback) {
        self.callback(null, results);
      }
    };
    if (process.domain) {
      after = process.domain.bind(after);
    }
    if (this.name) {
      if (this.name.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", this.name, this.name.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      var values = (this.values || []).map(utils.prepareValue);
      if (client.namedQueries[this.name]) {
        if (this.text && client.namedQueries[this.name] !== this.text) {
          const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return after(err);
        }
        return client.native.execute(this.name, values, after);
      }
      return client.native.prepare(this.name, this.text, values.length, function(err) {
        if (err)
          return after(err);
        client.namedQueries[self.name] = self.text;
        return self.native.execute(self.name, values, after);
      });
    } else if (this.values) {
      if (!Array.isArray(this.values)) {
        const err = new Error("Query values must be an array");
        return after(err);
      }
      var vals = this.values.map(utils.prepareValue);
      client.native.query(this.text, vals, after);
    } else {
      client.native.query(this.text, after);
    }
  };
});

// node_modules/pg/lib/native/client.js
var require_client2 = __commonJS((exports, module) => {
  var Native;
  try {
    Native = (()=>{ throw new Error(`Cannot require module "pg-native"`);})();
  } catch (e2) {
    throw e2;
  }
  var TypeOverrides = require_type_overrides();
  var EventEmitter = import.meta.require("events").EventEmitter;
  var util = import.meta.require("util");
  var ConnectionParameters = require_connection_parameters();
  var NativeQuery = require_query2();
  var Client = module.exports = function(config) {
    EventEmitter.call(this);
    config = config || {};
    this._Promise = config.Promise || global.Promise;
    this._types = new TypeOverrides(config.types);
    this.native = new Native({
      types: this._types
    });
    this._queryQueue = [];
    this._ending = false;
    this._connecting = false;
    this._connected = false;
    this._queryable = true;
    var cp = this.connectionParameters = new ConnectionParameters(config);
    if (config.nativeConnectionString)
      cp.nativeConnectionString = config.nativeConnectionString;
    this.user = cp.user;
    Object.defineProperty(this, "password", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: cp.password
    });
    this.database = cp.database;
    this.host = cp.host;
    this.port = cp.port;
    this.namedQueries = {};
  };
  Client.Query = NativeQuery;
  util.inherits(Client, EventEmitter);
  Client.prototype._errorAllQueries = function(err) {
    const enqueueError = (query) => {
      process.nextTick(() => {
        query.native = this.native;
        query.handleError(err);
      });
    };
    if (this._hasActiveQuery()) {
      enqueueError(this._activeQuery);
      this._activeQuery = null;
    }
    this._queryQueue.forEach(enqueueError);
    this._queryQueue.length = 0;
  };
  Client.prototype._connect = function(cb) {
    var self = this;
    if (this._connecting) {
      process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true;
    this.connectionParameters.getLibpqConnectionString(function(err, conString) {
      if (self.connectionParameters.nativeConnectionString)
        conString = self.connectionParameters.nativeConnectionString;
      if (err)
        return cb(err);
      self.native.connect(conString, function(err2) {
        if (err2) {
          self.native.end();
          return cb(err2);
        }
        self._connected = true;
        self.native.on("error", function(err3) {
          self._queryable = false;
          self._errorAllQueries(err3);
          self.emit("error", err3);
        });
        self.native.on("notification", function(msg) {
          self.emit("notification", {
            channel: msg.relname,
            payload: msg.extra
          });
        });
        self.emit("connect");
        self._pulseQueryQueue(true);
        cb();
      });
    });
  };
  Client.prototype.connect = function(callback) {
    if (callback) {
      this._connect(callback);
      return;
    }
    return new this._Promise((resolve, reject) => {
      this._connect((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
  Client.prototype.query = function(config, values, callback) {
    var query;
    var result;
    var readTimeout;
    var readTimeoutTimer;
    var queryCallback;
    if (config === null || config === undefined) {
      throw new TypeError("Client was passed a null or undefined query");
    } else if (typeof config.submit === "function") {
      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
      result = query = config;
      if (typeof values === "function") {
        config.callback = values;
      }
    } else {
      readTimeout = this.connectionParameters.query_timeout;
      query = new NativeQuery(config, values, callback);
      if (!query.callback) {
        let resolveOut, rejectOut;
        result = new this._Promise((resolve, reject) => {
          resolveOut = resolve;
          rejectOut = reject;
        }).catch((err) => {
          Error.captureStackTrace(err);
          throw err;
        });
        query.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
      }
    }
    if (readTimeout) {
      queryCallback = query.callback;
      readTimeoutTimer = setTimeout(() => {
        var error = new Error("Query read timeout");
        process.nextTick(() => {
          query.handleError(error, this.connection);
        });
        queryCallback(error);
        query.callback = () => {
        };
        var index = this._queryQueue.indexOf(query);
        if (index > -1) {
          this._queryQueue.splice(index, 1);
        }
        this._pulseQueryQueue();
      }, readTimeout);
      query.callback = (err, res) => {
        clearTimeout(readTimeoutTimer);
        queryCallback(err, res);
      };
    }
    if (!this._queryable) {
      query.native = this.native;
      process.nextTick(() => {
        query.handleError(new Error("Client has encountered a connection error and is not queryable"));
      });
      return result;
    }
    if (this._ending) {
      query.native = this.native;
      process.nextTick(() => {
        query.handleError(new Error("Client was closed and is not queryable"));
      });
      return result;
    }
    this._queryQueue.push(query);
    this._pulseQueryQueue();
    return result;
  };
  Client.prototype.end = function(cb) {
    var self = this;
    this._ending = true;
    if (!this._connected) {
      this.once("connect", this.end.bind(this, cb));
    }
    var result;
    if (!cb) {
      result = new this._Promise(function(resolve, reject) {
        cb = (err) => err ? reject(err) : resolve();
      });
    }
    this.native.end(function() {
      self._errorAllQueries(new Error("Connection terminated"));
      process.nextTick(() => {
        self.emit("end");
        if (cb)
          cb();
      });
    });
    return result;
  };
  Client.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  Client.prototype._pulseQueryQueue = function(initialConnection) {
    if (!this._connected) {
      return;
    }
    if (this._hasActiveQuery()) {
      return;
    }
    var query = this._queryQueue.shift();
    if (!query) {
      if (!initialConnection) {
        this.emit("drain");
      }
      return;
    }
    this._activeQuery = query;
    query.submit(this);
    var self = this;
    query.once("_done", function() {
      self._pulseQueryQueue();
    });
  };
  Client.prototype.cancel = function(query) {
    if (this._activeQuery === query) {
      this.native.cancel(function() {
      });
    } else if (this._queryQueue.indexOf(query) !== -1) {
      this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
    }
  };
  Client.prototype.ref = function() {
  };
  Client.prototype.unref = function() {
  };
  Client.prototype.setTypeParser = function(oid, format, parseFn) {
    return this._types.setTypeParser(oid, format, parseFn);
  };
  Client.prototype.getTypeParser = function(oid, format) {
    return this._types.getTypeParser(oid, format);
  };
});

// node_modules/pg/lib/index.js
var require_lib2 = __commonJS((exports, module) => {
  var Client = require_client();
  var defaults = require_defaults();
  var Connection = require_connection();
  var Pool = require_pg_pool();
  var { DatabaseError } = require_dist();
  var { escapeIdentifier, escapeLiteral } = require_utils();
  var poolFactory = (Client2) => {
    return class BoundPool extends Pool {
      constructor(options) {
        super(options, Client2);
      }
    };
  };
  var PG = function(clientConstructor) {
    this.defaults = defaults;
    this.Client = clientConstructor;
    this.Query = this.Client.Query;
    this.Pool = poolFactory(this.Client);
    this._pools = [];
    this.Connection = Connection;
    this.types = require_pg_types();
    this.DatabaseError = DatabaseError;
    this.escapeIdentifier = escapeIdentifier;
    this.escapeLiteral = escapeLiteral;
  };
  if (typeof process.env.NODE_PG_FORCE_NATIVE !== "undefined") {
    module.exports = new PG(require_client2());
  } else {
    module.exports = new PG(Client);
    Object.defineProperty(module.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        var native = null;
        try {
          native = new PG(require_client2());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// node_modules/elysia/dist/bun/index.js
var o6 = Object.create;
var { defineProperty: T8, getPrototypeOf: n6, getOwnPropertyNames: u6 } = Object;
var c6 = Object.prototype.hasOwnProperty;
var a0 = ($, Y, J) => {
  J = $ != null ? o6(n6($)) : {};
  const X = Y || !$ || !$.__esModule ? T8(J, "default", { value: $, enumerable: true }) : J;
  for (let Z of u6($))
    if (!c6.call(X, Z))
      T8(X, Z, { get: () => $[Z], enumerable: true });
  return X;
};
var e = ($, Y) => () => (Y || $((Y = { exports: {} }).exports, Y), Y.exports);
var f0 = e((m8) => {
  Object.defineProperty(m8, "__esModule", { value: true });
  m8.Type = m8.StandardType = m8.ExtendedTypeBuilder = m8.StandardTypeBuilder = m8.TypeBuilder = m8.TemplateLiteralDslParser = m8.TemplateLiteralGenerator = m8.TemplateLiteralFinite = m8.TemplateLiteralParser = m8.TemplateLiteralParserError = m8.TemplateLiteralResolver = m8.TemplateLiteralPattern = m8.UnionResolver = m8.KeyArrayResolver = m8.KeyResolver = m8.ObjectMap = m8.Intrinsic = m8.IndexedAccessor = m8.TypeClone = m8.TypeExtends = m8.TypeExtendsResult = m8.ExtendsUndefined = m8.TypeGuard = m8.TypeGuardUnknownTypeError = m8.ValueGuard = m8.FormatRegistry = m8.TypeRegistry = m8.PatternStringExact = m8.PatternNumberExact = m8.PatternBooleanExact = m8.PatternString = m8.PatternNumber = m8.PatternBoolean = m8.Kind = m8.Hint = m8.Optional = m8.Readonly = undefined;
  m8.Readonly = Symbol.for("TypeBox.Readonly");
  m8.Optional = Symbol.for("TypeBox.Optional");
  m8.Hint = Symbol.for("TypeBox.Hint");
  m8.Kind = Symbol.for("TypeBox.Kind");
  m8.PatternBoolean = "(true|false)";
  m8.PatternNumber = "(0|[1-9][0-9]*)";
  m8.PatternString = "(.*)";
  m8.PatternBooleanExact = `^${m8.PatternBoolean}$`;
  m8.PatternNumberExact = `^${m8.PatternNumber}$`;
  m8.PatternStringExact = `^${m8.PatternString}$`;
  var x1;
  (function($) {
    const Y = new Map;
    function J() {
      return new Map(Y);
    }
    $.Entries = J;
    function X() {
      return Y.clear();
    }
    $.Clear = X;
    function Z(A) {
      return Y.delete(A);
    }
    $.Delete = Z;
    function W(A) {
      return Y.has(A);
    }
    $.Has = W;
    function q(A, D) {
      Y.set(A, D);
    }
    $.Set = q;
    function M(A) {
      return Y.get(A);
    }
    $.Get = M;
  })(x1 || (m8.TypeRegistry = x1 = {}));
  var v8;
  (function($) {
    const Y = new Map;
    function J() {
      return new Map(Y);
    }
    $.Entries = J;
    function X() {
      return Y.clear();
    }
    $.Clear = X;
    function Z(A) {
      return Y.delete(A);
    }
    $.Delete = Z;
    function W(A) {
      return Y.has(A);
    }
    $.Has = W;
    function q(A, D) {
      Y.set(A, D);
    }
    $.Set = q;
    function M(A) {
      return Y.get(A);
    }
    $.Get = M;
  })(v8 || (m8.FormatRegistry = v8 = {}));
  var G;
  (function($) {
    function Y(D) {
      return typeof D === "object" && D !== null;
    }
    $.IsObject = Y;
    function J(D) {
      return Array.isArray(D);
    }
    $.IsArray = J;
    function X(D) {
      return typeof D === "boolean";
    }
    $.IsBoolean = X;
    function Z(D) {
      return D === null;
    }
    $.IsNull = Z;
    function W(D) {
      return D === undefined;
    }
    $.IsUndefined = W;
    function q(D) {
      return typeof D === "bigint";
    }
    $.IsBigInt = q;
    function M(D) {
      return typeof D === "number";
    }
    $.IsNumber = M;
    function A(D) {
      return typeof D === "string";
    }
    $.IsString = A;
  })(G || (m8.ValueGuard = G = {}));

  class p8 extends Error {
    constructor($) {
      super("TypeGuard: Unknown type");
      this.schema = $;
    }
  }
  m8.TypeGuardUnknownTypeError = p8;
  var F;
  (function($) {
    function Y(Q) {
      try {
        return new RegExp(Q), true;
      } catch {
        return false;
      }
    }
    function J(Q) {
      if (!G.IsString(Q))
        return false;
      for (let b = 0;b < Q.length; b++) {
        const O = Q.charCodeAt(b);
        if (O >= 7 && O <= 13 || O === 27 || O === 127)
          return false;
      }
      return true;
    }
    function X(Q) {
      return q(Q) || L(Q);
    }
    function Z(Q) {
      return G.IsUndefined(Q) || G.IsBigInt(Q);
    }
    function W(Q) {
      return G.IsUndefined(Q) || G.IsNumber(Q);
    }
    function q(Q) {
      return G.IsUndefined(Q) || G.IsBoolean(Q);
    }
    function M(Q) {
      return G.IsUndefined(Q) || G.IsString(Q);
    }
    function A(Q) {
      return G.IsUndefined(Q) || G.IsString(Q) && J(Q) && Y(Q);
    }
    function D(Q) {
      return G.IsUndefined(Q) || G.IsString(Q) && J(Q);
    }
    function N(Q) {
      return G.IsUndefined(Q) || L(Q);
    }
    function K(Q) {
      return x(Q, "Any") && M(Q.$id);
    }
    $.TAny = K;
    function w(Q) {
      return x(Q, "Array") && Q.type === "array" && M(Q.$id) && L(Q.items) && W(Q.minItems) && W(Q.maxItems) && q(Q.uniqueItems) && N(Q.contains) && W(Q.minContains) && W(Q.maxContains);
    }
    $.TArray = w;
    function B(Q) {
      return x(Q, "AsyncIterator") && Q.type === "AsyncIterator" && M(Q.$id) && L(Q.items);
    }
    $.TAsyncIterator = B;
    function C(Q) {
      return x(Q, "BigInt") && Q.type === "bigint" && M(Q.$id) && Z(Q.multipleOf) && Z(Q.minimum) && Z(Q.maximum) && Z(Q.exclusiveMinimum) && Z(Q.exclusiveMaximum);
    }
    $.TBigInt = C;
    function S(Q) {
      return x(Q, "Boolean") && Q.type === "boolean" && M(Q.$id);
    }
    $.TBoolean = S;
    function I(Q) {
      if (!(x(Q, "Constructor") && Q.type === "constructor" && M(Q.$id) && G.IsArray(Q.parameters) && L(Q.returns)))
        return false;
      for (let b of Q.parameters)
        if (!L(b))
          return false;
      return true;
    }
    $.TConstructor = I;
    function R(Q) {
      return x(Q, "Date") && Q.type === "Date" && M(Q.$id) && W(Q.minimumTimestamp) && W(Q.maximumTimestamp) && W(Q.exclusiveMinimumTimestamp) && W(Q.exclusiveMaximumTimestamp);
    }
    $.TDate = R;
    function g(Q) {
      if (!(x(Q, "Function") && Q.type === "function" && M(Q.$id) && G.IsArray(Q.parameters) && L(Q.returns)))
        return false;
      for (let b of Q.parameters)
        if (!L(b))
          return false;
      return true;
    }
    $.TFunction = g;
    function i(Q) {
      return x(Q, "Integer") && Q.type === "integer" && M(Q.$id) && W(Q.multipleOf) && W(Q.minimum) && W(Q.maximum) && W(Q.exclusiveMinimum) && W(Q.exclusiveMaximum);
    }
    $.TInteger = i;
    function j(Q) {
      if (!(x(Q, "Intersect") && G.IsArray(Q.allOf) && M(Q.type) && (q(Q.unevaluatedProperties) || N(Q.unevaluatedProperties)) && M(Q.$id)))
        return false;
      if (("type" in Q) && Q.type !== "object")
        return false;
      for (let b of Q.allOf)
        if (!L(b))
          return false;
      return true;
    }
    $.TIntersect = j;
    function E(Q) {
      return x(Q, "Iterator") && Q.type === "Iterator" && M(Q.$id) && L(Q.items);
    }
    $.TIterator = E;
    function x(Q, b) {
      return F0(Q) && Q[m8.Kind] === b;
    }
    $.TKindOf = x;
    function F0(Q) {
      return G.IsObject(Q) && (m8.Kind in Q) && G.IsString(Q[m8.Kind]);
    }
    $.TKind = F0;
    function d(Q) {
      return D0(Q) && G.IsString(Q.const);
    }
    $.TLiteralString = d;
    function a(Q) {
      return D0(Q) && G.IsNumber(Q.const);
    }
    $.TLiteralNumber = a;
    function J0(Q) {
      return D0(Q) && G.IsBoolean(Q.const);
    }
    $.TLiteralBoolean = J0;
    function D0(Q) {
      return x(Q, "Literal") && M(Q.$id) && (G.IsBoolean(Q.const) || G.IsNumber(Q.const) || G.IsString(Q.const));
    }
    $.TLiteral = D0;
    function v(Q) {
      return x(Q, "Never") && G.IsObject(Q.not) && Object.getOwnPropertyNames(Q.not).length === 0;
    }
    $.TNever = v;
    function U0(Q) {
      return x(Q, "Not") && L(Q.not);
    }
    $.TNot = U0;
    function S0(Q) {
      return x(Q, "Null") && Q.type === "null" && M(Q.$id);
    }
    $.TNull = S0;
    function y(Q) {
      return x(Q, "Number") && Q.type === "number" && M(Q.$id) && W(Q.multipleOf) && W(Q.minimum) && W(Q.maximum) && W(Q.exclusiveMinimum) && W(Q.exclusiveMaximum);
    }
    $.TNumber = y;
    function L0(Q) {
      if (!(x(Q, "Object") && Q.type === "object" && M(Q.$id) && G.IsObject(Q.properties) && X(Q.additionalProperties) && W(Q.minProperties) && W(Q.maxProperties)))
        return false;
      for (let [b, O] of Object.entries(Q.properties)) {
        if (!J(b))
          return false;
        if (!L(O))
          return false;
      }
      return true;
    }
    $.TObject = L0;
    function Q$(Q) {
      return x(Q, "Promise") && Q.type === "Promise" && M(Q.$id) && L(Q.item);
    }
    $.TPromise = Q$;
    function m(Q) {
      if (!(x(Q, "Record") && Q.type === "object" && M(Q.$id) && X(Q.additionalProperties) && G.IsObject(Q.patternProperties)))
        return false;
      const b = Object.getOwnPropertyNames(Q.patternProperties);
      if (b.length !== 1)
        return false;
      if (!Y(b[0]))
        return false;
      if (!L(Q.patternProperties[b[0]]))
        return false;
      return true;
    }
    $.TRecord = m;
    function N$(Q) {
      return x(Q, "Ref") && M(Q.$id) && G.IsString(Q.$ref);
    }
    $.TRef = N$;
    function A$(Q) {
      return x(Q, "String") && Q.type === "string" && M(Q.$id) && W(Q.minLength) && W(Q.maxLength) && A(Q.pattern) && D(Q.format);
    }
    $.TString = A$;
    function w$(Q) {
      return x(Q, "Symbol") && Q.type === "symbol" && M(Q.$id);
    }
    $.TSymbol = w$;
    function C0(Q) {
      return x(Q, "TemplateLiteral") && Q.type === "string" && G.IsString(Q.pattern) && Q.pattern[0] === "^" && Q.pattern[Q.pattern.length - 1] === "$";
    }
    $.TTemplateLiteral = C0;
    function X0(Q) {
      return x(Q, "This") && M(Q.$id) && G.IsString(Q.$ref);
    }
    $.TThis = X0;
    function Q0(Q) {
      if (!(x(Q, "Tuple") && Q.type === "array" && M(Q.$id) && G.IsNumber(Q.minItems) && G.IsNumber(Q.maxItems) && Q.minItems === Q.maxItems))
        return false;
      if (G.IsUndefined(Q.items) && G.IsUndefined(Q.additionalItems) && Q.minItems === 0)
        return true;
      if (!G.IsArray(Q.items))
        return false;
      for (let b of Q.items)
        if (!L(b))
          return false;
      return true;
    }
    $.TTuple = Q0;
    function $0(Q) {
      return x(Q, "Undefined") && Q.type === "undefined" && M(Q.$id);
    }
    $.TUndefined = $0;
    function p0(Q) {
      return r0(Q) && Q.anyOf.every((b) => d(b) || a(b));
    }
    $.TUnionLiteral = p0;
    function r0(Q) {
      if (!(x(Q, "Union") && G.IsArray(Q.anyOf) && M(Q.$id)))
        return false;
      for (let b of Q.anyOf)
        if (!L(b))
          return false;
      return true;
    }
    $.TUnion = r0;
    function k0(Q) {
      return x(Q, "Uint8Array") && Q.type === "Uint8Array" && M(Q.$id) && W(Q.minByteLength) && W(Q.maxByteLength);
    }
    $.TUint8Array = k0;
    function m0(Q) {
      return x(Q, "Unknown") && M(Q.$id);
    }
    $.TUnknown = m0;
    function z0(Q) {
      return x(Q, "Unsafe");
    }
    $.TUnsafe = z0;
    function z$(Q) {
      return x(Q, "Void") && Q.type === "void" && M(Q.$id);
    }
    $.TVoid = z$;
    function D$(Q) {
      return G.IsObject(Q) && Q[m8.Readonly] === "Readonly";
    }
    $.TReadonly = D$;
    function U(Q) {
      return G.IsObject(Q) && Q[m8.Optional] === "Optional";
    }
    $.TOptional = U;
    function L(Q) {
      return G.IsObject(Q) && (K(Q) || w(Q) || S(Q) || C(Q) || B(Q) || I(Q) || R(Q) || g(Q) || i(Q) || j(Q) || E(Q) || D0(Q) || v(Q) || U0(Q) || S0(Q) || y(Q) || L0(Q) || Q$(Q) || m(Q) || N$(Q) || A$(Q) || w$(Q) || C0(Q) || X0(Q) || Q0(Q) || $0(Q) || r0(Q) || k0(Q) || m0(Q) || z0(Q) || z$(Q) || F0(Q) && x1.Has(Q[m8.Kind]));
    }
    $.TSchema = L;
  })(F || (m8.TypeGuard = F = {}));
  var i8;
  (function($) {
    function Y(J) {
      if (J[m8.Kind] === "Undefined")
        return true;
      if (J[m8.Kind] === "Not")
        return !Y(J.not);
      if (J[m8.Kind] === "Intersect")
        return J.allOf.every((Z) => Y(Z));
      if (J[m8.Kind] === "Union")
        return J.anyOf.some((Z) => Y(Z));
      return false;
    }
    $.Check = Y;
  })(i8 || (m8.ExtendsUndefined = i8 = {}));
  var P;
  (function($) {
    $[$.Union = 0] = "Union", $[$.True = 1] = "True", $[$.False = 2] = "False";
  })(P || (m8.TypeExtendsResult = P = {}));
  var H$;
  (function($) {
    function Y(H) {
      return H === P.False ? P.False : P.True;
    }
    function J(H) {
      return F.TNever(H) || F.TIntersect(H) || F.TUnion(H) || F.TUnknown(H) || F.TAny(H);
    }
    function X(H, z) {
      if (F.TNever(z))
        return E(H, z);
      if (F.TIntersect(z))
        return R(H, z);
      if (F.TUnion(z))
        return j0(H, z);
      if (F.TUnknown(z))
        return I0(H, z);
      if (F.TAny(z))
        return Z(H, z);
      throw Error("TypeExtends: StructuralRight");
    }
    function Z(H, z) {
      return P.True;
    }
    function W(H, z) {
      if (F.TIntersect(z))
        return R(H, z);
      if (F.TUnion(z) && z.anyOf.some((u) => F.TAny(u) || F.TUnknown(u)))
        return P.True;
      if (F.TUnion(z))
        return P.Union;
      if (F.TUnknown(z))
        return P.True;
      if (F.TAny(z))
        return P.True;
      return P.Union;
    }
    function q(H, z) {
      if (F.TUnknown(H))
        return P.False;
      if (F.TAny(H))
        return P.Union;
      if (F.TNever(H))
        return P.True;
      return P.False;
    }
    function M(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z) && C0(z))
        return P.True;
      if (!F.TArray(z))
        return P.False;
      return Y(l(H.items, z.items));
    }
    function A(H, z) {
      if (J(z))
        return X(H, z);
      if (!F.TAsyncIterator(z))
        return P.False;
      return Y(l(H.items, z.items));
    }
    function D(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TBigInt(z) ? P.True : P.False;
    }
    function N(H, z) {
      if (F.TLiteral(H) && G.IsBoolean(H.const))
        return P.True;
      return F.TBoolean(H) ? P.True : P.False;
    }
    function K(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TBoolean(z) ? P.True : P.False;
    }
    function w(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (!F.TConstructor(z))
        return P.False;
      if (H.parameters.length > z.parameters.length)
        return P.False;
      if (!H.parameters.every((u, g0) => Y(l(z.parameters[g0], u)) === P.True))
        return P.False;
      return Y(l(H.returns, z.returns));
    }
    function B(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TDate(z) ? P.True : P.False;
    }
    function C(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (!F.TFunction(z))
        return P.False;
      if (H.parameters.length > z.parameters.length)
        return P.False;
      if (!H.parameters.every((u, g0) => Y(l(z.parameters[g0], u)) === P.True))
        return P.False;
      return Y(l(H.returns, z.returns));
    }
    function S(H, z) {
      if (F.TLiteral(H) && G.IsNumber(H.const))
        return P.True;
      return F.TNumber(H) || F.TInteger(H) ? P.True : P.False;
    }
    function I(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TInteger(z) || F.TNumber(z) ? P.True : P.False;
    }
    function R(H, z) {
      return z.allOf.every((u) => l(H, u) === P.True) ? P.True : P.False;
    }
    function g(H, z) {
      return H.allOf.some((u) => l(u, z) === P.True) ? P.True : P.False;
    }
    function i(H, z) {
      if (J(z))
        return X(H, z);
      if (!F.TIterator(z))
        return P.False;
      return Y(l(H.items, z.items));
    }
    function j(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      if (F.TString(z))
        return D$(H, z);
      if (F.TNumber(z))
        return J0(H, z);
      if (F.TInteger(z))
        return S(H, z);
      if (F.TBoolean(z))
        return N(H, z);
      return F.TLiteral(z) && z.const === H.const ? P.True : P.False;
    }
    function E(H, z) {
      return P.False;
    }
    function x(H, z) {
      return P.True;
    }
    function F0(H) {
      let [z, u] = [H, 0];
      while (true) {
        if (!F.TNot(z))
          break;
        z = z.not, u += 1;
      }
      return u % 2 === 0 ? z : m8.Type.Unknown();
    }
    function d(H, z) {
      if (F.TNot(H))
        return l(F0(H), z);
      if (F.TNot(z))
        return l(H, F0(z));
      throw new Error("TypeExtends: Invalid fallthrough for Not");
    }
    function a(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TNull(z) ? P.True : P.False;
    }
    function J0(H, z) {
      if (F.TLiteralNumber(H))
        return P.True;
      return F.TNumber(H) || F.TInteger(H) ? P.True : P.False;
    }
    function D0(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TInteger(z) || F.TNumber(z) ? P.True : P.False;
    }
    function v(H, z) {
      return Object.getOwnPropertyNames(H.properties).length === z;
    }
    function U0(H) {
      return C0(H);
    }
    function S0(H) {
      return v(H, 0) || v(H, 1) && ("description" in H.properties) && F.TUnion(H.properties.description) && H.properties.description.anyOf.length === 2 && (F.TString(H.properties.description.anyOf[0]) && F.TUndefined(H.properties.description.anyOf[1]) || F.TString(H.properties.description.anyOf[1]) && F.TUndefined(H.properties.description.anyOf[0]));
    }
    function y(H) {
      return v(H, 0);
    }
    function L0(H) {
      return v(H, 0);
    }
    function Q$(H) {
      return v(H, 0);
    }
    function m(H) {
      return v(H, 0);
    }
    function N$(H) {
      return C0(H);
    }
    function A$(H) {
      const z = m8.Type.Number();
      return v(H, 0) || v(H, 1) && ("length" in H.properties) && Y(l(H.properties.length, z)) === P.True;
    }
    function w$(H) {
      return v(H, 0);
    }
    function C0(H) {
      const z = m8.Type.Number();
      return v(H, 0) || v(H, 1) && ("length" in H.properties) && Y(l(H.properties.length, z)) === P.True;
    }
    function X0(H) {
      const z = m8.Type.Function([m8.Type.Any()], m8.Type.Any());
      return v(H, 0) || v(H, 1) && ("then" in H.properties) && Y(l(H.properties.then, z)) === P.True;
    }
    function Q0(H, z) {
      if (l(H, z) === P.False)
        return P.False;
      if (F.TOptional(H) && !F.TOptional(z))
        return P.False;
      return P.True;
    }
    function $0(H, z) {
      if (F.TUnknown(H))
        return P.False;
      if (F.TAny(H))
        return P.Union;
      if (F.TNever(H))
        return P.True;
      if (F.TLiteralString(H) && U0(z))
        return P.True;
      if (F.TLiteralNumber(H) && y(z))
        return P.True;
      if (F.TLiteralBoolean(H) && L0(z))
        return P.True;
      if (F.TSymbol(H) && S0(z))
        return P.True;
      if (F.TBigInt(H) && Q$(z))
        return P.True;
      if (F.TString(H) && U0(z))
        return P.True;
      if (F.TSymbol(H) && S0(z))
        return P.True;
      if (F.TNumber(H) && y(z))
        return P.True;
      if (F.TInteger(H) && y(z))
        return P.True;
      if (F.TBoolean(H) && L0(z))
        return P.True;
      if (F.TUint8Array(H) && N$(z))
        return P.True;
      if (F.TDate(H) && m(z))
        return P.True;
      if (F.TConstructor(H) && w$(z))
        return P.True;
      if (F.TFunction(H) && A$(z))
        return P.True;
      if (F.TRecord(H) && F.TString(k0(H)))
        return z[m8.Hint] === "Record" ? P.True : P.False;
      if (F.TRecord(H) && F.TNumber(k0(H)))
        return v(z, 0) ? P.True : P.False;
      return P.False;
    }
    function p0(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      if (!F.TObject(z))
        return P.False;
      for (let u of Object.getOwnPropertyNames(z.properties)) {
        if (!(u in H.properties))
          return P.False;
        if (Q0(H.properties[u], z.properties[u]) === P.False)
          return P.False;
      }
      return P.True;
    }
    function r0(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z) && X0(z))
        return P.True;
      if (!F.TPromise(z))
        return P.False;
      return Y(l(H.item, z.item));
    }
    function k0(H) {
      if (m8.PatternNumberExact in H.patternProperties)
        return m8.Type.Number();
      if (m8.PatternStringExact in H.patternProperties)
        return m8.Type.String();
      throw Error("TypeExtends: Cannot get record key");
    }
    function m0(H) {
      if (m8.PatternNumberExact in H.patternProperties)
        return H.patternProperties[m8.PatternNumberExact];
      if (m8.PatternStringExact in H.patternProperties)
        return H.patternProperties[m8.PatternStringExact];
      throw Error("TypeExtends: Cannot get record value");
    }
    function z0(H, z) {
      const u = k0(z), g0 = m0(z);
      if (F.TLiteralString(H) && F.TNumber(u) && Y(l(H, g0)) === P.True)
        return P.True;
      if (F.TUint8Array(H) && F.TNumber(u))
        return l(H, g0);
      if (F.TString(H) && F.TNumber(u))
        return l(H, g0);
      if (F.TArray(H) && F.TNumber(u))
        return l(H, g0);
      if (F.TObject(H)) {
        for (let m6 of Object.getOwnPropertyNames(H.properties))
          if (Q0(g0, H.properties[m6]) === P.False)
            return P.False;
        return P.True;
      }
      return P.False;
    }
    function z$(H, z) {
      const u = m0(H);
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (!F.TRecord(z))
        return P.False;
      return l(u, m0(z));
    }
    function D$(H, z) {
      if (F.TLiteral(H) && G.IsString(H.const))
        return P.True;
      return F.TString(H) ? P.True : P.False;
    }
    function U(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TString(z) ? P.True : P.False;
    }
    function L(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TSymbol(z) ? P.True : P.False;
    }
    function Q(H, z) {
      if (F.TTemplateLiteral(H))
        return l(o0.Resolve(H), z);
      if (F.TTemplateLiteral(z))
        return l(H, o0.Resolve(z));
      throw new Error("TypeExtends: Invalid fallthrough for TemplateLiteral");
    }
    function b(H, z) {
      return F.TArray(z) && H.items !== undefined && H.items.every((u) => l(u, z.items) === P.True);
    }
    function O(H, z) {
      if (F.TNever(H))
        return P.True;
      if (F.TUnknown(H))
        return P.False;
      if (F.TAny(H))
        return P.Union;
      return P.False;
    }
    function V(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z) && C0(z))
        return P.True;
      if (F.TArray(z) && b(H, z))
        return P.True;
      if (!F.TTuple(z))
        return P.False;
      if (G.IsUndefined(H.items) && !G.IsUndefined(z.items) || !G.IsUndefined(H.items) && G.IsUndefined(z.items))
        return P.False;
      if (G.IsUndefined(H.items) && !G.IsUndefined(z.items))
        return P.True;
      return H.items.every((u, g0) => l(u, z.items[g0]) === P.True) ? P.True : P.False;
    }
    function s(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      return F.TUint8Array(z) ? P.True : P.False;
    }
    function B0(H, z) {
      if (J(z))
        return X(H, z);
      if (F.TObject(z))
        return $0(H, z);
      if (F.TRecord(z))
        return z0(H, z);
      if (F.TVoid(z))
        return G1(H, z);
      return F.TUndefined(z) ? P.True : P.False;
    }
    function j0(H, z) {
      return z.anyOf.some((u) => l(H, u) === P.True) ? P.True : P.False;
    }
    function O0(H, z) {
      return H.anyOf.every((u) => l(u, z) === P.True) ? P.True : P.False;
    }
    function I0(H, z) {
      return P.True;
    }
    function P$(H, z) {
      if (F.TNever(z))
        return E(H, z);
      if (F.TIntersect(z))
        return R(H, z);
      if (F.TUnion(z))
        return j0(H, z);
      if (F.TAny(z))
        return Z(H, z);
      if (F.TString(z))
        return D$(H, z);
      if (F.TNumber(z))
        return J0(H, z);
      if (F.TInteger(z))
        return S(H, z);
      if (F.TBoolean(z))
        return N(H, z);
      if (F.TArray(z))
        return q(H, z);
      if (F.TTuple(z))
        return O(H, z);
      if (F.TObject(z))
        return $0(H, z);
      return F.TUnknown(z) ? P.True : P.False;
    }
    function G1(H, z) {
      if (F.TUndefined(H))
        return P.True;
      return F.TUndefined(H) ? P.True : P.False;
    }
    function f8(H, z) {
      if (F.TIntersect(z))
        return R(H, z);
      if (F.TUnion(z))
        return j0(H, z);
      if (F.TUnknown(z))
        return I0(H, z);
      if (F.TAny(z))
        return Z(H, z);
      if (F.TObject(z))
        return $0(H, z);
      return F.TVoid(z) ? P.True : P.False;
    }
    function l(H, z) {
      if (F.TTemplateLiteral(H) || F.TTemplateLiteral(z))
        return Q(H, z);
      if (F.TNot(H) || F.TNot(z))
        return d(H, z);
      if (F.TAny(H))
        return W(H, z);
      if (F.TArray(H))
        return M(H, z);
      if (F.TBigInt(H))
        return D(H, z);
      if (F.TBoolean(H))
        return K(H, z);
      if (F.TAsyncIterator(H))
        return A(H, z);
      if (F.TConstructor(H))
        return w(H, z);
      if (F.TDate(H))
        return B(H, z);
      if (F.TFunction(H))
        return C(H, z);
      if (F.TInteger(H))
        return I(H, z);
      if (F.TIntersect(H))
        return g(H, z);
      if (F.TIterator(H))
        return i(H, z);
      if (F.TLiteral(H))
        return j(H, z);
      if (F.TNever(H))
        return x(H, z);
      if (F.TNull(H))
        return a(H, z);
      if (F.TNumber(H))
        return D0(H, z);
      if (F.TObject(H))
        return p0(H, z);
      if (F.TRecord(H))
        return z$(H, z);
      if (F.TString(H))
        return U(H, z);
      if (F.TSymbol(H))
        return L(H, z);
      if (F.TTuple(H))
        return V(H, z);
      if (F.TPromise(H))
        return r0(H, z);
      if (F.TUint8Array(H))
        return s(H, z);
      if (F.TUndefined(H))
        return B0(H, z);
      if (F.TUnion(H))
        return O0(H, z);
      if (F.TUnknown(H))
        return P$(H, z);
      if (F.TVoid(H))
        return f8(H, z);
      throw Error(`TypeExtends: Unknown left type operand '${H[m8.Kind]}'`);
    }
    function p6(H, z) {
      return l(H, z);
    }
    $.Extends = p6;
  })(H$ || (m8.TypeExtends = H$ = {}));
  var f;
  (function($) {
    function Y(W) {
      const q = Object.getOwnPropertyNames(W).reduce((A, D) => ({ ...A, [D]: X(W[D]) }), {}), M = Object.getOwnPropertySymbols(W).reduce((A, D) => ({ ...A, [D]: X(W[D]) }), {});
      return { ...q, ...M };
    }
    function J(W) {
      return W.map((q) => X(q));
    }
    function X(W) {
      if (G.IsArray(W))
        return J(W);
      if (G.IsObject(W))
        return Y(W);
      return W;
    }
    function Z(W, q = {}) {
      return { ...X(W), ...q };
    }
    $.Clone = Z;
  })(f || (m8.TypeClone = f = {}));
  var V1;
  (function($) {
    function Y(B) {
      return B.map((C) => {
        const { [m8.Optional]: S, ...I } = f.Clone(C);
        return I;
      });
    }
    function J(B) {
      return B.every((C) => F.TOptional(C));
    }
    function X(B) {
      return B.some((C) => F.TOptional(C));
    }
    function Z(B) {
      return J(B.allOf) ? m8.Type.Optional(m8.Type.Intersect(Y(B.allOf))) : B;
    }
    function W(B) {
      return X(B.anyOf) ? m8.Type.Optional(m8.Type.Union(Y(B.anyOf))) : B;
    }
    function q(B) {
      if (B[m8.Kind] === "Intersect")
        return Z(B);
      if (B[m8.Kind] === "Union")
        return W(B);
      return B;
    }
    function M(B, C) {
      const S = B.allOf.reduce((I, R) => {
        const g = K(R, C);
        return g[m8.Kind] === "Never" ? I : [...I, g];
      }, []);
      return q(m8.Type.Intersect(S));
    }
    function A(B, C) {
      const S = B.anyOf.map((I) => K(I, C));
      return q(m8.Type.Union(S));
    }
    function D(B, C) {
      const S = B.properties[C];
      return G.IsUndefined(S) ? m8.Type.Never() : m8.Type.Union([S]);
    }
    function N(B, C) {
      const S = B.items;
      if (G.IsUndefined(S))
        return m8.Type.Never();
      const I = S[C];
      if (G.IsUndefined(I))
        return m8.Type.Never();
      return I;
    }
    function K(B, C) {
      if (B[m8.Kind] === "Intersect")
        return M(B, C);
      if (B[m8.Kind] === "Union")
        return A(B, C);
      if (B[m8.Kind] === "Object")
        return D(B, C);
      if (B[m8.Kind] === "Tuple")
        return N(B, C);
      return m8.Type.Never();
    }
    function w(B, C, S = {}) {
      const I = C.map((R) => K(B, R.toString()));
      return q(m8.Type.Union(I, S));
    }
    $.Resolve = w;
  })(V1 || (m8.IndexedAccessor = V1 = {}));
  var S$;
  (function($) {
    function Y(N) {
      const [K, w] = [N.slice(0, 1), N.slice(1)];
      return `${K.toLowerCase()}${w}`;
    }
    function J(N) {
      const [K, w] = [N.slice(0, 1), N.slice(1)];
      return `${K.toUpperCase()}${w}`;
    }
    function X(N) {
      return N.toUpperCase();
    }
    function Z(N) {
      return N.toLowerCase();
    }
    function W(N, K) {
      const w = O$.ParseExact(N.pattern);
      if (!I$.Check(w))
        return { ...N, pattern: q(N.pattern, K) };
      const S = [..._$.Generate(w)].map((g) => m8.Type.Literal(g)), I = M(S, K), R = m8.Type.Union(I);
      return m8.Type.TemplateLiteral([R]);
    }
    function q(N, K) {
      return typeof N === "string" ? K === "Uncapitalize" ? Y(N) : K === "Capitalize" ? J(N) : K === "Uppercase" ? X(N) : K === "Lowercase" ? Z(N) : N : N.toString();
    }
    function M(N, K) {
      if (N.length === 0)
        return [];
      const [w, ...B] = N;
      return [D(w, K), ...M(B, K)];
    }
    function A(N, K) {
      if (F.TTemplateLiteral(N))
        return W(N, K);
      if (F.TUnion(N))
        return m8.Type.Union(M(N.anyOf, K));
      if (F.TLiteral(N))
        return m8.Type.Literal(q(N.const, K));
      return N;
    }
    function D(N, K) {
      return A(N, K);
    }
    $.Map = D;
  })(S$ || (m8.Intrinsic = S$ = {}));
  var L$;
  (function($) {
    function Y(q, M) {
      return m8.Type.Intersect(q.allOf.map((A) => Z(A, M)), { ...q });
    }
    function J(q, M) {
      return m8.Type.Union(q.anyOf.map((A) => Z(A, M)), { ...q });
    }
    function X(q, M) {
      return M(q);
    }
    function Z(q, M) {
      if (q[m8.Kind] === "Intersect")
        return Y(q, M);
      if (q[m8.Kind] === "Union")
        return J(q, M);
      if (q[m8.Kind] === "Object")
        return X(q, M);
      return q;
    }
    function W(q, M, A) {
      return { ...Z(f.Clone(q), M), ...A };
    }
    $.Map = W;
  })(L$ || (m8.ObjectMap = L$ = {}));
  var e$;
  (function($) {
    function Y(D) {
      return D[0] === "^" && D[D.length - 1] === "$" ? D.slice(1, D.length - 1) : D;
    }
    function J(D, N) {
      return D.allOf.reduce((K, w) => [...K, ...q(w, N)], []);
    }
    function X(D, N) {
      const K = D.anyOf.map((w) => q(w, N));
      return [...K.reduce((w, B) => B.map((C) => K.every((S) => S.includes(C)) ? w.add(C) : w)[0], new Set)];
    }
    function Z(D, N) {
      return Object.getOwnPropertyNames(D.properties);
    }
    function W(D, N) {
      return N.includePatterns ? Object.getOwnPropertyNames(D.patternProperties) : [];
    }
    function q(D, N) {
      if (F.TIntersect(D))
        return J(D, N);
      if (F.TUnion(D))
        return X(D, N);
      if (F.TObject(D))
        return Z(D, N);
      if (F.TRecord(D))
        return W(D, N);
      return [];
    }
    function M(D, N) {
      return [...new Set(q(D, N))];
    }
    $.ResolveKeys = M;
    function A(D) {
      return `^(${M(D, { includePatterns: true }).map((w) => `(${Y(w)})`).join("|")})$`;
    }
    $.ResolvePattern = A;
  })(e$ || (m8.KeyResolver = e$ = {}));
  var g$;
  (function($) {
    function Y(J) {
      if (Array.isArray(J))
        return J;
      if (F.TUnionLiteral(J))
        return J.anyOf.map((X) => X.const.toString());
      if (F.TLiteral(J))
        return [J.const];
      if (F.TTemplateLiteral(J)) {
        const X = O$.ParseExact(J.pattern);
        if (!I$.Check(X))
          throw Error("KeyArrayResolver: Cannot resolve keys from infinite template expression");
        return [..._$.Generate(X)];
      }
      return [];
    }
    $.Resolve = Y;
  })(g$ || (m8.KeyArrayResolver = g$ = {}));
  var k1;
  (function($) {
    function* Y(X) {
      for (let Z of X.anyOf)
        if (Z[m8.Kind] === "Union")
          yield* Y(Z);
        else
          yield Z;
    }
    function J(X) {
      return m8.Type.Union([...Y(X)], { ...X });
    }
    $.Resolve = J;
  })(k1 || (m8.UnionResolver = k1 = {}));
  var $1;
  (function($) {
    function Y(Z) {
      return Z.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function J(Z, W) {
      if (F.TTemplateLiteral(Z))
        return Z.pattern.slice(1, Z.pattern.length - 1);
      else if (F.TUnion(Z))
        return `(${Z.anyOf.map((q) => J(q, W)).join("|")})`;
      else if (F.TNumber(Z))
        return `${W}${m8.PatternNumber}`;
      else if (F.TInteger(Z))
        return `${W}${m8.PatternNumber}`;
      else if (F.TBigInt(Z))
        return `${W}${m8.PatternNumber}`;
      else if (F.TString(Z))
        return `${W}${m8.PatternString}`;
      else if (F.TLiteral(Z))
        return `${W}${Y(Z.const.toString())}`;
      else if (F.TBoolean(Z))
        return `${W}${m8.PatternBoolean}`;
      else if (F.TNever(Z))
        throw Error("TemplateLiteralPattern: TemplateLiteral cannot operate on types of TNever");
      else
        throw Error(`TemplateLiteralPattern: Unexpected Kind '${Z[m8.Kind]}'`);
    }
    function X(Z) {
      return `^${Z.map((W) => J(W, "")).join("")}\$`;
    }
    $.Create = X;
  })($1 || (m8.TemplateLiteralPattern = $1 = {}));
  var o0;
  (function($) {
    function Y(J) {
      const X = O$.ParseExact(J.pattern);
      if (!I$.Check(X))
        return m8.Type.String();
      const Z = [..._$.Generate(X)].map((W) => m8.Type.Literal(W));
      return m8.Type.Union(Z);
    }
    $.Resolve = Y;
  })(o0 || (m8.TemplateLiteralResolver = o0 = {}));

  class Y1 extends Error {
    constructor($) {
      super($);
    }
  }
  m8.TemplateLiteralParserError = Y1;
  var O$;
  (function($) {
    function Y(B, C, S) {
      return B[C] === S && B.charCodeAt(C - 1) !== 92;
    }
    function J(B, C) {
      return Y(B, C, "(");
    }
    function X(B, C) {
      return Y(B, C, ")");
    }
    function Z(B, C) {
      return Y(B, C, "|");
    }
    function W(B) {
      if (!(J(B, 0) && X(B, B.length - 1)))
        return false;
      let C = 0;
      for (let S = 0;S < B.length; S++) {
        if (J(B, S))
          C += 1;
        if (X(B, S))
          C -= 1;
        if (C === 0 && S !== B.length - 1)
          return false;
      }
      return true;
    }
    function q(B) {
      return B.slice(1, B.length - 1);
    }
    function M(B) {
      let C = 0;
      for (let S = 0;S < B.length; S++) {
        if (J(B, S))
          C += 1;
        if (X(B, S))
          C -= 1;
        if (Z(B, S) && C === 0)
          return true;
      }
      return false;
    }
    function A(B) {
      for (let C = 0;C < B.length; C++)
        if (J(B, C))
          return true;
      return false;
    }
    function D(B) {
      let [C, S] = [0, 0];
      const I = [];
      for (let g = 0;g < B.length; g++) {
        if (J(B, g))
          C += 1;
        if (X(B, g))
          C -= 1;
        if (Z(B, g) && C === 0) {
          const i = B.slice(S, g);
          if (i.length > 0)
            I.push(K(i));
          S = g + 1;
        }
      }
      const R = B.slice(S);
      if (R.length > 0)
        I.push(K(R));
      if (I.length === 0)
        return { type: "const", const: "" };
      if (I.length === 1)
        return I[0];
      return { type: "or", expr: I };
    }
    function N(B) {
      function C(R, g) {
        if (!J(R, g))
          throw new Y1("TemplateLiteralParser: Index must point to open parens");
        let i = 0;
        for (let j = g;j < R.length; j++) {
          if (J(R, j))
            i += 1;
          if (X(R, j))
            i -= 1;
          if (i === 0)
            return [g, j];
        }
        throw new Y1("TemplateLiteralParser: Unclosed group parens in expression");
      }
      function S(R, g) {
        for (let i = g;i < R.length; i++)
          if (J(R, i))
            return [g, i];
        return [g, R.length];
      }
      const I = [];
      for (let R = 0;R < B.length; R++)
        if (J(B, R)) {
          const [g, i] = C(B, R), j = B.slice(g, i + 1);
          I.push(K(j)), R = i;
        } else {
          const [g, i] = S(B, R), j = B.slice(g, i);
          if (j.length > 0)
            I.push(K(j));
          R = i - 1;
        }
      if (I.length === 0)
        return { type: "const", const: "" };
      if (I.length === 1)
        return I[0];
      return { type: "and", expr: I };
    }
    function K(B) {
      if (W(B))
        return K(q(B));
      if (M(B))
        return D(B);
      if (A(B))
        return N(B);
      return { type: "const", const: B };
    }
    $.Parse = K;
    function w(B) {
      return K(B.slice(1, B.length - 1));
    }
    $.ParseExact = w;
  })(O$ || (m8.TemplateLiteralParser = O$ = {}));
  var I$;
  (function($) {
    function Y(W) {
      return W.type === "or" && W.expr.length === 2 && W.expr[0].type === "const" && W.expr[0].const === "0" && W.expr[1].type === "const" && W.expr[1].const === "[1-9][0-9]*";
    }
    function J(W) {
      return W.type === "or" && W.expr.length === 2 && W.expr[0].type === "const" && W.expr[0].const === "true" && W.expr[1].type === "const" && W.expr[1].const === "false";
    }
    function X(W) {
      return W.type === "const" && W.const === ".*";
    }
    function Z(W) {
      if (J(W))
        return true;
      if (Y(W) || X(W))
        return false;
      if (W.type === "and")
        return W.expr.every((q) => Z(q));
      if (W.type === "or")
        return W.expr.every((q) => Z(q));
      if (W.type === "const")
        return true;
      throw Error("TemplateLiteralFinite: Unknown expression type");
    }
    $.Check = Z;
  })(I$ || (m8.TemplateLiteralFinite = I$ = {}));
  var _$;
  (function($) {
    function* Y(q) {
      if (q.length === 1)
        return yield* q[0];
      for (let M of q[0])
        for (let A of Y(q.slice(1)))
          yield `${M}${A}`;
    }
    function* J(q) {
      return yield* Y(q.expr.map((M) => [...W(M)]));
    }
    function* X(q) {
      for (let M of q.expr)
        yield* W(M);
    }
    function* Z(q) {
      return yield q.const;
    }
    function* W(q) {
      if (q.type === "and")
        return yield* J(q);
      if (q.type === "or")
        return yield* X(q);
      if (q.type === "const")
        return yield* Z(q);
      throw Error("TemplateLiteralGenerator: Unknown expression");
    }
    $.Generate = W;
  })(_$ || (m8.TemplateLiteralGenerator = _$ = {}));
  var g1;
  (function($) {
    function* Y(W) {
      const q = W.trim().replace(/"|'/g, "");
      if (q === "boolean")
        return yield m8.Type.Boolean();
      if (q === "number")
        return yield m8.Type.Number();
      if (q === "bigint")
        return yield m8.Type.BigInt();
      if (q === "string")
        return yield m8.Type.String();
      const M = q.split("|").map((A) => m8.Type.Literal(A.trim()));
      return yield M.length === 0 ? m8.Type.Never() : M.length === 1 ? M[0] : m8.Type.Union(M);
    }
    function* J(W) {
      if (W[1] !== "{") {
        const q = m8.Type.Literal("$"), M = X(W.slice(1));
        return yield* [q, ...M];
      }
      for (let q = 2;q < W.length; q++)
        if (W[q] === "}") {
          const M = Y(W.slice(2, q)), A = X(W.slice(q + 1));
          return yield* [...M, ...A];
        }
      yield m8.Type.Literal(W);
    }
    function* X(W) {
      for (let q = 0;q < W.length; q++)
        if (W[q] === "$") {
          const M = m8.Type.Literal(W.slice(0, q)), A = J(W.slice(q));
          return yield* [M, ...A];
        }
      yield m8.Type.Literal(W);
    }
    function Z(W) {
      return [...X(W)];
    }
    $.Parse = Z;
  })(g1 || (m8.TemplateLiteralDslParser = g1 = {}));
  var h6 = 0;

  class f1 {
    Create($) {
      return $;
    }
    Discard($, Y) {
      const { [Y]: J, ...X } = $;
      return X;
    }
    Strict($) {
      return JSON.parse(JSON.stringify($));
    }
  }
  m8.TypeBuilder = f1;

  class X1 extends f1 {
    ReadonlyOptional($) {
      return this.Readonly(this.Optional($));
    }
    Readonly($) {
      return { ...f.Clone($), [m8.Readonly]: "Readonly" };
    }
    Optional($) {
      return { ...f.Clone($), [m8.Optional]: "Optional" };
    }
    Any($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Any" });
    }
    Array($, Y = {}) {
      return this.Create({ ...Y, [m8.Kind]: "Array", type: "array", items: f.Clone($) });
    }
    Boolean($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Boolean", type: "boolean" });
    }
    Capitalize($, Y = {}) {
      return { ...S$.Map(f.Clone($), "Capitalize"), ...Y };
    }
    Composite($, Y) {
      const J = m8.Type.Intersect($, {}), Z = e$.ResolveKeys(J, { includePatterns: false }).reduce((W, q) => ({ ...W, [q]: m8.Type.Index(J, [q]) }), {});
      return m8.Type.Object(Z, Y);
    }
    Enum($, Y = {}) {
      const X = Object.getOwnPropertyNames($).filter((Z) => isNaN(Z)).map((Z) => $[Z]).map((Z) => G.IsString(Z) ? { [m8.Kind]: "Literal", type: "string", const: Z } : { [m8.Kind]: "Literal", type: "number", const: Z });
      return this.Create({ ...Y, [m8.Kind]: "Union", anyOf: X });
    }
    Extends($, Y, J, X, Z = {}) {
      switch (H$.Extends($, Y)) {
        case P.Union:
          return this.Union([f.Clone(J, Z), f.Clone(X, Z)]);
        case P.True:
          return f.Clone(J, Z);
        case P.False:
          return f.Clone(X, Z);
      }
    }
    Exclude($, Y, J = {}) {
      if (F.TTemplateLiteral($))
        return this.Exclude(o0.Resolve($), Y, J);
      if (F.TTemplateLiteral(Y))
        return this.Exclude($, o0.Resolve(Y), J);
      if (F.TUnion($)) {
        const X = $.anyOf.filter((Z) => H$.Extends(Z, Y) === P.False);
        return X.length === 1 ? f.Clone(X[0], J) : this.Union(X, J);
      } else
        return H$.Extends($, Y) !== P.False ? this.Never(J) : f.Clone($, J);
    }
    Extract($, Y, J = {}) {
      if (F.TTemplateLiteral($))
        return this.Extract(o0.Resolve($), Y, J);
      if (F.TTemplateLiteral(Y))
        return this.Extract($, o0.Resolve(Y), J);
      if (F.TUnion($)) {
        const X = $.anyOf.filter((Z) => H$.Extends(Z, Y) !== P.False);
        return X.length === 1 ? f.Clone(X[0], J) : this.Union(X, J);
      } else
        return H$.Extends($, Y) !== P.False ? f.Clone($, J) : this.Never(J);
    }
    Index($, Y, J = {}) {
      if (F.TArray($) && F.TNumber(Y))
        return f.Clone($.items, J);
      else if (F.TTuple($) && F.TNumber(Y)) {
        const Z = (G.IsUndefined($.items) ? [] : $.items).map((W) => f.Clone(W));
        return this.Union(Z, J);
      } else {
        const X = g$.Resolve(Y), Z = f.Clone($);
        return V1.Resolve(Z, X, J);
      }
    }
    Integer($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Integer", type: "integer" });
    }
    Intersect($, Y = {}) {
      if ($.length === 0)
        return m8.Type.Never();
      if ($.length === 1)
        return f.Clone($[0], Y);
      const J = $.every((W) => F.TObject(W)), X = $.map((W) => f.Clone(W)), Z = F.TSchema(Y.unevaluatedProperties) ? { unevaluatedProperties: f.Clone(Y.unevaluatedProperties) } : {};
      if (Y.unevaluatedProperties === false || F.TSchema(Y.unevaluatedProperties) || J)
        return this.Create({ ...Y, ...Z, [m8.Kind]: "Intersect", type: "object", allOf: X });
      else
        return this.Create({ ...Y, ...Z, [m8.Kind]: "Intersect", allOf: X });
    }
    KeyOf($, Y = {}) {
      if (F.TRecord($)) {
        const J = Object.getOwnPropertyNames($.patternProperties)[0];
        if (J === m8.PatternNumberExact)
          return this.Number(Y);
        if (J === m8.PatternStringExact)
          return this.String(Y);
        throw Error("StandardTypeBuilder: Unable to resolve key type from Record key pattern");
      } else if (F.TTuple($)) {
        const X = (G.IsUndefined($.items) ? [] : $.items).map((Z, W) => m8.Type.Literal(W));
        return this.Union(X, Y);
      } else if (F.TArray($))
        return this.Number(Y);
      else {
        const J = e$.ResolveKeys($, { includePatterns: false });
        if (J.length === 0)
          return this.Never(Y);
        const X = J.map((Z) => this.Literal(Z));
        return this.Union(X, Y);
      }
    }
    Literal($, Y = {}) {
      return this.Create({ ...Y, [m8.Kind]: "Literal", const: $, type: typeof $ });
    }
    Lowercase($, Y = {}) {
      return { ...S$.Map(f.Clone($), "Lowercase"), ...Y };
    }
    Never($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Never", not: {} });
    }
    Not($, Y) {
      return this.Create({ ...Y, [m8.Kind]: "Not", not: f.Clone($) });
    }
    Null($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Null", type: "null" });
    }
    Number($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Number", type: "number" });
    }
    Object($, Y = {}) {
      const J = Object.getOwnPropertyNames($), X = J.filter((M) => F.TOptional($[M])), Z = J.filter((M) => !X.includes(M)), W = F.TSchema(Y.additionalProperties) ? { additionalProperties: f.Clone(Y.additionalProperties) } : {}, q = J.reduce((M, A) => ({ ...M, [A]: f.Clone($[A]) }), {});
      if (Z.length > 0)
        return this.Create({ ...Y, ...W, [m8.Kind]: "Object", type: "object", properties: q, required: Z });
      else
        return this.Create({ ...Y, ...W, [m8.Kind]: "Object", type: "object", properties: q });
    }
    Omit($, Y, J = {}) {
      const X = g$.Resolve(Y);
      return L$.Map(f.Clone($), (Z) => {
        if (G.IsArray(Z.required)) {
          if (Z.required = Z.required.filter((W) => !X.includes(W)), Z.required.length === 0)
            delete Z.required;
        }
        for (let W of Object.getOwnPropertyNames(Z.properties))
          if (X.includes(W))
            delete Z.properties[W];
        return this.Create(Z);
      }, J);
    }
    Partial($, Y = {}) {
      return L$.Map($, (J) => {
        const X = Object.getOwnPropertyNames(J.properties).reduce((Z, W) => {
          return { ...Z, [W]: this.Optional(J.properties[W]) };
        }, {});
        return this.Object(X, this.Discard(J, "required"));
      }, Y);
    }
    Pick($, Y, J = {}) {
      const X = g$.Resolve(Y);
      return L$.Map(f.Clone($), (Z) => {
        if (G.IsArray(Z.required)) {
          if (Z.required = Z.required.filter((W) => X.includes(W)), Z.required.length === 0)
            delete Z.required;
        }
        for (let W of Object.getOwnPropertyNames(Z.properties))
          if (!X.includes(W))
            delete Z.properties[W];
        return this.Create(Z);
      }, J);
    }
    Record($, Y, J = {}) {
      if (F.TTemplateLiteral($)) {
        const X = O$.ParseExact($.pattern);
        return I$.Check(X) ? this.Object([..._$.Generate(X)].reduce((Z, W) => ({ ...Z, [W]: f.Clone(Y) }), {}), J) : this.Create({ ...J, [m8.Kind]: "Record", type: "object", patternProperties: { [$.pattern]: f.Clone(Y) } });
      } else if (F.TUnion($)) {
        const X = k1.Resolve($);
        if (F.TUnionLiteral(X)) {
          const Z = X.anyOf.reduce((W, q) => ({ ...W, [q.const]: f.Clone(Y) }), {});
          return this.Object(Z, { ...J, [m8.Hint]: "Record" });
        } else
          throw Error("StandardTypeBuilder: Record key of type union contains non-literal types");
      } else if (F.TLiteral($))
        if (G.IsString($.const) || G.IsNumber($.const))
          return this.Object({ [$.const]: f.Clone(Y) }, J);
        else
          throw Error("StandardTypeBuilder: Record key of type literal is not of type string or number");
      else if (F.TInteger($) || F.TNumber($))
        return this.Create({ ...J, [m8.Kind]: "Record", type: "object", patternProperties: { [m8.PatternNumberExact]: f.Clone(Y) } });
      else if (F.TString($)) {
        const X = G.IsUndefined($.pattern) ? m8.PatternStringExact : $.pattern;
        return this.Create({ ...J, [m8.Kind]: "Record", type: "object", patternProperties: { [X]: f.Clone(Y) } });
      } else
        throw Error("StandardTypeBuilder: Record key is an invalid type");
    }
    Recursive($, Y = {}) {
      if (G.IsUndefined(Y.$id))
        Y.$id = `T${h6++}`;
      const J = $({ [m8.Kind]: "This", $ref: `${Y.$id}` });
      return J.$id = Y.$id, this.Create({ ...Y, [m8.Hint]: "Recursive", ...J });
    }
    Ref($, Y = {}) {
      if (G.IsString($))
        return this.Create({ ...Y, [m8.Kind]: "Ref", $ref: $ });
      if (G.IsUndefined($.$id))
        throw Error("StandardTypeBuilder.Ref: Target type must specify an $id");
      return this.Create({ ...Y, [m8.Kind]: "Ref", $ref: $.$id });
    }
    Required($, Y = {}) {
      return L$.Map($, (J) => {
        const X = Object.getOwnPropertyNames(J.properties).reduce((Z, W) => {
          return { ...Z, [W]: this.Discard(J.properties[W], m8.Optional) };
        }, {});
        return this.Object(X, J);
      }, Y);
    }
    Rest($) {
      if (F.TTuple($)) {
        if (G.IsUndefined($.items))
          return [];
        return $.items.map((Y) => f.Clone(Y));
      } else
        return [f.Clone($)];
    }
    String($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "String", type: "string" });
    }
    TemplateLiteral($, Y = {}) {
      const J = G.IsString($) ? $1.Create(g1.Parse($)) : $1.Create($);
      return this.Create({ ...Y, [m8.Kind]: "TemplateLiteral", type: "string", pattern: J });
    }
    Tuple($, Y = {}) {
      const [J, X, Z] = [false, $.length, $.length], W = $.map((M) => f.Clone(M)), q = $.length > 0 ? { ...Y, [m8.Kind]: "Tuple", type: "array", items: W, additionalItems: J, minItems: X, maxItems: Z } : { ...Y, [m8.Kind]: "Tuple", type: "array", minItems: X, maxItems: Z };
      return this.Create(q);
    }
    Uncapitalize($, Y = {}) {
      return { ...S$.Map(f.Clone($), "Uncapitalize"), ...Y };
    }
    Union($, Y = {}) {
      if (F.TTemplateLiteral($))
        return o0.Resolve($);
      else {
        const J = $;
        if (J.length === 0)
          return this.Never(Y);
        if (J.length === 1)
          return this.Create(f.Clone(J[0], Y));
        const X = J.map((Z) => f.Clone(Z));
        return this.Create({ ...Y, [m8.Kind]: "Union", anyOf: X });
      }
    }
    Unknown($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Unknown" });
    }
    Unsafe($ = {}) {
      return this.Create({ ...$, [m8.Kind]: $[m8.Kind] || "Unsafe" });
    }
    Uppercase($, Y = {}) {
      return { ...S$.Map(f.Clone($), "Uppercase"), ...Y };
    }
  }
  m8.StandardTypeBuilder = X1;

  class T1 extends X1 {
    AsyncIterator($, Y = {}) {
      return this.Create({ ...Y, [m8.Kind]: "AsyncIterator", type: "AsyncIterator", items: f.Clone($) });
    }
    Awaited($, Y = {}) {
      const J = (X) => {
        if (X.length === 0)
          return X;
        const [Z, ...W] = X;
        return [this.Awaited(Z), ...J(W)];
      };
      return F.TIntersect($) ? m8.Type.Intersect(J($.allOf)) : F.TUnion($) ? m8.Type.Union(J($.anyOf)) : F.TPromise($) ? this.Awaited($.item) : f.Clone($, Y);
    }
    BigInt($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "BigInt", type: "bigint" });
    }
    ConstructorParameters($, Y = {}) {
      return this.Tuple([...$.parameters], { ...Y });
    }
    Constructor($, Y, J) {
      const X = f.Clone(Y), Z = $.map((W) => f.Clone(W));
      return this.Create({ ...J, [m8.Kind]: "Constructor", type: "constructor", parameters: Z, returns: X });
    }
    Date($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Date", type: "Date" });
    }
    Function($, Y, J) {
      const X = f.Clone(Y, {}), Z = $.map((W) => f.Clone(W));
      return this.Create({ ...J, [m8.Kind]: "Function", type: "function", parameters: Z, returns: X });
    }
    InstanceType($, Y = {}) {
      return f.Clone($.returns, Y);
    }
    Iterator($, Y = {}) {
      return this.Create({ ...Y, [m8.Kind]: "Iterator", type: "Iterator", items: f.Clone($) });
    }
    Parameters($, Y = {}) {
      return this.Tuple($.parameters, { ...Y });
    }
    Promise($, Y = {}) {
      return this.Create({ ...Y, [m8.Kind]: "Promise", type: "Promise", item: f.Clone($) });
    }
    RegExp($, Y = {}) {
      const J = G.IsString($) ? $ : $.source;
      return this.Create({ ...Y, [m8.Kind]: "String", type: "string", pattern: J });
    }
    RegEx($, Y = {}) {
      return this.RegExp($, Y);
    }
    ReturnType($, Y = {}) {
      return f.Clone($.returns, Y);
    }
    Symbol($) {
      return this.Create({ ...$, [m8.Kind]: "Symbol", type: "symbol" });
    }
    Undefined($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Undefined", type: "undefined" });
    }
    Uint8Array($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Uint8Array", type: "Uint8Array" });
    }
    Void($ = {}) {
      return this.Create({ ...$, [m8.Kind]: "Void", type: "void" });
    }
  }
  m8.ExtendedTypeBuilder = T1;
  m8.StandardType = new X1;
  m8.Type = new T1;
});
var c8 = e((n8) => {
  Object.defineProperty(n8, "__esModule", { value: true });
  n8.TypeSystem = n8.TypeSystemDuplicateFormat = n8.TypeSystemDuplicateTypeKind = undefined;
  var R$ = f0();

  class i1 extends Error {
    constructor($) {
      super(`Duplicate type kind '${$}' detected`);
    }
  }
  n8.TypeSystemDuplicateTypeKind = i1;

  class p1 extends Error {
    constructor($) {
      super(`Duplicate string format '${$}' detected`);
    }
  }
  n8.TypeSystemDuplicateFormat = p1;
  var o8;
  (function($) {
    $.ExactOptionalPropertyTypes = false, $.AllowArrayObjects = false, $.AllowNaN = false, $.AllowVoidNull = false;
    function Y(X, Z) {
      if (R$.TypeRegistry.Has(X))
        throw new i1(X);
      return R$.TypeRegistry.Set(X, Z), (W = {}) => R$.Type.Unsafe({ ...W, [R$.Kind]: X });
    }
    $.Type = Y;
    function J(X, Z) {
      if (R$.FormatRegistry.Has(X))
        throw new p1(X);
      return R$.FormatRegistry.Set(X, Z), X;
    }
    $.Format = J;
  })(o8 || (n8.TypeSystem = o8 = {}));
});
var d$ = e((q$) => {
  var jY = q$ && q$.__createBinding || (Object.create ? function($, Y, J, X) {
    if (X === undefined)
      X = J;
    var Z = Object.getOwnPropertyDescriptor(Y, J);
    if (!Z || ("get" in Z ? !Y.__esModule : Z.writable || Z.configurable))
      Z = { enumerable: true, get: function() {
        return Y[J];
      } };
    Object.defineProperty($, X, Z);
  } : function($, Y, J, X) {
    if (X === undefined)
      X = J;
    $[X] = Y[J];
  }), OY = q$ && q$.__exportStar || function($, Y) {
    for (var J in $)
      if (J !== "default" && !Object.prototype.hasOwnProperty.call(Y, J))
        jY(Y, $, J);
  };
  Object.defineProperty(q$, "__esModule", { value: true });
  OY(c8(), q$);
});
var G0 = e(($4) => {
  var IY = function($) {
    return Z1($) && (Symbol.asyncIterator in $);
  }, _Y = function($) {
    return Z1($) && (Symbol.iterator in $);
  }, RY = function($) {
    return ArrayBuffer.isView($);
  }, bY = function($) {
    return $ instanceof Promise;
  }, GY = function($) {
    return $ instanceof Uint8Array;
  }, EY = function($) {
    return $ instanceof Date;
  }, xY = function($, Y) {
    return Y in $;
  }, VY = function($) {
    return Z1($) && a8($.constructor) && $.constructor.name === "Object";
  }, Z1 = function($) {
    return $ !== null && typeof $ === "object";
  }, kY = function($) {
    return Array.isArray($) && !ArrayBuffer.isView($);
  }, h8 = function($) {
    return $ === undefined;
  }, l8 = function($) {
    return $ === null;
  }, t8 = function($) {
    return typeof $ === "boolean";
  }, m1 = function($) {
    return typeof $ === "number";
  }, gY = function($) {
    return m1($) && Number.isInteger($);
  }, s8 = function($) {
    return typeof $ === "bigint";
  }, r8 = function($) {
    return typeof $ === "string";
  }, a8 = function($) {
    return typeof $ === "function";
  }, e8 = function($) {
    return typeof $ === "symbol";
  }, fY = function($) {
    return s8($) || t8($) || l8($) || m1($) || r8($) || e8($) || h8($);
  };
  Object.defineProperty($4, "__esModule", { value: true });
  $4.IsValueType = $4.IsSymbol = $4.IsFunction = $4.IsString = $4.IsBigInt = $4.IsInteger = $4.IsNumber = $4.IsBoolean = $4.IsNull = $4.IsUndefined = $4.IsArray = $4.IsObject = $4.IsPlainObject = $4.HasPropertyKey = $4.IsDate = $4.IsUint8Array = $4.IsPromise = $4.IsTypedArray = $4.IsIterator = $4.IsAsyncIterator = undefined;
  $4.IsAsyncIterator = IY;
  $4.IsIterator = _Y;
  $4.IsTypedArray = RY;
  $4.IsPromise = bY;
  $4.IsUint8Array = GY;
  $4.IsDate = EY;
  $4.HasPropertyKey = xY;
  $4.IsPlainObject = VY;
  $4.IsObject = Z1;
  $4.IsArray = kY;
  $4.IsUndefined = h8;
  $4.IsNull = l8;
  $4.IsBoolean = t8;
  $4.IsNumber = m1;
  $4.IsInteger = gY;
  $4.IsBigInt = s8;
  $4.IsString = r8;
  $4.IsFunction = a8;
  $4.IsSymbol = e8;
  $4.IsValueType = fY;
});
var y$ = e((W4) => {
  var ZJ = function($) {
    N0(_0.Array);
    for (let Y of $)
      G$(Y);
  }, WJ = function($) {
    N0(_0.Boolean), N0($ ? 1 : 0);
  }, QJ = function($) {
    N0(_0.BigInt), X4.setBigInt64(0, $);
    for (let Y of Z4)
      N0(Y);
  }, zJ = function($) {
    N0(_0.Date), G$($.getTime());
  }, HJ = function($) {
    N0(_0.Null);
  }, qJ = function($) {
    N0(_0.Number), X4.setFloat64(0, $);
    for (let Y of Z4)
      N0(Y);
  }, MJ = function($) {
    N0(_0.Object);
    for (let Y of globalThis.Object.keys($).sort())
      G$(Y), G$($[Y]);
  }, FJ = function($) {
    N0(_0.String);
    for (let Y = 0;Y < $.length; Y++)
      N0($.charCodeAt(Y));
  }, UJ = function($) {
    N0(_0.Symbol), G$($.description);
  }, BJ = function($) {
    N0(_0.Uint8Array);
    for (let Y = 0;Y < $.length; Y++)
      N0($[Y]);
  }, NJ = function($) {
    return N0(_0.Undefined);
  }, G$ = function($) {
    if (T0.IsArray($))
      return ZJ($);
    if (T0.IsBoolean($))
      return WJ($);
    if (T0.IsBigInt($))
      return QJ($);
    if (T0.IsDate($))
      return zJ($);
    if (T0.IsNull($))
      return HJ($);
    if (T0.IsNumber($))
      return qJ($);
    if (T0.IsPlainObject($))
      return MJ($);
    if (T0.IsString($))
      return FJ($);
    if (T0.IsSymbol($))
      return UJ($);
    if (T0.IsUint8Array($))
      return BJ($);
    if (T0.IsUndefined($))
      return NJ($);
    throw new o1($);
  }, N0 = function($) {
    b$ = b$ ^ XJ[$], b$ = b$ * YJ % JJ;
  }, AJ = function($) {
    return b$ = BigInt("14695981039346656037"), G$($), b$;
  };
  Object.defineProperty(W4, "__esModule", { value: true });
  W4.Hash = W4.ByteMarker = W4.ValueHashError = undefined;
  var T0 = G0();

  class o1 extends Error {
    constructor($) {
      super("Hash: Unable to hash value");
      this.value = $;
    }
  }
  W4.ValueHashError = o1;
  var _0;
  (function($) {
    $[$.Undefined = 0] = "Undefined", $[$.Null = 1] = "Null", $[$.Boolean = 2] = "Boolean", $[$.Number = 3] = "Number", $[$.String = 4] = "String", $[$.Object = 5] = "Object", $[$.Array = 6] = "Array", $[$.Date = 7] = "Date", $[$.Uint8Array = 8] = "Uint8Array", $[$.Symbol = 9] = "Symbol", $[$.BigInt = 10] = "BigInt";
  })(_0 || (W4.ByteMarker = _0 = {}));
  var b$ = BigInt("14695981039346656037"), [YJ, JJ] = [BigInt("1099511628211"), BigInt("2") ** BigInt("64")], XJ = Array.from({ length: 256 }).map(($, Y) => BigInt(Y)), J4 = new Float64Array(1), X4 = new DataView(J4.buffer), Z4 = new Uint8Array(J4.buffer);
  W4.Hash = AJ;
});
var q4 = e((z4) => {
  var c = function($) {
    return $ !== undefined;
  }, KJ = function($, Y) {
    return W1.TypeSystem.ExactOptionalPropertyTypes ? Y in $ : $[Y] !== undefined;
  }, h1 = function($) {
    const Y = Y0.IsObject($);
    return W1.TypeSystem.AllowArrayObjects ? Y : Y && !Y0.IsArray($);
  }, SJ = function($) {
    return h1($) && !($ instanceof Date) && !($ instanceof Uint8Array);
  }, n1 = function($) {
    const Y = Y0.IsNumber($);
    return W1.TypeSystem.AllowNaN ? Y : Y && Number.isFinite($);
  }, LJ = function($) {
    const Y = Y0.IsUndefined($);
    return W1.TypeSystem.AllowVoidNull ? Y || $ === null : Y;
  };
  function* CJ($, Y, J, X) {
  }
  function* jJ($, Y, J, X) {
    if (!Y0.IsArray(X))
      return yield { type: _.Array, schema: $, path: J, value: X, message: "Expected array" };
    if (c($.minItems) && !(X.length >= $.minItems))
      yield { type: _.ArrayMinItems, schema: $, path: J, value: X, message: `Expected array length to be greater or equal to ${$.minItems}` };
    if (c($.maxItems) && !(X.length <= $.maxItems))
      yield { type: _.ArrayMinItems, schema: $, path: J, value: X, message: `Expected array length to be less or equal to ${$.maxItems}` };
    for (let q = 0;q < X.length; q++)
      yield* H0($.items, Y, `${J}/${q}`, X[q]);
    if ($.uniqueItems === true && !function() {
      const q = new Set;
      for (let M of X) {
        const A = PJ.Hash(M);
        if (q.has(A))
          return false;
        else
          q.add(A);
      }
      return true;
    }())
      yield { type: _.ArrayUniqueItems, schema: $, path: J, value: X, message: "Expected array elements to be unique" };
    if (!(c($.contains) || n1($.minContains) || n1($.maxContains)))
      return;
    const Z = c($.contains) ? $.contains : E0.Type.Never(), W = X.reduce((q, M, A) => H0(Z, Y, `${J}${A}`, M).next().done === true ? q + 1 : q, 0);
    if (W === 0)
      yield { type: _.ArrayContains, schema: $, path: J, value: X, message: "Expected array to contain at least one matching type" };
    if (Y0.IsNumber($.minContains) && W < $.minContains)
      yield { type: _.ArrayMinContains, schema: $, path: J, value: X, message: `Expected array to contain at least ${$.minContains} matching types` };
    if (Y0.IsNumber($.maxContains) && W > $.maxContains)
      yield { type: _.ArrayMaxContains, schema: $, path: J, value: X, message: `Expected array to contain no more than ${$.maxContains} matching types` };
  }
  function* OJ($, Y, J, X) {
    if (!Y0.IsAsyncIterator(X))
      yield { type: _.AsyncIterator, schema: $, path: J, value: X, message: "Expected value to be an async iterator" };
  }
  function* IJ($, Y, J, X) {
    if (!Y0.IsBigInt(X))
      return yield { type: _.BigInt, schema: $, path: J, value: X, message: "Expected bigint" };
    if (c($.multipleOf) && X % $.multipleOf !== BigInt(0))
      yield { type: _.BigIntMultipleOf, schema: $, path: J, value: X, message: `Expected bigint to be a multiple of ${$.multipleOf}` };
    if (c($.exclusiveMinimum) && !(X > $.exclusiveMinimum))
      yield { type: _.BigIntExclusiveMinimum, schema: $, path: J, value: X, message: `Expected bigint to be greater than ${$.exclusiveMinimum}` };
    if (c($.exclusiveMaximum) && !(X < $.exclusiveMaximum))
      yield { type: _.BigIntExclusiveMaximum, schema: $, path: J, value: X, message: `Expected bigint to be less than ${$.exclusiveMaximum}` };
    if (c($.minimum) && !(X >= $.minimum))
      yield { type: _.BigIntMinimum, schema: $, path: J, value: X, message: `Expected bigint to be greater or equal to ${$.minimum}` };
    if (c($.maximum) && !(X <= $.maximum))
      yield { type: _.BigIntMaximum, schema: $, path: J, value: X, message: `Expected bigint to be less or equal to ${$.maximum}` };
  }
  function* _J($, Y, J, X) {
    if (!Y0.IsBoolean(X))
      return yield { type: _.Boolean, schema: $, path: J, value: X, message: "Expected boolean" };
  }
  function* RJ($, Y, J, X) {
    yield* H0($.returns, Y, J, X.prototype);
  }
  function* bJ($, Y, J, X) {
    if (!Y0.IsDate(X))
      return yield { type: _.Date, schema: $, path: J, value: X, message: "Expected Date object" };
    if (!isFinite(X.getTime()))
      return yield { type: _.Date, schema: $, path: J, value: X, message: "Invalid Date" };
    if (c($.exclusiveMinimumTimestamp) && !(X.getTime() > $.exclusiveMinimumTimestamp))
      yield { type: _.DateExclusiveMinimumTimestamp, schema: $, path: J, value: X, message: `Expected Date timestamp to be greater than ${$.exclusiveMinimum}` };
    if (c($.exclusiveMaximumTimestamp) && !(X.getTime() < $.exclusiveMaximumTimestamp))
      yield { type: _.DateExclusiveMaximumTimestamp, schema: $, path: J, value: X, message: `Expected Date timestamp to be less than ${$.exclusiveMaximum}` };
    if (c($.minimumTimestamp) && !(X.getTime() >= $.minimumTimestamp))
      yield { type: _.DateMinimumTimestamp, schema: $, path: J, value: X, message: `Expected Date timestamp to be greater or equal to ${$.minimum}` };
    if (c($.maximumTimestamp) && !(X.getTime() <= $.maximumTimestamp))
      yield { type: _.DateMaximumTimestamp, schema: $, path: J, value: X, message: `Expected Date timestamp to be less or equal to ${$.maximum}` };
  }
  function* GJ($, Y, J, X) {
    if (!Y0.IsFunction(X))
      return yield { type: _.Function, schema: $, path: J, value: X, message: "Expected function" };
  }
  function* EJ($, Y, J, X) {
    if (!Y0.IsInteger(X))
      return yield { type: _.Integer, schema: $, path: J, value: X, message: "Expected integer" };
    if (c($.multipleOf) && X % $.multipleOf !== 0)
      yield { type: _.IntegerMultipleOf, schema: $, path: J, value: X, message: `Expected integer to be a multiple of ${$.multipleOf}` };
    if (c($.exclusiveMinimum) && !(X > $.exclusiveMinimum))
      yield { type: _.IntegerExclusiveMinimum, schema: $, path: J, value: X, message: `Expected integer to be greater than ${$.exclusiveMinimum}` };
    if (c($.exclusiveMaximum) && !(X < $.exclusiveMaximum))
      yield { type: _.IntegerExclusiveMaximum, schema: $, path: J, value: X, message: `Expected integer to be less than ${$.exclusiveMaximum}` };
    if (c($.minimum) && !(X >= $.minimum))
      yield { type: _.IntegerMinimum, schema: $, path: J, value: X, message: `Expected integer to be greater or equal to ${$.minimum}` };
    if (c($.maximum) && !(X <= $.maximum))
      yield { type: _.IntegerMaximum, schema: $, path: J, value: X, message: `Expected integer to be less or equal to ${$.maximum}` };
  }
  function* xJ($, Y, J, X) {
    for (let Z of $.allOf) {
      const W = H0(Z, Y, J, X).next();
      if (!W.done) {
        yield W.value, yield { type: _.Intersect, schema: $, path: J, value: X, message: "Expected all sub schemas to be valid" };
        return;
      }
    }
    if ($.unevaluatedProperties === false) {
      const Z = new RegExp(E0.KeyResolver.ResolvePattern($));
      for (let W of Object.getOwnPropertyNames(X))
        if (!Z.test(W))
          yield { type: _.IntersectUnevaluatedProperties, schema: $, path: `${J}/${W}`, value: X, message: "Unexpected property" };
    }
    if (typeof $.unevaluatedProperties === "object") {
      const Z = new RegExp(E0.KeyResolver.ResolvePattern($));
      for (let W of Object.getOwnPropertyNames(X))
        if (!Z.test(W)) {
          const q = H0($.unevaluatedProperties, Y, `${J}/${W}`, X[W]).next();
          if (!q.done) {
            yield q.value, yield { type: _.IntersectUnevaluatedProperties, schema: $, path: `${J}/${W}`, value: X, message: "Invalid additional property" };
            return;
          }
        }
    }
  }
  function* VJ($, Y, J, X) {
    if (!(h1(X) && (Symbol.iterator in X)))
      yield { type: _.Iterator, schema: $, path: J, value: X, message: "Expected value to be an iterator" };
  }
  function* kJ($, Y, J, X) {
    if (X !== $.const) {
      const Z = typeof $.const === "string" ? `'${$.const}'` : $.const;
      return yield { type: _.Literal, schema: $, path: J, value: X, message: `Expected ${Z}` };
    }
  }
  function* gJ($, Y, J, X) {
    yield { type: _.Never, schema: $, path: J, value: X, message: "Value cannot be validated" };
  }
  function* fJ($, Y, J, X) {
    if (H0($.not, Y, J, X).next().done === true)
      yield { type: _.Not, schema: $, path: J, value: X, message: "Value should not validate" };
  }
  function* TJ($, Y, J, X) {
    if (!Y0.IsNull(X))
      return yield { type: _.Null, schema: $, path: J, value: X, message: "Expected null" };
  }
  function* dJ($, Y, J, X) {
    if (!n1(X))
      return yield { type: _.Number, schema: $, path: J, value: X, message: "Expected number" };
    if (c($.multipleOf) && X % $.multipleOf !== 0)
      yield { type: _.NumberMultipleOf, schema: $, path: J, value: X, message: `Expected number to be a multiple of ${$.multipleOf}` };
    if (c($.exclusiveMinimum) && !(X > $.exclusiveMinimum))
      yield { type: _.NumberExclusiveMinimum, schema: $, path: J, value: X, message: `Expected number to be greater than ${$.exclusiveMinimum}` };
    if (c($.exclusiveMaximum) && !(X < $.exclusiveMaximum))
      yield { type: _.NumberExclusiveMaximum, schema: $, path: J, value: X, message: `Expected number to be less than ${$.exclusiveMaximum}` };
    if (c($.minimum) && !(X >= $.minimum))
      yield { type: _.NumberMinimum, schema: $, path: J, value: X, message: `Expected number to be greater or equal to ${$.minimum}` };
    if (c($.maximum) && !(X <= $.maximum))
      yield { type: _.NumberMaximum, schema: $, path: J, value: X, message: `Expected number to be less or equal to ${$.maximum}` };
  }
  function* yJ($, Y, J, X) {
    if (!h1(X))
      return yield { type: _.Object, schema: $, path: J, value: X, message: "Expected object" };
    if (c($.minProperties) && !(Object.getOwnPropertyNames(X).length >= $.minProperties))
      yield { type: _.ObjectMinProperties, schema: $, path: J, value: X, message: `Expected object to have at least ${$.minProperties} properties` };
    if (c($.maxProperties) && !(Object.getOwnPropertyNames(X).length <= $.maxProperties))
      yield { type: _.ObjectMaxProperties, schema: $, path: J, value: X, message: `Expected object to have no more than ${$.maxProperties} properties` };
    const Z = Array.isArray($.required) ? $.required : [], W = Object.getOwnPropertyNames($.properties), q = Object.getOwnPropertyNames(X);
    for (let M of W) {
      const A = $.properties[M];
      if ($.required && $.required.includes(M)) {
        if (yield* H0(A, Y, `${J}/${M}`, X[M]), E0.ExtendsUndefined.Check($) && !(M in X))
          yield { type: _.ObjectRequiredProperties, schema: A, path: `${J}/${M}`, value: undefined, message: "Expected required property" };
      } else if (KJ(X, M))
        yield* H0(A, Y, `${J}/${M}`, X[M]);
    }
    for (let M of Z) {
      if (q.includes(M))
        continue;
      yield { type: _.ObjectRequiredProperties, schema: $.properties[M], path: `${J}/${M}`, value: undefined, message: "Expected required property" };
    }
    if ($.additionalProperties === false) {
      for (let M of q)
        if (!W.includes(M))
          yield { type: _.ObjectAdditionalProperties, schema: $, path: `${J}/${M}`, value: X[M], message: "Unexpected property" };
    }
    if (typeof $.additionalProperties === "object")
      for (let M of q) {
        if (W.includes(M))
          continue;
        yield* H0($.additionalProperties, Y, `${J}/${M}`, X[M]);
      }
  }
  function* vJ($, Y, J, X) {
    if (!Y0.IsPromise(X))
      yield { type: _.Promise, schema: $, path: J, value: X, message: "Expected Promise" };
  }
  function* iJ($, Y, J, X) {
    if (!SJ(X))
      return yield { type: _.Object, schema: $, path: J, value: X, message: "Expected record object" };
    if (c($.minProperties) && !(Object.getOwnPropertyNames(X).length >= $.minProperties))
      yield { type: _.ObjectMinProperties, schema: $, path: J, value: X, message: `Expected object to have at least ${$.minProperties} properties` };
    if (c($.maxProperties) && !(Object.getOwnPropertyNames(X).length <= $.maxProperties))
      yield { type: _.ObjectMaxProperties, schema: $, path: J, value: X, message: `Expected object to have no more than ${$.maxProperties} properties` };
    const [Z, W] = Object.entries($.patternProperties)[0], q = new RegExp(Z);
    for (let [M, A] of Object.entries(X)) {
      if (q.test(M)) {
        yield* H0(W, Y, `${J}/${M}`, A);
        continue;
      }
      if (typeof $.additionalProperties === "object")
        yield* H0($.additionalProperties, Y, `${J}/${M}`, A);
      if ($.additionalProperties === false) {
        const D = `${J}/${M}`, N = `Unexpected property '${D}'`;
        return yield { type: _.ObjectAdditionalProperties, schema: $, path: D, value: A, message: N };
      }
    }
  }
  function* pJ($, Y, J, X) {
    const Z = Y.findIndex((q) => q.$id === $.$ref);
    if (Z === -1)
      throw new Q1($);
    const W = Y[Z];
    yield* H0(W, Y, J, X);
  }
  function* mJ($, Y, J, X) {
    if (!Y0.IsString(X))
      return yield { type: _.String, schema: $, path: J, value: X, message: "Expected string" };
    if (c($.minLength) && !(X.length >= $.minLength))
      yield { type: _.StringMinLength, schema: $, path: J, value: X, message: `Expected string length greater or equal to ${$.minLength}` };
    if (c($.maxLength) && !(X.length <= $.maxLength))
      yield { type: _.StringMaxLength, schema: $, path: J, value: X, message: `Expected string length less or equal to ${$.maxLength}` };
    if (Y0.IsString($.pattern)) {
      if (!new RegExp($.pattern).test(X))
        yield { type: _.StringPattern, schema: $, path: J, value: X, message: `Expected string to match pattern ${$.pattern}` };
    }
    if (Y0.IsString($.format)) {
      if (!E0.FormatRegistry.Has($.format))
        yield { type: _.StringFormatUnknown, schema: $, path: J, value: X, message: `Unknown string format '${$.format}'` };
      else if (!E0.FormatRegistry.Get($.format)(X))
        yield { type: _.StringFormat, schema: $, path: J, value: X, message: `Expected string to match format '${$.format}'` };
    }
  }
  function* oJ($, Y, J, X) {
    if (!Y0.IsSymbol(X))
      return yield { type: _.Symbol, schema: $, path: J, value: X, message: "Expected symbol" };
  }
  function* nJ($, Y, J, X) {
    if (!Y0.IsString(X))
      return yield { type: _.String, schema: $, path: J, value: X, message: "Expected string" };
    if (!new RegExp($.pattern).test(X))
      yield { type: _.StringPattern, schema: $, path: J, value: X, message: `Expected string to match pattern ${$.pattern}` };
  }
  function* uJ($, Y, J, X) {
    const Z = Y.findIndex((q) => q.$id === $.$ref);
    if (Z === -1)
      throw new Q1($);
    const W = Y[Z];
    yield* H0(W, Y, J, X);
  }
  function* cJ($, Y, J, X) {
    if (!Y0.IsArray(X))
      return yield { type: _.Array, schema: $, path: J, value: X, message: "Expected Array" };
    if ($.items === undefined && X.length !== 0)
      return yield { type: _.TupleZeroLength, schema: $, path: J, value: X, message: "Expected tuple to have 0 elements" };
    if (X.length !== $.maxItems)
      yield { type: _.TupleLength, schema: $, path: J, value: X, message: `Expected tuple to have ${$.maxItems} elements` };
    if (!$.items)
      return;
    for (let Z = 0;Z < $.items.length; Z++)
      yield* H0($.items[Z], Y, `${J}/${Z}`, X[Z]);
  }
  function* hJ($, Y, J, X) {
    if (X !== undefined)
      yield { type: _.Undefined, schema: $, path: J, value: X, message: "Expected undefined" };
  }
  function* lJ($, Y, J, X) {
    const Z = [];
    for (let W of $.anyOf) {
      const q = [...H0(W, Y, J, X)];
      if (q.length === 0)
        return;
      Z.push(...q);
    }
    if (Z.length > 0)
      yield { type: _.Union, schema: $, path: J, value: X, message: "Expected value of union" };
    for (let W of Z)
      yield W;
  }
  function* tJ($, Y, J, X) {
    if (!Y0.IsUint8Array(X))
      return yield { type: _.Uint8Array, schema: $, path: J, value: X, message: "Expected Uint8Array" };
    if (c($.maxByteLength) && !(X.length <= $.maxByteLength))
      yield { type: _.Uint8ArrayMaxByteLength, schema: $, path: J, value: X, message: `Expected Uint8Array to have a byte length less or equal to ${$.maxByteLength}` };
    if (c($.minByteLength) && !(X.length >= $.minByteLength))
      yield { type: _.Uint8ArrayMinByteLength, schema: $, path: J, value: X, message: `Expected Uint8Array to have a byte length greater or equal to ${$.maxByteLength}` };
  }
  function* sJ($, Y, J, X) {
  }
  function* rJ($, Y, J, X) {
    if (!LJ(X))
      return yield { type: _.Void, schema: $, path: J, value: X, message: "Expected void" };
  }
  function* aJ($, Y, J, X) {
    if (!E0.TypeRegistry.Get($[E0.Kind])($, X))
      return yield { type: _.Kind, schema: $, path: J, value: X, message: `Expected kind ${$[E0.Kind]}` };
  }
  function* H0($, Y, J, X) {
    const Z = c($.$id) ? [...Y, $] : Y, W = $;
    switch (W[E0.Kind]) {
      case "Any":
        return yield* CJ(W, Z, J, X);
      case "Array":
        return yield* jJ(W, Z, J, X);
      case "AsyncIterator":
        return yield* OJ(W, Z, J, X);
      case "BigInt":
        return yield* IJ(W, Z, J, X);
      case "Boolean":
        return yield* _J(W, Z, J, X);
      case "Constructor":
        return yield* RJ(W, Z, J, X);
      case "Date":
        return yield* bJ(W, Z, J, X);
      case "Function":
        return yield* GJ(W, Z, J, X);
      case "Integer":
        return yield* EJ(W, Z, J, X);
      case "Intersect":
        return yield* xJ(W, Z, J, X);
      case "Iterator":
        return yield* VJ(W, Z, J, X);
      case "Literal":
        return yield* kJ(W, Z, J, X);
      case "Never":
        return yield* gJ(W, Z, J, X);
      case "Not":
        return yield* fJ(W, Z, J, X);
      case "Null":
        return yield* TJ(W, Z, J, X);
      case "Number":
        return yield* dJ(W, Z, J, X);
      case "Object":
        return yield* yJ(W, Z, J, X);
      case "Promise":
        return yield* vJ(W, Z, J, X);
      case "Record":
        return yield* iJ(W, Z, J, X);
      case "Ref":
        return yield* pJ(W, Z, J, X);
      case "String":
        return yield* mJ(W, Z, J, X);
      case "Symbol":
        return yield* oJ(W, Z, J, X);
      case "TemplateLiteral":
        return yield* nJ(W, Z, J, X);
      case "This":
        return yield* uJ(W, Z, J, X);
      case "Tuple":
        return yield* cJ(W, Z, J, X);
      case "Undefined":
        return yield* hJ(W, Z, J, X);
      case "Union":
        return yield* lJ(W, Z, J, X);
      case "Uint8Array":
        return yield* tJ(W, Z, J, X);
      case "Unknown":
        return yield* sJ(W, Z, J, X);
      case "Void":
        return yield* rJ(W, Z, J, X);
      default:
        if (!E0.TypeRegistry.Has(W[E0.Kind]))
          throw new c1($);
        return yield* aJ(W, Z, J, X);
    }
  }
  var eJ = function(...$) {
    const Y = $.length === 3 ? H0($[0], $[1], "", $[2]) : H0($[0], [], "", $[1]);
    return new u1(Y);
  };
  Object.defineProperty(z4, "__esModule", { value: true });
  z4.Errors = z4.ValueErrorsDereferenceError = z4.ValueErrorsUnknownTypeError = z4.ValueErrorIterator = z4.ValueErrorType = undefined;
  var W1 = d$(), E0 = f0(), PJ = y$(), Y0 = G0(), _;
  (function($) {
    $[$.Array = 0] = "Array", $[$.ArrayMinItems = 1] = "ArrayMinItems", $[$.ArrayMaxItems = 2] = "ArrayMaxItems", $[$.ArrayContains = 3] = "ArrayContains", $[$.ArrayMinContains = 4] = "ArrayMinContains", $[$.ArrayMaxContains = 5] = "ArrayMaxContains", $[$.ArrayUniqueItems = 6] = "ArrayUniqueItems", $[$.AsyncIterator = 7] = "AsyncIterator", $[$.BigInt = 8] = "BigInt", $[$.BigIntMultipleOf = 9] = "BigIntMultipleOf", $[$.BigIntExclusiveMinimum = 10] = "BigIntExclusiveMinimum", $[$.BigIntExclusiveMaximum = 11] = "BigIntExclusiveMaximum", $[$.BigIntMinimum = 12] = "BigIntMinimum", $[$.BigIntMaximum = 13] = "BigIntMaximum", $[$.Boolean = 14] = "Boolean", $[$.Date = 15] = "Date", $[$.DateExclusiveMinimumTimestamp = 16] = "DateExclusiveMinimumTimestamp", $[$.DateExclusiveMaximumTimestamp = 17] = "DateExclusiveMaximumTimestamp", $[$.DateMinimumTimestamp = 18] = "DateMinimumTimestamp", $[$.DateMaximumTimestamp = 19] = "DateMaximumTimestamp", $[$.Function = 20] = "Function", $[$.Integer = 21] = "Integer", $[$.IntegerMultipleOf = 22] = "IntegerMultipleOf", $[$.IntegerExclusiveMinimum = 23] = "IntegerExclusiveMinimum", $[$.IntegerExclusiveMaximum = 24] = "IntegerExclusiveMaximum", $[$.IntegerMinimum = 25] = "IntegerMinimum", $[$.IntegerMaximum = 26] = "IntegerMaximum", $[$.Intersect = 27] = "Intersect", $[$.IntersectUnevaluatedProperties = 28] = "IntersectUnevaluatedProperties", $[$.Iterator = 29] = "Iterator", $[$.Literal = 30] = "Literal", $[$.Never = 31] = "Never", $[$.Not = 32] = "Not", $[$.Null = 33] = "Null", $[$.Number = 34] = "Number", $[$.NumberMultipleOf = 35] = "NumberMultipleOf", $[$.NumberExclusiveMinimum = 36] = "NumberExclusiveMinimum", $[$.NumberExclusiveMaximum = 37] = "NumberExclusiveMaximum", $[$.NumberMinimum = 38] = "NumberMinimum", $[$.NumberMaximum = 39] = "NumberMaximum", $[$.Object = 40] = "Object", $[$.ObjectMinProperties = 41] = "ObjectMinProperties", $[$.ObjectMaxProperties = 42] = "ObjectMaxProperties", $[$.ObjectAdditionalProperties = 43] = "ObjectAdditionalProperties", $[$.ObjectRequiredProperties = 44] = "ObjectRequiredProperties", $[$.Promise = 45] = "Promise", $[$.RecordKeyNumeric = 46] = "RecordKeyNumeric", $[$.RecordKeyString = 47] = "RecordKeyString", $[$.String = 48] = "String", $[$.StringMinLength = 49] = "StringMinLength", $[$.StringMaxLength = 50] = "StringMaxLength", $[$.StringPattern = 51] = "StringPattern", $[$.StringFormatUnknown = 52] = "StringFormatUnknown", $[$.StringFormat = 53] = "StringFormat", $[$.Symbol = 54] = "Symbol", $[$.TupleZeroLength = 55] = "TupleZeroLength", $[$.TupleLength = 56] = "TupleLength", $[$.Undefined = 57] = "Undefined", $[$.Union = 58] = "Union", $[$.Uint8Array = 59] = "Uint8Array", $[$.Uint8ArrayMinByteLength = 60] = "Uint8ArrayMinByteLength", $[$.Uint8ArrayMaxByteLength = 61] = "Uint8ArrayMaxByteLength", $[$.Void = 62] = "Void", $[$.Kind = 63] = "Kind";
  })(_ || (z4.ValueErrorType = _ = {}));

  class u1 {
    constructor($) {
      this.iterator = $;
    }
    [Symbol.iterator]() {
      return this.iterator;
    }
    First() {
      const $ = this.iterator.next();
      return $.done ? undefined : $.value;
    }
  }
  z4.ValueErrorIterator = u1;

  class c1 extends Error {
    constructor($) {
      super("ValueErrors: Unknown type");
      this.schema = $;
    }
  }
  z4.ValueErrorsUnknownTypeError = c1;

  class Q1 extends Error {
    constructor($) {
      super(`ValueErrors: Unable to dereference type with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  z4.ValueErrorsDereferenceError = Q1;
  z4.Errors = eJ;
});
var v$ = e((M$) => {
  var ZX = M$ && M$.__createBinding || (Object.create ? function($, Y, J, X) {
    if (X === undefined)
      X = J;
    var Z = Object.getOwnPropertyDescriptor(Y, J);
    if (!Z || ("get" in Z ? !Y.__esModule : Z.writable || Z.configurable))
      Z = { enumerable: true, get: function() {
        return Y[J];
      } };
    Object.defineProperty($, X, Z);
  } : function($, Y, J, X) {
    if (X === undefined)
      X = J;
    $[X] = Y[J];
  }), WX = M$ && M$.__exportStar || function($, Y) {
    for (var J in $)
      if (J !== "default" && !Object.prototype.hasOwnProperty.call(Y, J))
        ZX(Y, $, J);
  };
  Object.defineProperty(M$, "__esModule", { value: true });
  WX(q4(), M$);
});
var z1 = e((F4) => {
  Object.defineProperty(F4, "__esModule", { value: true });
  F4.ValuePointer = F4.ValuePointerRootDeleteError = F4.ValuePointerRootSetError = undefined;

  class l1 extends Error {
    constructor($, Y, J) {
      super("ValuePointer: Cannot set root value");
      this.value = $, this.path = Y, this.update = J;
    }
  }
  F4.ValuePointerRootSetError = l1;

  class t1 extends Error {
    constructor($, Y) {
      super("ValuePointer: Cannot delete root value");
      this.value = $, this.path = Y;
    }
  }
  F4.ValuePointerRootDeleteError = t1;
  var M4;
  (function($) {
    function Y(M) {
      return M.indexOf("~") === -1 ? M : M.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    function* J(M) {
      if (M === "")
        return;
      let [A, D] = [0, 0];
      for (let N = 0;N < M.length; N++)
        if (M.charAt(N) === "/")
          if (N === 0)
            A = N + 1;
          else
            D = N, yield Y(M.slice(A, D)), A = N + 1;
        else
          D = N;
      yield Y(M.slice(A));
    }
    $.Format = J;
    function X(M, A, D) {
      if (A === "")
        throw new l1(M, A, D);
      let [N, K, w] = [null, M, ""];
      for (let B of J(A)) {
        if (K[B] === undefined)
          K[B] = {};
        N = K, K = K[B], w = B;
      }
      N[w] = D;
    }
    $.Set = X;
    function Z(M, A) {
      if (A === "")
        throw new t1(M, A);
      let [D, N, K] = [null, M, ""];
      for (let w of J(A)) {
        if (N[w] === undefined || N[w] === null)
          return;
        D = N, N = N[w], K = w;
      }
      if (Array.isArray(D)) {
        const w = parseInt(K);
        D.splice(w, 1);
      } else
        delete D[K];
    }
    $.Delete = Z;
    function W(M, A) {
      if (A === "")
        return true;
      let [D, N, K] = [null, M, ""];
      for (let w of J(A)) {
        if (N[w] === undefined)
          return false;
        D = N, N = N[w], K = w;
      }
      return Object.getOwnPropertyNames(D).includes(K);
    }
    $.Has = W;
    function q(M, A) {
      if (A === "")
        return M;
      let D = M;
      for (let N of J(A)) {
        if (D[N] === undefined)
          return;
        D = D[N];
      }
      return D;
    }
    $.Get = q;
  })(M4 || (F4.ValuePointer = M4 = {}));
});
var E$ = e((B4) => {
  var HX = function($) {
    return [...Object.getOwnPropertyNames($), ...Object.getOwnPropertySymbols($)].reduce((J, X) => ({ ...J, [X]: s1($[X]) }), {});
  }, qX = function($) {
    return $.map((Y) => s1(Y));
  }, MX = function($) {
    return $.slice();
  }, FX = function($) {
    return new Date($.toISOString());
  }, UX = function($) {
    return $;
  }, BX = function($) {
    return $;
  }, NX = function($) {
    return $;
  }, AX = function($) {
    return $;
  }, wX = function($) {
    return $;
  }, s1 = function($) {
    if (n0.IsArray($))
      return qX($);
    if (n0.IsAsyncIterator($))
      return BX($);
    if (n0.IsFunction($))
      return AX($);
    if (n0.IsIterator($))
      return NX($);
    if (n0.IsPromise($))
      return wX($);
    if (n0.IsDate($))
      return FX($);
    if (n0.IsPlainObject($))
      return HX($);
    if (n0.IsTypedArray($))
      return MX($);
    if (n0.IsValueType($))
      return UX($);
    throw new Error("ValueClone: Unable to clone value");
  };
  Object.defineProperty(B4, "__esModule", { value: true });
  B4.Clone = undefined;
  var n0 = G0();
  B4.Clone = s1;
});
var $8 = e((D4) => {
  var i$ = function($, Y) {
    return { type: "update", path: $, value: Y };
  }, A4 = function($, Y) {
    return { type: "insert", path: $, value: Y };
  }, w4 = function($) {
    return { type: "delete", path: $ };
  };
  function* DX($, Y, J) {
    if (!A0.IsPlainObject(J))
      return yield i$($, J);
    const X = [...Object.keys(Y), ...Object.getOwnPropertySymbols(Y)], Z = [...Object.keys(J), ...Object.getOwnPropertySymbols(J)];
    for (let W of X) {
      if (A0.IsSymbol(W))
        throw new x$(W);
      if (A0.IsUndefined(J[W]) && Z.includes(W))
        yield i$(`${$}/${String(W)}`, undefined);
    }
    for (let W of Z) {
      if (A0.IsUndefined(Y[W]) || A0.IsUndefined(J[W]))
        continue;
      if (A0.IsSymbol(W))
        throw new x$(W);
      yield* H1(`${$}/${String(W)}`, Y[W], J[W]);
    }
    for (let W of Z) {
      if (A0.IsSymbol(W))
        throw new x$(W);
      if (A0.IsUndefined(Y[W]))
        yield A4(`${$}/${String(W)}`, J[W]);
    }
    for (let W of X.reverse()) {
      if (A0.IsSymbol(W))
        throw new x$(W);
      if (A0.IsUndefined(J[W]) && !Z.includes(W))
        yield w4(`${$}/${String(W)}`);
    }
  }
  function* PX($, Y, J) {
    if (!A0.IsArray(J))
      return yield i$($, J);
    for (let X = 0;X < Math.min(Y.length, J.length); X++)
      yield* H1(`${$}/${X}`, Y[X], J[X]);
    for (let X = 0;X < J.length; X++) {
      if (X < Y.length)
        continue;
      yield A4(`${$}/${X}`, J[X]);
    }
    for (let X = Y.length - 1;X >= 0; X--) {
      if (X < J.length)
        continue;
      yield w4(`${$}/${X}`);
    }
  }
  function* KX($, Y, J) {
    if (!A0.IsTypedArray(J) || Y.length !== J.length || Object.getPrototypeOf(Y).constructor.name !== Object.getPrototypeOf(J).constructor.name)
      return yield i$($, J);
    for (let X = 0;X < Math.min(Y.length, J.length); X++)
      yield* H1(`${$}/${X}`, Y[X], J[X]);
  }
  function* SX($, Y, J) {
    if (Y === J)
      return;
    yield i$($, J);
  }
  function* H1($, Y, J) {
    if (A0.IsPlainObject(Y))
      return yield* DX($, Y, J);
    if (A0.IsArray(Y))
      return yield* PX($, Y, J);
    if (A0.IsTypedArray(Y))
      return yield* KX($, Y, J);
    if (A0.IsValueType(Y))
      return yield* SX($, Y, J);
    throw new e1(Y);
  }
  var LX = function($, Y) {
    return [...H1("", $, Y)];
  }, CX = function($) {
    return $.length > 0 && $[0].path === "" && $[0].type === "update";
  }, jX = function($) {
    return $.length === 0;
  }, OX = function($, Y) {
    if (CX(Y))
      return a1.Clone(Y[0].value);
    if (jX(Y))
      return a1.Clone($);
    const J = a1.Clone($);
    for (let X of Y)
      switch (X.type) {
        case "insert": {
          r1.ValuePointer.Set(J, X.path, X.value);
          break;
        }
        case "update": {
          r1.ValuePointer.Set(J, X.path, X.value);
          break;
        }
        case "delete": {
          r1.ValuePointer.Delete(J, X.path);
          break;
        }
      }
    return J;
  };
  Object.defineProperty(D4, "__esModule", { value: true });
  D4.Patch = D4.Diff = D4.ValueDeltaUnableToDiffUnknownValue = D4.ValueDeltaObjectWithSymbolKeyError = D4.Edit = D4.Delete = D4.Update = D4.Insert = undefined;
  var x0 = f0(), r1 = z1(), A0 = G0(), a1 = E$();
  D4.Insert = x0.Type.Object({ type: x0.Type.Literal("insert"), path: x0.Type.String(), value: x0.Type.Unknown() });
  D4.Update = x0.Type.Object({ type: x0.Type.Literal("update"), path: x0.Type.String(), value: x0.Type.Unknown() });
  D4.Delete = x0.Type.Object({ type: x0.Type.Literal("delete"), path: x0.Type.String() });
  D4.Edit = x0.Type.Union([D4.Insert, D4.Update, D4.Delete]);

  class x$ extends Error {
    constructor($) {
      super("ValueDelta: Cannot diff objects with symbol keys");
      this.key = $;
    }
  }
  D4.ValueDeltaObjectWithSymbolKeyError = x$;

  class e1 extends Error {
    constructor($) {
      super("ValueDelta: Unable to create diff edits for unknown value");
      this.value = $;
    }
  }
  D4.ValueDeltaUnableToDiffUnknownValue = e1;
  D4.Diff = LX;
  D4.Patch = OX;
});
var I4 = e((j4) => {
  var GX = function($, Y, J, X) {
    if (!R0.IsPlainObject(J))
      q1.ValuePointer.Set($, Y, Y8.Clone(X));
    else {
      const Z = Object.keys(J), W = Object.keys(X);
      for (let q of Z)
        if (!W.includes(q))
          delete J[q];
      for (let q of W)
        if (!Z.includes(q))
          J[q] = null;
      for (let q of W)
        Z8($, `${Y}/${q}`, J[q], X[q]);
    }
  }, EX = function($, Y, J, X) {
    if (!R0.IsArray(J))
      q1.ValuePointer.Set($, Y, Y8.Clone(X));
    else {
      for (let Z = 0;Z < X.length; Z++)
        Z8($, `${Y}/${Z}`, J[Z], X[Z]);
      J.splice(X.length);
    }
  }, xX = function($, Y, J, X) {
    if (R0.IsTypedArray(J) && J.length === X.length)
      for (let Z = 0;Z < J.length; Z++)
        J[Z] = X[Z];
    else
      q1.ValuePointer.Set($, Y, Y8.Clone(X));
  }, VX = function($, Y, J, X) {
    if (J === X)
      return;
    q1.ValuePointer.Set($, Y, X);
  }, Z8 = function($, Y, J, X) {
    if (R0.IsArray(X))
      return EX($, Y, J, X);
    if (R0.IsTypedArray(X))
      return xX($, Y, J, X);
    if (R0.IsPlainObject(X))
      return GX($, Y, J, X);
    if (R0.IsValueType(X))
      return VX($, Y, J, X);
  }, C4 = function($) {
    return R0.IsTypedArray($) || R0.IsValueType($);
  }, kX = function($, Y) {
    return R0.IsPlainObject($) && R0.IsArray(Y) || R0.IsArray($) && R0.IsPlainObject(Y);
  }, gX = function($, Y) {
    if (C4($) || C4(Y))
      throw new X8;
    if (kX($, Y))
      throw new J8;
    Z8($, "", $, Y);
  };
  Object.defineProperty(j4, "__esModule", { value: true });
  j4.Mutate = j4.ValueMutateInvalidRootMutationError = j4.ValueMutateTypeMismatchError = undefined;
  var q1 = z1(), Y8 = E$(), R0 = G0();

  class J8 extends Error {
    constructor() {
      super("ValueMutate: Cannot assign due type mismatch of assignable values");
    }
  }
  j4.ValueMutateTypeMismatchError = J8;

  class X8 extends Error {
    constructor() {
      super("ValueMutate: Only object and array types can be mutated at the root level");
    }
  }
  j4.ValueMutateInvalidRootMutationError = X8;
  j4.Mutate = gX;
});
var b4 = e((_4) => {
  var dX = function($, Y) {
    if (!u0.IsPlainObject(Y))
      return false;
    const J = [...Object.keys($), ...Object.getOwnPropertySymbols($)], X = [...Object.keys(Y), ...Object.getOwnPropertySymbols(Y)];
    if (J.length !== X.length)
      return false;
    return J.every((Z) => M1($[Z], Y[Z]));
  }, yX = function($, Y) {
    return u0.IsDate(Y) && $.getTime() === Y.getTime();
  }, vX = function($, Y) {
    if (!u0.IsArray(Y) || $.length !== Y.length)
      return false;
    return $.every((J, X) => M1(J, Y[X]));
  }, iX = function($, Y) {
    if (!u0.IsTypedArray(Y) || $.length !== Y.length || Object.getPrototypeOf($).constructor.name !== Object.getPrototypeOf(Y).constructor.name)
      return false;
    return $.every((J, X) => M1(J, Y[X]));
  }, pX = function($, Y) {
    return $ === Y;
  }, M1 = function($, Y) {
    if (u0.IsPlainObject($))
      return dX($, Y);
    if (u0.IsDate($))
      return yX($, Y);
    if (u0.IsTypedArray($))
      return iX($, Y);
    if (u0.IsArray($))
      return vX($, Y);
    if (u0.IsValueType($))
      return pX($, Y);
    throw new Error("ValueEquals: Unable to compare value");
  };
  Object.defineProperty(_4, "__esModule", { value: true });
  _4.Equal = undefined;
  var u0 = G0();
  _4.Equal = M1;
});
var p$ = e((G4) => {
  var oX = function($) {
    return $[W0.Kind] === "Any" || $[W0.Kind] === "Unknown";
  }, o = function($) {
    return $ !== undefined;
  }, nX = function($, Y) {
    return F1.TypeSystem.ExactOptionalPropertyTypes ? Y in $ : $[Y] !== undefined;
  }, B1 = function($) {
    const Y = c0.IsObject($);
    return F1.TypeSystem.AllowArrayObjects ? Y : Y && !c0.IsArray($);
  }, uX = function($) {
    return B1($) && !($ instanceof Date) && !($ instanceof Uint8Array);
  }, V$ = function($) {
    const Y = c0.IsNumber($);
    return F1.TypeSystem.AllowNaN ? Y : Y && Number.isFinite($);
  }, cX = function($) {
    const Y = c0.IsUndefined($);
    return F1.TypeSystem.AllowVoidNull ? Y || $ === null : Y;
  }, hX = function($, Y, J) {
    return true;
  }, lX = function($, Y, J) {
    if (!Array.isArray(J))
      return false;
    if (o($.minItems) && !(J.length >= $.minItems))
      return false;
    if (o($.maxItems) && !(J.length <= $.maxItems))
      return false;
    if (!J.every((W) => q0($.items, Y, W)))
      return false;
    if ($.uniqueItems === true && !function() {
      const W = new Set;
      for (let q of J) {
        const M = mX.Hash(q);
        if (W.has(M))
          return false;
        else
          W.add(M);
      }
      return true;
    }())
      return false;
    if (!(o($.contains) || V$($.minContains) || V$($.maxContains)))
      return true;
    const X = o($.contains) ? $.contains : W0.Type.Never(), Z = J.reduce((W, q) => q0(X, Y, q) ? W + 1 : W, 0);
    if (Z === 0)
      return false;
    if (V$($.minContains) && Z < $.minContains)
      return false;
    if (V$($.maxContains) && Z > $.maxContains)
      return false;
    return true;
  }, tX = function($, Y, J) {
    return B1(J) && (Symbol.asyncIterator in J);
  }, sX = function($, Y, J) {
    if (!c0.IsBigInt(J))
      return false;
    if (o($.multipleOf) && J % $.multipleOf !== BigInt(0))
      return false;
    if (o($.exclusiveMinimum) && !(J > $.exclusiveMinimum))
      return false;
    if (o($.exclusiveMaximum) && !(J < $.exclusiveMaximum))
      return false;
    if (o($.minimum) && !(J >= $.minimum))
      return false;
    if (o($.maximum) && !(J <= $.maximum))
      return false;
    return true;
  }, rX = function($, Y, J) {
    return typeof J === "boolean";
  }, aX = function($, Y, J) {
    return q0($.returns, Y, J.prototype);
  }, eX = function($, Y, J) {
    if (!(J instanceof Date))
      return false;
    if (!V$(J.getTime()))
      return false;
    if (o($.exclusiveMinimumTimestamp) && !(J.getTime() > $.exclusiveMinimumTimestamp))
      return false;
    if (o($.exclusiveMaximumTimestamp) && !(J.getTime() < $.exclusiveMaximumTimestamp))
      return false;
    if (o($.minimumTimestamp) && !(J.getTime() >= $.minimumTimestamp))
      return false;
    if (o($.maximumTimestamp) && !(J.getTime() <= $.maximumTimestamp))
      return false;
    return true;
  }, $Z = function($, Y, J) {
    return typeof J === "function";
  }, YZ = function($, Y, J) {
    if (!c0.IsInteger(J))
      return false;
    if (o($.multipleOf) && J % $.multipleOf !== 0)
      return false;
    if (o($.exclusiveMinimum) && !(J > $.exclusiveMinimum))
      return false;
    if (o($.exclusiveMaximum) && !(J < $.exclusiveMaximum))
      return false;
    if (o($.minimum) && !(J >= $.minimum))
      return false;
    if (o($.maximum) && !(J <= $.maximum))
      return false;
    return true;
  }, JZ = function($, Y, J) {
    const X = $.allOf.every((Z) => q0(Z, Y, J));
    if ($.unevaluatedProperties === false) {
      const Z = new RegExp(W0.KeyResolver.ResolvePattern($)), W = Object.getOwnPropertyNames(J).every((q) => Z.test(q));
      return X && W;
    } else if (W0.TypeGuard.TSchema($.unevaluatedProperties)) {
      const Z = new RegExp(W0.KeyResolver.ResolvePattern($)), W = Object.getOwnPropertyNames(J).every((q) => Z.test(q) || q0($.unevaluatedProperties, Y, J[q]));
      return X && W;
    } else
      return X;
  }, XZ = function($, Y, J) {
    return B1(J) && (Symbol.iterator in J);
  }, ZZ = function($, Y, J) {
    return J === $.const;
  }, WZ = function($, Y, J) {
    return false;
  }, QZ = function($, Y, J) {
    return !q0($.not, Y, J);
  }, zZ = function($, Y, J) {
    return J === null;
  }, HZ = function($, Y, J) {
    if (!V$(J))
      return false;
    if (o($.multipleOf) && J % $.multipleOf !== 0)
      return false;
    if (o($.exclusiveMinimum) && !(J > $.exclusiveMinimum))
      return false;
    if (o($.exclusiveMaximum) && !(J < $.exclusiveMaximum))
      return false;
    if (o($.minimum) && !(J >= $.minimum))
      return false;
    if (o($.maximum) && !(J <= $.maximum))
      return false;
    return true;
  }, qZ = function($, Y, J) {
    if (!B1(J))
      return false;
    if (o($.minProperties) && !(Object.getOwnPropertyNames(J).length >= $.minProperties))
      return false;
    if (o($.maxProperties) && !(Object.getOwnPropertyNames(J).length <= $.maxProperties))
      return false;
    const X = Object.getOwnPropertyNames($.properties);
    for (let Z of X) {
      const W = $.properties[Z];
      if ($.required && $.required.includes(Z)) {
        if (!q0(W, Y, J[Z]))
          return false;
        if ((W0.ExtendsUndefined.Check(W) || oX(W)) && !(Z in J))
          return false;
      } else if (nX(J, Z) && !q0(W, Y, J[Z]))
        return false;
    }
    if ($.additionalProperties === false) {
      const Z = Object.getOwnPropertyNames(J);
      if ($.required && $.required.length === X.length && Z.length === X.length)
        return true;
      else
        return Z.every((W) => X.includes(W));
    } else if (typeof $.additionalProperties === "object")
      return Object.getOwnPropertyNames(J).every((W) => X.includes(W) || q0($.additionalProperties, Y, J[W]));
    else
      return true;
  }, MZ = function($, Y, J) {
    return typeof J === "object" && typeof J.then === "function";
  }, FZ = function($, Y, J) {
    if (!uX(J))
      return false;
    if (o($.minProperties) && !(Object.getOwnPropertyNames(J).length >= $.minProperties))
      return false;
    if (o($.maxProperties) && !(Object.getOwnPropertyNames(J).length <= $.maxProperties))
      return false;
    const [X, Z] = Object.entries($.patternProperties)[0], W = new RegExp(X);
    return Object.entries(J).every(([q, M]) => {
      if (W.test(q))
        return q0(Z, Y, M);
      if (typeof $.additionalProperties === "object")
        return q0($.additionalProperties, Y, M);
      if ($.additionalProperties === false)
        return false;
      return true;
    });
  }, UZ = function($, Y, J) {
    const X = Y.findIndex((W) => W.$id === $.$ref);
    if (X === -1)
      throw new U1($);
    const Z = Y[X];
    return q0(Z, Y, J);
  }, BZ = function($, Y, J) {
    if (!c0.IsString(J))
      return false;
    if (o($.minLength)) {
      if (!(J.length >= $.minLength))
        return false;
    }
    if (o($.maxLength)) {
      if (!(J.length <= $.maxLength))
        return false;
    }
    if (o($.pattern)) {
      if (!new RegExp($.pattern).test(J))
        return false;
    }
    if (o($.format)) {
      if (!W0.FormatRegistry.Has($.format))
        return false;
      return W0.FormatRegistry.Get($.format)(J);
    }
    return true;
  }, NZ = function($, Y, J) {
    if (typeof J !== "symbol")
      return false;
    return true;
  }, AZ = function($, Y, J) {
    if (!c0.IsString(J))
      return false;
    return new RegExp($.pattern).test(J);
  }, wZ = function($, Y, J) {
    const X = Y.findIndex((W) => W.$id === $.$ref);
    if (X === -1)
      throw new U1($);
    const Z = Y[X];
    return q0(Z, Y, J);
  }, DZ = function($, Y, J) {
    if (!c0.IsArray(J))
      return false;
    if ($.items === undefined && J.length !== 0)
      return false;
    if (J.length !== $.maxItems)
      return false;
    if (!$.items)
      return true;
    for (let X = 0;X < $.items.length; X++)
      if (!q0($.items[X], Y, J[X]))
        return false;
    return true;
  }, PZ = function($, Y, J) {
    return J === undefined;
  }, KZ = function($, Y, J) {
    return $.anyOf.some((X) => q0(X, Y, J));
  }, SZ = function($, Y, J) {
    if (!(J instanceof Uint8Array))
      return false;
    if (o($.maxByteLength) && !(J.length <= $.maxByteLength))
      return false;
    if (o($.minByteLength) && !(J.length >= $.minByteLength))
      return false;
    return true;
  }, LZ = function($, Y, J) {
    return true;
  }, CZ = function($, Y, J) {
    return cX(J);
  }, jZ = function($, Y, J) {
    if (!W0.TypeRegistry.Has($[W0.Kind]))
      return false;
    return W0.TypeRegistry.Get($[W0.Kind])($, J);
  }, q0 = function($, Y, J) {
    const X = o($.$id) ? [...Y, $] : Y, Z = $;
    switch (Z[W0.Kind]) {
      case "Any":
        return hX(Z, X, J);
      case "Array":
        return lX(Z, X, J);
      case "AsyncIterator":
        return tX(Z, X, J);
      case "BigInt":
        return sX(Z, X, J);
      case "Boolean":
        return rX(Z, X, J);
      case "Constructor":
        return aX(Z, X, J);
      case "Date":
        return eX(Z, X, J);
      case "Function":
        return $Z(Z, X, J);
      case "Integer":
        return YZ(Z, X, J);
      case "Intersect":
        return JZ(Z, X, J);
      case "Iterator":
        return XZ(Z, X, J);
      case "Literal":
        return ZZ(Z, X, J);
      case "Never":
        return WZ(Z, X, J);
      case "Not":
        return QZ(Z, X, J);
      case "Null":
        return zZ(Z, X, J);
      case "Number":
        return HZ(Z, X, J);
      case "Object":
        return qZ(Z, X, J);
      case "Promise":
        return MZ(Z, X, J);
      case "Record":
        return FZ(Z, X, J);
      case "Ref":
        return UZ(Z, X, J);
      case "String":
        return BZ(Z, X, J);
      case "Symbol":
        return NZ(Z, X, J);
      case "TemplateLiteral":
        return AZ(Z, X, J);
      case "This":
        return wZ(Z, X, J);
      case "Tuple":
        return DZ(Z, X, J);
      case "Undefined":
        return PZ(Z, X, J);
      case "Union":
        return KZ(Z, X, J);
      case "Uint8Array":
        return SZ(Z, X, J);
      case "Unknown":
        return LZ(Z, X, J);
      case "Void":
        return CZ(Z, X, J);
      default:
        if (!W0.TypeRegistry.Has(Z[W0.Kind]))
          throw new W8(Z);
        return jZ(Z, X, J);
    }
  }, OZ = function(...$) {
    return $.length === 3 ? q0($[0], $[1], $[2]) : q0($[0], [], $[1]);
  };
  Object.defineProperty(G4, "__esModule", { value: true });
  G4.Check = G4.ValueCheckDereferenceError = G4.ValueCheckUnknownTypeError = undefined;
  var F1 = d$(), W0 = f0(), c0 = G0(), mX = y$();

  class W8 extends Error {
    constructor($) {
      super(`ValueCheck: ${$[W0.Kind] ? `Unknown type '${$[W0.Kind]}'` : "Unknown type"}`);
      this.schema = $;
    }
  }
  G4.ValueCheckUnknownTypeError = W8;

  class U1 extends Error {
    constructor($) {
      super(`ValueCheck: Unable to dereference type with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  G4.ValueCheckDereferenceError = U1;
  G4.Check = OZ;
});
var U8 = e((k4) => {
  var bZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return {};
  }, GZ = function($, Y) {
    if ($.uniqueItems === true && !n.HasPropertyKey($, "default"))
      throw new Error("ValueCreate.Array: Array with the uniqueItems constraint requires a default value");
    else if (("contains" in $) && !n.HasPropertyKey($, "default"))
      throw new Error("ValueCreate.Array: Array with the contains constraint requires a default value");
    else if ("default" in $)
      return $.default;
    else if ($.minItems !== undefined)
      return Array.from({ length: $.minItems }).map((J) => {
        return b0($.items, Y);
      });
    else
      return [];
  }, EZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return async function* () {
      }();
  }, xZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return BigInt(0);
  }, VZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return false;
  }, kZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else {
      const J = b0($.returns, Y);
      if (typeof J === "object" && !Array.isArray(J))
        return class {
          constructor() {
            for (let [X, Z] of Object.entries(J)) {
              const W = this;
              W[X] = Z;
            }
          }
        };
      else
        return class {
        };
    }
  }, gZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ($.minimumTimestamp !== undefined)
      return new Date($.minimumTimestamp);
    else
      return new Date(0);
  }, fZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return () => b0($.returns, Y);
  }, TZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ($.minimum !== undefined)
      return $.minimum;
    else
      return 0;
  }, dZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else {
      const J = $.allOf.reduce((X, Z) => {
        const W = b0(Z, Y);
        return typeof W === "object" ? { ...X, ...W } : W;
      }, {});
      if (!RZ.Check($, Y, J))
        throw new q8($);
      return J;
    }
  }, yZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return function* () {
      }();
  }, vZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return $.const;
  }, iZ = function($, Y) {
    throw new z8($);
  }, pZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      throw new H8($);
  }, mZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return null;
  }, oZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ($.minimum !== undefined)
      return $.minimum;
    else
      return 0;
  }, nZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else {
      const J = new Set($.required);
      return $.default || Object.entries($.properties).reduce((X, [Z, W]) => {
        return J.has(Z) ? { ...X, [Z]: b0(W, Y) } : { ...X };
      }, {});
    }
  }, uZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return Promise.resolve(b0($.item, Y));
  }, cZ = function($, Y) {
    const [J, X] = Object.entries($.patternProperties)[0];
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if (!(J === $$.PatternStringExact || J === $$.PatternNumberExact))
      return J.slice(1, J.length - 1).split("|").reduce((W, q) => {
        return { ...W, [q]: b0(X, Y) };
      }, {});
    else
      return {};
  }, hZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else {
      const J = Y.findIndex((Z) => Z.$id === $.$ref);
      if (J === -1)
        throw new N1($);
      const X = Y[J];
      return b0(X, Y);
    }
  }, lZ = function($, Y) {
    if ($.pattern !== undefined)
      if (!n.HasPropertyKey($, "default"))
        throw new Error("ValueCreate.String: String types with patterns must specify a default value");
      else
        return $.default;
    else if ($.format !== undefined)
      if (!n.HasPropertyKey($, "default"))
        throw new Error("ValueCreate.String: String types with formats must specify a default value");
      else
        return $.default;
    else if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ($.minLength !== undefined)
      return Array.from({ length: $.minLength }).map(() => ".").join("");
    else
      return "";
  }, tZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ("value" in $)
      return Symbol.for($.value);
    else
      return Symbol();
  }, sZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    const J = $$.TemplateLiteralParser.ParseExact($.pattern);
    if (!$$.TemplateLiteralFinite.Check(J))
      throw new M8($);
    return $$.TemplateLiteralGenerator.Generate(J).next().value;
  }, rZ = function($, Y) {
    if (V4++ > x4)
      throw new F8($, x4);
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else {
      const J = Y.findIndex((Z) => Z.$id === $.$ref);
      if (J === -1)
        throw new N1($);
      const X = Y[J];
      return b0(X, Y);
    }
  }, aZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    if ($.items === undefined)
      return [];
    else
      return Array.from({ length: $.minItems }).map((J, X) => b0($.items[X], Y));
  }, eZ = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return;
  }, $W = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ($.anyOf.length === 0)
      throw new Error("ValueCreate.Union: Cannot create Union with zero variants");
    else
      return b0($.anyOf[0], Y);
  }, YW = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else if ($.minByteLength !== undefined)
      return new Uint8Array($.minByteLength);
    else
      return new Uint8Array(0);
  }, JW = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return {};
  }, XW = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      return;
  }, ZW = function($, Y) {
    if (n.HasPropertyKey($, "default"))
      return $.default;
    else
      throw new Error("ValueCreate: User defined types must specify a default value");
  }, b0 = function($, Y) {
    const J = n.IsString($.$id) ? [...Y, $] : Y, X = $;
    switch (X[$$.Kind]) {
      case "Any":
        return bZ(X, J);
      case "Array":
        return GZ(X, J);
      case "AsyncIterator":
        return EZ(X, J);
      case "BigInt":
        return xZ(X, J);
      case "Boolean":
        return VZ(X, J);
      case "Constructor":
        return kZ(X, J);
      case "Date":
        return gZ(X, J);
      case "Function":
        return fZ(X, J);
      case "Integer":
        return TZ(X, J);
      case "Intersect":
        return dZ(X, J);
      case "Iterator":
        return yZ(X, J);
      case "Literal":
        return vZ(X, J);
      case "Never":
        return iZ(X, J);
      case "Not":
        return pZ(X, J);
      case "Null":
        return mZ(X, J);
      case "Number":
        return oZ(X, J);
      case "Object":
        return nZ(X, J);
      case "Promise":
        return uZ(X, J);
      case "Record":
        return cZ(X, J);
      case "Ref":
        return hZ(X, J);
      case "String":
        return lZ(X, J);
      case "Symbol":
        return tZ(X, J);
      case "TemplateLiteral":
        return sZ(X, J);
      case "This":
        return rZ(X, J);
      case "Tuple":
        return aZ(X, J);
      case "Undefined":
        return eZ(X, J);
      case "Union":
        return $W(X, J);
      case "Uint8Array":
        return YW(X, J);
      case "Unknown":
        return JW(X, J);
      case "Void":
        return XW(X, J);
      default:
        if (!$$.TypeRegistry.Has(X[$$.Kind]))
          throw new Q8(X);
        return ZW(X, J);
    }
  }, WW = function(...$) {
    return V4 = 0, $.length === 2 ? b0($[0], $[1]) : b0($[0], []);
  };
  Object.defineProperty(k4, "__esModule", { value: true });
  k4.Create = k4.ValueCreateRecursiveInstantiationError = k4.ValueCreateDereferenceError = k4.ValueCreateTempateLiteralTypeError = k4.ValueCreateIntersectTypeError = k4.ValueCreateNotTypeError = k4.ValueCreateNeverTypeError = k4.ValueCreateUnknownTypeError = undefined;
  var $$ = f0(), RZ = p$(), n = G0();

  class Q8 extends Error {
    constructor($) {
      super("ValueCreate: Unknown type");
      this.schema = $;
    }
  }
  k4.ValueCreateUnknownTypeError = Q8;

  class z8 extends Error {
    constructor($) {
      super("ValueCreate: Never types cannot be created");
      this.schema = $;
    }
  }
  k4.ValueCreateNeverTypeError = z8;

  class H8 extends Error {
    constructor($) {
      super("ValueCreate: Not types must have a default value");
      this.schema = $;
    }
  }
  k4.ValueCreateNotTypeError = H8;

  class q8 extends Error {
    constructor($) {
      super("ValueCreate: Intersect produced invalid value. Consider using a default value.");
      this.schema = $;
    }
  }
  k4.ValueCreateIntersectTypeError = q8;

  class M8 extends Error {
    constructor($) {
      super("ValueCreate: Can only create template literal values from patterns that produce finite sequences. Consider using a default value.");
      this.schema = $;
    }
  }
  k4.ValueCreateTempateLiteralTypeError = M8;

  class N1 extends Error {
    constructor($) {
      super(`ValueCreate: Unable to dereference type with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  k4.ValueCreateDereferenceError = N1;

  class F8 extends Error {
    constructor($, Y) {
      super("ValueCreate: Value cannot be created as recursive type may produce value of infinite size. Consider using a default.");
      this.schema = $, this.recursiveMaxDepth = Y;
    }
  }
  k4.ValueCreateRecursiveInstantiationError = F8;
  var x4 = 512, V4 = 0;
  k4.Create = WW;
});
var i4 = e((y4) => {
  var BW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, NW = function($, Y, J) {
    if (h.Check($, Y, J))
      return P0.Clone(J);
    const X = Y$.IsArray(J) ? P0.Clone(J) : t.Create($, Y), Z = Y$.IsNumber($.minItems) && X.length < $.minItems ? [...X, ...Array.from({ length: $.minItems - X.length }, () => null)] : X, q = (Y$.IsNumber($.maxItems) && Z.length > $.maxItems ? Z.slice(0, $.maxItems) : Z).map((A) => d0($.items, Y, A));
    if ($.uniqueItems !== true)
      return q;
    const M = [...new Set(q)];
    if (!h.Check($, Y, M))
      throw new N8($, M);
    return M;
  }, AW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, wW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, DW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, PW = function($, Y, J) {
    if (h.Check($, Y, J))
      return t.Create($, Y);
    const X = new Set($.returns.required || []), Z = function() {
    };
    for (let [W, q] of Object.entries($.returns.properties)) {
      if (!X.has(W) && J.prototype[W] === undefined)
        continue;
      Z.prototype[W] = d0(q, Y, J.prototype[W]);
    }
    return Z;
  }, KW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, SW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, LW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, CW = function($, Y, J) {
    const X = t.Create($, Y), Z = Y$.IsPlainObject(X) && Y$.IsPlainObject(J) ? { ...X, ...J } : J;
    return h.Check($, Y, Z) ? Z : t.Create($, Y);
  }, jW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, OW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, IW = function($, Y, J) {
    throw new A8($);
  }, _W = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, RW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, bW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, GW = function($, Y, J) {
    if (h.Check($, Y, J))
      return J;
    if (J === null || typeof J !== "object")
      return t.Create($, Y);
    const X = new Set($.required || []), Z = {};
    for (let [W, q] of Object.entries($.properties)) {
      if (!X.has(W) && J[W] === undefined)
        continue;
      Z[W] = d0(q, Y, J[W]);
    }
    if (typeof $.additionalProperties === "object") {
      const W = Object.getOwnPropertyNames($.properties);
      for (let q of Object.getOwnPropertyNames(J)) {
        if (W.includes(q))
          continue;
        Z[q] = d0($.additionalProperties, Y, J[q]);
      }
    }
    return Z;
  }, EW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, xW = function($, Y, J) {
    if (h.Check($, Y, J))
      return P0.Clone(J);
    if (J === null || typeof J !== "object" || Array.isArray(J) || J instanceof Date)
      return t.Create($, Y);
    const X = Object.getOwnPropertyNames($.patternProperties)[0], Z = $.patternProperties[X], W = {};
    for (let [q, M] of Object.entries(J))
      W[q] = d0(Z, Y, M);
    return W;
  }, VW = function($, Y, J) {
    const X = Y.findIndex((W) => W.$id === $.$ref);
    if (X === -1)
      throw new A1($);
    const Z = Y[X];
    return d0(Z, Y, J);
  }, kW = function($, Y, J) {
    return h.Check($, Y, J) ? J : t.Create($, Y);
  }, gW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, fW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, TW = function($, Y, J) {
    const X = Y.findIndex((W) => W.$id === $.$ref);
    if (X === -1)
      throw new A1($);
    const Z = Y[X];
    return d0(Z, Y, J);
  }, dW = function($, Y, J) {
    if (h.Check($, Y, J))
      return P0.Clone(J);
    if (!Y$.IsArray(J))
      return t.Create($, Y);
    if ($.items === undefined)
      return [];
    return $.items.map((X, Z) => d0(X, Y, J[Z]));
  }, yW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, vW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : B8.Create($, Y, J);
  }, iW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, pW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, mW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, oW = function($, Y, J) {
    return h.Check($, Y, J) ? P0.Clone(J) : t.Create($, Y);
  }, d0 = function($, Y, J) {
    const X = Y$.IsString($.$id) ? [...Y, $] : Y, Z = $;
    switch ($[m$.Kind]) {
      case "Any":
        return BW(Z, X, J);
      case "Array":
        return NW(Z, X, J);
      case "AsyncIterator":
        return AW(Z, X, J);
      case "BigInt":
        return wW(Z, X, J);
      case "Boolean":
        return DW(Z, X, J);
      case "Constructor":
        return PW(Z, X, J);
      case "Date":
        return KW(Z, X, J);
      case "Function":
        return SW(Z, X, J);
      case "Integer":
        return LW(Z, X, J);
      case "Intersect":
        return CW(Z, X, J);
      case "Iterator":
        return jW(Z, X, J);
      case "Literal":
        return OW(Z, X, J);
      case "Never":
        return IW(Z, X, J);
      case "Not":
        return _W(Z, X, J);
      case "Null":
        return RW(Z, X, J);
      case "Number":
        return bW(Z, X, J);
      case "Object":
        return GW(Z, X, J);
      case "Promise":
        return EW(Z, X, J);
      case "Record":
        return xW(Z, X, J);
      case "Ref":
        return VW(Z, X, J);
      case "String":
        return kW(Z, X, J);
      case "Symbol":
        return gW(Z, X, J);
      case "TemplateLiteral":
        return fW(Z, X, J);
      case "This":
        return TW(Z, X, J);
      case "Tuple":
        return dW(Z, X, J);
      case "Undefined":
        return yW(Z, X, J);
      case "Union":
        return vW(Z, X, J);
      case "Uint8Array":
        return iW(Z, X, J);
      case "Unknown":
        return pW(Z, X, J);
      case "Void":
        return mW(Z, X, J);
      default:
        if (!m$.TypeRegistry.Has(Z[m$.Kind]))
          throw new w8(Z);
        return oW(Z, X, J);
    }
  }, d4 = function(...$) {
    return $.length === 3 ? d0($[0], $[1], $[2]) : d0($[0], [], $[1]);
  };
  Object.defineProperty(y4, "__esModule", { value: true });
  y4.Cast = y4.ValueCastDereferenceError = y4.ValueCastUnknownTypeError = y4.ValueCastRecursiveTypeError = y4.ValueCastNeverTypeError = y4.ValueCastArrayUniqueItemsTypeError = y4.ValueCastReferenceTypeError = undefined;
  var m$ = f0(), t = U8(), h = p$(), P0 = E$(), Y$ = G0();

  class f4 extends Error {
    constructor($) {
      super(`ValueCast: Cannot locate referenced schema with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  y4.ValueCastReferenceTypeError = f4;

  class N8 extends Error {
    constructor($, Y) {
      super("ValueCast: Array cast produced invalid data due to uniqueItems constraint");
      this.schema = $, this.value = Y;
    }
  }
  y4.ValueCastArrayUniqueItemsTypeError = N8;

  class A8 extends Error {
    constructor($) {
      super("ValueCast: Never types cannot be cast");
      this.schema = $;
    }
  }
  y4.ValueCastNeverTypeError = A8;

  class T4 extends Error {
    constructor($) {
      super("ValueCast.Recursive: Cannot cast recursive schemas");
      this.schema = $;
    }
  }
  y4.ValueCastRecursiveTypeError = T4;

  class w8 extends Error {
    constructor($) {
      super("ValueCast: Unknown type");
      this.schema = $;
    }
  }
  y4.ValueCastUnknownTypeError = w8;

  class A1 extends Error {
    constructor($) {
      super(`ValueCast: Unable to dereference type with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  y4.ValueCastDereferenceError = A1;
  var B8;
  (function($) {
    function Y(Z, W, q) {
      if (Z[m$.Kind] === "Object" && typeof q === "object" && !Y$.IsNull(q)) {
        const M = Z, A = Object.getOwnPropertyNames(q), D = Object.entries(M.properties), [N, K] = [1 / D.length, D.length];
        return D.reduce((w, [B, C]) => {
          const S = C[m$.Kind] === "Literal" && C.const === q[B] ? K : 0, I = h.Check(C, W, q[B]) ? N : 0, R = A.includes(B) ? N : 0;
          return w + (S + I + R);
        }, 0);
      } else
        return h.Check(Z, W, q) ? 1 : 0;
    }
    function J(Z, W, q) {
      let [M, A] = [Z.anyOf[0], 0];
      for (let D of Z.anyOf) {
        const N = Y(D, W, q);
        if (N > A)
          M = D, A = N;
      }
      return M;
    }
    function X(Z, W, q) {
      if ("default" in Z)
        return Z.default;
      else {
        const M = J(Z, W, q);
        return d4(M, W, q);
      }
    }
    $.Create = X;
  })(B8 || (B8 = {}));
  y4.Cast = d4;
});
var h4 = e((u4) => {
  var D1 = function($) {
    return r.IsString($) && !isNaN($) && !isNaN(parseFloat($));
  }, rW = function($) {
    return r.IsBigInt($) || r.IsBoolean($) || r.IsNumber($);
  }, o$ = function($) {
    return $ === true || r.IsNumber($) && $ === 1 || r.IsBigInt($) && $ === BigInt("1") || r.IsString($) && ($.toLowerCase() === "true" || $ === "1");
  }, n$ = function($) {
    return $ === false || r.IsNumber($) && $ === 0 || r.IsBigInt($) && $ === BigInt("0") || r.IsString($) && ($.toLowerCase() === "false" || $ === "0");
  }, aW = function($) {
    return r.IsString($) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test($);
  }, eW = function($) {
    return r.IsString($) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test($);
  }, $Q = function($) {
    return r.IsString($) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test($);
  }, YQ = function($) {
    return r.IsString($) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test($);
  }, JQ = function($) {
    return r.IsString($) && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test($);
  }, XQ = function($, Y) {
    const J = o4($);
    return J === Y ? J : $;
  }, ZQ = function($, Y) {
    const J = n4($);
    return J === Y ? J : $;
  }, WQ = function($, Y) {
    const J = m4($);
    return J === Y ? J : $;
  }, QQ = function($, Y) {
    if (typeof $.const === "string")
      return XQ(Y, $.const);
    else if (typeof $.const === "number")
      return ZQ(Y, $.const);
    else if (typeof $.const === "boolean")
      return WQ(Y, $.const);
    else
      return p4.Clone(Y);
  }, m4 = function($) {
    return o$($) ? true : n$($) ? false : $;
  }, zQ = function($) {
    return D1($) ? BigInt(parseInt($)) : r.IsNumber($) ? BigInt($ | 0) : n$($) ? 0 : o$($) ? 1 : $;
  }, o4 = function($) {
    return rW($) ? $.toString() : r.IsSymbol($) && $.description !== undefined ? $.description.toString() : $;
  }, n4 = function($) {
    return D1($) ? parseFloat($) : o$($) ? 1 : n$($) ? 0 : $;
  }, HQ = function($) {
    return D1($) ? parseInt($) : r.IsNumber($) ? $ | 0 : o$($) ? 1 : n$($) ? 0 : $;
  }, qQ = function($) {
    return r.IsString($) && $.toLowerCase() === "null" ? null : $;
  }, MQ = function($) {
    return r.IsString($) && $ === "undefined" ? undefined : $;
  }, FQ = function($) {
    return r.IsDate($) ? $ : r.IsNumber($) ? new Date($) : o$($) ? new Date(1) : n$($) ? new Date(0) : D1($) ? new Date(parseInt($)) : eW($) ? new Date(`1970-01-01T${$}.000Z`) : aW($) ? new Date(`1970-01-01T${$}`) : YQ($) ? new Date(`${$}.000Z`) : $Q($) ? new Date($) : JQ($) ? new Date(`${$}T00:00:00.000Z`) : $;
  }, UQ = function($, Y, J) {
    return J;
  }, BQ = function($, Y, J) {
    if (r.IsArray(J))
      return J.map((X) => h0($.items, Y, X));
    return J;
  }, NQ = function($, Y, J) {
    return J;
  }, AQ = function($, Y, J) {
    return zQ(J);
  }, wQ = function($, Y, J) {
    return m4(J);
  }, DQ = function($, Y, J) {
    return p4.Clone(J);
  }, PQ = function($, Y, J) {
    return FQ(J);
  }, KQ = function($, Y, J) {
    return J;
  }, SQ = function($, Y, J) {
    return HQ(J);
  }, LQ = function($, Y, J) {
    return J;
  }, CQ = function($, Y, J) {
    return J;
  }, jQ = function($, Y, J) {
    return QQ($, J);
  }, OQ = function($, Y, J) {
    return J;
  }, IQ = function($, Y, J) {
    return qQ(J);
  }, _Q = function($, Y, J) {
    return n4(J);
  }, RQ = function($, Y, J) {
    if (r.IsObject(J))
      return Object.getOwnPropertyNames($.properties).reduce((X, Z) => {
        return J[Z] !== undefined ? { ...X, [Z]: h0($.properties[Z], Y, J[Z]) } : { ...X };
      }, J);
    return J;
  }, bQ = function($, Y, J) {
    return J;
  }, GQ = function($, Y, J) {
    const X = Object.getOwnPropertyNames($.patternProperties)[0], Z = $.patternProperties[X], W = {};
    for (let [q, M] of Object.entries(J))
      W[q] = h0(Z, Y, M);
    return W;
  }, EQ = function($, Y, J) {
    const X = Y.findIndex((W) => W.$id === $.$ref);
    if (X === -1)
      throw new w1($);
    const Z = Y[X];
    return h0(Z, Y, J);
  }, xQ = function($, Y, J) {
    return o4(J);
  }, VQ = function($, Y, J) {
    return J;
  }, kQ = function($, Y, J) {
    return J;
  }, gQ = function($, Y, J) {
    const X = Y.findIndex((W) => W.$id === $.$ref);
    if (X === -1)
      throw new w1($);
    const Z = Y[X];
    return h0(Z, Y, J);
  }, fQ = function($, Y, J) {
    if (r.IsArray(J) && !r.IsUndefined($.items))
      return J.map((X, Z) => {
        return Z < $.items.length ? h0($.items[Z], Y, X) : X;
      });
    return J;
  }, TQ = function($, Y, J) {
    return MQ(J);
  }, dQ = function($, Y, J) {
    for (let X of $.anyOf) {
      const Z = h0(X, Y, J);
      if (sW.Check(X, Y, Z))
        return Z;
    }
    return J;
  }, yQ = function($, Y, J) {
    return J;
  }, vQ = function($, Y, J) {
    return J;
  }, iQ = function($, Y, J) {
    return J;
  }, pQ = function($, Y, J) {
    return J;
  }, h0 = function($, Y, J) {
    const X = r.IsString($.$id) ? [...Y, $] : Y, Z = $;
    switch ($[D8.Kind]) {
      case "Any":
        return UQ(Z, X, J);
      case "Array":
        return BQ(Z, X, J);
      case "AsyncIterator":
        return NQ(Z, X, J);
      case "BigInt":
        return AQ(Z, X, J);
      case "Boolean":
        return wQ(Z, X, J);
      case "Constructor":
        return DQ(Z, X, J);
      case "Date":
        return PQ(Z, X, J);
      case "Function":
        return KQ(Z, X, J);
      case "Integer":
        return SQ(Z, X, J);
      case "Intersect":
        return LQ(Z, X, J);
      case "Iterator":
        return CQ(Z, X, J);
      case "Literal":
        return jQ(Z, X, J);
      case "Never":
        return OQ(Z, X, J);
      case "Null":
        return IQ(Z, X, J);
      case "Number":
        return _Q(Z, X, J);
      case "Object":
        return RQ(Z, X, J);
      case "Promise":
        return bQ(Z, X, J);
      case "Record":
        return GQ(Z, X, J);
      case "Ref":
        return EQ(Z, X, J);
      case "String":
        return xQ(Z, X, J);
      case "Symbol":
        return VQ(Z, X, J);
      case "TemplateLiteral":
        return kQ(Z, X, J);
      case "This":
        return gQ(Z, X, J);
      case "Tuple":
        return fQ(Z, X, J);
      case "Undefined":
        return TQ(Z, X, J);
      case "Union":
        return dQ(Z, X, J);
      case "Uint8Array":
        return yQ(Z, X, J);
      case "Unknown":
        return vQ(Z, X, J);
      case "Void":
        return iQ(Z, X, J);
      default:
        if (!D8.TypeRegistry.Has(Z[D8.Kind]))
          throw new P8(Z);
        return pQ(Z, X, J);
    }
  }, mQ = function(...$) {
    return $.length === 3 ? h0($[0], $[1], $[2]) : h0($[0], [], $[1]);
  };
  Object.defineProperty(u4, "__esModule", { value: true });
  u4.Convert = u4.ValueConvertDereferenceError = u4.ValueConvertUnknownTypeError = undefined;
  var D8 = f0(), p4 = E$(), sW = p$(), r = G0();

  class P8 extends Error {
    constructor($) {
      super("ValueConvert: Unknown type");
      this.schema = $;
    }
  }
  u4.ValueConvertUnknownTypeError = P8;

  class w1 extends Error {
    constructor($) {
      super(`ValueConvert: Unable to dereference type with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  u4.ValueConvertDereferenceError = w1;
  u4.Convert = mQ;
});
var X6 = e((Y6) => {
  Object.defineProperty(Y6, "__esModule", { value: true });
  Y6.Value = undefined;
  var l4 = v$(), uQ = I4(), cQ = y$(), hQ = b4(), t4 = i4(), lQ = E$(), s4 = h4(), r4 = U8(), a4 = p$(), e4 = $8(), $6;
  (function($) {
    function Y(...w) {
      return t4.Cast.apply(t4, w);
    }
    $.Cast = Y;
    function J(...w) {
      return r4.Create.apply(r4, w);
    }
    $.Create = J;
    function X(...w) {
      return a4.Check.apply(a4, w);
    }
    $.Check = X;
    function Z(...w) {
      return s4.Convert.apply(s4, w);
    }
    $.Convert = Z;
    function W(w) {
      return lQ.Clone(w);
    }
    $.Clone = W;
    function q(...w) {
      return l4.Errors.apply(l4, w);
    }
    $.Errors = q;
    function M(w, B) {
      return hQ.Equal(w, B);
    }
    $.Equal = M;
    function A(w, B) {
      return e4.Diff(w, B);
    }
    $.Diff = A;
    function D(w) {
      return cQ.Hash(w);
    }
    $.Hash = D;
    function N(w, B) {
      return e4.Patch(w, B);
    }
    $.Patch = N;
    function K(w, B) {
      uQ.Mutate(w, B);
    }
    $.Mutate = K;
  })($6 || (Y6.Value = $6 = {}));
});
var K8 = e((y0) => {
  Object.defineProperty(y0, "__esModule", { value: true });
  y0.Value = y0.ValuePointer = y0.Delete = y0.Update = y0.Insert = y0.Edit = y0.ValueErrorIterator = y0.ValueErrorType = undefined;
  var Z6 = v$();
  Object.defineProperty(y0, "ValueErrorType", { enumerable: true, get: function() {
    return Z6.ValueErrorType;
  } });
  Object.defineProperty(y0, "ValueErrorIterator", { enumerable: true, get: function() {
    return Z6.ValueErrorIterator;
  } });
  var P1 = $8();
  Object.defineProperty(y0, "Edit", { enumerable: true, get: function() {
    return P1.Edit;
  } });
  Object.defineProperty(y0, "Insert", { enumerable: true, get: function() {
    return P1.Insert;
  } });
  Object.defineProperty(y0, "Update", { enumerable: true, get: function() {
    return P1.Update;
  } });
  Object.defineProperty(y0, "Delete", { enumerable: true, get: function() {
    return P1.Delete;
  } });
  var tQ = z1();
  Object.defineProperty(y0, "ValuePointer", { enumerable: true, get: function() {
    return tQ.ValuePointer;
  } });
  var sQ = X6();
  Object.defineProperty(y0, "Value", { enumerable: true, get: function() {
    return sQ.Value;
  } });
});
var H6 = e((Q6) => {
  Object.defineProperty(Q6, "__esModule", { value: true });
  Q6.TypeCompiler = Q6.TypeCompilerTypeGuardError = Q6.TypeCompilerDereferenceError = Q6.TypeCompilerUnknownTypeError = Q6.TypeCheck = undefined;
  var u$ = d$(), Z0 = f0(), aQ = v$(), eQ = y$(), p = G0();

  class L8 {
    constructor($, Y, J, X) {
      this.schema = $, this.references = Y, this.checkFunc = J, this.code = X;
    }
    Code() {
      return this.code;
    }
    Errors($) {
      return aQ.Errors(this.schema, this.references, $);
    }
    Check($) {
      return this.checkFunc($);
    }
  }
  Q6.TypeCheck = L8;
  var l0;
  (function($) {
    function Y(W) {
      return W === 36;
    }
    $.DollarSign = Y;
    function J(W) {
      return W === 95;
    }
    $.IsUnderscore = J;
    function X(W) {
      return W >= 65 && W <= 90 || W >= 97 && W <= 122;
    }
    $.IsAlpha = X;
    function Z(W) {
      return W >= 48 && W <= 57;
    }
    $.IsNumeric = Z;
  })(l0 || (l0 = {}));
  var K1;
  (function($) {
    function Y(W) {
      if (W.length === 0)
        return false;
      return l0.IsNumeric(W.charCodeAt(0));
    }
    function J(W) {
      if (Y(W))
        return false;
      for (let q = 0;q < W.length; q++) {
        const M = W.charCodeAt(q);
        if (!(l0.IsAlpha(M) || l0.IsNumeric(M) || l0.DollarSign(M) || l0.IsUnderscore(M)))
          return false;
      }
      return true;
    }
    function X(W) {
      return W.replace(/'/g, "\\'");
    }
    function Z(W, q) {
      return J(q) ? `${W}.${q}` : `${W}['${X(q)}']`;
    }
    $.Encode = Z;
  })(K1 || (K1 = {}));
  var S8;
  (function($) {
    function Y(J) {
      const X = [];
      for (let Z = 0;Z < J.length; Z++) {
        const W = J.charCodeAt(Z);
        if (l0.IsNumeric(W) || l0.IsAlpha(W))
          X.push(J.charAt(Z));
        else
          X.push(`_${W}_`);
      }
      return X.join("").replace(/__/g, "_");
    }
    $.Encode = Y;
  })(S8 || (S8 = {}));

  class C8 extends Error {
    constructor($) {
      super("TypeCompiler: Unknown type");
      this.schema = $;
    }
  }
  Q6.TypeCompilerUnknownTypeError = C8;

  class j8 extends Error {
    constructor($) {
      super(`TypeCompiler: Unable to dereference type with $id '${$.$ref}'`);
      this.schema = $;
    }
  }
  Q6.TypeCompilerDereferenceError = j8;

  class S1 extends Error {
    constructor($) {
      super("TypeCompiler: Preflight validation check failed to guard for the given schema");
      this.schema = $;
    }
  }
  Q6.TypeCompilerTypeGuardError = S1;
  var W6;
  (function($) {
    function Y(U) {
      return U[Z0.Kind] === "Any" || U[Z0.Kind] === "Unknown";
    }
    function J(U, L, Q) {
      return u$.TypeSystem.ExactOptionalPropertyTypes ? `('${L}' in ${U} ? ${Q} : true)` : `(${K1.Encode(U, L)} !== undefined ? ${Q} : true)`;
    }
    function X(U) {
      return !u$.TypeSystem.AllowArrayObjects ? `(typeof ${U} === 'object' && ${U} !== null && !Array.isArray(${U}))` : `(typeof ${U} === 'object' && ${U} !== null)`;
    }
    function Z(U) {
      return !u$.TypeSystem.AllowArrayObjects ? `(typeof ${U} === 'object' && ${U} !== null && !Array.isArray(${U}) && !(${U} instanceof Date) && !(${U} instanceof Uint8Array))` : `(typeof ${U} === 'object' && ${U} !== null && !(${U} instanceof Date) && !(${U} instanceof Uint8Array))`;
    }
    function W(U) {
      return !u$.TypeSystem.AllowNaN ? `(typeof ${U} === 'number' && Number.isFinite(${U}))` : `typeof ${U} === 'number'`;
    }
    function q(U) {
      return u$.TypeSystem.AllowVoidNull ? `(${U} === undefined || ${U} === null)` : `${U} === undefined`;
    }
    function* M(U, L, Q) {
      yield "true";
    }
    function* A(U, L, Q) {
      yield `Array.isArray(${Q})`;
      const [b, O] = [k0("value", "any"), k0("acc", "number")];
      if (p.IsNumber(U.minItems))
        yield `${Q}.length >= ${U.minItems}`;
      if (p.IsNumber(U.maxItems))
        yield `${Q}.length <= ${U.maxItems}`;
      const V = Q0(U.items, L, "value");
      if (yield `${Q}.every((${b}) => ${V})`, Z0.TypeGuard.TSchema(U.contains) || p.IsNumber(U.minContains) || p.IsNumber(U.maxContains)) {
        const s = Z0.TypeGuard.TSchema(U.contains) ? U.contains : Z0.Type.Never(), B0 = Q0(s, L, "value"), j0 = p.IsNumber(U.minContains) ? [`(count >= ${U.minContains})`] : [], O0 = p.IsNumber(U.maxContains) ? [`(count <= ${U.maxContains})`] : [], I0 = `const count = ${Q}.reduce((${O}, ${b}) => ${B0} ? acc + 1 : acc, 0)`, P$ = ["(count > 0)", ...j0, ...O0].join(" && ");
        yield `((${b}) => { ${I0}; return ${P$}})(${Q})`;
      }
      if (U.uniqueItems === true)
        yield `((${b}) => { const set = new Set(); for(const element of value) { const hashed = hash(element); if(set.has(hashed)) { return false } else { set.add(hashed) } } return true } )(${Q})`;
    }
    function* D(U, L, Q) {
      yield `(typeof value === 'object' && Symbol.asyncIterator in ${Q})`;
    }
    function* N(U, L, Q) {
      if (yield `(typeof ${Q} === 'bigint')`, p.IsBigInt(U.multipleOf))
        yield `(${Q} % BigInt(${U.multipleOf})) === 0`;
      if (p.IsBigInt(U.exclusiveMinimum))
        yield `${Q} > BigInt(${U.exclusiveMinimum})`;
      if (p.IsBigInt(U.exclusiveMaximum))
        yield `${Q} < BigInt(${U.exclusiveMaximum})`;
      if (p.IsBigInt(U.minimum))
        yield `${Q} >= BigInt(${U.minimum})`;
      if (p.IsBigInt(U.maximum))
        yield `${Q} <= BigInt(${U.maximum})`;
    }
    function* K(U, L, Q) {
      yield `(typeof ${Q} === 'boolean')`;
    }
    function* w(U, L, Q) {
      yield* C0(U.returns, L, `${Q}.prototype`);
    }
    function* B(U, L, Q) {
      if (yield `(${Q} instanceof Date) && Number.isFinite(${Q}.getTime())`, p.IsNumber(U.exclusiveMinimumTimestamp))
        yield `${Q}.getTime() > ${U.exclusiveMinimumTimestamp}`;
      if (p.IsNumber(U.exclusiveMaximumTimestamp))
        yield `${Q}.getTime() < ${U.exclusiveMaximumTimestamp}`;
      if (p.IsNumber(U.minimumTimestamp))
        yield `${Q}.getTime() >= ${U.minimumTimestamp}`;
      if (p.IsNumber(U.maximumTimestamp))
        yield `${Q}.getTime() <= ${U.maximumTimestamp}`;
    }
    function* C(U, L, Q) {
      yield `(typeof ${Q} === 'function')`;
    }
    function* S(U, L, Q) {
      if (yield `(typeof ${Q} === 'number' && Number.isInteger(${Q}))`, p.IsNumber(U.multipleOf))
        yield `(${Q} % ${U.multipleOf}) === 0`;
      if (p.IsNumber(U.exclusiveMinimum))
        yield `${Q} > ${U.exclusiveMinimum}`;
      if (p.IsNumber(U.exclusiveMaximum))
        yield `${Q} < ${U.exclusiveMaximum}`;
      if (p.IsNumber(U.minimum))
        yield `${Q} >= ${U.minimum}`;
      if (p.IsNumber(U.maximum))
        yield `${Q} <= ${U.maximum}`;
    }
    function* I(U, L, Q) {
      const b = U.allOf.map((O) => Q0(O, L, Q)).join(" && ");
      if (U.unevaluatedProperties === false) {
        const O = p0(`${new RegExp(Z0.KeyResolver.ResolvePattern(U))};`), V = `Object.getOwnPropertyNames(${Q}).every(key => ${O}.test(key))`;
        yield `(${b} && ${V})`;
      } else if (Z0.TypeGuard.TSchema(U.unevaluatedProperties)) {
        const O = p0(`${new RegExp(Z0.KeyResolver.ResolvePattern(U))};`), V = `Object.getOwnPropertyNames(${Q}).every(key => ${O}.test(key) || ${Q0(U.unevaluatedProperties, L, `${Q}[key]`)})`;
        yield `(${b} && ${V})`;
      } else
        yield `(${b})`;
    }
    function* R(U, L, Q) {
      yield `(typeof value === 'object' && Symbol.iterator in ${Q})`;
    }
    function* g(U, L, Q) {
      if (typeof U.const === "number" || typeof U.const === "boolean")
        yield `(${Q} === ${U.const})`;
      else
        yield `(${Q} === '${U.const}')`;
    }
    function* i(U, L, Q) {
      yield "false";
    }
    function* j(U, L, Q) {
      yield `(!${Q0(U.not, L, Q)})`;
    }
    function* E(U, L, Q) {
      yield `(${Q} === null)`;
    }
    function* x(U, L, Q) {
      if (yield W(Q), p.IsNumber(U.multipleOf))
        yield `(${Q} % ${U.multipleOf}) === 0`;
      if (p.IsNumber(U.exclusiveMinimum))
        yield `${Q} > ${U.exclusiveMinimum}`;
      if (p.IsNumber(U.exclusiveMaximum))
        yield `${Q} < ${U.exclusiveMaximum}`;
      if (p.IsNumber(U.minimum))
        yield `${Q} >= ${U.minimum}`;
      if (p.IsNumber(U.maximum))
        yield `${Q} <= ${U.maximum}`;
    }
    function* F0(U, L, Q) {
      if (yield X(Q), p.IsNumber(U.minProperties))
        yield `Object.getOwnPropertyNames(${Q}).length >= ${U.minProperties}`;
      if (p.IsNumber(U.maxProperties))
        yield `Object.getOwnPropertyNames(${Q}).length <= ${U.maxProperties}`;
      const b = Object.getOwnPropertyNames(U.properties);
      for (let O of b) {
        const V = K1.Encode(Q, O), s = U.properties[O];
        if (U.required && U.required.includes(O)) {
          if (yield* C0(s, L, V), Z0.ExtendsUndefined.Check(s) || Y(s))
            yield `('${O}' in ${Q})`;
        } else {
          const B0 = Q0(s, L, V);
          yield J(Q, O, B0);
        }
      }
      if (U.additionalProperties === false)
        if (U.required && U.required.length === b.length)
          yield `Object.getOwnPropertyNames(${Q}).length === ${b.length}`;
        else {
          const O = `[${b.map((V) => `'${V}'`).join(", ")}]`;
          yield `Object.getOwnPropertyNames(${Q}).every(key => ${O}.includes(key))`;
        }
      if (typeof U.additionalProperties === "object") {
        const O = Q0(U.additionalProperties, L, `${Q}[key]`), V = `[${b.map((s) => `'${s}'`).join(", ")}]`;
        yield `(Object.getOwnPropertyNames(${Q}).every(key => ${V}.includes(key) || ${O}))`;
      }
    }
    function* d(U, L, Q) {
      yield `(typeof value === 'object' && typeof ${Q}.then === 'function')`;
    }
    function* a(U, L, Q) {
      if (yield Z(Q), p.IsNumber(U.minProperties))
        yield `Object.getOwnPropertyNames(${Q}).length >= ${U.minProperties}`;
      if (p.IsNumber(U.maxProperties))
        yield `Object.getOwnPropertyNames(${Q}).length <= ${U.maxProperties}`;
      const [b, O] = Object.entries(U.patternProperties)[0], V = p0(`new RegExp(/${b}/)`), s = Q0(O, L, "value"), B0 = Z0.TypeGuard.TSchema(U.additionalProperties) ? Q0(U.additionalProperties, L, Q) : U.additionalProperties === false ? "false" : "true", j0 = `(${V}.test(key) ? ${s} : ${B0})`;
      yield `(Object.entries(${Q}).every(([key, value]) => ${j0}))`;
    }
    function* J0(U, L, Q) {
      const b = L.findIndex((V) => V.$id === U.$ref);
      if (b === -1)
        throw new j8(U);
      const O = L[b];
      if (X0.functions.has(U.$ref))
        return yield `${$0(U.$ref)}(${Q})`;
      yield* C0(O, L, Q);
    }
    function* D0(U, L, Q) {
      if (yield `(typeof ${Q} === 'string')`, p.IsNumber(U.minLength))
        yield `${Q}.length >= ${U.minLength}`;
      if (p.IsNumber(U.maxLength))
        yield `${Q}.length <= ${U.maxLength}`;
      if (U.pattern !== undefined)
        yield `${p0(`${new RegExp(U.pattern)};`)}.test(${Q})`;
      if (U.format !== undefined)
        yield `format('${U.format}', ${Q})`;
    }
    function* v(U, L, Q) {
      yield `(typeof ${Q} === 'symbol')`;
    }
    function* U0(U, L, Q) {
      yield `(typeof ${Q} === 'string')`, yield `${p0(`${new RegExp(U.pattern)};`)}.test(${Q})`;
    }
    function* S0(U, L, Q) {
      yield `${$0(U.$ref)}(${Q})`;
    }
    function* y(U, L, Q) {
      if (yield `Array.isArray(${Q})`, U.items === undefined)
        return yield `${Q}.length === 0`;
      yield `(${Q}.length === ${U.maxItems})`;
      for (let b = 0;b < U.items.length; b++)
        yield `${Q0(U.items[b], L, `${Q}[${b}]`)}`;
    }
    function* L0(U, L, Q) {
      yield `${Q} === undefined`;
    }
    function* Q$(U, L, Q) {
      yield `(${U.anyOf.map((O) => Q0(O, L, Q)).join(" || ")})`;
    }
    function* m(U, L, Q) {
      if (yield `${Q} instanceof Uint8Array`, p.IsNumber(U.maxByteLength))
        yield `(${Q}.length <= ${U.maxByteLength})`;
      if (p.IsNumber(U.minByteLength))
        yield `(${Q}.length >= ${U.minByteLength})`;
    }
    function* N$(U, L, Q) {
      yield "true";
    }
    function* A$(U, L, Q) {
      yield q(Q);
    }
    function* w$(U, L, Q) {
      const b = X0.instances.size;
      X0.instances.set(b, U), yield `kind('${U[Z0.Kind]}', ${b}, ${Q})`;
    }
    function* C0(U, L, Q, b = true) {
      const O = p.IsString(U.$id) ? [...L, U] : L, V = U;
      if (b && p.IsString(U.$id)) {
        const s = $0(U.$id);
        if (X0.functions.has(s))
          return yield `${s}(${Q})`;
        else {
          const B0 = r0(s, U, L, "value", false);
          return X0.functions.set(s, B0), yield `${s}(${Q})`;
        }
      }
      switch (V[Z0.Kind]) {
        case "Any":
          return yield* M(V, O, Q);
        case "Array":
          return yield* A(V, O, Q);
        case "AsyncIterator":
          return yield* D(V, O, Q);
        case "BigInt":
          return yield* N(V, O, Q);
        case "Boolean":
          return yield* K(V, O, Q);
        case "Constructor":
          return yield* w(V, O, Q);
        case "Date":
          return yield* B(V, O, Q);
        case "Function":
          return yield* C(V, O, Q);
        case "Integer":
          return yield* S(V, O, Q);
        case "Intersect":
          return yield* I(V, O, Q);
        case "Iterator":
          return yield* R(V, O, Q);
        case "Literal":
          return yield* g(V, O, Q);
        case "Never":
          return yield* i(V, O, Q);
        case "Not":
          return yield* j(V, O, Q);
        case "Null":
          return yield* E(V, O, Q);
        case "Number":
          return yield* x(V, O, Q);
        case "Object":
          return yield* F0(V, O, Q);
        case "Promise":
          return yield* d(V, O, Q);
        case "Record":
          return yield* a(V, O, Q);
        case "Ref":
          return yield* J0(V, O, Q);
        case "String":
          return yield* D0(V, O, Q);
        case "Symbol":
          return yield* v(V, O, Q);
        case "TemplateLiteral":
          return yield* U0(V, O, Q);
        case "This":
          return yield* S0(V, O, Q);
        case "Tuple":
          return yield* y(V, O, Q);
        case "Undefined":
          return yield* L0(V, O, Q);
        case "Union":
          return yield* Q$(V, O, Q);
        case "Uint8Array":
          return yield* m(V, O, Q);
        case "Unknown":
          return yield* N$(V, O, Q);
        case "Void":
          return yield* A$(V, O, Q);
        default:
          if (!Z0.TypeRegistry.Has(V[Z0.Kind]))
            throw new C8(U);
          return yield* w$(V, O, Q);
      }
    }
    const X0 = { language: "javascript", functions: new Map, variables: new Map, instances: new Map };
    function Q0(U, L, Q, b = true) {
      return `(${[...C0(U, L, Q, b)].join(" && ")})`;
    }
    function $0(U) {
      return `check_${S8.Encode(U)}`;
    }
    function p0(U) {
      const L = `local_${X0.variables.size}`;
      return X0.variables.set(L, `const ${L} = ${U}`), L;
    }
    function r0(U, L, Q, b, O = true) {
      const [V, s] = ["\n", (I0) => "".padStart(I0, " ")], B0 = k0("value", "any"), j0 = m0("boolean"), O0 = [...C0(L, Q, b, O)].map((I0) => `${s(4)}${I0}`).join(` &&${V}`);
      return `function ${U}(${B0})${j0} {${V}${s(2)}return (${V}${O0}${V}${s(2)})\n}`;
    }
    function k0(U, L) {
      const Q = X0.language === "typescript" ? `: ${L}` : "";
      return `${U}${Q}`;
    }
    function m0(U) {
      return X0.language === "typescript" ? `: ${U}` : "";
    }
    function z0(U, L, Q) {
      const b = r0("check", U, L, "value"), O = k0("value", "any"), V = m0("boolean"), s = [...X0.functions.values()], B0 = [...X0.variables.values()], j0 = p.IsString(U.$id) ? `return function check(${O})${V} {\n  return ${$0(U.$id)}(value)\n}` : `return ${b}`;
      return [...B0, ...s, j0].join("\n");
    }
    function z$(...U) {
      const L = { language: "javascript" }, [Q, b, O] = U.length === 2 && p.IsArray(U[1]) ? [U[0], U[1], L] : U.length === 2 && !p.IsArray(U[1]) ? [U[0], [], U[1]] : U.length === 3 ? [U[0], U[1], U[2]] : U.length === 1 ? [U[0], [], L] : [null, [], L];
      if (X0.language = O.language, X0.variables.clear(), X0.functions.clear(), X0.instances.clear(), !Z0.TypeGuard.TSchema(Q))
        throw new S1(Q);
      for (let V of b)
        if (!Z0.TypeGuard.TSchema(V))
          throw new S1(V);
      return z0(Q, b, O);
    }
    $.Code = z$;
    function D$(U, L = []) {
      const Q = z$(U, L, { language: "javascript" }), b = globalThis.Function("kind", "format", "hash", Q), O = new Map(X0.instances);
      function V(O0, I0, P$) {
        if (!Z0.TypeRegistry.Has(O0) || !O.has(I0))
          return false;
        const G1 = O.get(I0);
        return Z0.TypeRegistry.Get(O0)(G1, P$);
      }
      function s(O0, I0) {
        if (!Z0.FormatRegistry.Has(O0))
          return false;
        return Z0.FormatRegistry.Get(O0)(I0);
      }
      function B0(O0) {
        return eQ.Hash(O0);
      }
      const j0 = b(V, s, B0);
      return new L8(U, L, j0, Q);
    }
    $.Compile = D$;
  })(W6 || (Q6.TypeCompiler = W6 = {}));
});
var q6 = e((t0) => {
  var Z9 = t0 && t0.__createBinding || (Object.create ? function($, Y, J, X) {
    if (X === undefined)
      X = J;
    var Z = Object.getOwnPropertyDescriptor(Y, J);
    if (!Z || ("get" in Z ? !Y.__esModule : Z.writable || Z.configurable))
      Z = { enumerable: true, get: function() {
        return Y[J];
      } };
    Object.defineProperty($, X, Z);
  } : function($, Y, J, X) {
    if (X === undefined)
      X = J;
    $[X] = Y[J];
  }), W9 = t0 && t0.__exportStar || function($, Y) {
    for (var J in $)
      if (J !== "default" && !Object.prototype.hasOwnProperty.call(Y, J))
        Z9(Y, $, J);
  };
  Object.defineProperty(t0, "__esModule", { value: true });
  t0.ValueErrorType = undefined;
  var Q9 = v$();
  Object.defineProperty(t0, "ValueErrorType", { enumerable: true, get: function() {
    return Q9.ValueErrorType;
  } });
  W9(H6(), t0);
});
var D6 = e((Zz, w6) => {
  var F9 = function($) {
    var Y = $.indexOf("%");
    if (Y === -1)
      return $;
    var J = $.length, X = "", Z = 0, W = 0, q = Y, M = N6;
    while (Y > -1 && Y < J) {
      var A = A6($[Y + 1], 4), D = A6($[Y + 2], 0), N = A | D, K = R8[N];
      if (M = R8[256 + M + K], W = W << 6 | N & R8[364 + K], M === N6)
        X += $.slice(Z, q), X += W <= 65535 ? String.fromCharCode(W) : String.fromCharCode(55232 + (W >> 10), 56320 + (W & 1023)), W = 0, Z = Y + 3, Y = q = $.indexOf("%", Z);
      else if (M === M9)
        return null;
      else {
        if (Y += 3, Y < J && $.charCodeAt(Y) === 37)
          continue;
        return null;
      }
    }
    return X + $.slice(Z);
  }, A6 = function($, Y) {
    var J = U9[$];
    return J === undefined ? 255 : J << Y;
  }, N6 = 12, M9 = 0, R8 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7, 10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96, 0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 63, 63, 63, 0, 31, 15, 15, 15, 7, 7, 7], U9 = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, a: 10, A: 10, b: 11, B: 11, c: 12, C: 12, d: 13, D: 13, e: 14, E: 14, f: 15, F: 15 };
  w6.exports = F9;
});
var C6 = e((Wz, L6) => {
  var B9 = function($) {
    const Y = new S6;
    if (typeof $ !== "string")
      return Y;
    let J = $.length, X = "", Z = "", W = -1, q = -1, M = false, A = false, D = false, N = false, K = false, w = 0;
    for (let B = 0;B < J + 1; B++)
      if (w = B !== J ? $.charCodeAt(B) : 38, w === 38) {
        if (K = q > W, !K)
          q = B;
        if (X = $.slice(W + 1, q), K || X.length > 0) {
          if (D)
            X = X.replace(K6, " ");
          if (M)
            X = P6(X) || X;
          if (K) {
            if (Z = $.slice(q + 1, B), N)
              Z = Z.replace(K6, " ");
            if (A)
              Z = P6(Z) || Z;
          }
          const C = Y[X];
          if (C === undefined)
            Y[X] = Z;
          else if (C.pop)
            C.push(Z);
          else
            Y[X] = [C, Z];
        }
        Z = "", W = B, q = B, M = false, A = false, D = false, N = false;
      } else if (w === 61)
        if (q <= W)
          q = B;
        else
          A = true;
      else if (w === 43)
        if (q > W)
          N = true;
        else
          D = true;
      else if (w === 37)
        if (q > W)
          A = true;
        else
          M = true;
    return Y;
  }, P6 = D6(), K6 = /\+/g, S6 = function() {
  };
  S6.prototype = Object.create(null);
  L6.exports = B9;
});
var O6 = e((Qz, j6) => {
  var A9 = function($) {
    const Y = $.length;
    if (Y === 0)
      return "";
    let J = "", X = 0, Z = 0;
    $:
      for (;Z < Y; Z++) {
        let W = $.charCodeAt(Z);
        while (W < 128) {
          if (N9[W] !== 1) {
            if (X < Z)
              J += $.slice(X, Z);
            X = Z + 1, J += v0[W];
          }
          if (++Z === Y)
            break $;
          W = $.charCodeAt(Z);
        }
        if (X < Z)
          J += $.slice(X, Z);
        if (W < 2048) {
          X = Z + 1, J += v0[192 | W >> 6] + v0[128 | W & 63];
          continue;
        }
        if (W < 55296 || W >= 57344) {
          X = Z + 1, J += v0[224 | W >> 12] + v0[128 | W >> 6 & 63] + v0[128 | W & 63];
          continue;
        }
        if (++Z, Z >= Y)
          throw new Error("URI malformed");
        const q = $.charCodeAt(Z) & 1023;
        X = Z + 1, W = 65536 + ((W & 1023) << 10 | q), J += v0[240 | W >> 18] + v0[128 | W >> 12 & 63] + v0[128 | W >> 6 & 63] + v0[128 | W & 63];
      }
    if (X === 0)
      return $;
    if (X < Y)
      return J + $.slice(X);
    return J;
  }, v0 = Array.from({ length: 256 }, ($, Y) => "%" + ((Y < 16 ? "0" : "") + Y.toString(16)).toUpperCase()), N9 = new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0]);
  j6.exports = { encodeString: A9 };
});
var R6 = e((zz, _6) => {
  var I6 = function($) {
    const Y = typeof $;
    if (Y === "string")
      return b8($);
    else if (Y === "bigint")
      return $.toString();
    else if (Y === "boolean")
      return $ ? "true" : "false";
    else if (Y === "number" && Number.isFinite($))
      return $ < 1000000000000000000000 ? "" + $ : b8("" + $);
    return "";
  }, w9 = function($) {
    let Y = "";
    if ($ === null || typeof $ !== "object")
      return Y;
    const J = "&", X = Object.keys($), Z = X.length;
    let W = 0;
    for (let q = 0;q < Z; q++) {
      const M = X[q], A = $[M], D = b8(M) + "=";
      if (q)
        Y += J;
      if (Array.isArray(A)) {
        W = A.length;
        for (let N = 0;N < W; N++) {
          if (N)
            Y += J;
          Y += D, Y += I6(A[N]);
        }
      } else
        Y += D, Y += I6(A);
    }
    return Y;
  }, { encodeString: b8 } = O6();
  _6.exports = w9;
});
var G8 = e((Hz, h$) => {
  var b6 = C6(), G6 = R6(), E6 = { parse: b6, stringify: G6 };
  h$.exports = E6;
  h$.exports.default = E6;
  h$.exports.parse = b6;
  h$.exports.stringify = G6;
});
var K$ = ($, Y) => ({ part: $, store: null, inert: Y !== undefined ? new Map(Y.map((J) => [J.part.charCodeAt(0), J])) : null, params: null, wildcardStore: null });
var d8 = ($, Y) => ({ ...$, part: Y });
var y8 = ($) => ({ paramName: $, store: null, inert: null });

class e0 {
  root = {};
  history = [];
  static regex = { static: /:.+?(?=\/|$)/, params: /:.+?(?=\/|$)/g };
  add($, Y, J) {
    let X;
    if (typeof Y != "string")
      throw TypeError("Route path must be a string");
    Y === "" ? Y = "/" : Y[0] !== "/" && (Y = `/${Y}`), this.history.push([$, Y, J]);
    let Z = Y[Y.length - 1] === "*";
    Z && (Y = Y.slice(0, -1));
    let W = Y.split(e0.regex.static), q = Y.match(e0.regex.params) || [];
    W[W.length - 1] === "" && W.pop(), X = this.root[$] ? this.root[$] : this.root[$] = K$("/");
    let M = 0;
    for (let A = 0;A < W.length; ++A) {
      let D = W[A];
      if (A > 0) {
        let N = q[M++].slice(1);
        if (X.params === null)
          X.params = y8(N);
        else if (X.params.paramName !== N)
          throw Error(`Cannot create route "${Y}" with parameter "${N}" because a route already exists with a different parameter name ("${X.params.paramName}") in the same location`);
        let K = X.params;
        if (K.inert === null) {
          X = K.inert = K$(D);
          continue;
        }
        X = K.inert;
      }
      for (let N = 0;; ) {
        if (N === D.length) {
          if (N < X.part.length) {
            let K = d8(X, X.part.slice(N));
            Object.assign(X, K$(D, [K]));
          }
          break;
        }
        if (N === X.part.length) {
          if (X.inert === null)
            X.inert = new Map;
          else if (X.inert.has(D.charCodeAt(N))) {
            X = X.inert.get(D.charCodeAt(N)), D = D.slice(N), N = 0;
            continue;
          }
          let K = K$(D.slice(N));
          X.inert.set(D.charCodeAt(N), K), X = K;
          break;
        }
        if (D[N] !== X.part[N]) {
          let K = d8(X, X.part.slice(N)), w = K$(D.slice(N));
          Object.assign(X, K$(X.part.slice(0, N), [K, w])), X = w;
          break;
        }
        ++N;
      }
    }
    if (M < q.length) {
      let A = q[M], D = A.slice(1);
      if (X.params === null)
        X.params = y8(D);
      else if (X.params.paramName !== D)
        throw Error(`Cannot create route "${Y}" with parameter "${D}" because a route already exists with a different parameter name ("${X.params.paramName}") in the same location`);
      return X.params.store === null && (X.params.store = J), X.params.store;
    }
    return Z ? (X.wildcardStore === null && (X.wildcardStore = J), X.wildcardStore) : (X.store === null && (X.store = J), X.store);
  }
  find($, Y) {
    let J = this.root[$];
    return J ? E1(Y, Y.length, J, 0) : null;
  }
}
var E1 = ($, Y, J, X) => {
  let Z = J?.part, W = X + Z.length;
  if (Z.length > 1) {
    if (W > Y)
      return null;
    if (Z.length < 15) {
      for (let q = 1, M = X + 1;q < Z.length; ++q, ++M)
        if (Z.charCodeAt(q) !== $.charCodeAt(M))
          return null;
    } else if ($.substring(X, W) !== Z)
      return null;
  }
  if (W === Y)
    return J.store !== null ? { store: J.store, params: {} } : J.wildcardStore !== null ? { store: J.wildcardStore, params: { "*": "" } } : null;
  if (J.inert !== null) {
    let q = J.inert.get($.charCodeAt(W));
    if (q !== undefined) {
      let M = E1($, Y, q, W);
      if (M !== null)
        return M;
    }
  }
  if (J.params !== null) {
    let q = J.params, M = $.indexOf("/", W);
    if (M !== W) {
      if (M === -1 || M >= Y) {
        if (q.store !== null) {
          let A = {};
          return A[q.paramName] = $.substring(W, Y), { store: q.store, params: A };
        }
      } else if (q.inert !== null) {
        let A = E1($, Y, q.inert, M);
        if (A !== null)
          return A.params[q.paramName] = $.substring(W, M), A;
      }
    }
  }
  return J.wildcardStore !== null ? { store: J.wildcardStore, params: { "*": $.substring(W, Y) } } : null;
};
var L1 = a0(f0(), 1);
var c$ = a0(K8(), 1);
var O8 = a0(q6(), 1);
/*!
 * mergician
 * v1.1.0
 * https://jhildenbiddle.github.io/mergician/
 * (c) 2022-2023 John Hildenbiddle
 * MIT license
 */
var z9 = Object.getOwnPropertyNames;
var M6 = ($, Y) => function J() {
  return Y || (0, $[z9($)[0]])((Y = { exports: {} }).exports, Y), Y.exports;
};
var H9 = M6({ "src/util.cjs"($, Y) {
  function J(...N) {
    const K = {};
    return N.forEach((w) => {
      w.forEach((B) => {
        K[B] = (B in K) ? ++K[B] : 1;
      });
    }), K;
  }
  function X(...N) {
    const K = J(...N);
    return Object.keys(K).filter((w) => K[w] > 1);
  }
  function Z(...N) {
    return N.reduce((K, w) => K.filter(Set.prototype.has, new Set(w)));
  }
  function W(...N) {
    const K = J(...N);
    return Object.keys(K).filter((w) => K[w] === 1);
  }
  function q(...N) {
    const K = J(...N);
    return Object.keys(K).filter((w) => K[w] < N.length);
  }
  function M(N, K = false) {
    if (K) {
      const w = [];
      for (let B in N)
        w.push(B);
      return w;
    } else
      return Object.keys(N);
  }
  function A(N) {
    return typeof N === "object" && N !== null && !Array.isArray(N);
  }
  function D(N) {
    if (!A(N))
      return false;
    const K = ["writable", "enumerable", "configurable"].some((S) => (S in N)), w = ["get", "set"].some((S) => typeof N[S] === "function"), B = ["get", "set"].every((S) => (S in N));
    let C = ("value" in N) && K || w && (B || K);
    if (C) {
      const S = ["configurable", "get", "set", "enumerable", "value", "writable"];
      C = Object.keys(N).some((I) => !(I in S));
    }
    return C;
  }
  Y.exports = { countOccurrences: J, getInMultiple: X, getInAll: Z, getNotInMultiple: W, getNotInAll: q, getObjectKeys: M, isObject: A, isPropDescriptor: D };
} });
var q9 = M6({ "src/index.cjs"($, Y) {
  var { getInMultiple: J, getInAll: X, getNotInMultiple: Z, getNotInAll: W, getObjectKeys: q, isObject: M, isPropDescriptor: A } = H9(), D = { onlyKeys: [], skipKeys: [], onlyCommonKeys: false, onlyUniversalKeys: false, skipCommonKeys: false, skipUniversalKeys: false, invokeGetters: false, skipSetters: false, appendArrays: false, prependArrays: false, dedupArrays: false, sortArrays: false, hoistProto: false, filter: Function.prototype, beforeEach: Function.prototype, afterEach: Function.prototype, onCircular: Function.prototype };
  function N(...K) {
    const w = arguments.length === 1 ? arguments[0] : {}, B = { ...D, ...w }, C = new Map, S = new Map, I = typeof B.sortArrays === "function" ? B.sortArrays : undefined, R = new WeakMap;
    let g = 0;
    function i(E) {
      return q(E, B.hoistProto);
    }
    function j(...E) {
      let x;
      if (E.length > 1) {
        if (B.onlyCommonKeys)
          x = J(...E.map((d) => i(d)));
        else if (B.onlyUniversalKeys)
          x = X(...E.map((d) => i(d)));
        else if (B.skipCommonKeys)
          x = Z(...E.map((d) => i(d)));
        else if (B.skipUniversalKeys)
          x = W(...E.map((d) => i(d)));
      }
      if (!x && B.onlyKeys.length)
        x = B.onlyKeys;
      if (x && x !== B.onlyKeys && B.onlyKeys.length)
        x = x.filter((d) => B.onlyKeys.includes(d));
      const F0 = E.reduce((d, a) => {
        R.set(a, d);
        let J0 = x || i(a);
        if (B.skipKeys.length)
          J0 = J0.filter((D0) => B.skipKeys.indexOf(D0) === -1);
        for (let D0 = 0;D0 < J0.length; D0++) {
          const v = J0[D0], U0 = d[v];
          let S0 = false, y;
          if ((v in a) === false)
            continue;
          try {
            y = a[v];
          } catch (m) {
            console.error(m);
            continue;
          }
          const L0 = Object.getOwnPropertyDescriptor(a, v);
          if (L0 && typeof L0.set === "function" && typeof L0.get !== "function") {
            if (!B.skipSetters)
              L0.configurable = true, Object.defineProperty(d, v, L0);
            continue;
          }
          if (B.filter !== D.filter) {
            const m = B.filter({ depth: g, key: v, srcObj: a, srcVal: y, targetObj: d, targetVal: U0 });
            if (m !== undefined && !m)
              continue;
          }
          if (B.beforeEach !== D.beforeEach) {
            const m = B.beforeEach({ depth: g, key: v, srcObj: a, srcVal: y, targetObj: d, targetVal: U0 });
            if (m !== undefined)
              S0 = true, y = m;
          }
          if (typeof y === "object" && y !== null) {
            if (R.has(a[v])) {
              const m = B.onCircular({ depth: g, key: v, srcObj: a, srcVal: a[v], targetObj: d, targetVal: U0 });
              if (m === undefined) {
                y = R.get(a[v]), d[v] = y;
                continue;
              }
              S0 = true, y = m;
            }
          }
          if (Array.isArray(y)) {
            if (y = [...y], Array.isArray(U0)) {
              if (B.appendArrays)
                y = [...U0, ...y];
              else if (B.prependArrays)
                y = [...y, ...U0];
            }
            if (B.dedupArrays)
              if (B.afterEach !== D.afterEach)
                y = [...new Set(y)];
              else {
                const m = C.get(d);
                if (m && !m.includes(v))
                  m.push(v);
                else
                  C.set(d, [v]);
              }
            if (B.sortArrays)
              if (B.afterEach !== D.afterEach)
                y = y.sort(I);
              else {
                const m = S.get(d);
                if (m && !m.includes(v))
                  m.push(v);
                else
                  S.set(d, [v]);
              }
          } else if (M(y) && (!S0 || !A(y))) {
            if (g++, M(U0))
              y = j(U0, y);
            else
              y = j(y);
            g--;
          }
          if (B.afterEach !== D.afterEach) {
            const m = B.afterEach({ depth: g, key: v, mergeVal: y, srcObj: a, targetObj: d });
            if (m !== undefined)
              S0 = true, y = m;
          }
          if (S0)
            if (A(y)) {
              if (y.configurable = true, y.enumerable = !("enumerable" in y) ? true : y.enumerable, ("value" in y) && !("writable" in y))
                y.writable = true;
              Object.defineProperty(d, v, y);
            } else
              d[v] = y;
          else {
            const m = Object.getOwnPropertyDescriptor(a, v);
            if (m && typeof m.get === "function" && !B.invokeGetters) {
              if (B.skipSetters)
                m.set = undefined;
              m.configurable = true, Object.defineProperty(d, v, m);
            } else
              d[v] = y;
          }
        }
        return d;
      }, {});
      for (let [d, a] of C.entries())
        for (let J0 of a)
          d[J0] = [...new Set(d[J0])];
      for (let [d, a] of S.entries())
        for (let J0 of a)
          d[J0].sort(I);
      return F0;
    }
    if (arguments.length === 1)
      return function(...E) {
        if (arguments.length === 1)
          return N({ ...B, ...E[0] });
        else
          return j(...E);
      };
    else
      return j(...arguments);
  }
  Y.exports = N;
} });
var F6 = q9();
var J$ = F6({ appendArrays: true });
var w0 = ($, Y) => {
  const J = [...Array.isArray($) ? $ : [$]], X = [];
  for (let Z of J)
    if (Z.$elysiaChecksum)
      X.push(Z.$elysiaChecksum);
  for (let Z of Array.isArray(Y) ? Y : [Y])
    if (!X.includes(Z?.$elysiaChecksum))
      J.push(Z);
  return J;
};
var F$ = ($, Y) => {
  return { body: Y?.body ?? $?.body, headers: Y?.headers ?? $?.headers, params: Y?.params ?? $?.params, query: Y?.query ?? $?.query, response: Y?.response ?? $?.response, type: $?.type || Y?.type, detail: J$(Y?.detail ?? {}, $?.detail ?? {}), parse: w0($.parse ?? [], Y?.parse ?? []), transform: w0($.transform ?? [], Y?.transform ?? []), beforeHandle: w0($.beforeHandle ?? [], Y?.beforeHandle ?? []), afterHandle: w0($.afterHandle ?? [], Y?.afterHandle ?? []), onResponse: w0($.onResponse ?? [], Y?.onResponse ?? []), error: w0($.error ?? [], Y?.error ?? []) };
};
var V0 = ($, { models: Y = {}, additionalProperties: J = false, dynamic: X = false }) => {
  if (!$)
    return;
  if (typeof $ === "string" && !($ in Y))
    return;
  const Z = typeof $ === "string" ? Y[$] : $;
  if (Z.type === "object" && ("additionalProperties" in Z) === false)
    Z.additionalProperties = J;
  if (X)
    return { schema: Z, references: "", checkFunc: () => {
    }, code: "", Check: (W) => c$.Value.Check(Z, W), Errors: (W) => c$.Value.Errors(Z, W), Code: () => "" };
  return O8.TypeCompiler.Compile(Z);
};
var I8 = ($, { models: Y = {}, additionalProperties: J = false, dynamic: X = false }) => {
  if (!$)
    return;
  if (typeof $ === "string" && !($ in Y))
    return;
  const Z = typeof $ === "string" ? Y[$] : $, W = (M) => {
    if (X)
      return { schema: M, references: "", checkFunc: () => {
      }, code: "", Check: (A) => c$.Value.Check(M, A), Errors: (A) => c$.Value.Errors(M, A), Code: () => "" };
    return O8.TypeCompiler.Compile(M);
  };
  if (L1.Kind in Z)
    return { 200: W(Z) };
  const q = {};
  return Object.keys(Z).forEach((M) => {
    const A = Z[M];
    if (typeof A === "string") {
      if (A in Y) {
        const D = Y[A];
        D.type === "object" && ("additionalProperties" in D), q[+M] = (L1.Kind in D) ? W(D) : D;
      }
      return;
    }
    if (A.type === "object" && ("additionalProperties" in A) === false)
      A.additionalProperties = J;
    q[+M] = (L1.Kind in A) ? W(A) : A;
  }), q;
};
var U6 = ($) => {
  let Y = 9;
  for (let J = 0;J < $.length; )
    Y = Math.imul(Y ^ $.charCodeAt(J++), 387420489);
  return Y = Y ^ Y >>> 9;
};
var C1 = ($, Y, J) => {
  const X = (Z) => {
    if (J)
      Z.$elysiaChecksum = J;
    return Z;
  };
  return { start: w0($.start, ("start" in Y ? Y.start : []).map(X)), request: w0($.request, ("request" in Y ? Y.request : []).map(X)), parse: w0($.parse, Y?.parse ?? []).map(X), transform: w0($.transform, (Y?.transform ?? []).map(X)), beforeHandle: w0($.beforeHandle, (Y?.beforeHandle ?? []).map(X)), afterHandle: w0($.afterHandle, (Y?.afterHandle ?? []).map(X)), onResponse: w0($.onResponse, (Y?.onResponse ?? []).map(X)), error: w0($.error, (Y?.error ?? []).map(X)), stop: w0($.stop, ("stop" in Y ? Y.stop : []).map(X)) };
};
var B6 = ($, Y = true) => {
  if (!$)
    return $;
  if (typeof $ === "function") {
    if (Y)
      $.$elysiaHookType = "global";
    else
      $.$elysiaHookType = undefined;
    return $;
  }
  return $.map((J) => {
    if (Y)
      J.$elysiaHookType = "global";
    else
      J.$elysiaHookType = undefined;
    return J;
  });
};
var k$ = ($) => {
  if (!$)
    return $;
  if (typeof $ === "function")
    return $.$elysiaHookType === "global" ? $ : undefined;
  return $.filter((Y) => Y.$elysiaHookType === "global");
};
var _8 = ($) => {
  return { ...$, type: $?.type, detail: $?.detail, parse: k$($?.parse), transform: k$($?.transform), beforeHandle: k$($?.beforeHandle), afterHandle: k$($?.afterHandle), onResponse: k$($?.onResponse), error: k$($?.error) };
};
var T6 = a0(G8(), 1);
var x6 = "toJSON" in new Headers;
var V6 = ($) => {
  for (let Y in $)
    return true;
  return false;
};
var k6 = ($, Y) => {
  $.delete("Set-Cookie");
  for (let J = 0;J < Y.length; J++) {
    const X = Y[J].indexOf("=");
    $.append("Set-Cookie", `${Y[J].slice(0, X)}=${Y[J].slice(X + 1)}`);
  }
  return $;
};
var i0 = ($, Y) => {
  if (V6(Y.headers) || Y.status !== 200 || Y.redirect) {
    if (Y.redirect)
      Y.headers.Location = Y.redirect, Y.status = 302;
    if (Y.headers["Set-Cookie"] && Array.isArray(Y.headers["Set-Cookie"]))
      Y.headers = k6(new Headers(Y.headers), Y.headers["Set-Cookie"]);
    switch ($?.constructor?.name) {
      case "String":
      case "Blob":
        return new Response($, Y);
      case "Object":
      case "Array":
        return Response.json($, Y);
      case undefined:
        if (!$)
          return;
        return Response.json($, Y);
      case "Response":
        const J = Object.assign({}, Y.headers);
        if (x6)
          Y.headers = $.headers.toJSON();
        else
          for (let [Z, W] of $.headers.entries())
            if (!(Z in Y.headers))
              Y.headers[Z] = W;
        for (let Z in J)
          $.headers.append(Z, J[Z]);
        if ($.status !== Y.status)
          Y.status = $.status;
        return $;
      case "Promise":
        return $.then((Z) => {
          const W = i0(Z, Y);
          if (W !== undefined)
            return W;
          return;
        });
      case "Error":
        return l$($, Y.headers);
      case "Function":
        return $();
      case "Number":
      case "Boolean":
        return new Response($.toString(), Y);
      default:
        if ($ instanceof Response)
          return $;
        const X = JSON.stringify($);
        if (X.charCodeAt(0) === 123) {
          if (!Y.headers["Content-Type"])
            Y.headers["Content-Type"] = "application/json";
          return new Response(JSON.stringify($), Y);
        }
        return new Response(X, Y);
    }
  } else
    switch ($?.constructor?.name) {
      case "String":
      case "Blob":
        return new Response($);
      case "Object":
      case "Array":
        return new Response(JSON.stringify($), { headers: { "content-type": "application/json" } });
      case undefined:
        if (!$)
          return new Response("");
        return new Response(JSON.stringify($), { headers: { "content-type": "application/json" } });
      case "Response":
        return $;
      case "Promise":
        return $.then((X) => {
          const Z = i0(X, Y);
          if (Z !== undefined)
            return Z;
          return;
        });
      case "Error":
        return l$($, Y.headers);
      case "Function":
        return $();
      case "Number":
      case "Boolean":
        return new Response($.toString());
      default:
        if ($ instanceof Response)
          return $;
        const J = JSON.stringify($);
        if (J.charCodeAt(0) === 123)
          return new Response(JSON.stringify($), { headers: { "Content-Type": "application/json" } });
        return new Response(J);
    }
};
var s0 = ($, Y) => {
  if (V6(Y.headers) || Y.status !== 200 || Y.redirect) {
    if (Y.redirect)
      Y.headers.Location = Y.redirect, Y.status = 302;
    if (Y.headers["Set-Cookie"] && Array.isArray(Y.headers["Set-Cookie"]))
      Y.headers = k6(new Headers(Y.headers), Y.headers["Set-Cookie"]);
    switch ($?.constructor?.name) {
      case "String":
      case "Blob":
        return new Response($, { status: Y.status, headers: Y.headers });
      case "Object":
      case "Array":
        return Response.json($, Y);
      case undefined:
        if (!$)
          return new Response("", Y);
        return Response.json($, Y);
      case "Response":
        const J = Object.assign({}, Y.headers);
        if (x6)
          Y.headers = $.headers.toJSON();
        else
          for (let [Z, W] of $.headers.entries())
            if (!(Z in Y.headers))
              Y.headers[Z] = W;
        for (let Z in J)
          $.headers.append(Z, J[Z]);
        return $;
      case "Error":
        return l$($, Y.headers);
      case "Promise":
        return $.then((Z) => s0(Z, Y));
      case "Function":
        return $();
      case "Number":
      case "Boolean":
        return new Response($.toString(), Y);
      default:
        if ($ instanceof Response)
          return $;
        const X = JSON.stringify($);
        if (X.charCodeAt(0) === 123) {
          if (!Y.headers["Content-Type"])
            Y.headers["Content-Type"] = "application/json";
          return new Response(JSON.stringify($), Y);
        }
        return new Response(X, Y);
    }
  } else
    switch ($?.constructor?.name) {
      case "String":
      case "Blob":
        return new Response($);
      case "Object":
      case "Array":
        return new Response(JSON.stringify($), { headers: { "content-type": "application/json" } });
      case undefined:
        if (!$)
          return new Response("");
        return new Response(JSON.stringify($), { headers: { "content-type": "application/json" } });
      case "Response":
        return $;
      case "Error":
        return l$($);
      case "Promise":
        return $.then((X) => {
          const Z = s0(X, Y);
          if (Z !== undefined)
            return Z;
          return new Response("");
        });
      case "Function":
        return $();
      case "Number":
      case "Boolean":
        return new Response($.toString());
      default:
        if ($ instanceof Response)
          return $;
        const J = JSON.stringify($);
        if (J.charCodeAt(0) === 123)
          return new Response(JSON.stringify($), { headers: { "Content-Type": "application/json" } });
        return new Response(J);
    }
};
var j1 = ($) => {
  switch ($?.constructor?.name) {
    case "String":
    case "Blob":
      return new Response($);
    case "Object":
    case "Array":
      return new Response(JSON.stringify($), { headers: { "content-type": "application/json" } });
    case undefined:
      if (!$)
        return new Response("");
      return new Response(JSON.stringify($), { headers: { "content-type": "application/json" } });
    case "Response":
      return $;
    case "Error":
      return l$($);
    case "Promise":
      return $.then((J) => {
        const X = j1(J);
        if (X !== undefined)
          return X;
        return new Response("");
      });
    case "Function":
      return $();
    case "Number":
    case "Boolean":
      return new Response($.toString());
    default:
      if ($ instanceof Response)
        return $;
      const Y = JSON.stringify($);
      if (Y.charCodeAt(0) === 123)
        return new Response(JSON.stringify($), { headers: { "Content-Type": "application/json" } });
      return new Response(Y);
  }
};
var l$ = ($, Y) => new Response(JSON.stringify({ name: $?.name, message: $?.message, cause: $?.cause }), { status: 500, headers: Y });
var E8 = a0(K8(), 1);
var g6 = typeof Bun !== "undefined" ? Bun.env : typeof process !== "undefined" ? process?.env : undefined;
var X$ = Symbol("ErrorCode");
var t$ = (g6?.NODE_ENV ?? g6?.ENV) === "production";

class O1 extends Error {
  code = "NOT_FOUND";
  status = 500;
  constructor() {
    super("INTERNAL_SERVER_ERROR");
  }
}

class U$ extends Error {
  code = "NOT_FOUND";
  status = 404;
  constructor() {
    super("NOT_FOUND");
  }
}
class K0 extends Error {
  $;
  Y;
  J;
  code = "VALIDATION";
  status = 400;
  constructor($, Y, J) {
    const X = t$ ? undefined : Y.Errors(J).First(), Z = X?.schema.error ? typeof X.schema.error === "function" ? X.schema.error($, Y, J) : X.schema.error : undefined, W = t$ ? Z ?? `Invalid ${$ ?? X?.schema.error ?? X?.message}` : Z ?? `Invalid ${$}, '${X?.path?.slice(1) || "type"}': ${X?.message}` + "\n\nExpected: " + JSON.stringify(E8.Value.Create(Y.schema), null, 2) + "\n\nFound: " + JSON.stringify(J, null, 2);
    super(W);
    this.type = $;
    this.validator = Y;
    this.value = J;
    Object.setPrototypeOf(this, K0.prototype);
  }
  get all() {
    return [...this.validator.Errors(this.value)];
  }
  get model() {
    return E8.Value.Create(this.validator.schema);
  }
  toResponse($) {
    return new Response(this.message, { status: 400, headers: $ });
  }
}
var D9 = new Headers;
var P9 = new RegExp(" (\\w+) = context", "g");
var r$ = ($) => {
  const Y = $.indexOf(")");
  if ($.charCodeAt(Y + 2) === 61 && $.charCodeAt(Y + 5) !== 123)
    return true;
  return $.includes("return");
};
var K9 = ($) => ({ composeValidation: (Y, J = `c.${Y}`) => $ ? `c.set.status = 400; throw new ValidationError(
'${Y}',
${Y},
${J}
)` : `c.set.status = 400; return new ValidationError(
	'${Y}',
	${Y},
	${J}
).toResponse(c.set.headers)`, composeResponseValidation: (Y = "r") => $ ? `throw new ValidationError(
'response',
response[c.set.status],
${Y}
)` : `return new ValidationError(
'response',
response[c.set.status],
${Y}
).toResponse(c.set.headers)` });
var s$ = ($, Y) => {
  Y = Y.trimStart(), Y = Y.replaceAll(/^async /g, "");
  const J = Y.charCodeAt(0) === 40 || Y.startsWith("function") ? Y.slice(Y.indexOf("(") + 1, Y.indexOf(")")) : Y.slice(0, Y.indexOf("=") - 1);
  if (J === "")
    return false;
  if (J.charCodeAt(0) === 123) {
    if (J.includes($))
      return true;
    return false;
  }
  if (Y.match(new RegExp(`${J}(.${$}|\\["${$}"\\])`)))
    return true;
  const X = [J];
  for (let W of Y.matchAll(P9))
    X.push(W[1]);
  const Z = new RegExp(`{.*?} = (${X.join("|")})`, "g");
  for (let [W] of Y.matchAll(Z))
    if (W.includes(`{ ${$}`) || W.includes(`, ${$}`))
      return true;
  return false;
};
var B$ = ($, Y, J = [], X = "") => {
  if (Y.type === "object") {
    const Z = Y.properties;
    for (let W in Z) {
      const q = Z[W], M = !X ? W : X + "." + W;
      if (q.type === "object") {
        B$($, q, J, M);
        continue;
      } else if (q.anyOf) {
        for (let A of q.anyOf)
          B$($, A, J, M);
        continue;
      }
      if (q.elysiaMeta === $)
        J.push(M);
    }
    if (J.length === 0)
      return null;
    return J;
  } else if (Y?.elysiaMeta === $) {
    if (X)
      J.push(X);
    return "root";
  }
  return null;
};
var S9 = ($) => {
  if (!$)
    return;
  const Y = $?.schema;
  if (Y && ("anyOf" in Y)) {
    let J = false;
    const X = Y.anyOf[0].type;
    for (let Z of Y.anyOf)
      if (Z.type !== X) {
        J = true;
        break;
      }
    if (!J)
      return X;
  }
};
var L9 = /(?:return|=>) \S*\(/g;
var M0 = ($) => {
  if ($.constructor.name === "AsyncFunction")
    return true;
  if ($.toString().match(L9))
    return true;
  return false;
};
var d6 = ({ method: $, hooks: Y, validator: J, handler: X, handleError: Z, meta: W, onRequest: q, config: M }) => {
  const A = M.forceErrorEncapsulation || Y.error.length > 0 || typeof Bun === "undefined" || Y.onResponse.length > 0, { composeValidation: D, composeResponseValidation: N } = K9(A), K = Y.onResponse.length ? `\n;(async () => {${Y.onResponse.map((j, E) => `await res${E}(c)`).join(";")}})();\n` : "";
  let w = A ? "try {\n" : "";
  const B = J || $ !== "GET" ? [X, ...Y.transform, ...Y.beforeHandle, ...Y.afterHandle].map((j) => j.toString()) : [], C = $ !== "GET" && Y.type !== "none" && (!!J.body || !!Y.type || B.some((j) => s$("body", j))), S = J.headers || B.some((j) => s$("headers", j));
  if (S)
    w += D9.toJSON ? "c.headers = c.request.headers.toJSON()\n" : `c.headers = {}
                for (const [key, value] of c.request.headers.entries())
					c.headers[key] = value
				`;
  if (J.query || B.some((j) => s$("query", j)))
    w += `const url = c.request.url

		if(c.qi !== -1) {
			c.query ??= parseQuery(url.substring(c.qi + 1))
		} else {
			c.query ??= {}
		}
		`;
  const R = B.some((j) => s$("set", j)) || q.some((j) => s$("set", j.toString())), g = C || M0(X) || Y.parse.length > 0 || Y.afterHandle.some(M0) || Y.beforeHandle.some(M0) || Y.transform.some(M0);
  if (C) {
    const j = S9(J?.body);
    if (Y.type || j) {
      if (Y.type)
        switch (Y.type) {
          case "application/json":
            w += "c.body = await c.request.json();";
            break;
          case "text/plain":
            w += "c.body = await c.request.text();";
            break;
          case "application/x-www-form-urlencoded":
            w += "c.body = parseQuery(await c.request.text());";
            break;
          case "application/octet-stream":
            w += "c.body = await c.request.arrayBuffer();";
            break;
          case "multipart/form-data":
            w += `c.body = {}

					const form = await c.request.formData()
					for (const key of form.keys()) {
						if (c.body[key])
							continue

						const value = form.getAll(key)
						if (value.length === 1)
							c.body[key] = value[0]
						else c.body[key] = value
					}`;
            break;
        }
      else if (j) {
        const E = J?.body?.schema;
        switch (j) {
          case "object":
            if (E.elysiaMeta === "URLEncoded")
              w += "c.body = parseQuery(await c.request.text())";
            else if (J.body.Code().includes("custom('File"))
              w += `c.body = {}

							const form = await c.request.formData()
							for (const key of form.keys()) {
								if (c.body[key])
									continue
		
								const value = form.getAll(key)
								if (value.length === 1)
									c.body[key] = value[0]
								else c.body[key] = value
							}`;
            else
              w += "c.body = JSON.parse(await c.request.text())";
            break;
          default:
            w += "c.body = await c.request.text()";
            break;
        }
      }
      if (Y.parse.length)
        w += "}}";
    } else {
      if (w += "\n", w += S ? "let contentType = c.headers['content-type']" : "let contentType = c.request.headers.get('content-type')", w += `
            if (contentType) {
				const index = contentType.indexOf(';')
				if (index !== -1) contentType = contentType.substring(0, index)\n`, Y.parse.length) {
        w += "let used = false\n";
        for (let E = 0;E < Y.parse.length; E++) {
          const x = `bo${E}`;
          if (E !== 0)
            w += "if(!used) {\n";
          if (w += `let ${x} = parse[${E}](c, contentType);`, w += `if(${x} instanceof Promise) ${x} = await ${x};`, w += `
						if(${x} !== undefined) { c.body = ${x}; used = true }\n`, E !== 0)
            w += "}";
        }
        w += "if (!used)";
      }
      w += `switch (contentType) {
			case 'application/json':
				c.body = await c.request.json()
				break

			case 'text/plain':
				c.body = await c.request.text()
				break

			case 'application/x-www-form-urlencoded':
				c.body = parseQuery(await c.request.text())
				break

			case 'application/octet-stream':
				c.body = await c.request.arrayBuffer();
				break

			case 'multipart/form-data':
				c.body = {}

				const form = await c.request.formData()
				for (const key of form.keys()) {
					if (c.body[key])
						continue

					const value = form.getAll(key)
					if (value.length === 1)
						c.body[key] = value[0]
					else c.body[key] = value
				}

				break
			}
		}\n`;
    }
    w += "\n";
  }
  if (J.params) {
    const j = B$("Numeric", J.params.schema);
    if (j) {
      switch (typeof j) {
        case "object":
          for (let E of j)
            w += `if(c.params.${E}) c.params.${E} = +c.params.${E};`;
          break;
      }
      w += "\n";
    }
  }
  if (J.query) {
    const j = B$("Numeric", J.query.schema);
    if (j) {
      switch (typeof j) {
        case "object":
          for (let E of j)
            w += `if(c.query.${E}) c.query.${E} = +c.query.${E};`;
          break;
      }
      w += "\n";
    }
  }
  if (J.headers) {
    const j = B$("Numeric", J.headers.schema);
    if (j) {
      switch (typeof j) {
        case "object":
          for (let E of j)
            w += `c.headers.${E} = +c.headers.${E};`;
          break;
      }
      w += "\n";
    }
  }
  if (J.body) {
    const j = B$("Numeric", J.body.schema);
    if (j) {
      switch (typeof j) {
        case "string":
          w += "c.body = +c.body;";
          break;
        case "object":
          for (let x of j)
            w += `c.body.${x} = +c.body.${x};`;
          break;
      }
      w += "\n";
    }
    const E = B$("Files", J.body.schema);
    if (E) {
      switch (typeof E) {
        case "object":
          for (let x of E)
            w += `if(!Array.isArray(c.body.${x})) c.body.${x} = [c.body.${x}];`;
          break;
      }
      w += "\n";
    }
  }
  if (Y?.transform)
    for (let j = 0;j < Y.transform.length; j++)
      if (Y.transform[j].$elysia === "derive")
        w += M0(Y.transform[j]) ? `Object.assign(c, await transform[${j}](c));` : `Object.assign(c, transform[${j}](c));`;
      else
        w += M0(Y.transform[j]) ? `await transform[${j}](c);` : `transform[${j}](c);`;
  if (J) {
    if (J.headers)
      w += `
                if (headers.Check(c.headers) === false) {
                    ${D("headers")}
				}
        `;
    if (J.params)
      w += `if(params.Check(c.params) === false) { ${D("params")} }`;
    if (J.query)
      w += `if(query.Check(c.query) === false) { ${D("query")} }`;
    if (J.body)
      w += `if(body.Check(c.body) === false) { ${D("body")} }`;
  }
  if (Y?.beforeHandle)
    for (let j = 0;j < Y.beforeHandle.length; j++) {
      const E = `be${j}`;
      if (!r$(Y.beforeHandle[j].toString()))
        w += M0(Y.beforeHandle[j]) ? `await beforeHandle[${j}](c);\n` : `beforeHandle[${j}](c);\n`;
      else {
        if (w += M0(Y.beforeHandle[j]) ? `let ${E} = await beforeHandle[${j}](c);\n` : `let ${E} = beforeHandle[${j}](c);\n`, w += `if(${E} !== undefined) {\n`, Y?.afterHandle) {
          const F0 = E;
          for (let d = 0;d < Y.afterHandle.length; d++)
            if (!r$(Y.afterHandle[d].toString()))
              w += M0(Y.afterHandle[d]) ? `await afterHandle[${d}](c, ${F0});\n` : `afterHandle[${d}](c, ${F0});\n`;
            else {
              const J0 = `af${d}`;
              w += M0(Y.afterHandle[d]) ? `const ${J0} = await afterHandle[${d}](c, ${F0});\n` : `const ${J0} = afterHandle[${d}](c, ${F0});\n`, w += `if(${J0} !== undefined) { ${F0} = ${J0} }\n`;
            }
        }
        if (J.response)
          w += `if(response[c.set.status]?.Check(${E}) === false) { 
						if(!(response instanceof Error))
							${N(E)}
					}\n`;
        w += `return mapEarlyResponse(${E}, c.set)}\n`;
      }
    }
  if (Y?.afterHandle.length) {
    w += M0(X) ? "let r = await handler(c);\n" : "let r = handler(c);\n";
    for (let j = 0;j < Y.afterHandle.length; j++) {
      const E = `af${j}`;
      if (!r$(Y.afterHandle[j].toString()))
        w += M0(Y.afterHandle[j]) ? `await afterHandle[${j}](c, r)\n` : `afterHandle[${j}](c, r)\n`;
      else if (w += M0(Y.afterHandle[j]) ? `let ${E} = await afterHandle[${j}](c, r)\n` : `let ${E} = afterHandle[${j}](c, r)\n`, J.response)
        w += `if(${E} !== undefined) {`, w += `if(response[c.set.status]?.Check(${E}) === false) { 
						if(!(response instanceof Error))
						${N(E)}
					}\n`, w += `${E} = mapEarlyResponse(${E}, c.set)\n`, w += `if(${E}) return ${E};\n}`;
      else
        w += `if(${E}) return ${E};\n`;
    }
    if (J.response)
      w += `if(response[c.set.status]?.Check(r) === false) { 
				if(!(response instanceof Error))
					${N()}
			}\n`;
    if (R)
      w += "return mapResponse(r, c.set)\n";
    else
      w += "return mapCompactResponse(r)\n";
  } else if (J.response)
    if (w += M0(X) ? "const r = await handler(c);\n" : "const r = handler(c);\n", w += `if(response[c.set.status]?.Check(r) === false) { 
				if(!(response instanceof Error))
					${N()}
			}\n`, R)
      w += "return mapResponse(r, c.set)\n";
    else
      w += "return mapCompactResponse(r)\n";
  else {
    const j = M0(X) ? "await handler(c) " : "handler(c)";
    if (R)
      w += `return mapResponse(${j}, c.set)\n`;
    else
      w += `return mapCompactResponse(${j})\n`;
  }
  if (A)
    w += `
} catch(error) {
	

	${g ? "" : "return (async () => {"}
		const set = c.set

		if (!set.status || set.status < 300) set.status = 500

		${Y.error.length ? `for (let i = 0; i < handleErrors.length; i++) {
				let handled = handleErrors[i]({
					request: c.request,
					error: error,
					set,
					code: error.code ?? error[ERROR_CODE] ?? "UNKNOWN"
				})
				if (handled instanceof Promise) handled = await handled

				const response = mapEarlyResponse(handled, set)
				if (response) return response
			}` : ""}

		return handleError(c.request, error, set)
	${g ? "" : "})()"}
} finally {
	${K}
}`;
  return w = `const { 
		handler,
		handleError,
		hooks: {
			transform,
			beforeHandle,
			afterHandle,
			parse,
			error: handleErrors,
			onResponse
		},
		validator: {
			body,
			headers,
			params,
			query,
			response
		},
		utils: {
			mapResponse,
			mapCompactResponse,
			mapEarlyResponse,
			parseQuery
		},
		error: {
			NotFoundError,
			ValidationError,
			InternalServerError
		},
		meta,
		ERROR_CODE
	} = hooks

	${Y.onResponse.length ? `const ${Y.onResponse.map((j, E) => `res${E} = onResponse[${E}]`).join(",")}` : ""}

	return ${g ? "async" : ""} function(c) {
		${W ? 'c["schema"] = meta["schema"]; c["defs"] = meta["defs"];' : ""}
		${w}
	}`, Function("hooks", w)({ handler: X, hooks: Y, validator: J, handleError: Z, utils: { mapResponse: s0, mapCompactResponse: j1, mapEarlyResponse: i0, parseQuery: T6.parse }, error: { NotFoundError: U$, ValidationError: K0, InternalServerError: O1 }, meta: W, ERROR_CODE: X$ });
};
var x8 = ($) => {
  let Y = "";
  for (let M of Object.keys($.decorators))
    Y += `,${M}: app.decorators.${M}`;
  const { router: J, staticRouter: X } = $, Z = `
	const route = find(request.method, path) ${J.root.ALL ? '?? find("ALL", path)' : ""}
	if (route === null)
		return ${$.event.error.length ? `handleError(
			request,
			notFound,
			ctx.set
		)` : `new Response(error404, {
					status: 404
				})`}

	ctx.params = route.params

	return route.store(ctx)`;
  let W = "";
  for (let [M, { code: A, all: D }] of Object.entries(X.map))
    W += `case '${M}':\nswitch(request.method) {\n${A}\n${D ?? `default: ${Z}`}}\n\n`;
  let q = `const {
		app,
		app: { store, router, staticRouter },
		mapEarlyResponse,
		NotFoundError
	} = data

	const notFound = new NotFoundError()

	${$.event.request.length ? "const onRequest = app.event.request" : ""}

	${X.variables}

	const find = router.find.bind(router)
	const handleError = app.handleError.bind(this)

	${$.event.error.length ? "" : "const error404 = notFound.message.toString()"}

	return function(request) {
	`;
  if ($.event.request.length) {
    q += `
			const ctx = {
				request,
				store,
				set: {
					headers: {},
					status: 200
				}
				${Y}
			}

			try {\n`;
    for (let M = 0;M < $.event.request.length; M++) {
      const A = r$($.event.request[M].toString());
      q += !A ? `mapEarlyResponse(onRequest[${M}](ctx), ctx.set);` : `const response = mapEarlyResponse(
					onRequest[${M}](ctx),
					ctx.set
				)
				if (response) return response\n`;
    }
    q += `} catch (error) {
			return handleError(request, error, ctx.set)
		}
		
		const url = request.url,
		s = url.indexOf('/', 11),
		i = ctx.qi = url.indexOf('?', s + 1),
		path = ctx.path = i === -1 ? url.substring(s) : url.substring(s, i);`;
  } else
    q += `
		const url = request.url,
			s = url.indexOf('/', 11),
			qi = url.indexOf('?', s + 1),
			path = qi === -1
				? url.substring(s)
				: url.substring(s, qi)

		const ctx = {
			request,
			store,
			qi,
			path,
			set: {
				headers: {},
				status: 200
			}
			${Y}
		}`;
  return q += `
		switch(path) {
			${W}

			default:
				${Z}
		}
	}`, $.handleError = V8($), Function("data", q)({ app: $, mapEarlyResponse: i0, NotFoundError: U$ });
};
var V8 = ($) => {
  let Y = `const {
		app: { event: { error: onError, onResponse: res } },
		mapResponse,
		ERROR_CODE
	} = inject

	return ${$.event.error.find(M0) ? "async" : ""} function(request, error, set) {`;
  for (let J = 0;J < $.event.error.length; J++) {
    const X = $.event.error[J], Z = `${M0(X) ? "await " : ""}onError[${J}]({
			request,
			code: error.code ?? error[ERROR_CODE] ?? 'UNKNOWN',
			error,
			set
		})`;
    if (r$(X.toString()))
      Y += `const r${J} = ${Z}; if(r${J} !== undefined) return mapResponse(r${J}, set)\n`;
    else
      Y += Z + "\n";
  }
  return Y += `if(error.constructor.name === "ValidationError") {
		set.status = error.status ?? 400
		return new Response(
			error.message, 
			{ headers: set.headers, status: set.status }
		)
	} else {
		return new Response(error.message, { headers: set.headers, status: error.status ?? 500 })
	}
}`, Function("inject", Y)({ app: $, mapResponse: s0, ERROR_CODE: X$ });
};
var I1 = ($) => {
  const Y = $.indexOf("/", 10), J = $.indexOf("?", Y);
  if (J === -1)
    return $.slice(Y);
  return $.slice(Y, J);
};

class a$ {
  raw;
  data;
  isSubscribed;
  constructor($) {
    this.raw = $, this.data = $.data, this.isSubscribed = $.isSubscribed;
  }
  publish($, Y = undefined, J) {
    if (typeof Y === "object")
      Y = JSON.stringify(Y);
    return this.raw.publish($, Y, J), this;
  }
  publishToSelf($, Y = undefined, J) {
    if (typeof Y === "object")
      Y = JSON.stringify(Y);
    return this.raw.publish($, Y, J), this;
  }
  send($) {
    if (typeof $ === "object")
      $ = JSON.stringify($);
    return this.raw.send($), this;
  }
  subscribe($) {
    return this.raw.subscribe($), this;
  }
  unsubscribe($) {
    return this.raw.unsubscribe($), this;
  }
  cork($) {
    return this.raw.cork($), this;
  }
  close() {
    return this.raw.close(), this;
  }
}
var _1 = ($) => (Y) => {
  if (!Y.wsRouter)
    Y.wsRouter = new e0;
  const J = Y.wsRouter;
  if (!Y.config.serve)
    Y.config.serve = { websocket: { ...$, open(X) {
      if (!X.data)
        return;
      const Z = I1(X?.data.request.url);
      if (!Z)
        return;
      const W = J.find("subscribe", Z)?.store;
      if (W && W.open)
        W.open(new a$(X));
    }, message(X, Z) {
      if (!X.data)
        return;
      const W = I1(X?.data.request.url);
      if (!W)
        return;
      const q = J.find("subscribe", W)?.store;
      if (!q?.message)
        return;
      Z = Z.toString();
      const M = Z.charCodeAt(0);
      if (M === 47 || M === 123)
        try {
          Z = JSON.parse(Z);
        } catch (A) {
        }
      else if (!Number.isNaN(+Z))
        Z = +Z;
      for (let A = 0;A < X.data.transformMessage.length; A++) {
        const D = X.data.transformMessage[A](Z);
        if (D !== undefined)
          Z = D;
      }
      if (X.data.message?.Check(Z) === false)
        return void X.send(new K0("message", X.data.message, Z).cause);
      q.message(new a$(X), Z);
    }, close(X, Z, W) {
      if (!X.data)
        return;
      const q = I1(X?.data.request.url);
      if (!q)
        return;
      const M = J.find("subscribe", q)?.store;
      if (M && M.close)
        M.close(new a$(X), Z, W);
    }, drain(X) {
      if (!X.data)
        return;
      const Z = I1(X?.data.request.url);
      if (!Z)
        return;
      const W = J.find("subscribe", Z)?.store;
      if (W && W.drain)
        W.drain(new a$(X));
    } } };
  return Y.decorate("publish", Y.server?.publish).onStart((X) => {
    X.decorators.publish = X.server?.publish;
  });
};
var R1 = a0(G8(), 1);
var k8 = ($) => async (Y) => {
  const J = { status: 200, headers: {} };
  let X;
  if ($.decorators)
    X = $.decorators, X.request = Y, X.set = J, X.store = $.store;
  else
    X = { set: J, store: $.store, request: Y };
  const Z = Y.url, W = Z.indexOf("/", 11), q = Z.indexOf("?", W + 1), M = q === -1 ? Z.substring(W) : Z.substring(W, q);
  try {
    for (let S = 0;S < $.event.request.length; S++) {
      const I = $.event.request[S];
      let R = I(X);
      if (R instanceof Promise)
        R = await R;
      if (R = i0(R, J), R)
        return R;
    }
    const A = $.dynamicRouter.find(Y.method, M) ?? $.dynamicRouter.find("ALL", M);
    if (!A)
      throw new U$;
    const { handle: D, hooks: N, validator: K, content: w } = A.store;
    let B;
    if (Y.method !== "GET")
      if (w)
        switch (w) {
          case "application/json":
            B = await Y.json();
            break;
          case "text/plain":
            B = await Y.text();
            break;
          case "application/x-www-form-urlencoded":
            B = R1.parse(await Y.text());
            break;
          case "application/octet-stream":
            B = await Y.arrayBuffer();
            break;
          case "multipart/form-data":
            B = {};
            const S = await Y.formData();
            for (let I of S.keys()) {
              if (B[I])
                continue;
              const R = S.getAll(I);
              if (R.length === 1)
                B[I] = R[0];
              else
                B[I] = R;
            }
            break;
        }
      else {
        let S = Y.headers.get("content-type");
        if (S) {
          const I = S.indexOf(";");
          if (I !== -1)
            S = S.slice(0, I);
          for (let R = 0;R < $.event.parse.length; R++) {
            let g = $.event.parse[R](X, S);
            if (g instanceof Promise)
              g = await g;
            if (g) {
              B = g;
              break;
            }
          }
          if (B === undefined)
            switch (S) {
              case "application/json":
                B = await Y.json();
                break;
              case "text/plain":
                B = await Y.text();
                break;
              case "application/x-www-form-urlencoded":
                B = R1.parse(await Y.text());
                break;
              case "application/octet-stream":
                B = await Y.arrayBuffer();
                break;
              case "multipart/form-data":
                B = {};
                const R = await Y.formData();
                for (let g of R.keys()) {
                  if (B[g])
                    continue;
                  const i = R.getAll(g);
                  if (i.length === 1)
                    B[g] = i[0];
                  else
                    B[g] = i;
                }
                break;
            }
        }
      }
    X.body = B, X.params = A?.params || {}, X.query = q === -1 ? {} : R1.parse(Z.substring(q + 1));
    for (let S = 0;S < N.transform.length; S++) {
      const I = N.transform[S](X);
      if (N.transform[S].$elysia === "derive")
        if (I instanceof Promise)
          Object.assign(X, await I);
        else
          Object.assign(X, I);
      else if (I instanceof Promise)
        await I;
    }
    if (K) {
      if (K.headers) {
        const S = {};
        for (let I in Y.headers)
          S[I] = Y.headers.get(I);
        if (K.headers.Check(S) === false)
          throw new K0("header", K.headers, S);
      }
      if (K.params?.Check(X.params) === false)
        throw new K0("params", K.params, X.params);
      if (K.query?.Check(X.query) === false)
        throw new K0("query", K.query, X.query);
      if (K.body?.Check(B) === false)
        throw new K0("body", K.body, B);
    }
    for (let S = 0;S < N.beforeHandle.length; S++) {
      let I = N.beforeHandle[S](X);
      if (I instanceof Promise)
        I = await I;
      if (I !== undefined) {
        for (let g = 0;g < N.afterHandle.length; g++) {
          let i = N.afterHandle[g](X, I);
          if (i instanceof Promise)
            i = await i;
          if (i)
            I = i;
        }
        const R = i0(I, X.set);
        if (R)
          return R;
      }
    }
    let C = D(X);
    if (C instanceof Promise)
      C = await C;
    if (!N.afterHandle.length) {
      const S = K?.response?.[C.status];
      if (S?.Check(C) === false)
        throw new K0("response", S, C);
    } else
      for (let S = 0;S < N.afterHandle.length; S++) {
        let I = N.afterHandle[S](X, C);
        if (I instanceof Promise)
          I = await I;
        const R = i0(I, X.set);
        if (R !== undefined) {
          const g = K?.response?.[C.status];
          if (g?.Check(R) === false)
            throw new K0("response", g, R);
          return R;
        }
      }
    return s0(C, X.set);
  } catch (A) {
    if (A.status)
      J.status = A.status;
    return $.handleError(Y, A, J);
  } finally {
    for (let A of $.event.onResponse)
      await A(X);
  }
};
var y6 = ($) => async (Y, J, X = { headers: {} }) => {
  for (let Z = 0;Z < $.event.error.length; Z++) {
    let W = $.event.error[Z]({ request: Y, code: J.code ?? J[X$] ?? "UNKNOWN", error: J, set: X });
    if (W instanceof Promise)
      W = await W;
    if (W !== undefined && W !== null)
      return s0(W, X);
  }
  return new Response(typeof J.cause === "string" ? J.cause : J.message, { headers: X.headers, status: J.status ?? 500 });
};
var W$ = a0(f0(), 1);
var Z$ = a0(d$(), 1);
try {
  Z$.TypeSystem.Format("email", ($) => /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test($)), Z$.TypeSystem.Format("uuid", ($) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test($)), Z$.TypeSystem.Format("date", ($) => !Number.isNaN(new Date($).getTime())), Z$.TypeSystem.Format("date-time", ($) => !Number.isNaN(new Date($).getTime()));
} catch ($) {
}
var v6 = ($) => {
  if (typeof $ === "string")
    switch ($.slice(-1)) {
      case "k":
        return +$.slice(0, $.length - 1) * 1024;
      case "m":
        return +$.slice(0, $.length - 1) * 1048576;
      default:
        return +$;
    }
  return $;
};
var g8 = ($, Y) => {
  if (!(Y instanceof Blob))
    return false;
  if ($.minSize && Y.size < v6($.minSize))
    return false;
  if ($.maxSize && Y.size > v6($.maxSize))
    return false;
  if ($.extension)
    if (typeof $.extension === "string") {
      if (!Y.type.startsWith($.extension))
        return false;
    } else {
      for (let J = 0;J < $.extension.length; J++)
        if (Y.type.startsWith($.extension[J]))
          return true;
      return false;
    }
  return true;
};
var i6 = { Numeric: Z$.TypeSystem.Type("Numeric", {}), File: Z$.TypeSystem.Type("File", g8), Files: Z$.TypeSystem.Type("Files", ($, Y) => {
  if (!Array.isArray(Y))
    return g8($, Y);
  if ($.minItems && Y.length < $.minItems)
    return false;
  if ($.maxItems && Y.length > $.maxItems)
    return false;
  for (let J = 0;J < Y.length; J++)
    if (!g8($, Y[J]))
      return false;
  return true;
}) };
W$.Type.Numeric = ($) => {
  return W$.Type.Number({ ...$, elysiaMeta: "Numeric" });
};
W$.Type.URLEncoded = ($, Y) => W$.Type.Object($, { ...Y, elysiaMeta: "URLEncoded" });
W$.Type.File = ($) => i6.File({ elysiaMeta: "File", default: "File", ...$, extension: $?.type, type: "string", format: "binary" });
W$.Type.Files = ($) => i6.Files({ ...$, elysiaMeta: "Files", default: "Files", extension: $?.type, type: "array", items: { ...$, default: "Files", type: "string", format: "binary" } });

class b1 {
  config;
  dependencies = {};
  store = {};
  meta = { schema: Object.create(null), defs: Object.create(null), exposed: Object.create(null) };
  decorators = {};
  event = { start: [], request: [], parse: [], transform: [], beforeHandle: [], afterHandle: [], onResponse: [], error: [], stop: [] };
  server = null;
  $schema = null;
  error = {};
  router = new e0;
  routes = [];
  staticRouter = { handlers: [], variables: "", map: {}, all: "" };
  wsRouter;
  dynamicRouter = new e0;
  lazyLoadModules = [];
  path = "";
  constructor($) {
    this.config = { forceErrorEncapsulation: false, prefix: "", aot: true, strictPath: false, scoped: false, ...$, seed: $?.seed === undefined ? "" : $?.seed };
  }
  add($, Y, J, X, { allowMeta: Z = false, skipPrefix: W = false } = { allowMeta: false, skipPrefix: false }) {
    if (Y = Y === "" ? Y : Y.charCodeAt(0) === 47 ? Y : `/${Y}`, this.config.prefix && !W)
      Y = this.config.prefix + Y;
    const q = this.meta.defs;
    if (X?.type)
      switch (X.type) {
        case "text":
          X.type = "text/plain";
          break;
        case "json":
          X.type = "application/json";
          break;
        case "formdata":
          X.type = "multipart/form-data";
          break;
        case "urlencoded":
          X.type = "application/x-www-form-urlencoded";
          break;
        case "arrayBuffer":
          X.type = "application/octet-stream";
          break;
        default:
          break;
      }
    const M = { body: V0(X?.body ?? this.$schema?.body, { dynamic: !this.config.aot, models: q }), headers: V0(X?.headers ?? this.$schema?.headers, { dynamic: !this.config.aot, models: q, additionalProperties: true }), params: V0(X?.params ?? this.$schema?.params, { dynamic: !this.config.aot, models: q }), query: V0(X?.query ?? this.$schema?.query, { dynamic: !this.config.aot, models: q }), response: I8(X?.response ?? this.$schema?.response, { dynamic: !this.config.aot, models: q }) }, A = F$(this.event, X), D = Y.endsWith("/") ? Y.slice(0, Y.length - 1) : Y + "/";
    if (this.config.aot === false) {
      if (this.dynamicRouter.add($, Y, { validator: M, hooks: A, content: X?.type, handle: J }), this.config.strictPath === false)
        this.dynamicRouter.add($, D, { validator: M, hooks: A, content: X?.type, handle: J });
      this.routes.push({ method: $, path: Y, composed: null, handler: J, hooks: A });
      return;
    }
    const N = d6({ path: Y, method: $, hooks: A, validator: M, handler: J, handleError: this.handleError, meta: Z ? this.meta : undefined, onRequest: this.event.request, config: this.config });
    if (this.routes.push({ method: $, path: Y, composed: N, handler: J, hooks: A }), Y.indexOf(":") === -1 && Y.indexOf("*") === -1) {
      const K = this.staticRouter.handlers.length;
      if (this.staticRouter.handlers.push(N), this.staticRouter.variables += `const st${K} = staticRouter.handlers[${K}]\n`, !this.staticRouter.map[Y])
        this.staticRouter.map[Y] = { code: "" };
      if ($ === "ALL")
        this.staticRouter.map[Y].all = `default: return st${K}(ctx)\n`;
      else
        this.staticRouter.map[Y].code += `case '${$}': return st${K}(ctx)\n`;
      if (!this.config.strictPath) {
        if (!this.staticRouter.map[D])
          this.staticRouter.map[D] = { code: "" };
        if ($ === "ALL")
          this.staticRouter.map[D].all = `default: return st${K}(ctx)\n`;
        else
          this.staticRouter.map[D].code += `case '${$}': return st${K}(ctx)\n`;
      }
    } else if (this.router.add($, Y, N), !this.config.strictPath)
      this.router.add($, Y.endsWith("/") ? Y.slice(0, Y.length - 1) : Y + "/", N);
  }
  onStart($) {
    return this.on("start", $), this;
  }
  onRequest($) {
    return this.on("request", $), this;
  }
  onParse($) {
    return this.on("parse", $), this;
  }
  onTransform($) {
    return this.on("transform", $), this;
  }
  onBeforeHandle($) {
    return this.on("beforeHandle", $), this;
  }
  onAfterHandle($) {
    return this.on("afterHandle", $), this;
  }
  onResponse($) {
    return this.on("response", $), this;
  }
  addError($, Y) {
    if (typeof $ === "string" && Y)
      return Y.prototype[X$] = $, this;
    for (let [J, X] of Object.entries($))
      X.prototype[X$] = J;
    return this;
  }
  onError($) {
    return this.on("error", $), this;
  }
  onStop($) {
    return this.on("stop", $), this;
  }
  on($, Y) {
    switch (Y = B6(Y), $) {
      case "start":
        this.event.start.push(Y);
        break;
      case "request":
        this.event.request.push(Y);
        break;
      case "response":
        this.event.onResponse.push(Y);
        break;
      case "parse":
        this.event.parse.splice(this.event.parse.length - 1, 0, Y);
        break;
      case "transform":
        this.event.transform.push(Y);
        break;
      case "beforeHandle":
        this.event.beforeHandle.push(Y);
        break;
      case "afterHandle":
        this.event.afterHandle.push(Y);
        break;
      case "error":
        this.event.error.push(Y);
        break;
      case "stop":
        this.event.stop.push(Y);
        break;
    }
    return this;
  }
  group($, Y, J) {
    const X = new b1({ ...this.config, prefix: "" });
    if (X.store = this.store, this.wsRouter)
      X.use(_1());
    const Z = typeof Y === "object", W = (Z ? J : Y)(X);
    if (this.decorators = J$(this.decorators, X.decorators), W.event.request.length)
      this.event.request = [...this.event.request, ...W.event.request];
    if (W.event.onResponse.length)
      this.event.onResponse = [...this.event.onResponse, ...W.event.onResponse];
    if (this.model(W.meta.defs), Object.values(X.routes).forEach(({ method: q, path: M, handler: A, hooks: D }) => {
      if (M = this.config.prefix + $ + M, Z) {
        const N = Y, K = D;
        if (X.wsRouter?.find("subscribe", M)) {
          const B = X.wsRouter.history.find(([C, S]) => M === S);
          if (!B)
            return;
          return this.ws(M, B[2]);
        }
        this.add(q, M, A, F$(N, { ...K, error: !K.error ? W.event.error : Array.isArray(K.error) ? [...K.error, ...W.event.error] : [K.error, ...W.event.error] }));
      } else {
        if (X.wsRouter?.find("subscribe", M)) {
          const K = X.wsRouter.history.find(([w, B]) => M === B);
          if (!K)
            return;
          return this.ws(M, K[2]);
        }
        this.add(q, M, A, F$(D, { error: W.event.error }), { skipPrefix: true });
      }
    }), X.wsRouter && this.wsRouter)
      X.wsRouter.history.forEach(([q, M, A]) => {
        if (M = this.config.prefix + $ + M, M === "/")
          this.wsRouter?.add(q, $, A);
        else
          this.wsRouter?.add(q, `${$}${M}`, A);
      });
    return this;
  }
  guard($, Y) {
    if (!Y)
      return this.event = C1(this.event, $), this.$schema = { body: $.body, headers: $.headers, params: $.params, query: $.query, response: $.response }, this;
    const J = new b1;
    if (J.store = this.store, this.wsRouter)
      J.use(_1());
    const X = Y(J);
    if (this.decorators = J$(this.decorators, J.decorators), X.event.request.length)
      this.event.request = [...this.event.request, ...X.event.request];
    if (X.event.onResponse.length)
      this.event.onResponse = [...this.event.onResponse, ...X.event.onResponse];
    if (this.model(X.meta.defs), Object.values(J.routes).forEach(({ method: Z, path: W, handler: q, hooks: M }) => {
      if (J.wsRouter?.find("subscribe", W)) {
        const D = J.wsRouter.history.find(([N, K]) => W === K);
        if (!D)
          return;
        return this.ws(W, D[2]);
      }
      this.add(Z, W, q, F$($, { ...M, error: !M.error ? X.event.error : Array.isArray(M.error) ? [...M.error, ...X.event.error] : [M.error, ...X.event.error] }));
    }), J.wsRouter && this.wsRouter)
      J.wsRouter.history.forEach(([Z, W, q]) => {
        this.wsRouter?.add(Z, W, q);
      });
    return this;
  }
  use($) {
    const Y = (J) => {
      if (typeof J === "function") {
        const q = J(this);
        if (q instanceof Promise)
          return this.lazyLoadModules.push(q.then((M) => M.compile())), this;
        return q;
      }
      const X = J.config.scoped;
      if (!X)
        this.decorators = J$(this.decorators, J.decorators), this.state(J.store), this.model(J.meta.defs), this.addError(J.error);
      const { config: { name: Z, seed: W } } = J;
      if (Object.values(J.routes).forEach(({ method: q, path: M, handler: A, hooks: D }) => {
        if (J.wsRouter?.find("subscribe", M)) {
          const K = J.wsRouter.history.find(([w, B]) => M === B);
          if (!K)
            return;
          return this.ws(M, K[2]);
        }
        this.add(q, M, A, F$(D, { error: J.event.error }));
      }), !X)
        if (Z) {
          if (!(Z in this.dependencies))
            this.dependencies[Z] = [];
          const q = W !== undefined ? U6(Z + JSON.stringify(W)) : 0;
          if (this.dependencies[Z].some((M) => q === M))
            return this;
          this.dependencies[Z].push(q), this.event = C1(this.event, _8(J.event), q);
        } else
          this.event = C1(this.event, _8(J.event));
      return this;
    };
    if ($ instanceof Promise)
      return this.lazyLoadModules.push($.then((J) => {
        if (typeof J === "function")
          return J(this);
        if (typeof J.default === "function")
          return J.default(this);
        return Y(J.default);
      }).then((J) => J.compile())), this;
    else
      return Y($);
    return this;
  }
  mount($, Y) {
    if (typeof $ === "function" || $.length === 0 || $ === "/") {
      const Z = typeof $ === "function" ? $ : Y, W = async ({ request: q, path: M }) => Z(new Request("http://a.cc" + M || "/", q));
      return this.all("/", W, { type: "none" }), this.all("/*", W, { type: "none" }), this;
    }
    const J = $.length, X = async ({ request: Z, path: W }) => Y(new Request("http://a.cc" + W.slice(J) || "/", Z));
    return this.all($, X, { type: "none" }), this.all($ + ($.endsWith("/") ? "*" : "/*"), X, { type: "none" }), this;
  }
  get($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("GET", X, Y, J);
    return this;
  }
  post($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("POST", X, Y, J);
    return this;
  }
  put($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("PUT", X, Y, J);
    return this;
  }
  patch($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("PATCH", X, Y, J);
    return this;
  }
  delete($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("DELETE", X, Y, J);
    return this;
  }
  options($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("OPTIONS", X, Y, J);
    return this;
  }
  all($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("ALL", X, Y, J);
    return this;
  }
  head($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("HEAD", X, Y, J);
    return this;
  }
  trace($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("TRACE", X, Y, J);
    return this;
  }
  connect($, Y, J) {
    if (typeof $ === "string")
      $ = [$];
    for (let X of $)
      this.add("CONNECT", X, Y, J);
    return this;
  }
  ws($, Y) {
    if (!this.wsRouter)
      throw new Error("Can't find WebSocket. Please register WebSocket plugin first by importing 'elysia/ws'");
    if (typeof $ === "string")
      $ = [$];
    for (let J of $)
      this.wsRouter.add("subscribe", J, Y), this.get(J, (X) => {
        if (this.server?.upgrade(X.request, { headers: typeof Y.upgrade === "function" ? Y.upgrade(X) : Y.upgrade, data: { ...X, id: Date.now(), headers: X.request.headers.toJSON(), message: V0(Y?.body, { models: this.meta.defs }), transformMessage: !Y.transform ? [] : Array.isArray(Y.transformMessage) ? Y.transformMessage : [Y.transformMessage] } }))
          return;
        return X.set.status = 400, "Expected a websocket connection";
      }, { beforeHandle: Y.beforeHandle, transform: Y.transform, headers: Y?.headers, params: Y?.params, query: Y?.query });
    return this;
  }
  route($, Y, J, { config: X, ...Z } = { config: { allowMeta: false } }) {
    if (typeof Y === "string")
      Y = [Y];
    for (let W of Y)
      this.add($, W, J, Z, X);
    return this;
  }
  state($, Y) {
    if (typeof $ === "object")
      return this.store = J$(this.store, $), this;
    if (!($ in this.store))
      this.store[$] = Y;
    return this;
  }
  decorate($, Y) {
    if (typeof $ === "object")
      return this.decorators = J$(this.decorators, $), this;
    if (!($ in this.decorators))
      this.decorators[$] = Y;
    return this;
  }
  derive($) {
    return $.$elysia = "derive", this.onTransform($);
  }
  schema($) {
    const Y = this.meta.defs;
    return this.$schema = { body: V0($.body, { models: Y }), headers: V0($?.headers, { models: Y, additionalProperties: true }), params: V0($?.params, { models: Y }), query: V0($?.query, { models: Y }), response: V0($?.response, { models: Y }) }, this;
  }
  compile() {
    if (this.fetch = this.config.aot ? x8(this) : k8(this), typeof this.server?.reload === "function")
      this.server.reload({ ...this.server, fetch: this.fetch });
    return this;
  }
  handle = async ($) => this.fetch($);
  fetch = ($) => (this.fetch = this.config.aot ? x8(this) : k8(this))($);
  handleError = async ($, Y, J) => (this.handleError = this.config.aot ? V8(this) : y6(this))($, Y, J);
  outerErrorHandler = ($) => new Response($.message, { status: $?.status ?? 500 });
  listen = ($, Y) => {
    if (!Bun)
      throw new Error("Bun to run");
    if (this.compile(), typeof $ === "string") {
      if ($ = +$.trim(), Number.isNaN($))
        throw new Error("Port must be a numeric value");
    }
    const J = this.fetch, X = typeof $ === "object" ? { development: !t$, ...this.config.serve, ...$, fetch: J, error: this.outerErrorHandler } : { development: !t$, ...this.config.serve, port: $, fetch: J, error: this.outerErrorHandler };
    if (typeof Bun === "undefined")
      throw new Error(".listen() is designed to run on Bun only. If you are running Elysia in other environment please use a dedicated plugin or export the handler via Elysia.fetch");
    this.server = Bun?.serve(X);
    for (let Z = 0;Z < this.event.start.length; Z++)
      this.event.start[Z](this);
    if (Y)
      Y(this.server);
    return Promise.all(this.lazyLoadModules).then(() => {
      Bun?.gc(true);
    }), this;
  };
  stop = async () => {
    if (!this.server)
      throw new Error("Elysia isn't running. Call `app.listen` to start the server.");
    this.server.stop();
    for (let $ = 0;$ < this.event.stop.length; $++)
      await this.event.stop[$](this);
  };
  get modules() {
    return Promise.all(this.lazyLoadModules);
  }
  model($, Y) {
    if (typeof $ === "object")
      Object.entries($).forEach(([J, X]) => {
        if (!(J in this.meta.defs))
          this.meta.defs[J] = X;
      });
    else
      this.meta.defs[$] = Y;
    return this;
  }
}
var export_t = W$.Type;

// src/utils/log.ts
function logInfo(message = "", service = "todo-bun-aelysia") {
  const log = `${Date.now()} ${service} ${message}\n`;
  process.stdout.write(log);
}
function logError(message = "", service = "todo-bun-aelysia") {
  const err = `${Date.now()} ${service} ${message}\n`;
  process.stderr.write(err);
}

// src/utils/getEnv.ts
function getEnv(key, defaultVal) {
  let value;
  try {
    value = process.env[key];
    if (value) {
      return value;
    }
    logInfo(`${key} MISSING using default...${defaultVal}`);
    return defaultVal;
  } catch {
    logInfo(`${key} MISSING using default...${defaultVal}`);
    return defaultVal;
  }
}

// src/db/pgdb.ts
var import_pg = __toESM(require_lib2(), 1);
async function dbConnect(timeout = 2000) {
  try {
    setTimeout(async () => {
      const client = await pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      logInfo("Connected to database...");
    }, timeout);
  } catch (e2) {
    logError(e2.message);
    process.exit(1);
  }
}
var pgOptions = {
  host: getEnv("PG_HOST", "localhost"),
  port: parseInt(getEnv("PG_PORT", "5432")),
  database: getEnv("PG_DB", "todo_db"),
  user: getEnv("PG_USER", "postgres"),
  password: getEnv("PG_PASS", "changeme"),
  max: parseInt(getEnv("PG_POOL_MAX_SIZE", "20"))
};
var pool = new import_pg.Pool(pgOptions);
var pgdb_default = pool;

// src/db/todos.ts
async function GetAllTodoLists() {
  const sql = `SELECT * FROM todo_list LIMIT 50;`;
  const { rows } = await pgdb_default.query(sql);
  return rows;
}
async function GetTodoList(id) {
  const sql = `SELECT id, title FROM todo_list WHERE id=\$1 ;`;
  const values = [id];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}
async function AddTodoList(title) {
  const sql = `INSERT INTO todo_list (title) VALUES(\$1) RETURNING id, title;`;
  const values = [title];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}
async function UpdateTodoList({ id, title }) {
  const sql = `UPDATE todo_list SET title=\$1 WHERE id=\$2 RETURNING id, title;`;
  const values = [title, id];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}
async function DeleteTodoList(id) {
  const sql = `DELETE FROM todo_list WHERE id=\$1 RETURNING id, title;`;
  const values = [id];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}
async function GetTodoItems(id) {
  const sql = `SELECT id, list_id, title, checked FROM todo_item WHERE list_id=\$1;`;
  const values = [id];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows;
  }
  return null;
}
async function AddTodoItem(todo) {
  const sql = `INSERT INTO todo_item (list_id, title, checked) VALUES(\$1,\$2,\$3) RETURNING id, list_id, title, checked;`;
  const values = [todo["list_id"], todo["title"], todo["checked"]];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}
async function UpdateTodoItem(todo) {
  const sql = `UPDATE todo_item SET
    list_id=\$1,
    title=\$2,
    checked=\$3
    WHERE id=\$4
    RETURNING id, list_id, title, checked;`;
  const values = [todo["list_id"], todo["title"], todo["checked"], todo["id"]];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}
async function GetTodoItem(id) {
  const sql = `SELECT id, list_id, title, checked FROM todo_item WHERE id=\$1 ;`;
  const values = [id];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows;
  }
  return null;
}
async function DeleteTodoItem(id) {
  const sql = `DELETE FROM todo_item WHERE id=\$1 RETURNING id, list_id, title, checked;`;
  const values = [id];
  const { rows } = await pgdb_default.query(sql, values);
  if (rows) {
    return rows[0];
  }
  return null;
}

// src/api/index.ts
var sendError = function({ set, status = 500, message }) {
  set.status = status;
  return {
    status,
    statusMessage: message
  };
};
async function getHome() {
  return {
    status: 200,
    statusMessage: "Todo Bun Elysia api server running!"
  };
}
async function getTodoLists({ set }) {
  try {
    const payload = await GetAllTodoLists();
    if (payload) {
      set.status = 200;
      set.headers["x-powered-by"] = "bun-elysia-api";
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function getTodoList({ set, params }) {
  try {
    const { id } = params;
    const payload = await GetTodoList(id);
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function postTodoList({ set, body }) {
  try {
    const title = body["title"];
    const payload = await AddTodoList(title);
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function updateTodoList({ set, body }) {
  try {
    const payload = await UpdateTodoList({
      id: body["id"],
      title: body["title"]
    });
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function deleteTodoList({ set, params }) {
  try {
    const { id } = params;
    const payload = await DeleteTodoList(id);
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function getTodoItems({ set, params }) {
  try {
    const { id } = params;
    const payload = await GetTodoItems(id);
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function addTodoItem({ set, body, params }) {
  try {
    const payload = await AddTodoItem({
      list_id: params["id"],
      title: body["title"],
      checked: body["checked"]
    });
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function getTodoItem({ set, params }) {
  try {
    const { id } = params;
    const payload = await GetTodoItem(id);
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function updateTodoItem({ set, body, params }) {
  try {
    const payload = await UpdateTodoItem({
      id: params["id"],
      list_id: body["list_id"],
      title: body["title"],
      checked: body["checked"]
    });
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}
async function deleteTodoItem({ set, params }) {
  try {
    const { id } = params;
    const payload = await DeleteTodoItem(id);
    if (payload) {
      return {
        status: 200,
        statusMessage: "OK",
        payload
      };
    }
    return sendError({
      set,
      status: 400,
      message: "Bad request"
    });
  } catch (e2) {
    return sendError({
      set,
      message: e2.message
    });
  }
}

// src/index.ts
var PORT = getEnv("API_PORT", "8080");
var app = new b1;
dbConnect();
app.get("/", getHome);
app.get("/list", getTodoLists);
app.get("/list/:id", getTodoList);
app.post("/list", postTodoList);
app.put("/list", updateTodoList);
app.delete("/list/:id", deleteTodoList);
app.get("/todos/list/:id", getTodoItems);
app.post("/todos/list/:id", addTodoItem);
app.get("/todo/:id", getTodoItem);
app.put("/todo/:id", updateTodoItem);
app.delete("/todo/:id", deleteTodoItem);
app.listen(PORT);
process.on("SIGINT", async () => {
  logInfo("Closing server on SIGINT");
  await pgdb_default.end();
  await app.stop();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  logInfo("Closing server on SIGTERM");
  await pgdb_default.end();
  await app.stop();
  process.exit(0);
});
logInfo(`${app.server?.hostname}:${app.server?.port}...started`);
