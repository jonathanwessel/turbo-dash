// 🏦 Piqua National Bank math: 7% a real day, paid on coins that stayed all day, up to the rank's limit.
//   node scripts/test-bank.mjs   (part of npm test)
import { bankSettle, bankDeposit, bankWithdraw, bankMax, bankPayOn, BANK_DAY } from "../src/data.js";

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };
const H = 60 * 60 * 1000, T0 = Date.UTC(2026, 10, 8, 9);
const fresh = () => ({ bal: 0, low: 0, t: 0, paid: 0, news: 0 });

{ // put in 100, get 107 back a day later
  const b = fresh(); bankSettle(b, 5, T0); bankDeposit(b, 100, T0);
  check(bankSettle(b, 5, T0 + 23 * H) === 0 && b.bal === 100, "paid before a full day");
  check(bankSettle(b, 5, T0 + 24 * H) === 7 && b.bal === 107, `100 should become 107 after a day (got ${b.bal})`);
  check(bankSettle(b, 5, T0 + 47 * H) === 0, "paid twice in one day");
  check(bankSettle(b, 5, T0 + 48 * H) === 7 && b.bal === 114, `day 2 should pay 7% of 107 (got ${b.bal})`);
}
{ // coins put in just before payday wait for the next full day
  const b = fresh(); bankDeposit(b, 100, T0); bankDeposit(b, 1000, T0 + 23 * H);
  check(bankSettle(b, 20, T0 + 24 * H) === 7, "a deposit made an hour before payday earned for the whole day");
  check(bankSettle(b, 20, T0 + 48 * H) === Math.round(1107 * 0.07), "the later deposit didn't start earning the next day");
}
{ // two quick taps (100, then 500 a few minutes later) both earn on day one
  const b = fresh(); bankDeposit(b, 100, T0); bankDeposit(b, 500, T0 + 10 * 60 * 1000);
  check(bankSettle(b, 20, T0 + 24 * H) === 42, "a deposit right after the first one should earn the same day");
}
{ // taking coins out lowers what earns today
  const b = fresh(); bankDeposit(b, 1000, T0); bankWithdraw(b, 900); bankDeposit(b, 900, T0 + 2 * H);
  check(bankSettle(b, 20, T0 + 24 * H) === 7, "take out and put back in still earned on the full amount");
  const all = b.bal; check(bankWithdraw(b, 99999) === all, "asking for more than the balance should give back exactly the balance");
  check(b.bal === 0 && b.low === 0, "the bank should be empty after taking it all");
}
{ // the limit grows with rank, and interest is only paid on coins up to it
  check(bankMax(1) === 400 && bankMax(5) === 2000 && bankMax(10) > bankMax(9), "the limit should grow every rank");
  const b = fresh(); bankDeposit(b, 2000, T0); b.bal = 5000; b.low = 5000;   // over the limit (e.g. after interest)
  check(bankPayOn(b, 5) === 140, `interest should stop at the Rank 5 limit (got ${bankPayOn(b, 5)})`);
}
{ // a week away pays every day, compounding; a clock that goes backwards pays nothing
  const b = fresh(); bankDeposit(b, 1000, T0);
  const paid = bankSettle(b, 10, T0 + 7 * BANK_DAY + H); let want = 1000; for (let i = 0; i < 7; i++) want += Math.round(want * 0.07);
  check(b.bal === want && paid === want - 1000, `a week away should compound to ${want} (got ${b.bal})`);
  check(b.t === T0 + 7 * BANK_DAY, "the next payday should stay on the same time of day");
  const before = b.bal; check(bankSettle(b, 10, T0 - 5 * BANK_DAY) === 0 && b.bal === before, "a clock set backwards paid out");
  check(bankSettle(b, 10, T0 - 5 * BANK_DAY + 23 * H) === 0, "paid early after the clock went backwards");
}
{ // bad numbers never break it
  const b = fresh(); bankDeposit(b, -50, T0); bankDeposit(b, NaN, T0); check(b.bal === 0, "a negative or broken deposit changed the bank");
  check(bankWithdraw(b, 10) === 0 && b.bal === 0, "took coins out of an empty bank");
}
console.log(fails ? `\n✖ ${fails} of ${checks} bank checks failed` : `All ${checks} bank checks passed`);
process.exit(fails ? 1 : 0);
