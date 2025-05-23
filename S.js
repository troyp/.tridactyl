var S = {
    maybeAppend: function(s, suffix) {
        return String(s).endsWith(suffix) ? s : s+suffix;
    },
    maybePrepend: function(s, prefix) {
        return String(s).startsWith(prefix) ? s : prefix+s;
    },

    // padEnd, padStart: adapted from github.com/uxitten/polyfill
    padEnd: function (s, targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (s.length > targetLength) {
            return s;
        } else {
            targetLength = targetLength - s.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return s + padString.slice(0, targetLength);
        }
    },
    padStart: function (s, targetLength, padString) {
        s = String(s);
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (s.length > targetLength) {
            return s;
        }
        else {
            targetLength = targetLength - s.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
                //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + s;
        }
    },
    repeat: function (s, n) { return Array(n).fill(s).join(""); },
    hasUpperCase: function(s) {
        for (const c of s) if (c >= "A" && c <= "Z") return true;
        return false;
    },

    isLowerCase: function(s) {
        return s.toLowerCase()===s;
    },
    isUpperCase: function(s) {
        return s.toUpperCase()===s;
    },
    isMixedCase: function(s) {
        return !(this.isLowerCase(s) || this.isUpperCase(s));
    },
    matchSmartCase: function(s, s2) {
        let s2adj = this.isLowerCase(s) ? s2.toLowerCase() : s2;
        return s2adj.match(s);
    },
    matchSC: (s, s2) => {
        if (Array.isArray(s)) { s = s.join(" ").trim(); }
        return S.matchSmartCase(s, s2);
    },
    capitalize: function(s) {
        return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    },
    capitalizeInitial: function(s) {
        return s[0].toUpperCase() + s.slice(1);
    },
    splitFirst: function(s, patt) {
        const k = s.search(patt);
        return k == -1
            ? [s, ""]
            : [s.slice(0, k), s.slice(k)];
    },
    trim: function (s) {
        return s.replace(/^\s+|\s+$/g, "");
    },
    strip: s=>S.trim(s),
    toBool: function(s) {
        s = s.toLowerCase().trim();
        if (["false", "no"].includes(s)) return false;
        else return Boolean(s);
    },
    toLines: function (s, n=160, sep=/([^, ]+[, ]+)/) {
        var lines = s.split("\n");
        var lines_ = [];
        for (let line of lines) {
            var parts = line.split(sep);
            var line_ = "";
            var line_length = 0;
            for (let part of parts) {
                if (line_length + part.length > n) {
                    lines_.push(line_);
                    line_ = part; line_length = part.length;
                } else {
                    line_ += part;
                    line_length += part.length;
                }
            }
            lines_.push(line_);
        }
        return lines_;
    },
    toSmartCase: function (s) {
        return (s.toLowerCase()===s) ? this.toStartCase(s) : s;
    },
    toStartCase: function (s) {
        var words = s.split(/\s+/);
        return A.map(words, w=>this.capitalize(w)).join(" ");
    },
    toLength: function (s, n, pad=" ") {
        n = parseInt(n);
        if (s.length > n) return s.slice(0,n);
        else return this.padEnd(s, n, pad);
    },
    toStringOrRegex: function(s) {
        /* toStringOrRegex: converts a string to a regex if possible, else returns */
        /*     the string. Can be used to accept either a string or regex argument */
        /*     for a command:     `js doSomething(args.map(readStringOrRegex))`    */
        const matches = s.match(/^\/([^/]*)\/([gimuy]*)$/);
        return matches ? RegExp(matches[1], matches[2]) : s;
    },

    titleCaseExceptionWords: ["a", "an", "the", "and", "or", "but", "nor",
                              "yet", "so", "for", "in", "to", "of", "at",
                              "by", "for", "off", "on", "as", "x"],
    toTitleCase: function (s, opts={}) {
        /* opts.exceptionWords:       custom list of uncapitalized words
         * opts.forceInitialCapital:  First letter of string is capitalized even if an exception word
         */
        opts.exceptionWords ||= this.titleCaseExceptionWords;
        const words = s.split(/\s+/);
        var tcWords = words.map(w => opts.exceptionWords.includes(w) ? w : this.capitalize(w));
        /*  If first word is capitalized, leave it capitalized even if an exception word  */
        const initialLetter = s.slice(0, 1);
        const hasInitialCap = this.isUpperCase(initialLetter);
        if (hasInitialCap||opts.forceInitialCapital)
            tcWords[0] = this.capitalize(words[0]);
        return tcWords.join(" ");
    },
    isAlphaAt: function (s, i) {
        ord = s.charCodeAt(i);
        return (ord.inRange(97, 123));
    },
    ellipsize: function (s, n, ellipsis="…") {
        const ellipsisLn = ellipsis.length;
        if (s.length > n)
            return s.slice(0, n-ellipsisLn)+ellipsis;
        else
            return s;
    },
    firstLineEllipsis: function (s) {
        var s = String(s);
        var lines = s.split("\n").filter(s=>s.match(/\S/));
        if (lines.length > 1)
            return lines[0] + "...";
        else return lines[0];
    },
    arrayWithEmptyStringDefault: function(a) {
        var arr = Array.from(a);
        return arr.map(elem => typeof elem == "undefined" ? "" : String(elem));
    },
    escapeRegexSymbols: function (s, opts={}) {
        if (typeof opts == "boolean") opts = {slashDelim: opts};
        var regexSpecialCharRegex;
        if (opts.slashDelim) {
            regexSpecialCharRegex = /[[(){^$\\*+?.|\/]/g;
            return "/" + s.replace(regexSpecialCharRegex, c=>"\\"+c) + "/";
        } else {
            regexSpecialCharRegex = /[[(){^$\\*+?.|]/g;
            return s.replace(regexSpecialCharRegex, c=>"\\"+c);
        }
    },
    escRegex: (...args)=>S.escapeRegexSymbols(...args),
    /* can be used to check multiple regexes, eg. S.getRegexMatch(re1)||S.getRegexMatch(re2) */
    getRegexMatch: function (s, regex, group_num=1) {
        var match = s.match(regex);
        return match && match[group_num] || "";
    }
};

window.S = S;
