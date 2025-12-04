const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

const cloudwatchClient = new CloudWatchClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

class MetricsServiceLambda {
    constructor() {
        this.namespace = 'CVCloud/Lambda';
        this.environment = process.env.NODE_ENV || 'production';
    }

    async registrarMetricaPDF(duracionMs, statusCode, templateId) {
        const rangoStatus = this.obtenerRangoStatus(statusCode);

        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'PDFGeneration',
                        Value: 1,
                        Unit: 'Count',
                        Dimensions: [
                            { Name: 'TemplateId', Value: templateId || 'unknown' },
                            { Name: 'StatusRange', Value: rangoStatus },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));

            console.log(`[METRICS] PDFGeneration registrada: ${templateId} - ${rangoStatus}`);
        } catch (error) {
            console.error('[METRICS] Error al enviar PDFGeneration:', error);
        }
    }

    async registrarTiempoEjecucionLambda(duracionMs, templateId) {
        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'ExecutionTime',
                        Value: duracionMs,
                        Unit: 'Milliseconds',
                        Dimensions: [
                            { Name: 'TemplateId', Value: templateId || 'unknown' },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));

            console.log(`[METRICS] ExecutionTime registrada: ${duracionMs}ms`);
        } catch (error) {
            console.error('[METRICS] Error al enviar ExecutionTime:', error);
        }
    }

    async registrarTamañoPDF(tamanoBytes, templateId) {
        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'PDFSize',
                        Value: tamanoBytes,
                        Unit: 'Bytes',
                        Dimensions: [
                            { Name: 'TemplateId', Value: templateId || 'unknown' },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));

            console.log(`[METRICS] PDFSize registrada: ${tamanoBytes} bytes`);
        } catch (error) {
            console.error('[METRICS] Error al enviar PDFSize:', error);
        }
    }

    async registrarErrorLambda(templateId, errorMessage) {
        try {
            await cloudwatchClient.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [
                    {
                        MetricName: 'LambdaErrors',
                        Value: 1,
                        Unit: 'Count',
                        Dimensions: [
                            { Name: 'TemplateId', Value: templateId || 'unknown' },
                            { Name: 'ErrorType', Value: errorMessage.substring(0, 50) },
                            { Name: 'Environment', Value: this.environment }
                        ],
                        Timestamp: new Date()
                    }
                ]
            }));

            console.log(`[METRICS] Error registrado en Lambda`);
        } catch (error) {
            console.error('[METRICS] Error al enviar métrica de error:', error);
        }
    }

    obtenerRangoStatus(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return '2xx';
        if (statusCode >= 300 && statusCode < 400) return '3xx';
        if (statusCode >= 400 && statusCode < 500) return '4xx';
        if (statusCode >= 500) return '5xx';
        return 'other';
    }
}

module.exports = new MetricsServiceLambda();