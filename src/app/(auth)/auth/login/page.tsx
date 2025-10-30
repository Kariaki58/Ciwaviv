import LoginPageHelper from "./LoginHelper"
import { Suspense } from "react"


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageHelper />
    </Suspense>
  )
}