// factor-analysis-output.ts
import {FactorFinalResultType} from "@/components/Modals/Analyze/dimension-reduction/factor/types/factor-worker";
import {Table} from "@/types/Table";
import {useResultStore} from "@/stores/useResultStore";

export async function resultFactorAnalysis({
    formattedResult,
}: FactorFinalResultType) {
    try {
        const { addLog, addAnalytic, addStatistic } = useResultStore.getState();

        const factorAnalysisResult = async () => {
            /*
             * 🎉 Title Result 🎉
             * */
            const titleMessage = "Factor Analysis";
            const logId = await addLog({ log: titleMessage });
            const analyticId = await addAnalytic(logId, {
                title: `Factor Analysis Result`,
                note: "",
            });

            /*
             * Process tables in order as provided by formatter
             * */
            for (const table of formattedResult.tables) {
                let title = table.title || "Unknown";
                const tableJson = JSON.stringify({ tables: [table] });

                const tableId = await addAnalytic(logId, {
                    title: title,
                    note: "",
                });

                await addStatistic(tableId, {
                    title: title,
                    description: title,
                    output_data: tableJson,
                    components: title,
                });
            }

            /*
             * Process charts if available
             * */
            if (formattedResult.charts && formattedResult.charts.length > 0) {
                for (const chart of formattedResult.charts) {
                    const chartTitle = chart.chartMetadata?.title || "Chart";
                    const chartJson = JSON.stringify({ charts: [chart] });

                    const chartId = await addAnalytic(logId, {
                        title: chartTitle,
                        note: "",
                    });

                    await addStatistic(chartId, {
                        title: chartTitle,
                        description: chart.chartMetadata?.description || chartTitle,
                        output_data: chartJson,
                        components: chartTitle,
                    });
                }
            }
        };

        await factorAnalysisResult();
    } catch (e) {
        console.error(e);
    }
}
