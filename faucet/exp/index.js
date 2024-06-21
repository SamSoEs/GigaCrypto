
function bufferToNibbles(key) {
    const bkey = Buffer.from(key);
    const nibbles = [];
    for (let i = 0; i < bkey.length; i++) {
        let q = i * 2;
        nibbles[q] = bkey[i] >> 4;
        ++q;
        nibbles[q] = bkey[i] % 16;
    }
    return nibbles;
  }

  class Node{
    constructor(){
        this.children = {};
        this.endOfWorld = false;
        this.value = null;
    }
    insert(value){
        this.value = value
    }
  }

class Trie{
    constructor(){
        this.root = new Node();
    }
    put(key, value){
        let nibbles = bufferToNibbles(key);
        let current = this.root;
        let node = current;
        let nibble = null;
        for(let i=0; i < nibbles.length; i++){
            nibble = nibbles[i];
            node = current.children[nibble]
            if(!node){
                node = new Node();
                current.children[nibble] = node
            }
            current = node;
        }
        current.endOfWorld = true;
        current.insert(value);
    }
    search(key){
        let nibbles = bufferToNibbles(key);
        let current = this.root;
        let nibble = null
        for(let i = 0; i < nibbles.length; i++){
            nibble = nibbles[i];
            if(current.children[nibble] == null)
                return false;
            current = current.children[nibble];
        }
        return current

    }
}

const trie = new Trie();
trie.put(Buffer.from("1234ff"), Buffer.from("20"))
trie.put(Buffer.from("aaaaaa"), Buffer.from("30"));

const node1 = trie.search("1234ff").value;
const node2 = trie.search("aaaaaa").value;

console.log(node1.toString("ascii"));
console.log(node2.toString("ascii"));

