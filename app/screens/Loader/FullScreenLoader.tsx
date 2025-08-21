import React from "react"
import { Screen } from "app/components/Screen"

const FullScreenLoader = () => {
  return <Screen preset="fixed" backgroundColor="rgb(254, 244, 227)" safeAreaEdges={["top"]} />
}

export default FullScreenLoader
