S = {
    // padEnd, padStart: adapted from github.com/uxitten/polyfill
    padEnd: function (s, targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (s.length > targetLength) {
            return String(s);
        } else {
            targetLength = targetLength - s.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return String(s) + padString.slice(0, targetLength);
        }
    },
    padStart: function (s, targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (s.length > targetLength) {
            return String(s);
        }
        else {
            targetLength = targetLength - s.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
                //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(s);
        }
    },
    repeat: function (s, n) { return Array(n).fill(s).join(""); },
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
    capitalize: function(s) {
        return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    },
    capitalizeInitial: function(s) {
        return s[0].toUpperCase() + s.slice(1);
    },
    strip: function (s) {
        return s.replace(/^\s+|\s+$/g, "");
    },
    toLines: function (s, n=160, sep=/([^, ]+[, ]+)/) {
        var lines = s.split("\n");
        var lines_ = [];
        for (var line of lines) {
            var parts = line.split(sep);
            var line_ = "";
            var line_length = 0;
            for (var part of parts) {
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
        var regexSpecialCharRegex;
        if (opts.forwardSlashDelimiters) {
            regexSpecialCharRegex = /[[(){^$\\*+?.|\/]/g;
            return "/" + s.replace(regexSpecialCharRegex, c=>"\\"+c) + "/";
        } else {
            regexSpecialCharRegex = /[[(){^$\\*+?.|]/g;
            return s.replace(regexSpecialCharRegex, c=>"\\"+c);
        }
    },
    /* can be used to check multiple regexes, eg. S.getRegexMatch(re1)||S.getRegexMatch(re2) */
    getRegexMatch: function (s, regex, group_num=1) {
        var match = s.match(regex);
        return match && match[group_num] || "";
    }
}
