# LHash

LHash is algorithm, which provides convenient identificators for items of
 ordered collection with an emphasis on efficiency while reordering
 items in collection.

With a naive approach with numerical ids, when you change position of one
element in collection, you need to change ids of O(n) elements in collection
(exactly of all elements in worst case).

Using linked list or real numbers can reduce the degree of tragedy, but
is also a workarounds, because at some moment you reach the limit
of the accuracy of real numbers and you still have to update many items.

LHash is a simple string. Main algorithm is a function 'allocate', which
take two hashes and return new hash with a property, that this hash will be
between original hashes in simple lexicographical order. It means, that
 if you want to change position of element, you need only to change id of
 current element to new hash from allocate function. Idea of algorithm
bases on CRDT data structure [LSeq](https://hal.archives-ouvertes.fr/hal-00921633/document).
According to this document, length growth of hash is sublinear with
 respect to the total number of elements in the collection.

# Using library

Include js file into project:

```<script src="/path/to/LHash.js"></script>```

Create hasher object:

```
var hasher = LHash({
    'boundary': 5, // optional - size of allocation boundary
    'id': 43 // optional - user id. if set, then activate anticollision mechanism based on id
});
```

You always have at least two elements with hashes - abstract element 'begin' with id = '0' and 'end' with id = 'z'.

You can use it in order to insert elements on the first and on the last position.

For example:
```
var firstElem = hasher.allocate('0', 'z'); // Insert element somewhere
var secondElem = hasher.allocate('0', firstElem); // Insert element before first element
var thirdElem = hasher.allocate(firstElem, 'z'); // Insert element after first element
```

You can insert element between any neighboring elements.

```
var elementA = hasher.allocate(firstElem, thirdElem); // Insert element between first ans third element

var elementB = hasher.allocate(secondElem, thirdElem); // WRONG! second and thord elements are now neighbours because of first element between them

var elementC = haser.allocate(firstElem, secondElem); // WRONG! order in arguments is important! Second element must go before first
```

# Tests

To run tests, open tests/tests.html in browser.

According to tests, mean lenght of id for 100 elements is about 4, for
1000 - about 37 while pushing only to end. This is similar to the
theoretical result of the sublinear growth rate.

Uniform pushing also shows very good results - mean is equal to about 6
with almost 10000 elements.