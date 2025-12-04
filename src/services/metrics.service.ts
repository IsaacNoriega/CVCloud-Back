import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatchClient = new CloudWatchClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

export class MetricsService {
    private namespace = 'CVCloud/Backend';
    private environment = process.env.NODE_ENV || 'production';
    private enabled = true; // Cambiar a false para desactivar temporalmente

    async registrarMetricaHTTP(metodo: string, ruta: string, statusCode: number) {
        if (!this.enabled) return;
        
        const rangoStatus = this.obtenerRangoStatus(statusCode);

        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'HTTPRequests',
                        Value: 1,
                        Unit: 'Count',
                        Dimensions: [
                            { Name: 'Method', Value: metodo },
                            { Name: 'Route', Value: ruta },
                            { Name: 'StatusRange', Value: rangoStatus },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));
            
            console.log(`[METRICS] HTTPRequest: ${metodo} ${ruta} - ${statusCode}`);
        } catch (error) {
            console.error('[METRICS] Error al registrar métrica HTTP:', error);
        }
    }

    async registrarTiempoEjecucion(ruta: string, duracionMs: number, metodo: string) {
        if (!this.enabled) return;
        
        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'ResponseTime',
                        Value: duracionMs,
                        Unit: 'Milliseconds',
                        Dimensions: [
                            { Name: 'Route', Value: ruta },
                            { Name: 'Method', Value: metodo },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));
            
            console.log(`[METRICS] ResponseTime: ${ruta} - ${duracionMs}ms`);
        } catch (error) {
            console.error('[METRICS] Error al registrar tiempo:', error);
        }
    }

    async registrarError(ruta: string, errorType: string, metodo: string) {
        if (!this.enabled) return;
        
        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'Errors',
                        Value: 1,
                        Unit: 'Count',
                        Dimensions: [
                            { Name: 'Route', Value: ruta },
                            { Name: 'Method', Value: metodo },
                            { Name: 'ErrorType', Value: errorType },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));
            
            console.log(`[METRICS] Error: ${errorType} en ${ruta}`);
        } catch (error) {
            console.error('[METRICS] Error al registrar error:', error);
        }
    }

    private obtenerRangoStatus(statusCode: number): string {
        if (statusCode >= 200 && statusCode < 300) return '2xx';
        if (statusCode >= 300 && statusCode < 400) return '3xx';
        if (statusCode >= 400 && statusCode < 500) return '4xx';
        if (statusCode >= 500) return '5xx';
        return 'other';
    }
}

export const metricsService = new MetricsService();