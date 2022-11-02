import { ChartConfig } from "@/components/TimeSeriesComponent/lib/ChartConfig";

export enum DisplayType {
  TimeSeriesComponent = 'TimeSeriesComponent'
}

export interface DisplayConfig {
  id: string;
  type: DisplayType;
  title: string;
  class: string;
  config: Partial<ChartConfig>;
}


