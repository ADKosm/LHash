/**
 * Created by ADKosm on 16.07.17.
 */

alphabet = [
    '0','1','2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f','g','h','i','j','k','l',
    'm','n','o','p','q','r','s','t','u','v','w','x','y','z',
    'A','B','C','D','E','F','G','I','J','K','L','M','N','O',
    'P','Q','R','S','T','U','V','W','X','Y','Z'
];
alphabet.sort();
alphabetSize = alphabet.length;
spliter = '#';

/**
 * Subsidiary data structure for lhash. Don't use it by yourself
 * @param hash {string}
 * @constructor
 */
LKey = function (hash) {
    this.str = hash;

    var self = this;

    this.at = function(index) {
        return index >= self.str.length ? alphabet[0] : self.str[index];
    }
};

/**
 * Module for calculating LHash of ordered collection items.
 * @param options - map of options, described below
 *
 * @param boundary {number} optional - size of boundary. Equals to 5 by default
 * @param id {number} optional - user id. if set, then activate anticollision mechanism based on id
 * @constructor
 */
LHash = function (options) {
    if(options){
        var boundary = options.boundary;
        var id = options.id;

        this.boundary = boundary | 5;
        if(id) {
            this.id = spliter;
            while(id > 0) {
                this.id += alphabet[ id % alphabetSize ];
                id = Math.floor(id / alphabetSize);
            }
        } else {
            this.id = "";
        }
    } else {
        this.boundary = 5;
        this.id = "";
    }


    var self = this;

    /**
     * Type of strategy on current depth
     * @param depth in the tree
     * @returns {number} => 1 = boundary+, -1 = boundary-
     * @private
     */
    this._strategy = function (depth) {
        return depth % 2 === 0 ? 1 : -1;
    };

    /**
     * Maximal right position on that depth relates to key
     * @param key {LKey}
     * @param depth
     * @returns {LKey}
     * @private
     */
    this._rightBorder = function (key, depth) {
        var border = "";
        for(var i = 0; i < depth; i++) border += key.at(i);
        border += alphabet[alphabetSize-1];
        return new LKey(border);
    };

    /**
     * Maximal left position on that depth relates to key
     * @param key {LKey}
     * @param depth
     * @returns {LKey}
     * @private
     */
    this._leftBorder = function (key, depth) {
        var border = "";
        for(var i = 0; i < depth; i++) border += key.at(i);
        border += alphabet[0];
        return new LKey(border);
    };

    /**
     * Find free space between two hashes
     * @param p {LKey} - left hash covered in LKey
     * @param q {LKey} - right hash covered in LKey
     * @private
     */
    this._findFreeSpace = function(p, q){
        var variantsQueue = [];
        variantsQueue.push({'depth': 0, 'left': p, 'right': q});
        for(;;) {
            var left, right, depth;
            var current = variantsQueue.shift();
            left = current.left;
            right = current.right;
            depth = current.depth;

            if(right.at(depth) === left.at(depth)) { // The same tree branch
                variantsQueue.push({'depth': depth + 1, 'left': left, 'right': right}) // need to go deeper
            } else if(alphabet.indexOf(right.at(depth)) - alphabet.indexOf(left.at(depth)) > 1) {
                return {'depth': depth, 'left': left, 'right': right}; // find space
            } else { // distance is equal to 1. Need to split tree and search for a level below
                variantsQueue.push({'depth': depth+1, 'left': left, 'right': self._rightBorder(left, depth+1)});
            }
        }
    };

    /**
     * Allocate new hash between p and q
     * Distance between p and q must be 1
     * @param p - left hash
     * @param q - right hash
     */
    this.allocate = function (p, q) {
        var left, right, depth;
        var freeSpace = self._findFreeSpace(new LKey(p), new LKey(q));

        left = freeSpace.left;
        right = freeSpace.right;
        depth = freeSpace.depth;

        var generator = function() {
            return 1 + Math.floor(
                    Math.random() * (Math.min(
                        self.boundary,
                        Math.abs(alphabet.indexOf(left.at(depth))-alphabet.indexOf(right.at(depth)))
                    ) - 1)
                );
        };

        var newHash = "";

        if(self._strategy(depth) === 1) {
            for(var i = 0; i < depth; i++) newHash += left.at(i);
            newHash += alphabet[alphabet.indexOf(left.at(depth)) + generator()];
        } else {
            for(var i = 0; i < depth; i++) newHash += right.at(i);
            newHash += alphabet[alphabet.indexOf(right.at(depth)) - generator()];
        }

        return newHash + self.id;
    };
};
