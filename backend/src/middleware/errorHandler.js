const errorHandler = (err, req, res, next) => {
    // Log detallado del error
    console.error('=== Error Handler ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('==================');
    
    // Determinar el tipo de error
    const statusCode = err.status || 500;
    const message = err.message || 'Error interno del servidor';
    
    // Enviar respuesta de error
    res.status(statusCode).json({
        message,
        path: req.path,
        timestamp: new Date().toISOString(),
        // Solo incluir stack trace en desarrollo
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
