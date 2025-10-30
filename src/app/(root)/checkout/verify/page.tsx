import { Suspense } from "react";
import PaymentVerificationPageHelper from "./VerifyHelper";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentVerificationPageHelper />
    </Suspense>
  )
}