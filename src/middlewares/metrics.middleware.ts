import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Capturar información de la ruta original
    const originalUrl = req.originalUrl || req.url;
    const metodo = req.method;

    // Hook para cuando la respuesta termine
    res.on('finish', async () => {
        const duracion = Date.now() - start;
        const statusCode = res.statusCode;
        
        // Obtener la ruta limpia (sin query params)
        const ruta = originalUrl.split('?')[0];

        console.log(`[REQUEST] ${metodo} ${ruta} - ${statusCode} - ${duracion}ms`);

        try {
            // Registrar métrica HTTPs
            await metricsService.registrarMetricaHTTP(metodo, ruta, statusCode);
            
            // Registrar tiempo de ejecución (ruta, duracion, metodo)
            await metricsService.registrarTiempoEjecucion(ruta, duracion, metodo);
            
            // Si es un error 4xx o 5xx, registrar también como error
            if (statusCode >= 400) {
                const errorType = statusCode >= 500 ? 'ServerError' : 'ClientError';
                await metricsService.registrarError(ruta, errorType, metodo);
            }
            
        } catch (error) {
            console.error('[METRICS] Error al enviar métricas:', error);
            // No lanzamos el error para no afectar la respuesta al cliente
        }
    });

    next();
};