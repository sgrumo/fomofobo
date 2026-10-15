"use client"

import { ComponentsSamples } from "components-samples"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

type DevSamplesViewProps = RouteClientComponentProps<"devSamples">

export const DevSamplesView = (_props: DevSamplesViewProps) => <ComponentsSamples />
