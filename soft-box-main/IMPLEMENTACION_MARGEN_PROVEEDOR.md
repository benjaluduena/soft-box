# Implementación de Margen de Ganancia por Proveedor

## Resumen
Se ha implementado un sistema de márgenes de ganancia por proveedor que permite establecer un margen por defecto para cada proveedor y aplicarlo automáticamente a los productos.

## Pasos de Implementación

### 1. Modificación en Supabase
Ejecutar el archivo `migracion_margen_proveedor.sql` en Supabase para agregar la columna `margen_ganancia` a la tabla `proveedores`.

```sql
-- Agregar columna margen_ganancia a la tabla proveedores
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
```

### 2. Lógica de Cálculo de Precios

El sistema utiliza la siguiente jerarquía para determinar el margen:

1. **Prioridad 1**: Si el producto tiene un margen individual configurado → usar margen del producto
2. **Prioridad 2**: Si el producto no tiene margen individual → usar margen del proveedor 
3. **Prioridad 3**: Si no existe margen del proveedor → usar margen por defecto (30%)

### 3. Cambios en los Módulos

#### Módulo Proveedores (`Proveedores.js`)
- ✅ Agregado campo "Margen de Ganancia (%)" en el formulario
- ✅ Visualización del margen en las tarjetas de proveedores
- ✅ Validación y almacenamiento del margen en la base de datos

#### Módulo Inventario (`Inventario.js`)
- ✅ Actualizada función `calcularPrecioVenta` para considerar margen del proveedor
- ✅ Consulta modificada para incluir `margen_ganancia` del proveedor
- ✅ Indicadores visuales que muestran si se usa margen del producto o del proveedor

#### Módulo Compras (`Compras.js`)
- ✅ Consulta de proveedores incluye `margen_ganancia`
- ✅ Select de proveedores muestra el margen en el texto
- ✅ Panel de proveedores principales muestra el margen como etiqueta

### 4. Funcionalidades Implementadas

#### En el Módulo de Proveedores:
- Campo numérico para ingresar el margen (en porcentaje)
- Validación de rangos (0% - 1000%)
- Valor por defecto: 30%
- Visualización del margen en formato porcentual

#### En el Módulo de Inventario:
- Cálculo automático de precios usando la jerarquía de márgenes
- Etiquetas visuales que indican:
  - "Margen: X%" cuando usa margen del proveedor
  - "Margen custom: X%" cuando usa margen específico del producto

#### En el Módulo de Compras:
- Información del margen del proveedor visible en la selección
- Integración con el sistema de cálculo de precios

### 5. Casos de Uso

#### Caso 1: Producto sin margen individual
```
Producto: Neumático Michelin
Costo: $100
Proveedor: Distribuidora ABC (margen 40%)
Precio Final: $100 × (1 + 0.40) = $140
```

#### Caso 2: Producto con margen individual
```
Producto: Aceite Castrol (margen custom 25%)
Costo: $50
Proveedor: Distribuidora ABC (margen 40%) ← Se ignora
Precio Final: $50 × (1 + 0.25) = $62.50
```

#### Caso 3: Proveedor sin margen configurado
```
Producto: Filtro de aire
Costo: $30
Proveedor: Proveedor Sin Margen
Precio Final: $30 × (1 + 0.30) = $39 (usa margen por defecto 30%)
```

### 6. Instrucciones para el Usuario

1. **Configurar Margen por Proveedor:**
   - Ir al módulo "Proveedores"
   - Crear nuevo proveedor o editar existente
   - Ingresar el margen deseado en el campo "Margen de Ganancia (%)"
   - Ejemplo: ingresar "35" para un margen del 35%

2. **Verificar Precios en Inventario:**
   - Los productos mostrarán automáticamente el precio calculado
   - Si usa margen del proveedor: etiqueta verde "Margen: X%"
   - Si usa margen del producto: etiqueta azul "Margen custom: X%"

3. **En Compras:**
   - Al seleccionar proveedor se mostrará su margen en el dropdown
   - Los precios se calcularán automáticamente según la jerarquía establecida

### 7. Ventajas del Sistema

- **Flexibilidad**: Permite márgenes específicos por producto o por proveedor
- **Automatización**: Cálculo automático de precios sin intervención manual
- **Transparencia**: Indicadores visuales claros sobre qué margen se está aplicando
- **Escalabilidad**: Fácil configuración para nuevos proveedores
- **Compatibilidad**: Mantiene funcionamiento de márgenes individuales existentes