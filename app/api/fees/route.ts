import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { getUserFees } from "@/lib/airtable";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("jbv_session")?.value;
  if (!session) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }
  const verified = await verifySessionToken(session);
  if (!verified?.email) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
  }

  const fees = (await getUserFees(verified.email)) || { recordFound: false, managementFeePct: null, carryPct: null };
  if (!fees.recordFound) {
    return NextResponse.json({
      ok: true,
      fees: null,
      recordFound: false,
      message: "no_fee_record"
    });
  }
  return NextResponse.json({
    ok: true,
    recordFound: true,
    fees,
    missingMgmt: fees.managementFeePct == null,
    missingCarry: fees.carryPct == null
  });
}
