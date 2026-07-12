import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const target = resolve(root, "tests/fixtures/offers-1000.csv");
const platforms = [
  ["MAKEMYTRIP", "MakeMyTrip"], ["CLEARTRIP", "Cleartrip"],
  ["GOIBIBO", "Goibibo"], ["EASEMYTRIP", "EaseMyTrip"],
  ["YATRA", "Yatra"], ["IXIGO", "Ixigo"],
];
const banks = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "RBL", "HSBC", "YES"];
const header = "offer_id,platform_id,platform_name,offer_title,bank_id,bank_name,card_name,payment_method,category,booking_channel,discount_type,discount_value,max_discount,min_transaction,coupon_code,valid_from,valid_to,usage_limit,new_user_only,login_required,eligibility_notes,terms_url,source_url,booking_url,source_type,evidence_status,last_verified_at,priority_score,is_active,publish_status";
const rows = Array.from({ length: 1000 }, (_, index) => {
  const number = index + 1;
  const [platformId, platformName] = platforms[index % platforms.length];
  const noCard = index % 10 === 0;
  const bank = noCard ? "" : banks[index % banks.length];
  const payment = noCard ? "NO_CARD" : index % 3 === 0 ? "DEBIT" : "CREDIT";
  const discountType = index % 4 === 0 ? "FLAT" : "PERCENT";
  const discountValue = discountType === "FLAT" ? 400 + (index % 12) * 100 : 5 + (index % 16);
  const maxDiscount = discountType === "FLAT" ? discountValue : 500 + (index % 20) * 100;
  return [
    `STRESS-${String(number).padStart(4, "0")}`, platformId, platformName,
    `${platformName} test offer ${number}`, bank, bank ? `${bank} Bank` : "",
    bank ? `${bank} Test Card` : "", payment, "FLIGHT_DOMESTIC",
    index % 2 ? "WEB_AND_APP" : "APP", discountType, discountValue, maxDiscount,
    2000 + (index % 20) * 250, `TEST${number}`, "2026-07-01", "2027-12-31",
    "Once per user", index % 7 === 0, false, "Stress fixture only",
    "https://example.com/terms", "https://example.com/source", "https://example.com/book",
    "test_fixture", "VERIFIED", "2026-07-11", index % 101, true, "READY",
  ].join(",");
});
await mkdir(resolve(root, "tests/fixtures"), { recursive: true });
await writeFile(target, `${header}\n${rows.join("\n")}\n`);
console.log(`Generated ${rows.length} offers at ${target}`);
