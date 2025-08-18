-- Agregar columna margen_ganancia a la tabla proveedores
-- Esta columna almacenará el margen de ganancia por defecto para cada proveedor
ALTER TABLE public.proveedores 
ADD COLUMN margen_ganancia NUMERIC DEFAULT 0.30;

-- Comentario de la columna para documentación
COMMENT ON COLUMN public.proveedores.margen_ganancia IS 'Margen de ganancia por defecto del proveedor (ej: 0.30 = 30%)';

-- Opcional: Actualizar proveedores existentes con un margen por defecto
UPDATE public.proveedores 
SET margen_ganancia = 0.30 
WHERE margen_ganancia IS NULL;

-- Opcional: Agregar constraint para validar que el margen esté entre 0% y 1000%
ALTER TABLE public.proveedores 
ADD CONSTRAINT chk_margen_ganancia_range 
CHECK (margen_ganancia >= 0 AND margen_ganancia <= 10);