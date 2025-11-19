import { Suspense } from "react";
import TrackOrderPage from "./TrackHelper";


export default function TrackOrder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderPage />
    </Suspense>
  );
}