"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { MetricIcon } from "./chart";

const COLOR_TOTAL = "#010003ab";
const COLOR_APPROVED = "#b0271ad5";
const COLOR_PROFIT = "#067ea9dd";

const chartConfig = {
  total: { label: "Total geral", color: COLOR_TOTAL },
  approved: { label: "Vendas", color: COLOR_APPROVED },
  profit: { label: "Lucro bruto", color: COLOR_PROFIT },
} satisfies ChartConfig;

export const ChartAreaInteractive = ({
  data,
}: {
  data: {
    date: string;
    total: number;
    approved: number;
    profit: number;
  }[];
}) => {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const maxValue = Math.max(...data.map((item) => item.total));
  const minValue = Math.min(...data.map((item) => item.total));

  return (
    <Card className={cn("rounded-default border-b-light bg-white")}>
      <CardHeader className="border-b-light flex items-center justify-between gap-6 border-b px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-1">
          <CardTitle>Movimentações ao longo dos dias</CardTitle>
          <CardDescription>
            Resumo dos pedidos, faturamento e lucro
          </CardDescription>
        </div>
        <MetricIcon name="bar_chart_4_bars" />
      </CardHeader>
      <CardContent className="px-4 py-4 pl-3 lg:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[13rem] w-full lg:h-[20rem]"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_TOTAL} stopOpacity={0.6} />
                <stop offset="95%" stopColor={COLOR_TOTAL} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillapproved" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={COLOR_APPROVED}
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor={COLOR_APPROVED}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_PROFIT} stopOpacity={0.6} />
                <stop
                  offset="95%"
                  stopColor={COLOR_PROFIT}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <ReferenceLine
              y={maxValue}
              opacity={0.75}
              stroke="var(--color-b-light)"
              strokeWidth={1}
            />
            <ReferenceLine
              y={maxValue / 2}
              opacity={0.75}
              stroke="var(--color-b-light)"
              strokeWidth={1}
            />
            <ReferenceLine
              y={minValue}
              opacity={0.75}
              stroke="var(--color-b-light)"
              strokeWidth={1}
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />

            {isLargeScreen && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
              />
            )}

            <ChartTooltip
              cursor={{
                stroke: "#aaa",
                strokeWidth: 0.25,
                strokeDasharray: "3 3",
              }}
              content={
                <ChartTooltipContent
                  className="min-w-40 p-1.5 lg:p-2.5"
                  labelFormatter={(value) =>
                    new Date(
                      new Date(value + "T00:00:00Z").getTime() +
                        24 * 60 * 60 * 1000,
                    ).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                  indicator="dot"
                >
                  {data.map((item) => (
                    <div key={item.date} style={{ color: COLOR_TOTAL }}>
                      Total: {new Intl.NumberFormat("pt-BR").format(item.total)}
                    </div>
                  ))}
                </ChartTooltipContent>
              }
            />

            <Area
              dataKey="total"
              type="linear"
              fill="url(#fillTotal)"
              stroke={COLOR_TOTAL}
              strokeWidth={1}
            />
            <Area
              dataKey="approved"
              type="linear"
              fill="url(#fillapproved)"
              stroke={COLOR_APPROVED}
              strokeWidth={1}
            />
            <Area
              dataKey="profit"
              type="linear"
              fill="url(#fillProfit)"
              stroke={COLOR_PROFIT}
              strokeWidth={1}
            />
            <ChartLegend
              className="mt-2 gap-6 pt-3"
              content={<ChartLegendContent />}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
