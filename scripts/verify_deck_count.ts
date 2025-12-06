
import { DECK } from '../constants';

console.log(`Total cards in DECK: ${DECK.length}`);

const majors = DECK.filter(c => c.arcana === 'Major');
const minors = DECK.filter(c => c.arcana === 'Minor');

console.log(`Majors: ${majors.length}`);
console.log(`Minors: ${minors.length}`);

if (DECK.length === 78 && majors.length === 22 && minors.length === 56) {
    console.log("VERIFICATION SUCCESS: Deck is complete.");
    process.exit(0);
} else {
    console.error("VERIFICATION FAILED: Counts do not match.");
    process.exit(1);
}
