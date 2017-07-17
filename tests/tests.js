/**
 * Created by ADKosm on 17.07.17.
 */

describe("LHash basic functionality", function() {

    it("allocate any hash", function() {
        var hasher = new LHash();
        var hash = hasher.allocate('0', 'z');
        assert.isTrue( ('0' < hash) && (hash < 'z'));
        assert.isTrue( alphabet.indexOf(hash) < 10 );
    });

    it("allocate hash in small gap", function () {
        var hasher = new LHash();
        var hash = hasher.allocate('0', '2');
        assert.equal(hash, '1');

        hash = hasher.allocate('x', 'z');
        assert.equal(hash, 'y');
    });

    it("allocate, when no space on level", function () {
        var hasher = new LHash();
        var hash = hasher.allocate('0', '1');

        assert.equal(hash.length, 2);
        assert.isTrue(('0' < hash) && (hash < '1'));

        hash = hasher.allocate('y', 'z');
        assert.equal(hash.length, 2);
        assert.isTrue(('y' < hash) && (hash < 'z'));

        hash = hasher.allocate('i', 'j');
        assert.equal(hash.length, 2);
        assert.isTrue(('i' < hash) && (hash < 'j'));
    });

    it("allocate multiple hashes", function () {
        var hasher = new LHash();
        var hashes = [];
        hashes.push(hasher.allocate('0', 'z'));
        for(var i = 0; i < 100; i++) {
            hashes.push(hasher.allocate(hashes[hashes.length-1], 'z'));
        }
        for(var i = 1; i < 100; i++) {
            assert.isTrue(hashes[i-1] < hashes[i]);
        }

        hashes = [];
        hashes.push(hasher.allocate('0', 'z'));
        for(var i = 0; i < 100; i++) {
            hashes.unshift(hasher.allocate('0', hashes[0]));
        }
        for(var i = 1; i < 100; i++) {
            assert.isTrue(hashes[i-1] < hashes[i]);
        }
    });

    it("allocate any hash with id", function() {
        var hasher = new LHash({'id': 32143});
        var hash = hasher.allocate('0', 'z');
        assert.isTrue( ('0' < hash) && (hash < 'z'));
        assert.isTrue( alphabet.indexOf(hash[0]) < 10 );
        assert.equal(hash.length, 1+4);
    });

    it("allocate hash in small gap with id", function () {
        var hasher = new LHash({'id': 32143});
        var hash = hasher.allocate('0', '2');
        assert.equal(hash, '1#wd8');

        hash = hasher.allocate('x', 'z');
        assert.equal(hash, 'y#wd8');
    });

    it("allocate, when no space on level with id", function () {
        var hasher = new LHash({'id': 32143});
        var hash = hasher.allocate('0', '1');

        assert.equal(hash.length, 2+4);
        assert.isTrue(('0' < hash) && (hash < '1'));

        hash = hasher.allocate('y', 'z');
        assert.equal(hash.length, 2+4);
        assert.isTrue(('y' < hash) && (hash < 'z'));

        hash = hasher.allocate('i', 'j');
        assert.equal(hash.length, 2+4);
        assert.isTrue(('i' < hash) && (hash < 'j'));
    });

    it("allocate multiple hashes with id", function () {
        var hasher = new LHash({'id': 32143});
        var hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 100; i++) {
            hashes.push(hasher.allocate(hashes[hashes.length-1], 'z'));
        }
        for(var i = 1; i < 100; i++) {
            assert.isTrue(hashes[i-1] < hashes[i]);
        }

        hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 100; i++) {
            hashes.unshift(hasher.allocate('0', hashes[0]));
        }
        for(var i = 1; i < 100; i++) {
            assert.isTrue(hashes[i-1] < hashes[i]);
        }
    });

});

describe("LHash benchmark", function() {
    it("mean length while right pushing", function () {
        var hasher = new LHash();
        var hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 100; i++) {
            hashes.push(hasher.allocate(hashes[hashes.length-1], 'z'));
        }

        var mean = 0;
        for(var i = 0; i < 100; i++) {
            mean += hashes[i].length;
        }
        mean /= 100;

        assert.isTrue(mean < 4.5);

        var hasher = new LHash();
        var hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 1000; i++) {
            hashes.push(hasher.allocate(hashes[hashes.length-1], 'z'));
        }

        var mean = 0;
        for(var i = 0; i < 1000; i++) {
            mean += hashes[i].length;
        }
        mean /= 1000;

        assert.isTrue(mean < 40);
    });

    it("mean lenght while left pushing", function () {
        var hasher = new LHash();
        var hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 100; i++) {
            hashes.unshift(hasher.allocate('0', hashes[0]));
        }

        var mean = 0;
        for(var i = 0; i < 100; i++) {
            mean += hashes[i].length;
        }
        mean /= 100;

        assert.isTrue(mean < 5.5); // more, cause first level is more appropriate for right pushing

        var hasher = new LHash();
        var hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 1000; i++) {
            hashes.unshift(hasher.allocate('0', hashes[0]));
        }

        var mean = 0;
        for(var i = 0; i < 1000; i++) {
            mean += hashes[i].length;
        }
        mean /= 1000;

        assert.isTrue(mean < 45);
    });


    it('mean lenght while uniform pushing', function () {
        var hasher = new LHash();
        var hashes = [hasher.allocate('0', 'z')];
        for(var i = 0; i < 9; i++) {
            hashes.unshift(hasher.allocate('0', hashes[0]));
        }

        for(var j = 0; j < 10; j++) {
            var len = hashes.length
            for(var i = 1; i < len; i++) {
                hashes.push(hasher.allocate(hashes[i-1], hashes[i]));
            }
            hashes.sort();
        }

        var mean = 0;
        for(var i = 0; i < hashes.length; i++) {
            mean += hashes[i].length;
        }
        mean /= hashes.length;

        assert.isTrue(mean < 5.5);
    });
});